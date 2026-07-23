import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-nexo-black px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nexo-lime text-sm font-bold text-nexo-black">
              N
            </span>
            <span className="text-base font-bold text-white">Nexo Jurídico</span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
            <Link href="/termos" className="hover:text-white">
              Termos
            </Link>
            <Link href="/privacidade" className="hover:text-white">
              Privacidade
            </Link>
            <a href="#seguranca" className="hover:text-white">
              Segurança
            </a>
            <Link href="/contato" className="hover:text-white">
              Contato
            </Link>
            <Link href="/master/login" className="hover:text-white">
              Gestão da plataforma
            </Link>
          </nav>
        </div>

        <p className="mt-8 max-w-[720px] text-xs leading-relaxed text-white/35">
          O NEXO Jurídico é uma ferramenta de apoio profissional. Toda análise, estratégia e documento produzido
          deve ser revisado e aprovado por advogado habilitado antes de qualquer uso.
        </p>
      </div>
    </footer>
  );
}
