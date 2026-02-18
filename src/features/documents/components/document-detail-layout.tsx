"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/20">
      <header
        className={cn(
          "flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 shadow-sm sm:px-6 sm:py-4",
          isSummarizing && "pointer-events-none select-none opacity-60"
        )}
        aria-busy={isSummarizing}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Link href="/dashboard/documents" prefetch={false}>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-lg transition-colors"
              aria-label="Back to documents"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <DocumentFilenameEditor documentId={doc.id} filename={doc.filename} />
          </div>
        </div>
        <DocumentActions
          documentId={doc.id}
          status={doc.status}
          disabled={doc.status === "processing"}
        />
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
        <div
          className={cn(
            "relative hidden min-h-0 flex-col overflow-hidden lg:flex",
            isSummarizing && "pointer-events-none select-none opacity-60"
          )}
          aria-busy={isSummarizing}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-border bg-background px-4 py-2.5 lg:border-r">
            <FileText className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              PDF Preview
            </span>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/30 p-3">
            <div className="size-full overflow-hidden rounded-lg border border-border bg-background shadow-sm">
              <ErrorBoundary
                fallbackTitle="PDF viewer error"
                fallbackDescription="Failed to load the PDF viewer."
              >
                <DocumentPdfViewer documentId={doc.id} filename={doc.filename} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
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
