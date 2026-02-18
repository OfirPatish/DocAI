/**
 * Adaptive text chunking for RAG.
 * Detects document structure (headings, sections) and preserves context.
 * Enriches each chunk with section header metadata.
 */

const CHARS_PER_TOKEN = 4;
const TARGET_CHUNK_CHARS = 800 * CHARS_PER_TOKEN; // ~800 tokens
const OVERLAP_CHARS = 120 * CHARS_PER_TOKEN; // ~120 token overlap

export interface TextChunk {
  content: string;
  chunkIndex: number;
  metadata: {
    page?: number;
    sectionHeader?: string;
  };
}

const HEADING_PATTERNS = [
  /^#{1,4}\s+.+/, // Markdown headings
  /^(?:CHAPTER|SECTION|PART|ARTICLE)\s+\w+/i, // Formal section labels
  /^\d+(?:\.\d+)*\s+[A-Z].+/, // Numbered headings like "1.2 Overview"
  /^[A-Z][A-Z\s]{4,}$/, // ALL CAPS lines (min 5 chars)
  /^(?:Introduction|Conclusion|Summary|Abstract|Appendix|References|Table of Contents)/i,
];

const isHeading = (line: string): boolean => {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 120) return false;
  return HEADING_PATTERNS.some((pattern) => pattern.test(trimmed));
};

const extractHeading = (line: string): string => {
  return line
    .trim()
    .replace(/^#{1,4}\s+/, "")
    .slice(0, 100);
};

/**
 * Finds the best split point near `target` position in the text.
 * Prefers paragraph breaks > sentence breaks > heading boundaries.
 */
const findBreakPoint = (
  text: string,
  start: number,
  target: number,
): number => {
  const searchStart = Math.max(start, target - 400);
  const searchEnd = Math.min(text.length, target + 200);
  const window = text.slice(searchStart, searchEnd);

  // Prefer paragraph breaks
  let bestBreak = -1;
  const paraRegex = /\n\s*\n/g;
  let match: RegExpExecArray | null;
  while ((match = paraRegex.exec(window)) !== null) {
    const pos = searchStart + match.index + match[0].length;
    if (pos > start && pos <= target + 200) {
      bestBreak = pos;
    }
  }
  if (bestBreak > start) return bestBreak;

  // Fall back to sentence breaks
  const sentRegex = /[.!?]\s+/g;
  while ((match = sentRegex.exec(window)) !== null) {
    const pos = searchStart + match.index + match[0].length;
    if (pos > start && pos <= target + 200) {
      bestBreak = pos;
    }
  }
  if (bestBreak > start) return bestBreak;

  return target;
};

/**
 * Splits text into overlapping chunks with adaptive boundaries.
 * Respects headings, paragraphs, and sentence boundaries.
 * Enriches each chunk with section header metadata.
 */
export const chunkText = (
  text: string,
  pages?: Array<{ num: number; text: string }>,
): TextChunk[] => {
  const chunks: TextChunk[] = [];
  let chunkIndex = 0;
  let start = 0;
  let currentSection: string | undefined;

  const lines = text.split("\n");
  const lineOffsets: Array<{ offset: number; text: string }> = [];
  let offset = 0;
  for (const line of lines) {
    lineOffsets.push({ offset, text: line });
    if (isHeading(line)) {
      const heading = extractHeading(line);
      if (heading) {
        lineOffsets[lineOffsets.length - 1].text = line;
      }
    }
    offset += line.length + 1; // +1 for \n
  }

  const getPageForOffset = (off: number): number | undefined => {
    if (!pages?.length) return undefined;
    let charCount = 0;
    for (const p of pages) {
      charCount += p.text.length;
      if (off < charCount) return p.num;
    }
    return pages[pages.length - 1]?.num;
  };

  const getSectionForOffset = (off: number): string | undefined => {
    let section: string | undefined;
    for (const lo of lineOffsets) {
      if (lo.offset > off) break;
      if (isHeading(lo.text)) {
        section = extractHeading(lo.text);
      }
    }
    return section;
  };

  while (start < text.length) {
    const chunkEnd = Math.min(start + TARGET_CHUNK_CHARS, text.length);

    let end: number;
    if (chunkEnd >= text.length) {
      end = text.length;
    } else {
      end = findBreakPoint(text, start, chunkEnd);
    }

    const content = text.slice(start, end).trim();
    if (content) {
      const page = getPageForOffset(start);
      const sectionHeader = getSectionForOffset(start) ?? currentSection;
      if (sectionHeader) currentSection = sectionHeader;

      chunks.push({
        content,
        chunkIndex,
        metadata: {
          ...(page != null ? { page } : {}),
          ...(sectionHeader ? { sectionHeader } : {}),
        },
      });
      chunkIndex++;
    }

    if (end >= text.length) break;

    start = end - OVERLAP_CHARS;
    if (start <= (chunkIndex > 0 ? end - TARGET_CHUNK_CHARS : 0)) {
      start = end;
    }
  }

  return chunks;
};
