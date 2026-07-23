-- NEXO Jurídico — catálogo fixo de etapas por profundidade de análise.

insert into pipeline_stage_definitions (depth, stage_order, stage_key, name, specialist) values
  ('rapida', 1, 'triagem_dossie', 'Triagem e Dossiê', 'Analista de Triagem'),
  ('rapida', 2, 'pesquisa_estrategia', 'Pesquisa e Estratégia', 'Estrategista Jurídico'),
  ('rapida', 3, 'producao_juridica', 'Produção Jurídica', 'Redator Jurídico'),
  ('rapida', 4, 'auditoria_adversarial', 'Auditoria Adversarial', 'Simulador da Parte Contrária'),
  ('rapida', 5, 'revisao_entrega', 'Revisão e Entrega', 'Advogado Sênior');

insert into pipeline_stage_definitions (depth, stage_order, stage_key, name, specialist) values
  ('profissional', 1, 'triagem', 'Triagem', 'Analista de Triagem'),
  ('profissional', 2, 'investigacao_dossie', 'Investigação e Dossiê', 'Investigador Jurídico'),
  ('profissional', 3, 'pesquisa_juridica', 'Pesquisa Jurídica', 'Pesquisador Legislativo e Jurisprudencial'),
  ('profissional', 4, 'estrategia_juridica', 'Estratégia Jurídica', 'Estrategista Jurídico'),
  ('profissional', 5, 'simulacao_parte_contraria', 'Simulação da Parte Contrária', 'Simulador da Parte Contrária'),
  ('profissional', 6, 'producao_juridica', 'Produção Jurídica', 'Redator Jurídico'),
  ('profissional', 7, 'auditoria_integrada', 'Auditoria Integrada', 'Auditor de Contradições e Auditor Técnico'),
  ('profissional', 8, 'refinamento_entrega', 'Refinamento e Entrega', 'Advogado Sênior');

insert into pipeline_stage_definitions (depth, stage_order, stage_key, name, specialist) values
  ('completa', 1, 'triagem', 'Triagem', 'Analista de Triagem'),
  ('completa', 2, 'investigacao', 'Investigação', 'Investigador Jurídico'),
  ('completa', 3, 'organizacao_dossie', 'Organização do Dossiê', 'Organizador do Dossiê'),
  ('completa', 4, 'pesquisa_juridica_integrada', 'Pesquisa Jurídica Integrada', 'Pesquisador Legislativo e Jurisprudencial'),
  ('completa', 5, 'estrategia_juridica', 'Estratégia Jurídica', 'Estrategista Jurídico'),
  ('completa', 6, 'mesa_estrategia', 'Mesa de Estratégia', 'Mesa de Estratégia (5 perfis)'),
  ('completa', 7, 'simulacao_parte_contraria', 'Simulação da Parte Contrária', 'Simulador da Parte Contrária'),
  ('completa', 8, 'producao_juridica', 'Produção Jurídica', 'Redator Jurídico'),
  ('completa', 9, 'auditoria_contradicoes', 'Auditoria de Contradições', 'Auditor de Contradições'),
  ('completa', 10, 'julgador_simulado', 'Julgador Simulado', 'Juiz Simulado'),
  ('completa', 11, 'refinamento_senior', 'Refinamento Sênior', 'Advogado Sênior'),
  ('completa', 12, 'laboratorio_validacao', 'Laboratório de Validação e Entrega', 'Laboratório de Validação');
