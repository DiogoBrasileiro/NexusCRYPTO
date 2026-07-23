export type ClientKind = "pessoa_fisica" | "pessoa_juridica";

export type ClientRow = {
  id: string;
  tenant_id: string;
  kind: ClientKind;
  full_name: string | null;
  cpf: string | null;
  nationality: string | null;
  marital_status: string | null;
  occupation: string | null;
  company_name: string | null;
  trade_name: string | null;
  cnpj: string | null;
  representative_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseOrigin =
  | "consulta_inicial"
  | "notificacao_judicial"
  | "processo_em_andamento"
  | "contrato_para_analise"
  | "cobranca_extrajudicial"
  | "parecer_juridico"
  | "defesa_administrativa"
  | "recurso"
  | "outro";

export type CaseStatus =
  | "aguardando_analise"
  | "em_producao"
  | "aguardando_decisao"
  | "pronto_protocolo"
  | "concluido"
  | "arquivado";

export type CaseDepth = "rapida" | "profissional" | "completa";
export type CaseExecutionMode = "supervisionado" | "automatico";

export type CaseRow = {
  id: string;
  tenant_id: string;
  code: string;
  origin: CaseOrigin;
  legal_area: string;
  legal_subarea: string | null;
  client_id: string;
  counterparty_name: string | null;
  counterparty_document: string | null;
  counterparty_address: string | null;
  counterparty_qualification: string | null;
  responsible_lawyer_id: string;
  team: string | null;
  title: string;
  short_summary: string | null;
  full_description: string;
  client_objective: string | null;
  expected_outcome: string | null;
  urgency: string | null;
  notes: string | null;
  process_number: string | null;
  court: string | null;
  district: string | null;
  jurisdiction: string | null;
  procedural_phase: string | null;
  case_value: number | null;
  depth: CaseDepth;
  execution_mode: CaseExecutionMode;
  status: CaseStatus;
  priority: string;
  next_action: string | null;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ActionItemStatus =
  | "pending"
  | "in_progress"
  | "waiting_document"
  | "waiting_decision"
  | "completed"
  | "cancelled";

export type CaseActionItemRow = {
  id: string;
  tenant_id: string;
  case_id: string;
  description: string;
  responsible_id: string | null;
  priority: string;
  status: ActionItemStatus;
  origin: string | null;
  manual_due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
