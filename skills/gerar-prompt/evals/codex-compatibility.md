# Compatibilidade da correção Codex

## Escopo e evidência

A versão 1.3.2 adiciona uma referência condicional para a execução no Codex. Os sete arquivos originais da skill foram registrados em `codex-baseline.json` antes da alteração. O teste compara os hashes; para SKILL.md, remove somente o bloco delimitado `codex-only` e normaliza a versão antes de comparar. Assim, mudanças acidentais no protocolo legado, template, perfis, gate, validador ou avaliações originais fazem o teste falhar.

O Git deste ambiente não está disponível; a linha de base foi obtida diretamente dos arquivos v1.3.1 presentes no início da tarefa. Não atualizar os hashes para acomodar alterações nos fluxos protegidos sem uma revisão de compatibilidade separada.

Os testes locais também executam o validador existente contra artefatos sintéticos dos oito destinos aceitos, em diretório temporário. Isso é análise de Markdown, não execução das tarefas descritas. Nenhum dos dois prompts de design fornecidos pelo usuário deve ser executado nos testes.

Comando: `node .opencode/skills/gerar-prompt/tests/codex-isolation.test.mjs`, na raiz do projeto. O teste usa node:test diretamente e workers para carregar o validador original com argv/cwd isolados, sem subprocessos ou alteração do arquivo de produção. Isso permite executar também em ambientes que restringem child_process.

## Fontes consultadas em 2026-11-20

Os IDs abaixo foram resolvidos pelo MCP Context7. A pesquisa serve para delimitar compatibilidade, não para atualizar os perfis dos outros harnesses.

| Harness | ID Context7 | Evidência e limite |
|:---|:---|:---|
| Codex | `/openai/codex` | [Handler](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/handlers/request_user_input.rs) e [modos disponíveis](https://github.com/openai/codex/blob/main/codex-rs/tools/src/tool_config.rs): ferramenta condicionada ao modo/configuração; usar o contrato da sessão |
| OpenCode | `/anomalyco/opencode` | [question](https://github.com/anomalyco/opencode/blob/dev/services/site/src/docs/content/tools.mdx): formulário interativo, resposta livre e pausa; cliente e permissões precisam suportá-lo |
| Claude Code | `/websites/code_claude` | [Interação com usuário](https://code.claude.com/docs/en/agent-sdk/user-input): AskUserQuestion; no SDK/headless, requer tratamento pelo cliente |
| Cursor | `/websites/cursor` | [ACP](https://cursor.com/docs/cli/acp): cursor/ask_question bloqueante; não extrapolar o protocolo ACP para todo cliente |
| Kiro | `/websites/kiro_dev_cli` | [CLI](https://kiro.dev/docs/cli/): distingue chat interativo e headless; a consulta não confirmou uma ferramenta de perguntas com nome estável |
| Antigravity | `/websites/antigravity_google` | ID localizado no Context7; [regras oficiais](https://antigravity.google/docs/rules) consultadas diretamente na web como complemento ao limite de consultas. Não foi confirmado um contrato de ferramenta de perguntas |
| Devin | `/websites/devin_ai` | [Exemplo de revisão de sessões](https://docs.devin.ai/use-cases/gallery/batch-parallel-research): revisão pelo usuário; não estabelece nome ou schema universal de ferramenta de perguntas |

`request_user_input_async` foi observado no contrato da sessão Codex, não estabelecido como API universal pela documentação consultada. Não instalar ferramentas nem habilitar flags para satisfazer a skill.

## Cenários de avaliação comportamental

Executar estes cenários em sessões de geração isoladas, com pedidos sintéticos. Registrar o ambiente, ferramentas expostas, mensagens, chamadas e respostas efetivas. Uma resposta textual imitando uma chamada não conta como uso da ferramenta. Não simular resposta de usuário real; simulação só em avaliação explicitamente headless, com respostas fornecidas pelo avaliador.

| Caso | Configuração e estímulo | Resultado esperado |
|:---|:---|:---|
| C01 | Codex/Plan; request_user_input exposto; destino não informado | Discovery somente leitura; pergunta pela ferramenta, dentro dos limites do schema; aguarda resposta |
| C02 | Codex/Default; ferramenta síncrona permitida apenas para perguntas opcionais; decisão obrigatória; sem assíncrona | Pergunta em texto e espera; não usa ferramenta inadequada à decisão |
| C03 | Codex; somente request_user_input_async utilizável; quantidade indefinida | Pergunta assíncrona; trabalho independente pode continuar; não gera antes da resposta necessária |
| C04 | Codex; sem ferramenta de perguntas utilizável | Pergunta curta no chat e encerramento de turno, sem UI simulada |
| C05 | Codex; troca de Plan para Default entre rodadas | Reavalia capacidades e não chama ferramenta proibida no novo modo |
| C06 | Codex; ferramenta retorna erro de argumentos ou indisponibilidade | Corrige argumentos no primeiro caso; escolhe alternativa permitida no segundo; nenhum erro equivale a resposta |
| C07 | Codex; pergunta obrigatória cancelada ou sem resposta | Mantém decisão pendente, sem autoaprovação nem loop de reenvio |
| C08 | Codex/Default; pergunta opcional sem resposta; sessão permite premissa | Registra premissa e continua sem perguntar novamente |
| C09 | Codex para Codex; destino e entrega já explícitos | Reutiliza decisões; não repete perguntas já respondidas; mantém playback do conteúdo |
| C10 | Codex para Codex; pedido sintético de alternativas com quantidade incompleta | Esclarece quantidade e estudo versus adoção; não inventa aprovação nem amplia escopo |
| C11 | Codex para Codex; skill citada ausente; verificação necessária indisponível | Expõe dependência relevante; nunca declara consulta ou teste realizado sem evidência |
| C12 | Codex/Plan; playback confirmado | Não escreve artefato enquanto as regras do modo impedirem; não declara exit 0 sem validação |
| C13 | OpenCode para Codex | Protocolo original e question; não carrega codex-execution.md |
| C14 | Claude Code para Codex | Protocolo original e AskUserQuestion quando disponível; não aplica regras Codex |
| C15 | Cursor, Kiro, Antigravity, Devin ou Genérico para Codex | Nenhuma mudança de mecanismo, entrevista, template ou critérios por causa do destino Codex |
| C16 | Codex para Claude Code | Interatividade Codex; perfil anthropic original; não aplica checklist exclusivo Codex para Codex |
| C17 | Origem desconhecida; modelo OpenAI ou AGENTS.md presente | Não deduz origem Codex; mantém fluxo original |

## Critério de conclusão e limites

- Preservação estática: os arquivos compartilhados e o protocolo legado devem corresponder à linha de base.
- Compatibilidade estrutural: o validador deve aceitar os artefatos sintéticos válidos para todos os destinos e rejeitar casos inválidos de controle.
- Comportamento: os cenários exigem observação real das chamadas e das respostas. Só marcar como executado quando houver transcrição correspondente; a existência desta matriz não comprova aprovação.
- Não declarar que testes locais comprovam ausência de qualquer variação na experiência dos outros clientes. O isolamento verificável é o das instruções e artefatos; testes ao vivo dependem desses clientes.

## Resultado desta implementação

Verificação local em 2026-11-20, Node 24.14.0:

| Verificação | Resultado |
|:---|:---|
| Sete contratos originais comparados por hash, com normalização explícita do ponto de entrada Codex em SKILL.md | 7/7 aprovados |
| Artefatos sintéticos válidos para os oito destinos | 8/8 aprovados pelo validador original |
| Controles negativos: referência ausente, seção ausente e critical ausente | 3/3 rejeitados como esperado |
| Referências locais adicionadas | 1/1 aprovado |
| Total de testes automatizados | 19/19 aprovados, exit 0 |
| Leitura independente dos cenários C01-C17 | Concluída; ajustes de precedência e redação incorporados |
| Interação ao vivo nos clientes dos sete harnesses | Não executada; não inferir aprovação a partir dos testes estáticos |

A primeira tentativa com subprocessos foi impedida pelo sandbox (EPERM). A execução final usou workers e passou; o validador compartilhado permaneceu inalterado.
