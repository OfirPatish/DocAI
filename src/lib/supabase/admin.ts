/**
 * Supabase Admin client — uses Secret key (sb_secret_...) or legacy service_role, bypasses RLS.
 * Use ONLY on the server (API routes, Server Actions, background jobs).
 * Never expose this client or the key to the browser.
 */

import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "./env";

const getAdminKey = (): string => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations. Add Secret key (API Keys tab) or service_role (Legacy) to .env.local"
    );
  }
  return key;
};

/**
 * Creates a Supabase client with elevated privileges (Secret key or service_role).
 * Bypasses RLS — use only when you need admin access (e.g. server-side Storage operations).
 */
export const createAdminClient = () => {
  const { url } = requireSupabaseEnv();
  const adminKey = getAdminKey();
  return createClient(url, adminKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
