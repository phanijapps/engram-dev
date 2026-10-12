import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cli = fileURLToPath(new URL('../dist/src/main.js', import.meta.url));
const hook = fileURLToPath(new URL('../harness/hooks/codex-context.js', import.meta.url));
it('runs the documented stdin/context contract, event workspace and next-event restart without owner acts', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex context ü ')),
    state = join(root, 'state'),
    workspace = join(root, 'workspace');
  mkdirSync(workspace);
  const env = { ...process.env, HARNESS_STATE_DIR: state, HARNESS_RUNTIME_ENTRY: cli };
  const callback = () =>
    spawnSync(process.execPath, [hook, '--event', 'UserPromptSubmit'], {
      input: JSON.stringify({
        hook_event_name: 'UserPromptSubmit',
        cwd: workspace,
        prompt: 'secret not persisted',
      }),
      env,
      encoding: 'utf8',
      timeout: 30000,
    });
  try {
    const a = callback();
    expect(a.status, a.stderr).toBe(0);
    const out = JSON.parse(a.stdout);
    expect(out.hookSpecificOutput.hookEventName).toBe('UserPromptSubmit');
    expect(out.hookSpecificOutput.additionalContext).toContain(workspace);
    const first = JSON.parse(readFileSync(join(state, 'service.json'), 'utf8'));
    expect(out.hookSpecificOutput.additionalContext).not.toContain(first.token);
    expect(readFileSync(join(state, 'projects.json'), 'utf8')).not.toContain(
      'secret not persisted',
    );
    const stop = spawnSync(process.execPath, [cli, 'stop', 'serve'], { env, encoding: 'utf8' });
    expect(stop.status).toBe(0);
    expect(callback().status).toBe(0);
    expect(JSON.parse(readFileSync(join(state, 'service.json'), 'utf8')).instance).not.toBe(
      first.instance,
    );
    const missing = spawnSync(process.execPath, [hook, '--event', 'SessionStart'], {
      input: '{}',
      env,
      encoding: 'utf8',
    });
    expect(JSON.parse(missing.stdout).systemMessage).toContain('workspace is missing');
  } finally {
    spawnSync(process.execPath, [cli, 'stop', 'serve'], { env });
    rmSync(root, { recursive: true, force: true });
  }
}, 30000);
const fixtureReport = (packs: Record<string, unknown>[]) => ({
  format: 'context/1',
  workspace: '/w',
  wiki: { root: '/w/wiki', available: true, freshness: 'fresh', limit: 'fixture limit' },
  specs: { root: '/w/specs', packs, selectionRequired: true },
  guidance: { newSpec: 'fixture new spec', continueSpec: 'fixture continue spec' },
});
const connection = { service: { url: 'http://127.0.0.1:1/' }, project: { id: 'p1' } };
const reason = 'Approve the answered spec questions before planning continues';
const pack = (name: string, stage = 'planning', reasons = [reason, reason, reason, reason]) => ({
  name,
  stage,
  workflow: { phase: 'spec', reasons },
  doing: [],
  candidate: { id: 'T-1', admitted: false },
  openQuestions: ['Q-1'],
  evidence: [{ task: 'T-1', note: 'x'.repeat(2000) }],
  feedback: { sessions: 1, unresolved: 2 },
});
it('keeps 40 open packs inside the budget with guidance first and an explicit omitted count', async () => {
  const { compactBlock, CONTEXT_BUDGET } = await import(hook);
  const packs = Array.from({ length: 40 }, (_, i) => pack(`pack-${String(i).padStart(2, '0')}`));
  const block: string = compactBlock(fixtureReport(packs), connection);
  expect(CONTEXT_BUDGET).toBeLessThan(10000);
  expect(block.length).toBeLessThanOrEqual(CONTEXT_BUDGET);
  const lines = block.split('\n');
  const firstPack = lines.findIndex((line) => line.startsWith('pack-'));
  expect(lines.indexOf('fixture continue spec')).toBeLessThan(firstPack);
  expect(lines).toContain('More than one spec is open. Ask which spec to continue; never guess.');
  const listed = lines.filter((line) => line.startsWith('pack-')).length;
  expect(listed).toBeGreaterThan(10);
  expect(lines.at(-1)).toBe(
    `${40 - listed} more open spec(s) omitted; run do where /w --json for the full list.`,
  );
  expect(block).toContain('feedback (counts/IDs only) {"sessions":1,"unresolved":2}');
  expect(block.split(reason).length - 1).toBe(listed * 3);
  expect(block).not.toContain('x'.repeat(100));
});
it('lists open packs only and counts delivered and refused packs', async () => {
  const { compactBlock } = await import(hook);
  const block: string = compactBlock(
    fixtureReport([
      pack('open-one', 'planning', ['Q-1']),
      pack('done-one', 'delivered'),
      { name: 'bad-one', stage: 'refused', error: 'Missing spec JSON' },
    ]),
    connection,
  );
  expect(block).toContain('open-one: planning | gate spec (Q-1) | candidate T-1 (not admitted)');
  expect(block).not.toContain('done-one:');
  expect(block).toContain('Open specs: 1; delivered or closed: 1; refused: 1 (bad-one)');
  expect(block).not.toContain('omitted');
});
it('keeps whole lines and the omitted note when hundreds of refused packs crowd the head', async () => {
  const { compactBlock, CONTEXT_BUDGET } = await import(hook);
  const refused = Array.from({ length: 400 }, (_, i) => ({
    name: `refused-pack-with-a-rather-long-name-${i}`,
    stage: 'refused',
    error: 'Missing spec JSON',
  }));
  const open = Array.from({ length: 40 }, (_, i) => pack(`open-${i}`));
  const block: string = compactBlock(fixtureReport([...refused, ...open]), connection);
  expect(block.length).toBeLessThanOrEqual(CONTEXT_BUDGET);
  expect(block).toContain('refused: 400 (');
  expect(block).toContain(', +390 more)');
  expect(block).not.toContain('refused-pack-with-a-rather-long-name-10');
  expect(block.split('\n').at(-1)).toMatch(/^\d+ more open spec\(s\) omitted; run do where/);
});
it('reserves the omitted note against the head and keeps extra head lines in budget', async () => {
  const { compactBlock } = await import(hook);
  const open = Array.from({ length: 10 }, (_, i) => pack(`open-${i}`));
  const block: string = compactBlock(fixtureReport(open), connection, 1200, ['HOST RULE']);
  expect(block.length).toBeLessThanOrEqual(1200);
  const lines = block.split('\n');
  expect(lines.indexOf('HOST RULE')).toBeLessThan(lines.findIndex((l) => l.startsWith('open-')));
  expect(lines.at(-1)).toMatch(/^\d+ more open spec\(s\) omitted/);
});
it('caps a pack line on a code-point boundary', async () => {
  const { packLine, packSummary } = await import(hook);
  const wide = { ...pack('emoji'), workflow: { phase: 'spec', reasons: ['😀'.repeat(800)] } };
  const line: string = packLine(wide);
  expect(Array.from(line)).toHaveLength(700);
  expect(line).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
  expect(packSummary(wide).length).toBeGreaterThan(line.length);
});
it('bounds malformed input and unavailable runtime with actionable status', () => {
  const out = spawnSync(process.execPath, [hook, '--event', 'SessionStart'], {
    input: '{',
    env: { ...process.env, HARNESS_RUNTIME_ENTRY: '/missing/runtime' },
    encoding: 'utf8',
  });
  expect(out.status).toBe(0);
  expect(JSON.parse(out.stdout).systemMessage).toContain('workspace is missing');
});
