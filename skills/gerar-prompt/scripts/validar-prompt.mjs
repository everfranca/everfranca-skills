#!/usr/bin/env node
// Validador determinístico do artefato gerado pela skill gerar-prompt.
//
// Uso:
//   node validar-prompt.mjs <caminho-do-prompt.md>
//
// Exit 0: artefato conforme.
// Exit 1: violações listadas com número de linha; corrija e reexecute.
//
// Verificações:
//   1. Metadados: campos obrigatórios, enums válidos, data AAAA-MM-DD, versão inteira
//   2. Estrutura: presença das 9 seções do template universal
//   3. Placeholders residuais: {{...}}, TBD, XXX, TODO
//   4. Termos vagos: lista do quality gate (somente no corpo, metadados preservam o input verbatim)
//   5. Emojis: zero em qualquer nível do artefato
//   6. Referências vivas: caminhos de arquivo citados existem no diretório atual

import { readFileSync, existsSync } from "node:fs";
import { resolve, sep } from "node:path";

const SECTIONS = [
  "## Papel",
  "## Contexto",
  "## Referências",
  "## Tarefa",
  "## Instruções",
  "## Restrições",
  "## Critérios de Aceite",
  "## Formato de Saída",
  "## Auto-verificação",
];

const META_FIELDS = ["gerado_em", "familia_modelo", "harness_alvo", "input_original", "versao"];

const FAMILIAS = ["anthropic", "openai", "google", "meta", "open-weights-cn", "harness-specific", "generico"];
const HARNESS = ["claude-code", "codex", "opencode", "cursor", "kiro", "antigravity", "devin", "generico"];
const EFFORTS = ["high", "medium", "low", "max", "xhigh"];

const VAGUE_TERMS = [
  "rápido", "rápida", "fácil", "facilmente", "intuitivo", "intuitiva",
  "eficiente", "vários", "várias", "alguns", "algumas",
  "melhorar", "otimizar", "adequado", "adequada", "em breve", "futuramente",
];

const PLACEHOLDER_PATTERNS = [
  [/\{\{[^}\n]*\}\}/g, "placeholder {{...}} residual"],
  [/\bTBD\b/g, "marcador TBD residual"],
  [/\bXXX\b/g, "marcador XXX residual"],
  [/\bTODO\b/g, "marcador TODO residual"],
];

// Faixas Unicode de emoji (pictogramas, dingbats, seletores de variação, bandeiras).
// Setas (2190-21FF) propositalmente fora: são notação legítima em texto técnico.
const EMOJI_REGEX = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

const PATH_REGEX =
  /(?:\.\/|\/)?[A-Za-z0-9._\-/]+\.(?:md|markdown|tsx?|jsx?|mjs|cjs|py|pyi|go|rs|java|rb|php|css|scss|sass|less|html?|jsonc?|ya?ml|toml|sql|sh|bash|zsh|kts?|swift|c|cpp|cc|h|hpp|vue|svelte|proto|env|ini|cfg|conf|txt)\b/g;

const fileName = process.argv[2];
if (!fileName) {
  console.error("Uso: node validar-prompt.mjs <caminho-do-prompt.md>");
  process.exit(1);
}

const filePath = resolve(fileName);
if (!existsSync(filePath)) {
  console.error(`[ERRO] Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

const raw = readFileSync(filePath, "utf8");
const lines = raw.split(/\r?\n/);
const violations = [];
const notes = [];

// --- Separa frontmatter (metadados) do corpo ---

let frontmatterEnd = -1;
if (lines[0]?.trim() !== "---") {
  violations.push("[METADADOS] linha 1: arquivo deve iniciar com o bloco de frontmatter '---'");
} else {
  frontmatterEnd = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (frontmatterEnd === -1) {
    violations.push("[METADADOS] frontmatter aberto na linha 1 sem fechamento '---'");
  }
}

const meta = new Map();
if (frontmatterEnd > 0) {
  lines.slice(1, frontmatterEnd).forEach((line, offset) => {
    const match = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (match) meta.set(match[1], match[2].trim().replace(/^["']|["']$/g, ""));
  });
}

const bodyStart = frontmatterEnd > 0 ? frontmatterEnd + 1 : 0;
const bodyLines = lines.slice(bodyStart);
const bodyText = bodyLines.join("\n");

// --- 1. Metadados ---

for (const field of META_FIELDS) {
  if (!meta.has(field) || meta.get(field) === "") {
    violations.push(`[METADADOS] campo obrigatório ausente ou vazio: ${field}`);
  }
}

if (meta.has("gerado_em") && !/^\d{4}-\d{2}-\d{2}$/.test(meta.get("gerado_em"))) {
  violations.push(`[METADADOS] gerado_em com formato inválido: '${meta.get("gerado_em")}' (esperado AAAA-MM-DD)`);
}

if (meta.has("familia_modelo") && !FAMILIAS.includes(meta.get("familia_modelo"))) {
  violations.push(`[METADADOS] familia_modelo inválida: '${meta.get("familia_modelo")}' (permitidas: ${FAMILIAS.join(", ")})`);
}

if (meta.has("harness_alvo") && !HARNESS.includes(meta.get("harness_alvo"))) {
  violations.push(`[METADADOS] harness_alvo inválido: '${meta.get("harness_alvo")}' (permitidos: ${HARNESS.join(", ")})`);
}

if (meta.has("effort") && meta.get("effort") !== "" && !EFFORTS.includes(meta.get("effort"))) {
  violations.push(`[METADADOS] effort inválido: '${meta.get("effort")}' (permitidos: ${EFFORTS.join(", ")})`);
}

if (meta.has("versao") && !/^\d+$/.test(meta.get("versao"))) {
  violations.push(`[METADADOS] versao deve ser inteiro positivo: '${meta.get("versao")}'`);
}

// --- 2. Seções ---

// No formato anthropic as seções usam tags XML no lugar dos headers markdown;
// aceita qualquer uma das duas formas, contanto que as nove existam.
const xmlSections = SECTIONS.map((section) => section.replace(/^## /, "").toLowerCase()
  .replace("critérios de aceite", "criterios-de-aceite")
  .replace("formato de saída", "formato-de-saida")
  .replace("auto-verificação", "auto-verificacao"));

const missing = SECTIONS.filter((section, index) => {
  const hasHeader = bodyLines.some((line) => line.trim() === section);
  const hasXml = bodyLines.some((line) => line.trim().match(new RegExp(`^<${xmlSections[index]}>`)));
  return !hasHeader && !hasXml;
});
for (const section of missing) {
  violations.push(`[SEÇÃO] ausente: ${section} (ou equivalente em tag XML)`);
}

// Bloco <critical> obrigatorio: regras bloqueantes destacadas, e deve ser o
// ULTIMO elemento do artefato (apos a ultima secao, antes apenas de espaco em branco).
if (!/<critical>[\s\S]*?\S[\s\S]*?<\/critical>/.test(bodyText)) {
  violations.push("[SEÇÃO] ausente: bloco <critical>...</critical> com 3 a 5 regras bloqueantes (no final do artefato)");
} else {
  const lastSectionIdx = bodyLines.reduce((last, line, index) => {
    const isHeader = SECTIONS.some((section) => line.trim() === section) ||
      xmlSections.some((tag) => line.trim().startsWith(`<${tag}>`));
    return isHeader ? index : last;
  }, -1);
  const criticalCloseIdx = bodyLines.reduce((last, line, index) =>
    line.trim() === "</critical>" ? index : last, -1);
  const trailing = bodyLines.slice(criticalCloseIdx + 1).some((line) => line.trim() !== "");
  if (lastSectionIdx >= criticalCloseIdx || trailing) {
    violations.push("[SEÇÃO] bloco <critical> deve ser o ÚLTIMO elemento do artefato: reposicione após a seção Auto-verificação, sem conteúdo depois dele");
  }
}

// --- 3. Placeholders residuais (corpo) ---

for (const [pattern, label] of PLACEHOLDER_PATTERNS) {
  bodyLines.forEach((line, index) => {
    pattern.lastIndex = 0;
    if (pattern.test(line)) {
      violations.push(`[PLACEHOLDER] linha ${bodyStart + index + 1}: ${label}`);
    }
  });
}

// --- 4. Termos vagos (corpo; metadados preservam input_original verbatim) ---

for (const term of VAGUE_TERMS) {
  const regex = new RegExp(`(?<![\\p{L}])${term}(?![\\p{L}])`, "giu");
  bodyLines.forEach((line, index) => {
    regex.lastIndex = 0;
    const found = line.match(regex);
    if (found) {
      violations.push(`[VAGUE] linha ${bodyStart + index + 1}: termo '${found[0]}' -> quantifique ou reescreva (ex: '< 2s', '3 cliques no máximo')`);
    }
  });
}

// --- 5. Emojis (arquivo inteiro) ---

lines.forEach((line, index) => {
  if (EMOJI_REGEX.test(line)) {
    violations.push(`[EMOJI] linha ${index + 1}: caractere emoji encontrado (proibido em qualquer nível do artefato)`);
  }
});

// --- 6. Referências vivas (corpo, URLs ignoradas) ---
// Duas isenções deliberadas:
//   a) Padrões glob (*.test.ts): o asterisco e o token seguinte são removidos antes
//      do casamento, para não tratar fragmento de glob como caminho.
//   b) Arquivos futuros: caminho anotado com "(a criar)" ou "[a criar]" é isento da
//      checagem de existência, contado para transparência, SOMENTE quando a linha
//      contém exatamente um caminho. Linhas com múltiplos caminhos não são isentas:
//      a anotação é ambígua quanto a qual caminho é deliverable, e um typo em caminho
//      real passaria sem verificação (falso negativo).

const FUTURE_REF_REGEX = /[([]\s*a criar\s*[)\]]/i;

const bodyNoUrls = bodyText.replace(/https?:\/\/\S+/g, "");
const bodyNoGlobs = bodyNoUrls.replace(/\*[^*\s]*/g, " ");
const candidates = [...new Set(bodyNoGlobs.match(PATH_REGEX) || [])];
let checkedRefs = 0;
let futureRefs = 0;
for (const candidate of candidates) {
  const lineNo = bodyLines.findIndex((line) => line.replace(/\*[^*\s]*/g, " ").includes(candidate));
  const lineContent = lineNo >= 0 ? bodyLines[lineNo] : "";
  const pathsInLine = [...new Set((lineContent.replace(/\*[^*\s]*/g, " ").match(PATH_REGEX) || []))];
  if (FUTURE_REF_REGEX.test(lineContent) && pathsInLine.length === 1) {
    futureRefs++;
    continue;
  }
  const absolute = resolve(process.cwd(), candidate);
  const root = resolve(process.cwd());
  if (!absolute.startsWith(root + sep)) {
    violations.push(`[REFERÊNCIA] linha ${lineNo + bodyStart + 1}: caminho fora do projeto não permitido: ${candidate}`);
    continue;
  }
  checkedRefs++;
  if (!existsSync(absolute)) {
    violations.push(`[REFERÊNCIA] linha ${lineNo + bodyStart + 1}: caminho citado não existe: ${candidate}`);
  }
}
notes.push(`referências verificadas: ${checkedRefs}`);
if (futureRefs > 0) notes.push(`referências futuras anotadas '(a criar)' isentas: ${futureRefs}`);

// --- Resultado ---

if (violations.length > 0) {
  console.log(`[VIOLAÇÃO] ${violations.length} problema(s) encontrado(s) em ${fileName}:`);
  console.log("");
  for (const violation of violations) {
    console.log(`  ${violation}`);
  }
  console.log("");
  console.log("Corrija cada violação e reexecute o validador até obter exit 0.");
  process.exit(1);
}

console.log(`[OK] ${fileName}: artefato conforme (9/9 seções, metadados completos, zero placeholders, zero termos vagos, zero emojis, ${notes.join(", ")}).`);
process.exit(0);
