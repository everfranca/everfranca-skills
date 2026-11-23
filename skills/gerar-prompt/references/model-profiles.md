# Perfis de Modelo (guia leve por família)

<critical>

- A unidade de adaptação é a FAMÍLIA, nunca a versão de modelo.
- Sem documentação oficial do vendor, use `generico` — não codifique presunções não verificadas.
- A adaptação muda apenas sintaxe e altitude; conteúdo, estrutura e critérios nunca mudam por modelo.

</critical>

Princípio anti-super-especialização: existe UM template universal. Este guia define apenas ajustes inline de sintaxe e altitude aplicados no preenchimento. O conteúdo, a estrutura e os critérios nunca mudam por modelo.

O racional: errar a família reduz a afinidade do prompt; errar o harness quebra o prompt. Adaptação leve por família cobre o primeiro caso com custo de manutenção próximo de zero.

## 1. Tabela famílias / laboratórios

Mapeamento consolidado a partir do leaderboard AI Coding Daily (novembro de 2026). Família é a unidade de adaptação; versão de modelo nunca é.

| Família | Laboratórios | Exemplos de modelos |
|:---|:---|:---|
| `anthropic` | Anthropic | Claude Opus 5.5, Fable 5.2, Sonnet 5.5, Haiku 5.5 |
| `openai` | OpenAI | GPT-6.2 Astra/Sol, GPT-6.1 Sol/Terra, GPT-6 Astra/Luna |
| `google` | Google | Gemini 4 Neon, Gemini 4 Hydrogen, Gemini 4 Argon |
| `meta` | Meta | Muse Spark 1.3, Muse Ember 1.0 |
| `open-weights-cn` | DeepSeek, Alibaba, Z.ai, Moonshot, Xiaomi, MiniMax, Tencent | DeepSeek V4.x, Qwen 3.8/4, GLM-5.3, Kimi K3.1, MiMo V2.6, MiniMax M3.1, Hy3/Hy4 |
| `harness-specific` | Devin, Cursor, NVIDIA, Mistral | SWE-2, Composer 2.5, Nemotron 3.5, Mistral Large 4 |
| `generico` | fallback | qualquer modelo não mapeado |

Regra de inferência (nunca perguntada ao usuário):

| Harness confirmado | Familia registrada |
|:---|:---|
| Claude Code | `anthropic` |
| Codex CLI | `openai` |
| Antigravity | `google` |
| Devin | `harness-specific` |
| Cursor, OpenCode, Kiro, Genérico | família do modelo da sessão atual (tabela acima); se indeterminável, `generico` |

## 2. As cinco dimensões de adaptação

| Dimensão | O que muda | Impacto |
|:---|:---|:---|
| Marcadores de estrutura | XML (anthropic) vs headers markdown (demais) vs seções numeradas (famílias mais fracas) | Baixo a médio |
| Altitude das instruções | Modelos fortes: objetivo + guardrails. Modelos fracos: passos prescritivos | Alto |
| Guia de raciocínio | anthropic/openai têm esforço configurável; demais ignoram a menção | Médio |
| Calibração de ação | Linguagem explícita de ação em todas as famílias; sensibilidade varia | Médio |
| Compensação de fraqueza | Few-shot ajuda mais modelos fracos; fortes generalizam com 0-1 exemplos | Alto |

## 3. Altitude adaptativa (o princípio central)

A adaptação por família não muda o conteúdo do prompt; muda a altitude e a sintaxe:

- Alvo é modelo de topo da família (Opus, GPT-6.2, Gemini 4, Fable): escreva o objetivo e os guardrails. Não micro-gerencie etapas que o modelo resolve sozinho; over-prompting causa overtriggering e over-verificação.
- Alvo é modelo de entrada ou família open-weights menos afinada: escreva passos numerados explícitos, reduza inferência implícita e inclua 2-3 exemplos canônicos.
- Na dúvida, altitude média: tarefa clara, instruções ordenadas, um exemplo quando o formato de saída importar.

## 4. Regras de sintaxe por família

- `anthropic`: envolver as seções do template em tags XML (`<papel>`, `<contexto>`, `<tarefa>`...) no lugar dos headers markdown. Instruções positivas ("faça X"). Documentado pela Anthropic como convenção que reduz interpretação ambígua.
- `openai`: manter headers markdown. Quando o prompt for usado via API, orientar split system (papel e restrições) / user (tarefa e contexto).
- `google`: manter headers markdown. System instructions explícitas quando via API.
- `meta`: system prompt explícito na primeira seção e estrutura passo-a-passo clara.
- `open-weights-cn`: headers markdown, passos numerados, 2-3 exemplos canônicos quando o formato de saída for relevante.
- `harness-specific` e `generico`: headers markdown, sem presunções.

## 5. O que NÃO fazer

- Não versionar o prompt para um modelo específico ("otimizado para GPT-6.2-Astra-High"). Versões trocam a cada semanas; família é a unidade estável.
- Não codificar folklore: só aplicar ajustes documentados pelo vendor (docs Anthropic, OpenAI, Meta). Sem documentação, cair no `generico`.
- Não turbo-boostar modelos fortes: instruções agressivas ("CRITICAL: você DEVE...") causam overtriggering em modelos recentes, documentado pela Anthropic.
- Não duplicar template por família: o ajuste é inline, no ato do preenchimento.
