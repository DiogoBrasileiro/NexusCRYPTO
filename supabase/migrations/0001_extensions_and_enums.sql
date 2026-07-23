-- NEXO Jurídico — schema bootstrap: extensions and shared enum types.

create extension if not exists "pgcrypto";

create type account_scope as enum ('master', 'office');

create type office_status as enum ('active', 'blocked');

create type membership_role as enum (
  'administrador',
  'socio',
  'advogado',
  'revisor',
  'assistente',
  'estagiario',
  'somente_leitura'
);

create type membership_status as enum ('active', 'invited', 'suspended', 'removed');

create type invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');

create type client_kind as enum ('pessoa_fisica', 'pessoa_juridica');

create type case_origin as enum (
  'consulta_inicial',
  'notificacao_judicial',
  'processo_em_andamento',
  'contrato_para_analise',
  'cobranca_extrajudicial',
  'parecer_juridico',
  'defesa_administrativa',
  'recurso',
  'outro'
);

create type case_status as enum (
  'aguardando_analise',
  'em_producao',
  'aguardando_decisao',
  'pronto_protocolo',
  'concluido',
  'arquivado'
);

create type case_depth as enum ('rapida', 'profissional', 'completa');

create type case_execution_mode as enum ('supervisionado', 'automatico');

create type action_item_status as enum (
  'pending',
  'in_progress',
  'waiting_document',
  'waiting_decision',
  'completed',
  'cancelled'
);

create type document_type as enum (
  'identificacao',
  'procuracao',
  'contrato',
  'comprovante',
  'comunicacao',
  'prova',
  'laudo',
  'documento_judicial',
  'peticao',
  'planilha',
  'audio',
  'imagem',
  'outro'
);

create type document_processing_status as enum (
  'uploaded',
  'processing',
  'processed',
  'needs_review',
  'error'
);

create type stage_run_status as enum (
  'locked',
  'ready',
  'queued',
  'processing',
  'awaiting_review',
  'changes_requested',
  'approved',
  'approved_with_notes',
  'technical_error',
  'outdated',
  'cancelled'
);

create type legal_document_status as enum (
  'draft',
  'waiting_review',
  'changes_requested',
  'approved',
  'ready_to_file',
  'filed',
  'archived'
);

create type ai_execution_status as enum (
  'queued',
  'processing',
  'awaiting_review',
  'completed',
  'technical_error',
  'cancelled'
);
