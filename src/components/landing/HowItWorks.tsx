const STEPS = [
  {
    number: "1",
    title: "Cadastre o caso",
    description: "Informe cliente, área jurídica, fatos, objetivo e contexto.",
  },
  {
    number: "2",
    title: "Anexe os documentos",
    description: "Envie processos, notificações, contratos, provas, imagens e arquivos.",
  },
  {
    number: "3",
    title: "Escolha a profundidade",
    description: "Rápida, Profissional ou Completa — de acordo com a complexidade do caso.",
  },
  {
    number: "4",
    title: "A equipe de especialistas trabalha",
    description: "Cada agente analisa uma parte específica do caso, um sobre a base do outro.",
  },
  {
    number: "5",
    title: "Receba o resultado",
    description: "Estratégia, documento, plano de ação e versão final pronta para revisão.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-white/10 bg-nexo-black px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Como funciona</h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <div key={step.number} className="rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-nexo-lime text-sm font-bold text-nexo-black">
                {step.number}
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
