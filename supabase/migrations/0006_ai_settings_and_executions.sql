-- NEXO Jurídico — configuração global de IA (Master) e registro de execuções.
-- MVP: um único provedor/modelo ativo por vez. A chave de API nunca é lida pelo
-- cliente; apenas o backend (service role) acessa `api_key_ciphertext`.

create table global_ai_settings (
  id boolean primary key default true constraint global_ai_settings_singleton check (id),
  provider text not null default 'anthropic',
  model text not null default 'claude-sonnet-5',
  api_key_ciphertext text,
  api_key_last_four text,
  is_active boolean not null default false,
  max_output_tokens integer not null default 8000,
  timeout_seconds integer not null default 120,
  max_retries integer not null default 2,
  global_monthly_execution_limit integer not null default 5000,
  default_office_monthly_limit integer not null default 200,
  updated_by uuid references users (id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into global_ai_settings (id) values (true);

create trigger global_ai_settings_set_updated_at before update on global_ai_settings
  for each row execute function set_updated_at();

create table ai_executions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  user_id uuid references users (id) on delete set null,
  case_id uuid references cases (id) on delete set null,
  stage_run_id uuid references pipeline_stage_runs (id) on delete set null,
  task_type text not null,
  model text not null,
  status ai_execution_status not null default 'queued',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_code text,
  error_message text,
  attempt_count integer not null default 1,
  estimated_usage_units integer,
  estimated_cost_cents integer,
  created_at timestamptz not null default now()
);

create index ai_executions_tenant_id_idx on ai_executions (tenant_id);
create index ai_executions_case_id_idx on ai_executions (case_id);
create index ai_executions_status_idx on ai_executions (tenant_id, status);

-- Counts an office's AI executions for the current calendar month (used to enforce limits).
create or replace function tenant_ai_executions_this_month(p_tenant_id uuid)
returns integer
language sql
stable
as $$
  select count(*)::integer
  from ai_executions
  where tenant_id = p_tenant_id
    and created_at >= date_trunc('month', now());
$$;
