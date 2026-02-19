"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Check, X } from "lucide-react";

const stripPdfExt = (name: string): string =>
  name.toLowerCase().endsWith(".pdf") ? name.slice(0, -4) : name;

const ensurePdfExt = (name: string): string =>
  name.trim().toLowerCase().endsWith(".pdf") ? name.trim() : `${name.trim()}.pdf`;

interface DocumentFilenameEditorProps {
  documentId: string;
  filename: string;
}

export const DocumentFilenameEditor = ({
  documentId,
  filename,
}: DocumentFilenameEditorProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(() => stripPdfExt(filename));
  const inputRef = useRef<HTMLInputElement>(null);

  const baseName = stripPdfExt(filename);
  const [displayFilename, setDisplayFilename] = useState(filename);

  useEffect(() => {
    setDisplayFilename(filename);
  }, [filename]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      requestAnimationFrame(() => {
        inputRef.current?.select();
      });
    }
  }, [isEditing]);

  useEffect(() => {
    setValue(baseName);
  }, [baseName]);

  const handleStartEdit = useCallback(() => {
    setValue(baseName);
    setIsEditing(true);
  }, [baseName]);

  const handleCancel = useCallback(() => {
    setValue(baseName);
    setIsEditing(false);
  }, [baseName]);

  const handleSave = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === baseName) {
      handleCancel();
      return;
    }
    const withExt = ensurePdfExt(trimmed);
    setIsEditing(false);

    fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: withExt }),
    })
      .then((res) => res.json())
      .then((data: { success?: boolean; error?: string }) => {
        if (data.error) {
          toast.error(data.error);
        } else {
          setDisplayFilename(withExt);
          router.refresh();
        }
      })
      .catch(() => {
        toast.error("Failed to rename");
      });
  }, [documentId, value, baseName, handleCancel, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
          className="h-8 min-w-0 max-w-[160px] text-sm font-semibold sm:max-w-[240px] md:max-w-[300px]"
          aria-label="Edit filename (extension will be .pdf)"
        />
        <Button variant="ghost" size="icon-xs" onClick={handleSave} aria-label="Save" className="text-success hover:bg-success/10">
          <Check className="size-3.5" aria-hidden />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={handleCancel} aria-label="Cancel" className="hover:bg-destructive/10 hover:text-destructive">
          <X className="size-3.5" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <h1 className="truncate text-sm font-semibold sm:text-base md:font-bold md:text-lg" title={displayFilename}>
        {displayFilename}
      </h1>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={handleStartEdit}
            aria-label="Rename document"
          >
            <Pencil className="size-3" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Rename</TooltipContent>
      </Tooltip>
    </div>
  );
};
