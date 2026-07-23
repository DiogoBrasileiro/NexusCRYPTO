import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CaseStatus } from "@/lib/types/database";

const CASE_STATUSES: CaseStatus[] = [
  "aguardando_analise",
  "em_producao",
  "aguardando_decisao",
  "pronto_protocolo",
  "concluido",
  "arquivado",
];

export async function listActiveMembers(tenantId: string) {
  const supabase = await createClient();
  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("user_id, role")
    .eq("tenant_id", tenantId)
    .eq("status", "active");

  if (error) throw new Error(`Falha ao carregar equipe: ${error.message}`);

  const userIds = (memberships ?? []).map((m) => m.user_id);
  if (userIds.length === 0) return [];

  const { data: users } = await supabase.from("users").select("id, full_name").in("id", userIds).eq("is_active", true);

  return (users ?? []).map((u) => ({ id: u.id, fullName: u.full_name }));
}

export type CaseListFilters = { status?: string; search?: string };

export async function listCases(tenantId: string, filters: CaseListFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("cases")
    .select("id, code, title, legal_area, status, depth, client_id, responsible_lawyer_id, updated_at")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false });

  if (filters.status === "arquivados") {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
    if (filters.status && filters.status !== "todos" && CASE_STATUSES.includes(filters.status as CaseStatus)) {
      query = query.eq("status", filters.status as CaseStatus);
    }
  }

  const { data: cases, error } = await query;
  if (error) throw new Error(`Falha ao carregar casos: ${error.message}`);

  const clientIds = Array.from(new Set((cases ?? []).map((c) => c.client_id)));
  const lawyerIds = Array.from(new Set((cases ?? []).map((c) => c.responsible_lawyer_id)));

  const [{ data: clients }, { data: lawyers }] = await Promise.all([
    clientIds.length > 0
      ? supabase.from("clients").select("id, full_name, company_name").in("id", clientIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; company_name: string | null }[] }),
    lawyerIds.length > 0
      ? supabase.from("users").select("id, full_name").in("id", lawyerIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ]);

  const clientById = new Map((clients ?? []).map((c) => [c.id, c.full_name ?? c.company_name ?? "Cliente"]));
  const lawyerById = new Map((lawyers ?? []).map((l) => [l.id, l.full_name]));

  const rows = (cases ?? []).map((c) => ({
    ...c,
    clientName: clientById.get(c.client_id) ?? "Cliente",
    lawyerName: lawyerById.get(c.responsible_lawyer_id) ?? "—",
  }));

  if (!filters.search) return rows;
  const q = filters.search.trim().toLowerCase();
  if (!q) return rows;

  return rows.filter((c) =>
    `${c.code} ${c.title} ${c.clientName} ${c.legal_area}`.toLowerCase().includes(q),
  );
}

export async function getCaseDetail(tenantId: string, caseId: string) {
  const supabase = await createClient();

  const { data: caseRow } = await supabase.from("cases").select("*").eq("tenant_id", tenantId).eq("id", caseId).maybeSingle();
  if (!caseRow) return null;

  const [{ data: client }, { data: lawyer }, { data: actionItems }, { data: stageRuns }, { data: documents }, { data: auditTrail }] =
    await Promise.all([
      supabase.from("clients").select("id, full_name, company_name, kind").eq("id", caseRow.client_id).maybeSingle(),
      supabase.from("users").select("id, full_name").eq("id", caseRow.responsible_lawyer_id).maybeSingle(),
      supabase
        .from("case_action_items")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true }),
      supabase
        .from("pipeline_stage_runs")
        .select("id, stage_order, status, stage_definition_id, started_at, completed_at")
        .eq("case_id", caseId)
        .order("stage_order", { ascending: true }),
      supabase
        .from("case_documents")
        .select("id, name, document_type, size_bytes, processing_status, created_at, storage_path")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("audit_logs")
        .select("id, event_type, created_at, actor_id")
        .eq("entity_id", caseId)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

  const stageDefIds = (stageRuns ?? []).map((s) => s.stage_definition_id);
  const { data: stageDefs } =
    stageDefIds.length > 0
      ? await supabase.from("pipeline_stage_definitions").select("id, name, specialist").in("id", stageDefIds)
      : { data: [] as { id: string; name: string; specialist: string }[] };
  const stageDefById = new Map((stageDefs ?? []).map((d) => [d.id, d]));

  const stages = (stageRuns ?? []).map((run) => ({
    ...run,
    name: stageDefById.get(run.stage_definition_id)?.name ?? "Etapa",
    specialist: stageDefById.get(run.stage_definition_id)?.specialist ?? "",
  }));

  return {
    case: caseRow,
    client,
    lawyer,
    actionItems: actionItems ?? [],
    stages,
    documents: documents ?? [],
    auditTrail: auditTrail ?? [],
  };
}
