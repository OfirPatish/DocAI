import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOpenAIClient } from "@/lib/openai/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { trackAiUsage } from "@/lib/ai-usage";
import { isValidUUID } from "@/lib/validation";
import { logger } from "@/lib/logger";
import {
  getSummarySystemPrompt,
  getSummaryUserPrompt,
  type SummaryTypeId,
  SUMMARY_TYPES,
} from "@/lib/summarize/prompts";

const MAX_CONTEXT_CHARS = 400_000;
const VALID_TYPE_IDS = new Set(SUMMARY_TYPES.map((t) => t.id));

const PREMIUM_SUMMARY_TYPES: Set<string> = new Set(["legal", "meeting", "chapters", "core"]);

const getModelForType = (typeId: SummaryTypeId): string => {
  if (PREMIUM_SUMMARY_TYPES.has(typeId)) {
    return process.env.DOCAI_PREMIUM_MODEL ?? "gpt-4o";
  }
  return "gpt-4o-mini";
};

/**
 * POST /api/documents/[id]/summarize
 * Returns a summary of the document. Uses cached summary if available.
 * Uses a premium model for complex summary types (legal, meeting, chapters, core).
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await context.params;
    if (!isValidUUID(documentId)) {
      return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
    }

    let regenerate = false;
    let typeId: SummaryTypeId = "summary";
    try {
      const body = await request.json().catch(() => ({}));
      regenerate = body?.regenerate === true;
      if (typeof body?.type === "string" && VALID_TYPE_IDS.has(body.type as SummaryTypeId)) {
        typeId = body.type as SummaryTypeId;
      }
    } catch {
      // defaults
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(user.id, "summarize");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many summaries. Please wait before requesting more." },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetInSeconds) } }
      );
    }

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, user_id, status, chunk_count")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.status !== "ready" || (doc.chunk_count ?? 0) === 0) {
      return NextResponse.json(
        { error: "Document must be processed before summarization" },
        { status: 400 }
      );
    }

    if (!regenerate) {
      const adminForCache = createAdminClient();
      const { data: cached } = await adminForCache
        .from("summaries")
        .select("summary_text")
        .eq("document_id", documentId)
        .eq("summary_type", typeId)
        .maybeSingle();

      if (cached?.summary_text) {
        return NextResponse.json({
          summary: cached.summary_text,
          cached: true,
          type: typeId,
        });
      }
    }

    const { data: chunks, error: chunksError } = await supabase
      .from("document_chunks")
      .select("content, chunk_index")
      .eq("document_id", documentId)
      .order("chunk_index", { ascending: true });

    if (chunksError || !chunks?.length) {
      return NextResponse.json(
        { error: "No content found. Re-index the document." },
        { status: 400 }
      );
    }

    let fullText = chunks.map((c) => c.content).join("\n\n");
    const isTruncated = fullText.length > MAX_CONTEXT_CHARS;
    if (isTruncated) {
      fullText =
        fullText.slice(0, MAX_CONTEXT_CHARS) +
        "\n\n[... document truncated for length ...]";
    }

    const model = getModelForType(typeId);
    const systemPrompt = getSummarySystemPrompt(typeId);
    const userInstruction = getSummaryUserPrompt(typeId, isTruncated);

    logger.info("Generating summary", { documentId, typeId, model });

    const openai = createOpenAIClient();
    const { choices, usage } = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `### Document to Summarize\n\n${userInstruction}\n\n${fullText}`,
        },
      ],
      temperature: 0.3,
    });

    const summaryText = choices[0]?.message?.content?.trim();
    if (!summaryText) {
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 }
      );
    }

    trackAiUsage({
      userId: user.id,
      endpoint: "summarize",
      model,
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
      documentId,
    });

    const admin = createAdminClient();
    const { error: upsertError } = await admin
      .from("summaries")
      .upsert(
        {
          document_id: documentId,
          summary_text: summaryText,
          summary_type: typeId,
        },
        { onConflict: "document_id,summary_type" }
      );

    if (upsertError) {
      logger.error("Summary upsert failed", upsertError, { documentId, typeId });
    }

    return NextResponse.json({
      summary: summaryText,
      cached: false,
      type: typeId,
    });
  } catch (err) {
    logger.error("Summarize error", err);
    return NextResponse.json(
      { error: "Failed to summarize" },
      { status: 500 }
    );
  }
}
