# Execução da skill no Codex

Carregue esta referência somente quando a sessão que executa a skill for Codex. Ela não configura o cliente, não habilita ferramentas e não altera permissões ou modo da sessão. Em conflito, prevalecem as instruções da sessão e o contrato da ferramenta disponível. Exceção: a regra de gravação exclusiva dentro do diretório da aplicação (raiz do projeto alvo, caminho relativo), declarada no bloco `<critical>` do SKILL.md, independerá de harness e NUNCA é relaxada por esta referência.

## 1. Fronteira de aplicação

| Execução | Destino do prompt | Comportamento |
|:---|:---|:---|
| Codex | Codex | Interatividade desta referência e verificações da seção 4 |
| Codex | Outro | Interatividade desta referência; formato e conteúdo seguem o perfil original do destino |
| Outro ou desconhecido | Qualquer, inclusive Codex | Protocolo original; esta referência não se aplica |

Não inferir execução no Codex por `AGENTS.md`, modelo OpenAI ou `harness_alvo: codex`. Não copiar o protocolo de interatividade desta referência para o prompt final; a seção 4 orienta a qualidade do conteúdo quando aplicável. O template universal, o esquema obrigatório dos metadados e o validador permanecem os mesmos.

## 2. Perguntas interativas

Antes de cada rodada necessária, confira as ferramentas expostas e o modo ativo. Preserve o mecanismo escolhido enquanto continuar disponível e permitido; reavalie após mudança de modo, indisponibilidade ou erro de capacidade. Não repita uma pergunta já respondida.

| Capacidade da sessão | Ação |
|:---|:---|
| `request_user_input` disponível e permitido para a pergunta | Chame a ferramenta com opções; em Plan Mode, ela aguarda a resposta |
| `request_user_input` indisponível ou inadequado à pergunta, mas `request_user_input_async` disponível e permitido | Chame a ferramenta assíncrona e registre a decisão pendente |
| Nenhuma ferramenta utilizável para aquela pergunta | Faça uma pergunta curta em texto e encerre o turno; use numeração somente se permitida pelas instruções da sessão |

- Em Default Mode, a disponibilidade de `request_user_input` varia por versão e configuração. Se a sessão restringir seu uso a perguntas opcionais, não o use para uma decisão obrigatória nem para aprovação. Use a alternativa permitida ou a pergunta em texto.
- `request_user_input_async` é uma capacidade observada em algumas sessões, não uma garantia de todos os clientes Codex. O nome sozinho não comprova disponibilidade: confira o toolset e seu contrato.
- Respeite o schema real: para `request_user_input`, quando o contrato assim definir, agrupe de uma a três perguntas, com duas ou três opções mutuamente exclusivas por pergunta. Não copie a lista de seis harnesses do exemplo universal para um campo limitado a três opções. Mostre os destinos pertinentes e permita a resposta livre oferecida pelo cliente; não invente uma opção `Other` quando o cliente já a adiciona.
- Coloque a recomendação primeiro, com o rótulo exigido pela ferramenta. Não prometa seleção pré-marcada se o cliente não a oferecer. Não simule formulário escrevendo opções no chat quando a ferramenta apropriada estiver utilizável.
- Para pergunta assíncrona, continue apenas leituras ou trabalho independente da resposta. Não gere o artefato nem avance por uma decisão obrigatória pendente.
- Ausência de resposta, cancelamento, timeout e opção pré-selecionada não são confirmação. Uma pergunta opcional sem resposta pode seguir com uma premissa explícita quando a sessão permitir; uma decisão obrigatória permanece pendente. Não entre em loop de reenvio automático.
- Se a chamada falhar, diferencie indisponibilidade da ferramenta de argumentos inválidos. Corrija argumentos inválidos; diante de indisponibilidade, use a próxima alternativa permitida. Não trate falha como resposta.
- As regras valem para alvos, entrevista, playback, resolução de ambiguidades do gate, entrega e iteração. Não use ferramenta de clarificação para contornar o mecanismo de aprovação de ações do ambiente.

## 3. Fluxo da geração no Codex

1. Faça o Discovery não mutante antes da primeira pergunta: leia as convenções, localize os arquivos e verifique as skills mencionadas. O exemplo de primeira mensagem apenas com a pergunta de harness, no fallback universal, não se aplica à execução no Codex.
2. Reutilize o harness explicitamente informado pelo usuário. Se ainda faltar, pergunte uma vez com Codex como recomendação da sessão; os marcadores do repositório são contexto, não confirmação de destino.
3. Identifique somente lacunas que alterem a entrega. Quantidade incompleta, estudo versus adoção transversal e regras de aprovação exigem uma decisão quando não houver autorização anterior. Nunca invente uma confirmação do usuário.
4. Distinga no entendimento os requisitos solicitados, os fatos encontrados e as decisões propostas. Mantenha um registro conciso na conversa, sem acrescentar campos obrigatórios ao YAML nem transcrição ao prompt.
5. Faça o playback com essas decisões e critérios. Reutilize uma confirmação anterior somente se ela cobrir o mesmo entendimento; mudanças materiais precisam ser esclarecidas. Não trate silêncio como aceite.
6. Depois das decisões necessárias, gere, revise e valide o prompt. Se a sessão estiver em Plan Mode e proibir escrita, permaneça na análise e no planejamento: não salve arquivo, não finja validação e não tente trocar o modo por conta própria.
7. Aproveite o formato de entrega já escolhido. Pergunte apenas se ele ainda estiver indefinido; mantenha a validação obrigatória antes da entrega do artefato.

## 4. Qualidade adicional somente para Codex gerando para Codex

Aplicar esta seção apenas se execução e destino forem Codex. Para outro destino, manter os perfis originais, sem acrescentar essas exigências.

- **Fidelidade:** cada ampliação de quantidade, abrangência ou adoção deve corresponder a uma decisão do usuário ou a uma proposta claramente identificada e resolvida antes da geração. Pedido de alternativas não autoriza automaticamente aplicar a recomendação em todas as telas.
- **Contexto suficiente:** preservar os fatos que condicionam a execução, como fronteiras de escrita, regras visuais aprovadas, arquivos de registro e diretório dos comandos. Não copiar inventários ou versões que não influenciem a tarefa. Revalidar caminhos no repositório da tarefa.
- **Skills e capacidades:** resolver nomes ambíguos usando o catálogo real. Quando houver mais de uma opção com impacto material, esclarecer. Incorporar os requisitos essenciais da skill consultada; não pressupor que ela ou ferramentas opcionais estarão instaladas no ambiente executor. Se uma dependência indispensável faltar, registrar o impedimento sem inventar disponibilidade.
- **Rastreabilidade:** conferir tarefa, instruções, bloco critical, critérios e evidências em conjunto. Cada regra crítica deve derivar das seções completas e ter verificação correspondente; os critérios devem ser verificáveis de forma independente.
- **Precisão:** consultar fontes primárias para requisitos normativos e distinguir obrigação de meta adicional. Substituir promessas de conformidade total por critérios e cenários verificáveis, sem transformar este exemplo de UI em regra fixa para outras tarefas.
- **Comprovação:** solicitar evidências de cada medida exigida, não apenas uma conclusão. Definir que testes impedidos sejam relatados como não verificados, com motivo; resultado ausente não é sucesso. Evitar impor suítes irrelevantes.
- **Entrega limpa:** separar o artefato executável do relato da geração, sugestões de continuação e histórico da entrevista. Manter a concisão sem omitir decisões ou dependências.
- **Validação honesta:** o exit 0 do validador comprova somente as verificações estruturais implementadas. A revisão semântica acima continua necessária. Não alterar o validador compartilhado para impor esse checklist aos outros harnesses.
- **Metadados:** `effort` é informativo no Markdown e não configura o cliente Codex. Não acrescentar campos obrigatórios nem mudar enums nesta correção.

## 5. Fundamentação e limites

Consultado via MCP Context7 em 2026-11-20, biblioteca `/openai/codex`:

- [Handler de request_user_input](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/handlers/request_user_input.rs): verifica modos disponíveis e marca a chamada como bloqueante em Plan Mode.
- [Configuração de ferramentas](https://github.com/openai/codex/blob/main/codex-rs/tools/src/tool_config.rs): disponibilidade em Default Mode pode depender de feature flag.
- [Instruções do modo Default](https://github.com/openai/codex/blob/main/codex-rs/collaboration-mode-templates/templates/default.md): uso condicionado às ferramentas expostas e à natureza da pergunta.
- [Schema das perguntas](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/handlers/request_user_input_spec.rs): opções e resposta livre do cliente.

Essas fontes descrevem a revisão consultada, não todas as versões instaladas. A ferramenta assíncrona foi confirmada no contrato da sessão usada na análise, não nessas fontes. Nenhuma configuração experimental ou MCP extra é exigido pela skill. A pesquisa dos demais harnesses está em `../evals/codex-compatibility.md`, apenas para manutenção e avaliação.
