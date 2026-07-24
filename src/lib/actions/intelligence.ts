"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { getIntelligenceTask } from "@/lib/ai/intelligence-tasks";
import { AGENT_BASE_RULES } from "@/lib/ai/base-rules";
import { loadActiveAiCredential } from "@/lib/ai/credentials";
import { callAnthropicStructured } from "@/lib/ai/anthropic";
import { documentProductionSchema, DOC_PRODUCTION_INPUT_SCHEMA, DOC_PRODUCTION_TOOL_NAME } from "@/lib/ai/document-production";
import { buildCaseContextText } from "@/lib/ai/case-context";
import { textToTiptapDoc } from "@/lib/editor/text-to-tiptap-doc";
import { logAuditEvent } from "@/lib/audit/log";

export type IntelligenceActionState = { error: string | null };

export async function produceDocumentAction(
  _prevState: IntelligenceActionState,
  formData: FormData,
): Promise<IntelligenceActionState> {
  const context = await requireOfficeContext();

  const taskKey = String(formData.get("taskKey") ?? "");
  const task = getIntelligenceTask(taskKey);
  if (!task) return { error: "Tarefa inválida." };

  const caseId = String(formData.get("caseId") ?? "").trim() || null;
  const objective = String(formData.get("objective") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();

  if (objective.length < 5) return { error: "Descreva o objetivo deste trabalho." };

  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("ai_monthly_execution_limit").eq("id", context.tenantId).maybeSingle();
  const { data: usageCount } = await supabase.rpc("tenant_ai_executions_this_month", { p_tenant_id: context.tenantId });
  if (tenant && typeof usageCount === "number" && usageCount >= tenant.ai_monthly_execution_limit) {
    return { error: "O limite mensal de execuções de IA deste escritório foi atingido." };
  }

  const credentialResult = await loadActiveAiCredential();
  if (!credentialResult.ok) return { error: credentialResult.error };
  const credential = credentialResult.credential;
  if (credential.provider !== "anthropic") {
    return { error: `Provedor "${credential.provider}" ainda não é suportado.` };
  }

  let caseInfo: { id: string; client_id: string } | null = null;
  let contextText = "";
  if (caseId) {
    const { data: caseRow } = await supabase.from("cases").select("id, client_id").eq("id", caseId).eq("tenant_id", context.tenantId).maybeSingle();
    if (!caseRow) return { error: "Caso não encontrado." };
    caseInfo = caseRow;
    try {
      contextText = await buildCaseContextText(context.tenantId, caseId);
    } catch {
      return { error: "Não foi possível montar o contexto do caso." };
    }
  }

  const admin = createAdminClient();
  const { data: execution } = await admin
    .from("ai_executions")
    .insert({
      tenant_id: context.tenantId,
      user_id: context.userId,
      case_id: caseId,
      task_type: `inteligencia_${task.key}`,
      model: credential.model,
      status: "processing",
    })
    .select("id")
    .single();

  const systemPrompt = `${AGENT_BASE_RULES}\n\nSeu papel: Redator Jurídico do NEXO. ${task.mandate}\nVocê está produzindo um documento completo para revisão do advogado, não uma análise de etapa.`;

  const userPromptParts = [
    contextText || "Trabalho independente, sem caso vinculado.",
    `\nOBJETIVO DESTE TRABALHO: ${objective}`,
  ];
  if (instructions) userPromptParts.push(`INSTRUÇÕES ADICIONAIS: ${instructions}`);
  userPromptParts.push(`\nProduza o documento chamando a ferramenta ${DOC_PRODUCTION_TOOL_NAME}.`);

  const result = await callAnthropicStructured({
    apiKey: credential.apiKey,
    model: credential.model,
    maxTokens: credential.maxOutputTokens,
    timeoutSeconds: credential.timeoutSeconds,
    systemPrompt,
    userPrompt: userPromptParts.join("\n"),
    toolName: DOC_PRODUCTION_TOOL_NAME,
    toolDescription: "Envia o documento jurídico produzido.",
    inputSchema: DOC_PRODUCTION_INPUT_SCHEMA,
  });

  if (!result.ok) {
    if (execution?.id) {
      await admin.from("ai_executions").update({ status: "technical_error", error_message: result.error, finished_at: new Date().toISOString() }).eq("id", execution.id);
    }
    return { error: "Não foi possível concluir esta produção. A tentativa foi interrompida e nada foi perdido." };
  }

  const parsed = documentProductionSchema.safeParse(result.data);
  if (!parsed.success) {
    if (execution?.id) {
      await admin.from("ai_executions").update({ status: "technical_error", error_message: "Formato inesperado.", finished_at: new Date().toISOString() }).eq("id", execution.id);
    }
    return { error: "Não foi possível concluir esta produção. A tentativa foi interrompida e nada foi perdido." };
  }

  const tiptapDoc = textToTiptapDoc(parsed.data.document_text);

  const { data: legalDoc, error: docError } = await supabase
    .from("legal_documents")
    .insert({
      tenant_id: context.tenantId,
      case_id: caseId,
      client_id: caseInfo?.client_id ?? null,
      document_type: task.documentType,
      title: parsed.data.title || task.label,
      status: "draft",
      author_id: context.userId,
    })
    .select("id")
    .single();

  if (docError || !legalDoc) {
    if (execution?.id) {
      await admin.from("ai_executions").update({ status: "technical_error", error_message: "Falha ao salvar documento.", finished_at: new Date().toISOString() }).eq("id", execution.id);
    }
    return { error: "Não foi possível salvar o documento gerado." };
  }

  const { data: version } = await supabase
    .from("legal_document_versions")
    .insert({
      tenant_id: context.tenantId,
      legal_document_id: legalDoc.id,
      version_number: 1,
      content: tiptapDoc as unknown as Record<string, unknown>,
      author_id: context.userId,
    })
    .select("id")
    .single();

  if (version) {
    await supabase.from("legal_documents").update({ current_version_id: version.id }).eq("id", legalDoc.id);
  }

  if (execution?.id) {
    await admin.from("ai_executions").update({ status: "completed", finished_at: new Date().toISOString() }).eq("id", execution.id);
  }

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "legal_document_produced",
    entityType: "legal_document",
    entityId: legalDoc.id,
    metadata: { task: task.key, caseId },
  });

  redirect(`/documentos/${legalDoc.id}`);
}
