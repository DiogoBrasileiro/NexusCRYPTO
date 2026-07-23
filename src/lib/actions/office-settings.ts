"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOfficeContext, canManageOffice } from "@/lib/auth/office-context";
import { officeProfileSchema, letterheadSchema } from "@/lib/validation/office-settings";
import { logAuditEvent } from "@/lib/audit/log";

export type SettingsActionState = { error: string | null; success?: boolean };

export async function updateOfficeProfileAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireOfficeContext();
  if (!canManageOffice(context.role)) return { error: "Você não tem permissão para editar os dados do escritório." };

  const parsed = officeProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const input = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("office_profiles")
    .update({
      name: input.name,
      legal_name: input.legalName || null,
      cnpj: input.cnpj || null,
      responsible_name: input.responsibleName,
      oab_number: input.oabNumber || null,
      email: input.email || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      cep: input.cep || null,
      website: input.website || null,
    })
    .eq("tenant_id", context.tenantId);

  if (error) return { error: "Não foi possível salvar os dados do escritório." };

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "office_profile_updated",
    entityType: "office_profiles",
    entityId: context.tenantId,
  });

  revalidatePath("/configuracoes");
  return { error: null, success: true };
}

export async function uploadOfficeLogoAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireOfficeContext();
  if (!canManageOffice(context.role)) return { error: "Você não tem permissão para editar o logo." };

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) return { error: "Selecione uma imagem." };
  if (!file.type.startsWith("image/")) return { error: "Envie um arquivo de imagem." };
  if (file.size > 3 * 1024 * 1024) return { error: "Imagem maior que 3 MB." };

  const supabase = await createClient();
  const path = `${context.tenantId}/logo-${Date.now()}.${file.name.split(".").pop() ?? "png"}`;

  const { error: uploadError } = await supabase.storage.from("office-assets").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) return { error: "Não foi possível enviar a imagem." };

  const { error } = await supabase.from("office_profiles").update({ logo_url: path }).eq("tenant_id", context.tenantId);
  if (error) return { error: "Não foi possível salvar o logo." };

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "office_logo_updated",
  });

  revalidatePath("/configuracoes");
  return { error: null, success: true };
}

export async function updateLetterheadAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireOfficeContext();
  if (!canManageOffice(context.role)) return { error: "Você não tem permissão para editar o timbrado." };

  const parsed = letterheadSchema.safeParse({
    ...Object.fromEntries(formData),
    useLetterhead: formData.get("useLetterhead") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const input = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("letterhead_settings").upsert({
    tenant_id: context.tenantId,
    use_letterhead: input.useLetterhead,
    office_name: input.officeName || null,
    legal_name: input.legalName || null,
    cnpj: input.cnpj || null,
    lawyer_name: input.lawyerName || null,
    oab_number: input.oabNumber || null,
    address: input.address || null,
    phone: input.phone || null,
    email: input.email || null,
    website: input.website || null,
    header_text: input.headerText || null,
    footer_text: input.footerText || null,
    brand_color: input.brandColor || "#0b0b0b",
  });

  if (error) return { error: "Não foi possível salvar o timbrado." };

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "letterhead_updated",
  });

  revalidatePath("/configuracoes");
  return { error: null, success: true };
}

export async function updateTimezoneAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireOfficeContext();
  const timezone = String(formData.get("timezone") ?? "America/Sao_Paulo");

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ timezone }).eq("id", context.userId);
  if (error) return { error: "Não foi possível salvar a preferência." };

  revalidatePath("/configuracoes");
  return { error: null, success: true };
}
