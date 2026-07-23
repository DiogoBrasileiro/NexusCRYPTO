const POINTS = [
  "Cada escritório possui ambiente próprio.",
  "Dados não cruzam tenants.",
  "Arquivos privados, com acesso apenas por URL assinada temporária.",
  "Permissões por perfil, validadas sempre no servidor.",
  "Auditoria de eventos sensíveis.",
  "Credenciais de IA protegidas — nunca expostas ao navegador.",
  "Decisão final sempre humana.",
];

export function Security() {
  return (
    <section id="seguranca" className="border-t border-white/10 bg-nexo-black-secondary px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[900px] text-center">
        <span className="inline-flex items-center rounded-nexo-pill border border-nexo-lime/30 bg-nexo-lime/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-nexo-lime">
          Segurança
        </span>
        <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          Segurança e isolamento entre escritórios
        </h2>

        <div className="mx-auto mt-10 grid max-w-[680px] grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {POINTS.map((point) => (
            <div key={point} className="flex items-start gap-3 rounded-nexo-field border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-nexo-lime" />
              <span className="text-sm text-white/70">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
