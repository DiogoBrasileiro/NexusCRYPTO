import type { TiptapNode } from "@/lib/editor/text-to-tiptap-doc";

export type Run = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };

export type Block =
  | { type: "paragraph"; runs: Run[] }
  | { type: "heading"; level: number; runs: Run[] }
  | { type: "blockquote"; runs: Run[] }
  | { type: "bulletList"; items: Run[][] }
  | { type: "orderedList"; items: Run[][] }
  | { type: "divider" };

/** Shared TipTap-JSON → block-tree walker used by both the PDF and DOCX exporters. */
export function tiptapDocToBlocks(doc: TiptapNode): Block[] {
  const blocks: Block[] = [];

  for (const node of doc.content ?? []) {
    switch (node.type) {
      case "paragraph":
        blocks.push({ type: "paragraph", runs: extractRuns(node) });
        break;
      case "heading":
        blocks.push({ type: "heading", level: Number(node.attrs?.level ?? 2), runs: extractRuns(node) });
        break;
      case "blockquote":
        blocks.push({ type: "blockquote", runs: (node.content ?? []).flatMap((p) => extractRuns(p)) });
        break;
      case "bulletList":
        blocks.push({ type: "bulletList", items: (node.content ?? []).map((li) => listItemRuns(li)) });
        break;
      case "orderedList":
        blocks.push({ type: "orderedList", items: (node.content ?? []).map((li) => listItemRuns(li)) });
        break;
      case "horizontalRule":
        blocks.push({ type: "divider" });
        break;
      default:
        break;
    }
  }

  return blocks;
}

function listItemRuns(listItem: TiptapNode): Run[] {
  return (listItem.content ?? []).flatMap((p) => extractRuns(p));
}

function extractRuns(node: TiptapNode): Run[] {
  const runs: Run[] = [];
  for (const child of node.content ?? []) {
    if (child.type !== "text") continue;
    const textNode = child as unknown as { text?: string; marks?: { type: string }[] };
    if (!textNode.text) continue;
    const marks = textNode.marks ?? [];
    runs.push({
      text: textNode.text,
      bold: marks.some((m) => m.type === "bold"),
      italic: marks.some((m) => m.type === "italic"),
      underline: marks.some((m) => m.type === "underline"),
    });
  }
  return runs;
}

export function blocksToPlainText(blocks: Block[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    if (block.type === "bulletList" || block.type === "orderedList") {
      block.items.forEach((item, index) => {
        const prefix = block.type === "bulletList" ? "- " : `${index + 1}. `;
        lines.push(prefix + item.map((r) => r.text).join(""));
      });
    } else if (block.type === "divider") {
      lines.push("—".repeat(20));
    } else {
      lines.push(block.runs.map((r) => r.text).join(""));
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}
