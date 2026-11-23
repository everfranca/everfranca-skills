# Quality Gate (3 severidades)

<critical>

- Referência morta e contradição lógica são ALTA: bloqueiam a geração e exigem decisão do usuário antes de prosseguir.
- O princípio transversal é o menor conjunto de tokens de alto sinal: conteúdo que não muda o comportamento do agente executor é corte.
- Zero emojis e zero termos vagos: ambos verificados deterministicamente pelo validador; não dependem de julgamento.

</critical>

O gate elimina três classes de falha, em ordem de gravidade. Princípio transversal: o menor conjunto de tokens de alto sinal. Cada seção precisa merecer seus tokens; qualquer conteúdo que não mude o comportamento do agente executador é corte.

## Camada 1: ALTA (bloqueia a geração)

Correções que exigem decisão do usuário antes de prosseguir.

| Verificação | O que validar |
|:---|:---|
| Contradições | Zero contradições lógicas entre seções (restrição que nega critério, escopo que excede tarefa) |
| Referências vivas | Todo caminho citado existe no repositório (verificado no Discovery). Exceção: arquivos que serão criados pela tarefa devem vir anotados com "(a criar)" na mesma linha — o validador isenta esses da checagem de existência |
| Estrutura mínima | Papel, Tarefa e Critérios de Aceite presentes e preenchidos |
| Escopo coberto | Todo item de escopo/instrução tem critério de aceite correspondente |
| Verbos de ação | A Tarefa usa imperativo de ação; zero "poderia", "que tal", "sugiro" |

Comportamento: liste numerado com tipo e impacto, explique cada um e pergunte ao usuário como resolver. Não gere o artefato ainda.

```
[ALTA] Encontrada:
1. [REFERÊNCIA MORTA] "src/tema/config.ts" citado em Referências não existe no repositório.
   Impacto: agente executador trava ou improvisa caminho errado.
   Sugestão: remover ou substituir por src/styles/theme.ts (encontrado no Discovery).
Como proceder?
```

## Camada 2: MÉDIA (corrige com aprovação)

| Categoria | Flag | Correção |
|:---|:---|:---|
| Quantitativos | "rápido", "vários", "alguns" | "< 2s", "> 100 itens", quantidade exata |
| Subjetivos | "fácil", "intuitivo", "eficiente" | "3 cliques no máximo", "formulário com 3 campos" |
| Temporais | "em breve", "futuramente" | "fora do escopo nesta versão" |
| Comportamentais | "tratar erros", "funcionar" | "retornar 400 com mensagem X", "logar e continuar" |
| Métricas ausentes | critério sem forma de verificar | definir forma objetiva de verificação |

Comportamento: liste com sugestão específica e peça aprovação para auto-corrigir.

```
[MÉDIA] Seção Restrições menciona "listagem rápida".
Sugestão: substituir por "carregamento da listagem em < 2s com 1000 registros".
Aplicar automaticamente? (responda SIM)
```

## Camada 3: BAIXA (corrige e documenta)

- Emojis: zero em qualquer nível do artefato (o validador também rejeita).
- Formatação: headers na ordem do template, kebab-case no nome do arquivo, metadados completos.
- Ordenação: contexto longo no topo, instruções no final (dados antes da pergunta melhora a atenção do modelo).
- Comportamento: corrija automaticamente e siga; registre como nota na entrega se relevante.

## Anti-bloat (checklist final antes de validar)

- [ ] Cada restrição muda comportamento? (remova as que não mudam)
- [ ] Alguma seção repete informação de outra? (deduplicar)
- [ ] Há histórico de conversa colado no prompt? (remover; só o essencial vai para o artefato)
- [ ] Exemplos incluídos são canônicos e diversos, ou apenas decorativos? (cortar decorativos)
- [ ] O prompt completo cabe numa leitura atenta de 2 minutos? (se não, cortar)

## Lista de termos vagos (determinística)

Usada pelo validador e por esta camada. Se o termo aparecer, quantifique ou reescreva:

rápido, rápida, fácil, facilmente, intuitivo, intuitiva, eficiente, vários, várias, alguns, algumas, melhorar, otimizar, adequado, adequada, em breve, futuramente.
