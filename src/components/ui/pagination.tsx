import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  buildHref,
  dark = false,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  dark?: boolean;
}) {
  if (totalPages <= 1) return null;

  const linkClass = dark
    ? "rounded-nexo-pill border border-white/15 px-3.5 py-1.5 hover:bg-white/5"
    : "rounded-nexo-pill border border-nexo-border px-3.5 py-1.5 hover:bg-nexo-panel-bg";
  const textClass = dark ? "text-white/50" : "text-nexo-text-secondary";

  return (
    <div className={`mt-4 flex items-center justify-between text-sm ${textClass}`}>
      <span>
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={buildHref(page - 1)} className={linkClass}>
            Anterior
          </Link>
        )}
        {page < totalPages && (
          <Link href={buildHref(page + 1)} className={linkClass}>
            Próxima
          </Link>
        )}
      </div>
    </div>
  );
}
