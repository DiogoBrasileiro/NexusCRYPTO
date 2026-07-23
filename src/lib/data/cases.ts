import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listActiveMembers(tenantId: string) {
  const supabase = await createClient();
  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("user_id, role")
    .eq("tenant_id", tenantId)
    .eq("status", "active");

  if (error) throw new Error(`Falha ao carregar equipe: ${error.message}`);

  const userIds = (memberships ?? []).map((m) => m.user_id);
  if (userIds.length === 0) return [];

  const { data: users } = await supabase.from("users").select("id, full_name").in("id", userIds).eq("is_active", true);

  return (users ?? []).map((u) => ({ id: u.id, fullName: u.full_name }));
}
