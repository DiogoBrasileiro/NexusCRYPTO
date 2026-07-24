import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadActiveAiCredential } from "@/lib/ai/credentials";
import { callAnthropicStructured } from "@/lib/ai/anthropic";
import { buildCaseContextText } from "@/lib/ai/case-context";
import { getSpecialist } from "@/lib/ai/specialists";
import { AGENT_BASE_RULES } from "@/lib/ai/base-rules";
import { stageAnalysisSchema, STAGE_ANALYSIS_INPUT_SCHEMA, STAGE_ANALYSIS_TOOL_NAME } from "@/lib/ai/stage-analysis";

export type ExecuteStageResult = { ok: true } | { ok: false; error: string };

/**
 * NEXO LEGAL ORCHESTRATOR (§52), MVP scope: runs exactly one stage of one
 * case's pipeline, supervised mode. It does not produce the analysis
 * itself — it resolves context/credentials, delegates to the specialist
 * prompt for this stage_key, validates the structured result, and persists
 * it as a new stage_versions row awaiting the lawyer's review.
 */
export async function executeStage(params: {
  tenantId: string;
  caseId: string;
  stageRunId: string;
  userId: string;
}): Promise<ExecuteStageResult> {
  const { tenantId, caseId, stageRunId, userId } = params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: stageRun } = await supabase
    .from("pipeline_stage_runs")
    .select("id, stage_order, status, stage_definition_id, case_id")
    .eq("id", stageRunId)
    .eq("tenant_id", tenantId)
    .eq("case_id", caseId)
    .maybeSingle();

  if (!stageRun) return { ok: false, error: "Etapa não encontrada." };
  if (!["ready", "changes_requested", "technical_error", "outdated"].includes(stageRun.status)) {
    return { ok: false, error: "Esta etapa não está liberada para execução." };
  }

  const { data: stageDef } = await supabase
    .from("pipeline_stage_definitions")
    .select("stage_key, name, specialist")
    .eq("id", stageRun.stage_definition_id)
    .maybeSingle();
  if (!stageDef) return { ok: false, error: "Definição da etapa não encontrada." };

  const { data: tenant } = await supabase.from("tenants").select("ai_monthly_execution_limit").eq("id", tenantId).maybeSingle();
  const { data: usageCount } = await supabase.rpc("tenant_ai_executions_this_month", { p_tenant_id: tenantId });
  if (tenant && typeof usageCount === "number" && usageCount >= tenant.ai_monthly_execution_limit) {
    return {
      ok: false,
      error: "O limite mensal de execuções de IA deste escritório foi atingido. Novas execuções ficam bloqueadas até o próximo mês.",
    };
  }

  const credentialResult = await loadActiveAiCredential();
  if (!credentialResult.ok) return { ok: false, error: credentialResult.error };
  const credential = credentialResult.credential;

  if (credential.provider !== "anthropic") {
    return { ok: false, error: `Provedor "${credential.provider}" ainda não é suportado pela execução de etapas.` };
  }

  const { data: execution } = await admin
    .from("ai_executions")
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      case_id: caseId,
      stage_run_id: stageRunId,
      task_type: stageDef.stage_key,
      model: credential.model,
      status: "processing",
    })
    .select("id")
    .single();

  await supabase
    .from("pipeline_stage_runs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", stageRunId);

  let contextText: string;
  try {
    contextText = await buildCaseContextText(tenantId, caseId);
  } catch (err) {
    await failExecution(admin, execution?.id, stageRunId, err instanceof Error ? err.message : "Falha ao montar contexto.");
    return { ok: false, error: "Não foi possível montar o contexto do caso." };
  }

  const specialist = getSpecialist(stageDef.stage_key);
  const systemPrompt = `${AGENT_BASE_RULES}\n\nSeu papel nesta etapa: ${specialist.title}.\n${specialist.mandate}`;
  const userPrompt = `${contextText}\n\nProduza sua análise para a etapa atual ("${stageDef.name}") chamando a ferramenta ${STAGE_ANALYSIS_TOOL_NAME}.`;

  const result = await callAnthropicStructured({
    apiKey: credential.apiKey,
    model: credential.model,
    maxTokens: credential.maxOutputTokens,
    timeoutSeconds: credential.timeoutSeconds,
    systemPrompt,
    userPrompt,
    toolName: STAGE_ANALYSIS_TOOL_NAME,
    toolDescription: "Envia o resultado estruturado desta etapa da linha de produção jurídica.",
    inputSchema: STAGE_ANALYSIS_INPUT_SCHEMA,
  });

  if (!result.ok) {
    await failExecution(admin, execution?.id, stageRunId, result.error);
    return { ok: false, error: "Não foi possível concluir esta etapa. A tentativa foi interrompida e nenhum conteúdo anterior foi perdido." };
  }

  const parsed = stageAnalysisSchema.safeParse(result.data);
  if (!parsed.success) {
    await failExecution(admin, execution?.id, stageRunId, "Resposta do modelo fora do formato esperado.");
    return { ok: false, error: "Não foi possível concluir esta etapa. A tentativa foi interrompida e nenhum conteúdo anterior foi perdido." };
  }

  const { count: existingVersions } = await supabase
    .from("stage_versions")
    .select("id", { count: "exact", head: true })
    .eq("stage_run_id", stageRunId);

  const { data: newVersion, error: versionError } = await supabase
    .from("stage_versions")
    .insert({
      tenant_id: tenantId,
      stage_run_id: stageRunId,
      version_number: (existingVersions ?? 0) + 1,
      author_type: "ai",
      origin: "ai_execution",
      status: "draft",
      content: parsed.data,
    })
    .select("id")
    .single();

  if (versionError || !newVersion) {
    await failExecution(admin, execution?.id, stageRunId, "Falha ao salvar a versão gerada.");
    return { ok: false, error: "Não foi possível salvar o resultado desta etapa." };
  }

  await supabase
    .from("pipeline_stage_runs")
    .update({
      status: "awaiting_review",
      current_version_id: newVersion.id,
      guidance_for_next_stage: parsed.data.next_stage_guidance || null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", stageRunId);

  if (execution?.id) {
    await admin.from("ai_executions").update({ status: "completed", finished_at: new Date().toISOString() }).eq("id", execution.id);
  }

  return { ok: true };
}

async function failExecution(
  admin: ReturnType<typeof createAdminClient>,
  executionId: string | undefined,
  stageRunId: string,
  message: string,
) {
  if (executionId) {
    await admin
      .from("ai_executions")
      .update({ status: "technical_error", error_message: message, finished_at: new Date().toISOString() })
      .eq("id", executionId);
  }
  await admin.from("pipeline_stage_runs").update({ status: "technical_error" }).eq("id", stageRunId);
}
