import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { Worker } from 'node:worker_threads';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(readFileSync(join(skillRoot, 'evals/codex-baseline.json'), 'utf8'));
const sha256 = (data) => createHash('sha256').update(data).digest('hex');

for (const [file, expected] of Object.entries(baseline)) {
  test(`preserva o contrato v0.0.1: ${file}`, () => {
    let content = readFileSync(join(skillRoot, file));
    if (file === 'SKILL.md') {
      let text = content.toString('utf8');
      const blocks = text.match(/<!-- codex-only:start -->[\s\S]*?<!-- codex-only:end -->\n\n/g) ?? [];
      assert.equal(blocks.length, 1, 'deve existir somente um ponto de entrada para Codex');
      assert.ok(text.indexOf(blocks[0]) < text.indexOf('<critical>'), 'roteamento deve preceder o fluxo legado');
      assert.match(blocks[0], /Somente quando o harness que está executando esta skill for Codex/);
      assert.match(blocks[0], /outro harness, ou a origem for indeterminada, não carregue nem aplique/);
      text = text.replace(blocks[0], '').replace('  version: 0.0.3\n', '  version: 0.0.1\n');
      content = Buffer.from(text);
    }
    assert.equal(sha256(content), expected, `${file}: houve alteração fora da extensão isolada`);
  });
}

function artifact(harness, family) {
  const sections = [
    ['Papel', 'Atue como especialista em documentação.'],
    ['Contexto', 'O projeto precisa registrar o comando de consulta.'],
    ['Referências', '`README.md` descreve o projeto.'],
    ['Tarefa', 'Documente o comando de consulta.'],
    ['Instruções', 'Leia o README e documente o comando existente.'],
    ['Restrições', 'Altere somente a documentação e preserve o código.'],
    ['Critérios de Aceite', 'O README contém o comando de consulta e o código permanece intacto.'],
    ['Formato de Saída', 'Entregue o README atualizado.'],
    ['Auto-verificação', 'Verifique o comando documentado e a preservação do código.'],
  ];
  const xmlNames = ['papel', 'contexto', 'referências', 'tarefa', 'instruções', 'restrições', 'criterios-de-aceite', 'formato-de-saida', 'auto-verificacao'];
  const critical = '\n\n<critical>\n- Preserve o código.\n- Registre o comando.\n- Verifique a documentação.\n</critical>\n';
  const body = sections.map(([name, value], index) => family === 'anthropic'
    ? `<${xmlNames[index]}>\n${value}\n</${xmlNames[index]}>`
    : `## ${name}\n\n${value}`).join('\n\n');
  return `---\ngerado_em: 2026-11-20\nfamilia_modelo: ${family}\nharness_alvo: ${harness}\ninput_original: "Documentar comando"\nversao: 1\n---\n\n# Documentar comando\n\n${body}${critical}`;
}

async function validate(markdown) {
  const temp = mkdtempSync(join(tmpdir(), 'gerar-prompt-compat-'));
  try {
    writeFileSync(join(temp, 'README.md'), '# Projeto sintético\n');
    writeFileSync(join(temp, 'prompt.md'), markdown);
    // Executa o módulo original, sem reescrevê-lo. process.exit encerra só o worker.
    // O worker tem argv/cwd próprios para o teste, sem mudar o cwd do processo pai.
    return await new Promise((accept, reject) => {
      const worker = new Worker(`
        const { workerData } = require('node:worker_threads');
        process.argv = [process.execPath, workerData.validatorPath, 'prompt.md'];
        process.cwd = () => workerData.cwd;
        import(workerData.validatorUrl).catch(error => { console.error(error); process.exit(2); });
      `, {
        eval: true,
        stdout: true,
        stderr: true,
        workerData: {
          cwd: temp,
          validatorPath: join(skillRoot, 'scripts/validar-prompt.mjs'),
          validatorUrl: pathToFileURL(join(skillRoot, 'scripts/validar-prompt.mjs')).href,
        },
      });
      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => {
        worker.terminate();
        reject(new Error('Validador excedeu 10 segundos'));
      }, 10000);
      worker.stdout.on('data', (data) => { stdout += data; });
      worker.stderr.on('data', (data) => { stderr += data; });
      worker.on('error', (error) => { clearTimeout(timer); reject(error); });
      worker.on('exit', (status) => { clearTimeout(timer); accept({ status, stdout, stderr }); });
    });
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

const targets = {
  'claude-code': 'anthropic',
  codex: 'openai',
  opencode: 'generico',
  cursor: 'generico',
  kiro: 'generico',
  antigravity: 'google',
  devin: 'harness-specific',
  generico: 'generico',
};

for (const [harness, family] of Object.entries(targets)) {
  test(`validador aceita o contrato existente para ${harness} sem novos metadados`, async () => {
    const result = await validate(artifact(harness, family));
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /referências verificadas: 1/);
  });
}

test('controle negativo: continua rejeitando referência inexistente', async () => {
  const result = await validate(artifact('opencode', 'generico').replace('`README.md`', '`ausente.md`'));
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /\[REFERÊNCIA\]/);
});

test('controle negativo: continua rejeitando seção ausente', async () => {
  const result = await validate(artifact('cursor', 'generico').replace('## Papel', '## Especialista'));
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /\[SEÇÃO\] ausente: ## Papel/);
});

test('controle negativo: continua exigindo critical no formato Codex', async () => {
  const result = await validate(artifact('codex', 'openai').replace(/<critical>[\s\S]*?<\/critical>/, ''));
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /\[SEÇÃO\] ausente: bloco <critical>/);
});

test('controle negativo: critical fora do final do artefato é rejeitado', async () => {
  const moved = artifact('opencode', 'generico').replace(/\n\n<critical>[\s\S]*?<\/critical>\n$/, '\n');
  const withEarlyCritical = moved.replace('## Instruções', '<critical>\n- Preserve o código.\n- Registre o comando.\n- Verifique a documentação.\n</critical>\n\n## Instruções');
  const result = await validate(withEarlyCritical);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /\[SEÇÃO\] bloco <critical> deve ser o ÚLTIMO elemento/);
});

test('referências locais adicionadas são resolvíveis', () => {
  for (const file of ['references/codex-execution.md', 'evals/codex-compatibility.md']) {
    assert.ok(readFileSync(join(skillRoot, file), 'utf8').trim().length > 0);
  }
});
