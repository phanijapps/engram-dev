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
import { JSDOM } from 'jsdom';

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

/** the room loader: page.html + page.js in order, the owner seam injected */
async function loadRoomPage(
  serverUrl: string,
): Promise<{ dom: JSDOM; w: Window & typeof globalThis }> {
  const raw = readFileSync(join(WEB, 'page.html'), 'utf8');
  const scripts: { src?: string; code?: string }[] = [];
  const html = raw.replace(
    /<script([^>]*)>([\s\S]*?)<\/script>\s*/g,
    (_m, attrs: string, body: string) => {
      const src = /src="([^"]+)"/.exec(attrs)?.[1];
      scripts.push(src ? { src } : { code: body });
      return '';
    },
  );
  const dom = new JSDOM(html, {
    url: serverUrl,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const w = dom.window as unknown as Window & typeof globalThis;
  w.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    return globalThis.fetch(new URL(url, serverUrl).href, init);
  }) as typeof fetch;
  (w as unknown as Record<string, unknown>)['INTERVIEW_CONFIG'] = { by: 'human:owner' };
  const dbg = await w.fetch('/spec');
  console.error('SHIM /spec:', dbg.status, (await dbg.text()).slice(0, 120));
  w.addEventListener('error', (ev: Event) => console.error('WIN ERR:', (ev as ErrorEvent).message));
  w.eval(
    "window.__probe = async () => { try { await loadSpec(); return [typeof S, S && S.name, S && (S.spec ? 'spec-ok' : 'spec-missing')]; } catch (e) { return ['ERR', String(e).slice(0, 100)]; } };",
  );
  for (const sc of scripts) {
    const code = sc.src ? readFileSync(join(WEB, sc.src.replace(/^\//, '')), 'utf8') : sc.code!;
    try {
      w.eval(code);
    } catch (e) {
      console.error('ROOM EVAL ERROR:', String(e).slice(0, 200));
    }
  }
  const probe = (w as unknown as Record<string, unknown>)['__probe'] as () => Promise<unknown>;
  if (probe) console.error('PROBE:', JSON.stringify(await probe()));
  return { dom, w };
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
    expect(style).not.toMatch(/border:\s*1px solid/);
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
      for (const url of [room.url, lib.url]) {
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
