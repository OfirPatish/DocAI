/**
 * Supabase env — single source for URL and publishable key.
 */

const SUPABASE_ENV_ERROR =
  "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) to .env.local";

export const getSupabaseClientKey = (): string | undefined => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
};

export const getSupabaseEnv = (): { url: string; key: string } | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseClientKey();
  if (!url || !key) return null;
  return { url, key };
};

export const requireSupabaseEnv = (): { url: string; key: string } => {
  const env = getSupabaseEnv();
  if (!env) throw new Error(SUPABASE_ENV_ERROR);
  return env;
};
