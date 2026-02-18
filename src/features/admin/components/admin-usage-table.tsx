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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FadeIn } from "@/components/ui/fade-in";
import { Cpu, Inbox } from "lucide-react";
import type { AdminAiUsage } from "../types";

const ENDPOINT_LABELS: Record<string, string> = {
  chat: "Chat",
  summarize: "Summarize",
  process: "Process",
  embed: "Embed",
};

const formatNumber = (n: number): string => {
  return n.toLocaleString();
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

const getModelBadgeVariant = (
  model: string
): "default" | "secondary" | "outline" => {
  if (model.includes("4o-mini")) return "outline";
  if (model.includes("4o")) return "default";
  if (model.includes("embedding")) return "secondary";
  return "outline";
};

interface AdminUsageTableProps {
  usage: AdminAiUsage[];
}

export const AdminUsageTable = ({ usage }: AdminUsageTableProps) => {
  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="size-4 text-primary" aria-hidden />
            AI Usage Log
          </CardTitle>
          <CardDescription>
            Most recent 200 API calls — token breakdown by endpoint and model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usage.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-6 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-4 text-sm font-medium">No usage records yet</p>
              <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                AI usage will be tracked here once users start chatting or summarizing documents.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Prompt</TableHead>
                  <TableHead className="text-right">Completion</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden md:table-cell">User</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.map((row) => {
                  const endpointLabel =
                    ENDPOINT_LABELS[row.endpoint] ?? row.endpoint;
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {endpointLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getModelBadgeVariant(row.model)}
                          className="font-mono text-[11px]"
                        >
                          {row.model}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatNumber(row.prompt_tokens)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatNumber(row.completion_tokens)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatNumber(row.total_tokens)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {row.user_id ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-default font-mono text-xs text-muted-foreground">
                                {row.user_id.slice(0, 8)}...
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{row.user_id}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default text-sm tabular-nums text-muted-foreground">
                              {formatRelativeTime(row.created_at)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {formatFullDate(row.created_at)}
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
