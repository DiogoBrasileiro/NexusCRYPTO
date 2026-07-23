const FEATURES = [
  "Sem Markdown, sem JSON, sem aparência de chat.",
  "Dados do cliente, parte contrária e processo preenchidos automaticamente.",
  "Campos pendentes destacados até serem confirmados pelo advogado.",
  "Timbrado do escritório aplicado ao documento final.",
  "Histórico de versões preservado a cada revisão.",
  "Copiar texto limpo, exportar em PDF ou DOCX.",
];

export function EditorPreview() {
  return (
    <section className="border-t border-white/10 bg-nexo-black px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Um editor jurídico de verdade, não um chat.
          </h2>
          <p className="mt-4 text-base text-white/60">
            Toda produção final abre em uma página A4, pronta para revisão — como um documento, não como uma
            resposta de conversa.
          </p>
          <ul className="mt-7 space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-white/70">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-nexo-lime" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[380px] rounded-nexo-modal border border-white/10 bg-nexo-black-secondary p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>
            <div className="aspect-[210/297] rounded-lg bg-white p-6 text-nexo-text shadow-2xl">
              <div className="h-2.5 w-2/3 rounded bg-nexo-text/10" />
              <div className="mt-6 h-2 w-full rounded bg-nexo-text/10" />
              <div className="mt-2 h-2 w-full rounded bg-nexo-text/10" />
              <div className="mt-2 h-2 w-5/6 rounded bg-nexo-text/10" />
              <div className="mt-5 h-2 w-full rounded bg-nexo-text/10" />
              <div className="mt-2 h-2 w-full rounded bg-nexo-text/10" />
              <div className="mt-2 h-2 w-3/4 rounded bg-nexo-lime/60" />
              <div className="mt-6 h-2 w-full rounded bg-nexo-text/10" />
              <div className="mt-2 h-2 w-2/3 rounded bg-nexo-text/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
