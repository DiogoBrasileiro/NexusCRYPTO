import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getLegalDocument(tenantId: string, documentId: string) {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", documentId)
    .maybeSingle();
  if (!doc) return null;

  const { data: version } = doc.current_version_id
    ? await supabase.from("legal_document_versions").select("*").eq("id", doc.current_version_id).maybeSingle()
    : { data: null };

  const { data: caseRow } = doc.case_id
    ? await supabase.from("cases").select("id, code, title").eq("id", doc.case_id).maybeSingle()
    : { data: null };

  const { data: versions } = await supabase
    .from("legal_document_versions")
    .select("id, version_number, created_at")
    .eq("legal_document_id", documentId)
    .order("version_number", { ascending: false });

  return { document: doc, version, case: caseRow, versions: versions ?? [] };
}

export async function listLegalDocuments(tenantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("legal_documents")
    .select("id, title, document_type, status, case_id, updated_at")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false });
  return data ?? [];
}
