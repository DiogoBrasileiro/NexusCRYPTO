"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOfficeContext, canManageOffice } from "@/lib/auth/office-context";
import { getOfficeUserLimit } from "@/lib/data/team";
import { logAuditEvent } from "@/lib/audit/log";
import type { MembershipRole } from "@/lib/types/database";

export type TeamActionState = { error: string | null; success?: boolean };

const ROLES: MembershipRole[] = [
  "administrador",
  "socio",
  "advogado",
  "revisor",
  "assistente",
  "estagiario",
  "somente_leitura",
];

async function requireManager() {
  const context = await requireOfficeContext();
  if (!canManageOffice(context.role)) {
    throw new Error("Você não tem permissão para gerenciar a equipe.");
  }
  return context;
}

export async function inviteMemberAction(_prevState: TeamActionState, formData: FormData): Promise<TeamActionState> {
  const context = await requireManager();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "advogado");
  const role = ROLES.includes(roleRaw as MembershipRole) ? (roleRaw as MembershipRole) : "advogado";
  const oabNumber = String(formData.get("oabNumber") ?? "").trim();

  if (fullName.length < 2) return { error: "Informe o nome do novo membro." };
  if (!email.includes("@")) return { error: "Informe um e-mail válido." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenantId)
    .eq("status", "active");

  const limit = await getOfficeUserLimit(context.tenantId);
  if (count !== null && count >= limit) {
    return { error: `Limite de ${limit} usuários atingido para este escritório.` };
  }

  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data: inviteResult, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/confirm?next=/redefinir-senha`,
  });

  if (inviteError || !inviteResult?.user) {
    return { error: `Não foi possível convidar este usuário (${inviteError?.message ?? "e-mail já utilizado"}).` };
  }

  const newUserId = inviteResult.user.id;

  const { error: userError } = await admin.from("users").insert({
    id: newUserId,
    account_scope: "office",
    full_name: fullName,
    email,
    oab_number: oabNumber || null,
    is_active: true,
  });
  if (userError) {
    return { error: "Convite enviado, mas houve falha ao registrar o perfil. Contate o suporte técnico." };
  }

  await admin.from("memberships").insert({
    tenant_id: context.tenantId,
    user_id: newUserId,
    role,
    status: "active",
  });

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "member_invited",
    entityType: "user",
    entityId: newUserId,
    metadata: { email, role },
  });

  revalidatePath("/equipe");
  return { error: null, success: true };
}

export async function updateMemberRoleAction(membershipId: string, role: MembershipRole) {
  const context = await requireManager();
  const supabase = await createClient();

  const { error } = await supabase
    .from("memberships")
    .update({ role })
    .eq("id", membershipId)
    .eq("tenant_id", context.tenantId);
  if (error) throw new Error("Não foi possível alterar o perfil.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "member_role_changed",
    entityType: "membership",
    entityId: membershipId,
    metadata: { role },
  });

  revalidatePath("/equipe");
}

export async function toggleMemberActiveAction(userId: string, isActive: boolean) {
  const context = await requireManager();
  if (userId === context.userId) throw new Error("Você não pode desativar a própria conta.");

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ is_active: isActive }).eq("id", userId);
  if (error) throw new Error("Não foi possível atualizar o status do usuário.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: isActive ? "member_activated" : "member_deactivated",
    entityType: "user",
    entityId: userId,
  });

  revalidatePath("/equipe");
}

export async function removeMemberAction(membershipId: string, userId: string) {
  const context = await requireManager();
  if (userId === context.userId) throw new Error("Você não pode remover a própria conta.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("memberships")
    .update({ status: "removed" })
    .eq("id", membershipId)
    .eq("tenant_id", context.tenantId);
  if (error) throw new Error("Não foi possível remover este membro.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "member_removed",
    entityType: "membership",
    entityId: membershipId,
  });

  revalidatePath("/equipe");
}

export async function resendMemberInviteAction(email: string) {
  const context = await requireManager();
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/confirm?next=/redefinir-senha`,
  });
  if (error) throw new Error("Não foi possível reenviar o convite.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "member_invite_resent",
    metadata: { email },
  });
}
