# Changelog — gerar-prompt

Todas as mudanças notáveis desta skill são documentadas aqui. A versão canônica vive no frontmatter do `SKILL.md` (`metadata.version`). Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e semver.

## 0.0.2 — 2026-11-23

- Correção: a `description` do frontmatter agora é um escalar YAML entre aspas simples. O texto continha `ex: "` (dois-pontos seguido de espaço dentro de escalar sem aspas), o que quebrava o parse do registry Skills e do CLI `skills add`, resultando em "no valid skills found". Comportamento da skill inalterado.

## 0.0.1 — 2026-11-23

- Primeira versão publicada no repositório guarda-chuva `everfranca-skills`.
- Migração da cópia canônica da POC `command-make-prompt` (inclui suporte a execução isolada no Codex, `references/`, `scripts/`, `evals/` e `tests/`).
- Reinício do número de versão para 0.0.1: versão inicial de distribuição pública; o contrato de saída pode mudar até estabilizar.
