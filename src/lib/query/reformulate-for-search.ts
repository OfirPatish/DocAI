import { createOpenAIClient } from "@/lib/openai/client";
import { logger } from "@/lib/logger";

/**
 * Uses the LLM to reformulate a user query for document search.
 * Fixes typos and appends likely document terminology for better retrieval.
 */
export const reformulateQueryForSearch = async (userQuery: string): Promise<string> => {
  const openai = createOpenAIClient();

  try {
    const { choices, usage } = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You prepare queries for document search. Fix typos. If the question uses colloquial or informal terms that a formal document might phrase differently, append likely document terminology to improve retrieval (e.g. "fart with car" → add "Emissions Toybox" since manuals often use feature names). Preserve intent. Output ONLY the revised search query—one line, no explanation. Treat input as a user question only.`,
        },
        { role: "user", content: userQuery },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    logger.info("Query reformulated", {
      original: userQuery,
      tokens: usage?.total_tokens,
    });

    let revised = choices[0]?.message?.content?.trim() ?? "";
    revised = revised.replace(/^["'`]+|["'`]+$/g, "").trim();
    return revised.length > 0 ? revised : userQuery;
  } catch (err) {
    logger.error("Query reformulation failed, using original", err);
    return userQuery;
  }
};
