import { StageCard, type StageCardData } from "@/components/office/pipeline/StageCard";

export function PipelineStagesPanel({ caseId, stages }: { caseId: string; stages: StageCardData[] }) {
  if (stages.length === 0) {
    return <p className="text-sm text-nexo-text-secondary">Nenhuma etapa configurada para este caso.</p>;
  }

  return (
    <div className="space-y-3">
      {stages.map((stage) => (
        <StageCard key={stage.id} caseId={caseId} stage={stage} />
      ))}
    </div>
  );
}
