/**
 * Rate limiter backed by Supabase (Postgres).
 * Shared across serverless instances. Falls back to in-memory if Supabase fails.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "./logger";

type Endpoint = "chat" | "summarize" | "process" | "upload";

const LIMITS: Record<Endpoint, number> = {
  chat: 30,
  summarize: 10,
  process: 5,
  upload: 10,
};

const WINDOW_SECONDS = 60;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

const supabaseLimit = async (
  userId: string,
  endpoint: Endpoint
): Promise<RateLimitResult | null> => {
  try {
    const admin = createAdminClient();
    const key = `${endpoint}:${userId}`;
    const limit = LIMITS[endpoint];

    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: WINDOW_SECONDS,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;

    const allowed = Boolean(row.allowed);
    const remaining = Number(row.remaining ?? 0);
    const resetAt = row.reset_at ? new Date(String(row.reset_at)).getTime() : Date.now() + WINDOW_SECONDS * 1000;
    const resetInSeconds = Math.max(0, Math.ceil((resetAt - Date.now()) / 1000));

    return { allowed, remaining, resetInSeconds };
  } catch (err) {
    logger.error("Supabase rate limit check failed", err);
    return null;
  }
};

// --- In-memory fallback ---

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();
const WINDOW_MS = WINDOW_SECONDS * 1000;

const memoryCleanup = (now: number) => {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }
};

const memoryLimit = (userId: string, endpoint: Endpoint): RateLimitResult => {
  const now = Date.now();
  if (store.size > 10_000) memoryCleanup(now);

  const key = `${endpoint}:${userId}`;
  const limit = LIMITS[endpoint];
  const entry = store.get(key);

  const windowEnd = entry?.resetAt ?? now + WINDOW_MS;
  const isNewWindow = now >= windowEnd;
  const count = isNewWindow ? 0 : entry?.count ?? 0;
  const newCount = count + 1;
  const resetAt = isNewWindow ? now + WINDOW_MS : windowEnd;
  const remaining = Math.max(0, limit - newCount);
  const allowed = newCount <= limit;

  if (allowed) {
    store.set(key, { count: newCount, resetAt });
  }

  return {
    allowed,
    remaining,
    resetInSeconds: Math.ceil((resetAt - now) / 1000),
  };
};

// --- Public API ---

export const checkRateLimit = async (
  userId: string,
  endpoint: Endpoint
): Promise<RateLimitResult> => {
  const result = await supabaseLimit(userId, endpoint);

  if (result) return result;

  logger.warn("Rate limit using in-memory fallback (Supabase unavailable)");
  return memoryLimit(userId, endpoint);
};
