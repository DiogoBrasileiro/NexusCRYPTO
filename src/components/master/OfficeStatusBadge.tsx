import type { OfficeStatus } from "@/lib/types/database";

export function OfficeStatusBadge({ status }: { status: OfficeStatus }) {
  const isActive = status === "active";
  return (
    <span
      className={`shrink-0 rounded-nexo-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        isActive ? "bg-nexo-success/15 text-nexo-success" : "bg-nexo-error/15 text-nexo-error"
      }`}
    >
      {isActive ? "Ativo" : "Bloqueado"}
    </span>
  );
}
