# Deploy e upgrade de skills

Guia de processo para publicar novas versões de skills existentes e adicionar novas skills ao repositório guarda-chuva `everfranca-skills`.

## Visão geral

- **Fonte da verdade da versão**: frontmatter do `SKILL.md` de cada skill, campo `metadata.version`.
- **Versionamento**: [semver](https://semver.org/lang/pt-BR/), na ótica do agente consumidor (não há API tradicional — breaking change é qualquer alteração no comportamento observável do fluxo).
- **Tags git**: namespaced por skill, no formato `<nome-da-skill>-vX.Y.Z` (ex.: `gerar-prompt-v0.0.1`). Nunca tags globais `vX.Y.Z` — em um guarda-chuva multi-skill elas são ambíguas.
- **Changelog**: um `CHANGELOG.md` dentro de cada `skills/<nome-da-skill>/`, atualizado no mesmo PR da mudança.
- **Histórico**: vive nas tags git. Proibido manter pastas de snapshot (`skill-snapshot-*`, `iteration-*`) dentro do repositório.

## Semântica de versão para skills

| Bump | Quando usar | Exemplos |
|:---|:---|:---|
| Patch (X.Y.Z+1) | Correção que não altera o comportamento esperado | Correção no validador, ajuste de referência, typo, casamento de glob |
| Minor (X.Y+1.0) | Nova capacidade backward-compatible | Nova fase no fluxo, nova referência, novo destino de entrega opcional |
| Major (X+1.0.0) | Quebra do contrato observável | Mudança no formato do prompt gerado, novo caminho de entrega padrão, remoção de gate |

Regra prática: se um usuário que já executou a skill antes notaria diferença no resultado de forma indesejada, é major.

## Fluxo de publicação (nova versão de skill existente)

1. **Alterar a skill** em `skills/<nome-da-skill>/**`.
2. **Bump da versão** no frontmatter do `SKILL.md` da skill, no mesmo PR.
3. **Atualizar o `CHANGELOG.md`** da skill com entrada datada e bullets objetivos (critério de aceite do PR).
4. **Revisão**: conferir que o manifesto continua na raiz de `skills/<nome-da-skill>/` (exigência do discovery do registry).
5. **Merge no `main`**.
6. **Criar a tag** e enviá-la:
   ```sh
   git tag <nome-da-skill>-vX.Y.Z
   git push origin main <nome-da-skill>-vX.Y.Z
   ```

## Fluxo de adição de skill nova

1. Criar `skills/<nome-da-skill>/` com o manifesto `SKILL.md` na raiz da pasta, mais os diretórios de suporte (`assets/`, `references/`, `scripts/`, `evals/`, `tests/` — os que couberem).
2. Versão inicial: `0.0.1` no frontmatter.
3. Criar o `CHANGELOG.md` da skill com a entrada 0.0.1.
4. Adicionar uma linha na tabela "Skills disponíveis" do `README.md` da raiz.
5. Seguir os passos 4–6 do fluxo de publicação.

## Fluxo de upgrade de versão

Quando uma skill precisa evoluir (correção, nova capacidade ou quebra de contrato):

1. **Classificar a mudança** na tabela de semântica acima e decidir o bump.
2. **Implementar** a mudança isolada em um PR (nada de mudar duas skills no mesmo PR sem necessidade).
3. **Validar localmente** (quando a skill tiver validador/testes):
   ```sh
   node skills/<nome-da-skill>/scripts/<validador>.mjs <artefato>
   node skills/<nome-da-skill>/tests/<teste>.mjs
   ```
4. **Atualizar changelog + frontmatter** e seguir o fluxo de publicação.
5. **Pós-deploy**: conferir que `npx skills add everfranca/everfranca-skills` continua descobrindo a skill e que a instalação manual copia a versão nova.

## Checklist de revisão (antes do merge)

- [ ] Manifesto na raiz de `skills/<nome-da-skill>/`.
- [ ] `metadata.version` atualizada no frontmatter.
- [ ] `CHANGELOG.md` da skill com entrada datada.
- [ ] Nenhum artefato de workspace dentro do repo (`iteration-*`, `fixture*`, `skill-snapshot-*`).
- [ ] README da raiz atualizado (nova skill, nova descrição ou breaking change relevante).
- [ ] `LICENSE` intocado.

## Instalação (verificação pós-deploy)

Via registry Skills da Vercel:

```sh
npx skills add everfranca/everfranca-skills
```

Manual, global:

```sh
mkdir -p ~/.agents/skills
cp -r skills/<nome-da-skill> ~/.agents/skills/
```

Manual, por projeto:

```sh
mkdir -p .opencode/skills
cp -r skills/<nome-da-skill> .opencode/skills/
```
