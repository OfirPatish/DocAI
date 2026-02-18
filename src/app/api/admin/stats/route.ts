import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";
import { logger } from "@/lib/logger";
import type { DocumentStatus } from "@/lib/supabase/database.types";

const STATUSES: DocumentStatus[] = ["pending", "processing", "ready", "error"];

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = getAdminSupabase();

    const [
      totalDocsResult,
      ...statusResults
    ] = await Promise.all([
      supabase.from("documents").select("*", { count: "exact", head: true }),
      ...STATUSES.map((s) =>
        supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", s)
      ),
    ]);

    const [summariesResult, usageResult] = await Promise.all([
      supabase.from("summaries").select("*", { count: "exact", head: true }),
      supabase.from("ai_usage_log").select("total_tokens"),
    ]);

    const totalDocuments = totalDocsResult.count ?? 0;

    const documentsByStatus: Record<DocumentStatus, number> = {
      pending: 0,
      processing: 0,
      ready: 0,
      error: 0,
    };
    STATUSES.forEach((status, i) => {
      documentsByStatus[status] = statusResults[i]?.count ?? 0;
    });

    const totalTokens = (usageResult.data ?? []).reduce(
      (sum, row) => sum + (row.total_tokens ?? 0),
      0
    );

    const totalSummaries = summariesResult.count ?? 0;

    return NextResponse.json({
      totalDocuments,
      documentsByStatus,
      totalTokens,
      totalSummaries,
    });
  } catch (err) {
    logger.error("Admin stats error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
