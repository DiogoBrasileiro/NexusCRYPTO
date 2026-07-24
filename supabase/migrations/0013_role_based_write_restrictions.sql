-- NEXO Jurídico — fecha lacunas de autorização encontradas em revisão de
-- segurança do código já escrito:
--
-- 1) A política genérica de 0008 concedia CRUD completo a qualquer membro
--    ativo do tenant, sem checar o papel — inclusive em audit_logs. O papel
--    'somente_leitura' (§71: "Sem edição.") não era aplicado em lugar
--    nenhum: um usuário somente-leitura conseguia excluir casos, aprovar
--    peças etc.
-- 2) log_audit_event() é SECURITY DEFINER (ignora RLS) e aceitava
--    p_tenant_id arbitrário vindo de qualquer sessão autenticada — uma
--    sessão de um escritório podia forjar eventos na auditoria de outro.
-- 3) next_case_code() tinha o mesmo problema: p_tenant_id arbitrário,
--    consumível por qualquer sessão autenticada.

-- Papel somente-leitura do chamador atual dentro de um tenant específico.
create or replace function is_read_only_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where tenant_id = p_tenant_id
      and user_id = auth.uid()
      and status = 'active'
      and role = 'somente_leitura'
  );
$$;

-- audit_logs: leitura para membros ativos do tenant; nenhuma escrita via
-- sessão de escritório — a aplicação sempre grava através da service role
-- (lib/audit/log.ts), nunca da sessão do usuário.
drop policy if exists audit_logs_tenant_all on audit_logs;
create policy audit_logs_tenant_select on audit_logs for select
  using (tenant_id in (select my_tenant_ids()));

revoke execute on function log_audit_event(uuid, uuid, account_scope, text, text, uuid, jsonb) from public;
revoke execute on function log_audit_event(uuid, uuid, account_scope, text, text, uuid, jsonb) from authenticated;
-- Explicit grant rather than relying on service_role's default privileges,
-- since the app only ever calls this RPC via the service-role client
-- (lib/audit/log.ts).
grant execute on function log_audit_event(uuid, uuid, account_scope, text, text, uuid, jsonb) to service_role;

create or replace function next_case_code(p_tenant_id uuid, p_area_code text, p_year integer)
returns text
language plpgsql
as $$
declare
  v_next integer;
begin
  if not (is_master() or p_tenant_id in (select my_tenant_ids())) then
    raise exception 'not authorized for this tenant';
  end if;

  insert into case_area_sequences (tenant_id, area_code, year, last_value)
  values (p_tenant_id, p_area_code, p_year, 1)
  on conflict (tenant_id, area_code, year)
  do update set last_value = case_area_sequences.last_value + 1
  returning last_value into v_next;

  return p_area_code || '-' || p_year::text || '-' || lpad(v_next::text, 6, '0');
end;
$$;

-- Tabelas operacionais: leitura para qualquer membro ativo do tenant;
-- escrita (insert/update/delete) exige um papel diferente de
-- 'somente_leitura'. Master mantém acesso total via a política
-- <tabela>_master_all já existente em 0008 (políticas permissivas se
-- combinam com OR, então isto não a afeta).
do $$
declare
  t text;
  tenant_scoped_tables text[] := array[
    'clients', 'case_area_sequences', 'cases', 'case_action_items', 'case_documents',
    'case_pipeline_configs', 'pipeline_stage_runs', 'stage_versions', 'stage_interactions',
    'case_knowledge', 'legal_documents', 'legal_document_versions', 'letterhead_settings',
    'ai_executions', 'notifications'
  ];
begin
  foreach t in array tenant_scoped_tables loop
    execute format('drop policy if exists %I_tenant_all on %I;', t, t);

    execute format(
      'create policy %I_tenant_select on %I for select using (tenant_id in (select my_tenant_ids()));',
      t, t
    );
    execute format(
      'create policy %I_tenant_insert on %I for insert with check (tenant_id in (select my_tenant_ids()) and not is_read_only_member(tenant_id));',
      t, t
    );
    execute format(
      'create policy %I_tenant_update on %I for update using (tenant_id in (select my_tenant_ids()) and not is_read_only_member(tenant_id)) with check (tenant_id in (select my_tenant_ids()) and not is_read_only_member(tenant_id));',
      t, t
    );
    execute format(
      'create policy %I_tenant_delete on %I for delete using (tenant_id in (select my_tenant_ids()) and not is_read_only_member(tenant_id));',
      t, t
    );
  end loop;
end $$;

-- stage_interaction_documents has no tenant_id of its own (scoped via the
-- parent interaction) — apply the same read/write split there too.
drop policy if exists stage_interaction_documents_tenant_all on stage_interaction_documents;

create policy stage_interaction_documents_tenant_select on stage_interaction_documents for select
  using (exists (
    select 1 from stage_interactions si
    where si.id = stage_interaction_documents.interaction_id
      and si.tenant_id in (select my_tenant_ids())
  ));

create policy stage_interaction_documents_tenant_insert on stage_interaction_documents for insert
  with check (exists (
    select 1 from stage_interactions si
    where si.id = stage_interaction_documents.interaction_id
      and si.tenant_id in (select my_tenant_ids())
      and not is_read_only_member(si.tenant_id)
  ));

create policy stage_interaction_documents_tenant_delete on stage_interaction_documents for delete
  using (exists (
    select 1 from stage_interactions si
    where si.id = stage_interaction_documents.interaction_id
      and si.tenant_id in (select my_tenant_ids())
      and not is_read_only_member(si.tenant_id)
  ));
