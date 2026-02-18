import type { RetrievedChunk } from "./retrieve";

interface RerankOptions {
  query: string;
  chunks: RetrievedChunk[];
  topK?: number;
}

const tokenize = (text: string): Set<string> => {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
};

const computeKeywordOverlap = (queryTokens: Set<string>, chunkText: string): number => {
  if (queryTokens.size === 0) return 0;
  const chunkLower = chunkText.toLowerCase();
  let matches = 0;
  for (const token of queryTokens) {
    if (chunkLower.includes(token)) matches++;
  }
  return matches / queryTokens.size;
};

const WEIGHT_SIMILARITY = 0.65;
const WEIGHT_KEYWORD = 0.25;
const WEIGHT_POSITION = 0.10;

/**
 * Re-ranks retrieved chunks using a weighted combination of:
 * - Vector similarity score (from retrieval)
 * - Keyword overlap ratio (query terms found in chunk)
 * - Position bias (earlier chunks get a slight boost)
 */
export const rerankChunks = ({
  query,
  chunks,
  topK = 8,
}: RerankOptions): RetrievedChunk[] => {
  if (chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  const maxIndex = Math.max(...chunks.map((c) => c.chunk_index), 1);

  const scored = chunks.map((chunk) => {
    const keywordScore = computeKeywordOverlap(queryTokens, chunk.content);
    const positionScore = 1 - chunk.chunk_index / (maxIndex + 1);
    const combinedScore =
      WEIGHT_SIMILARITY * chunk.similarity +
      WEIGHT_KEYWORD * keywordScore +
      WEIGHT_POSITION * positionScore;

    return { chunk, combinedScore };
  });

  scored.sort((a, b) => b.combinedScore - a.combinedScore);

  return scored.slice(0, topK).map((s) => s.chunk);
};
