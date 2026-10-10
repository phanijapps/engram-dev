// @vitest-environment jsdom
/** T-3: the phase inspector — the five phases with states computed EXACTLY
 *  per FR-4, click focuses the mapped tab, read-only (no admission controls). */
import { describe, expect, it } from 'vitest';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startLibrary } from '../src/servers.js';
import { loadLibraryPage } from './helpers/dom.js';

const CORPUS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'conformance', 'corpus');

function fixtureRoot(): string {
  // the corpus spec-web pack: approved, decided, tasks done, verdicts present
  const root = join(mkdtempSync(join(tmpdir(), 'insp-')), 'specs');
  cpSync(join(CORPUS, 'L1-canonical', 'spec-web', 'input'), join(root, 'spec-web'), {
    recursive: true,
  });
  return root;
}

describe('the phase inspector (T-3)', () => {
  it('renders the five phases with the exact FR-4 derivation states; click focuses the tab; read-only', async () => {
    const root = fixtureRoot();
    const lib = await startLibrary(root);
    try {
      const h = await loadLibraryPage(lib.url);
      await h.waitFor(() => h.window.document.querySelectorAll('#pane .card').length > 0);
      h.click('#pane .card');
      await h.waitFor(() => h.window.document.querySelectorAll('.phase-row').length === 5);

      // exact states for the spec-web fixture (approved; decisions 14; 6 tasks done; 5 verdicts)
      const state = (n: number) =>
        h.window.document.querySelectorAll('.phase-row')[n]?.querySelector('.phase-state')
          ?.textContent;
      expect(state(0)).toBe('completed'); // zero open clarifications
      expect(state(1)).toBe('shaping'); // spec-web predates its own approval gate: no date.approved — derivation honest
      expect(state(2)).toMatch(/^synthesized · \d+$/); // decisions non-empty
      expect(state(3)).toBe('6 of 6 woven'); // all tasks done
      expect(state(4)).toBe('inspecting'); // verdicts exist

      // click focuses the mapped tab through the router
      h.click('.phase-row[data-tab="tasks"]');
      await h.waitFor(() => h.window.location.hash === '#/spec-web/tasks');
      await h.waitFor(() =>
        (h.window.document.querySelector('.tab[aria-selected="true"]')?.textContent ?? '').includes(
          'Tasks',
        ),
      );
      const selected = h.window.document.querySelector('.tab[aria-selected="true"]');
      expect(selected?.textContent).toContain('Tasks');

      // read-only: no admission controls in the pane
      const inspector = h.window.document.getElementById('inspector');
      expect(inspector?.querySelector('button:not(.theme-toggle)')).toBeNull();
      expect(inspector?.querySelector('textarea')).toBeNull();
    } finally {
      await lib.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
