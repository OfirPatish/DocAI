/**
 * Supabase Admin client — uses service_role key, bypasses RLS.
 * Use ONLY on the server (API routes, Server Actions, background jobs).
 * Never expose this client or the service role key to the browser.
 */

import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "./env";

const getServiceRoleKey = (): string => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations. Add it to .env.local"
    );
  }
  return key;
};

/**
 * Creates a Supabase client with service_role key.
 * Bypasses RLS — use only when you need admin access (e.g. server-side Storage operations).
 */
export const createAdminClient = () => {
  const { url } = requireSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
