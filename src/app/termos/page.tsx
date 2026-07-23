import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/landing/LegalPageLayout";

export const metadata: Metadata = { title: "Termos de uso — NEXO Jurídico" };

export default function TermsPage() {
  return (
    <LegalPageLayout title="Termos de uso">
      <p>
        O NEXO Jurídico é uma ferramenta de apoio ao trabalho de advogados e escritórios de advocacia. O uso da
        plataforma pressupõe a aceitação destes termos por parte do escritório contratante e de seus usuários.
      </p>

      <h2>Natureza da ferramenta</h2>
      <p>
        O NEXO não substitui o advogado nem exerce advocacia. Toda análise, estratégia, pesquisa e documento
        produzido pela plataforma é um subsídio de trabalho e deve ser revisado, corrigido e aprovado por
        profissional habilitado antes de qualquer uso perante clientes, terceiros ou órgãos públicos e judiciais.
      </p>

      <h2>Responsabilidade profissional</h2>
      <p>
        A responsabilidade técnica, ética e legal por qualquer peça, estratégia ou orientação entregue a um
        cliente é sempre do advogado responsável pelo caso, nos termos do Estatuto da Advocacia e do Código de
        Ética e Disciplina da OAB.
      </p>

      <h2>Uso da conta</h2>
      <p>
        Cada escritório opera em um ambiente isolado (tenant) e é responsável pela guarda de suas credenciais de
        acesso, pela veracidade dos dados cadastrados e pelo uso adequado feito por seus usuários.
      </p>

      <h2>Alterações</h2>
      <p>
        Estes termos podem ser atualizados para refletir mudanças na plataforma. Alterações relevantes serão
        comunicadas aos escritórios contratantes.
      </p>
    </LegalPageLayout>
  );
}
