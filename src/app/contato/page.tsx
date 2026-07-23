import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/landing/LegalPageLayout";

export const metadata: Metadata = { title: "Contato — NEXO Jurídico" };

export default function ContactPage() {
  return (
    <LegalPageLayout title="Contato">
      <p>
        Para solicitar uma demonstração, tirar dúvidas comerciais ou reportar um problema técnico, entre em
        contato diretamente por e-mail.
      </p>

      <a
        href="mailto:contato@nexojuridico.com.br"
        className="inline-flex h-11 items-center justify-center rounded-nexo-pill bg-nexo-lime px-6 text-sm font-semibold text-nexo-black transition-colors hover:bg-nexo-lime-dark"
      >
        contato@nexojuridico.com.br
      </a>
    </LegalPageLayout>
  );
}
