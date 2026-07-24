import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} from "docx";
import type { Block, Run } from "@/lib/export/doc-model";
import type { LetterheadSettingsRow } from "@/lib/types/database";

function runsToTextRuns(runs: Run[]): TextRun[] {
  if (runs.length === 0) return [new TextRun("")];
  return runs.map((r) => new TextRun({ text: r.text, bold: r.bold, italics: r.italic, underline: r.underline ? {} : undefined }));
}

function blockToParagraphs(block: Block): Paragraph[] {
  switch (block.type) {
    case "heading":
      return [
        new Paragraph({
          heading: block.level <= 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
          children: runsToTextRuns(block.runs),
        }),
      ];
    case "blockquote":
      return [
        new Paragraph({
          indent: { left: 360 },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: "E5E8ED" } },
          spacing: { after: 160 },
          children: runsToTextRuns(block.runs),
        }),
      ];
    case "bulletList":
      return block.items.map(
        (item) =>
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: runsToTextRuns(item),
          }),
      );
    case "orderedList":
      return block.items.map(
        (item, index) =>
          new Paragraph({
            numbering: { reference: "nexo-numbering", level: 0 },
            spacing: { after: 80 },
            children: [new TextRun(`${index + 1}. `), ...runsToTextRuns(item)],
          }),
      );
    case "divider":
      return [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E5E8ED" } }, spacing: { after: 240 } })];
    case "paragraph":
    default:
      return [
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 160 },
          children: runsToTextRuns(block.runs),
        }),
      ];
  }
}

export async function renderLegalDocumentDocx(params: {
  title: string;
  blocks: Block[];
  letterhead: LetterheadSettingsRow | null;
}): Promise<Buffer> {
  const { title, blocks, letterhead } = params;
  const useLetterhead = letterhead?.use_letterhead ?? false;

  const headerParagraphs = useLetterhead
    ? [
        new Paragraph({
          children: [new TextRun({ text: letterhead?.office_name ?? "", bold: true, size: 20 })],
        }),
        ...(letterhead?.lawyer_name
          ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${letterhead.lawyer_name}${letterhead.oab_number ? ` · OAB ${letterhead.oab_number}` : ""}`,
                    size: 16,
                    color: "747D8C",
                  }),
                ],
              }),
            ]
          : []),
      ]
    : [];

  const footerParagraphs = useLetterhead
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: [letterhead?.address, letterhead?.footer_text].filter(Boolean).join(" · "), size: 14, color: "747D8C" }),
            new TextRun({ text: "   ", size: 14 }),
            new TextRun({ children: [PageNumber.CURRENT], size: 14, color: "747D8C" }),
          ],
        }),
      ]
    : [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 14, color: "747D8C" })],
        }),
      ];

  const doc = new Document({
    title,
    numbering: {
      config: [
        {
          reference: "nexo-numbering",
          levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }],
        },
      ],
    },
    sections: [
      {
        headers: { default: new Header({ children: headerParagraphs }) },
        footers: { default: new Footer({ children: footerParagraphs }) },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 320 },
            children: [new TextRun({ text: title, bold: true })],
          }),
          ...blocks.flatMap(blockToParagraphs),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
