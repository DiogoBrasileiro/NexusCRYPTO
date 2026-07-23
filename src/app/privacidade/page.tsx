import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/landing/LegalPageLayout";

export const metadata: Metadata = { title: "Privacidade — NEXO Jurídico" };

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacidade">
      <p>
        O NEXO Jurídico trata dados pessoais e informações de casos de acordo com a Lei Geral de Proteção de
        Dados (Lei nº 13.709/2018) e com o sigilo profissional inerente à atividade advocatícia.
      </p>

      <h2>Isolamento entre escritórios</h2>
      <p>
        Cada escritório opera em um ambiente lógico independente. Dados de clientes, casos, documentos e peças de
        um escritório nunca são acessíveis por outro escritório, em nenhuma circunstância.
      </p>

      <h2>Uso dos dados pela inteligência artificial</h2>
      <p>
        Documentos e informações enviados a um caso são tratados como dado de entrada para a análise solicitada
        pelo advogado responsável — nunca como instrução autônoma de sistema. Nenhuma informação de um escritório
        é utilizada para treinar modelos compartilhados com outros escritórios.
      </p>

      <h2>Acesso da administração da plataforma</h2>
      <p>
        A equipe responsável pela operação do NEXO Jurídico (Master) acessa dados de um escritório apenas para
        fins de suporte técnico explicitamente registrado em auditoria, ou por determinação legal.
      </p>

      <h2>Direitos do titular</h2>
      <p>
        Solicitações relativas a dados pessoais tratados na plataforma podem ser encaminhadas ao escritório
        contratante, controlador dos dados de seus clientes, ou diretamente à administração do NEXO Jurídico.
      </p>
    </LegalPageLayout>
  );
}
