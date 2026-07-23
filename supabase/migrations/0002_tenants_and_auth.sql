-- NEXO Jurídico — tenants, escritórios, usuários, memberships e convites.

create table tenants (
  id uuid primary key default gen_random_uuid(),
  status office_status not null default 'active',
  ai_monthly_execution_limit integer not null default 200,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table office_profiles (
  tenant_id uuid primary key references tenants (id) on delete cascade,
  name text not null,
  legal_name text,
  cnpj text,
  phone text,
  whatsapp text,
  email text,
  website text,
  city text,
  state text,
  cep text,
  address text,
  logo_url text,
  responsible_name text not null,
  responsible_email text not null,
  responsible_role text,
  responsible_phone text,
  user_limit integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mirrors auth.users; created via trigger on signup / invitation acceptance.
create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  account_scope account_scope not null default 'office',
  full_name text not null,
  email text not null,
  phone text,
  oab_number text,
  oab_section text,
  avatar_url text,
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index users_email_key on users (lower(email));

create table memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  role membership_role not null default 'advogado',
  status membership_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create index memberships_user_id_idx on memberships (user_id);
create index memberships_tenant_id_idx on memberships (tenant_id);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  email text not null,
  role membership_role not null default 'advogado',
  token_hash text not null unique,
  status invitation_status not null default 'pending',
  invited_by uuid references users (id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index invitations_tenant_id_idx on invitations (tenant_id);
create index invitations_email_idx on invitations (lower(email));

-- Helper: is the current session a platform master operator?
create or replace function is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from users
    where id = auth.uid()
      and account_scope = 'master'
      and is_active = true
  );
$$;

-- Helper: tenant ids the current session belongs to as an active member.
create or replace function my_tenant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from memberships
  where user_id = auth.uid()
    and status = 'active';
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tenants_set_updated_at before update on tenants
  for each row execute function set_updated_at();
create trigger office_profiles_set_updated_at before update on office_profiles
  for each row execute function set_updated_at();
create trigger users_set_updated_at before update on users
  for each row execute function set_updated_at();
create trigger memberships_set_updated_at before update on memberships
  for each row execute function set_updated_at();
