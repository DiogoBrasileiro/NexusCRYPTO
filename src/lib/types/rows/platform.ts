import type { AccountScope, OfficeStatus } from "./tenancy";

export type GlobalAiSettingsRow = {
  id: true;
  provider: string;
  model: string;
  api_key_ciphertext: string | null;
  api_key_last_four: string | null;
  is_active: boolean;
  max_output_tokens: number;
  timeout_seconds: number;
  max_retries: number;
  global_monthly_execution_limit: number;
  default_office_monthly_limit: number;
  updated_by: string | null;
  updated_at: string;
};

export type AuditLogRow = {
  id: string;
  tenant_id: string | null;
  actor_id: string | null;
  actor_scope: AccountScope | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
};

export type MasterOfficeListRow = {
  tenant_id: string;
  name: string;
  responsible_name: string;
  responsible_email: string;
  status: OfficeStatus;
  created_at: string;
  user_count: number;
  client_count: number;
  case_count: number;
  executions_this_month: number;
  execution_limit: number;
  last_access_at: string | null;
  has_ai_failure: boolean;
};

export type MasterOverviewStatsRow = {
  active_offices: number;
  blocked_offices: number;
  total_users: number;
  total_clients: number;
  total_cases: number;
  executions_this_month: number;
  ai_failures_this_month: number;
};

export type MasterRecentAiFailureRow = {
  id: string;
  tenant_name: string;
  case_title: string | null;
  task_type: string;
  error_code: string | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  tenant_id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  case_id: string | null;
  read_at: string | null;
  created_at: string;
};

export type AiExecutionStatus = "queued" | "processing" | "awaiting_review" | "completed" | "technical_error" | "cancelled";

export type AiExecutionRow = {
  id: string;
  tenant_id: string;
  user_id: string | null;
  case_id: string | null;
  stage_run_id: string | null;
  task_type: string;
  model: string;
  status: AiExecutionStatus;
  started_at: string;
  finished_at: string | null;
  error_code: string | null;
  error_message: string | null;
  attempt_count: number;
  estimated_usage_units: number | null;
  estimated_cost_cents: number | null;
  created_at: string;
};
