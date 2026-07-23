-- NEXO Jurídico — peças jurídicas produzidas e configuração de timbrado.

create table legal_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  case_id uuid references cases (id) on delete cascade,
  client_id uuid references clients (id) on delete set null,
  document_type text not null,
  title text not null,
  status legal_document_status not null default 'draft',
  current_version_id uuid,
  author_id uuid references users (id) on delete set null,
  reviewer_id uuid references users (id) on delete set null,
  filed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index legal_documents_tenant_id_idx on legal_documents (tenant_id);
create index legal_documents_case_id_idx on legal_documents (case_id);
create trigger legal_documents_set_updated_at before update on legal_documents
  for each row execute function set_updated_at();

create table legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  legal_document_id uuid not null references legal_documents (id) on delete cascade,
  version_number integer not null,
  content jsonb not null,
  content_hash text,
  author_id uuid references users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (legal_document_id, version_number)
);

alter table legal_documents
  add constraint legal_documents_current_version_fk
  foreign key (current_version_id) references legal_document_versions (id) on delete set null;

create table letterhead_settings (
  tenant_id uuid primary key references tenants (id) on delete cascade,
  use_letterhead boolean not null default true,
  logo_url text,
  office_name text,
  legal_name text,
  cnpj text,
  lawyer_name text,
  oab_number text,
  address text,
  phone text,
  email text,
  website text,
  header_text text,
  footer_text text,
  watermark_text text,
  signature_image_url text,
  brand_color text default '#0b0b0b',
  margins jsonb not null default '{"top": 3, "bottom": 2, "left": 3, "right": 2}'::jsonb,
  font_family text default 'Inter',
  numbering_style text default 'numeric',
  updated_at timestamptz not null default now()
);

create trigger letterhead_settings_set_updated_at before update on letterhead_settings
  for each row execute function set_updated_at();
