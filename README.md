# everfranca-skills

[![Skills registry badge](https://skills.sh/b/everfranca/everfranca-skills)](https://skills.sh/everfranca/everfranca-skills)

Repositório guarda-chuva que versiona e distribui as skills do autor [everfranca](https://github.com/everfranca) via o registry [Skills da Vercel](https://skills.sh).

## Skills disponíveis

| Skill | Descrição |
|:---|:---|
| [gerar-prompt](skills/gerar-prompt/) | Transforma inputs curtos e vagos ("aplicar tema dark", "implementar validação token JWT na api") em prompts estruturados de alta qualidade, prontos para agentes de código em qualquer harness. |

## Instalação via registry

Instale todas as skills do repositório com:

```sh
npx skills add everfranca/everfranca-skills
```

## Instalação manual

Global (todos os projetos):

```sh
mkdir -p ~/.agents/skills
cp -r skills/gerar-prompt ~/.agents/skills/
```

Por projeto:

```sh
mkdir -p .opencode/skills
cp -r skills/gerar-prompt .opencode/skills/
```

Compatibilidade: OpenCode (nativo, via `.opencode/skills/`), Claude Code (via `.claude/skills/`), Codex (skills com menção `$`), e agentes que leiam o formato SKILL.md (via `.agents/skills/`).

## Estrutura

Cada skill vive em `skills/<nome-da-skill>/` com o manifesto `SKILL.md` na raiz da pasta:

```
skills/
└── gerar-prompt/
    ├── SKILL.md       # manifesto da skill (motor: papel, protocolo, entrevista, gates)
    ├── assets/        # template universal de 9 seções
    ├── references/    # guias por modelo, harness e quality gate
    ├── scripts/       # validador determinístico
    ├── evals/         # casos de teste e matriz de avaliação
    └── tests/         # testes locais de preservação e compatibilidade
```

## Licença

Veja [LICENSE](LICENSE).
