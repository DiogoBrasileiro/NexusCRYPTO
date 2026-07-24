import { EMPTY_DOC, type TiptapNode } from "@/lib/editor/text-to-tiptap-doc";

/**
 * legal_document_versions.content always holds a TipTap JSON document
 * ({ type: "doc", ... }). This just guards against a missing/malformed row
 * so the editor always has something valid to mount.
 */
export function resolveEditorContent(content: Record<string, unknown> | null | undefined): TiptapNode {
  if (content && content.type === "doc" && Array.isArray(content.content)) {
    return content as unknown as TiptapNode;
  }
  return EMPTY_DOC;
}
