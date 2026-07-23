export type LegalDocumentStatus =
  | "draft"
  | "waiting_review"
  | "changes_requested"
  | "approved"
  | "ready_to_file"
  | "filed"
  | "archived";

export type LegalDocumentRow = {
  id: string;
  tenant_id: string;
  case_id: string | null;
  client_id: string | null;
  document_type: string;
  title: string;
  status: LegalDocumentStatus;
  current_version_id: string | null;
  author_id: string | null;
  reviewer_id: string | null;
  filed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LegalDocumentVersionRow = {
  id: string;
  tenant_id: string;
  legal_document_id: string;
  version_number: number;
  content: Record<string, unknown>;
  content_hash: string | null;
  author_id: string | null;
  created_at: string;
};
