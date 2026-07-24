import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StageAnalysis } from "@/lib/ai/stage-analysis";

function dedupeAppend(existing: unknown, additions: string[]): string[] {
  const base = Array.isArray(existing) ? (existing as string[]) : [];
  const merged = [...base];
  for (const item of additions) {
    if (item && !merged.includes(item)) merged.push(item);
  }
  return merged;
}

/**
 * Folds an approved stage's structured result into the case's persistent
 * dossiê (case_knowledge). Only ever called on approval — an AI draft the
 * lawyer hasn't accepted yet must never become "case memory" other
 * specialists build on (§46, §50-51).
 */
export async function mergeAnalysisIntoKnowledge(tenantId: string, caseId: string, analysis: StageAnalysis) {
  const supabase = await createClient();
  const { data: knowledge } = await supabase.from("case_knowledge").select("*").eq("case_id", caseId).maybeSingle();

  const update = {
    facts_approved: dedupeAppend(knowledge?.facts_approved, analysis.facts_considered),
    risks: dedupeAppend(knowledge?.risks, analysis.risks),
    contradictions: dedupeAppend(knowledge?.contradictions, analysis.contradictions),
    gaps: dedupeAppend(knowledge?.gaps, analysis.missing_information),
    strategies: dedupeAppend(knowledge?.strategies, analysis.recommendations),
    legal_sources: dedupeAppend(knowledge?.legal_sources, analysis.legal_basis),
    jurisprudence_sources: dedupeAppend(knowledge?.jurisprudence_sources, analysis.jurisprudence),
  };

  if (knowledge) {
    await supabase.from("case_knowledge").update(update).eq("case_id", caseId);
  } else {
    await supabase.from("case_knowledge").insert({ case_id: caseId, tenant_id: tenantId, ...update });
  }
}
