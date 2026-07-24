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

export async function listCaseOptions(tenantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cases")
    .select("id, code, title")
    .eq("tenant_id", tenantId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(200);
  return (data ?? []).map((c) => ({ id: c.id, label: `${c.code} — ${c.title}` }));
}

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

export type CaseListFilters = { status?: string; search?: string; page?: number };

const CASE_PAGE_SIZE = 30;

function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, " ").trim();
}

export async function listCases(tenantId: string, filters: CaseListFilters = {}) {
  const supabase = await createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const from = (page - 1) * CASE_PAGE_SIZE;
  const to = from + CASE_PAGE_SIZE - 1;

  let query = supabase
    .from("cases")
    .select("id, code, title, legal_area, status, depth, client_id, responsible_lawyer_id, updated_at", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (filters.status === "arquivados") {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
    if (filters.status && filters.status !== "todos" && CASE_STATUSES.includes(filters.status as CaseStatus)) {
      query = query.eq("status", filters.status as CaseStatus);
    }
  }

  const term = sanitizeSearchTerm(filters.search ?? "");
  if (term) {
    const pattern = `%${term}%`;
    query = query.or(`code.ilike.${pattern},title.ilike.${pattern},legal_area.ilike.${pattern}`);
  }

  const { data: cases, error, count } = await query;
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

  return { cases: rows, total: count ?? 0, page, pageSize: CASE_PAGE_SIZE };
}

export async function getCaseDetail(tenantId: string, caseId: string) {
  const supabase = await createClient();

  const { data: caseRow } = await supabase.from("cases").select("*").eq("tenant_id", tenantId).eq("id", caseId).maybeSingle();
  if (!caseRow) return null;

  const [
    { data: client },
    { data: lawyer },
    { data: actionItems },
    { data: stageRuns },
    { data: documents },
    { data: auditTrail },
    { data: legalDocuments },
  ] = await Promise.all([
    supabase.from("clients").select("id, full_name, company_name, kind").eq("id", caseRow.client_id).maybeSingle(),
    supabase.from("users").select("id, full_name").eq("id", caseRow.responsible_lawyer_id).maybeSingle(),
    supabase
      .from("case_action_items")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true }),
    supabase
      .from("pipeline_stage_runs")
      .select("id, stage_order, status, stage_definition_id, current_version_id, started_at, completed_at")
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
    supabase
      .from("legal_documents")
      .select("id, title, document_type, status, updated_at")
      .eq("case_id", caseId)
      .order("updated_at", { ascending: false }),
  ]);

  const stageDefIds = (stageRuns ?? []).map((s) => s.stage_definition_id);
  const { data: stageDefs } =
    stageDefIds.length > 0
      ? await supabase.from("pipeline_stage_definitions").select("id, name, specialist").in("id", stageDefIds)
      : { data: [] as { id: string; name: string; specialist: string }[] };
  const stageDefById = new Map((stageDefs ?? []).map((d) => [d.id, d]));

  const versionIds = (stageRuns ?? []).map((s) => s.current_version_id).filter((id): id is string => Boolean(id));
  const { data: versions } =
    versionIds.length > 0
      ? await supabase.from("stage_versions").select("id, version_number, content, created_at").in("id", versionIds)
      : { data: [] as { id: string; version_number: number; content: Record<string, unknown>; created_at: string }[] };
  const versionById = new Map((versions ?? []).map((v) => [v.id, v]));

  const changesRequestedRunIds = (stageRuns ?? [])
    .filter((s) => s.status === "changes_requested")
    .map((s) => s.id);
  const { data: pendingNotes } =
    changesRequestedRunIds.length > 0
      ? await supabase
          .from("stage_interactions")
          .select("stage_run_id, message, created_at")
          .in("stage_run_id", changesRequestedRunIds)
          .order("created_at", { ascending: false })
      : { data: [] as { stage_run_id: string; message: string; created_at: string }[] };
  const latestNoteByStageRun = new Map<string, string>();
  for (const note of pendingNotes ?? []) {
    if (!latestNoteByStageRun.has(note.stage_run_id)) latestNoteByStageRun.set(note.stage_run_id, note.message);
  }

  const stages = (stageRuns ?? []).map((run) => ({
    ...run,
    name: stageDefById.get(run.stage_definition_id)?.name ?? "Etapa",
    specialist: stageDefById.get(run.stage_definition_id)?.specialist ?? "",
    version: run.current_version_id ? (versionById.get(run.current_version_id) ?? null) : null,
    pendingNote: latestNoteByStageRun.get(run.id) ?? null,
  }));

  return {
    case: caseRow,
    client,
    lawyer,
    actionItems: actionItems ?? [],
    stages,
    documents: documents ?? [],
    auditTrail: auditTrail ?? [],
    legalDocuments: legalDocuments ?? [],
  };
}
