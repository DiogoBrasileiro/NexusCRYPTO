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

## Como aplicar

Com a Supabase CLI apontando para um projeto vazio:

```bash
supabase link --project-ref <ref>
supabase db push
```

Ou via `psql` direto na connection string do projeto, executando os arquivos em ordem.

## Após aplicar

1. Promover o primeiro usuário master: crie o usuário via Supabase Auth e depois
   `update users set account_scope = 'master' where id = '<uuid>';`.
2. Preencher as variáveis de ambiente do app (`.env.local`, ver `.env.example`).
3. Configurar o provedor de IA em `/master/configuracao-ia` (grava em `global_ai_settings`,
   a chave nunca é lida pelo navegador — apenas Server Actions com a service role acessam
   `api_key_ciphertext`).

## Isolamento multi-tenant

Toda tabela operacional tem `tenant_id` e RLS habilitado. As políticas usam
`my_tenant_ids()` (memberships ativos do usuário autenticado) e `is_master()`.
O `tenant_id` nunca deve ser aceito vindo do cliente — Server Actions sempre o
resolvem a partir da sessão antes de qualquer escrita.
