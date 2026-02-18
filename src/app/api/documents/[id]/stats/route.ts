import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation";
import { logger } from "@/lib/logger";

/**
 * GET /api/documents/[id]/stats
 * Returns indexing stats (total chars, chunk count).
 * Uses extracted_char_count when present, else RPC for existing docs.
 */
export async function GET(
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: doc } = await supabase
      .from("documents")
      .select("id, user_id, chunk_count, extracted_char_count")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (doc.extracted_char_count != null) {
      return NextResponse.json({
        chunkCount: doc.chunk_count ?? 0,
        totalChars: doc.extracted_char_count,
      });
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_document_chunk_stats",
      { p_document_id: documentId, p_user_id: user.id }
    );

    if (rpcError || !rpcData?.[0]) {
      return NextResponse.json({
        chunkCount: doc.chunk_count ?? 0,
        totalChars: null,
      });
    }

    return NextResponse.json({
      chunkCount: Number(rpcData[0]?.chunk_count ?? 0),
      totalChars: Number(rpcData[0]?.total_chars ?? 0),
    });
  } catch (err) {
    logger.error("Stats error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
