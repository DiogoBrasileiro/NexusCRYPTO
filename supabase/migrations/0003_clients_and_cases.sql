-- NEXO Jurídico — clientes e casos.

create table clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  kind client_kind not null,
  full_name text,
  cpf text,
  nationality text,
  marital_status text,
  occupation text,
  company_name text,
  trade_name text,
  cnpj text,
  representative_name text,
  email text,
  phone text,
  whatsapp text,
  address text,
  archived_at timestamptz,
  created_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_tenant_id_idx on clients (tenant_id);
create trigger clients_set_updated_at before update on clients
  for each row execute function set_updated_at();

-- Per-tenant, per-area, per-year sequence used to render case codes like CIV-2026-000001.
create table case_area_sequences (
  tenant_id uuid not null references tenants (id) on delete cascade,
  area_code text not null,
  year integer not null,
  last_value integer not null default 0,
  primary key (tenant_id, area_code, year)
);

create table cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  code text not null,
  origin case_origin not null,
  legal_area text not null,
  legal_subarea text,
  client_id uuid not null references clients (id) on delete restrict,
  counterparty_name text,
  counterparty_document text,
  counterparty_address text,
  counterparty_qualification text,
  responsible_lawyer_id uuid not null references users (id) on delete restrict,
  team text,
  title text not null,
  short_summary text,
  full_description text not null,
  client_objective text,
  expected_outcome text,
  urgency text,
  notes text,
  process_number text,
  court text,
  district text,
  jurisdiction text,
  procedural_phase text,
  case_value numeric(14, 2),
  depth case_depth not null default 'profissional',
  execution_mode case_execution_mode not null default 'supervisionado',
  status case_status not null default 'aguardando_analise',
  priority text not null default 'normal',
  next_action text,
  archived_at timestamptz,
  created_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create index cases_tenant_id_idx on cases (tenant_id);
create index cases_client_id_idx on cases (client_id);
create index cases_status_idx on cases (tenant_id, status);
create trigger cases_set_updated_at before update on cases
  for each row execute function set_updated_at();

create table case_action_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  case_id uuid not null references cases (id) on delete cascade,
  description text not null,
  responsible_id uuid references users (id) on delete set null,
  priority text not null default 'normal',
  status action_item_status not null default 'pending',
  origin text,
  manual_due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index case_action_items_case_id_idx on case_action_items (case_id);
create trigger case_action_items_set_updated_at before update on case_action_items
  for each row execute function set_updated_at();

-- Allocates the next sequential code for a legal area/year, e.g. CIV-2026-000001.
create or replace function next_case_code(p_tenant_id uuid, p_area_code text, p_year integer)
returns text
language plpgsql
as $$
declare
  v_next integer;
begin
  insert into case_area_sequences (tenant_id, area_code, year, last_value)
  values (p_tenant_id, p_area_code, p_year, 1)
  on conflict (tenant_id, area_code, year)
  do update set last_value = case_area_sequences.last_value + 1
  returning last_value into v_next;

  return p_area_code || '-' || p_year::text || '-' || lpad(v_next::text, 6, '0');
end;
$$;
