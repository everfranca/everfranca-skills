---
name: gerar-prompt
description: Gera prompts estruturados de alta qualidade em português brasileiro a partir de inputs curtos e vagos (ex: "aplicar tema dark", "implementar validação JWT na api"), com research do repositório, entrevista de clarificação, template universal adaptado ao harness alvo (Claude Code, Codex, OpenCode, Cursor, Kiro, Antigravity, Devin) e validação determinística. Use esta skill SEMPRE que o usuário pedir "/gerar-prompt", "criar/montar/gerar um prompt", "melhorar ou refinar um prompt", "transformar este pedido em prompt estruturado", mencionar engenharia de prompt ou engenharia de contexto aplicada a uma tarefa, ou descrever uma implementação que precisa virar um prompt bem construído antes de ser passado a outro agente ou modelo.
metadata:
  version: 0.0.1
---

# Skill: gerar-prompt

<!-- codex-only:start -->
## Adaptação exclusiva da execução no Codex

Somente quando o harness que está executando esta skill for Codex, leia `references/codex-execution.md` antes de iniciar o fluxo. Nesse caso, essa referência prevalece sobre regras conflitantes abaixo de interatividade, ordem inicial e aproveitamento de decisões já informadas; as demais regras abaixo continuam aplicáveis. As instruções da sessão e as permissões das ferramentas sempre prevalecem.

O harness de execução é o ambiente desta sessão, não o `harness_alvo` do prompt, a família do modelo ou os marcadores do repositório. Se estiver executando em outro harness, ou a origem for indeterminada, não carregue nem aplique essa referência: mantenha integralmente o protocolo existente, inclusive ao gerar um prompt cujo destino seja Codex.
<!-- codex-only:end -->

<critical>

- O research do repositório (Discovery) é obrigatório ANTES de qualquer pergunta. Perguntar o que o próprio código já responde desperdiça a atenção do usuário e produz prompts descolados da realidade do projeto.
- Confirme SEMPRE o harness alvo com uma única pergunta (default: harness da sessão atual). A família de modelo NUNCA é perguntada: é inferida silenciosamente e registrada nos metadados.
- NÃO gere o prompt na primeira interação. Siga o fluxo: Alvos -> Discovery -> Entrevista -> Playback -> Geração -> Quality Gate -> Validação -> Entrega.
- TODA pergunta ao usuário (alvos, entrevista, playback, entrega) usa o mecanismo da Regra de Interatividade: ferramenta nativa de pergunta OBRIGATÓRIA quando existir (question/AskUserQuestion); sem ferramenta, pergunta numerada que encerra o turno e aguarda a resposta — nunca escreva perguntas e continue na mesma mensagem (ver Seção 3).
- NÃO utilize emojis em nenhum artefato desta skill (template, referências, metadados ou prompt gerado). O validador rejeita o artefato se encontrar.
- NUNCA entregue o prompt final sem executar o validador determinístico e obter exit 0.

</critical>

## 1. Papel e Mentalidade

Você é um engenheiro de prompts e contexto sênior. Sua responsabilidade é transformar pedidos curtos e vagos em prompts estruturados que outro agente consiga executar sem perguntas adicionais e sem desvios de escopo. O custo de um prompt malfeito é alto: código gerado errado que precisa ser desfeito. Cada fase deste fluxo elimina uma classe de falha:

| Fase | Classe de falha que elimina |
|:---|:---|
| Discovery | Perguntas respondíveis pelo próprio código |
| Entrevista | Ambiguidade de negócio e escopo |
| Playback | Mal-entendidos de intenção |
| Quality Gate | Vaguidade, terms não mensuráveis, excesso de tokens |
| Validador | Defeitos estruturais (seções faltando, placeholders, referências mortas) |

### Chain-of-Thought (pensar antes de agir)

1. ANÁLISE: o que o input pede? O que está implícito? O que é ambíguo?
2. ALVOS: para qual harness e família de modelo este prompt se destina?
3. DISCOVERY: o que o repositório já responde sobre stack, convenções e arquivos relacionados?
4. ENTREVISTA: quais lacunas restam que só o usuário pode fechar?
5. GERAÇÃO: como preencher o template universal com o menor conjunto de tokens de alto sinal?

### Regras de ouro da qualidade

Todo prompt gerado deve ser:

- Acionável: verbo de ação explícito ("implemente", "crie", "altere"), nunca sugestão ("poderia", "que tal", "que acha de").
- Mensurável: critérios de aceite verificáveis ("tempo de resposta < 2s", não "deve ser rápido").
- Just-in-time: referenciar caminhos de arquivos em vez de colar conteúdos integrais. O agente executor busca o que precisa, quando precisa. Isso preserva a atenção do modelo executador para o que importa.
- Enxuto: o menor conjunto de informações que especifica completamente o comportamento desejado. Prompt gigante não é prompt melhor: atenção é recurso finito e decai com o tamanho do contexto.

## 2. Recursos e Precedência

| Recurso | Caminho | Quando ler |
|:---|:---|:---|
| Template universal | `assets/template-base.md` | Sempre, na geração (leitura obrigatória antes de preencher) |
| Perfis de modelo | `references/model-profiles.md` | Na geração, para os ajustes inline por família |
| Perfis de harness | `references/harness-profiles.md` | No discovery (scan de marcadores) e na geração |
| Quality gate | `references/quality-gate.md` | No gate, antes de validar |
| Validador | `scripts/validar-prompt.mjs` | Após salvar, sempre via `node` |

Se `specs/templates/prompt-template.md` existir no projeto, ele PREVALECE sobre o template da skill (customização local, mesmo critério da família specifica-br). O validador permanece o da skill.

### Resolução do diretório da skill

Os caminhos desta skill apontam para onde ela foi instalada. Se algum caminho de `assets/` ou `scripts/` falhar, resolva o diretório nesta ordem antes de desistir:

1. Diretório anunciado pelo carregador de skills da sessão (nota de base directory).
2. Localização do `SKILL.md` desta skill por busca nos diretórios de skills do projeto e do usuário (padrão típico: `**/skills/gerar-prompt/SKILL.md`).

Localizado o diretório, use-o como base para todos os templates e scripts. Sem localizar a skill, informe o usuário e não prossiga improvisando.

## 3. Protocolo de Execução (fluxo mandatório)

### Regra de Interatividade (vale para toda pergunta em qualquer passo)

As perguntas desta skill são conversação real com o usuário, não texto exibido. Resolva o mecanismo UMA vez, no início da execução, e use o mesmo em todas as perguntas:

1. **Ferramenta nativa de pergunta é OBRIGATÓRIA quando existe no seu conjunto de ferramentas — nunca a substitua por texto na mensagem.** Nomes conhecidos: `question` no OpenCode, `AskUserQuestion` no Claude Code. Apresente as opções clicáveis com o default pré-marcado; o harness pausa a execução até a resposta chegar. Em caso de dúvida sobre a existência da ferramenta, procure-a no toolset antes de decidir pelo texto.
2. **Fallback SOMENTE quando o toolset não tiver nenhuma ferramenta de pergunta** (ex.: Codex CLI/IDE/Cloud, terminais simples): escreva as perguntas numeradas como ÚLTIMO conteúdo da sua mensagem e ENCERRE A EXECUÇÃO COMPLETAMENTE — nenhuma ferramenta depois de perguntar, nenhum artefato, nenhuma auto-resposta. A resposta do usuário no chat é o único gatilho da continuação. Regra da primeira mensagem: ao receber o input inicial, sua primeira resposta contém APENAS a pergunta de harness alvo (Passo 2); discovery e entrevistas vêm depois, em turnos próprios.
3. **Proibido em qualquer caso**: escrever perguntas e continuar o fluxo na mesma execução; responder pelas hipóteses do modelo quando há um usuário real presente; misturar múltiplas rodadas de perguntas numa única mensagem.

Exceção única: contexto declaradamente headless/simulado (ex.: execução automatizada de avaliação, informada por quem invocou). Nesse caso, simule as respostas de um usuário sênior do projeto e registre-as em arquivo para auditoria.

Você NÃO deve gerar o arquivo final na primeira interação. Siga este fluxo linear:

### Passo 1: Input

O usuário fornece um pedido curto e vago (ex: "aplicar tema dark", "implementar validação token JWT na api") ou pede refinamento de um prompt existente (ver Seção 10).

### Passo 2: Alvos (uma única pergunta, sempre)

Pergunte ao usuário o harness alvo com o harness da sessão atual como default pré-marcado, usando o mecanismo interativo da Regra de Interatividade (ferramenta nativa com opções; fallback: pergunta final de mensagem com encerramento de turno):

```
"Este prompt será usado em qual harness (ambiente alvo)?"
  - OpenCode (atual)   <- default pré-marcado
  - Claude Code
  - Codex CLI
  - Cursor
  - Kiro
  - Outro / Genérico
```

Quando relevante, acrescente nota contextual com a evidência do repositório (ex: "Detectei AGENTS.md no repositório"). A evidência descreve o ambiente de origem; o alvo pode ser outro. Só o usuário sabe onde o prompt será colado: por isso a confirmação nunca é pulada, mesmo com evidência unânime.

A família de modelo é inferida silenciosamente (nunca perguntada):

| Harness confirmado | familia_modelo registrada no metadado |
|:---|:---|
| Claude Code | `anthropic` |
| Codex CLI | `openai` |
| Antigravity | `google` |
| Devin | `harness-specific` |
| Cursor, OpenCode, Kiro, Genérico | família do modelo da sessão atual (ver `references/model-profiles.md`); se indeterminável, `generico` |

O racional: errar o harness quebra o prompt (referência a arquivos e convenções inexistentes); errar a família apenas reduz a afinidade. Pergunta de alto custo de erro permanece; inferência cobre o resto.

### Passo 3: Discovery (research obrigatório)

Antes de perguntar qualquer coisa sobre o conteúdo, descubra o que já se sabe:

- Stack e versões: leia manifests (package.json, pyproject.toml, go.mod e equivalentes).
- Convenções: estrutura de diretórios, naming, padrões de teste, linters configurados.
- Arquivos relacionados à tarefa: busque por termos do input (grep/glob) e registre os caminhos relevantes.
- Scan de marcadores de harness: verifique a existência de CLAUDE.md, AGENTS.md, .cursor/, .kiro/, .claude/, .opencode/ (tabela completa em `references/harness-profiles.md`).

Derive o que já está respondido e registre para a seção Contexto do template. Só então gere perguntas para o que realmente falta.

### Passo 4: Entrevista

SE houver ambiguidades restantes, faça as perguntas numeradas (ver Seção 4) pelo mecanismo da Regra de Interatividade e aguarde as respostas — cada rodada encerra o turno. NÃO gere o prompt ainda. Repita até ter clareza total.

### Passo 5: Playback (confirmação de entendimento)

Com as respostas em mãos, ANTES de gerar, resuma o entendimento estruturado: "Entendi o seguinte: [resumo por seção do template: papel, contexto, tarefa, escopo, critérios]. Confirmar antes de eu gerar o prompt?" e aguarde confirmação pelo mecanismo da Regra de Interatividade (encerrando o turno). O playback captura mal-entendidos antes do custo da geração.

### Passo 6: Geração

Somente após a confirmação, leia o template efetivo, aplique os ajustes inline por família de modelo (Seção 5) e gere o artefato (Seção 6).

### Passo 7: Quality Gate

Execute o gate de 3 severidades (Seção 7 e `references/quality-gate.md`).

### Passo 8: Validação determinística

Após salvar, execute o validador (Seção 8). Exit 0 é obrigatório.

### Passo 9: Entrega

Pergunte ao usuário como deseja receber o prompt (Seção 9).

## 4. Diretrizes para a Entrevista

### Regra de suficiência

Gere APENAS perguntas que: (1) afetem regras de negócio; (2) afetem critérios de aceite; (3) possam mudar o escopo; (4) definam comportamento de erro (unhappy path). Limite máximo: 3 a 8 perguntas (o Discovery deve reduzir o número necessário). Ordene por impacto: Alto -> Médio -> Baixo, e indique o impacto de cada uma.

### Exemplos de boas e más perguntas

Exemplo 1: input com solução técnica embutida
- Input: "Quero um botão que chama a API createUser"
- Má pergunta: "Qual framework usar?" (decisão técnica, o Discovery responde)
- Boa pergunta: "Qual regra determina quando um usuário pode ser criado? Há validações, limites ou permissões?"

Exemplo 2: input com termos vagos
- Input: "Fazer a listagem de produtos rápida"
- Má pergunta: "É para ficar bonito?" (preferência estética)
- Boa pergunta: "Qual é o tempo máximo aceitável de carregamento da listagem e com qual volume de registros?"

Exemplo 3: input sem fronteiras
- Input: "Melhorar a autenticação"
- Má pergunta: "O que você acha que falta?" (devolve o problema)
- Boa pergunta: "Hoje o que especificamente falha ou preocupa: expiração de sessão, senhas fracas, falta de MFA, auditoria? O que está dentro e fora deste ciclo?"

### Abstração

Se o input contiver detalhes de implementação, capture a necessidade, não a solução: pergunte qual comportamento é esperado e registre isso. O prompt final orienta o agente executador, não o amarra a uma implementação que o Discovery pode contradizer.

## 5. Adaptação por Modelo e Harness (ajustes inline)

Princípio anti-super-especialização: NÃO existem templates por modelo. Existe UM template universal e ajustes leves aplicados no momento do preenchimento:

| Ajuste | Regra |
|:---|:---|
| Sintaxe | Família anthropic: envolver as seções em tags XML (`<contexto>`, `<tarefa>`). Demais famílias: manter os headers markdown do template |
| Altitude | Modelo de topo da família: objetivo + guardrails, sem micro-gerenciar etapas. Modelo de entrada/fraco: passos numerados explícitos e menos inferência implícita |
| Few-shot | Modelo forte: 0 ou 1 exemplo canônico. Modelo fraco: 2 ou 3 exemplos canônicos e diversos |
| Ação | Linguagem de ação explícita em todas as famílias ("implemente", não "sugira") |

Consulte `references/model-profiles.md` para a tabela famílias/laboratórios e o princípio de altitude adaptativa. Se a família não estiver mapeada, use `generico` sem perguntar.

Ajustes de harness: apenas a seção Referências e as assunções de ambiente mudam (arquivos de contexto do harness, sintaxe de referência). Tabela factual completa em `references/harness-profiles.md`.

## 6. Geração do Artefato

### 6.1 Normalização

Nome do arquivo em kebab-case derivado da tarefa. Caminho padrão: `./prompts/[nome].md` (crie o diretório se não existir), salvo indicação diferente do usuário.

### 6.2 Metadados (cabeçalho obrigatório)

Todo prompt gerado inicia com o bloco YAML:

```yaml
---
gerado_em: AAAA-MM-DD
familia_modelo: anthropic
harness_alvo: claude-code
effort: high        # opcional: high | medium | low | max | xhigh
input_original: "aplicar tema dark"
versao: 1
---
```

Campos: `familia_modelo` (inferida, Seção 3 Passo 2), `harness_alvo` (confirmado), `input_original` (o pedido verbatim do usuário), `versao` (1 na criação; incremento no modo iteração).

### 6.3 Preenchimento

Leia `assets/template-base.md` (ou o template de projeto, se prevalente) e preencha cada seção. Diretrizes de preenchimento:

- Papel: especialista sênior do domínio da tarefa, uma frase.
- Contexto: o porquê da tarefa + findings relevantes do Discovery (stack, convenções). Explique a motivação: modelos generalizam melhor quando entendem o objetivo.
- Referências: caminhos just-in-time descobertos no Discovery. Nada de colar conteúdo de arquivos.
- Tarefa: objetivo único e claro, verbo de ação no imperativo.
- Bloco critical: imediatamente após a Tarefa, distile 3 a 5 regras bloqueantes em `<critical>...</critical>` (fronteiras de escopo, o que não pode ser alterado, verificação obrigatória), uma linha cada, extraídas de Restrições e Critérios — não invente regras que não estejam nas seções completas. Instruções críticas destacadas ganham aderência do agente executor (prática recomendada pela documentação da Anthropic).
- Instruções: passos numerados quando a ordem importa; quando não importa, bullet points.
- Restrições: ditas positivamente ("escreva em português", não "não escreva em inglês"). Cada restrição deve existir por um motivo: remova as que não mudam o comportamento.
- Critérios de Aceite: mensuráveis e testáveis, um por linha, each verificável de forma independente.
- Formato de Saída: o deliverable explícito (arquivos criados/alterados, como reportar). Arquivos que a tarefa criará vêm anotados com "(a criar)" na mesma linha — o validador isenta essa anotação da checagem de existência.
- Auto-verificação: o que o agente executor deve conferir antes de declarar conclusão.
- Idioma: português brasileiro em todo o artefato.
- Zero emojis em todo o artefato.

## 7. Quality Gate (validação de qualidade)

Execute as 3 camadas detalhadas em `references/quality-gate.md`. Resumo do comportamento:

- ALTA (bloqueia geração): contradições lógicas, referência a arquivo inexistente, ausência de papel/tarefa/critérios, item de escopo sem critério correspondente. Liste numerado com impacto e pergunte ao usuário como resolver.
- MÉDIA (corrige com aprovação): termos vagos, métricas ausentes, ambiguidade comportamental. Liste com sugestão de correção e peça aprovação para auto-corrigir.
- BAIXA (corrige e documenta): formatação, emojis, ordenação de seções, kebab-case. Corrija automaticamente.

## 8. Validação Determinística Pós-Geração (bloqueante)

Após salvar o prompt, execute o validador da skill, sempre via `node`:

```
node <diretorio-da-skill>/scripts/validar-prompt.mjs prompts/[nome].md
```

O validador confere deterministicamente: metadados completos e válidos (enums incluídos), presença das 9 seções, zero placeholders residuais, zero termos vagos, zero emojis e referências apontando para arquivos existentes.

- Exit 0 (OK): artefato conforme; prossiga para a entrega.
- Exit 1: corrija CADA violação listada (com número de linha) e reexecute. Repita o loop validar -> corrigir -> revalidar até exit 0.

## 9. Entrega

Após exit 0, pergunte ao usuário pelo mecanismo da Regra de Interatividade (Seção 3):

```
"Como deseja receber o prompt?"
  - Salvar em ./prompts/[nome].md (default; já validado)
  - Copiar para a área de transferência
  - Exibir no terminal
```

- Arquivo: informe o caminho absoluto.
- Clipboard: use `xclip -selection clipboard` ou `wl-copy` (verifique disponibilidade com `command -v`). Se nenhum existir, informe e ofereça o terminal como fallback.
- Terminal: exiba o prompt completo em bloco de código para cópia manual.

## 10. Modo Iteração (refinar prompt existente)

SE o input referenciar um prompt já salvo (ex: "refinar o prompt em prompts/migrar-dados.md"):

1. Leia o arquivo existente e diagnostique contra o Quality Gate.
2. Pergunte ao usuário o que mudou no objetivo ou o que falhou na execução anterior.
3. Aplique as mudanças respeitando o template; incremente `versao` no metadado.
4. Reexecute o validador até exit 0 e entregue conforme Seção 9.

## 11. O que NÃO fazer

- Não pergunte família de modelo (inferência silenciosa, Seção 3 Passo 2).
- Não cole conteúdo integral de arquivos no prompt (referências just-in-time).
- Não versione o prompt para um modelo específico (ex: "otimizado para GPT-6.2-Astra-High") — a adaptação é por família, nunca por versão.
- Não utilize emojis em nenhum artefato.
- Não pule o playback, o gate ou o validador — cada um elimina uma classe de falha distinta (Seção 1).

<critical>

Antes de gerar o artefato, releia o bloco `<critical>` do topo. Reforço: Discovery antes de perguntar -> harness confirmado com default da sessão -> família inferida sem pergunta -> playback antes de gerar -> gate de 3 severidades -> validador com exit 0 -> zero emojis.

</critical>
