export type TiptapMark = { type: "bold" | "italic" };
export type TiptapTextNode = { type: "text"; text: string; marks?: TiptapMark[] };
export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
};

export const EMPTY_DOC: TiptapNode = { type: "doc", content: [{ type: "paragraph" }] };

/**
 * Converts AI-produced plain text (which sometimes carries Markdown-ish
 * artifacts: #, ##, **bold**, *italic*, "- " lists, "1. " lists, "> "
 * quotes) directly into a TipTap JSON document — the single canonical
 * storage format for legal_document_versions.content. §63: the editor (and
 * any export) must never show raw Markdown/JSON to the lawyer; converting
 * at ingestion time means every downstream consumer (editor, PDF, DOCX)
 * shares one already-clean representation instead of re-parsing text.
 */
export function textToTiptapDoc(raw: string): TiptapNode {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return EMPTY_DOC;

  const blocks = text.split(/\n{2,}/);
  const content: TiptapNode[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const isBulletList = lines.every((l) => /^[-*]\s+/.test(l));
    const isOrderedList = lines.every((l) => /^\d+[.)]\s+/.test(l));

    if (isBulletList || isOrderedList) {
      content.push({
        type: isBulletList ? "bulletList" : "orderedList",
        content: lines.map((l) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: inlineNodes(l.replace(/^([-*]|\d+[.)])\s+/, "")) }],
        })),
      });
      continue;
    }

    const singleLine = lines.join(" ");
    const headingMatch = singleLine.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length + 1, 4);
      content.push({ type: "heading", attrs: { level }, content: inlineNodes(headingMatch[2]) });
      continue;
    }

    if (/^>\s?/.test(singleLine)) {
      content.push({
        type: "blockquote",
        content: [{ type: "paragraph", content: inlineNodes(singleLine.replace(/^>\s?/, "")) }],
      });
      continue;
    }

    content.push({ type: "paragraph", content: inlineNodes(singleLine) });
  }

  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}

function inlineNodes(text: string): TiptapTextNode[] {
  // Splits on **bold** and *italic* markers, preserving plain runs between them.
  const tokens = text.split(/(\*\*.+?\*\*|\*.+?\*)/g).filter(Boolean);
  return tokens.map((token) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return { type: "text", text: token.slice(2, -2), marks: [{ type: "bold" }] };
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return { type: "text", text: token.slice(1, -1), marks: [{ type: "italic" }] };
    }
    return { type: "text", text: token };
  });
}
