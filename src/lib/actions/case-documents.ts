"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { logAuditEvent } from "@/lib/audit/log";
import { validateUploadedFile } from "@/lib/security/file-validation";
import type { DocumentType } from "@/lib/types/database";

export type DocumentActionState = { error: string | null };

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const DOCUMENT_TYPES: DocumentType[] = [
  "identificacao",
  "procuracao",
  "contrato",
  "comprovante",
  "comunicacao",
  "prova",
  "laudo",
  "documento_judicial",
  "peticao",
  "planilha",
  "audio",
  "imagem",
  "outro",
];

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-120);
}

export async function uploadCaseDocumentAction(
  caseId: string,
  _prevState: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const context = await requireOfficeContext();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo para enviar." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "Arquivo maior que o limite de 25 MB." };
  }

  const validation = await validateUploadedFile(file);
  if (!validation.ok) return { error: validation.error };

  const documentTypeRaw = String(formData.get("documentType") ?? "outro");
  const documentType = DOCUMENT_TYPES.includes(documentTypeRaw as DocumentType)
    ? (documentTypeRaw as DocumentType)
    : "outro";
  const description = String(formData.get("description") ?? "").trim() || null;

  const supabase = await createClient();

  const { data: caseRow } = await supabase
    .from("cases")
    .select("id")
    .eq("tenant_id", context.tenantId)
    .eq("id", caseId)
    .maybeSingle();
  if (!caseRow) return { error: "Caso não encontrado." };

  const storagePath = `${context.tenantId}/${caseId}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from("case-documents").upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    return { error: "Não foi possível enviar o arquivo. Tente novamente." };
  }

  const { error: insertError } = await supabase.from("case_documents").insert({
    tenant_id: context.tenantId,
    case_id: caseId,
    uploader_id: context.userId,
    name: file.name,
    document_type: documentType,
    storage_path: storagePath,
    mime_type: file.type || "application/octet-stream",
    size_bytes: file.size,
    description,
    processing_status: "uploaded",
  });

  if (insertError) {
    await supabase.storage.from("case-documents").remove([storagePath]);
    return { error: "Não foi possível registrar o documento." };
  }

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "document_uploaded",
    entityType: "case_document",
    entityId: caseId,
    metadata: { fileName: file.name, documentType },
  });

  revalidatePath(`/casos/${caseId}`);
  return { error: null };
}

export async function deleteCaseDocumentAction(caseId: string, documentId: string) {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("case_documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("tenant_id", context.tenantId)
    .maybeSingle();

  if (!doc) throw new Error("Documento não encontrado.");

  await supabase.storage.from("case-documents").remove([doc.storage_path]);
  const { error } = await supabase.from("case_documents").delete().eq("id", documentId).eq("tenant_id", context.tenantId);
  if (error) throw new Error("Não foi possível excluir o documento.");

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "document_deleted",
    entityType: "case_document",
    entityId: documentId,
  });

  revalidatePath(`/casos/${caseId}`);
}

export async function getDocumentDownloadUrlAction(documentId: string): Promise<string> {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("case_documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("tenant_id", context.tenantId)
    .maybeSingle();

  if (!doc) throw new Error("Documento não encontrado.");

  const { data, error } = await supabase.storage.from("case-documents").createSignedUrl(doc.storage_path, 60);
  if (error || !data) throw new Error("Não foi possível gerar o link de download.");

  return data.signedUrl;
}
