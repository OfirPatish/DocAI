import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const PDF_MIME = "application/pdf";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const computeContentHash = async (buffer: ArrayBuffer): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

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

    const rateLimit = await checkRateLimit(user.id, "upload");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait before uploading more." },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetInSeconds) } }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Upload a PDF file." },
        { status: 400 }
      );
    }

    if (file.type !== PDF_MIME) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const contentHash = await computeContentHash(fileBuffer);

    const { data: hashDuplicate } = await supabase
      .from("documents")
      .select("id, filename, storage_path")
      .eq("user_id", user.id)
      .eq("content_hash", contentHash)
      .maybeSingle();

    if (hashDuplicate) {
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
      .eq("filename", file.name)
      .eq("file_size", file.size)
      .maybeSingle();

    if (nameDuplicate) {
      const admin = createAdminClient();
      await admin.storage.from("documents").remove([nameDuplicate.storage_path]);
      await supabase.from("documents").delete().eq("id", nameDuplicate.id);
    }

    const docId = crypto.randomUUID();
    const storagePath = `${user.id}/${docId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, fileBuffer, {
        contentType: PDF_MIME,
        upsert: false,
      });

    if (uploadError) {
      logger.error("Storage upload error", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file. Please try again." },
        { status: 500 }
      );
    }

    const { data: doc, error: insertError } = await supabase
      .from("documents")
      .insert({
        id: docId,
        user_id: user.id,
        filename: file.name,
        storage_path: storagePath,
        file_size: file.size,
        content_hash: contentHash,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Documents insert error", insertError);
      await supabase.storage.from("documents").remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to save document record. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ document: doc });
  } catch (err) {
    logger.error("Upload error", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
