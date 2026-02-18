import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "./env";

export const createClient = () => {
  const { url, key } = requireSupabaseEnv();
  return createBrowserClient(url, key);
};
