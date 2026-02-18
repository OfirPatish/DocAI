/**
 * RAG retrieval — hybrid search combining vector similarity and full-text search.
 * Uses Reciprocal Rank Fusion (RRF) for score combination.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { embedText } from "@/lib/openai/embed";
import { logger } from "@/lib/logger";

export interface RetrievedChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  metadata: { page?: number; sectionHeader?: string };
  similarity: number;
}

const DEFAULT_TOP_K = 8;
const MAX_TOP_K = 30;
const RRF_K = 60; // Standard RRF constant

/**
 * Computes a dynamic similarity threshold based on the top scores.
 * Keeps chunks within a reasonable range of the best score.
 */
const computeDynamicThreshold = (chunks: RetrievedChunk[]): number => {
  if (chunks.length === 0) return 0;

  const topScore = chunks[0].similarity;
  const scores = chunks.map((c) => c.similarity);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const stdDev = Math.sqrt(
    scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length
  );

  const threshold = Math.max(mean - stdDev * 0.5, topScore * 0.4, 0.15);
  return threshold;
};

/**
 * Performs vector similarity search.
 */
const vectorSearch = async (
  supabase: SupabaseClient,
  queryEmbedding: number[],
  documentId: string,
  userId: string,
  count: number
): Promise<RetrievedChunk[]> => {
  const { data, error } = await supabase.rpc("match_document_chunks", {
    p_query_embedding: queryEmbedding,
    p_document_id: documentId,
    p_user_id: userId,
    p_match_count: count,
  });

  if (error) throw new Error(`Vector search failed: ${error.message}`);
  if (!Array.isArray(data)) return [];

  return data.map(
    (row: {
      id: string;
      document_id: string;
      content: string;
      chunk_index: number;
      metadata: unknown;
      similarity: number;
    }) => ({
      id: row.id,
      document_id: row.document_id,
      content: row.content,
      chunk_index: row.chunk_index,
      metadata: (row.metadata as { page?: number; sectionHeader?: string }) ?? {},
      similarity: row.similarity,
    })
  );
};

/**
 * Performs full-text search (BM25-like via PostgreSQL ts_rank_cd).
 */
const textSearch = async (
  supabase: SupabaseClient,
  query: string,
  documentId: string,
  userId: string,
  count: number
): Promise<RetrievedChunk[]> => {
  const { data, error } = await supabase.rpc("search_document_chunks_text", {
    p_query: query,
    p_document_id: documentId,
    p_user_id: userId,
    p_match_count: count,
  });

  if (error) {
    logger.warn("Full-text search failed, falling back to vector-only", {
      error: error.message,
    });
    return [];
  }
  if (!Array.isArray(data)) return [];

  return data.map(
    (row: {
      id: string;
      document_id: string;
      content: string;
      chunk_index: number;
      metadata: unknown;
      rank: number;
    }) => ({
      id: row.id,
      document_id: row.document_id,
      content: row.content,
      chunk_index: row.chunk_index,
      metadata: (row.metadata as { page?: number; sectionHeader?: string }) ?? {},
      similarity: row.rank,
    })
  );
};

/**
 * Combines vector and text search results using Reciprocal Rank Fusion.
 * RRF score = sum(1 / (k + rank_i)) across all result lists.
 */
const fuseResults = (
  vectorResults: RetrievedChunk[],
  textResults: RetrievedChunk[],
  maxResults: number
): RetrievedChunk[] => {
  const scoreMap = new Map<string, { chunk: RetrievedChunk; rrfScore: number }>();

  vectorResults.forEach((chunk, rank) => {
    const score = 1 / (RRF_K + rank);
    const existing = scoreMap.get(chunk.id);
    if (existing) {
      existing.rrfScore += score;
    } else {
      scoreMap.set(chunk.id, { chunk, rrfScore: score });
    }
  });

  textResults.forEach((chunk, rank) => {
    const score = 1 / (RRF_K + rank);
    const existing = scoreMap.get(chunk.id);
    if (existing) {
      existing.rrfScore += score;
    } else {
      scoreMap.set(chunk.id, { chunk, rrfScore: score });
    }
  });

  const fused = Array.from(scoreMap.values());
  fused.sort((a, b) => b.rrfScore - a.rrfScore);

  return fused.slice(0, maxResults).map((f) => f.chunk);
};

/**
 * Hybrid retrieval: embeds the query, runs both vector + full-text search,
 * fuses results with RRF, applies dynamic similarity threshold.
 */
export const retrieveRelevantChunks = async (
  supabase: SupabaseClient,
  options: {
    documentId: string;
    userId: string;
    query: string;
    topK?: number;
  }
): Promise<RetrievedChunk[]> => {
  const { documentId, userId, query, topK = DEFAULT_TOP_K } = options;
  const k = Math.min(Math.max(1, topK), MAX_TOP_K);
  const fetchCount = Math.min(k * 2, MAX_TOP_K);

  const queryEmbedding = await embedText(query);

  const [vectorResults, textResults] = await Promise.all([
    vectorSearch(supabase, queryEmbedding, documentId, userId, fetchCount),
    textSearch(supabase, query, documentId, userId, fetchCount),
  ]);

  logger.info("Hybrid search results", {
    vectorCount: vectorResults.length,
    textCount: textResults.length,
    documentId,
  });

  if (vectorResults.length === 0 && textResults.length === 0) {
    return [];
  }

  if (textResults.length === 0) {
    const threshold = computeDynamicThreshold(vectorResults);
    return vectorResults
      .filter((c) => c.similarity >= threshold)
      .slice(0, k);
  }

  const fused = fuseResults(vectorResults, textResults, k);

  if (fused.length > 0 && vectorResults.length > 0) {
    const threshold = computeDynamicThreshold(vectorResults);
    return fused.filter((c) => {
      const vectorHit = vectorResults.find((v) => v.id === c.id);
      return !vectorHit || vectorHit.similarity >= threshold;
    });
  }

  return fused;
};
