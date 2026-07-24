import type { CaseDepth, CaseExecutionMode } from "./cases";

export type PipelineStageDefinitionRow = {
  id: string;
  depth: CaseDepth;
  stage_order: number;
  stage_key: string;
  name: string;
  specialist: string;
  description: string | null;
};

export type CasePipelineConfigRow = {
  case_id: string;
  tenant_id: string;
  depth: CaseDepth;
  execution_mode: CaseExecutionMode;
  current_stage_order: number;
  created_at: string;
  updated_at: string;
};

export type StageRunStatus =
  | "locked"
  | "ready"
  | "queued"
  | "processing"
  | "awaiting_review"
  | "changes_requested"
  | "approved"
  | "approved_with_notes"
  | "technical_error"
  | "outdated"
  | "cancelled";

export type PipelineStageRunRow = {
  id: string;
  tenant_id: string;
  case_id: string;
  stage_definition_id: string;
  stage_order: number;
  status: StageRunStatus;
  current_version_id: string | null;
  guidance_for_next_stage: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StageVersionRow = {
  id: string;
  tenant_id: string;
  stage_run_id: string;
  version_number: number;
  author_id: string | null;
  author_type: string;
  origin: string;
  interaction_id: string | null;
  status: string;
  content: Record<string, unknown>;
  content_hash: string | null;
  created_at: string;
};

export type StageInteractionRow = {
  id: string;
  tenant_id: string;
  stage_run_id: string;
  author_id: string | null;
  interaction_type: string;
  message: string;
  ai_conclusion: string | null;
  ai_technical_analysis: string | null;
  ai_grounds: string | null;
  ai_impact_on_stage: string | null;
  ai_impact_on_other_stages: string | null;
  ai_recommendation: string | null;
  resulting_version_id: string | null;
  lawyer_decision: string | null;
  lawyer_justification: string | null;
  created_at: string;
};

export type CaseKnowledgeRow = {
  case_id: string;
  tenant_id: string;
  facts_approved: unknown[];
  facts_contested: unknown[];
  timeline: unknown[];
  people: unknown[];
  companies: unknown[];
  monetary_values: unknown[];
  key_dates: unknown[];
  documents_index: unknown[];
  evidence: unknown[];
  gaps: unknown[];
  contradictions: unknown[];
  legal_theses: unknown[];
  risks: unknown[];
  strategies: unknown[];
  lawyer_decisions: unknown[];
  legal_sources: unknown[];
  jurisprudence_sources: unknown[];
  claims: unknown[];
  pending_items: unknown[];
  updated_at: string;
};
