import "server-only";
import { createClient } from "@/lib/supabase/server";
import { originLabel } from "@/lib/domain/case-origins";
import type { StageAnalysis } from "@/lib/ai/stage-analysis";

/**
 * Assembles the case memory the specialist reads before producing an
 * analysis: classification, description, documents on file, the accumulated
 * dossiê (case_knowledge), and every prior approved stage's output — so
 * each specialist builds on the last instead of restarting from zero (§43,
 * §51, §52).
 */
export async function buildCaseContextText(tenantId: string, caseId: string): Promise<string> {
  const supabase = await createClient();

  const { data: caseRow } = await supabase.from("cases").select("*").eq("tenant_id", tenantId).eq("id", caseId).maybeSingle();
  if (!caseRow) throw new Error("Caso não encontrado.");

  const { data: client } = await supabase
    .from("clients")
    .select("full_name, company_name, kind")
    .eq("id", caseRow.client_id)
    .maybeSingle();

  const { data: documents } = await supabase
    .from("case_documents")
    .select("name, document_type, processing_status, extracted_text")
    .eq("case_id", caseId);

  const { data: knowledge } = await supabase.from("case_knowledge").select("*").eq("case_id", caseId).maybeSingle();

  const { data: priorRuns } = await supabase
    .from("pipeline_stage_runs")
    .select("stage_order, status, current_version_id")
    .eq("case_id", caseId)
    .in("status", ["approved", "approved_with_notes"])
    .order("stage_order", { ascending: true });

  const priorVersionIds = (priorRuns ?? []).map((r) => r.current_version_id).filter((id): id is string => Boolean(id));
  const { data: priorVersions } =
    priorVersionIds.length > 0
      ? await supabase.from("stage_versions").select("id, content").in("id", priorVersionIds)
      : { data: [] as { id: string; content: unknown }[] };
  const priorVersionById = new Map((priorVersions ?? []).map((v) => [v.id, v.content as StageAnalysis]));

  const lines: string[] = [];

  lines.push(`CASO ${caseRow.code} — ${caseRow.title}`);
  lines.push(`Origem: ${originLabel(caseRow.origin)}`);
  lines.push(`Área: ${caseRow.legal_area}${caseRow.legal_subarea ? ` / ${caseRow.legal_subarea}` : ""}`);
  lines.push(`Cliente: ${client?.full_name ?? client?.company_name ?? "não identificado"} (${client?.kind ?? "?"})`);
  if (caseRow.counterparty_name) lines.push(`Parte contrária: ${caseRow.counterparty_name}`);
  lines.push(`Descrição completa fornecida pelo advogado: ${caseRow.full_description}`);
  if (caseRow.client_objective) lines.push(`Objetivo do cliente: ${caseRow.client_objective}`);
  if (caseRow.expected_outcome) lines.push(`Resultado esperado: ${caseRow.expected_outcome}`);
  if (caseRow.urgency) lines.push(`Urgência informada: ${caseRow.urgency}`);
  if (caseRow.process_number) lines.push(`Processo: ${caseRow.process_number} — ${caseRow.court ?? ""} ${caseRow.district ?? ""}`.trim());
  if (caseRow.case_value) lines.push(`Valor da causa: ${caseRow.case_value}`);

  lines.push("");
  lines.push("DOCUMENTOS ANEXADOS AO CASO:");
  if (!documents || documents.length === 0) {
    lines.push("Nenhum documento anexado ainda.");
  } else {
    for (const doc of documents) {
      const extractionNote = doc.extracted_text
        ? "texto extraído disponível abaixo"
        : "sem texto extraído nesta versão do sistema — trate apenas pelo nome/tipo informado, não presuma o conteúdo";
      lines.push(`- ${doc.name} (${doc.document_type}, ${extractionNote})`);
      if (doc.extracted_text) {
        lines.push(`  Trecho: ${doc.extracted_text.slice(0, 1500)}`);
      }
    }
  }

  if (knowledge) {
    const nonEmpty = (arr: unknown): arr is unknown[] => Array.isArray(arr) && arr.length > 0;
    lines.push("");
    lines.push("DOSSIÊ ACUMULADO DO CASO (memória entre etapas):");
    const fields: [string, unknown][] = [
      ["Fatos aprovados", knowledge.facts_approved],
      ["Fatos contestados", knowledge.facts_contested],
      ["Riscos já identificados", knowledge.risks],
      ["Contradições já identificadas", knowledge.contradictions],
      ["Lacunas já identificadas", knowledge.gaps],
      ["Decisões do advogado registradas", knowledge.lawyer_decisions],
    ];
    for (const [label, value] of fields) {
      if (nonEmpty(value)) {
        lines.push(`- ${label}: ${JSON.stringify(value)}`);
      }
    }
  }

  if (priorRuns && priorRuns.length > 0) {
    lines.push("");
    lines.push("TRABALHO JÁ APROVADO PELO ADVOGADO NAS ETAPAS ANTERIORES (respeite estas conclusões):");
    for (const run of priorRuns) {
      const version = run.current_version_id ? priorVersionById.get(run.current_version_id) : undefined;
      if (!version) continue;
      lines.push(`Etapa ${run.stage_order} — resumo: ${version.stage_summary}`);
      if (version.next_stage_guidance) {
        lines.push(`  Orientação deixada para a próxima etapa: ${version.next_stage_guidance}`);
      }
    }
  }

  return lines.join("\n");
}
