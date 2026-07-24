import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { listCaseOptions } from "@/lib/data/cases";
import { getIntelligenceTask } from "@/lib/ai/intelligence-tasks";
import { IntelligenceProductionForm } from "@/components/office/intelligence/IntelligenceProductionForm";

export const metadata: Metadata = { title: "Nova produção — Inteligência — NEXO Jurídico" };

export default async function NewIntelligenceProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ tarefa?: string; casoId?: string }>;
}) {
  const { tarefa, casoId } = await searchParams;
  const task = tarefa ? getIntelligenceTask(tarefa) : undefined;
  if (!task) notFound();

  const context = await requireOfficeContext();
  const cases = await listCaseOptions(context.tenantId);

  return (
    <div className="mx-auto max-w-[720px]">
      <Link href="/central-inteligencia" className="text-sm text-nexo-text-secondary hover:text-nexo-text">
        ← Inteligência
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-nexo-text">{task.label}</h1>
      <p className="mt-1 text-sm text-nexo-text-secondary">{task.description}</p>

      <div className="mt-8 rounded-nexo-card border border-nexo-border bg-white p-6 sm:p-8">
        <IntelligenceProductionForm task={task} cases={cases} defaultCaseId={casoId} />
      </div>
    </div>
  );
}
