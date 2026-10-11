// @vitest-environment jsdom
/** T-2: the approved Quiet Workspace reskin retains panes and legacy journey navigation. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { startLibrary } from '../src/servers.js';
import { loadLibraryPage } from './helpers/dom.js';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const CORPUS = join(WEB, '..', '..', 'conformance', 'corpus');

describe('the library skin (structural)', () => {
  const html = readFileSync(join(WEB, 'library.html'), 'utf8');
  const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));

  it('keeps inputs distinguishable without boxing every workspace pane', () => {
    expect(style).toContain('.feedback-composer textarea');
    expect(style).toContain('border: 1px solid var(--ink-2)');
    for (const selector of ['#pane', '#detail', '#inspector']) {
      const rule = style.slice(style.indexOf(selector + ' {')).split('}')[0]!;
      expect(rule).not.toMatch(/border:\s*1px\s*solid/);
    }
  });

  it('uses system typography and flat, readable primary actions', () => {
    expect(style).toContain('var(--voice-body)');
    expect(style).toContain('background: var(--action)');
    expect(style).toContain('min-height: 44px');
    expect(style).not.toContain('linear-gradient');
    expect(style).not.toContain('backdrop-filter');
    expect(style).not.toContain('Georgia');
  });

  it('the markdown carve-out is ghost edges, not borders', () => {
    const th = style.indexOf('.doc .md th');
    expect(th).toBeGreaterThan(-1);
    expect(style.slice(th, th + 160)).toContain('box-shadow');
    expect(style.slice(th, th + 160)).not.toContain('border:');
  });
});

describe('the library skin (live DOM)', () => {
  it('three panes render; legacy journey navigation survives', async () => {
    const root = join(mkdtempSync(join(tmpdir(), 'skin-')), 'specs');
    cpSync(join(CORPUS, 'L1-canonical', 'spec-web', 'input'), join(root, 'spec-web'), {
      recursive: true,
    });
    const lib = await startLibrary(root);
    try {
      const h = await loadLibraryPage(lib.url);
      await h.waitFor(() => h.window.document.querySelectorAll('#pane .card').length > 0);
      h.click('#pane .card');
      await h.waitFor(() => h.window.document.querySelector('.journey') !== null);
      // three panes
      for (const pane of ['#pane', '#detail', '#inspector']) {
        expect(h.window.document.querySelector(pane), pane).not.toBeNull();
      }
      // the journey strip (FR-9): five nodes, flags or not, but present
      expect(h.window.document.querySelectorAll('.journey .jnode').length).toBeGreaterThanOrEqual(
        5,
      );
      // Existing item labels survive the visual change.
      const card = h.window.document.querySelector('#pane .card .t') as HTMLElement;
      expect(card.textContent).toContain('The spec interview page');
    } finally {
      await lib.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
