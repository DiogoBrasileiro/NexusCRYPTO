import { NextResponse, type NextRequest } from "next/server";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { getLegalDocument } from "@/lib/data/legal-documents";
import { getLetterheadSettings } from "@/lib/data/office-settings";
import { resolveEditorContent } from "@/lib/editor/resolve-content";
import { tiptapDocToBlocks } from "@/lib/export/doc-model";
import { renderLegalDocumentPdf } from "@/lib/export/pdf";
import { renderLegalDocumentDocx } from "@/lib/export/docx";

function slugify(text: string) {
  const combiningMarks = new RegExp("[\\u0300-\\u036f]", "g");
  const withoutAccents = text.normalize("NFD").replace(combiningMarks, "");
  return withoutAccents
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase()
    .slice(0, 80);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format");
  if (format !== "pdf" && format !== "docx") {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const context = await requireOfficeContext();
  const detail = await getLegalDocument(context.tenantId, id);
  if (!detail) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });

  const letterhead = await getLetterheadSettings(context.tenantId);
  const blocks = tiptapDocToBlocks(resolveEditorContent(detail.version?.content));
  const filename = `${slugify(detail.document.title) || "documento"}.${format}`;

  if (format === "pdf") {
    const buffer = await renderLegalDocumentPdf({ title: detail.document.title, blocks, letterhead: letterhead ?? null });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const buffer = await renderLegalDocumentDocx({ title: detail.document.title, blocks, letterhead: letterhead ?? null });
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
