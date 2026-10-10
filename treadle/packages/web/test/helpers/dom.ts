/**
 * The DOM harness (T-0): a controlled jsdom loader for the portable pages.
 *
 * Three facts the harness owns (R2/R3):
 *  - jsdom ships no fetch — we shim it, rebasing relative URLs against the
 *    live server, BEFORE any page script runs;
 *  - scripts run in 'outside-only' mode and are evaluated manually after the
 *    shim — deterministic, no resource-loader races;
 *  - persistence is write-to-read-back plus a seeded fresh DOM (no reload).
 */
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src');

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
  const html = readFileSync(join(WEB, 'library.html'), 'utf8')
    // strip script tags: we evaluate them ourselves, after the fetch shim
    .replace(/<script src="[^"]*"><\/script>\s*/g, '');
  const dom = new JSDOM(html, {
    url: serverUrl + '/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const w = dom.window as unknown as Window & typeof globalThis;
  // the fetch shim: relative → absolute against the live server
  w.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
    globalThis.fetch(new URL(String(input), serverUrl).href, init)) as typeof fetch;
  opts.seed?.(dom);
  // the page's own script, evaluated in-window after the shim
  w.eval(readFileSync(join(WEB, 'library.js'), 'utf8'));
  const harness: Harness = {
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
      el.dispatchEvent(new w.Event('click', { bubbles: true }));
    },
  };
  return harness;
}
