import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";
import {
  AdminStatsCards,
  AdminDocumentsTable,
  AdminUsageTable,
  AdminRecentActivity,
  AdminModelBreakdown,
} from "@/features/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Cpu } from "lucide-react";
import type {
  AdminOverviewStats,
  AdminDocument,
  AdminAiUsage,
  AdminSummaryRow,
  ModelBreakdown,
} from "@/features/admin/types";
import type { DocumentStatus } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Admin | DocAI" };

const fetchAdminData = async (): Promise<{
  stats: AdminOverviewStats;
  documents: AdminDocument[];
  usage: AdminAiUsage[];
}> => {
  const supabase = getAdminSupabase();

  const [docsResult, usageResult, summariesResult] = await Promise.all([
    supabase
      .from("documents")
      .select(
        "id, user_id, filename, storage_path, file_size, page_count, chunk_count, extracted_char_count, status, processing_progress, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("ai_usage_log")
      .select(
        "id, user_id, endpoint, model, prompt_tokens, completion_tokens, total_tokens, document_id, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("summaries")
      .select("id, document_id, summary_type, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const documents = (docsResult.data ?? []) as AdminDocument[];
  const usage = (usageResult.data ?? []) as AdminAiUsage[];
  const summaries = (summariesResult.data ?? []) as AdminSummaryRow[];

  const documentsByStatus: Record<DocumentStatus, number> = {
    pending: 0,
    processing: 0,
    ready: 0,
    error: 0,
  };

  const userIds = new Set<string>();
  let totalStorageBytes = 0;
  let totalPages = 0;
  let totalChunks = 0;

  for (const doc of documents) {
    if (doc.status in documentsByStatus) {
      documentsByStatus[doc.status]++;
    }
    userIds.add(doc.user_id);
    totalStorageBytes += doc.file_size ?? 0;
    totalPages += doc.page_count ?? 0;
    totalChunks += doc.chunk_count ?? 0;
  }

  const modelMap = new Map<string, ModelBreakdown>();
  let totalTokens = 0;

  for (const row of usage) {
    totalTokens += row.total_tokens ?? 0;
    const existing = modelMap.get(row.model);
    if (existing) {
      existing.totalTokens += row.total_tokens ?? 0;
      existing.promptTokens += row.prompt_tokens ?? 0;
      existing.completionTokens += row.completion_tokens ?? 0;
      existing.requestCount += 1;
    } else {
      modelMap.set(row.model, {
        model: row.model,
        totalTokens: row.total_tokens ?? 0,
        promptTokens: row.prompt_tokens ?? 0,
        completionTokens: row.completion_tokens ?? 0,
        requestCount: 1,
      });
    }
  }

  const modelBreakdown = Array.from(modelMap.values()).sort(
    (a, b) => b.totalTokens - a.totalTokens
  );

  const summariesByType: Record<string, number> = {};
  for (const s of summaries) {
    const type = s.summary_type ?? "summary";
    summariesByType[type] = (summariesByType[type] ?? 0) + 1;
  }

  const stats: AdminOverviewStats = {
    totalDocuments: documents.length,
    documentsByStatus,
    totalTokens,
    totalSummaries: summaries.length,
    uniqueUsers: userIds.size,
    totalStorageBytes,
    totalPages,
    totalChunks,
    modelBreakdown,
    summariesByType,
  };

  return { stats, documents, usage };
};

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard/documents");

  const { stats, documents, usage } = await fetchAdminData();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          System-wide overview of documents, AI usage, and platform health.
        </p>
      </header>

      <AdminStatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminRecentActivity documents={documents.slice(0, 6)} />
        <AdminModelBreakdown
          modelBreakdown={stats.modelBreakdown}
          summariesByType={stats.summariesByType}
        />
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="size-4" aria-hidden />
            Documents ({stats.totalDocuments})
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <Cpu className="size-4" aria-hidden />
            AI Usage ({usage.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <AdminDocumentsTable documents={documents} />
        </TabsContent>
        <TabsContent value="usage">
          <AdminUsageTable usage={usage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
