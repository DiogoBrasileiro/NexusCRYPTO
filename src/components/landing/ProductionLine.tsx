const STAGES = [
  "Triagem",
  "Investigação",
  "Dossiê",
  "Pesquisa Jurídica",
  "Estratégia",
  "Mesa de Estratégia",
  "Simulação",
  "Produção",
  "Auditoria",
  "Julgador",
  "Refinamento",
  "Entrega",
];

export function ProductionLine() {
  return (
    <section id="especialistas" className="border-t border-white/10 bg-nexo-black-secondary px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[1180px] text-center">
        <span className="inline-flex items-center rounded-nexo-pill border border-nexo-lime/30 bg-nexo-lime/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-nexo-lime">
          Linha de Produção Jurídica
        </span>
        <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          Até 12 especialistas trabalhando em sequência
        </h2>
        <p className="mt-4 text-base text-white/60">O advogado aprova, orienta e decide em cada checkpoint.</p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {STAGES.map((stage, index) => (
            <div key={stage} className="flex items-center gap-2">
              <span className="rounded-nexo-pill border border-white/15 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80">
                {stage}
              </span>
              {index < STAGES.length - 1 && (
                <span aria-hidden className="text-white/25">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
