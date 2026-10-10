/**
 * The room's page contract, absorbed from the python suite (test_web_page.py)
 * — the seam that bit us: page↔server route parity and the vocabulary the
 * render actually evaluates. Structural where python was structural, but
 * anchored to member expressions (the spec-web hardening), plus the route
 * contract the python suite never had.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { startRoom, startLibrary } from '../src/servers.js';
import { CANONICAL_ORDER, DELIVERABLE_STAGES, EVENT_KINDS } from '@treadle/core';
import { brand } from '@treadle/brand';

const WEB = join(__dirname, '..', 'src');
const PAGE_HTML = readFileSync(join(WEB, 'page.html'), 'utf8');
const PAGE_JS = readFileSync(join(WEB, 'page.js'), 'utf8');
const LIB_HTML = readFileSync(join(WEB, 'library.html'), 'utf8');
const LIB_JS = readFileSync(join(WEB, 'library.js'), 'utf8');

function arrayAfter(name: string, src: string): string[] {
  const m = new RegExp(`${name}\\s*=\\s*\\[([^\\]]*)\\]`).exec(src);
  expect(m, `${name} array not found`).toBeTruthy();
  return (m![1] ?? '')
    .split(',')
    .map((x) => x.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

describe('the room page contract (absorbed)', () => {
  it('renders the dossier in canonical order', () => {
    expect(arrayAfter('SECTIONS', PAGE_JS)).toEqual([...CANONICAL_ORDER]);
  });

  it('speaks the event vocabulary exactly', () => {
    expect(arrayAfter('KINDS', PAGE_JS)).toEqual([...EVENT_KINDS]);
  });

  it('rings the engine stages exactly', () => {
    expect(arrayAfter('STAGES', PAGE_JS)).toEqual([...DELIVERABLE_STAGES]);
  });

  it('never binds the engine (portability contract)', () => {
    for (const asset of [PAGE_HTML, PAGE_JS, LIB_HTML, LIB_JS]) {
      expect(asset.toLowerCase()).not.toContain('loom');
      expect(asset.toLowerCase()).not.toContain(brand.name);
    }
  });

  it('hits the adapter endpoints', () => {
    expect(PAGE_JS).toContain('/spec');
    expect(PAGE_JS).toContain('/event');
    expect(LIB_JS).toContain('/specs');
    expect(LIB_JS).toContain('/event/');
  });

  it('uses the owner injection seam, never a hardcoded person', () => {
    expect(PAGE_JS).toContain('INTERVIEW_CONFIG');
  });

  it('consumes the emitted layout keys (member expressions, not string mentions)', () => {
    for (const expr of [
      'S.date.approved',
      'S.status',
      'S.metadata',
      'S.spec.clarifications',
      'S.revision',
    ]) {
      expect(PAGE_JS, expr).toContain(expr);
    }
    expect(PAGE_JS).toContain('S.design');
    expect(PAGE_JS).toContain('S.tasks');
    expect(PAGE_JS).toContain('S.review');
  });

  it('consumes the question vocabulary with the preselected default', () => {
    for (const field of ['q.kind', 'q.options', 'q.unknown', 'q.answered_by', 'q.default']) {
      expect(PAGE_JS, field).toContain(field);
    }
    expect(PAGE_JS).toContain('indexOf(q.default)');
  });
});

describe('the route contract (the wound, closed)', () => {
  it('the room page loads its script where the page says it lives', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'route-'));
    const d = join(tmp, 'p');
    mkdirSync(d);
    writeFileSync(
      join(d, 'p.json'),
      JSON.stringify({
        format: 'specpack/0.3',
        name: 'p',
        revision: 1,
        title: 't',
        spec: {
          why: 'w',
          requirements: [],
          clarifications: [{ id: 'Q-1', question: 'q', status: 'open', owner: 'human:owner' }],
        },
        plan: { decisions: [] },
        tasks: [],
      }),
    );
    const room = await startRoom(d);
    try {
      const html = await (await fetch(room.url)).text();
      const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
      expect(srcs.length).toBeGreaterThan(0);
      for (const src of srcs) {
        const r = await fetch(new URL(src, room.url));
        expect(r.status, `room asset ${src}`).toBe(200);
      }
      // the page contract by name: /page.js is where the room's brain lives
      expect(srcs).toContain('/page.js');
    } finally {
      await room.close();
    }
  });

  it('the library page loads every asset it references', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'libroute-'));
    mkdirSync(join(tmp, 'specs'));
    const lib = await startLibrary(join(tmp, 'specs'));
    try {
      const html = await (await fetch(lib.url)).text();
      const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
      expect(srcs.length).toBeGreaterThanOrEqual(2);
      for (const src of srcs) {
        const r = await fetch(new URL(src, lib.url));
        expect(r.status, `library asset ${src}`).toBe(200);
      }
    } finally {
      await lib.close();
    }
  });
});
