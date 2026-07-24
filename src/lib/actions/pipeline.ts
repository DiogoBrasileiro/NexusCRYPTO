"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { executeStage } from "@/lib/ai/orchestrator";
import { mergeAnalysisIntoKnowledge } from "@/lib/ai/case-knowledge";
import { logAuditEvent } from "@/lib/audit/log";
import { stageAnalysisSchema } from "@/lib/ai/stage-analysis";

export type PipelineActionResult = { ok: true } | { ok: false; error: string };

export async function runStageAction(caseId: string, stageRunId: string): Promise<PipelineActionResult> {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { data: caseRow } = await supabase.from("cases").select("status").eq("id", caseId).eq("tenant_id", context.tenantId).maybeSingle();
  if (!caseRow) return { ok: false, error: "Caso não encontrado." };

  if (caseRow.status === "aguardando_analise") {
    await supabase.from("cases").update({ status: "em_producao" }).eq("id", caseId);
  }

  const result = await executeStage({ tenantId: context.tenantId, caseId, stageRunId, userId: context.userId });

  if (result.ok) {
    await supabase.from("cases").update({ status: "aguardando_decisao" }).eq("id", caseId);
    await logAuditEvent({
      tenantId: context.tenantId,
      actorId: context.userId,
      actorScope: "office",
      eventType: "stage_executed",
      entityType: "pipeline_stage_run",
      entityId: stageRunId,
    });
  }

  revalidatePath(`/casos/${caseId}`);
  revalidatePath("/painel");
  return result;
}

export async function approveStageAction(
  caseId: string,
  stageRunId: string,
  withNotes: boolean,
): Promise<PipelineActionResult> {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { data: stageRun } = await supabase
    .from("pipeline_stage_runs")
    .select("id, status, stage_order, current_version_id")
    .eq("id", stageRunId)
    .eq("tenant_id", context.tenantId)
    .eq("case_id", caseId)
    .maybeSingle();

  if (!stageRun || !["awaiting_review", "approved_with_notes"].includes(stageRun.status)) {
    return { ok: false, error: "Esta etapa não está aguardando aprovação." };
  }
  if (!stageRun.current_version_id) return { ok: false, error: "Nenhuma versão para aprovar." };

  const { data: version } = await supabase
    .from("stage_versions")
    .select("id, content")
    .eq("id", stageRun.current_version_id)
    .maybeSingle();
  if (!version) return { ok: false, error: "Versão não encontrada." };

  const parsed = stageAnalysisSchema.safeParse(version.content);
  if (!parsed.success) return { ok: false, error: "Conteúdo da versão em formato inesperado." };

  await supabase.from("stage_versions").update({ status: "approved" }).eq("id", version.id);

  const newStatus = withNotes ? "approved_with_notes" : "approved";
  await supabase.from("pipeline_stage_runs").update({ status: newStatus }).eq("id", stageRunId);

  await mergeAnalysisIntoKnowledge(context.tenantId, caseId, parsed.data);

  const { data: nextStage } = await supabase
    .from("pipeline_stage_runs")
    .select("id, status")
    .eq("case_id", caseId)
    .eq("stage_order", stageRun.stage_order + 1)
    .maybeSingle();

  if (nextStage) {
    if (nextStage.status === "locked") {
      await supabase.from("pipeline_stage_runs").update({ status: "ready" }).eq("id", nextStage.id);
    }
    await supabase
      .from("case_pipeline_configs")
      .update({ current_stage_order: stageRun.stage_order + 1 })
      .eq("case_id", caseId);
    await supabase.from("cases").update({ status: "em_producao" }).eq("id", caseId);
  } else {
    await supabase.from("cases").update({ status: "pronto_protocolo" }).eq("id", caseId);
  }

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "stage_approved",
    entityType: "pipeline_stage_run",
    entityId: stageRunId,
    metadata: { withNotes },
  });

  revalidatePath(`/casos/${caseId}`);
  revalidatePath("/painel");
  return { ok: true };
}

export async function requestStageChangesAction(
  caseId: string,
  stageRunId: string,
  note: string,
): Promise<PipelineActionResult> {
  const context = await requireOfficeContext();
  if (note.trim().length < 3) return { ok: false, error: "Descreva o que precisa ser corrigido." };

  const supabase = await createClient();
  const { data: stageRun } = await supabase
    .from("pipeline_stage_runs")
    .select("id, status")
    .eq("id", stageRunId)
    .eq("tenant_id", context.tenantId)
    .eq("case_id", caseId)
    .maybeSingle();

  if (!stageRun || stageRun.status !== "awaiting_review") {
    return { ok: false, error: "Esta etapa não está aguardando revisão." };
  }

  await supabase.from("pipeline_stage_runs").update({ status: "changes_requested" }).eq("id", stageRunId);

  await supabase.from("stage_interactions").insert({
    tenant_id: context.tenantId,
    stage_run_id: stageRunId,
    author_id: context.userId,
    interaction_type: "correcao_de_fato",
    message: note,
    lawyer_decision: "solicitar_correcao",
  });

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "stage_changes_requested",
    entityType: "pipeline_stage_run",
    entityId: stageRunId,
  });

  revalidatePath(`/casos/${caseId}`);
  return { ok: true };
}
