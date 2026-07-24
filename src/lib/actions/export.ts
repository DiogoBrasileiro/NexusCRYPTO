"use server";

import { requireOfficeContext } from "@/lib/auth/office-context";
import { getLegalDocument } from "@/lib/data/legal-documents";
import { resolveEditorContent } from "@/lib/editor/resolve-content";
import { tiptapDocToBlocks, blocksToPlainText } from "@/lib/export/doc-model";

export async function getDocumentPlainTextAction(documentId: string): Promise<string> {
  const context = await requireOfficeContext();
  const detail = await getLegalDocument(context.tenantId, documentId);
  if (!detail) throw new Error("Documento não encontrado.");

  const blocks = tiptapDocToBlocks(resolveEditorContent(detail.version?.content));
  return `${detail.document.title}\n\n${blocksToPlainText(blocks)}`;
}
