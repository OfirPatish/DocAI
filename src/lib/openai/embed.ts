/**
 * OpenAI embeddings — text-embedding-3-large with dimensions=2000.
 * 2000 is pgvector HNSW index max; large model with dimension reduction for better quality than 3-small.
 */

import { createOpenAIClient } from "./client";
import { withRetry } from "@/lib/retry";
import { logger } from "@/lib/logger";

const EMBEDDING_MODEL = "text-embedding-3-large";
const EMBEDDING_DIMENSIONS = 2000;
const DEFAULT_BATCH_SIZE = 20;

export const getEmbeddingDimensions = () => EMBEDDING_DIMENSIONS;

/**
 * Embeds a single text and returns a 2000-dimensional vector.
 */
export const embedText = async (text: string): Promise<number[]> => {
  const openai = createOpenAIClient();

  const { data } = await withRetry(
    () =>
      openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text.trim() || " ",
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    { maxRetries: 3, baseDelayMs: 1000 }
  );

  const embedding = data[0]?.embedding;
  if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Invalid embedding response: expected ${EMBEDDING_DIMENSIONS} dims`);
  }
  return embedding;
};

/**
 * Embeds multiple texts in batches with retry per batch.
 * Returns embeddings in the same order as input texts.
 * Calls onProgress after each batch completes.
 */
export const embedTextsBatch = async (
  texts: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<number[][]> => {
  if (texts.length === 0) return [];

  const openai = createOpenAIClient();
  const batchSize = Number(process.env.DOCAI_EMBED_BATCH_SIZE) || DEFAULT_BATCH_SIZE;
  const allEmbeddings: number[][] = new Array(texts.length);
  let completed = 0;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const inputs = batch.map((t) => t.trim() || " ");

    const { data } = await withRetry(
      () =>
        openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: inputs,
          dimensions: EMBEDDING_DIMENSIONS,
        }),
      { maxRetries: 3, baseDelayMs: 2000 }
    );

    data.forEach((item, idx) => {
      const embedding = item.embedding;
      if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(`Invalid embedding at index ${i + idx}`);
      }
      allEmbeddings[i + idx] = embedding;
    });

    completed += batch.length;
    onProgress?.(completed, texts.length);

    logger.info("Embedding batch complete", {
      batch: Math.floor(i / batchSize) + 1,
      totalBatches: Math.ceil(texts.length / batchSize),
      completed,
      total: texts.length,
    });
  }

  return allEmbeddings;
};
