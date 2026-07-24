"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { logAuditEvent } from "@/lib/audit/log";
import type { LegalDocumentStatus } from "@/lib/types/database";

export type LegalDocActionResult = { ok: true } | { ok: false; error: string };

/**
 * In-place update of the current draft version's content — used for
 * autosave while the document is still a draft. §66 forbids overwriting an
 * *approved* version, so this refuses once the document has moved past
 * draft/waiting_review.
 */
export async function autosaveLegalDocumentAction(documentId: string, contentJson: unknown): Promise<LegalDocActionResult> {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("legal_documents")
    .select("id, status, current_version_id")
    .eq("id", documentId)
    .eq("tenant_id", context.tenantId)
    .maybeSingle();

  if (!doc) return { ok: false, error: "Documento não encontrado." };
  if (!["draft", "waiting_review", "changes_requested"].includes(doc.status)) {
    return { ok: false, error: "Este documento não pode mais ser editado nesta versão." };
  }
  if (!doc.current_version_id) return { ok: false, error: "Nenhuma versão para salvar." };

  const { error } = await supabase
    .from("legal_document_versions")
    .update({ content: contentJson as Record<string, unknown> })
    .eq("id", doc.current_version_id);

  if (error) return { ok: false, error: "Não foi possível salvar." };
  return { ok: true };
}

export async function saveNewVersionAction(documentId: string, contentJson: unknown): Promise<LegalDocActionResult> {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("legal_documents")
    .select("id, status")
    .eq("id", documentId)
    .eq("tenant_id", context.tenantId)
    .maybeSingle();
  if (!doc) return { ok: false, error: "Documento não encontrado." };

  const { count } = await supabase
    .from("legal_document_versions")
    .select("id", { count: "exact", head: true })
    .eq("legal_document_id", documentId);

  const { data: newVersion, error } = await supabase
    .from("legal_document_versions")
    .insert({
      tenant_id: context.tenantId,
      legal_document_id: documentId,
      version_number: (count ?? 0) + 1,
      content: contentJson as Record<string, unknown>,
      author_id: context.userId,
    })
    .select("id")
    .single();

  if (error || !newVersion) return { ok: false, error: "Não foi possível salvar a nova versão." };

  await supabase.from("legal_documents").update({ current_version_id: newVersion.id }).eq("id", documentId);

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "legal_document_version_saved",
    entityType: "legal_document",
    entityId: documentId,
  });

  revalidatePath(`/documentos/${documentId}`);
  return { ok: true };
}

export async function updateLegalDocumentStatusAction(
  documentId: string,
  status: LegalDocumentStatus,
): Promise<LegalDocActionResult> {
  const context = await requireOfficeContext();
  const supabase = await createClient();

  const update: { status: LegalDocumentStatus; filed_at?: string; reviewer_id?: string } = { status };
  if (status === "filed") update.filed_at = new Date().toISOString();
  if (status === "approved" || status === "ready_to_file") update.reviewer_id = context.userId;

  const { error } = await supabase
    .from("legal_documents")
    .update(update)
    .eq("id", documentId)
    .eq("tenant_id", context.tenantId);

  if (error) return { ok: false, error: "Não foi possível atualizar o status." };

  await logAuditEvent({
    tenantId: context.tenantId,
    actorId: context.userId,
    actorScope: "office",
    eventType: "legal_document_status_changed",
    entityType: "legal_document",
    entityId: documentId,
    metadata: { status },
  });

  revalidatePath(`/documentos/${documentId}`);
  return { ok: true };
}
