<!--
Template universal da skill gerar-prompt.

Regras de preenchimento:
1. Preencha cada {{PLACEHOLDER}} com o conteúdo levantado no Discovery e na Entrevista.
2. Remova TODOS os comentários guia (blocos <!-- -->) ao gerar o artefato final.
3. Mantenha as 9 seções nesta ordem (o validador confere a presença de cada header).
4. Ajustes inline permitidos (por família de modelo, ver references/model-profiles.md):
   - familia anthropic: envolver cada seção em tags XML (<papel>, <contexto>, ...) no lugar dos headers ##.
   - demais familias: manter os headers markdown ## abaixo.
5. Zero emojis em todo o artefato.
-->

---
gerado_em: {{DATA}}
familia_modelo: {{FAMILIA_MODELO}}
harness_alvo: {{HARNESS_ALVO}}
effort: {{EFFORT}}
input_original: "{{INPUT_ORIGINAL}}"
versao: {{VERSAO}}
---

<!-- Titulo curto e descritivo da tarefa em uma linha (# Aplicar tema dark) -->
# {{TITULO}}

## Papel

<!-- Uma frase: especialista senior do dominio da tarefa -->
{{PAPEL}}

## Contexto

<!-- O por que da tarefa + findings do Discovery: stack, versoes, convencoes, padroes do projeto.
     Explique a motivacao: o agente executador generaliza melhor quando entende o objetivo.
     Contexto longo vem antes da tarefa: dados no topo, instrucoes no final. -->
{{CONTEXTO}}

## Referências

<!-- Caminhos just-in-time descobertos no Discovery (arquivos relacionados, docs, configs).
     Um por linha, com uma curta nota do que contem. NAO colar conteudo integral de arquivos.
     Ajustar a sintaxe ao harness alvo (ver references/harness-profiles.md):
     - claude-code / cursor: pode usar @caminho
     - demais: caminho relativo puro -->
{{REFERENCIAS}}

## Tarefa

<!-- Objetivo unico e claro. Verbo de acao no imperativo: implemente, crie, altere, corrija.
     Nunca sugestao ("poderia", "que tal"). -->
{{TAREFA}}

<critical>

<!-- Distile AQUI 3 a 5 regras verdadeiramente bloqueantes, uma linha cada,
     extraidas das secoes Restricoes e Criterios de Aceite (nao invente regras novas):
     fronteiras de escopo, o que nao pode ser alterado, verificacao obrigatoria.
     Instrucoes criticas destacadas ganham aderencia do agente executor
     (pratica recomendada pela documentacao da Anthropic). -->
{{CRITICOS}}

</critical>

## Instruções

<!-- Passos numerados quando a ordem importa; bullets quando nao importa.
     Altitude por familia (ver references/model-profiles.md):
     - modelo forte: menos passos, mais objetivo + guardrails
     - modelo fraco: passos explicitos, menos inferencia implicita -->
{{INSTRUCOES}}

## Restrições

<!-- Regras ditas positivamente ("escreva X", nao "nao escreva Y").
     Cada restricao deve mudar o comportamento; remova as que nao mudam.
     Exemplos: linguagem do codigo e das mensagens, convencoes do projeto,
     limites de escopo (o que fica fora desta iteracao). -->
{{RESTRICOES}}

## Critérios de Aceite

<!-- Mensuraveis e testaveis, um por linha, verificaveis de forma independente.
     "Tempo de resposta < 2s com 1000 registros" [OK] | "deve ser rapido" [ERRADO]
     Todo item de escopo precisa de criterio correspondente. -->
{{CRITERIOS}}

## Formato de Saída

<!-- O deliverable explicito: arquivos criados/alterados esperados,
     como reportar o resultado, o que entregar ao final.
     Arquivos que serao criados pela tarefa: citar com a anotacao "(a criar)"
     na mesma linha — o validador isenta esses da checagem de existencia. -->
{{FORMATO_SAIDA}}

## Auto-verificação

<!-- O que o agente executador deve conferir antes de declarar conclusao.
     Ex: rodar os testes existentes, revisar os criterios de aceite um a um,
     confirmar que nenhum arquivo fora do escopo foi alterado. -->
{{AUTO_VERIFICACAO}}
