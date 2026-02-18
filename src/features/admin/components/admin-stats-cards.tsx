"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Cpu,
  MessageSquare,
  Users,
  HardDrive,
  BookOpen,
  Layers,
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import type { AdminOverviewStats } from "../types";
import type { DocumentStatus } from "@/lib/supabase/database.types";

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string }> = {
  ready: { label: "Ready", color: "bg-emerald-500" },
  processing: { label: "Processing", color: "bg-blue-500" },
  pending: { label: "Pending", color: "bg-amber-500" },
  error: { label: "Error", color: "bg-red-500" },
};

const STATUS_ORDER: DocumentStatus[] = ["ready", "processing", "pending", "error"];

interface AdminStatsCardsProps {
  stats: AdminOverviewStats;
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const AdminStatsCards = ({ stats }: AdminStatsCardsProps) => {
  const totalDocs = stats.totalDocuments || 1;

  const cards = [
    {
      title: "Total Documents",
      value: formatNumber(stats.totalDocuments),
      description: "Across all users",
      icon: FileText,
    },
    {
      title: "Unique Users",
      value: formatNumber(stats.uniqueUsers),
      description: "Users who uploaded",
      icon: Users,
    },
    {
      title: "AI Tokens Used",
      value: formatNumber(stats.totalTokens),
      description: "Prompt + completion",
      icon: Cpu,
    },
    {
      title: "Summaries Generated",
      value: formatNumber(stats.totalSummaries),
      description: `${Object.keys(stats.summariesByType).length} types used`,
      icon: MessageSquare,
    },
    {
      title: "Storage Used",
      value: formatBytes(stats.totalStorageBytes),
      description: `${formatNumber(stats.totalPages)} pages total`,
      icon: HardDrive,
    },
    {
      title: "Chunks Indexed",
      value: formatNumber(stats.totalChunks),
      description: "Vector embeddings",
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, value, description, icon: Icon }, i) => (
          <FadeIn key={title} delay={i * 0.05}>
            <Card className="overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {title}
                </CardTitle>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" aria-hidden />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold sm:text-2xl">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3}>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              Document Status Distribution
            </CardTitle>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="size-4 text-primary" aria-hidden />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label="Document status distribution bar"
            >
              {STATUS_ORDER.map((status) => {
                const count = stats.documentsByStatus[status] ?? 0;
                const pct = (count / totalDocs) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={status}
                    className={`${STATUS_CONFIG[status].color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${STATUS_CONFIG[status].label}: ${count}`}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {STATUS_ORDER.map((status) => {
                const count = stats.documentsByStatus[status] ?? 0;
                const pct = stats.totalDocuments > 0
                  ? ((count / stats.totalDocuments) * 100).toFixed(0)
                  : "0";
                return (
                  <div key={status} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-block size-2.5 rounded-full ${STATUS_CONFIG[status].color}`}
                      aria-hidden
                    />
                    <span className="text-muted-foreground">
                      {STATUS_CONFIG[status].label}
                    </span>
                    <span className="font-medium tabular-nums">{count}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
};
