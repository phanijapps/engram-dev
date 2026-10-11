import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { emitBytes, mutateFeedback, readFeedback, type PackDoc } from '@treadle/core';
import { startProjects } from '../src/project-server.js';
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
async function fixture(open = true, mode: 'documents' | 'diff' = 'documents') {
  const root = mkdtempSync(join(tmpdir(), 'feedback-ui-'));
  roots.push(root);
  const dir = join(root, 'specs/test'),
    wiki = join(root, 'wiki');
  mkdirSync(dir, { recursive: true });
  mkdirSync(wiki);
  const pack: PackDoc = {
    name: 'test',
    format: 'specpack/0.4',
    revision: 1,
    spec: { requirements: [], clarifications: [] },
    plan: { decisions: [] },
    tasks: [],
    workflow: {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  writeFileSync(join(dir, 'test.json'), emitBytes(pack));
  const apply = (action: Parameters<typeof mutateFeedback>[2]['action'], by = 'human:test') =>
    mutateFeedback(dir, root, {
      operation_id: randomUUID(),
      expected_revision: readFeedback(dir, root)?.revision || 0,
      by,
      action,
    });
  const opened = open
    ? apply(
        {
          kind: 'open',
          selection: {
            mode,
            ...(mode === 'diff' ? { base: 'a'.repeat(40) } : {}),
            paths: ['doc.md'],
            artifacts: [],
          },
          snapshots: [
            {
              key: 'doc.md',
              path: 'doc.md',
              before: mode === 'diff' ? 'original source\n' : null,
              after: '<img src=x onerror=alert(1)>\none\n',
            },
          ],
        },
        'agent:test',
      )
    : null;
  const ui = await startProjects(() => [
    {
      id: 'a'.repeat(24),
      label: 'test',
      workspace: root,
      specs: join(root, 'specs'),
      wiki,
      available: true,
      wikiAvailable: true,
      specsAvailable: true,
    },
  ]);
  const base = ui.url + 'projects/' + 'a'.repeat(24) + '/library';
  const html = await (await fetch(base + '/')).text();
  const dom = new JSDOM(html, {
    url: base + '/#/test/feedback' + (opened ? '?session=' + opened.session : ''),
    runScripts: 'outside-only',
  });
  dom.window.eval(/<script>(window.LIBRARY_CONFIG=.*?)<\/script>/.exec(html)![1]!);
  Object.defineProperty(dom.window.crypto, 'randomUUID', { value: randomUUID });
  dom.window.CSS = { escape: (s: string) => s } as typeof dom.window.CSS;
  dom.window.marked = { parse: (text: string) => text } as unknown as typeof dom.window.marked;
  const api = (path: string, options: RequestInit = {}) =>
    fetch(base + path, {
      ...options,
      headers: {
        ...options.headers,
        Origin: ui.url.slice(0, -1),
        'X-Owner-Token': dom.window.LIBRARY_CONFIG.ownerToken,
      },
    });
  dom.window.eval(readFileSync(new URL('../src/feedback.js', import.meta.url), 'utf8'));
  const host = dom.window.document.getElementById('detail')!;
  dom.window.renderFeedback(host, 'test', pack, api);
  await until(() => !host.hasAttribute('aria-busy'));
  return {
    root,
    dir,
    pack,
    opened,
    apply,
    ui,
    base,
    dom,
    host,
    api,
    close: async () => {
      dom.window.close();
      await ui.close();
    },
  };
}
async function until(test: () => boolean) {
  for (let i = 0; i < 100; i++) {
    if (test()) return;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw Error('UI did not settle');
}
function click(f: Awaited<ReturnType<typeof fixture>>, id: string) {
  (f.host.querySelector('#' + id) as HTMLElement).click();
}
function fill(f: Awaited<ReturnType<typeof fixture>>, text: string) {
  const t = f.host.querySelector('#feedback-comment') as HTMLTextAreaElement;
  t.value = text;
  t.dispatchEvent(new f.dom.window.Event('input', { bubbles: true }));
}
it('renders inert source, keyboard line selection, draft save and explicit Submit without owner writes', async () => {
  const f = await fixture();
  try {
    const original = readFileSync(join(f.dir, 'test.json'));
    expect(f.host.querySelector('img')).toBeNull();
    expect(f.host.textContent).toContain('<img src=x');
    const line = f.host.querySelector(
      '[aria-label^="Comment on after line 2 "]',
    ) as HTMLButtonElement;
    line.focus();
    line.click();
    expect(f.dom.window.document.activeElement?.id).toBe('feedback-comment');
    fill(f, 'Please revise <script>bad()</script>');
    click(f, 'feedback-add');
    await until(() => readFeedback(f.dir, f.root)!.threads.length === 1);
    await until(() =>
      f.host.querySelector('#feedback-status')!.textContent!.includes('Draft saved'),
    );
    expect(readFeedback(f.dir, f.root)!.sessions[0]!.cursor).toBe(0);
    expect(f.host.querySelector('script')).toBeNull();
    click(f, 'feedback-submit');
    await until(() => readFeedback(f.dir, f.root)!.sessions[0]!.cursor === 1);
    await until(() =>
      f.host.querySelector('#feedback-status')!.textContent!.includes('Feedback submitted'),
    );
    expect((f.host.querySelector('#feedback-submit') as HTMLButtonElement).disabled).toBe(true);
    expect(f.host.textContent).toContain('idle');
    expect(readFileSync(join(f.dir, 'test.json'))).toEqual(original);
  } finally {
    await f.close();
  }
});
it('preserves local input and line range across remount and revision conflicts', async () => {
  const f = await fixture();
  try {
    (f.host.querySelector('[aria-label^="Comment on after line 2 "]') as HTMLElement).click();
    fill(f, 'Keep local draft');
    f.dom.window.renderFeedback(f.host, 'test', f.pack, f.api);
    await until(() => !f.host.hasAttribute('aria-busy'));
    expect((f.host.querySelector('#feedback-comment') as HTMLTextAreaElement).value).toBe(
      'Keep local draft',
    );
    f.apply({
      kind: 'comment',
      session: f.opened!.session,
      anchor: { round: f.opened!.round! },
      body: 'other writer',
    });
    click(f, 'feedback-add');
    await until(() => !(f.host.querySelector('#feedback-error') as HTMLElement).hidden);
    expect(f.host.textContent).toContain('Refresh before retrying');
    expect((f.host.querySelector('#feedback-comment') as HTMLTextAreaElement).value).toBe(
      'Keep local draft',
    );
    click(f, 'feedback-refresh');
    await until(() => !f.host.hasAttribute('aria-busy'));
    click(f, 'feedback-add');
    await until(() => readFeedback(f.dir, f.root)!.threads.length === 2);
    expect(readFeedback(f.dir, f.root)!.threads[1]!.original.start).toBe(2);
  } finally {
    await f.close();
  }
});
it('shows first-run, unsupported and closed states with disabled writes', async () => {
  const f = await fixture(false);
  try {
    expect(f.host.textContent).toContain('No review session');
    f.dom.window.renderFeedback(f.host, 'test', { ...f.pack, format: 'specpack/0.3' }, f.api);
    expect(f.host.textContent).toContain('Legacy adoption');
    expect((f.host.querySelector('#feedback-refresh') as HTMLButtonElement).disabled).toBe(true);
  } finally {
    await f.close();
  }
  const c = await fixture();
  try {
    c.pack.status = 'complete';
    writeFileSync(join(c.dir, 'test.json'), emitBytes(c.pack));
    click(c, 'feedback-refresh');
    await until(() => !c.host.hasAttribute('aria-busy'));
    expect(c.host.textContent).toContain('read-only');
    expect((c.host.querySelector('#feedback-add') as HTMLButtonElement).disabled).toBe(true);
  } finally {
    await c.close();
  }
});
it('retains original anchor, shows stale/replies and explicitly reattaches to an open new round', async () => {
  const f = await fixture();
  try {
    const r = f.opened!;
    const t = f.apply({
      kind: 'comment',
      session: r.session,
      anchor: { round: r.round! },
      body: 'old comment',
    });
    f.apply({ kind: 'submit', session: r.session, round: r.round! });
    f.apply(
      { kind: 'reply', session: r.session, thread: t.thread!, body: 'Publishing revised bytes' },
      'agent:test',
    );
    f.apply(
      {
        kind: 'round',
        session: r.session,
        snapshots: [
          {
            key: 'doc.md',
            path: 'doc.md',
            before: '<img src=x onerror=alert(1)>\none\n',
            after: 'revised\n',
          },
        ],
      },
      'agent:test',
    );
    f.dom.window.renderFeedback(f.host, 'test', f.pack, f.api);
    await until(() => !f.host.hasAttribute('aria-busy'));
    expect(f.host.textContent).toContain('stale');
    expect(f.host.textContent).toContain('Agent response');
    const reattach = [...f.host.querySelectorAll('button')].find(
      (b) => b.textContent === 'Reattach to selected anchor',
    )!;
    reattach.click();
    await until(() => readFeedback(f.dir, f.root)!.sessions[0]!.drafts.length === 1);
    await until(() =>
      f.host.querySelector('#feedback-status')!.textContent!.includes('Reattachment saved'),
    );
    click(f, 'feedback-submit');
    await until(() => readFeedback(f.dir, f.root)!.sessions[0]!.cursor === 2);
    expect(readFeedback(f.dir, f.root)!.batches[1]!.items[0]!.kind).toBe('reattach');
    expect(readFeedback(f.dir, f.root)!.threads[0]!.original.round).toBe(r.round);
  } finally {
    await f.close();
  }
});
it('paginates large source without silently dropping lines and keeps Markdown preview opaque', async () => {
  const f = await fixture();
  try {
    f.apply(
      {
        kind: 'round',
        session: f.opened!.session,
        snapshots: [
          {
            key: 'doc.md',
            path: 'doc.md',
            before: '<img src=x onerror=alert(1)>\none\n',
            after: Array.from({ length: 205 }, (_, i) => 'line ' + (i + 1)).join('\n'),
          },
        ],
      },
      'agent:test',
    );
    f.dom.window.renderFeedback(f.host, 'test', f.pack, f.api);
    await until(() => !f.host.hasAttribute('aria-busy'));
    expect(f.host.textContent).toContain('of 205');
    expect(f.host.querySelector('iframe')!.getAttribute('sandbox')).toBe('');
    [...f.host.querySelectorAll('button')].find((b) => b.textContent === 'Next lines')!.click();
    await until(() => f.host.textContent!.includes('Lines 101'));
    expect(f.host.querySelector('[aria-label^="Comment on after line 101 "]')).not.toBeNull();
  } finally {
    await f.close();
  }
});

it('shows explicit old and new diff sides without interpreting either as app markup', async () => {
  const f = await fixture(true, 'diff');
  try {
    expect(f.host.textContent).toContain('diff review');
    expect(f.host.textContent).toContain('original source');
    expect(f.host.querySelector('[aria-label="before source"]')).not.toBeNull();
    expect(f.host.querySelector('[aria-label="after source"]')).not.toBeNull();
    expect(f.host.querySelector('img')).toBeNull();
  } finally {
    await f.close();
  }
});
