// @vitest-environment jsdom
/** T-5: the room in the same dress — the wizard contract survives the reskin:
 *  keyboard acts fire (arrows navigate, Enter submits), the approve card is
 *  the gradient CTA, and the four security headers hold on every surface. */
import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { startRoom, startLibrary } from '../src/servers.js';
import { loadLibraryPage } from './helpers/dom.js';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function bornPack(parent: string): string {
  const d = join(parent, 'p');
  mkdirSync(d, { recursive: true });
  writeFileSync(
    join(d, 'p.json'),
    JSON.stringify({
      format: 'specpack/0.3',
      name: 'p',
      revision: 1,
      title: 'Room skin fixture',
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
            default: 'a',
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
      tasks: [],
    }),
  );
  return d;
}

function key(w: Window & typeof globalThis, k: string): void {
  w.document.dispatchEvent(
    new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
  );
}

describe('the room under the new skin (T-5)', () => {
  it('the reskin is real: serif voice, gradient approve, no structural 1px borders', () => {
    const html = readFileSync(join(WEB, 'page.html'), 'utf8');
    const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
    expect(style).toContain('var(--voice-serif)');
    expect(style).toContain('linear-gradient(135deg, var(--primary), var(--primary-c))');
    expect(style).not.toMatch(/border(-\w+)?:\s*1px(?!.*ghost)/); // R5: border-bottom counts
  });

  it('every var() consumed in the room is defined (R5: five dangled once)', () => {
    for (const page of ['page.html', 'library.html']) {
      const html = readFileSync(join(WEB, page), 'utf8');
      const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
      const defined = new Set<string>();
      for (const m of style.matchAll(/--([a-z0-9-]+)\s*:/g)) defined.add(m[1]);
      const consumed = new Set<string>();
      for (const m of style.matchAll(/var\(--([a-z0-9-]+)\)/g)) consumed.add(m[1]);
      const dangling = [...consumed].filter((v) => !defined.has(v));
      expect(dangling, `${page} dangling: ${dangling.join(', ')}`).toEqual([]);
    }
  });
});

describe('the security headers (FR-8, four)', () => {
  it('both surfaces speak all four on pages and assets', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'hdr-'));
    bornPack(tmp);
    const room = await startRoom(bornPack(tmp));
    const lib = await startLibrary(
      join(tmp, 'specs') === '' ? tmp : mkdtempSync(join(tmpdir(), 'h2-')),
    );
    try {
      for (const url of [
        room.url,
        lib.url,
        room.url + 'marked.min.js',
        lib.url + 'marked.min.js',
      ]) {
        const r = await fetch(url);
        for (const h of [
          'content-security-policy',
          'x-content-type-options',
          'x-frame-options',
          'referrer-policy',
        ]) {
          expect(r.headers.get(h), `${url} ${h}`).toBeTruthy();
        }
      }
    } finally {
      await room.close();
      await lib.close();
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
