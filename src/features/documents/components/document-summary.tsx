"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  ChevronDown,
  ClipboardCopy,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SUMMARY_TYPES, type SummaryTypeId } from "@/lib/summarize/prompts";

interface DocumentSummaryProps {
  initialSummary: string | null;
  canSummarize: boolean;
  summaryType: SummaryTypeId;
  isSummarizing: boolean;
  onSummarize: (typeId: SummaryTypeId, regenerate: boolean) => void;
}

export const DocumentSummary = ({
  initialSummary,
  canSummarize,
  summaryType,
  isSummarizing,
  onSummarize,
}: DocumentSummaryProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!initialSummary) return;
    try {
      await navigator.clipboard.writeText(initialSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  if (!canSummarize && !initialSummary) {
    return (
      <Card className="flex min-h-[200px] flex-col items-center justify-center border-dashed border-border/60">
        <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/5 ring-1 ring-primary/10">
            <FileText className="size-7 text-primary/50" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">
              No summary available
            </p>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              Process the document first to generate summaries.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }


  const summarizeDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 gap-1.5 rounded-lg text-xs font-medium"
          disabled={isSummarizing}
          aria-label="Choose summary type"
        >
          <Sparkles className="size-3.5" aria-hidden />
          Summarize
          <ChevronDown className="size-3 opacity-70" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-72 rounded-xl">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Choose summary type
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUMMARY_TYPES.map((t) => {
          const isActiveType = t.id === summaryType;
          const shouldRegenerate = isActiveType && !!initialSummary;
          return (
          <DropdownMenuItem
            key={t.id}
            onSelect={() => {
              queueMicrotask(() => onSummarize(t.id, shouldRegenerate));
            }}
            className="flex cursor-pointer flex-col items-start gap-1 py-2.5"
          >
            <span className="text-sm font-medium text-foreground">
              {t.label}
            </span>
            <span className="text-xs text-muted-foreground leading-snug">
              {t.description}
            </span>
          </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (canSummarize && !initialSummary && !isSummarizing) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {summarizeDropdown}
        </div>
        <Card className="flex min-h-[160px] flex-col items-center justify-center border-dashed border-border/60">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-sm text-muted-foreground">
              Select a summary type above to generate.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {initialSummary && !isSummarizing && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="size-8 text-muted-foreground hover:text-foreground"
                    aria-label="Copy summary"
                  >
                    {copied ? (
                      <Check className="size-4 text-success" aria-hidden />
                    ) : (
                      <ClipboardCopy className="size-4" aria-hidden />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? "Copied!" : "Copy summary"}
                </TooltipContent>
              </Tooltip>
              {summarizeDropdown}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSummarize(summaryType, true)}
                    disabled={!canSummarize || isSummarizing}
                    className="size-8 text-muted-foreground hover:text-foreground"
                    aria-label="Regenerate summary"
                  >
                    <RefreshCw className="size-4" aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate</TooltipContent>
              </Tooltip>
          </div>
          <Card className="overflow-hidden shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="text-sm leading-relaxed text-foreground/85 [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:text-base [&_h3:first-child]:mt-0 [&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:font-semibold [&_h4]:text-foreground [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_p]:my-2 [&_p:last-child]:mb-0 [&_hr]:my-5 [&_hr]:border-border">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }) => (
                      <div className="my-4 w-full overflow-auto rounded-lg border border-border">
                        <table className="w-full caption-bottom text-sm">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="border-b border-border bg-muted/30 [&_tr]:border-b">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="border-b border-border transition-colors hover:bg-muted/50">{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="h-10 px-3 text-left align-middle font-medium text-foreground whitespace-nowrap">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="p-3 align-middle text-foreground/70">{children}</td>
                    ),
                  }}
                >
                  {initialSummary}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
