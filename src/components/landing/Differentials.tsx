const CARDS = [
  {
    title: "Pensa como equipe",
    description:
      "Cada especialista recebe todo o contexto acumulado. O trabalho não recomeça do zero em cada etapa.",
  },
  {
    title: "Confronta a estratégia",
    description:
      "O sistema simula argumentos contrários, riscos, inconsistências e motivos de possível indeferimento.",
  },
  {
    title: "Produção real",
    description: "Petições, contratos, pareceres e documentos abrem diretamente em um editor profissional.",
  },
  {
    title: "Controle humano",
    description: "A IA sugere. O advogado aprova, rejeita, edita ou registra sua própria decisão.",
  },
  {
    title: "Documento final",
    description: "PDF, DOCX, texto limpo e timbrado do escritório.",
  },
  {
    title: "Isolamento",
    description: "Cada escritório opera em um ambiente independente.",
  },
];

export function Differentials() {
  return (
    <section className="border-t border-white/10 bg-nexo-black px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Por que o NEXO é diferente</h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.title} className="rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-base font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
