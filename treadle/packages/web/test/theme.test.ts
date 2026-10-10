// @vitest-environment jsdom
/** T-1: the token layer — both themes, the shared key, pre-render resolution
 *  (the inline script executes before boot in the harness's document-order
 *  evaluation), the toggle writes and applies. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { startLibrary } from '../src/servers.js';
import { loadLibraryPage } from './helpers/dom.js';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function specRoot(): string {
  const root = join(mkdtempSync(join(tmpdir(), 'theme-')), 'specs');
  mkdirSync(root, { recursive: true });
  return root;
}

describe('the token layer (structural, both pages)', () => {
  const pages = ['library.html', 'page.html'];
  for (const page of pages) {
    it(`${page}: both theme scopes, the pinned values, the pre-render script`, () => {
      const html = readFileSync(join(WEB, page), 'utf8');
      expect(html).toContain("[data-theme='light']");
      expect(html).toContain("[data-theme='dark']");
      // canonical light anchors (FR-1)
      for (const v of [
        '#094cb2',
        '#faf9fa',
        '#1b1c1d',
        '#ba1a1a',
        '#15803d',
        '#b45309',
        '#6d28d9',
      ]) {
        expect(html, v).toContain(v);
      }
      // canonical dark anchors
      for (const v of [
        '#0b0f14',
        '#38bdf8',
        '#f87171',
        '#10b981',
        '#f59e0b',
        '#a855f7',
        '#232d3d',
      ]) {
        expect(html, v).toContain(v);
      }
      // the pre-render script is FIRST in head: before the <style>
      const pre = html.indexOf('pre-render theme resolution');
      const style = html.indexOf('<style>');
      expect(pre).toBeGreaterThan(-1);
      expect(pre).toBeLessThan(style);
      // the toggle exists
      expect(html).toContain('theme-toggle');
      // the voice stacks
      expect(html).toContain('--voice-serif');
    });
  }
});

describe('the theme behavior (jsdom)', () => {
  it('default is light when no key is stored', async () => {
    const root = specRoot();
    const lib = await startLibrary(root);
    try {
      const h = await loadLibraryPage(lib.url);
      expect(h.window.document.documentElement.dataset.theme).toBe('light');
    } finally {
      await lib.close();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('seeded dark resolves before boot (the no-flash property)', async () => {
    const root = specRoot();
    const lib = await startLibrary(root);
    try {
      const h = await loadLibraryPage(lib.url, {
        seed: (dom) => {
          (dom.window as unknown as Window).localStorage.setItem('theme', 'dark');
        },
      });
      // the pre-render script ran during document-order evaluation — before
      // library.js boot — so the attribute is already dark
      expect(h.window.document.documentElement.dataset.theme).toBe('dark');
      // and the toggle read-back model: the same window sees its write
      expect(h.window.localStorage.getItem('theme')).toBe('dark');
    } finally {
      await lib.close();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('the toggle flips the attribute and writes the shared key', async () => {
    const root = specRoot();
    const lib = await startLibrary(root);
    try {
      const h = await loadLibraryPage(lib.url);
      await h.waitFor(
        () => h.window.document.querySelectorAll('#pane .card, #pane .empty').length > 0,
      );
      h.click('#themeToggle');
      expect(h.window.document.documentElement.dataset.theme).toBe('dark');
      expect(h.window.localStorage.getItem('theme')).toBe('dark'); // write→read-back
      h.click('#themeToggle');
      expect(h.window.document.documentElement.dataset.theme).toBe('light');
      expect(h.window.localStorage.getItem('theme')).toBe('light');
    } finally {
      await lib.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
