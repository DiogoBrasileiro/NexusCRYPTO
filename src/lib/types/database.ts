// Tipos das tabelas usadas pelo app nesta fase (autenticação, tenants,
// escritórios, membros, convites, config. de IA e auditoria).
//
// Isto é escrito à mão para as tabelas hoje consumidas pelo frontend/Server
// Actions. Quando um projeto Supabase real existir, substitua por
// `supabase gen types typescript --project-id <id>` e faça o merge das
// tabelas ainda não geradas automaticamente (pipeline, documentos, peças
// jurídicas etc., já criadas nas migrations mas usadas só a partir da Fase 4+).
//
// Nota: os tipos de linha usam `type` (não `interface`) — interfaces não
// recebem assinatura de índice implícita e quebram a checagem estrutural do
// supabase-js contra `Record<string, unknown>`.

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

export type GlobalAiSettingsRow = {
  id: true;
  provider: string;
  model: string;
  api_key_ciphertext: string | null;
  api_key_last_four: string | null;
  is_active: boolean;
  max_output_tokens: number;
  timeout_seconds: number;
  max_retries: number;
  global_monthly_execution_limit: number;
  default_office_monthly_limit: number;
  updated_by: string | null;
  updated_at: string;
};

export type AuditLogRow = {
  id: string;
  tenant_id: string | null;
  actor_id: string | null;
  actor_scope: AccountScope | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
};

type NoRelationships = { Relationships: [] };

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13.0.5" };
  public: {
    Tables: {
      tenants: { Row: TenantRow; Insert: Partial<TenantRow>; Update: Partial<TenantRow> } & NoRelationships;
      office_profiles: {
        Row: OfficeProfileRow;
        Insert: Partial<OfficeProfileRow> & Pick<OfficeProfileRow, "tenant_id" | "name" | "responsible_name" | "responsible_email">;
        Update: Partial<OfficeProfileRow>;
      } & NoRelationships;
      users: {
        Row: UserRow;
        Insert: Partial<UserRow> & Pick<UserRow, "id" | "full_name" | "email">;
        Update: Partial<UserRow>;
      } & NoRelationships;
      memberships: {
        Row: MembershipRow;
        Insert: Partial<MembershipRow> & Pick<MembershipRow, "tenant_id" | "user_id">;
        Update: Partial<MembershipRow>;
      } & NoRelationships;
      invitations: {
        Row: InvitationRow;
        Insert: Partial<InvitationRow> & Pick<InvitationRow, "tenant_id" | "email" | "token_hash" | "expires_at">;
        Update: Partial<InvitationRow>;
      } & NoRelationships;
      global_ai_settings: {
        Row: GlobalAiSettingsRow;
        Insert: Partial<GlobalAiSettingsRow>;
        Update: Partial<GlobalAiSettingsRow>;
      } & NoRelationships;
      audit_logs: {
        Row: AuditLogRow;
        Insert: Partial<AuditLogRow> & Pick<AuditLogRow, "event_type">;
        Update: Partial<AuditLogRow>;
      } & NoRelationships;
    };
    Views: Record<string, never>;
    Functions: {
      log_audit_event: {
        Args: {
          p_tenant_id: string | null;
          p_actor_id: string | null;
          p_actor_scope: AccountScope | null;
          p_event_type: string;
          p_entity_type: string | null;
          p_entity_id: string | null;
          p_metadata: Record<string, unknown>;
        };
        Returns: string;
      };
      is_master: { Args: Record<string, never>; Returns: boolean };
      next_case_code: {
        Args: { p_tenant_id: string; p_area_code: string; p_year: number };
        Returns: string;
      };
      tenant_ai_executions_this_month: {
        Args: { p_tenant_id: string };
        Returns: number;
      };
    };
  };
};
