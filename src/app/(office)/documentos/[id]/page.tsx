import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { getLegalDocument } from "@/lib/data/legal-documents";
import { resolveEditorContent } from "@/lib/editor/resolve-content";
import { LegalDocumentEditor } from "@/components/editor/LegalDocumentEditor";
import { LegalDocumentStatusActions } from "@/components/editor/LegalDocumentStatusActions";
import { ExportMenu } from "@/components/editor/ExportMenu";

export const metadata: Metadata = { title: "Editor jurídico — NEXO Jurídico" };

export default async function LegalDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOfficeContext();
  const detail = await getLegalDocument(context.tenantId, id);
  if (!detail) notFound();

  const { document: doc, version, case: caseRow } = detail;

  return (
    <div className="mx-auto max-w-[900px]">
      {caseRow ? (
        <Link href={`/casos/${caseRow.id}`} className="text-sm text-nexo-text-secondary hover:text-nexo-text">
          ← {caseRow.code} · {caseRow.title}
        </Link>
      ) : (
        <Link href="/central-inteligencia" className="text-sm text-nexo-text-secondary hover:text-nexo-text">
          ← Inteligência
        </Link>
      )}

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-nexo-text">{doc.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <ExportMenu documentId={doc.id} />
          <LegalDocumentStatusActions documentId={doc.id} status={doc.status} />
        </div>
      </div>

      <div className="mt-6">
        <LegalDocumentEditor documentId={doc.id} initialContent={resolveEditorContent(version?.content)} />
      </div>
    </div>
  );
}
