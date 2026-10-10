/**
 * The DOM harness (T-0, R4-hardened): a controlled jsdom loader for the
 * portable pages.
 *
 * Facts the harness owns:
 *  - jsdom ships no fetch — we shim it (string URLs and Request objects;
 *    Node-realm Responses: .url is absolute — do not assert on it) BEFORE
 *    any page script runs;
 *  - scripts run 'outside-only' and are evaluated MANUALLY IN DOCUMENT
 *    ORDER (marked.min.js, inline <head> scripts, then library.js) — the
 *    T-1 pre-render theme script therefore really executes before boot;
 *  - persistence is write-to-read-back plus a seeded fresh DOM (no reload);
 *  - clicks dispatch real MouseEvents (button/detail fidelity).
 */
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src');

/** page script src → the vendored file it serves */
const ASSET: Record<string, string> = {
  '/marked.min.js': 'marked.min.js',
  '/app.js': 'library.js',
  '/page.js': 'page.js',
};

export interface Harness {
  dom: JSDOM;
  window: Window & typeof globalThis;
  waitFor(predicate: () => boolean, ms?: number): Promise<void>;
  click(selector: string): void;
}

export async function loadLibraryPage(
  serverUrl: string,
  opts: { seed?: (dom: JSDOM) => void } = {},
): Promise<Harness> {
  const raw = readFileSync(join(WEB, 'library.html'), 'utf8');
  // capture every script in document order (src'd and inline), then strip
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
  opts.seed?.(dom);
  // every script, in document order: marked → inline pre-render → the page
  for (const s of scripts) {
    const code = s.src
      ? readFileSync(join(WEB, ASSET[s.src] ?? s.src.replace(/^\//, '')), 'utf8')
      : s.code!;
    w.eval(code);
  }
  return {
    dom,
    window: w,
    waitFor: async (predicate, ms = 2000) => {
      const deadline = Date.now() + ms;
      while (Date.now() < deadline) {
        if (predicate()) return;
        await new Promise((r) => setTimeout(r, 25));
      }
      throw new Error('harness.waitFor: condition not met within ' + ms + 'ms');
    },
    click: (selector) => {
      const el = w.document.querySelector(selector) as HTMLElement | null;
      if (!el) throw new Error('harness.click: no element for ' + selector);
      el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
    },
  };
}
