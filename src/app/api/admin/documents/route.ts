import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("documents")
      .select(
        "id, user_id, filename, storage_path, file_size, page_count, chunk_count, extracted_char_count, status, processing_progress, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      logger.error("Admin documents query error", error);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    logger.error("Admin documents error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
