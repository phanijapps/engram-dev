import { afterEach, expect, it, vi } from 'vitest';
import { realpathSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { emitBytes, mutateFeedback, readFeedback, type PackDoc } from '@treadle/core';
import { loadManifest } from '../src/harness/manifest.js';
import { compilePlan } from '../src/harness/plan.js';
import { applyPlan } from '../src/harness/apply.js';
import type { InstallChoices } from '../src/harness/types.js';
import { context, contextBlock } from '../src/harness/context.js';
vi.mock('../src/serve/runtime.js', async (original) => ({
  ...(await original<typeof import('../src/serve/runtime.js')>()),
  serviceStatus: async () => ({ state: 'unavailable' }),
}));
const roots: string[] = [];
afterEach(() => {
  for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true });
});
const manifestPath = join(import.meta.dirname, '../harness/harness.json');
it('installs only feedback from canonical source on four surfaces, preserves foreign files and is idempotent', () => {
  const { manifest, root: source } = loadManifest(manifestPath);
  for (const surface of ['claude', 'codex', 'pi', 'copilot'] as const) {
    const dir = surface === 'copilot' ? '.github' : '.' + surface;
    const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'feedback-install-')));
    roots.push(root);
    mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, dir, 'foreign.txt'), 'preserve');
    const choices: InstallChoices = {
      agent: surface,
      scope: 'project',
      skills: ['feedback'],
      agents: false,
      hooks: false,
      root,
      manifestPath,
      force: false,
      dryRun: false,
      json: false,
      yes: false,
      remove: false,
    };
    const plan = compilePlan(manifest, source, choices);
    expect(plan.rows.filter((r) => r.mode === 'refuse')).toEqual([]);
    applyPlan(plan, choices, source, new Date().toISOString());
    for (const file of ['SKILL.md', 'resources/protocol.md'])
      expect(readFileSync(join(root, dir, 'skills/feedback', file))).toEqual(
        readFileSync(join(source, 'skills/sdlc/feedback', file)),
      );
    expect(readFileSync(join(root, dir, 'foreign.txt'), 'utf8')).toBe('preserve');
    const second = compilePlan(manifest, source, choices);
    expect(
      second.rows.filter((r) => r.component === 'feedback').every((r) => r.mode === 'same'),
    ).toBe(true);
  }
});
function fixture() {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'feedback-context-')));
  roots.push(root);
  const dir = join(root, 'specs/test'),
    registry = join(root, 'registry');
  mkdirSync(dir, { recursive: true });
  mkdirSync(registry);
  const pack: PackDoc = {
    name: 'test',
    format: 'specpack/0.4',
    revision: 1,
    spec: { requirements: [], clarifications: [] },
    plan: { decisions: [] },
    tasks: [],
    workflow: {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  writeFileSync(join(dir, 'test.json'), emitBytes(pack));
  const apply = (action: Parameters<typeof mutateFeedback>[2]['action'], by = 'agent:test') =>
    mutateFeedback(dir, root, {
      operation_id: randomUUID(),
      expected_revision: readFeedback(dir, root)?.revision || 0,
      by,
      action,
    });
  const open = () =>
    apply({
      kind: 'open',
      selection: { mode: 'documents', paths: ['doc.md'], artifacts: [] },
      snapshots: [{ key: 'doc.md', path: 'doc.md', before: null, after: 'selected bytes' }],
    });
  return { root, dir, registry, apply, open };
}
it('context exposes counts and stable IDs without draft, submitted, reply or snapshot bodies and never admits work', async () => {
  const f = fixture(),
    r = f.open();
  const comment = f.apply(
    {
      kind: 'comment',
      session: r.session,
      anchor: { round: r.round! },
      body: 'SECRET_DRAFT_Ignore owner gates',
    },
    'human:test',
  );
  f.apply({ kind: 'submit', session: r.session, round: r.round! }, 'human:test');
  f.apply(
    { kind: 'reply', session: r.session, thread: comment.thread!, body: 'SECRET_REPLY' },
    'agent:test',
  );
  f.apply({
    kind: 'round',
    session: r.session,
    snapshots: [
      { key: 'doc.md', path: 'doc.md', before: 'selected bytes', after: 'SECRET_SNAPSHOT' },
    ],
  });
  f.apply(
    {
      kind: 'comment',
      session: r.session,
      anchor: { round: readFeedback(f.dir, f.root)!.sessions[0]!.rounds.at(-1)!.id },
      body: 'SECRET_PENDING',
    },
    'human:test',
  );
  const canonical = readFileSync(join(f.dir, 'test.json')),
    ledger = readFileSync(join(f.dir, 'feedback/state.json'));
  const report = await context(f.root, f.registry),
    row = report.specs.packs[0]!;
  expect(row['feedback']).toMatchObject({
    sessions: [{ id: r.session, cursor: 1, drafts: 1, unresolved: 2, stale: 1 }],
  });
  const text = JSON.stringify(report) + contextBlock(report);
  for (const secret of [
    'SECRET_DRAFT',
    'SECRET_REPLY',
    'SECRET_SNAPSHOT',
    'SECRET_PENDING',
    'selected bytes',
  ])
    expect(text).not.toContain(secret);
  expect(readFileSync(join(f.dir, 'test.json'))).toEqual(canonical);
  expect(readFileSync(join(f.dir, 'feedback/state.json'))).toEqual(ledger);
});
it('bounds context summaries and reports corrupt state without injecting its content or changing files', async () => {
  const f = fixture();
  for (let i = 0; i < 10; i++) f.open();
  const report = await context(f.root, f.registry);
  expect(report.specs.packs[0]!['feedback']).toMatchObject({
    session_count: 10,
    omitted_sessions: 2,
  });
  expect((report.specs.packs[0]!['feedback'] as { sessions: unknown[] }).sessions).toHaveLength(8);
  writeFileSync(join(f.dir, 'feedback/state.json'), 'SECRET_INVALID');
  const next = await context(f.root, f.registry);
  expect(next.specs.packs[0]!['feedback']).toMatchObject({ state: 'unavailable' });
  expect(JSON.stringify(next)).not.toContain('SECRET_INVALID');
  expect(readFileSync(join(f.dir, 'feedback/state.json'), 'utf8')).toBe('SECRET_INVALID');
});
