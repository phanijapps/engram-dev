// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  savePack,
  loadPackWithMeta,
  planDigest,
  evidenceDigest,
  type PackDoc,
} from '@treadle/core';
import { startLibrary } from '../src/servers.js';
import { loadLibraryPage } from './helpers/dom.js';

function fixture(ready = false) {
  const root = mkdtempSync(join(tmpdir(), 'owner-ui-'));
  const dir = join(root, 'p');
  mkdirSync(dir);
  const path = join(dir, 'p.json');
  const doc: PackDoc = {
    name: 'p',
    title: 'Owner workflow',
    format: 'specpack/0.4',
    revision: 1,
    status: 'active',
    spec: { why: 'Require actual owner approval', requirements: [], clarifications: [] },
    plan: {
      decisions: [
        {
          id: 'D-1',
          decision: 'Use this design',
          status: ready ? 'accepted' : 'proposed',
          ...(ready ? { accepted_by: 'human:owner' } : {}),
        },
      ],
    },
    artifacts: {},
    tasks: [
      {
        id: 'T-1',
        title: 'Work',
        status: 'todo',
        verify: { cmd: 'true', expect: 'exit 0' },
        requires_decisions: ['D-1'],
        context: { touch: [] },
      },
    ],
    workflow: {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  for (const id of ['brief', 'spec', 'design', 'plan']) {
    writeFileSync(join(dir, id + '.md'), '# Owner review\n\nReview this plan.');
    doc.artifacts![id] = { file: id + '.md' };
  }
  savePack(doc, path, { at: new Date().toISOString() });
  return { root, dir, path, doc };
}
function current(dir: string) {
  const l = loadPackWithMeta(dir);
  if (!l.ok) throw new Error(l.message);
  return l.value;
}
function scope(doc: PackDoc, path: string) {
  const d = planDigest(doc, path);
  if (!d.ok) throw new Error(d.message);
  return d.value;
}
describe('owner workflow UI', () => {
  it('shows the ordered flow; decision approval does not start implementation', async () => {
    const f = fixture();
    const lib = await startLibrary(f.root);
    const h = await loadLibraryPage(lib.url);
    try {
      await h.waitFor(() => !!h.window.document.querySelector('#pane .card'));
      h.click('#pane .card');
      await h.waitFor(() => h.window.document.querySelectorAll('.phase-row').length === 9);
      const labels = [...h.window.document.querySelectorAll('.phase-label')].map(
        (el) => el.textContent,
      );
      expect(labels).toEqual([
        'Requirement',
        'Brief',
        'Spec questions',
        'Design and decisions',
        'Task plan',
        'Permission to start',
        'Implementation',
        'Independent review',
        'Finish spec',
      ]);
      expect(h.window.document.querySelector('#owner-start')).toBeNull();
      h.click('.tab[data-tab="design"]');
      await h.waitFor(() => !!h.window.document.querySelector('[data-accept]'));
      h.click('[data-accept]');
      await h.waitFor(() => !!h.window.document.querySelector('#owner-start'));
      expect(current(f.dir).doc.workflow?.start_receipt).toBeUndefined();
      expect(current(f.dir).doc.tasks[0]?.status).toBe('todo');
      h.click('#owner-start');
      await h.waitFor(
        () =>
          !!current(f.dir).doc.workflow?.start_receipt &&
          h.window.document.querySelector('#owner-start') === null &&
          h.window.document.querySelector('#owner-heading')?.textContent ===
            'Implementation in progress' &&
          h.window.document.activeElement?.id === 'owner-heading',
      );
      expect(current(f.dir).doc.workflow?.start_receipt?.by).toBe('human:owner');
      expect(h.window.document.querySelector('#owner-finish')).toBeNull();
      expect(h.window.document.querySelector('#owner-heading')?.textContent).toBe(
        'Implementation in progress',
      );
      expect(h.window.document.activeElement?.id).toBe('owner-heading');
    } finally {
      h.dom.window.close();
      await lib.close();
      rmSync(f.root, { recursive: true, force: true });
    }
  });
  it('requires a current independent review, then a separate confirmation to finish', async () => {
    const f = fixture(true);
    f.doc.workflow!.start_receipt = {
      by: 'human:owner',
      at: new Date().toISOString(),
      plan_digest: scope(f.doc, f.path),
    };
    f.doc.tasks[0]!.status = 'done';
    f.doc.tasks[0]!.evidence = [
      { cmd: 'true', exit: 0, at: new Date().toISOString(), by: 'agent:builder' },
    ];
    savePack(f.doc, f.path, { at: new Date().toISOString() });
    const lib = await startLibrary(f.root);
    const h = await loadLibraryPage(lib.url);
    try {
      await h.waitFor(() => !!h.window.document.querySelector('#pane .card'));
      h.click('#pane .card');
      await h.waitFor(
        () =>
          h.window.document.querySelector('#owner-heading')?.textContent ===
          'Awaiting independent review',
      );
      expect(h.window.document.querySelector('#owner-finish')).toBeNull();
      const l = current(f.dir);
      l.doc.review = {
        verdicts: [
          {
            on: 'PACK',
            verdict: 'PASS',
            by: 'agent:reviewer',
            at: new Date().toISOString(),
            findings: [],
            plan_digest: scope(l.doc, l.path),
            evidence_digest: evidenceDigest(l.doc),
          },
        ],
      };
      l.doc.revision!++;
      savePack(l.doc, l.path, { at: new Date().toISOString() });
      h.window.location.hash = '';
      await h.waitFor(
        () =>
          h.window.document.getElementById('detail')?.textContent?.includes('Choose a spec') ===
          true,
      );
      h.click('#pane .card');
      await h.waitFor(() => !!h.window.document.querySelector('#owner-finish'));
      h.click('#owner-finish');
      expect(current(f.dir).doc.status).toBe('active');
      expect(h.window.document.activeElement?.id).toBe('owner-confirm-finish');
      h.click('#owner-cancel-finish');
      expect(h.window.document.activeElement?.id).toBe('owner-finish');
      h.click('#owner-finish');
      h.click('#owner-confirm-finish');
      await h.waitFor(
        () => h.window.document.querySelector('#owner-heading')?.textContent === 'Spec complete',
      );
      expect(current(f.dir).doc.status).toBe('complete');
      expect(current(f.dir).doc.closed_by).toBe('human:owner');
      expect(h.window.document.querySelector('#owner-finish')).toBeNull();
    } finally {
      h.dom.window.close();
      await lib.close();
      rmSync(f.root, { recursive: true, force: true });
    }
  });
  it('preserves content on a stale action and refreshes without inventing permission', async () => {
    const f = fixture(true);
    const lib = await startLibrary(f.root);
    const h = await loadLibraryPage(lib.url);
    try {
      await h.waitFor(() => !!h.window.document.querySelector('#pane .card'));
      h.click('#pane .card');
      await h.waitFor(() => !!h.window.document.querySelector('#owner-start'));
      const l = current(f.dir);
      l.doc.revision!++;
      savePack(l.doc, l.path, { at: new Date().toISOString() });
      h.click('#owner-start');
      await h.waitFor(() => !h.window.document.getElementById('owner-error')!.hidden);
      expect(h.window.document.getElementById('owner-error')!.textContent).toContain('changed');
      expect(h.window.document.querySelector('#tabbody')).not.toBeNull();
      expect(current(f.dir).doc.workflow?.start_receipt).toBeUndefined();
      expect(h.window.document.activeElement?.id).toBe('owner-error');
      h.click('#owner-refresh');
      await h.waitFor(() => h.window.document.getElementById('owner-error')!.hidden);
      expect(current(f.dir).doc.workflow?.start_receipt).toBeUndefined();
    } finally {
      h.dom.window.close();
      await lib.close();
      rmSync(f.root, { recursive: true, force: true });
    }
  });
  it('fails closed when approval state cannot be read; retry restores the controls', async () => {
    const f = fixture(true);
    const lib = await startLibrary(f.root);
    let fail = true;
    const h = await loadLibraryPage(lib.url, {
      seed: (dom) => {
        const fetcher = dom.window.fetch;
        dom.window.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
          String(input).startsWith('/workflow/') && fail
            ? Promise.resolve(new Response('{}', { status: 503 }))
            : fetcher(input, init)) as typeof fetch;
      },
    });
    try {
      await h.waitFor(() => !!h.window.document.querySelector('#pane .card'));
      h.click('#pane .card');
      await h.waitFor(
        () =>
          h.window.document.querySelector('#owner-heading')?.textContent ===
          'Owner actions unavailable',
      );
      expect(h.window.document.querySelector('#owner-start')).toBeNull();
      expect(h.window.document.getElementById('owner-error')!.hidden).toBe(false);
      fail = false;
      h.click('#owner-refresh');
      await h.waitFor(() => !!h.window.document.querySelector('#owner-start'));
      expect(current(f.dir).doc.workflow?.start_receipt).toBeUndefined();
    } finally {
      h.dom.window.close();
      await lib.close();
      rmSync(f.root, { recursive: true, force: true });
    }
  });
});
