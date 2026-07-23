export type AccountScope = "master" | "office";
export type OfficeStatus = "active" | "blocked";
export type MembershipRole =
  | "administrador"
  | "socio"
  | "advogado"
  | "revisor"
  | "assistente"
  | "estagiario"
  | "somente_leitura";
export type MembershipStatus = "active" | "invited" | "suspended" | "removed";
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type TenantRow = {
  id: string;
  status: OfficeStatus;
  ai_monthly_execution_limit: number;
  created_at: string;
  updated_at: string;
};

export type OfficeProfileRow = {
  tenant_id: string;
  name: string;
  legal_name: string | null;
  cnpj: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  address: string | null;
  logo_url: string | null;
  responsible_name: string;
  responsible_email: string;
  responsible_role: string | null;
  responsible_phone: string | null;
  oab_number: string | null;
  user_limit: number;
  created_at: string;
  updated_at: string;
};

export type UserRow = {
  id: string;
  account_scope: AccountScope;
  full_name: string;
  email: string;
  phone: string | null;
  oab_number: string | null;
  oab_section: string | null;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MembershipRow = {
  id: string;
  tenant_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
};

export type InvitationRow = {
  id: string;
  tenant_id: string;
  email: string;
  role: MembershipRole;
  token_hash: string;
  status: InvitationStatus;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};
