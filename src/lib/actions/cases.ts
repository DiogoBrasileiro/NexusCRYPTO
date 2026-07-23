"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { caseCreateSchema } from "@/lib/validation/cases";
import { areaCodeForLabel } from "@/lib/domain/legal-areas";
import { logAuditEvent } from "@/lib/audit/log";

export type CaseActionState = { error: string | null };

export async function createCaseAction(_prevState: CaseActionState, formData: FormData): Promise<CaseActionState> {
  const context = await requireOfficeContext();
  const parsed = caseCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const input = parsed.data;
  const supabase = await createClient();

  const areaCode = areaCodeForLabel(input.legalArea);
  const year = new Date().getFullYear();
  const { data: code, error: codeError } = await supabase.rpc("next_case_code", {
    p_tenant_id: context.tenantId,
    p_area_code: areaCode,
    p_year: year,
  });

  if (codeError || !code) {
    return { error: "Não foi possível gerar o código do caso. Tente novamente." };
  }

  const { data: newCase, error: caseError } = await supabase
    .from("cases")
    .insert({
      tenant_id: context.tenantId,
      code,
      origin: input.origin,
      legal_area: input.legalArea,
      legal_subarea: input.legalSubarea || null,
      client_id: input.clientId,
      counterparty_name: input.counterpartyName || null,
      counterparty_document: input.counterpartyDocument || null,
      counterparty_address: input.counterpartyAddress || null,
      counterparty_qualification: input.counterpartyQualification || null,
      responsible_lawyer_id: input.responsibleLawyerId,
      team: input.team || null,
      title: input.title,
      short_summary: input.shortSummary || null,
      full_description: input.fullDescription,
      client_objective: input.clientObjective || null,
      expected_outcome: input.expectedOutcome || null,
      urgency: input.urgency || null,
      notes: input.notes || null,
      process_number: input.processNumber || null,
      court: input.court || null,
      district: input.district || null,
      jurisdiction: input.jurisdiction || null,
      procedural_phase: input.proceduralPhase || null,
      case_value: Number.isFinite(input.caseValue) ? (input.caseValue as number) : null,
      depth: input.depth,
      execution_mode: input.executionMode,
      status: "aguardando_analise",
      priority: "normal",
      created_by: context.userId,
    })
    .select("id")
    .single();

  if (caseError || !newCase) {
    return { error: "Não foi possível criar o caso. Tente novamente." };
  }

  const caseId = newCase.id;

  const { data: stageDefinitions } = await supabase
    .from("pipeline_stage_definitions")
    .select("id, stage_order")
    .eq("depth", input.depth)
    .order("stage_order", { ascending: true });

  await supabase.from("case_pipeline_configs").insert({
    case_id: caseId,
    tenant_id: context.tenantId,
    depth: input.depth,
    execution_mode: input.executionMode,
    current_stage_order: 1,
  });

  if (stageDefinitions && stageDefinitions.length > 0) {
    const stageRuns = stageDefinitions.map((stage) => ({
      tenant_id: context.tenantId,
      case_id: caseId,
      stage_definition_id: stage.id,
      stage_order: stage.stage_order,
      status: stage.stage_order === 1 ? ("ready" as const) : ("locked" as const),
    }));
    await supabase.from("pipeline_stage_runs").insert(stageRuns);
  }

  await supabase.from("case_knowledge").insert({ case_id: caseId, tenant_id: context.tenantId });

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "case_created",
    entityType: "case",
    entityId: caseId,
    metadata: { code, origin: input.origin, depth: input.depth },
  });

  revalidatePath("/painel");
  revalidatePath("/casos");
  redirect(`/casos/${caseId}`);
}
