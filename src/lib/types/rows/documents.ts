export type DocumentType =
  | "identificacao"
  | "procuracao"
  | "contrato"
  | "comprovante"
  | "comunicacao"
  | "prova"
  | "laudo"
  | "documento_judicial"
  | "peticao"
  | "planilha"
  | "audio"
  | "imagem"
  | "outro";

export type DocumentProcessingStatus = "uploaded" | "processing" | "processed" | "needs_review" | "error";

export type CaseDocumentRow = {
  id: string;
  tenant_id: string;
  case_id: string;
  client_id: string | null;
  uploader_id: string | null;
  name: string;
  document_type: DocumentType;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  description: string | null;
  origin: string | null;
  processing_status: DocumentProcessingStatus;
  extracted_text: string | null;
  file_hash: string | null;
  related_stage_key: string | null;
  used_by_ai: boolean;
  created_at: string;
  updated_at: string;
};

export type LetterheadSettingsRow = {
  tenant_id: string;
  use_letterhead: boolean;
  logo_url: string | null;
  office_name: string | null;
  legal_name: string | null;
  cnpj: string | null;
  lawyer_name: string | null;
  oab_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  header_text: string | null;
  footer_text: string | null;
  watermark_text: string | null;
  signature_image_url: string | null;
  brand_color: string | null;
  margins: { top: number; bottom: number; left: number; right: number };
  font_family: string | null;
  numbering_style: string | null;
  updated_at: string;
};
