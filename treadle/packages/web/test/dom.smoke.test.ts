// @vitest-environment jsdom
/** T-0 smoke: the harness loads the real library.js, boots it against a live
 *  server, and a dispatched click drives the router. If this passes, every
 *  later DOM verify has legs. */
import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startLibrary } from '../src/servers.js';
import { loadLibraryPage } from './helpers/dom.js';

function specRoot(): string {
  const root = join(mkdtempSync(join(tmpdir(), 'dom-')), 'specs');
  const d = join(root, 'p');
  mkdirSync(d, { recursive: true });
  writeFileSync(
    join(d, 'p.json'),
    JSON.stringify({
      format: 'specpack/0.3',
      name: 'p',
      revision: 1,
      title: 'Dom fixture',
      spec: {
        why: 'w',
        requirements: [],
        clarifications: [{ id: 'Q-1', question: 'q', status: 'open', owner: 'human:owner' }],
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
  return root;
}

describe('the DOM harness (T-0 smoke)', () => {
  it('loads library.js, boots against the live server, and a click drives the router', async () => {
    const root = specRoot();
    const lib = await startLibrary(root);
    try {
      const h = await loadLibraryPage(lib.url);
      // boot: the pane fills from /specs through the shimminged fetch
      await h.waitFor(() => h.window.document.querySelectorAll('#pane .card').length > 0);
      expect(h.window.document.querySelector('#pane .card')?.textContent).toContain('Dom fixture');
      // a dispatched click routes: hash moves, the dossier renders tabs
      h.click('#pane .card');
      await h.waitFor(() => h.window.document.querySelectorAll('.tab').length >= 5);
      expect(h.window.location.hash).toContain('/p');
      expect(h.window.document.querySelector('#detail')?.textContent).not.toContain(
        'Choose a spec',
      );
    } finally {
      await lib.close();
    }
  });

  it('persistence model: write-to-read-back plus a seeded fresh DOM', async () => {
    const root = specRoot();
    const lib = await startLibrary(root);
    try {
      // write: the page's storage (the future theme key rides the same model)
      const first = await loadLibraryPage(lib.url);
      first.window.localStorage.setItem('theme', 'dark');
      // read-back: the same window sees its own write
      expect(first.window.localStorage.getItem('theme')).toBe('dark');
      // seeded fresh DOM: a second load boots with the storage seeded
      const second = await loadLibraryPage(lib.url, {
        seed: (dom) => {
          (dom.window as unknown as Window).localStorage.setItem('theme', 'dark');
        },
      });
      expect(second.window.localStorage.getItem('theme')).toBe('dark');
    } finally {
      await lib.close();
    }
  });
});
