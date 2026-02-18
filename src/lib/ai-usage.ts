import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

interface UsageEntry {
  userId: string;
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  documentId?: string;
}

/**
 * Logs AI token usage to the ai_usage_log table.
 * Non-blocking — failures are logged but don't affect the caller.
 */
export const trackAiUsage = async (entry: UsageEntry): Promise<void> => {
  try {
    const admin = createAdminClient();
    await admin.from("ai_usage_log").insert({
      user_id: entry.userId,
      endpoint: entry.endpoint,
      model: entry.model,
      prompt_tokens: entry.promptTokens,
      completion_tokens: entry.completionTokens,
      total_tokens: entry.totalTokens,
      document_id: entry.documentId ?? null,
    });
  } catch (err) {
    logger.error("Failed to track AI usage", err, {
      endpoint: entry.endpoint,
      model: entry.model,
    });
  }
};
