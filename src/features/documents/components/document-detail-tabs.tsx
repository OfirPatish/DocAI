"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useUpload } from "@/providers/upload-provider";
import { FileText, Loader2, MessageSquare } from "lucide-react";
import { DocumentSummary } from "./document-summary";
import { DocumentChat } from "./document-chat";
import { SUMMARY_TYPES, type SummaryTypeId } from "@/lib/summarize/prompts";
import { toast } from "sonner";

interface DocumentDetailTabsProps {
  documentId: string;
  initialSummary: string | null;
  initialSummaryType?: string;
  canSummarize: boolean;
  disabled?: boolean;
}

export const DocumentDetailTabs = ({
  documentId,
  initialSummary,
  initialSummaryType = "summary",
  canSummarize,
  disabled = false,
}: DocumentDetailTabsProps) => {
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [summaryType, setSummaryType] = useState<SummaryTypeId>(
    (SUMMARY_TYPES.some((t) => t.id === initialSummaryType)
      ? initialSummaryType
      : "summary") as SummaryTypeId
  );
  const [activeTab, setActiveTab] = useState<"summary" | "chat">("summary");
  const { isSummarizing: isSummarizingFromProvider, setSummarizing } = useUpload();
  const autoSummarizedRef = useRef(false);

  const handleSummarize = (typeId: SummaryTypeId, regenerate: boolean) => {
    if (!canSummarize || isSummarizingFromProvider) return;
    setSummarizing(true);
    setSummaryType(typeId);

    fetch(`/api/documents/${documentId}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: typeId, regenerate }),
    })
      .then((res) => {
        if (res.status === 429) {
          return res.json().then((d) => ({ error: d.error ?? "Too many requests. Please wait." }));
        }
        return res.json();
      })
      .then((data: { summary?: string; error?: string }) => {
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setSummary(data.summary ?? null);
      })
      .catch(() => toast.error("Failed to summarize"))
      .finally(() => {
        setSummarizing(false);
      });
  };

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  useEffect(() => {
    if (
      canSummarize &&
      !initialSummary &&
      !autoSummarizedRef.current
    ) {
      autoSummarizedRef.current = true;
      handleSummarize("summary", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSummarize, initialSummary]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as "summary" | "chat")}
      className="relative flex size-full min-h-0 flex-col"
    >
      {/* Overlay blocks all interaction during summary — use provider state so it survives remounts (e.g. Strict Mode) */}
      {isSummarizingFromProvider && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-md"
          aria-busy="true"
          aria-live="polite"
          role="status"
          aria-label="Generating summary"
        >
          <Card className="w-full max-w-sm border-primary/20 shadow-lg shadow-primary/5">
            <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8">
              <div className="relative flex size-14 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" aria-hidden />
                <div className="flex size-14 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5">
                  <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
                </div>
              </div>
              <div className="text-center space-y-1.5">
                <p className="font-semibold text-foreground tracking-tight">
                  Generating summary
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Reading your document and creating a summary. This may take a moment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="flex min-h-11 shrink-0 items-center border-b border-border px-4 pt-3 pb-0">
        <TabsList variant="line" className="h-auto min-h-9 w-auto gap-0 p-0">
          <TabsTrigger
            value="summary"
            className="gap-2 pb-3 text-sm font-medium"
            disabled={isSummarizingFromProvider}
          >
            <FileText className="size-4 shrink-0" aria-hidden />
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="gap-2 pb-3 text-sm font-medium"
            disabled={isSummarizingFromProvider}
          >
            <MessageSquare className="size-4 shrink-0" aria-hidden />
            AI Chat
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="summary" className="flex-1 min-h-0 overflow-hidden p-4">
        <ScrollArea className="h-full pr-3">
          <DocumentSummary
            initialSummary={summary}
            canSummarize={canSummarize}
            summaryType={summaryType}
            isSummarizing={isSummarizingFromProvider}
            onSummarize={handleSummarize}
          />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="chat" className="flex-1 min-h-0 overflow-hidden p-4">
        <DocumentChat documentId={documentId} disabled={disabled} />
      </TabsContent>
    </Tabs>
  );
};
