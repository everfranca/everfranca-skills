# Perfis de Harness (tabela factual)

<critical>

- O conhecimento aqui é fato verificável: arquivo existe ou não existe. Errar quebra o prompt (referência morta é violação ALTA).
- Cite arquivo de contexto do harness (CLAUDE.md, AGENTS.md, .cursor/rules) apenas se ele existir no repositório alvo, verificado no Discovery.
- Sintaxe específica (`@caminho`) somente quando o alvo foi confirmado pelo usuário; na dúvida, caminho relativo puro, que funciona em qualquer harness.
- A gravação de arquivos pela skill é exclusivamente dentro do diretório da aplicação (raiz do projeto alvo), em caminho relativo, INDEPENDENTE do harness. Nenhuma convenção ou ferramenta específica de harness relaxa essa regra.

</critical>

Diferente dos perfis de modelo, o conhecimento aqui é fato verificável: convenção de arquivo existe ou não existe. Errar o harness quebra o prompt (referência a arquivo inexistente); por isso o harness é confirmado por pergunta e os perfis de modelo são apenas inferidos.

O harness afeta somente: a seção Referências (quais arquivos de contexto citar e com que sintaxe) e as assunções de ambiente (ferramentas disponíveis ao agente executador). O restante do prompt é idêntico para qualquer harness.

## 1. Scan de marcadores (Discovery)

Verifique a existência destes marcadores no repositório e use como nota contextual na pergunta de alvos:

| Marcador | Harness indicado |
|:---|:---|
| `CLAUDE.md` ou diretório `.claude/` | Claude Code |
| `AGENTS.md` | Codex ou OpenCode |
| `.cursor/` (com `rules/`) | Cursor |
| `.kiro/` (com `steering/`) | Kiro |
| `.opencode/` | OpenCode |

A evidência descreve o ambiente de origem; o alvo do prompt pode ser outro. A confirmação do usuário prevalece sempre.

## 2. Tabela factual por harness

| Harness | Arquivo de contexto | Sintaxe de referência | Assunções de ambiente |
|:---|:---|:---|:---|
| Claude Code | `CLAUDE.md` | `@caminho/arquivo` | comandos em `.claude/commands/`, subagentes em `.claude/agents/`, XML bem recebido |
| Codex CLI | `AGENTS.md` | caminho relativo puro | execução em sandbox; split system/user apenas via API |
| OpenCode | `AGENTS.md` | caminho relativo puro | skills e commands em `.opencode/`, plan mode, question tool |
| Cursor | `.cursor/rules/*.mdc` (frontmatter: description, globs, alwaysApply) | `@caminho` no composer | `.cursorrules` é legado, não citar |
| Kiro | `.kiro/steering/` (product.md, tech.md, structure.md) | caminho relativo puro | fluxo spec-driven (requirements, design, tasks em `.kiro/specs/`) |
| Antigravity | harness do Google | caminho relativo puro | modelos Gemini; sem custo por prompt via assinatura |
| Devin | playbooks próprios | caminho relativo puro | modelos SWE |
| Genérico | nenhum (zero dependência) | caminho relativo puro | nenhuma presunção; instruir leitura prévia dos arquivos citados |

## 3. Regras de aplicação

- Citar arquivo de contexto do harness na seção Referências somente se ele existir no repositório alvo (verificado no Discovery). Referência morta é violação ALTA do quality gate.
- Usar sintaxe específica do harness (`@caminho`) apenas quando o alvo foi confirmado pelo usuário. No dúvida, caminho relativo puro, que funciona em tudo.
- Não presunir ferramentas além das listadas na tabela. O prompt genérico instrui o agente a ler os arquivos citados antes de executar.

## 4. Alvos não mapeados

Harness fora da tabela (ex: harness novo, interno): tratar como Genérico. Se a documentação pública do harness estiver acessível, consultar no ato; não codificar presunções não verificadas neste guia.
