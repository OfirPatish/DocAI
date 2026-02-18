"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, Trash2, Calendar } from "lucide-react";
import Link from "next/link";

interface DocumentCardProps {
  id: string;
  filename: string;
  createdAt?: string;
  onDeleted?: (id: string) => void;
}

const MAX_FILENAME_DISPLAY = 50;

const truncateFilename = (name: string): string => {
  if (name.length <= MAX_FILENAME_DISPLAY) return name;
  return name.slice(0, MAX_FILENAME_DISPLAY - 3) + "...";
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const DocumentCard = ({
  id,
  filename,
  createdAt,
  onDeleted,
}: DocumentCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);

    fetch(`/api/documents/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) {
          onDeleted?.(id);
        } else {
          toast.error("Failed to delete");
        }
      })
      .catch(() => {
        toast.error("Failed to delete");
      })
      .finally(() => setIsDeleting(false));
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <>
      <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
        <Link
          href={`/dashboard/documents/${id}`}
          prefetch={false}
          className="flex flex-col"
        >
          <div className="relative block aspect-[2/1] w-full shrink-0 overflow-hidden bg-muted">
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="size-12 text-muted-foreground/50" aria-hidden />
              </div>
            ) : (
              <Image
                src="/document-placeholder.png"
                alt=""
                fill
                className="object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onError={() => setImageError(true)}
              />
            )}
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3
              className="truncate text-center text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary"
              title={filename}
            >
              {filename}
            </h3>
            <div className="mt-4 flex flex-1 items-center justify-between pt-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {createdAt ? (
                  <>
                    <Calendar className="size-3 shrink-0" aria-hidden />
                    {formatDate(createdAt)}
                  </>
                ) : (
                  <span aria-hidden />
                )}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    aria-label={`Delete ${filename}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Link>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground" title={filename}>
                {truncateFilename(filename)}
              </span>{" "}
              and all its data including summaries and chat history. This action
              cannot be undone.
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
};
