// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { loadLibraryPage } from './helpers/dom.js';

function fixture(phase = 'start') {
  const doc = {
    name: 'p',
    title: 'Frontend fixture',
    revision: 1,
    metadata: { brief: { ref: 'brief.md' }, design: { ref: 'design.md' } },
    status: { deliverable: 'awaiting_owner' },
    spec: { why: 'Review existing controls', requirements: [], clarifications: [] },
    design: { designs: [], decisions: [] },
    tasks: [
      {
        id: 'T-1',
        title: 'Bounded work',
        status: 'todo',
        needs: [],
        verify: { cmd: 'true', expect: 'exit 0' },
      },
    ],
    workflow: {
      policy: 'owner-gated/1',
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  const gate = { phase, revision: 1, can_start: phase === 'start', can_close: false, reasons: [] };
  return { doc, gate };
}
async function page(f = fixture(), options: { unavailable?: boolean; delay?: boolean } = {}) {
  const posts: Record<string, unknown>[] = [];
  let release: () => void = () => {};
  const h = await loadLibraryPage('http://localhost/', {
    seed: (dom) => {
      dom.window.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
        const path = new URL(String(url), 'http://localhost').pathname;
        if (init?.method === 'POST') {
          posts.push(JSON.parse(String(init.body)));
          if (options.delay)
            await new Promise<void>((resolve) => {
              release = resolve;
            });
          f.doc.revision++;
          f.gate.revision++;
          f.gate.phase = 'implementation';
          f.gate.can_start = false;
          return Response.json({ ok: true });
        }
        if (path === '/specs')
          return Response.json({
            specs: [
              {
                name: 'p',
                title: 'Frontend fixture',
                stage: 'awaiting_owner',
                revision: f.doc.revision,
                workflow: { phase: f.gate.phase },
                docs: [],
              },
            ],
            legacy: [],
          });
        if (path === '/spec/p') return Response.json(f.doc);
        if (path === '/workflow/p')
          return options.unavailable
            ? Response.json({ error: 'Unavailable' }, { status: 503 })
            : Response.json(f.gate);
        if (path === '/alignment/p')
          return Response.json({ sentence: 'No alignment gaps', violations: [] });
        return new Response('', { status: 404 });
      }) as typeof dom.window.fetch;
    },
  });
  await h.waitFor(() => !!h.window.document.querySelector('[data-name="p"]'));
  h.click('[data-name="p"]');
  await h.waitFor(() => !!h.window.document.querySelector('#owner-heading'));
  return { h, posts, release: () => release() };
}

describe('Quiet Workspace approval behavior', () => {
  it('uses the returned workflow for grouping and labels despite an older deliverable state', async () => {
    const { h } = await page(fixture('implementation'));
    try {
      const card = h.window.document.querySelector('[data-name="p"]')!;
      expect(card.closest('.group')?.querySelector('h2')?.textContent).toContain('Moving');
      expect(card.textContent).toContain('Implementation in progress');
      expect(card.textContent).not.toContain('Waiting on you');
      expect(h.window.document.querySelector('#owner-start')).toBeNull();
      expect(
        h.window.document.querySelector('.phase-row[aria-current="step"] .phase-label')
          ?.textContent,
      ).toBe('Implementation');
    } finally {
      h.window.close();
    }
  });
  it('keeps the exact-plan action in its own visible area and sends one guarded request', async () => {
    const { h, posts, release } = await page(fixture(), { delay: true });
    try {
      expect(h.window.document.querySelector('#owner-actions #owner-start')).not.toBeNull();
      h.click('#owner-start');
      h.click('#owner-start');
      expect(posts).toEqual([{ kind: 'start', expected_revision: 1 }]);
      expect((h.window.document.querySelector('#owner-start') as HTMLButtonElement).disabled).toBe(
        true,
      );
      expect(h.window.document.querySelector('#owner-status')?.textContent).toBe(
        'Saving permission…',
      );
      release();
      await h.waitFor(
        () =>
          h.window.document.querySelector('#owner-heading')?.textContent ===
          'Implementation in progress',
      );
      expect(h.window.document.querySelector('#owner-start')).toBeNull();
      expect(h.window.document.activeElement?.id).toBe('owner-heading');
    } finally {
      h.window.close();
    }
  });
  it('never derives Finish eligibility from task counts or a review-looking phase', async () => {
    const f = fixture('closure');
    f.doc.tasks[0]!.status = 'done';
    const { h } = await page(f);
    try {
      expect(h.window.document.querySelector('#owner-finish')).toBeNull();
    } finally {
      h.window.close();
    }
  });
  it('keeps loaded content and an explicit refresh when workflow is unavailable', async () => {
    const { h } = await page(fixture(), { unavailable: true });
    try {
      expect(h.window.document.querySelector('#owner-heading')?.textContent).toBe(
        'Owner actions unavailable',
      );
      expect(h.window.document.querySelector('#owner-start')).toBeNull();
      expect((h.window.document.querySelector('#owner-refresh') as HTMLElement).hidden).toBe(false);
      expect(h.window.document.querySelector('#tabbody')).not.toBeNull();
    } finally {
      h.window.close();
    }
  });
  it('reveals checks and dependency detail on demand without losing task evidence', async () => {
    const f = fixture('implementation');
    const { h } = await page(f);
    try {
      h.click('.tab[data-tab="tasks"]');
      await h.waitFor(() => !!h.window.document.querySelector('.task-row'));
      const row = h.window.document.querySelector('.task-row') as HTMLDetailsElement;
      expect(row.open).toBe(false);
      expect(row.querySelector('.task-details')?.textContent).toContain('true');
      expect(row.querySelector('.task-details')?.textContent).toContain('no prior tasks');
      row.open = true;
      expect(row.querySelector('summary')?.textContent).toContain('T-1');
    } finally {
      h.window.close();
    }
  });
  it('shows a useful no-results state and preserves the current detail', async () => {
    const { h } = await page();
    try {
      const input = h.window.document.querySelector('#search') as HTMLInputElement;
      input.value = 'not present';
      input.dispatchEvent(new h.window.Event('input', { bubbles: true }));
      expect(h.window.document.querySelector('#pane')?.textContent).toContain('No spec matches');
      expect(h.window.document.querySelector('#owner-start')).not.toBeNull();
    } finally {
      h.window.close();
    }
  });
});
