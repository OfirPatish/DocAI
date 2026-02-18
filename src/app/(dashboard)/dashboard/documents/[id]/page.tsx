import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { DocumentDetailLayout } from "@/features/documents/components/document-detail-layout";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DocumentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { title: "Document" };
  const { data: doc } = await supabase
    .from("documents")
    .select("filename")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  return { title: doc?.filename ?? "Document" };
}

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!doc) {
    notFound();
  }

  let cachedSummary: string | null = null;
  let cachedSummaryType: string = "summary";
  if (doc.status === "ready" && (doc.chunk_count ?? 0) > 0) {
    const admin = createAdminClient();
    const { data: latest } = await admin
      .from("summaries")
      .select("summary_text, summary_type")
      .eq("document_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.summary_text) {
      cachedSummary = latest.summary_text;
      cachedSummaryType = latest.summary_type ?? "summary";
    }
  }

  const isReady = doc.status === "ready" && (doc.chunk_count ?? 0) > 0;

  return (
    <DocumentDetailLayout
      doc={doc}
      cachedSummary={cachedSummary}
      cachedSummaryType={cachedSummaryType}
      isReady={isReady}
    />
  );
}
