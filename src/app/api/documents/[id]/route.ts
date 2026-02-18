import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { z } from "zod";

const updateBodySchema = z.object({
  filename: z.string().min(1).max(255).regex(/^[^/\\]+\.pdf$/i, "Filename must end with .pdf"),
});

/**
 * PATCH /api/documents/[id]
 * Update document metadata (e.g. filename).
 */
export async function PATCH(
  request: Request,
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

    const body = await request.json().catch(() => ({}));
    const parsed = updateBodySchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues?.[0];
      const message = (firstIssue && "message" in firstIssue ? firstIssue.message : null) ?? "Invalid filename";
      return NextResponse.json(
        { error: typeof message === "string" ? message : "Invalid filename" },
        { status: 400 }
      );
    }
    const { filename } = parsed.data;

    const { error: updateError } = await supabase
      .from("documents")
      .update({ filename, updated_at: new Date().toISOString() })
      .eq("id", documentId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
    return NextResponse.json({ success: true, filename });
  } catch (err) {
    logger.error("Patch document error", err);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Removes document, chunks, summaries (cascade), and storage file.
 */
export async function DELETE(
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

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, user_id, storage_path")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (deleteError) {
      logger.error("Document DB delete failed", deleteError, { documentId });
      return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
    }

    const admin = createAdminClient();
    const { error: storageError } = await admin.storage
      .from("documents")
      .remove([doc.storage_path]);

    if (storageError) {
      logger.error("Storage cleanup failed (document already deleted)", storageError, { documentId });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Delete document error", err);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
