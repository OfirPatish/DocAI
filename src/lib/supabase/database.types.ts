/**
 * DocAI database types — matches latest schema.
 * Regenerate with: supabase gen types typescript --project-id YOUR_REF > src/lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DocumentStatus = "pending" | "processing" | "ready" | "error";

export interface DocumentsRow {
  id: string;
  user_id: string;
  filename: string;
  storage_path: string;
  file_size: number | null;
  page_count: number | null;
  chunk_count: number | null;
  extracted_char_count: number | null;
  content_hash: string | null;
  processing_progress: number;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentsInsert {
  id?: string;
  user_id: string;
  filename: string;
  storage_path: string;
  file_size?: number | null;
  page_count?: number | null;
  chunk_count?: number | null;
  content_hash?: string | null;
  processing_progress?: number;
  status?: DocumentStatus;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentsUpdate {
  id?: string;
  user_id?: string;
  filename?: string;
  storage_path?: string;
  file_size?: number | null;
  page_count?: number | null;
  chunk_count?: number | null;
  content_hash?: string | null;
  processing_progress?: number;
  status?: DocumentStatus;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentChunksRow {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  embedding: number[] | null;
  metadata: Json;
  content_search: string | null;
  created_at: string;
}

export interface DocumentChunksInsert {
  id?: string;
  document_id: string;
  content: string;
  chunk_index: number;
  embedding?: number[] | null;
  metadata?: Json;
  created_at?: string;
}

export interface DocumentChunksUpdate {
  id?: string;
  document_id?: string;
  content?: string;
  chunk_index?: number;
  embedding?: number[] | null;
  metadata?: Json;
  created_at?: string;
}

export interface SummariesRow {
  id: string;
  document_id: string;
  summary_text: string;
  summary_type?: string;
  created_at: string;
}

export interface SummariesInsert {
  id?: string;
  document_id: string;
  summary_text: string;
  summary_type?: string;
  created_at?: string;
}

export interface AiUsageLogRow {
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

export interface AiUsageLogInsert {
  id?: string;
  user_id?: string | null;
  endpoint: string;
  model: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  document_id?: string | null;
  created_at?: string;
}

export interface AdminUsersRow {
  user_id: string;
  created_at: string;
}

export interface AdminUsersInsert {
  user_id: string;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: DocumentsRow;
        Insert: DocumentsInsert;
        Update: DocumentsUpdate;
      };
      document_chunks: {
        Row: DocumentChunksRow;
        Insert: DocumentChunksInsert;
        Update: DocumentChunksUpdate;
      };
      summaries: {
        Row: SummariesRow;
        Insert: SummariesInsert;
        Update: Partial<SummariesInsert>;
      };
      ai_usage_log: {
        Row: AiUsageLogRow;
        Insert: AiUsageLogInsert;
        Update: Partial<AiUsageLogInsert>;
      };
      admin_users: {
        Row: AdminUsersRow;
        Insert: AdminUsersInsert;
        Update: Partial<AdminUsersInsert>;
      };
    };
  };
}
