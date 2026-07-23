import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listTeamMembers(tenantId: string) {
  const supabase = await createClient();

  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("id, user_id, role, status, created_at")
    .eq("tenant_id", tenantId)
    .neq("status", "removed")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Falha ao carregar equipe: ${error.message}`);
  if (!memberships || memberships.length === 0) return [];

  const userIds = memberships.map((m) => m.user_id);
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, oab_number, is_active")
    .in("id", userIds);
  const usersById = new Map((users ?? []).map((u) => [u.id, u]));

  const { data: activeCasesRaw } = await supabase
    .from("cases")
    .select("responsible_lawyer_id")
    .eq("tenant_id", tenantId)
    .in("responsible_lawyer_id", userIds)
    .is("archived_at", null)
    .not("status", "in", '("concluido","arquivado")');
  const activeCaseCountByUser = new Map<string, number>();
  for (const row of activeCasesRaw ?? []) {
    activeCaseCountByUser.set(row.responsible_lawyer_id, (activeCaseCountByUser.get(row.responsible_lawyer_id) ?? 0) + 1);
  }

  const { data: logins } = await supabase
    .from("audit_logs")
    .select("actor_id, created_at")
    .eq("tenant_id", tenantId)
    .eq("event_type", "login_success")
    .in("actor_id", userIds)
    .order("created_at", { ascending: false });
  const lastAccessByUser = new Map<string, string>();
  for (const row of logins ?? []) {
    if (row.actor_id && !lastAccessByUser.has(row.actor_id)) {
      lastAccessByUser.set(row.actor_id, row.created_at);
    }
  }

  return memberships.map((m) => {
    const user = usersById.get(m.user_id);
    return {
      membershipId: m.id,
      userId: m.user_id,
      role: m.role,
      membershipStatus: m.status,
      fullName: user?.full_name ?? "Usuário",
      email: user?.email ?? "",
      oabNumber: user?.oab_number ?? null,
      isActive: user?.is_active ?? false,
      activeCases: activeCaseCountByUser.get(m.user_id) ?? 0,
      lastAccessAt: lastAccessByUser.get(m.user_id) ?? null,
    };
  });
}

export async function getOfficeUserLimit(tenantId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("office_profiles").select("user_limit").eq("tenant_id", tenantId).maybeSingle();
  return data?.user_limit ?? 10;
}
