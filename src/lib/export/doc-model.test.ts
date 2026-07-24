import { describe, it, expect } from "vitest";
import { tiptapDocToBlocks, blocksToPlainText } from "./doc-model";
import { textToTiptapDoc } from "@/lib/editor/text-to-tiptap-doc";

describe("tiptapDocToBlocks + blocksToPlainText", () => {
  it("round-trips a paragraph with bold text", () => {
    const doc = textToTiptapDoc("Olá **mundo**, tudo bem?");
    const blocks = tiptapDocToBlocks(doc);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ type: "paragraph" });
    if (blocks[0].type === "paragraph") {
      const boldRun = blocks[0].runs.find((r) => r.text === "mundo");
      expect(boldRun?.bold).toBe(true);
    }
  });

  it("round-trips headings and lists", () => {
    const doc = textToTiptapDoc("# Seção 1\n\n- Um\n- Dois\n\n1. Primeiro\n2. Segundo");
    const blocks = tiptapDocToBlocks(doc);
    expect(blocks[0]).toMatchObject({ type: "heading", level: 2 });
    expect(blocks[1]).toMatchObject({ type: "bulletList" });
    expect(blocks[2]).toMatchObject({ type: "orderedList" });
  });

  it("produces readable plain text with numbered/bulleted prefixes", () => {
    const doc = textToTiptapDoc("Introdução.\n\n- Primeiro ponto\n- Segundo ponto");
    const text = blocksToPlainText(tiptapDocToBlocks(doc));
    expect(text).toContain("Introdução.");
    expect(text).toContain("- Primeiro ponto");
    expect(text).toContain("- Segundo ponto");
  });

  it("handles an empty document without throwing", () => {
    const blocks = tiptapDocToBlocks({ type: "doc", content: [] });
    expect(blocks).toEqual([]);
    expect(blocksToPlainText(blocks)).toBe("");
  });
});
