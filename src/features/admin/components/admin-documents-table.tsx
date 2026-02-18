"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FadeIn } from "@/components/ui/fade-in";
import { FileText, Inbox } from "lucide-react";
import type { AdminDocument } from "../types";
import type { DocumentStatus } from "@/lib/supabase/database.types";

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; dot: string }
> = {
  ready: { label: "Ready", variant: "default", dot: "bg-emerald-500" },
  processing: { label: "Processing", variant: "secondary", dot: "bg-blue-500" },
  pending: { label: "Pending", variant: "outline", dot: "bg-amber-500" },
  error: { label: "Error", variant: "destructive", dot: "bg-red-500" },
};

const formatBytes = (bytes: number | null): string => {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatFullDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface AdminDocumentsTableProps {
  documents: AdminDocument[];
}

export const AdminDocumentsTable = ({ documents }: AdminDocumentsTableProps) => {
  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-primary" aria-hidden />
            All Documents
          </CardTitle>
          <CardDescription>
            Most recent 200 documents across all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-6 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-4 text-sm font-medium">No documents yet</p>
              <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                Documents from all users will appear here once they start uploading files.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="hidden md:table-cell">Pages</TableHead>
                  <TableHead className="hidden md:table-cell">Chunks</TableHead>
                  <TableHead className="hidden lg:table-cell">User</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const config = STATUS_CONFIG[doc.status];
                  const showProgress =
                    doc.status === "processing" && doc.processing_progress > 0;
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="max-w-[220px]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            <FileText
                              className="size-3.5 text-muted-foreground"
                              aria-hidden
                            />
                          </div>
                          <span className="truncate text-sm font-medium" title={doc.filename}>
                            {doc.filename}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Badge variant={config.variant} className="gap-1.5">
                            <span
                              className={`inline-block size-1.5 rounded-full ${config.dot}`}
                              aria-hidden
                            />
                            {config.label}
                          </Badge>
                          {showProgress && (
                            <Progress
                              value={doc.processing_progress}
                              className="h-1 w-16"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatBytes(doc.file_size)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell tabular-nums">
                        {doc.page_count ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell tabular-nums">
                        {doc.chunk_count ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default font-mono text-xs text-muted-foreground">
                              {doc.user_id.slice(0, 8)}...
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{doc.user_id}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default text-sm tabular-nums text-muted-foreground">
                              {formatRelativeTime(doc.created_at)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {formatFullDate(doc.created_at)}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
};
