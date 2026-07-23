"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit/log";
import { officeCreateSchema, officeUpdateSchema } from "@/lib/validation/master";

export type MasterActionState = { error: string | null; success?: boolean };

async function requireMaster() {
  const user = await getSessionUser();
  if (!user || user.accountScope !== "master") {
    throw new Error("NOT_AUTHORIZED");
  }
  return user;
}

const INVITATION_TTL_DAYS = 7;

export async function createOfficeAction(
  _prevState: MasterActionState,
  formData: FormData,
): Promise<MasterActionState> {
  const master = await requireMaster();

  const parsed = officeCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const input = parsed.data;
  const admin = createAdminClient();

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({ status: input.status, ai_monthly_execution_limit: input.aiMonthlyLimit })
    .select("id")
    .single();

  if (tenantError || !tenant) {
    return { error: "Não foi possível criar o escritório. Tente novamente." };
  }

  const { error: profileError } = await admin.from("office_profiles").insert({
    tenant_id: tenant.id,
    name: input.officeName,
    legal_name: input.legalName || null,
    cnpj: input.cnpj || null,
    phone: input.phone || null,
    city: input.city || null,
    state: input.state || null,
    responsible_name: input.responsibleName,
    responsible_email: input.responsibleEmail,
    responsible_role: input.responsibleRole || null,
    responsible_phone: input.responsiblePhone || null,
    user_limit: input.userLimit,
  });

  if (profileError) {
    await admin.from("tenants").delete().eq("id", tenant.id);
    return { error: "Não foi possível salvar os dados do escritório." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: inviteResult, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    input.responsibleEmail,
    { redirectTo: `${appUrl}/auth/confirm?next=/redefinir-senha` },
  );

  if (inviteError || !inviteResult?.user) {
    await admin.from("tenants").delete().eq("id", tenant.id);
    return {
      error: `Não foi possível convidar o responsável (${inviteError?.message ?? "e-mail já utilizado"}).`,
    };
  }

  const newUserId = inviteResult.user.id;

  const { error: userError } = await admin.from("users").insert({
    id: newUserId,
    account_scope: "office",
    full_name: input.responsibleName,
    email: input.responsibleEmail,
    phone: input.responsiblePhone || null,
    is_active: true,
  });

  if (userError) {
    return {
      error:
        "Escritório criado, mas houve falha ao vincular o usuário responsável. Verifique em Auditoria e contate o suporte técnico.",
    };
  }

  await admin.from("memberships").insert({
    tenant_id: tenant.id,
    user_id: newUserId,
    role: "administrador",
    status: "active",
  });

  await admin.from("invitations").insert({
    tenant_id: tenant.id,
    email: input.responsibleEmail,
    role: "administrador",
    token_hash: randomUUID(),
    status: "pending",
    invited_by: master.id,
    expires_at: new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  });

  await logAuditEvent({
    tenantId: tenant.id,
    actorId: master.id,
    actorScope: "master",
    eventType: "office_created",
    entityType: "tenant",
    entityId: tenant.id,
    metadata: { officeName: input.officeName, responsibleEmail: input.responsibleEmail },
  });

  redirect(`/master/escritorios/${tenant.id}`);
}

export async function updateOfficeAction(
  tenantId: string,
  _prevState: MasterActionState,
  formData: FormData,
): Promise<MasterActionState> {
  const master = await requireMaster();

  const parsed = officeUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const input = parsed.data;
  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("office_profiles")
    .update({
      name: input.officeName,
      legal_name: input.legalName || null,
      cnpj: input.cnpj || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      website: input.website || null,
      city: input.city || null,
      state: input.state || null,
      cep: input.cep || null,
      address: input.address || null,
      responsible_name: input.responsibleName,
      responsible_email: input.responsibleEmail,
      responsible_role: input.responsibleRole || null,
      responsible_phone: input.responsiblePhone || null,
      user_limit: input.userLimit,
    })
    .eq("tenant_id", tenantId);

  if (profileError) {
    return { error: "Não foi possível salvar as alterações." };
  }

  await admin.from("tenants").update({ ai_monthly_execution_limit: input.aiMonthlyLimit }).eq("id", tenantId);

  await logAuditEvent({
    tenantId,
    actorId: master.id,
    actorScope: "master",
    eventType: "office_updated",
    entityType: "tenant",
    entityId: tenantId,
  });

  revalidatePath(`/master/escritorios/${tenantId}`);
  return { error: null, success: true };
}

export async function setOfficeStatusAction(tenantId: string, status: "active" | "blocked") {
  const master = await requireMaster();
  const admin = createAdminClient();

  const { error } = await admin.from("tenants").update({ status }).eq("id", tenantId);
  if (error) throw new Error("Não foi possível atualizar o status do escritório.");

  // Ban (or unban) every member's auth user. This is defense in depth on top
  // of the tenant.status check already enforced on every login attempt and
  // by the office session guard — banning also rejects token refreshes for
  // sessions that are already open.
  const { data: members } = await admin
    .from("memberships")
    .select("user_id")
    .eq("tenant_id", tenantId);

  for (const member of members ?? []) {
    await admin.auth.admin
      .updateUserById(member.user_id, { ban_duration: status === "blocked" ? "87600h" : "none" })
      .catch(() => undefined);
  }

  await logAuditEvent({
    tenantId,
    actorId: master.id,
    actorScope: "master",
    eventType: status === "blocked" ? "office_blocked" : "office_activated",
    entityType: "tenant",
    entityId: tenantId,
  });

  revalidatePath(`/master/escritorios/${tenantId}`);
  revalidatePath("/master/escritorios");
}

export async function resendInvitationAction(tenantId: string, email: string) {
  const master = await requireMaster();
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/confirm?next=/redefinir-senha`,
  });

  if (error) throw new Error("Não foi possível reenviar o convite.");

  await logAuditEvent({
    tenantId,
    actorId: master.id,
    actorScope: "master",
    eventType: "invitation_resent",
    entityType: "tenant",
    entityId: tenantId,
    metadata: { email },
  });

  revalidatePath(`/master/escritorios/${tenantId}`);
}
