-- NEXO Jurídico — isolamento multi-tenant via Row Level Security.
-- Regra geral: Master enxerga tudo; um usuário de escritório só enxerga
-- linhas cujo tenant_id esteja em my_tenant_ids(). tenant_id nunca é confiado
-- vindo do cliente — é sempre resolvido no servidor a partir da sessão.

alter table tenants enable row level security;
alter table office_profiles enable row level security;
alter table users enable row level security;
alter table memberships enable row level security;
alter table invitations enable row level security;
alter table clients enable row level security;
alter table case_area_sequences enable row level security;
alter table cases enable row level security;
alter table case_action_items enable row level security;
alter table case_documents enable row level security;
alter table pipeline_stage_definitions enable row level security;
alter table case_pipeline_configs enable row level security;
alter table pipeline_stage_runs enable row level security;
alter table stage_versions enable row level security;
alter table stage_interactions enable row level security;
alter table stage_interaction_documents enable row level security;
alter table case_knowledge enable row level security;
alter table legal_documents enable row level security;
alter table legal_document_versions enable row level security;
alter table letterhead_settings enable row level security;
alter table global_ai_settings enable row level security;
alter table ai_executions enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- tenants
create policy tenants_master_all on tenants for all
  using (is_master()) with check (is_master());
create policy tenants_member_select on tenants for select
  using (id in (select my_tenant_ids()));

-- office_profiles
create policy office_profiles_master_all on office_profiles for all
  using (is_master()) with check (is_master());
create policy office_profiles_member_select on office_profiles for select
  using (tenant_id in (select my_tenant_ids()));
create policy office_profiles_admin_update on office_profiles for update
  using (tenant_id in (
    select tenant_id from memberships
    where user_id = auth.uid() and status = 'active' and role in ('administrador', 'socio')
  ));

-- users: master sees all; a user sees itself and members of tenants it shares.
create policy users_master_all on users for all
  using (is_master()) with check (is_master());
create policy users_self_select on users for select
  using (id = auth.uid());
create policy users_self_update on users for update
  using (id = auth.uid());
create policy users_tenant_peers_select on users for select
  using (id in (
    select m2.user_id from memberships m1
    join memberships m2 on m2.tenant_id = m1.tenant_id
    where m1.user_id = auth.uid() and m1.status = 'active' and m2.status = 'active'
  ));

-- memberships
create policy memberships_master_all on memberships for all
  using (is_master()) with check (is_master());
create policy memberships_tenant_select on memberships for select
  using (tenant_id in (select my_tenant_ids()));
create policy memberships_admin_write on memberships for all
  using (tenant_id in (
    select tenant_id from memberships
    where user_id = auth.uid() and status = 'active' and role in ('administrador', 'socio')
  ))
  with check (tenant_id in (
    select tenant_id from memberships
    where user_id = auth.uid() and status = 'active' and role in ('administrador', 'socio')
  ));

-- invitations
create policy invitations_master_all on invitations for all
  using (is_master()) with check (is_master());
create policy invitations_admin_manage on invitations for all
  using (tenant_id in (
    select tenant_id from memberships
    where user_id = auth.uid() and status = 'active' and role in ('administrador', 'socio')
  ))
  with check (tenant_id in (
    select tenant_id from memberships
    where user_id = auth.uid() and status = 'active' and role in ('administrador', 'socio')
  ));

-- Generic per-tenant policy generator for the remaining operational tables.
do $$
declare
  t text;
  tenant_scoped_tables text[] := array[
    'clients', 'case_area_sequences', 'cases', 'case_action_items', 'case_documents',
    'case_pipeline_configs', 'pipeline_stage_runs', 'stage_versions', 'stage_interactions',
    'case_knowledge', 'legal_documents', 'legal_document_versions', 'letterhead_settings',
    'ai_executions', 'notifications', 'audit_logs'
  ];
begin
  foreach t in array tenant_scoped_tables loop
    execute format(
      'create policy %I_master_all on %I for all using (is_master()) with check (is_master());',
      t, t
    );
    execute format(
      'create policy %I_tenant_all on %I for all using (tenant_id in (select my_tenant_ids())) with check (tenant_id in (select my_tenant_ids()));',
      t, t
    );
  end loop;
end $$;

-- stage_interaction_documents has no tenant_id column of its own; scope via the interaction.
create policy stage_interaction_documents_master_all on stage_interaction_documents for all
  using (is_master()) with check (is_master());
create policy stage_interaction_documents_tenant_all on stage_interaction_documents for all
  using (exists (
    select 1 from stage_interactions si
    where si.id = stage_interaction_documents.interaction_id
      and si.tenant_id in (select my_tenant_ids())
  ))
  with check (exists (
    select 1 from stage_interactions si
    where si.id = stage_interaction_documents.interaction_id
      and si.tenant_id in (select my_tenant_ids())
  ));

-- pipeline_stage_definitions is a shared, non-tenant catalogue: readable by any
-- authenticated user, writable only by master.
create policy pipeline_stage_definitions_read on pipeline_stage_definitions for select
  using (auth.role() = 'authenticated');
create policy pipeline_stage_definitions_master_write on pipeline_stage_definitions for all
  using (is_master()) with check (is_master());

-- global_ai_settings: master-only, end to end. The API key ciphertext must never
-- be reachable by office sessions even for select.
create policy global_ai_settings_master_all on global_ai_settings for all
  using (is_master()) with check (is_master());
