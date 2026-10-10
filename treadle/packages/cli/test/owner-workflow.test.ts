import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '../src/main.js';
import { loadPackWithMeta, savePack, withPackLock, planDigest, type PackDoc } from '@treadle/core';
const at = '2026-10-10T21:57:36Z';
const dirs: string[] = [];
afterEach(() => {
  process.exitCode = 0;
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});
function directory() {
  const root = mkdtempSync(join(tmpdir(), 'cli-owner-'));
  dirs.push(root);
  const d = join(root, 'p');
  mkdirSync(d);
  return d;
}
function run(args: string[]) {
  process.exitCode = 0;
  runCli(['node', 'bin', 'do', ...args]);
  return process.exitCode ?? 0;
}
function loaded(d: string) {
  const l = loadPackWithMeta(d);
  if (!l.ok) throw Error(l.message);
  return l.value;
}
function ready(d: string) {
  const l = loaded(d);
  l.doc.artifacts = {};
  for (const id of ['brief', 'spec', 'design', 'plan']) {
    writeFileSync(join(d, id + '.md'), 'Approved plan');
    l.doc.artifacts[id] = { file: id + '.md' };
  }
  l.doc.plan.decisions = [{ id: 'D-1', decision: 'Approve', status: 'proposed' }];
  l.doc.tasks = [
    {
      id: 'T-1',
      title: 'Work',
      status: 'todo',
      verify: { cmd: 'true', expect: 'exit 0' },
      requires_decisions: ['D-1'],
      context: { touch: [] },
    },
  ];
  savePack(l.doc, l.path, { at });
}
describe('owner workflow CLI', () => {
  it('uses explicit gated birth and separate revision-checked decision/start actions', () => {
    const d = directory();
    expect(run(['init', d, '--owner-gated', '--title', 'Owner', '--why', 'Consent'])).toBe(0);
    expect(loaded(d).doc.format).toBe('specpack/0.4');
    ready(d);
    const before = readFileSync(join(d, 'p.json'), 'utf8');
    expect(run(['start', d, '--by', 'human:owner', '--expected-revision', '1'])).toBe(1);
    expect(readFileSync(join(d, 'p.json'), 'utf8')).toBe(before);
    expect(
      run(['accept', d, '--decision', 'D-1', '--by', 'human:owner', '--expected-revision', '1']),
    ).toBe(0);
    expect(run(['start', d, '--by', 'human:owner', '--expected-revision', '1'])).toBe(1);
    expect(run(['start', d, '--by', 'human:owner', '--expected-revision', '2', '--at', at])).toBe(
      0,
    );
    expect(loaded(d).doc.workflow?.start_receipt?.at).toBe(at);
    expect(run(['next', d, '--expected-revision', '3'])).toBe(0);
    expect(loaded(d).doc.tasks[0]!.status).toBe('doing');
  });
  it('rejects stale answers and approvals in legacy packs too', () => {
    const d = directory();
    run(['init', d, '--title', 'Legacy', '--why', 'Consent']);
    run(['add', 'question', d, '--id', 'Q-1', '--question', 'Choose']);
    const before = readFileSync(join(d, 'p.json'), 'utf8');
    expect(
      run([
        'answer',
        d,
        '--q',
        'Q-1',
        '--text',
        'Yes',
        '--by',
        'human:owner',
        '--expected-revision',
        '1',
      ]),
    ).toBe(1);
    expect(readFileSync(join(d, 'p.json'), 'utf8')).toBe(before);
    expect(run(['approve', d, '--by', 'human:owner', '--expected-revision', '1'])).toBe(1);
    expect(readFileSync(join(d, 'p.json'), 'utf8')).toBe(before);
  });
  it('explicitly adopts active legacy bytes without inventing earlier start consent', () => {
    const d = directory();
    run(['init', d, '--title', 'Legacy', '--why', 'Consent']);
    const original = readFileSync(join(d, 'p.json'), 'utf8');
    expect(run(['adopt', d, '--by', 'human:owner', '--expected-revision', '1'])).toBe(0);
    expect(readFileSync(join(d, 'legacy-revision-1.json'), 'utf8')).toBe(original);
    expect(loaded(d).doc.workflow?.start_receipt).toBeUndefined();
    expect(loaded(d).doc.workflow?.acts[0]?.kind).toBe('adopt');
  });
  it('preserves actual bootstrap start dates and refuses changed reviewed scope', () => {
    const d = directory();
    run(['init', d, '--title', 'Legacy', '--why', 'Consent']);
    ready(d);
    const l = loaded(d);
    l.doc.plan.decisions![0]!.status = 'accepted';
    l.doc.plan.decisions![0]!.accepted_by = 'human:owner';
    l.doc.spec.clarifications = [
      {
        id: 'Q-6',
        question: 'Start Plan 1?',
        status: 'resolved',
        answer: 'Yes, start Plan 1',
        answered_by: 'human:owner',
        answered_at: at,
      },
    ];
    const clone = structuredClone(l.doc);
    clone.workflow = {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    };
    const hash = planDigest(clone, l.path);
    if (!hash.ok) throw Error(hash.message);
    l.doc.spec.clarifications[0]!['notes'] = 'Permission to start scope ' + hash.value;
    savePack(l.doc, l.path, { at });
    const receipt = join(d, 'bootstrap.json');
    writeFileSync(
      receipt,
      JSON.stringify({
        format: 'owner-bootstrap/0.1',
        plan: 1,
        plan_digest: hash.value,
        start: { question: 'Q-6', by: 'human:owner', at, answer: 'Yes, start Plan 1' },
      }),
    );
    const before = readFileSync(l.path, 'utf8');
    writeFileSync(join(d, 'plan.md'), 'Changed plan');
    expect(
      run(['adopt', d, '--by', 'human:owner', '--expected-revision', '1', '--bootstrap', receipt]),
    ).toBe(1);
    expect(readFileSync(l.path, 'utf8')).toBe(before);
    writeFileSync(join(d, 'plan.md'), 'Approved plan');
    expect(
      run(['adopt', d, '--by', 'human:owner', '--expected-revision', '1', '--bootstrap', receipt]),
    ).toBe(0);
    expect(loaded(d).doc.workflow!.start_receipt).toEqual({
      by: 'human:owner',
      at,
      plan_digest: hash.value,
    });
  });

  it('refuses closed adoption and agent adoption without touching records', () => {
    const d = directory();
    run(['init', d, '--title', 'Legacy', '--why', 'Consent']);
    const l = loaded(d);
    l.doc.status = 'complete';
    savePack(l.doc, l.path, { at });
    const original = readFileSync(l.path, 'utf8');
    expect(run(['adopt', d, '--by', 'human:owner', '--expected-revision', '1'])).toBe(1);
    expect(readFileSync(l.path, 'utf8')).toBe(original);
    expect(run(['adopt', d, '--by', 'agent:x', '--expected-revision', '1'])).toBe(1);
  });
  it('uses the same exclusive lock for CLI mutations', () => {
    const d = directory();
    run(['init', d, '--title', 'Legacy', '--why', 'Consent']);
    const before = readFileSync(join(d, 'p.json'), 'utf8');
    const result = withPackLock(d, () =>
      run(['adopt', d, '--by', 'human:owner', '--expected-revision', '1']),
    );
    expect(result.ok && result.value).toBe(1);
    expect(readFileSync(join(d, 'p.json'), 'utf8')).toBe(before);
  });
  it('does not import a fabricated bootstrap authorization', () => {
    const d = directory();
    run(['init', d, '--title', 'Legacy', '--why', 'Consent']);
    const original = readFileSync(join(d, 'p.json'), 'utf8');
    writeFileSync(
      join(d, 'fake.json'),
      JSON.stringify({
        plan_digest: 'a'.repeat(64),
        start: { question: 'Q-6', by: 'human:owner', at, answer: 'Yes, start' },
      }),
    );
    expect(
      run([
        'adopt',
        d,
        '--by',
        'human:owner',
        '--expected-revision',
        '1',
        '--bootstrap',
        join(d, 'fake.json'),
      ]),
    ).toBe(1);
    expect(readFileSync(join(d, 'p.json'), 'utf8')).toBe(original);
  });
});
