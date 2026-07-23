import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CaseStatus } from "@/lib/types/database";

export type CaseSummary = {
  id: string;
  code: string;
  title: string;
  status: CaseStatus;
  updated_at: string;
};

async function listCasesByStatus(tenantId: string, status: CaseStatus, limit = 8): Promise<CaseSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("id, code, title, status, updated_at")
    .eq("tenant_id", tenantId)
    .eq("status", status)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Falha ao carregar casos: ${error.message}`);
  return data ?? [];
}

export async function getMesaJuridicaData(tenantId: string) {
  const [aguardandoAnalise, emProducao, aguardandoDecisao, prontosProtocolo] = await Promise.all([
    listCasesByStatus(tenantId, "aguardando_analise"),
    listCasesByStatus(tenantId, "em_producao"),
    listCasesByStatus(tenantId, "aguardando_decisao"),
    listCasesByStatus(tenantId, "pronto_protocolo"),
  ]);

  const supabase = await createClient();

  const { data: failures } = await supabase
    .from("ai_executions")
    .select("id, task_type, error_message, case_id, created_at")
    .eq("tenant_id", tenantId)
    .eq("status", "technical_error")
    .order("created_at", { ascending: false })
    .limit(5);

  const caseIds = (failures ?? []).map((f) => f.case_id).filter((id): id is string => Boolean(id));
  const { data: failureCases } =
    caseIds.length > 0
      ? await supabase.from("cases").select("id, code").in("id", caseIds)
      : { data: [] as { id: string; code: string }[] };
  const caseCodeById = new Map((failureCases ?? []).map((c) => [c.id, c.code]));

  const { data: recentActivity } = await supabase
    .from("audit_logs")
    .select("id, event_type, created_at, entity_type")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(8);

  return {
    quadrants: {
      aguardandoAnalise,
      emProducao,
      aguardandoDecisao,
      prontosProtocolo,
    },
    alerts: (failures ?? []).map((f) => ({
      id: f.id,
      taskType: f.task_type,
      caseCode: f.case_id ? (caseCodeById.get(f.case_id) ?? null) : null,
      createdAt: f.created_at,
    })),
    recentActivity: recentActivity ?? [],
  };
}
