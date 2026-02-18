import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DocumentLibrary } from "@/features/documents";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id, filename, file_size, status, chunk_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:gap-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Documents
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base leading-relaxed">
          Upload, manage, and chat with your PDF documents.
        </p>
      </header>

      <DocumentLibrary documents={documents ?? []} />
    </div>
  );
}
