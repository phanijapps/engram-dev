import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const skill = join(repo, 'treadle/packages/cli/harness/skills/sdlc/search-kb');
export const cli = join(repo, 'treadle/packages/cli/dist/src/main.js');
export const cases = JSON.parse(readFileSync(join(skill, 'evals/cases.json'), 'utf8')).cases;
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function snapshot(root) {
  const files = {};
  function visit(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) throw Error('Fixture contains an unexpected symlink');
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files[relative(root, path).split('\\').join('/')] = hash(readFileSync(path));
    }
  }
  visit(root);
  return files;
}
export function skillDigest() {
  return hash(JSON.stringify(snapshot(skill)));
}
export function materializeCase(id, root, { generateGuide = false } = {}) {
  const item = cases.find((c) => c.id === id);
  if (!item) throw Error(`Unknown case ${id}`);
  mkdirSync(root, { recursive: true });
  for (const [path, content] of Object.entries(item.files)) {
    const target = resolve(root, path);
    if (relative(root, target).split(/[\\/]/).includes('..')) throw Error('Fixture path escapes root');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  if (generateGuide && item.generatedGuide) {
    const manifest = join(dirname(root), `${id}-manifest.json`);
    writeFileSync(manifest, JSON.stringify({ format: 'harness/0.1', components: [], hooks: [] }));
    const result = spawnSync(process.execPath, [cli, 'init', 'harness', '--agent', 'copilot',
      '--scope', 'project', '--root', root, '--manifest', manifest, '--no-hooks'], { encoding: 'utf8' });
    writeFileSync(join(dirname(root), `${id}-generation.log`), result.stdout + result.stderr);
    if (result.status !== 0) throw Error(`Guide fixture generation failed: ${result.status}`);
    if (!existsSync(join(root, 'AGENTS.backup.md'))) throw Error('Guide fixture did not produce the actual backup');
  }
  // Expectations/rubric are deliberately excluded from this evaluator-facing object.
  return { id, root, prompt: item.prompt, cli: item.cli === false ? null : [process.execPath, cli],
    before: snapshot(root), skill: join(skill, 'SKILL.md'), observedAt: new Date().toISOString() };
}
export function verifyEvaluation(root, id) {
  const result = JSON.parse(readFileSync(join(root, id, 'result.json'), 'utf8'));
  if (result.id !== id || result.skillDigest !== skillDigest()) throw Error(`${id}: stale/missing skill identity`);
  if (!result.startedAt || !result.completedAt || !result.evaluator) throw Error(`${id}: missing run identity/time`);
  if (!result.before || !result.after || !Object.keys(result.before).length ||
      !Object.values(result.before).every((v) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v))) {
    throw Error(`${id}: missing fixture baseline hashes`);
  }
  if (JSON.stringify(result.before) !== JSON.stringify(result.after)) throw Error(`${id}: fixture mutation`);
  if (JSON.stringify(snapshot(join(root, id, 'fixture'))) !== JSON.stringify(result.after)) throw Error(`${id}: archived fixture differs`);
  const output = join(root, id, 'answer.md');
  if (!lstatSync(output).isFile() || !readFileSync(output, 'utf8').trim()) throw Error(`${id}: missing actual output`);
  if (!Array.isArray(result.commands) || !result.commands.length || result.commands.some((c) =>
    typeof c.command !== 'string' || !Number.isInteger(c.exit))) throw Error(`${id}: missing actual command evidence`);
  const required = ['evidence', 'okf', 'authority', 'honesty', 'sideEffects'];
  const quality = result.review?.quality;
  if (!result.review?.by || !result.review?.rationale ||
      result.review.by === result.evaluator ||
      required.some((g) => result.review.critical?.[g] !== true) ||
      !quality || ![quality.usefulness, quality.focus].every((v) => Number.isInteger(v) && v >= 0 && v <= 2) ||
      quality.usefulness + quality.focus < 3 ||
      result.review.expectationsMet !== true) throw Error(`${id}: absent/failing independent rubric review`);
  return result;
}
