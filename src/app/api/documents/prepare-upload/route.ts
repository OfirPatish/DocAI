/**
 * POST /api/documents/prepare-upload
 * Returns docId and storagePath for client-side direct upload to Supabase Storage.
 * Bypasses Vercel's 4.5MB request body limit — the file never goes through the API.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

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

    const body = await request.json();
    const filename = typeof body?.filename === "string" ? body.filename.trim() : "";
    const fileSize = typeof body?.fileSize === "number" ? body.fileSize : 0;

    if (!filename || !filename.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Invalid filename. Must be a PDF file." },
        { status: 400 }
      );
    }

    if (fileSize <= 0 || fileSize > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const docId = crypto.randomUUID();
    const storagePath = `${user.id}/${docId}.pdf`;

    return NextResponse.json({ docId, storagePath });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
