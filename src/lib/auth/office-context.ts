import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { MembershipRole } from "@/lib/types/database";

export type OfficeContext = {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  tenantId: string;
  role: MembershipRole;
  officeName: string;
};

const MANAGE_ROLES: MembershipRole[] = ["administrador", "socio"];

/**
 * Resolves the signed-in office user's active tenant and role. This is the
 * only place tenant_id enters office Server Components/Actions — it is
 * always derived from the session's active membership, never accepted from
 * the client.
 */
export async function requireOfficeContext(): Promise<OfficeContext> {
  const user = await getSessionUser();
  if (!user || user.accountScope !== "office") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("office_profiles")
    .select("name")
    .eq("tenant_id", membership.tenant_id)
    .maybeSingle();

  return {
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    tenantId: membership.tenant_id,
    role: membership.role,
    officeName: profile?.name ?? "Escritório",
  };
}

export function canManageOffice(role: MembershipRole) {
  return MANAGE_ROLES.includes(role);
}
