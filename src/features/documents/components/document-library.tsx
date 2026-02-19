"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, ArrowDownNarrowWide, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpload } from "@/providers/upload-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentCard } from "./document-card";
import { DocumentUpload } from "./document-upload";

type SortKey = "newest" | "oldest" | "name" | "status";

interface Document {
  id: string;
  filename: string;
  file_size: number | null;
  status: string;
  chunk_count: number | null;
  created_at?: string;
}

interface DocumentLibraryProps {
  documents: Document[];
}

export const DocumentLibrary = ({ documents }: DocumentLibraryProps) => {
  const [localDocuments, setLocalDocuments] = useState(documents);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const { isUploading, setUploading } = useUpload();

  useEffect(() => {
    setLocalDocuments(documents);
  }, [documents]);

  const handleUploadingChange = useCallback(
    (uploading: boolean) => {
      setUploading(uploading);
    },
    [setUploading]
  );

  const handleDocumentDeleted = useCallback((docId: string) => {
    setLocalDocuments((prev) => prev.filter((d) => d.id !== docId));
  }, []);

  const filteredAndSorted = useMemo(() => {
    const filtered = search.trim()
      ? localDocuments.filter((d) =>
          d.filename.toLowerCase().includes(search.toLowerCase())
        )
      : localDocuments;

    const sorted = [...filtered].sort((a, b) => {
      const aDate = a.created_at ?? "";
      const bDate = b.created_at ?? "";
      switch (sort) {
        case "newest":
          return bDate.localeCompare(aDate);
        case "oldest":
          return aDate.localeCompare(bDate);
        case "name":
          return a.filename.localeCompare(b.filename);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    return sorted;
  }, [localDocuments, search, sort]);

  const sortLabels: Record<SortKey, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    name: "Name A-Z",
    status: "Status",
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <section aria-labelledby="upload-heading">
        <h2 id="upload-heading" className="sr-only">
          Upload document
        </h2>
        <DocumentUpload onUploadingChange={handleUploadingChange} />
      </section>

      <section
        aria-labelledby="documents-list-heading"
        aria-busy={isUploading}
        className={cn(
          "transition-opacity duration-200",
          isUploading && "pointer-events-none select-none opacity-60"
        )}
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <h2
              id="documents-list-heading"
              className="text-base font-semibold tracking-tight text-foreground sm:text-lg"
            >
              Your Documents
            </h2>
            {localDocuments.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {localDocuments.length}
              </span>
            )}
          </div>
          {localDocuments.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full rounded-lg pl-9 sm:w-64"
                  aria-label="Search documents"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 rounded-lg font-medium"
                    aria-label="Sort documents"
                  >
                    <ArrowDownNarrowWide
                      className="size-4 shrink-0"
                      aria-hidden
                    />
                    <span className="hidden sm:inline">
                      {sortLabels[sort]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setSort("newest")}>
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("oldest")}>
                    Oldest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("name")}>
                    Name A-Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("status")}>
                    By status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {!localDocuments.length ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-10 text-center sm:p-14">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/5 shadow-sm ring-1 ring-primary/10">
              <FolderOpen className="size-8 text-primary/60" aria-hidden />
            </div>
            <p className="font-semibold text-foreground">No documents yet</p>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Upload your first PDF above to start chatting and generating
              summaries.
            </p>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8">
            <Search
              className="mb-3 size-8 text-muted-foreground/60"
              aria-hidden
            />
            <p className="text-center text-sm font-medium text-foreground">
              No results found
            </p>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Try a different search term.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSorted.map((doc, index) => (
              <motion.li
                key={doc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index * 0.04, 0.2),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <DocumentCard
                  id={doc.id}
                  filename={doc.filename}
                  createdAt={doc.created_at}
                  onDeleted={handleDocumentDeleted}
                />
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
