"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/ui/fade-in";
import { Cpu, Sparkles } from "lucide-react";
import type { ModelBreakdown } from "../types";

const SUMMARY_TYPE_LABELS: Record<string, string> = {
  summary: "Summary",
  smart: "Smart Summary",
  chapters: "Chapter Summary",
  core: "Core Points",
  insights: "Key Insights",
  meeting: "Meeting Minutes",
  legal: "Legal / Contract",
};

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const MODEL_COLORS = [
  "bg-primary",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
];

interface AdminModelBreakdownProps {
  modelBreakdown: ModelBreakdown[];
  summariesByType: Record<string, number>;
}

export const AdminModelBreakdown = ({
  modelBreakdown,
  summariesByType,
}: AdminModelBreakdownProps) => {
  const maxTokens = modelBreakdown[0]?.totalTokens || 1;
  const summaryEntries = Object.entries(summariesByType).sort(
    ([, a], [, b]) => b - a
  );
  const totalSummaryCount = summaryEntries.reduce((s, [, c]) => s + c, 0) || 1;

  return (
    <FadeIn delay={0.15}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="size-4 text-primary" aria-hidden />
            AI Breakdown
          </CardTitle>
          <CardDescription>Token usage by model and summary types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {modelBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Cpu className="size-5 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                No AI usage yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                By Model
              </p>
              {modelBreakdown.map((m, i) => {
                const pct = (m.totalTokens / maxTokens) * 100;
                const color = MODEL_COLORS[i % MODEL_COLORS.length];
                return (
                  <div key={m.model} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{m.model}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatNumber(m.totalTokens)} tokens
                        </span>
                        <Badge variant="outline" className="text-[10px] tabular-nums">
                          {m.requestCount} req
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-[11px] text-muted-foreground">
                      <span>Prompt: {formatNumber(m.promptTokens)}</span>
                      <span>Completion: {formatNumber(m.completionTokens)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {summaryEntries.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2.5">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="size-3" aria-hidden />
                  Summary Types
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {summaryEntries.map(([type, count]) => {
                    const pct = ((count / totalSummaryCount) * 100).toFixed(0);
                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between rounded-md border px-2.5 py-1.5"
                      >
                        <span className="truncate text-xs">
                          {SUMMARY_TYPE_LABELS[type] ?? type}
                        </span>
                        <div className="ml-2 flex shrink-0 items-center gap-1.5">
                          <span className="text-xs font-medium tabular-nums">{count}</span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
};
