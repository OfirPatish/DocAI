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
    <div className="flex w-full flex-col">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Documents
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload, manage, and chat with your PDF documents.
        </p>
      </header>

      <DocumentLibrary documents={documents ?? []} />
    </div>
  );
}
