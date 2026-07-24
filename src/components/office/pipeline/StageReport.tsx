import type { StageAnalysis } from "@/lib/ai/stage-analysis";

const CONFIDENCE_LABELS: Record<StageAnalysis["confidence"], string> = {
  alta: "Confiança alta",
  media: "Confiança média",
  baixa: "Confiança baixa",
};

const VERIFICATION_LABELS: Record<StageAnalysis["verification_status"], string> = {
  verificado: "Fontes verificadas",
  parcial: "Verificação parcial",
  nao_verificado: "Fontes ainda não verificadas",
};

function ReportList({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-nexo-text-secondary">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm text-nexo-text">
            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-nexo-text-secondary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StageReport({ analysis }: { analysis: StageAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-nexo-pill bg-nexo-panel-bg px-2.5 py-1 text-[11px] font-semibold text-nexo-text-secondary">
          {CONFIDENCE_LABELS[analysis.confidence]}
        </span>
        <span
          className={`rounded-nexo-pill px-2.5 py-1 text-[11px] font-semibold ${
            analysis.verification_status === "verificado"
              ? "bg-nexo-success/15 text-nexo-success"
              : "bg-nexo-warning/15 text-nexo-warning"
          }`}
        >
          {VERIFICATION_LABELS[analysis.verification_status]}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-nexo-text">{analysis.stage_summary}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ReportList title="Principais achados" items={analysis.findings} />
        <ReportList title="Fatos considerados" items={analysis.facts_considered} />
        <ReportList title="Fundamentos legais" items={analysis.legal_basis} />
        <ReportList title="Jurisprudência" items={analysis.jurisprudence} />
        <ReportList title="Riscos" items={analysis.risks} />
        <ReportList title="Contradições" items={analysis.contradictions} />
        <ReportList title="Informações ausentes" items={analysis.missing_information} />
        <ReportList title="Recomendações" items={analysis.recommendations} />
      </div>

      {analysis.next_stage_guidance && (
        <div className="rounded-nexo-field bg-nexo-panel-bg p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-nexo-text-secondary">Orientação para a próxima etapa</p>
          <p className="mt-1 text-sm text-nexo-text">{analysis.next_stage_guidance}</p>
        </div>
      )}
    </div>
  );
}
