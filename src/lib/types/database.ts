// Tipos das tabelas consumidas pelo app. Escrito à mão a partir das
// migrations em supabase/migrations — quando um projeto Supabase real
// existir, o ideal é gerar com `supabase gen types typescript` e conferir
// contra os arquivos em src/lib/types/rows/.
//
// Nota: os tipos de linha usam `type` (não `interface`) — interfaces não
// recebem assinatura de índice implícita e quebram a checagem estrutural do
// supabase-js contra `Record<string, unknown>`.

export * from "./rows/tenancy";
export * from "./rows/platform";
export * from "./rows/cases";
export * from "./rows/documents";
export * from "./rows/pipeline";
export * from "./rows/production";

import type {
  AccountScope,
  TenantRow,
  OfficeProfileRow,
  UserRow,
  MembershipRow,
  InvitationRow,
} from "./rows/tenancy";
import type {
  GlobalAiSettingsRow,
  AuditLogRow,
  MasterOfficeListRow,
  MasterOverviewStatsRow,
  MasterRecentAiFailureRow,
  NotificationRow,
  AiExecutionRow,
} from "./rows/platform";
import type { ClientRow, CaseRow, CaseActionItemRow } from "./rows/cases";
import type { CaseDocumentRow, LetterheadSettingsRow } from "./rows/documents";
import type {
  PipelineStageDefinitionRow,
  CasePipelineConfigRow,
  PipelineStageRunRow,
  CaseKnowledgeRow,
  StageVersionRow,
  StageInteractionRow,
} from "./rows/pipeline";
import type { LegalDocumentRow, LegalDocumentVersionRow } from "./rows/production";

type NoRelationships = { Relationships: [] };
type Table<Row, InsertRequired extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, InsertRequired>;
  Update: Partial<Row>;
} & NoRelationships;

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13.0.5" };
  public: {
    Tables: {
      tenants: Table<TenantRow>;
      office_profiles: Table<OfficeProfileRow, "tenant_id" | "name" | "responsible_name" | "responsible_email">;
      users: Table<UserRow, "id" | "full_name" | "email">;
      memberships: Table<MembershipRow, "tenant_id" | "user_id">;
      invitations: Table<InvitationRow, "tenant_id" | "email" | "token_hash" | "expires_at">;
      global_ai_settings: Table<GlobalAiSettingsRow>;
      audit_logs: Table<AuditLogRow, "event_type">;
      clients: Table<ClientRow, "tenant_id" | "kind">;
      cases: Table<
        CaseRow,
        "tenant_id" | "code" | "origin" | "legal_area" | "client_id" | "responsible_lawyer_id" | "title" | "full_description"
      >;
      case_action_items: Table<CaseActionItemRow, "tenant_id" | "case_id" | "description">;
      case_documents: Table<
        CaseDocumentRow,
        "tenant_id" | "case_id" | "name" | "document_type" | "storage_path" | "mime_type" | "size_bytes"
      >;
      letterhead_settings: Table<LetterheadSettingsRow, "tenant_id">;
      notifications: Table<NotificationRow, "tenant_id" | "user_id" | "kind" | "title">;
      ai_executions: Table<AiExecutionRow, "tenant_id" | "task_type" | "model">;
      pipeline_stage_definitions: Table<PipelineStageDefinitionRow>;
      case_pipeline_configs: Table<CasePipelineConfigRow, "case_id" | "tenant_id" | "depth" | "execution_mode">;
      pipeline_stage_runs: Table<
        PipelineStageRunRow,
        "tenant_id" | "case_id" | "stage_definition_id" | "stage_order" | "status"
      >;
      case_knowledge: Table<CaseKnowledgeRow, "case_id" | "tenant_id">;
      stage_versions: Table<StageVersionRow, "tenant_id" | "stage_run_id" | "version_number" | "content">;
      stage_interactions: Table<StageInteractionRow, "tenant_id" | "stage_run_id" | "interaction_type" | "message">;
      legal_documents: Table<LegalDocumentRow, "tenant_id" | "document_type" | "title">;
      legal_document_versions: Table<
        LegalDocumentVersionRow,
        "tenant_id" | "legal_document_id" | "version_number" | "content"
      >;
    };
    Views: Record<string, never>;
    Functions: {
      log_audit_event: {
        Args: {
          p_tenant_id: string | null;
          p_actor_id: string | null;
          p_actor_scope: AccountScope | null;
          p_event_type: string;
          p_entity_type: string | null;
          p_entity_id: string | null;
          p_metadata: Record<string, unknown>;
        };
        Returns: string;
      };
      is_master: { Args: Record<string, never>; Returns: boolean };
      next_case_code: {
        Args: { p_tenant_id: string; p_area_code: string; p_year: number };
        Returns: string;
      };
      tenant_ai_executions_this_month: {
        Args: { p_tenant_id: string };
        Returns: number;
      };
      master_list_offices: { Args: Record<string, never>; Returns: MasterOfficeListRow[] };
      master_overview_stats: { Args: Record<string, never>; Returns: MasterOverviewStatsRow[] };
      master_recent_ai_failures: {
        Args: { p_limit?: number };
        Returns: MasterRecentAiFailureRow[];
      };
    };
  };
};
