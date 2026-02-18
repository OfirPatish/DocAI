"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, Trash2, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

interface DocumentActionsProps {
  documentId: string;
  status: string;
  disabled?: boolean;
}

export const DocumentActions = ({
  documentId,
  status,
  disabled = false,
}: DocumentActionsProps) => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isReady = status === "ready";
  const needsProcess = status === "pending" || status === "error";
  const isProcessingStatus = status === "processing";

  const handleProcess = () => {
    if (disabled || isProcessing || isProcessingStatus) return;
    setIsProcessing(true);
    fetch(`/api/documents/${documentId}/process`, { method: "POST" })
      .then(() => router.refresh())
      .finally(() => setIsProcessing(false));
  };

  const handleConfirmDelete = () => {
    if (disabled) return;
    setIsDeleting(true);
    fetch(`/api/documents/${documentId}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) router.push("/dashboard/documents");
        else toast.error("Failed to delete");
      })
      .catch(() => toast.error("Failed to delete"))
      .finally(() => {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
      });
  };

  if (needsProcess) {
    return (
      <Button
        size="sm"
        onClick={handleProcess}
        disabled={disabled || isProcessing}
        className="h-9 gap-2 shrink-0 rounded-lg font-medium shadow-sm"
        aria-label="Process document"
      >
        {isProcessing ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Play className="size-4" aria-hidden />
        )}
        {isProcessing ? "Processing..." : "Process"}
      </Button>
    );
  }

  if (isProcessingStatus) {
    return (
      <Button size="sm" variant="secondary" disabled className="h-9 gap-2 shrink-0 rounded-lg font-medium">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Processing...
      </Button>
    );
  }

  if (isReady) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="size-9 shrink-0 rounded-lg shadow-sm" aria-label="Document options">
              <MoreHorizontal className="size-4 shrink-0" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/documents" className="gap-2 cursor-pointer">
                <Upload className="size-4" aria-hidden />
                Upload new
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="size-4" aria-hidden />
              Delete document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete document?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this document and all its data including summaries and chat history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return null;
};
