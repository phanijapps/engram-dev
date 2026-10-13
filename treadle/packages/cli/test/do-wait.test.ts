import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getEventListeners } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ownerAction,
  savePack,
  loadPackWithMeta,
  ownerCursor,
  encodeCursor,
  writeArmed,
  clearArmed,
  type PackDoc,
} from '@treadle/core';
import { waitForOwnerChange, WAIT_EXIT } from '../src/commands/wait.js';

const at = '2026-10-10T21:57:36Z';
let dir: string;
let json: string;
let state: string;

function seed(): void {
  const artifacts = Object.fromEntries(
    ['brief', 'spec', 'design', 'plan'].map((id) => [
      id,
      { file: id + '.md', sha256: 'a'.repeat(64) },
    ]),
  );
  const doc: PackDoc = {
    name: 'p',
    format: 'specpack/0.4',
    revision: 1,
    status: 'active',
    artifacts,
    spec: { requirements: [{ id: 'FR-1', text: 'x' }], clarifications: [] },
    plan: { decisions: [{ id: 'D-1', decision: 'Wait', status: 'proposed' }] },
    tasks: [
      {
        id: 'T-1',
        title: 'Work',
        status: 'todo',
        requires_decisions: ['D-1'],
        verify: { cmd: 'check', expect: 'exit 0' },
        context: { touch: [] },
      },
    ],
    workflow: {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  savePack(doc, json, { at });
}
function ownerAccepts(): void {
  const l = loadPackWithMeta(dir);
  if (!l.ok) throw new Error('load');
  const out = ownerAction(
    l.value.doc,
    {
      kind: 'accept',
      decision: 'D-1',
      by: 'human:owner',
      at,
      expected_revision: l.value.doc.revision!,
    },
    l.value.path,
  );
  if (!out.ok) throw new Error(out.message);
  savePack(l.value.doc, l.value.path, { at });
}

beforeEach(() => {
  dir = join(mkdtempSync(join(tmpdir(), 'wait-')), 'p');
  mkdirSync(dir);
  json = join(dir, 'p.json');
  state = mkdtempSync(join(tmpdir(), 'armed-'));
  process.env['HARNESS_ARMED_STATE_DIR'] = state;
  seed();
});
afterEach(() => {
  delete process.env['HARNESS_ARMED_STATE_DIR'];
  process.exitCode = 0;
});

describe('do wait', () => {
  it('exits 0 with a minimal event when the owner acts, with no service running', async () => {
    const waiting = waitForOwnerChange(dir, { timeout: 10, pollMs: 50 });
    setTimeout(ownerAccepts, 150);
    const r = await waiting;
    expect(r.code).toBe(WAIT_EXIT.changed);
    expect(r.event).toMatchObject({ pack: 'p', phase: expect.any(String) });
    expect(r.event['new_acts']).toEqual([{ id: expect.any(String), kind: 'accept' }]);
    expect(Object.keys(r.event).sort()).toEqual([
      'answered',
      'cursor',
      'new_acts',
      'pack',
      'phase',
    ]);
  });
  it('exits 10 on timeout and returns a cursor that resumes without duplicate events', async () => {
    const t = await waitForOwnerChange(dir, { timeout: 1, pollMs: 50 });
    expect(t.code).toBe(WAIT_EXIT.timeout);
    ownerAccepts();
    const resumed = await waitForOwnerChange(dir, {
      cursor: String(t.event['cursor']),
      timeout: 5,
      pollMs: 50,
    });
    expect(resumed.code).toBe(WAIT_EXIT.changed);
    const again = await waitForOwnerChange(dir, {
      cursor: String(resumed.event['cursor']),
      timeout: 1,
      pollMs: 50,
    });
    expect(again.code).toBe(WAIT_EXIT.timeout);
  });
  it('ignores an agent-authored revision bump', async () => {
    const waiting = waitForOwnerChange(dir, { timeout: 1, pollMs: 50 });
    setTimeout(() => {
      const l = loadPackWithMeta(dir);
      if (!l.ok) return;
      l.value.doc.revision = (l.value.doc.revision ?? 1) + 1;
      l.value.doc.tasks[0]!['detail'] = 'agent edit';
      savePack(l.value.doc, l.value.path, { at });
    }, 100);
    expect((await waiting).code).toBe(WAIT_EXIT.timeout);
  });
  it('exits 11 when the pack is already delivered', async () => {
    const l = loadPackWithMeta(dir);
    if (!l.ok) throw new Error('load');
    l.value.doc.status = 'complete';
    savePack(l.value.doc, l.value.path, { at });
    expect((await waitForOwnerChange(dir, { timeout: 1 })).code).toBe(WAIT_EXIT.delivered);
  });
  it('exits 1 for a missing pack, bad cursor or out-of-range timeout', async () => {
    expect((await waitForOwnerChange(join(dir, 'missing'), {})).code).toBe(WAIT_EXIT.error);
    expect((await waitForOwnerChange(dir, { cursor: 'junk' })).code).toBe(WAIT_EXIT.error);
    expect((await waitForOwnerChange(dir, { timeout: 0 })).code).toBe(WAIT_EXIT.error);
    expect((await waitForOwnerChange(dir, { timeout: 601 })).code).toBe(WAIT_EXIT.error);
  });
  it('writes the heartbeat outside the pack and clears it on exit', async () => {
    const before = readdirSync(dir).sort();
    await waitForOwnerChange(dir, { timeout: 1, pollMs: 50 });
    expect(readdirSync(dir).sort()).toEqual(before);
    expect(readdirSync(state)).toEqual([]);
  });
  it('delivers an owner act made before arming when given the earlier cursor', async () => {
    const l = loadPackWithMeta(dir);
    if (!l.ok) throw new Error('load');
    const cursor = encodeCursor(ownerCursor(l.value.doc, l.value.path));
    ownerAccepts();
    const r = await waitForOwnerChange(dir, { cursor, timeout: 2, pollMs: 50 });
    expect(r.code).toBe(WAIT_EXIT.changed);
  });
  it('exits 1 after repeated load failures instead of reporting a timeout', async () => {
    const waiting = waitForOwnerChange(dir, { timeout: 5, pollMs: 20 });
    setTimeout(() => writeFileSync(json, '{ not json'), 60);
    expect((await waiting).code).toBe(WAIT_EXIT.error);
  });
  it('keeps a heartbeat while waiting and leaves pack bytes unchanged', async () => {
    const hash = () => createHash('sha256').update(readFileSync(json)).digest('hex');
    const before = hash();
    const waiting = waitForOwnerChange(dir, { timeout: 1, pollMs: 50 });
    await new Promise((r) => setTimeout(r, 120));
    expect(readdirSync(state).length).toBe(1);
    await waiting;
    expect(hash()).toBe(before);
  });
  it('survives an unwritable heartbeat directory and clears only its own heartbeat', async () => {
    process.env['HARNESS_ARMED_STATE_DIR'] = join(json, 'nope');
    expect((await waitForOwnerChange(dir, { timeout: 1, pollMs: 50 })).code).toBe(
      WAIT_EXIT.timeout,
    );
    process.env['HARNESS_ARMED_STATE_DIR'] = state;
    writeArmed(dir, 5);
    const f = join(state, readdirSync(state)[0]!);
    writeFileSync(f, JSON.stringify({ pid: process.pid + 1, at: Date.now(), timeout: 5 }));
    clearArmed(dir);
    expect(readdirSync(state).length).toBe(1);
    rmSync(f);
  });
  it('reports an interrupt as interrupted, not a timeout', async () => {
    const ac = new AbortController();
    setTimeout(() => ac.abort(), 50);
    const r = await waitForOwnerChange(dir, { timeout: 30, pollMs: 5000, signal: ac.signal });
    expect(r.event['interrupted']).toBe(true);
  });
  it('does not accumulate abort listeners across polls', async () => {
    const ac = new AbortController();
    await waitForOwnerChange(dir, { timeout: 1, pollMs: 20, signal: ac.signal });
    expect(getEventListeners(ac.signal, 'abort').length).toBe(0);
  });
});
