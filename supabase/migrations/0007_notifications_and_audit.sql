-- NEXO Jurídico — notificações internas e trilha de auditoria.

create table notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  case_id uuid references cases (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on notifications (user_id, read_at);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants (id) on delete cascade,
  actor_id uuid references users (id) on delete set null,
  actor_scope account_scope,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index audit_logs_tenant_id_idx on audit_logs (tenant_id, created_at desc);
create index audit_logs_event_type_idx on audit_logs (event_type);

-- Convenience writer used by server actions/service-role code paths.
create or replace function log_audit_event(
  p_tenant_id uuid,
  p_actor_id uuid,
  p_actor_scope account_scope,
  p_event_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb
) returns uuid
language sql
as $$
  insert into audit_logs (tenant_id, actor_id, actor_scope, event_type, entity_type, entity_id, metadata)
  values (p_tenant_id, p_actor_id, p_actor_scope, p_event_type, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb))
  returning id;
$$;
