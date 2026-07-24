# Banco de dados — NEXO Jurídico

Migrações SQL ordenadas (rode em sequência num projeto Supabase/Postgres novo):

1. `0001_extensions_and_enums.sql` — extensões e tipos enum.
2. `0002_tenants_and_auth.sql` — tenants, escritórios, usuários, memberships, convites.
3. `0003_clients_and_cases.sql` — clientes, casos, numeração sequencial por área/ano.
4. `0004_documents_and_pipeline.sql` — documentos do caso e Linha de Produção Jurídica.
5. `0005_legal_production.sql` — peças jurídicas e timbrado.
6. `0006_ai_settings_and_executions.sql` — configuração global de IA e execuções.
7. `0007_notifications_and_audit.sql` — notificações internas e auditoria.
8. `0008_row_level_security.sql` — isolamento multi-tenant (RLS).
9. `0009_seed_pipeline_stage_definitions.sql` — catálogo de etapas (Rápida/Profissional/Completa).
10. `0010_storage_buckets.sql` — buckets privados `case-documents` e `office-assets`.
11. `0011_master_reporting_functions.sql` — funções agregadas do Painel Master
    (`master_list_offices`, `master_overview_stats`, `master_recent_ai_failures`).
    Executam com privilégios do chamador, não `security definer` — continuam
    sujeitas à RLS.
12. `0012_office_profile_oab.sql` — coluna `oab_number` em `office_profiles`
    (aba Escritório das Configurações, §73).
13. `0013_role_based_write_restrictions.sql` — fecha lacunas de uma revisão
    de segurança: `audit_logs` passa a ser somente leitura para sessões de
    escritório (escrita só via service role), `log_audit_event()` e
    `next_case_code()` (SECURITY DEFINER / callable com `tenant_id`
    arbitrário) passam a validar o tenant do chamador, e toda tabela
    operacional passa a negar insert/update/delete para o papel
    `somente_leitura` (antes tinha CRUD completo, apesar do nome).

## Como aplicar

Com a Supabase CLI apontando para um projeto vazio:

```bash
supabase link --project-ref <ref>
supabase db push
```

Ou via `psql` direto na connection string do projeto, executando os arquivos em ordem.

## Após aplicar

1. Promover o primeiro usuário master: crie o usuário via Supabase Auth (Dashboard →
   Authentication, ou `admin.auth.admin.createUser`), insira a linha correspondente em
   `public.users` com `account_scope = 'master'` e confirme que ela existe (não há
   trigger automático de espelhamento de `auth.users` para `public.users` — os fluxos
   do app criam essa linha explicitamente ao convidar um usuário).
2. Preencher as variáveis de ambiente do app (`.env.local`, ver `.env.example`),
   incluindo `AI_SETTINGS_ENCRYPTION_KEY` (`openssl rand -base64 32`) — sem ela,
   salvar a configuração de IA falha.
3. Configurar o template de e-mail de "Reset Password" / "Invite user" do projeto
   Supabase (Authentication → Email Templates) para apontar para
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next=/redefinir-senha`
   — sem isso, os links de convite/redefinição de senha não completam o fluxo do app.
4. Configurar o provedor de IA em `/master/configuracao-ia` (grava em `global_ai_settings`,
   a chave nunca é lida pelo navegador — apenas Server Actions com a service role acessam
   `api_key_ciphertext`, cifrada em repouso com `AI_SETTINGS_ENCRYPTION_KEY`).

## Isolamento multi-tenant

Toda tabela operacional tem `tenant_id` e RLS habilitado. As políticas usam
`my_tenant_ids()` (memberships ativos do usuário autenticado) e `is_master()`.
O `tenant_id` nunca deve ser aceito vindo do cliente — Server Actions sempre o
resolvem a partir da sessão antes de qualquer escrita.
