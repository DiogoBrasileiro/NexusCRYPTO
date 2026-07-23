import Link from "next/link";

export function FinalCta() {
  return (
    <section className="border-t border-white/10 bg-nexo-black px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[760px] text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          Transforme cada caso em uma linha de produção jurídica inteligente.
        </h2>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-nexo-pill bg-nexo-lime px-7 text-sm font-semibold text-nexo-black transition-colors hover:bg-nexo-lime-dark sm:w-auto"
          >
            Solicitar demonstração
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-nexo-pill border border-white/20 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/5 sm:w-auto"
          >
            Acessar sistema
          </Link>
        </div>
      </div>
    </section>
  );
}
