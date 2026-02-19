/**
 * POST /api/documents/confirm-upload
 * Creates the document record after client has uploaded directly to Supabase Storage.
 * Request body is metadata only — no file bytes (avoids Vercel's 4.5MB limit).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const docId = typeof body?.docId === "string" ? body.docId.trim() : "";
    const filename = typeof body?.filename === "string" ? body.filename.trim() : "";
    const fileSize = typeof body?.fileSize === "number" ? body.fileSize : 0;
    const contentHash = typeof body?.contentHash === "string" ? body.contentHash.trim() : "";

    if (!docId || !filename || !contentHash) {
      return NextResponse.json(
        { error: "Missing required fields: docId, filename, contentHash." },
        { status: 400 }
      );
    }

    const storagePath = `${user.id}/${docId}.pdf`;

    // Verify the file exists in storage (client uploaded it)
    const { data: files, error: listError } = await supabase.storage
      .from("documents")
      .list(user.id);

    const fileExists = files?.some((f) => f.name === `${docId}.pdf`);
    if (listError || !fileExists) {
      logger.error("Confirm upload: file not found in storage", { storagePath, listError });
      return NextResponse.json(
        { error: "File not found. Upload may have failed. Please try again." },
        { status: 400 }
      );
    }

    const { data: hashDuplicate } = await supabase
      .from("documents")
      .select("id, filename, storage_path")
      .eq("user_id", user.id)
      .eq("content_hash", contentHash)
      .maybeSingle();

    if (hashDuplicate) {
      const admin = createAdminClient();
      await admin.storage.from("documents").remove([storagePath]);
      return NextResponse.json(
        {
          error: `This file already exists as "${hashDuplicate.filename}". Delete it first if you want to replace it.`,
        },
        { status: 409 }
      );
    }

    const { data: nameDuplicate } = await supabase
      .from("documents")
      .select("id, storage_path")
      .eq("user_id", user.id)
      .eq("filename", filename)
      .eq("file_size", fileSize)
      .maybeSingle();

    if (nameDuplicate) {
      const admin = createAdminClient();
      await admin.storage.from("documents").remove([nameDuplicate.storage_path]);
      await supabase.from("documents").delete().eq("id", nameDuplicate.id);
    }

    const { data: doc, error: insertError } = await supabase
      .from("documents")
      .insert({
        id: docId,
        user_id: user.id,
        filename,
        storage_path: storagePath,
        file_size: fileSize,
        content_hash: contentHash,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Documents insert error", insertError);
      const admin = createAdminClient();
      await admin.storage.from("documents").remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to save document record. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ document: doc });
  } catch (err) {
    logger.error("Confirm upload error", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
