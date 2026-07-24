// Registry for the Inteligência grid (§60-62). Each task shares the same
// single-shot production engine (lib/actions/intelligence.ts) — what makes
// them distinct specialists is only the mandate text and the resulting
// legal_documents.document_type, not separate code paths.

export type IntelligenceTask = {
  key: string;
  label: string;
  description: string;
  documentType: string;
  mandate: string;
  requiresCase?: boolean;
};

export const INTELLIGENCE_TASKS: IntelligenceTask[] = [
  {
    key: "peticao_inicial",
    label: "Elaborar Petição Inicial",
    description: "Produz a petição inicial com base no caso e nos fatos fornecidos.",
    documentType: "peticao_inicial",
    mandate: "Redija uma petição inicial completa: endereçamento, qualificação das partes, dos fatos, do direito, dos pedidos, valor da causa e fecho. Baseie-se estritamente nos fatos e documentos fornecidos.",
  },
  {
    key: "contestacao",
    label: "Elaborar Contestação",
    description: "Produz a contestação em resposta a uma petição inicial.",
    documentType: "contestacao",
    mandate: "Redija uma contestação: preliminares cabíveis, impugnação especificada dos fatos, fundamentos da defesa e pedidos. Aponte claramente quando uma preliminar depender de verificação processual não disponível no contexto.",
  },
  {
    key: "replica",
    label: "Elaborar Réplica",
    description: "Produz a réplica à contestação apresentada pela parte contrária.",
    documentType: "replica",
    mandate: "Redija a réplica, rebatendo especificamente os pontos da contestação informados no contexto, sem repetir argumentos da inicial que não tenham sido impugnados.",
  },
  {
    key: "recurso",
    label: "Elaborar Recurso",
    description: "Produz recurso contra decisão ou sentença.",
    documentType: "recurso",
    mandate: "Redija o recurso cabível com base na decisão informada: cabimento, tempestividade (marque como pendente se a data não for informada), razões recursais e pedido de reforma.",
  },
  {
    key: "parecer",
    label: "Produzir Parecer",
    description: "Produz um parecer jurídico técnico sobre a questão apresentada.",
    documentType: "parecer",
    mandate: "Redija um parecer jurídico: ementa, relatório da consulta, fundamentação técnica considerando argumentos favoráveis e contrários, e conclusão objetiva.",
  },
  {
    key: "contrato",
    label: "Elaborar Contrato",
    description: "Produz uma minuta de contrato a partir do objetivo descrito.",
    documentType: "contrato",
    mandate: "Redija uma minuta de contrato: qualificação das partes, objeto, obrigações, prazo, valor e forma de pagamento, rescisão, foro e cláusulas gerais pertinentes ao objeto descrito.",
  },
  {
    key: "revisar_contrato",
    label: "Revisar Contrato",
    description: "Revisa um contrato existente, apontando riscos e sugerindo ajustes.",
    documentType: "revisao_contratual",
    mandate: "Revise o contrato fornecido no contexto: identifique cláusulas de risco, ambiguidades, ausências relevantes e sugira redação alternativa para cada ponto, mantendo o restante do texto original.",
  },
  {
    key: "estrategia_processual",
    label: "Estratégia Processual",
    description: "Produz um relatório de estratégia processual para o caso.",
    documentType: "relatorio_estrategia",
    mandate: "Produza um relatório de estratégia: estratégia principal, alternativas, riscos, competência e rito prováveis, e provas necessárias.",
  },
  {
    key: "pesquisa_jurisprudencial",
    label: "Pesquisa Jurisprudencial",
    description: "Produz um relatório de pesquisa jurisprudencial sobre o tema.",
    documentType: "pesquisa_jurisprudencial",
    mandate: "Produza um relatório de pesquisa jurisprudencial. Se não houver como verificar precedentes reais neste contexto, declare isso expressamente em vez de citar jurisprudência não verificada.",
  },
  {
    key: "pesquisa_legislativa",
    label: "Pesquisa Legislativa",
    description: "Produz um relatório de pesquisa legislativa sobre o tema.",
    documentType: "pesquisa_legislativa",
    mandate: "Produza um relatório de pesquisa legislativa: diplomas aplicáveis, artigos relevantes e eventual conflito de normas, marcando tudo que não pôde ser verificado em fonte oficial.",
  },
  {
    key: "auditoria_juridica",
    label: "Auditoria Jurídica",
    description: "Audita o caso ou documento em busca de riscos e inconsistências.",
    documentType: "auditoria",
    mandate: "Produza um relatório de auditoria jurídica: riscos, inconsistências, requisitos ausentes e recomendações de correção.",
  },
  {
    key: "simular_defesa",
    label: "Simular Defesa",
    description: "Simula a defesa que a parte contrária poderia apresentar.",
    documentType: "simulacao_defesa",
    mandate: "Simule a defesa da parte contrária: preliminares, teses de mérito prováveis e fragilidades que ela provavelmente exploraria na tese do cliente.",
  },
  {
    key: "simular_julgador",
    label: "Simular Julgador",
    description: "Simula os pontos que um julgador levantaria sobre o caso.",
    documentType: "simulacao_julgador",
    mandate: "Responda como um julgador cético: por que esta pretensão poderia ser indeferida ou julgada improcedente? Aponte fundamentos decisórios possíveis e provas críticas ausentes.",
  },
  {
    key: "resumir_processo",
    label: "Resumir Processo",
    description: "Produz um resumo executivo do processo/caso.",
    documentType: "resumo_processual",
    mandate: "Produza um resumo executivo objetivo do caso: partes, fatos centrais, estado atual e próximos passos.",
  },
  {
    key: "analisar_documento",
    label: "Analisar Documento",
    description: "Analisa um documento anexado ao caso.",
    documentType: "analise_documental",
    mandate: "Analise o(s) documento(s) informado(s) no contexto: conteúdo relevante, cláusulas ou trechos críticos, e riscos ou pontos de atenção.",
  },
  {
    key: "criar_notificacao",
    label: "Criar Notificação",
    description: "Produz uma notificação extrajudicial.",
    documentType: "notificacao",
    mandate: "Redija uma notificação extrajudicial: identificação das partes, fatos, exigência clara e prazo para resposta ou cumprimento.",
  },
  {
    key: "criar_procuracao",
    label: "Criar Procuração",
    description: "Produz uma procuração ad judicia.",
    documentType: "procuracao",
    mandate: "Redija uma procuração ad judicia et extra com os poderes usuais, marcando como [DADO PENDENTE] qualquer dado de qualificação não informado.",
  },
  {
    key: "criar_acordo",
    label: "Criar Acordo",
    description: "Produz uma minuta de acordo entre as partes.",
    documentType: "acordo",
    mandate: "Redija uma minuta de acordo: objeto, condições, valores e prazos de cumprimento, e cláusula de quitação.",
  },
  {
    key: "defesa_administrativa",
    label: "Defesa Administrativa",
    description: "Produz uma defesa em processo administrativo.",
    documentType: "defesa_administrativa",
    mandate: "Redija uma defesa administrativa: tempestividade, preliminares cabíveis, razões de defesa e pedido.",
  },
  {
    key: "manifestacao",
    label: "Manifestação",
    description: "Produz uma manifestação processual.",
    documentType: "manifestacao",
    mandate: "Redija a manifestação processual solicitada, respondendo objetivamente ao que foi determinado ou provocado nos autos, conforme descrito no objetivo.",
  },
  {
    key: "outro",
    label: "Outro trabalho",
    description: "Descrição livre do trabalho jurídico desejado.",
    documentType: "outro",
    mandate: "Produza o documento jurídico descrito no objetivo, seguindo a estrutura usual para esse tipo de peça.",
  },
];

export function getIntelligenceTask(key: string): IntelligenceTask | undefined {
  return INTELLIGENCE_TASKS.find((t) => t.key === key);
}
