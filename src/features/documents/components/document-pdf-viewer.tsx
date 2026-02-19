"use client";

import { useEffect, useState } from "react";
import { Download, FileQuestion } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

interface DocumentPdfViewerProps {
  documentId: string;
  filename: string;
}

export const DocumentPdfViewer = ({
  documentId,
  filename,
}: DocumentPdfViewerProps) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/documents/${documentId}/view`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data: { url?: string; error?: string }) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setPdfUrl(data.url ?? null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Failed to load PDF");
      });
    return () => ac.abort();
  }, [documentId]);

  if (error) {
    return (
      <div
        className="flex size-full min-h-[180px] flex-col items-center justify-center gap-4 rounded-xl bg-muted/20 p-8 text-center"
        role="alert"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
          <FileQuestion className="size-7 text-destructive" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Failed to load PDF</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <Skeleton
        className="size-full min-h-0 flex-1 rounded-lg"
        aria-busy="true"
        aria-label="Loading PDF"
      />
    );
  }

  if (!isDesktop) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-5 rounded-xl bg-muted/20 p-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/5 ring-1 ring-primary/10">
          <FileQuestion className="size-8 text-primary/70" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">PDF preview</p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
            Available on desktop. Download to view on this device.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 rounded-lg">
          <a
            href={pdfUrl}
            download={filename}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download ${filename}`}
          >
            <Download className="size-4" aria-hidden />
            Download PDF
          </a>
        </Button>
      </div>
    );
  }

  return (
    <iframe
      src={`${pdfUrl}#view=FitH`}
      title={filename}
      className="size-full min-h-0 border-0 bg-white"
      aria-label={`PDF: ${filename}`}
    />
  );
};
