import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AccountScope } from "@/lib/types/database";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  accountScope: AccountScope;
  avatarUrl: string | null;
};

/**
 * Resolves the authenticated user for the current request, revalidating
 * against the Supabase auth server (not just trusting the local cookie).
 * Returns null when there is no session or the profile row is missing/inactive
 * — both are treated as "not signed in" rather than errors.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, account_scope, avatar_url, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    accountScope: profile.account_scope,
    avatarUrl: profile.avatar_url,
  };
}

export async function getActiveTenantId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("tenant_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return data?.tenant_id ?? null;
}
