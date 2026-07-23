const ITEMS = [
  "Petição inicial",
  "Contestação",
  "Réplica",
  "Recurso",
  "Manifestação",
  "Parecer",
  "Contrato",
  "Revisão contratual",
  "Notificação",
  "Acordo",
  "Procuração",
  "Defesa administrativa",
  "Pesquisa legislativa",
  "Pesquisa jurisprudencial",
  "Auditoria jurídica",
  "Resumo processual",
  "Estratégia",
  "Análise documental",
];

export function Productions() {
  return (
    <section id="producoes" className="border-t border-white/10 bg-nexo-black-secondary px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[1180px] text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">O que o NEXO produz</h2>
        <p className="mx-auto mt-4 max-w-[640px] text-base text-white/60">
          Cada peça sai fundamentada, revisável e pronta para o editor jurídico — nunca como um bloco de texto solto.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-2.5">
          {ITEMS.map((item) => (
            <span
              key={item}
              className="rounded-nexo-pill border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-white/80"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
