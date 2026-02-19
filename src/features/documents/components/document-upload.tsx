"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CloudUpload, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const PDF_MIME = "application/pdf";
const MAX_SIZE_MB = 10;

const validateFile = (file: File): string | null => {
  if (file.type !== PDF_MIME) {
    return "Only PDF files are allowed.";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File must be under ${MAX_SIZE_MB}MB.`;
  }
  return null;
};

const computeContentHash = async (buffer: ArrayBuffer): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

interface DocumentUploadProps {
  className?: string;
  onUploadingChange?: (uploading: boolean) => void;
}

export const DocumentUpload = ({ className, onUploadingChange }: DocumentUploadProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<"upload" | "process">("upload");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSuccess(null);
        return;
      }

      setError(null);
      setSuccess(null);
      setIsUploading(true);
      setUploadPhase("upload");
      onUploadingChange?.(true);

      try {
        // Step 1: Get upload slot from API (no file — bypasses Vercel 4.5MB limit)
        const prepareRes = await fetch("/api/documents/prepare-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, fileSize: file.size }),
        });

        const prepareData = (await prepareRes.json().catch(() => ({}))) as {
          docId?: string;
          storagePath?: string;
          error?: string;
        };

        if (!prepareRes.ok) {
          const msg = prepareData.error ?? "Upload failed. Please try again.";
          setError(msg);
          setSuccess(null);
          return;
        }

        const { docId, storagePath } = prepareData;
        if (!docId || !storagePath) {
          setError("Upload failed. Please try again.");
          setSuccess(null);
          return;
        }

        // Step 2: Upload directly to Supabase Storage (bypasses Vercel)
        const supabase = createClient();
        const fileBuffer = await file.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(storagePath, fileBuffer, {
            contentType: PDF_MIME,
            upsert: false,
          });

        if (uploadError) {
          setError(uploadError.message ?? "Storage upload failed. Please try again.");
          setSuccess(null);
          return;
        }

        // Step 3: Confirm upload — create document record (metadata only, no file)
        const contentHash = await computeContentHash(fileBuffer);

        const confirmRes = await fetch("/api/documents/confirm-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docId,
            filename: file.name,
            fileSize: file.size,
            contentHash,
          }),
        });

        const confirmData = (await confirmRes.json().catch(() => ({}))) as {
          document?: { id?: string; filename?: string };
          error?: string;
        };

        if (!confirmRes.ok) {
          const msg = confirmData.error ?? "Upload failed. Please try again.";
          setError(msg);
          setSuccess(null);
          return;
        }

        setUploadPhase("process");

        const processRes = await fetch(`/api/documents/${docId}/process`, {
          method: "POST",
        });

        const processData = (await processRes.json().catch(() => ({}))) as {
          chunksInserted?: number;
          error?: string;
        };

        if (!processRes.ok) {
          const msg = processData.error ?? "Upload succeeded but processing failed. You can retry from the document.";
          setError(msg);
          setSuccess(null);
          router.refresh();
          return;
        }

        setError(null);
        router.push(`/dashboard/documents/${docId}`);
      } catch {
        const msg = "Upload failed. Please try again.";
        setError(msg);
        setSuccess(null);
      } finally {
        setIsUploading(false);
        setUploadPhase("upload");
        onUploadingChange?.(false);
      }
    },
    [router, onUploadingChange]
  );

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      uploadFile(file);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file ?? null);
    },
    [handleFile]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (isUploading) return;
    inputRef.current?.click();
  }, [isUploading]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFile(file ?? null);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Card
        role="button"
        tabIndex={0}
        aria-label="Upload PDF document"
        aria-disabled={isUploading}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed outline-none transition-[border-color,background-color,transform,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[200px]",
          isDragging && "border-primary bg-primary/5 shadow-lg shadow-primary/10",
          !isDragging && "border-border/70 bg-card/50 hover:border-primary/40 hover:bg-primary/[0.02]",
          isUploading && "pointer-events-none cursor-not-allowed opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={PDF_MIME}
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden
          disabled={isUploading}
        />
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
        {isUploading ? (
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className="relative flex size-14 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
              <div className="flex size-14 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5">
                <Loader2
                  className="size-7 animate-spin text-primary"
                  aria-hidden
                />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">
                {uploadPhase === "upload" ? "Uploading..." : "Processing..."}
              </p>
              <p className="text-sm text-muted-foreground">
                {uploadPhase === "upload"
                  ? "Please wait"
                  : "Extracting text and indexing"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className={cn(
              "flex size-16 items-center justify-center rounded-2xl transition-colors shadow-sm",
              isDragging ? "bg-primary/15" : "bg-muted/80"
            )}>
              <CloudUpload
                className={cn(
                  "size-8 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
                aria-hidden
              />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">
                {isDragging ? "Drop your PDF here" : "Drop a PDF here or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground">
                PDF only · Max {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>
        )}
        </CardContent>
      </Card>
      {error && (
        <Card className="border-destructive/30 bg-destructive/5" role="alert">
          <CardContent className="flex items-center gap-2 px-4 py-3 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}
      {success && (
        <Card className="border-success/30 bg-success/5" role="status">
          <CardContent className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-success">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            {success}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
