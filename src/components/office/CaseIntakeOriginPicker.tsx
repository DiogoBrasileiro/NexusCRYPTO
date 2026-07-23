import Link from "next/link";
import { CASE_ORIGINS } from "@/lib/domain/case-origins";

export function CaseIntakeOriginPicker({ clienteId }: { clienteId?: string }) {
  return (
    <div>
      <p className="text-center text-sm font-medium text-nexo-text-secondary">Como este caso chegou ao escritório?</p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CASE_ORIGINS.map((origin) => (
          <Link
            key={origin.value}
            href={`/casos/novo?origem=${origin.value}${clienteId ? `&clienteId=${clienteId}` : ""}`}
            className="rounded-nexo-card border border-nexo-border bg-white p-5 transition-colors hover:border-nexo-lime-dark hover:bg-nexo-panel-bg"
          >
            <h3 className="text-sm font-semibold text-nexo-text">{origin.label}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nexo-text-secondary">{origin.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
