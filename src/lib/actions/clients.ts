"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { clientSchema } from "@/lib/validation/clients";
import { logAuditEvent } from "@/lib/audit/log";
import type { ClientRow } from "@/lib/types/database";

export type ClientActionState = { error: string | null; success?: boolean };

function buildClientPayload(
  input: ReturnType<typeof clientSchema.parse>,
): Omit<Partial<ClientRow>, "kind"> & Pick<ClientRow, "kind"> {
  if (input.kind === "pessoa_fisica") {
    return {
      kind: "pessoa_fisica",
      full_name: input.fullName,
      cpf: input.cpf || null,
      nationality: input.nationality || null,
      marital_status: input.maritalStatus || null,
      occupation: input.occupation || null,
      email: input.email || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      address: input.address || null,
      company_name: null,
      trade_name: null,
      cnpj: null,
      representative_name: null,
    };
  }

  return {
    kind: "pessoa_juridica",
    company_name: input.companyName,
    trade_name: input.tradeName || null,
    cnpj: input.cnpj || null,
    representative_name: input.representativeName || null,
    email: input.email || null,
    phone: input.phone || null,
    whatsapp: input.whatsapp || null,
    address: input.address || null,
    full_name: null,
    cpf: null,
    nationality: null,
    marital_status: null,
    occupation: null,
  };
}

function parseClientForm(formData: FormData) {
  const raw = Object.fromEntries(formData);
  return clientSchema.safeParse(raw);
}

export async function createClientAction(
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const context = await requireOfficeContext();
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const payload = buildClientPayload(parsed.data);
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...payload, tenant_id: context.tenantId, created_by: context.userId })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível salvar o cliente." };
  }

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "client_created",
    entityType: "client",
    entityId: data.id,
  });

  redirect(`/clientes/${data.id}`);
}

export async function updateClientAction(
  clientId: string,
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const context = await requireOfficeContext();
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const payload = buildClientPayload(parsed.data);
  const { error } = await supabase
    .from("clients")
    .update(payload)
    .eq("id", clientId)
    .eq("tenant_id", context.tenantId);

  if (error) return { error: "Não foi possível salvar as alterações." };

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "client_updated",
    entityType: "client",
    entityId: clientId,
  });

  revalidatePath(`/clientes/${clientId}`);
  return { error: null, success: true };
}

export async function archiveClientAction(clientId: string) {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("clients")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", clientId)
    .eq("tenant_id", context.tenantId);

  if (error) throw new Error("Não foi possível arquivar o cliente.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "client_archived",
    entityType: "client",
    entityId: clientId,
  });

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteClientAction(clientId: string) {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { count } = await supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.tenantId)
    .eq("client_id", clientId);

  if (count && count > 0) {
    throw new Error("Este cliente possui casos vinculados. Arquive em vez de excluir.");
  }

  const { error } = await supabase.from("clients").delete().eq("id", clientId).eq("tenant_id", context.tenantId);
  if (error) throw new Error("Não foi possível excluir o cliente.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "client_deleted",
    entityType: "client",
    entityId: clientId,
  });

  revalidatePath("/clientes");
  redirect("/clientes");
}
