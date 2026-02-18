import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side admin check using the is_admin RPC (SECURITY DEFINER).
 * Works with the normal user-scoped Supabase client.
 */
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin", {
    p_user_id: userId,
  });
  if (error) return false;
  return data === true;
};

/**
 * Require admin access — returns the authenticated user or null.
 * Use in API routes and server components.
 */
export const requireAdmin = async (): Promise<{
  userId: string;
  isAdmin: true;
} | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const isAdmin = await checkIsAdmin(user.id);
  if (!isAdmin) return null;

  return { userId: user.id, isAdmin: true };
};

/**
 * Service-role admin client for bypassing RLS in admin queries.
 */
export const getAdminSupabase = () => createAdminClient();
