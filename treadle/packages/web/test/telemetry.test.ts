// @vitest-environment jsdom
/** T-8: the telemetry panel — the REAL fixture counts (5 verdicts, 11 findings
 *  2/7/2), the reviewer chip from verdict.by, the severity filter, the gate
 *  panel fed by the alignment route, the honest posture note. */
import { describe, expect, it } from 'vitest';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startLibrary } from '../src/servers.js';
import { loadLibraryPage } from './helpers/dom.js';

const CORPUS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'conformance', 'corpus');

describe('the review telemetry + gate (T-8)', () => {
  it('renders the real counts, filters by severity, speaks the house sentence', async () => {
    const root = join(mkdtempSync(join(tmpdir(), 'tel-')), 'specs');
    cpSync(join(CORPUS, 'L1-canonical', 'spec-web', 'input'), join(root, 'spec-web'), {
      recursive: true,
    });
    const lib = await startLibrary(root);
    try {
      const h = await loadLibraryPage(lib.url);
      await h.waitFor(() => h.window.document.querySelectorAll('#pane .card').length > 0);
      h.click('#pane .card');
      // telemetry renders with the REAL fixture numbers
      await h.waitFor(() => h.window.document.querySelector('#telemetry') !== null);
      const tel = h.window.document.getElementById('telemetry')!.textContent ?? '';
      expect(tel).toContain('5 verdicts');
      expect(tel).toContain('BLOCKER 2');
      expect(tel).toContain('DEFECT 7');
      expect(tel).toContain('SMELL 2');
      expect(tel).toContain('agent:red-forman'); // the reviewer claim from verdict.by, never hardcoded
      // the severity filter: click BLOCKER, the findings list filters
      h.click('.sev-filter[data-sev="BLOCKER"]');
      await h.waitFor(
        () => (h.window.document.querySelector('#findingList')?.textContent ?? '').length > 10,
      );
      const list = h.window.document.querySelector('#findingList')!.textContent ?? '';
      expect(list).toContain('BLOCKER');
      expect(list).not.toContain('DEFECT');
      // the gate panel: the pinned sentence from the alignment route
      await h.waitFor(() =>
        (h.window.document.querySelector('#gatePanel')?.textContent ?? '').includes('alignment:'),
      );
      const gate = h.window.document.querySelector('#gatePanel')!.textContent ?? '';
      expect(gate).toContain('gaps are reported, never guessed');
      // the honest posture note
      const note = h.window.document.querySelector('.note')?.textContent ?? '';
      expect(note).toContain('no live socket in v1');
    } finally {
      await lib.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
