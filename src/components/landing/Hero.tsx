import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-nexo-black px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-[900px] text-center">
        <span className="inline-flex items-center rounded-nexo-pill border border-nexo-lime/30 bg-nexo-lime/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-nexo-lime">
          Copiloto jurídico com IA
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          O NEXO não substitui o advogado.
          <br />
          <span className="text-nexo-lime">Monta uma equipe de especialistas em IA para cada caso.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-[640px] text-base text-white/60 sm:text-lg">
          Analisa documentos, investiga fatos, identifica riscos, encontra fundamentos, constrói estratégias e
          produz documentos jurídicos completos para que o advogado decida com mais segurança e trabalhe muito
          mais rápido.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-nexo-pill bg-nexo-lime px-7 text-sm font-semibold text-nexo-black transition-colors hover:bg-nexo-lime-dark sm:w-auto"
          >
            Solicitar demonstração
          </Link>
          <a
            href="#como-funciona"
            className="flex h-12 w-full items-center justify-center rounded-nexo-pill border border-white/20 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/5 sm:w-auto"
          >
            Ver como funciona
          </a>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-nexo-lime/10 blur-[120px]"
      />
    </section>
  );
}
