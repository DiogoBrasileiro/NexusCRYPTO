"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { logAuditEvent } from "@/lib/audit/log";
import { areaCodeForLabel } from "@/lib/domain/legal-areas";
import type { ActionItemStatus } from "@/lib/types/database";

async function assertCaseInTenant(tenantId: string, caseId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("cases").select("id").eq("tenant_id", tenantId).eq("id", caseId).maybeSingle();
  if (!data) throw new Error("Caso não encontrado.");
}

export async function archiveCaseAction(caseId: string) {
  const context = await requireOfficeContext();
  await assertCaseInTenant(context.tenantId, caseId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("cases")
    .update({ status: "arquivado", archived_at: new Date().toISOString() })
    .eq("id", caseId)
    .eq("tenant_id", context.tenantId);
  if (error) throw new Error("Não foi possível arquivar o caso.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "case_archived",
    entityType: "case",
    entityId: caseId,
  });

  revalidatePath("/casos");
  revalidatePath(`/casos/${caseId}`);
}

export async function unarchiveCaseAction(caseId: string) {
  const context = await requireOfficeContext();
  await assertCaseInTenant(context.tenantId, caseId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("cases")
    .update({ status: "aguardando_analise", archived_at: null })
    .eq("id", caseId)
    .eq("tenant_id", context.tenantId);
  if (error) throw new Error("Não foi possível reativar o caso.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "case_unarchived",
    entityType: "case",
    entityId: caseId,
  });

  revalidatePath("/casos");
  revalidatePath(`/casos/${caseId}`);
}

export async function deleteCaseAction(caseId: string) {
  const context = await requireOfficeContext();
  await assertCaseInTenant(context.tenantId, caseId);
  const supabase = await createClient();

  const { count: docCount } = await supabase
    .from("case_documents")
    .select("id", { count: "exact", head: true })
    .eq("case_id", caseId);
  const { count: legalDocCount } = await supabase
    .from("legal_documents")
    .select("id", { count: "exact", head: true })
    .eq("case_id", caseId);

  if ((docCount && docCount > 0) || (legalDocCount && legalDocCount > 0)) {
    throw new Error("Este caso possui documentos ou peças produzidas. Arquive em vez de excluir.");
  }

  const { error } = await supabase.from("cases").delete().eq("id", caseId).eq("tenant_id", context.tenantId);
  if (error) throw new Error("Não foi possível excluir o caso.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "case_deleted",
    entityType: "case",
    entityId: caseId,
  });

  revalidatePath("/casos");
  redirect("/casos");
}

export async function changeResponsibleAction(caseId: string, newLawyerId: string) {
  const context = await requireOfficeContext();
  await assertCaseInTenant(context.tenantId, caseId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("cases")
    .update({ responsible_lawyer_id: newLawyerId })
    .eq("id", caseId)
    .eq("tenant_id", context.tenantId);
  if (error) throw new Error("Não foi possível alterar o responsável.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "case_responsible_changed",
    entityType: "case",
    entityId: caseId,
    metadata: { newLawyerId },
  });

  revalidatePath(`/casos/${caseId}`);
  revalidatePath("/casos");
}

export async function duplicateCaseAction(caseId: string) {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { data: original } = await supabase.from("cases").select("*").eq("tenant_id", context.tenantId).eq("id", caseId).maybeSingle();
  if (!original) throw new Error("Caso não encontrado.");

  const areaCode = areaCodeForLabel(original.legal_area);
  const year = new Date().getFullYear();
  const { data: code, error: codeError } = await supabase.rpc("next_case_code", {
    p_tenant_id: context.tenantId,
    p_area_code: areaCode,
    p_year: year,
  });
  if (codeError || !code) throw new Error("Não foi possível gerar o código do novo caso.");

  const { data: newCase, error } = await supabase
    .from("cases")
    .insert({
      tenant_id: context.tenantId,
      code,
      origin: original.origin,
      legal_area: original.legal_area,
      legal_subarea: original.legal_subarea,
      client_id: original.client_id,
      counterparty_name: original.counterparty_name,
      counterparty_document: original.counterparty_document,
      counterparty_address: original.counterparty_address,
      counterparty_qualification: original.counterparty_qualification,
      responsible_lawyer_id: original.responsible_lawyer_id,
      team: original.team,
      title: `${original.title} (cópia)`,
      short_summary: original.short_summary,
      full_description: original.full_description,
      client_objective: original.client_objective,
      expected_outcome: original.expected_outcome,
      urgency: original.urgency,
      depth: original.depth,
      execution_mode: original.execution_mode,
      status: "aguardando_analise",
      priority: original.priority,
      created_by: context.userId,
    })
    .select("id")
    .single();

  if (error || !newCase) throw new Error("Não foi possível duplicar o caso.");

  const { data: stageDefinitions } = await supabase
    .from("pipeline_stage_definitions")
    .select("id, stage_order")
    .eq("depth", original.depth)
    .order("stage_order", { ascending: true });

  await supabase.from("case_pipeline_configs").insert({
    case_id: newCase.id,
    tenant_id: context.tenantId,
    depth: original.depth,
    execution_mode: original.execution_mode,
    current_stage_order: 1,
  });

  if (stageDefinitions && stageDefinitions.length > 0) {
    await supabase.from("pipeline_stage_runs").insert(
      stageDefinitions.map((stage) => ({
        tenant_id: context.tenantId,
        case_id: newCase.id,
        stage_definition_id: stage.id,
        stage_order: stage.stage_order,
        status: stage.stage_order === 1 ? ("ready" as const) : ("locked" as const),
      })),
    );
  }

  await supabase.from("case_knowledge").insert({ case_id: newCase.id, tenant_id: context.tenantId });

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "case_duplicated",
    entityType: "case",
    entityId: newCase.id,
    metadata: { fromCaseId: caseId },
  });

  revalidatePath("/casos");
  redirect(`/casos/${newCase.id}`);
}

export type ActionItemFormState = { error: string | null };

export async function addActionItemAction(
  caseId: string,
  _prevState: ActionItemFormState,
  formData: FormData,
): Promise<ActionItemFormState> {
  const context = await requireOfficeContext();
  const description = String(formData.get("description") ?? "").trim();
  if (description.length < 3) return { error: "Descreva a providência." };

  const supabase = await createClient();
  const { error } = await supabase.from("case_action_items").insert({
    tenant_id: context.tenantId,
    case_id: caseId,
    description,
    priority: String(formData.get("priority") ?? "normal"),
    status: "pending",
    origin: "manual",
  });

  if (error) return { error: "Não foi possível adicionar a providência." };

  revalidatePath(`/casos/${caseId}`);
  return { error: null };
}

export async function updateActionItemStatusAction(caseId: string, itemId: string, status: ActionItemStatus) {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("case_action_items")
    .update({ status })
    .eq("id", itemId)
    .eq("tenant_id", context.tenantId);
  if (error) throw new Error("Não foi possível atualizar a providência.");

  revalidatePath(`/casos/${caseId}`);
}
