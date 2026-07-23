import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listOffices() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("master_list_offices");
  if (error) throw new Error(`Falha ao carregar escritórios: ${error.message}`);
  return data ?? [];
}

export async function getOverviewStats() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("master_overview_stats");
  if (error) throw new Error(`Falha ao carregar visão geral: ${error.message}`);
  return (
    data?.[0] ?? {
      active_offices: 0,
      blocked_offices: 0,
      total_users: 0,
      total_clients: 0,
      total_cases: 0,
      executions_this_month: 0,
      ai_failures_this_month: 0,
    }
  );
}

export async function getRecentAiFailures(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("master_recent_ai_failures", { p_limit: limit });
  if (error) throw new Error(`Falha ao carregar falhas de IA: ${error.message}`);
  return data ?? [];
}

export async function getOfficeDetail(tenantId: string) {
  const supabase = await createClient();

  const [{ data: tenant }, { data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle(),
    supabase.from("office_profiles").select("*").eq("tenant_id", tenantId).maybeSingle(),
    supabase
      .from("memberships")
      .select("id, user_id, role, status, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true }),
  ]);

  if (!tenant || !profile) return null;

  const userIds = (memberships ?? []).map((m) => m.user_id);
  const { data: users } =
    userIds.length > 0
      ? await supabase.from("users").select("id, full_name, email, is_active").in("id", userIds)
      : { data: [] };

  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, email, role, status, expires_at, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  const { data: recentAudit } = await supabase
    .from("audit_logs")
    .select("id, event_type, metadata, created_at, actor_id")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(20);

  const usersById = new Map((users ?? []).map((u) => [u.id, u]));

  return {
    tenant,
    profile,
    members: (memberships ?? []).map((m) => ({ ...m, user: usersById.get(m.user_id) ?? null })),
    invitations: invitations ?? [],
    recentAudit: recentAudit ?? [],
  };
}
