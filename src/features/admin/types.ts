import type { DocumentStatus } from "@/lib/supabase/database.types";

export interface AdminDocument {
  id: string;
  user_id: string;
  filename: string;
  storage_path: string;
  file_size: number | null;
  page_count: number | null;
  chunk_count: number | null;
  extracted_char_count: number | null;
  status: DocumentStatus;
  processing_progress: number;
  created_at: string;
  updated_at: string;
}

export interface AdminAiUsage {
  id: string;
  user_id: string | null;
  endpoint: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  document_id: string | null;
  created_at: string;
}

export interface AdminSummaryRow {
  id: string;
  document_id: string;
  summary_type: string | null;
  created_at: string;
}

export interface ModelBreakdown {
  model: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
}

export interface AdminOverviewStats {
  totalDocuments: number;
  documentsByStatus: Record<DocumentStatus, number>;
  totalTokens: number;
  totalSummaries: number;
  uniqueUsers: number;
  totalStorageBytes: number;
  totalPages: number;
  totalChunks: number;
  modelBreakdown: ModelBreakdown[];
  summariesByType: Record<string, number>;
}
