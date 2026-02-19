"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpload } from "@/providers/upload-provider";
import { DocumentActions } from "./document-actions";
import { DocumentPdfViewer } from "./document-pdf-viewer";
import { DocumentDetailTabs } from "./document-detail-tabs";
import { DocumentFilenameEditor } from "./document-filename-editor";
import { ErrorBoundary } from "@/components/error-boundary";

interface DocumentDetailLayoutProps {
  doc: {
    id: string;
    filename: string;
    status: string;
    chunk_count: number | null;
  };
  cachedSummary: string | null;
  cachedSummaryType: string;
  isReady: boolean;
}

export const DocumentDetailLayout = ({
  doc,
  cachedSummary,
  cachedSummaryType,
  isReady,
}: DocumentDetailLayoutProps) => {
  const { isSummarizing } = useUpload();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header
        className={cn(
          "flex shrink-0 flex-nowrap items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 sm:gap-3 sm:px-5 sm:py-3.5",
          isSummarizing && "pointer-events-none select-none opacity-60"
        )}
        aria-busy={isSummarizing}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link href="/dashboard/documents" prefetch={false} className="shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-lg"
              aria-label="Back to documents"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
            </Button>
          </Link>
          <div className="min-w-0 flex-1 overflow-hidden">
            <DocumentFilenameEditor documentId={doc.id} filename={doc.filename} />
          </div>
        </div>
        <div className="shrink-0">
          <DocumentActions
            documentId={doc.id}
            status={doc.status}
            disabled={doc.status === "processing"}
          />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[2fr_3fr]">
        <div
          className={cn(
            "relative hidden min-h-0 flex-1 overflow-hidden border-border lg:block lg:border-r",
            isSummarizing && "pointer-events-none select-none opacity-60"
          )}
          aria-busy={isSummarizing}
        >
          <ErrorBoundary
            fallbackTitle="PDF viewer error"
            fallbackDescription="Failed to load the PDF viewer."
          >
            <DocumentPdfViewer documentId={doc.id} filename={doc.filename} />
          </ErrorBoundary>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <ErrorBoundary
            fallbackTitle="Content error"
            fallbackDescription="Failed to load document content."
          >
            <DocumentDetailTabs
              documentId={doc.id}
              initialSummary={cachedSummary}
              initialSummaryType={cachedSummaryType}
              canSummarize={isReady}
              disabled={!isReady}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
