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
      .from("ai_usage_log")
      .select(
        "id, user_id, endpoint, model, prompt_tokens, completion_tokens, total_tokens, document_id, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      logger.error("Admin usage query error", error);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    logger.error("Admin usage error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
