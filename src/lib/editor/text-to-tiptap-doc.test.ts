import { describe, it, expect } from "vitest";
import { textToTiptapDoc, EMPTY_DOC } from "./text-to-tiptap-doc";

describe("textToTiptapDoc", () => {
  it("returns the empty doc for blank input", () => {
    expect(textToTiptapDoc("")).toEqual(EMPTY_DOC);
    expect(textToTiptapDoc("   \n  ")).toEqual(EMPTY_DOC);
  });

  it("converts a plain paragraph", () => {
    const doc = textToTiptapDoc("Olá, este é um parágrafo simples.");
    expect(doc.content).toHaveLength(1);
    expect(doc.content?.[0].type).toBe("paragraph");
  });

  it("converts markdown-style headings to heading nodes with capped level", () => {
    const doc = textToTiptapDoc("# Título principal\n\nTexto normal.");
    expect(doc.content?.[0]).toMatchObject({ type: "heading", attrs: { level: 2 } });

    const deep = textToTiptapDoc("#### Título profundo");
    expect(deep.content?.[0]).toMatchObject({ type: "heading", attrs: { level: 4 } });
  });

  it("converts bullet and ordered lists", () => {
    const bullets = textToTiptapDoc("- Item um\n- Item dois\n- Item três");
    expect(bullets.content?.[0].type).toBe("bulletList");
    expect(bullets.content?.[0].content).toHaveLength(3);

    const ordered = textToTiptapDoc("1. Primeiro\n2. Segundo");
    expect(ordered.content?.[0].type).toBe("orderedList");
  });

  it("converts blockquotes", () => {
    const doc = textToTiptapDoc("> Uma citação relevante.");
    expect(doc.content?.[0].type).toBe("blockquote");
  });

  it("applies bold and italic marks from ** and * markers", () => {
    const doc = textToTiptapDoc("Isto é **negrito** e isto é *itálico*.");
    const paragraph = doc.content?.[0];
    const boldNode = paragraph?.content?.find((n) => (n as { text?: string }).text === "negrito");
    expect(boldNode).toMatchObject({ marks: [{ type: "bold" }] });
    const italicNode = paragraph?.content?.find((n) => (n as { text?: string }).text === "itálico");
    expect(italicNode).toMatchObject({ marks: [{ type: "italic" }] });
  });

  it("never invents content for an empty block between blank lines", () => {
    const doc = textToTiptapDoc("Parágrafo um.\n\n\n\nParágrafo dois.");
    expect(doc.content).toHaveLength(2);
  });
});
