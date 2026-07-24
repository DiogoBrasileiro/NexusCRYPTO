import type { Metadata } from "next";
import Link from "next/link";
import { INTELLIGENCE_TASKS } from "@/lib/ai/intelligence-tasks";

export const metadata: Metadata = { title: "Inteligência — NEXO Jurídico" };

export default function IntelligencePage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-nexo-text-secondary">Laboratório jurídico</p>
      <h1 className="mt-1 text-2xl font-bold text-nexo-text">Inteligência</h1>
      <p className="mt-1 text-sm text-nexo-text-secondary">Escolha o trabalho jurídico. A IA produz e você revisa.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTELLIGENCE_TASKS.map((task) => (
          <Link
            key={task.key}
            href={`/central-inteligencia/novo?tarefa=${task.key}`}
            className="rounded-nexo-card border border-nexo-border bg-white p-5 transition-colors hover:border-nexo-lime-dark hover:bg-nexo-panel-bg"
          >
            <h2 className="text-sm font-semibold text-nexo-text">{task.label}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-nexo-text-secondary">{task.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
