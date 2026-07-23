-- NEXO Jurídico — documentos do caso e Linha de Produção Jurídica (pipeline de IA).

create table case_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  case_id uuid not null references cases (id) on delete cascade,
  client_id uuid references clients (id) on delete set null,
  uploader_id uuid references users (id) on delete set null,
  name text not null,
  document_type document_type not null default 'outro',
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  description text,
  origin text,
  processing_status document_processing_status not null default 'uploaded',
  extracted_text text,
  file_hash text,
  related_stage_key text,
  used_by_ai boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index case_documents_case_id_idx on case_documents (case_id);
create index case_documents_tenant_id_idx on case_documents (tenant_id);
create trigger case_documents_set_updated_at before update on case_documents
  for each row execute function set_updated_at();

-- Static catalogue of the stages that exist for each depth (rápida/profissional/completa).
create table pipeline_stage_definitions (
  id uuid primary key default gen_random_uuid(),
  depth case_depth not null,
  stage_order integer not null,
  stage_key text not null,
  name text not null,
  specialist text not null,
  description text,
  unique (depth, stage_order),
  unique (depth, stage_key)
);

-- One row per case: which stage list applies and where the case currently stands.
create table case_pipeline_configs (
  case_id uuid primary key references cases (id) on delete cascade,
  tenant_id uuid not null references tenants (id) on delete cascade,
  depth case_depth not null,
  execution_mode case_execution_mode not null,
  current_stage_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_pipeline_configs_set_updated_at before update on case_pipeline_configs
  for each row execute function set_updated_at();

-- One row per (case, stage) execution slot.
create table pipeline_stage_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  case_id uuid not null references cases (id) on delete cascade,
  stage_definition_id uuid not null references pipeline_stage_definitions (id),
  stage_order integer not null,
  status stage_run_status not null default 'locked',
  current_version_id uuid,
  guidance_for_next_stage text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id, stage_order)
);

create index pipeline_stage_runs_case_id_idx on pipeline_stage_runs (case_id);
create trigger pipeline_stage_runs_set_updated_at before update on pipeline_stage_runs
  for each row execute function set_updated_at();

create table stage_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  stage_run_id uuid not null references pipeline_stage_runs (id) on delete cascade,
  version_number integer not null,
  author_id uuid references users (id) on delete set null,
  author_type text not null default 'ai',
  origin text not null default 'ai_execution',
  interaction_id uuid,
  status text not null default 'draft',
  content jsonb not null,
  content_hash text,
  created_at timestamptz not null default now(),
  unique (stage_run_id, version_number)
);

create index stage_versions_stage_run_id_idx on stage_versions (stage_run_id);

alter table pipeline_stage_runs
  add constraint pipeline_stage_runs_current_version_fk
  foreign key (current_version_id) references stage_versions (id) on delete set null;

create table stage_interactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  stage_run_id uuid not null references pipeline_stage_runs (id) on delete cascade,
  author_id uuid references users (id) on delete set null,
  interaction_type text not null,
  message text not null,
  ai_conclusion text,
  ai_technical_analysis text,
  ai_grounds text,
  ai_impact_on_stage text,
  ai_impact_on_other_stages text,
  ai_recommendation text,
  resulting_version_id uuid references stage_versions (id) on delete set null,
  lawyer_decision text,
  lawyer_justification text,
  created_at timestamptz not null default now()
);

create index stage_interactions_stage_run_id_idx on stage_interactions (stage_run_id);

create table stage_interaction_documents (
  interaction_id uuid not null references stage_interactions (id) on delete cascade,
  document_id uuid not null references case_documents (id) on delete cascade,
  primary key (interaction_id, document_id)
);

alter table stage_versions
  add constraint stage_versions_interaction_fk
  foreign key (interaction_id) references stage_interactions (id) on delete set null;

-- Structured case memory ("dossiê"): accumulates facts, timeline, risks, etc. across stages.
create table case_knowledge (
  case_id uuid primary key references cases (id) on delete cascade,
  tenant_id uuid not null references tenants (id) on delete cascade,
  facts_approved jsonb not null default '[]'::jsonb,
  facts_contested jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  people jsonb not null default '[]'::jsonb,
  companies jsonb not null default '[]'::jsonb,
  monetary_values jsonb not null default '[]'::jsonb,
  key_dates jsonb not null default '[]'::jsonb,
  documents_index jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  contradictions jsonb not null default '[]'::jsonb,
  legal_theses jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  strategies jsonb not null default '[]'::jsonb,
  lawyer_decisions jsonb not null default '[]'::jsonb,
  legal_sources jsonb not null default '[]'::jsonb,
  jurisprudence_sources jsonb not null default '[]'::jsonb,
  claims jsonb not null default '[]'::jsonb,
  pending_items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger case_knowledge_set_updated_at before update on case_knowledge
  for each row execute function set_updated_at();
