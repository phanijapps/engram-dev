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
