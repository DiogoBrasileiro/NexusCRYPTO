const TRADITIONAL = ["Organizam.", "Armazenam.", "Controlam.", "Registram."];
const NEXO = ["Interpreta.", "Investiga.", "Questiona.", "Estrutura.", "Produz.", "Revisa."];

export function Positioning() {
  return (
    <section className="border-t border-white/10 bg-nexo-black px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[1000px] text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          Enquanto outros sistemas organizam processos, o NEXO ajuda a pensar.
        </h2>
        <p className="mx-auto mt-5 max-w-[720px] text-base text-white/60">
          O NEXO não é um ERP jurídico com dezenas de módulos administrativos. Ele estrutura uma linha de produção
          jurídica com inteligência artificial, na qual cada especialista recebe o trabalho anterior, aprofunda a
          análise e entrega uma base mais sólida para a etapa seguinte.
        </p>

        <div className="mx-auto mt-12 grid max-w-[680px] grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-nexo-card border border-white/10 bg-white/[0.03] p-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Sistemas tradicionais</p>
            <ul className="mt-4 space-y-2.5">
              {TRADITIONAL.map((item) => (
                <li key={item} className="text-sm text-white/60">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-nexo-card border border-nexo-lime/30 bg-nexo-lime/5 p-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-nexo-lime">Nexo</p>
            <ul className="mt-4 space-y-2.5">
              {NEXO.map((item) => (
                <li key={item} className="text-sm font-medium text-white">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
