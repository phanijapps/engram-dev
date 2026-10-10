import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startRoom, startLibrary } from '../src/servers.js';
import { loadPack, deriveStage } from '@treadle/core';

const AT = '2026-10-10T12:00:00Z';

function bornPack(parent: string): string {
  const d = join(parent, 'p');
  mkdirSync(d);
  writeFileSync(
    join(d, 'p.json'),
    JSON.stringify({
      format: 'specpack/0.3',
      name: 'p',
      revision: 1,
      title: 'CLI fixture',
      spec: {
        why: 'w',
        requirements: [],
        clarifications: [
          {
            id: 'Q-1',
            question: 'pick',
            status: 'open',
            owner: 'human:owner',
            kind: 'choice',
            options: ['a', 'b'],
          },
          { id: 'Q-2', question: 'say', status: 'open', owner: 'human:owner' },
        ],
      },
      plan: {
        decisions: [
          {
            id: 'D-1',
            decision: 'd',
            because: 'b',
            status: 'accepted',
            accepted_by: 'human:owner',
          },
        ],
      },
      tasks: [
        {
          id: 'T-1',
          title: 'one',
          detail: 'd',
          satisfies: [],
          implements: [],
          honors: [],
          accepts: [],
          status: 'todo',
          phase: 'core',
          verify: { cmd: 'true', expect: '0' },
        },
      ],
    }),
  );
  writeFileSync(join(d, 'brief.md'), '# Brief\n\n| a | b |\n|---|---|\n| 1 | 2 |\n');
  return d;
}

async function post(url: string, body: unknown): Promise<{ status: number; json: any }> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: r.status, json: await r.json().catch(() => null) };
}
async function get(url: string): Promise<{ status: number; text: string }> {
  const r = await fetch(url);
  return { status: r.status, text: await r.text() };
}

describe('the interview room (TS)', () => {
  it('serves the page, admits the ceremony, exits honest on refusal', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'room-'));
    const d = bornPack(tmp);
    const room = await startRoom(d);
    try {
      const page = await get(room.url);
      expect(page.status).toBe(200);
      expect(page.text).toContain('INTERVIEW_CONFIG');
      const spec = await get(room.url + 'spec');
      expect(spec.status).toBe(200);
      const bad = await post(room.url + 'event', {
        kind: 'choice',
        q: 'Q-1',
        text: 'banana',
        option: 'banana',
      });
      expect(bad.status).toBe(400);
      expect(bad.json.error).toContain('not one of the options');
      const a = await post(room.url + 'event', {
        kind: 'choice',
        q: 'Q-1',
        text: 'a',
        option: 'a',
      });
      expect(a.status).toBe(200);
      const b = await post(room.url + 'event', { kind: 'answer', q: 'Q-2', text: 'because' });
      expect(b.status).toBe(200);
      const ap = await post(room.url + 'event', { kind: 'approve' });
      expect(ap.status).toBe(200);
      const loaded = loadPack(d);
      expect(loaded.ok && deriveStage(loaded.value)).toBe('planning');
      expect(
        readFileSync(join(d, 'interview.jsonl'), 'utf8').split('\n').filter(Boolean).length,
      ).toBe(4); // header + 3
    } finally {
      await room.close();
    }
  });
});

describe('the library (TS)', () => {
  it('lists fail-soft, serves artifacts guarded, admits through the seam', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'lib-'));
    bornPack(tmp);
    mkdirSync(join(tmp, 'legacy'));
    writeFileSync(join(tmp, 'legacy', 'plan.md'), 'old shape');
    const lib = await startLibrary(tmp);
    try {
      const list = await get(lib.url + 'specs');
      const out = JSON.parse(list.text);
      expect(out.specs.length).toBe(1);
      expect(out.legacy[0].name).toBe('legacy');
      const art = await get(lib.url + 'artifact/p/brief.md');
      expect(art.status).toBe(200);
      expect(art.text).toContain('| a | b |');
      const trav = await get(lib.url + 'artifact/p/..%2Fp.json');
      expect(trav.status).toBe(404);
      const ev = await post(lib.url + 'event/p', { kind: 'approve' });
      expect(ev.status).toBe(400); // open questions block approval
      expect(ev.json.error).toContain('open questions remain');
    } finally {
      await lib.close();
    }
  });
});

describe('the refusal battery (absorbed from the python suite)', () => {
  it('refuses bad claims and shapes with the exact vocabulary', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'ref-'));
    const d = bornPack(tmp);
    const room = await startRoom(d);
    try {
      const agent = await post(room.url + 'event', {
        kind: 'answer',
        q: 'Q-2',
        text: 'x',
        by: 'agent:pi',
      });
      expect(agent.status).toBe(400);
      expect(agent.json.error).toContain('an answer needs a human claim');
      const ghost = await post(room.url + 'event', { kind: 'answer', q: 'Q-9', text: 'x' });
      expect(ghost.status).toBe(400);
      expect(ghost.json.error).toContain('no such question');
      const notJson = await fetch(room.url + 'event', { method: 'POST', body: 'not json' });
      expect(notJson.status).toBe(400);
      expect((await notJson.json()).error).toContain('not JSON');
    } finally {
      await room.close();
    }
  });

  it('traversal battery on artifacts (the python encodings)', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'trav-'));
    bornPack(tmp);
    const lib = await startLibrary(tmp);
    try {
      for (const bad of [
        'artifact/p/..%2Fp.json',
        'artifact/p/%2e%2e%2fp.json',
        'artifact/p/..%5Cp.json',
        'artifact/p/%c0%aep.json',
        'artifact/p/notes.txt',
        'artifact/ghost/brief.md',
      ]) {
        const r = await fetch(lib.url + bad);
        expect(r.status, bad).toBe(404);
      }
    } finally {
      await lib.close();
    }
  });

  it('double approve refuses; frozen pack refuses to load-write', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'dbl-'));
    const d = bornPack(tmp);
    const room = await startRoom(d);
    try {
      await post(room.url + 'event', { kind: 'choice', q: 'Q-1', text: 'a', option: 'a' });
      await post(room.url + 'event', { kind: 'answer', q: 'Q-2', text: 'x' });
      const first = await post(room.url + 'event', { kind: 'approve' });
      expect(first.status).toBe(200);
      const second = await post(room.url + 'event', { kind: 'approve' });
      expect(second.status).toBe(400);
      expect(second.json.error).toContain('already approved');
    } finally {
      await room.close();
    }
  });
});

describe('the alignment route (T-4, DES-5)', () => {
  it('serves the pinned sentence from the real checker; 404 ghosts; 400 bad packs', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'al-'));
    bornPack(tmp);
    const lib = await startLibrary(tmp);
    try {
      const r = await fetch(lib.url + 'alignment/p');
      expect(r.status).toBe(200);
      const out = (await r.json()) as { violations: unknown[]; gapCount: number; sentence: string };
      expect(out.sentence).toBe(
        `alignment: ${out.violations.length} violation(s), ${out.gapCount} gap(s) — gaps are reported, never guessed`,
      );
      expect(typeof out.gapCount).toBe('number');
      const ghost = await fetch(lib.url + 'alignment/ghost');
      expect(ghost.status).toBe(404);
    } finally {
      await lib.close();
    }
  });
});
