# Changelog — gerar-prompt

Todas as mudanças notáveis desta skill são documentadas aqui. A versão canônica vive no frontmatter do `SKILL.md` (`metadata.version`). Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e semver.

## 0.0.3 — 2026-11-23

- Seguranca e protecao de dados (review F-002/F-004/F-007): `input_original` agora e sanitizado antes de gravar em disco (tokens, chaves, senhas, documentos pessoais viram `<REDACTED>`), com pergunta de consentimento ao usuario; modo headless nao grava nada em disco por padrao; entrega via clipboard avisa sobre area compartilhada. Todo arquivo gravado pela skill fica exclusivamente dentro do diretorio da aplicacao (raiz do projeto alvo), em caminho relativo, INDEPENDENTE do harness — nenhuma adaptacao de harness (incluindo Codex) relaxa essa regra.
- Harness (review F-005): fallback de interatividade agora cobre falha por indisponibilidade da ferramenta nativa de pergunta em qualquer harness; falha da ferramenta nunca e tratada como resposta.
- Contrato do artefato: o bloco `<critical>` e agora OBRIGATORIAMENTE o ultimo elemento do prompt gerado (apos Auto-verificacao, sem conteudo depois), regra, template e validador alinhados e testado por controle negativo.
- Validador (review F-003/F-006): checagem de referencias vivas confinada ao diretorio do projeto; caminhos absolutos ou com `..` fora da raiz viram violacao. Isencao "(a criar)" vale somente quando a linha contem exatamente um caminho.
- Documentacao (review F-008): correcao de termo em ingles na diretriz de Critérios de Aceite.
- Testes (review F-001): baseline de integridade recalculado para o contrato corrente e replace de versao do teste atualizado para 0.0.x.

## 0.0.2 — 2026-11-23

- Correção: a `description` do frontmatter agora é um escalar YAML entre aspas simples. O texto continha `ex: "` (dois-pontos seguido de espaço dentro de escalar sem aspas), o que quebrava o parse do registry Skills e do CLI `skills add`, resultando em "no valid skills found". Comportamento da skill inalterado.

## 0.0.1 — 2026-11-23

- Primeira versão publicada no repositório guarda-chuva `everfranca-skills`.
- Migração da cópia canônica da POC `command-make-prompt` (inclui suporte a execução isolada no Codex, `references/`, `scripts/`, `evals/` e `tests/`).
- Reinício do número de versão para 0.0.1: versão inicial de distribuição pública; o contrato de saída pode mudar até estabilizar.
