import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parsePdfFromStorage } from "@/lib/pdf/parse";
import { chunkText } from "@/features/embed/chunk";
import { embedTextsBatch } from "@/lib/openai/embed";
import { checkRateLimit } from "@/lib/rate-limit";
import { isValidUUID } from "@/lib/validation";
import { logger } from "@/lib/logger";

export const maxDuration = 300;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await context.params;
    if (!isValidUUID(documentId)) {
      return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(user.id, "process");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many process requests. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetInSeconds) } }
      );
    }

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, storage_path, user_id, status")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    if (doc.status === "processing") {
      return NextResponse.json(
        { error: "Document is already being processed." },
        { status: 409 }
      );
    }

    const updateProgress = async (progress: number, extra?: Record<string, unknown>) => {
      await supabase
        .from("documents")
        .update({
          processing_progress: progress,
          updated_at: new Date().toISOString(),
          ...extra,
        })
        .eq("id", documentId);
    };

    await updateProgress(0, { status: "processing" });

    let pageCount: number | null = null;
    let chunksInserted = 0;

    try {
      // Phase 1: Extract text (0% → 25%)
      logger.info("Processing document: extracting text", { documentId });
      const { text, pageCount: parsedPageCount, pages } = await parsePdfFromStorage(
        doc.storage_path
      );
      pageCount = parsedPageCount;

      await updateProgress(25);

      if (!text || text.length < 10) {
        await updateProgress(0, {
          status: "error",
          page_count: pageCount,
        });
        return NextResponse.json(
          { error: "Could not extract text from PDF. The file may be image-based or empty." },
          { status: 400 }
        );
      }

      // Phase 2: Chunk text (25% → 40%)
      logger.info("Processing document: chunking", { documentId, textLength: text.length });
      const chunks = chunkText(text, pages);
      const totalCharsIndexed = text.length;

      await updateProgress(40);

      // Phase 3: Generate embeddings (40% → 90%)
      logger.info("Processing document: embedding", { documentId, chunks: chunks.length });
      const embeddings = await embedTextsBatch(
        chunks.map((c) => c.content),
        async (completed, total) => {
          const embeddingProgress = 40 + Math.round((completed / total) * 50);
          await updateProgress(embeddingProgress);
        }
      );

      // Phase 4: Store chunks (90% → 100%)
      logger.info("Processing document: storing chunks", { documentId });
      await supabase.from("document_chunks").delete().eq("document_id", documentId);

      if (chunks.length > 0) {
        const rows = chunks.map((chunk, i) => ({
          document_id: documentId,
          content: chunk.content,
          chunk_index: chunk.chunkIndex,
          metadata: chunk.metadata,
          embedding: embeddings[i] ?? null,
        }));

        const { error: insertError } = await supabase
          .from("document_chunks")
          .insert(rows);

        if (insertError) throw insertError;
        chunksInserted = chunks.length;
      }

      await updateProgress(100, {
        status: "ready",
        page_count: pageCount,
        chunk_count: chunksInserted,
        extracted_char_count: totalCharsIndexed,
      });

      logger.info("Document processed successfully", {
        documentId,
        chunksInserted,
        pageCount,
      });

      return NextResponse.json({ chunksInserted, pageCount });
    } catch (parseError) {
      logger.error("Process error", parseError, { documentId });
      await updateProgress(0, {
        status: "error",
        page_count: pageCount,
      });

      return NextResponse.json(
        { error: "Failed to process document." },
        { status: 500 }
      );
    }
  } catch (err) {
    logger.error("Process route error", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
