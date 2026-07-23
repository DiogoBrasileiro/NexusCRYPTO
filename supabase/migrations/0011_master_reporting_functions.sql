-- NEXO Jurídico — funções de leitura agregada para o Painel Master.
-- Executam com os privilégios do chamador (sem `security definer`), então
-- continuam sujeitas às políticas de RLS: um usuário de escritório que as
-- chamasse só enxergaria a própria linha, já que as subconsultas herdam o
-- mesmo filtro por tenant_id das tabelas base.

create or replace function master_list_offices()
returns table (
  tenant_id uuid,
  name text,
  responsible_name text,
  responsible_email text,
  status office_status,
  created_at timestamptz,
  user_count bigint,
  client_count bigint,
  case_count bigint,
  executions_this_month bigint,
  execution_limit integer,
  last_access_at timestamptz,
  has_ai_failure boolean
)
language sql
stable
as $$
  select
    t.id as tenant_id,
    op.name,
    op.responsible_name,
    op.responsible_email,
    t.status,
    t.created_at,
    (select count(*) from memberships m where m.tenant_id = t.id and m.status = 'active') as user_count,
    (select count(*) from clients c where c.tenant_id = t.id and c.archived_at is null) as client_count,
    (select count(*) from cases cs where cs.tenant_id = t.id and cs.archived_at is null) as case_count,
    (select count(*) from ai_executions ae where ae.tenant_id = t.id and ae.created_at >= date_trunc('month', now())) as executions_this_month,
    t.ai_monthly_execution_limit as execution_limit,
    (select max(al.created_at) from audit_logs al where al.tenant_id = t.id and al.event_type = 'login_success') as last_access_at,
    exists(select 1 from ai_executions ae2 where ae2.tenant_id = t.id and ae2.status = 'technical_error') as has_ai_failure
  from tenants t
  join office_profiles op on op.tenant_id = t.id
  order by t.created_at desc;
$$;

create or replace function master_overview_stats()
returns table (
  active_offices bigint,
  blocked_offices bigint,
  total_users bigint,
  total_clients bigint,
  total_cases bigint,
  executions_this_month bigint,
  ai_failures_this_month bigint
)
language sql
stable
as $$
  select
    (select count(*) from tenants where status = 'active'),
    (select count(*) from tenants where status = 'blocked'),
    (select count(*) from users where account_scope = 'office' and is_active = true),
    (select count(*) from clients where archived_at is null),
    (select count(*) from cases where archived_at is null),
    (select count(*) from ai_executions where created_at >= date_trunc('month', now())),
    (select count(*) from ai_executions where created_at >= date_trunc('month', now()) and status = 'technical_error');
$$;

create or replace function master_recent_ai_failures(p_limit integer default 5)
returns table (
  id uuid,
  tenant_name text,
  case_title text,
  task_type text,
  error_code text,
  created_at timestamptz
)
language sql
stable
as $$
  select
    ae.id,
    op.name as tenant_name,
    c.title as case_title,
    ae.task_type,
    ae.error_code,
    ae.created_at
  from ai_executions ae
  join office_profiles op on op.tenant_id = ae.tenant_id
  left join cases c on c.id = ae.case_id
  where ae.status = 'technical_error'
  order by ae.created_at desc
  limit p_limit;
$$;
