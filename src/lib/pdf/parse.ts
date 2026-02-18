/**
 * PDF text extraction — downloads from Supabase Storage and extracts text.
 * Uses unpdf (2026-recommended, serverless-optimized, zero worker issues).
 */

import { extractText, getDocumentProxy } from "unpdf";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ParseResult {
  text: string;
  pageCount: number;
  pages: Array<{ num: number; text: string }>;
}

/**
 * Downloads a PDF from Supabase Storage and extracts text.
 * Uses admin client to bypass Storage RLS.
 * Supports large PDFs (e.g. 250+ pages) — unpdf is serverless-optimized.
 */
export const parsePdfFromStorage = async (
  storagePath: string
): Promise<ParseResult> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("documents")
    .download(storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to download PDF from storage");
  }

  const arrayBuffer = await data.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const pdf = await getDocumentProxy(buffer);

  const { totalPages, text: pageTexts } = await extractText(pdf, {
    mergePages: false,
  });

  const pages: Array<{ num: number; text: string }> = Array.isArray(pageTexts)
    ? pageTexts.map((t, i) => ({ num: i + 1, text: t ?? "" }))
    : [];
  const text = Array.isArray(pageTexts)
    ? pageTexts.join("\n\n").trim()
    : (pageTexts as string).trim();

  return {
    text,
    pageCount: totalPages,
    pages,
  };
};
