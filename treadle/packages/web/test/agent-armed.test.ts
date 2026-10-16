import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { savePack, writeArmed, clearArmed, isArmed, type PackDoc } from '@treadle/core';
import { startLibrary } from '../src/servers.js';

const at = '2026-10-10T21:57:36Z';
const roots: string[] = [];
let state: string;

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'web-armed-'));
  roots.push(root);
  const dir = join(root, 'p');
  mkdirSync(dir);
  const doc: PackDoc = {
    format: 'specpack/0.4',
    name: 'p',
    status: 'active',
    revision: 1,
    artifacts: {},
    spec: { requirements: [], clarifications: [] },
    plan: { decisions: [{ id: 'D-1', decision: 'Wait', status: 'proposed' }] },
    tasks: [],
    workflow: {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  savePack(doc, join(dir, 'p.json'), { at });
  return { root, dir };
}
async function armedFlag(url: string): Promise<unknown> {
  const out = (await (await fetch(url + 'specs')).json()) as { specs: { armed?: boolean }[] };
  return out.specs[0]?.armed;
}

beforeEach(() => {
  state = mkdtempSync(join(tmpdir(), 'armed-state-'));
  roots.push(state);
  process.env['HARNESS_ARMED_STATE_DIR'] = state;
});
afterEach(() => {
  delete process.env['HARNESS_ARMED_STATE_DIR'];
  for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true });
});

describe('agent-listening indicator', () => {
  it('reports armed from the machine-local heartbeat and never changes pack bytes', async () => {
    const f = fixture();
    const before = readFileSync(join(f.dir, 'p.json'), 'utf8');
    const files = readdirSync(f.dir).sort();
    const lib = await startLibrary(f.root);
    try {
      expect(await armedFlag(lib.url)).toBe(false);
      writeArmed(f.dir, 300);
      expect(await armedFlag(lib.url)).toBe(true);
      clearArmed(f.dir);
      expect(await armedFlag(lib.url)).toBe(false);
      expect(readFileSync(join(f.dir, 'p.json'), 'utf8')).toBe(before);
      expect(readdirSync(f.dir).sort()).toEqual(files);
    } finally {
      await lib.close();
    }
  });
  it('treats a stale heartbeat as not armed', () => {
    const f = fixture();
    writeArmed(f.dir, 300);
    expect(isArmed(f.dir, 15_000, Date.now())).toBe(true);
    expect(isArmed(f.dir, 15_000, Date.now() + 60_000)).toBe(false);
  });
});
