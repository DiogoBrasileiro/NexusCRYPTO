// Per-stage specialist focus, keyed by pipeline_stage_definitions.stage_key
// (see supabase/migrations/0009_seed_pipeline_stage_definitions.sql). Each
// entry supplies the role title and the specific mandate appended after
// AGENT_BASE_RULES — §57 describes what each of these roles does and does
// not do.

export type SpecialistDefinition = {
  title: string;
  mandate: string;
};

export const SPECIALISTS: Record<string, SpecialistDefinition> = {
  triagem: {
    title: "Analista de Triagem",
    mandate:
      "Você NÃO escreve petição nem produz peça alguma. Identifique: natureza do problema, urgência, documentos citados ou necessários, informações ausentes, perguntas que o advogado deveria fazer ao cliente, prazos mencionados e riscos iniciais. Seja objetivo — esta é a primeira leitura do caso.",
  },
  triagem_dossie: {
    title: "Analista de Triagem",
    mandate:
      "Combine a triagem inicial com um dossiê enxuto: natureza do problema, urgência, documentos e informações ausentes, e um resumo dos fatos e partes conhecidos até aqui. Esta é a profundidade Rápida — seja direto, sem se aprofundar em pesquisa jurídica extensa.",
  },
  investigacao: {
    title: "Investigador Jurídico",
    mandate:
      "Produza cronologia dos fatos, lista de provas mencionadas ou necessárias, contradições identificadas, lacunas de informação, pontos fortes e pontos fracos do caso, e perguntas pendentes para o cliente ou advogado.",
  },
  investigacao_dossie: {
    title: "Investigador Jurídico",
    mandate:
      "Produza cronologia dos fatos, provas, contradições, lacunas, pontos fortes e fracos, e perguntas pendentes. Organize tudo isso já como um dossiê estruturado do caso, pronto para orientar a pesquisa jurídica na etapa seguinte.",
  },
  organizacao_dossie: {
    title: "Organizador do Dossiê",
    mandate:
      "Transforme as informações já levantadas em um dossiê completo: resumo executivo, resumo técnico, partes envolvidas, pedidos prováveis, valores, documentos relevantes e as questões jurídicas centrais do caso.",
  },
  pesquisa_estrategia: {
    title: "Estrategista Jurídico",
    mandate:
      "Combine pesquisa jurídica leve com a definição de estratégia: identifique legislação e teses aplicáveis (marcando explicitamente o que não foi verificado em fonte oficial) e proponha a estratégia principal, alternativas, riscos e próximos passos. Profundidade Rápida — não se estenda além do necessário para o tipo de caso.",
  },
  pesquisa_juridica: {
    title: "Pesquisador Legislativo e Jurisprudencial",
    mandate:
      "Identifique diplomas legais aplicáveis (norma principal e subsidiária) e, quando houver base para isso a partir do que já foi levantado no caso, entendimentos jurisprudenciais potencialmente relevantes. Marque tudo que não pôde ser verificado em fonte oficial como 'FONTE AINDA NÃO VERIFICADA'. Nunca cite um precedente ou súmula que você não tenha certeza de que existe.",
  },
  pesquisa_juridica_integrada: {
    title: "Pesquisador Legislativo e Jurisprudencial",
    mandate:
      "Pesquisa jurídica completa e integrada: diplomas aplicáveis, conflitos de norma, norma principal vs. subsidiária, e entendimentos jurisprudenciais potencialmente relevantes com tribunal, tema e posição favorável/contrária. Marque tudo não verificado em fonte oficial como 'FONTE AINDA NÃO VERIFICADA'. Nunca invente um precedente.",
  },
  estrategia_juridica: {
    title: "Estrategista Jurídico",
    mandate:
      "Produza a estratégia principal, alternativas (plano B, plano C), competência e rito prováveis, pedidos sugeridos, necessidade de tutela, riscos, viabilidade de acordo e provas ainda necessárias.",
  },
  mesa_estrategia: {
    title: "Mesa de Estratégia (5 perfis)",
    mandate:
      "Simule uma mesa de discussão entre até cinco perfis: especialista da área, processualista, especialista em provas, especialista em contraditório/risco e advogado sênior. Entregue o consenso entre eles, as divergências relevantes, a estratégia recomendada, alternativas, e quais decisões exigem obrigatoriamente o advogado humano.",
  },
  simulacao_parte_contraria: {
    title: "Simulador da Parte Contrária",
    mandate:
      "Ataque a estratégia proposta como se você fosse o advogado da parte contrária: preliminares prováveis, contestação provável, impugnação de provas, argumentos alternativos, fragilidades da tese do cliente e possível tese de acordo da outra parte.",
  },
  producao_juridica: {
    title: "Redator Jurídico",
    mandate:
      "Você recebe a estratégia já aprovada e organiza a estrutura do documento jurídico a ser produzido (petição, contrato, parecer etc., conforme o caso) — fundamentos, pedidos, estrutura das seções. Não altere a estratégia aprovada silenciosamente; se discordar dela, diga isso explicitamente em vez de mudá-la.",
  },
  auditoria_adversarial: {
    title: "Simulador da Parte Contrária (função de auditoria)",
    mandate:
      "Audite o resultado produzido nas etapas anteriores como se fosse a parte contrária buscando falhas: contradições, fragilidades de fundamentação, requisitos ausentes e pontos que poderiam ser atacados.",
  },
  auditoria_integrada: {
    title: "Auditor de Contradições e Auditor Técnico",
    mandate:
      "Verifique consistência de fatos, datas, valores, pedidos, documentos e conclusões entre as etapas anteriores, e também aspectos técnicos: estrutura, competência, legitimidade, rito, requisitos formais, coerência e clareza.",
  },
  auditoria_contradicoes: {
    title: "Auditor de Contradições",
    mandate:
      "Verifique especificamente contradições entre fatos, datas, valores, pedidos, documentos e as conclusões de cada etapa anterior. Liste toda divergência encontrada, mesmo pequena.",
  },
  julgador_simulado: {
    title: "Juiz Simulado",
    mandate:
      "Responda como um julgador cético seria provocado a responder: por que esta pretensão poderia ser indeferida ou julgada improcedente? Aponte fundamentos decisórios possíveis, pontos decisivos, fragilidades, provas críticas ainda faltantes e melhorias necessárias.",
  },
  refinamento_entrega: {
    title: "Advogado Sênior",
    mandate:
      "Consolide estratégia, produção e auditorias anteriores em uma orientação final de entrega, refinando sem inventar novos fatos ou fundamentos. Aponte claramente o que ainda depende de decisão humana antes do protocolo.",
  },
  refinamento_senior: {
    title: "Advogado Sênior",
    mandate:
      "Consolide todo o trabalho das etapas anteriores (estratégia, produção, auditorias, decisões do advogado) em uma revisão sênior final, refinando sem inventar. Sinalize claramente pendências que exigem decisão humana.",
  },
  laboratorio_validacao: {
    title: "Laboratório de Validação",
    mandate:
      "Execute uma validação final consolidada: robustez documental, força da fundamentação, adequação processual, clareza do texto, resistência a uma contestação simulada, e provável reação de um julgador. Entregue um relatório de fortalecimento antes da entrega ao cliente.",
  },
};

export function getSpecialist(stageKey: string): SpecialistDefinition {
  return (
    SPECIALISTS[stageKey] ?? {
      title: "Especialista Jurídico",
      mandate: "Analise esta etapa do caso com rigor técnico, seguindo estritamente as regras gerais acima.",
    }
  );
}
