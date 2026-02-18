"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { FileText, Clock, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import type { AdminDocument } from "../types";
import type { DocumentStatus } from "@/lib/supabase/database.types";

const STATUS_ICON: Record<DocumentStatus, typeof CheckCircle2> = {
  ready: CheckCircle2,
  processing: Loader2,
  pending: Clock,
  error: AlertCircle,
};

const STATUS_STYLE: Record<DocumentStatus, string> = {
  ready: "text-emerald-600 dark:text-emerald-400",
  processing: "text-blue-600 dark:text-blue-400 animate-spin",
  pending: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

const formatRelativeTime = (dateStr: string): string => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatBytes = (bytes: number | null): string => {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface AdminRecentActivityProps {
  documents: AdminDocument[];
}

export const AdminRecentActivity = ({ documents }: AdminRecentActivityProps) => {
  return (
    <FadeIn delay={0.1}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-primary" aria-hidden />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest document uploads across all users</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <FileText className="size-5 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                No documents yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Documents will appear here once users upload files.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {documents.map((doc) => {
                const StatusIcon = STATUS_ICON[doc.status];
                return (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background">
                      <FileText className="size-4 text-muted-foreground" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium leading-tight"
                        title={doc.filename}
                      >
                        {doc.filename}
                      </p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate font-mono">
                          {doc.user_id.slice(0, 8)}...
                        </span>
                        {doc.file_size != null && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{formatBytes(doc.file_size)}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusIcon
                        className={`size-3.5 ${STATUS_STYLE[doc.status]}`}
                        aria-label={doc.status}
                      />
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {formatRelativeTime(doc.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
};
