import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { JSDOM } from 'jsdom';

async function settle(test: () => boolean) {
  for (let i = 0; i < 100; i++) {
    if (test()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw Error('UI did not settle');
}
async function feedback(delay = false) {
  const dom = new JSDOM('<main id="detail"></main>', {
    url: 'http://localhost/#/p/feedback',
    runScripts: 'outside-only',
  });
  Object.defineProperty(dom.window.crypto, 'randomUUID', { value: randomUUID });
  dom.window.CSS = { escape: (s: string) => s } as typeof dom.window.CSS;
  dom.window.LIBRARY_CONFIG = { base: '/library' };
  const state = {
    revision: 1,
    closed: false,
    threads: [],
    batches: [],
    sessions: [
      {
        id: 'session',
        cursor: 0,
        drafts: [],
        selection: { mode: 'documents', paths: ['doc.md'], artifacts: [] },
        rounds: [
          {
            id: 'round',
            sequence: 1,
            sealed: false,
            targets: [{ id: 'target', path: 'doc.md', after: { sha256: 'a'.repeat(64) } }],
          },
        ],
      },
    ],
  };
  const posts: Record<string, unknown>[] = [];
  let release = () => {};
  const api = async (path: string, init?: RequestInit) => {
    if (init?.method === 'POST') {
      posts.push(JSON.parse(String(init.body)));
      if (delay)
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      return Response.json({ error: 'Revision conflict', code: 'conflict' }, { status: 409 });
    }
    return path.includes('/snapshot?') ? new Response('first\nsecond\n') : Response.json(state);
  };
  dom.window.eval(readFileSync(new URL('../src/feedback.js', import.meta.url), 'utf8'));
  const host = dom.window.document.getElementById('detail')!;
  dom.window.renderFeedback(
    host,
    'p',
    { format: 'specpack/0.4', workflow: { policy: 'owner-gated/1' } },
    api,
  );
  await settle(() => !host.hasAttribute('aria-busy'));
  const fill = (value: string) => {
    const body = host.querySelector('#feedback-comment') as HTMLTextAreaElement;
    body.value = value;
    body.dispatchEvent(new dom.window.Event('input'));
  };
  return { dom, host, posts, fill, release: () => release() };
}
it('keeps source and discussion in existing review, with explicit draft and Submit steps', async () => {
  const f = await feedback();
  try {
    expect(f.host.querySelector('.feedback-workspace .feedback-source-pane')).not.toBeNull();
    expect(f.host.querySelector('.feedback-discussion #feedback-add')).not.toBeNull();
    const add = f.host.querySelector('#feedback-add') as HTMLButtonElement;
    const submit = f.host.querySelector('#feedback-submit') as HTMLButtonElement;
    expect(add.disabled).toBe(true);
    expect(submit.disabled).toBe(false); // existing empty submission remains possible
    f.fill('Please clarify');
    expect(add.disabled).toBe(false);
    expect(submit.disabled).toBe(true);
    expect(add.classList.contains('primary')).toBe(true);
    submit.click();
    expect(f.posts).toHaveLength(0);
    (f.host.querySelector('[aria-label^="Comment on after line 2"]') as HTMLElement).click();
    expect(f.dom.window.document.activeElement?.id).toBe('feedback-comment');
    expect((f.host.querySelector('.feedback-range') as HTMLDetailsElement).open).toBe(true);
  } finally {
    f.dom.window.close();
  }
});
it('blocks duplicate mutation and selection while saving, retaining the conflict draft and focus', async () => {
  const f = await feedback(true);
  try {
    f.fill('Keep this draft');
    const add = f.host.querySelector('#feedback-add') as HTMLButtonElement;
    add.click();
    add.click();
    expect(f.posts).toHaveLength(1);
    expect((f.host.querySelector('#feedback-round') as HTMLSelectElement).disabled).toBe(true);
    expect(f.host.querySelector('#feedback-status')?.textContent).toBe('Saving draft…');
    f.release();
    await settle(() => !(f.host.querySelector('#feedback-error') as HTMLElement).hidden);
    expect((f.host.querySelector('#feedback-comment') as HTMLTextAreaElement).value).toBe(
      'Keep this draft',
    );
    expect(f.dom.window.document.activeElement?.id).toBe('feedback-error');
    expect(f.posts[0]).toMatchObject({
      expected_revision: 1,
      session: 'session',
      by: 'human:owner',
    });
    expect(typeof f.posts[0]!.operation_id).toBe('string');
  } finally {
    f.dom.window.close();
  }
});
async function room(choice = false, delay = false) {
  const html = readFileSync(new URL('../src/page.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only' });
  const pack = {
    name: 'p',
    revision: 1,
    spec: {
      clarifications: [
        {
          id: 'Q-1',
          status: 'open',
          question: 'Choose an approach',
          kind: choice ? 'choice' : 'open',
          options: ['One', 'Two'],
          default: 'One',
        },
      ],
    },
  };
  let posts = 0;
  let release = () => {};
  dom.window.fetch = (async (_path: string, init?: RequestInit) => {
    if (init?.method === 'POST') {
      posts++;
      if (delay)
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      return new Response('Revision changed', { status: 409 });
    }
    return Response.json(pack);
  }) as typeof dom.window.fetch;
  dom.window.eval(readFileSync(new URL('../src/page.js', import.meta.url), 'utf8'));
  await settle(() => !!dom.window.document.querySelector('#bSubmit'));
  return { dom, posts: () => posts, release: () => release() };
}
it('retains an interview answer after refusal and sends only one delayed request', async () => {
  const f = await room(false, true);
  try {
    const doc = f.dom.window.document;
    const input = doc.querySelector('#open') as HTMLTextAreaElement;
    expect(input.getAttribute('aria-labelledby')).toBe('current-question');
    input.value = 'My answer';
    input.dispatchEvent(new f.dom.window.Event('input'));
    const button = doc.querySelector('#bSubmit') as HTMLButtonElement;
    button.click();
    button.click();
    expect(f.posts()).toBe(1);
    expect(button.disabled).toBe(true);
    f.release();
    await settle(() => !!doc.querySelector('[role="alert"]'));
    expect((doc.querySelector('#open') as HTMLTextAreaElement).value).toBe('My answer');
    expect(doc.activeElement?.id).toBe('open');
    expect(doc.querySelector('#qhost')?.getAttribute('aria-busy')).toBe('false');
  } finally {
    f.dom.window.close();
  }
});
it('keeps choice selection and keyboard focus together inside a labeled radio group', async () => {
  const f = await room(true);
  try {
    const doc = f.dom.window.document;
    expect(doc.querySelector('[role="radiogroup"]')?.getAttribute('aria-labelledby')).toBe(
      'current-question',
    );
    const first = doc.querySelector('.opt.sel') as HTMLElement;
    first.focus();
    doc.dispatchEvent(
      new f.dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    expect(doc.activeElement?.getAttribute('data-n')).toBe('1');
    expect(doc.activeElement?.getAttribute('aria-checked')).toBe('true');
    expect(doc.querySelectorAll('.opt[tabindex="0"]')).toHaveLength(1);
    expect((doc.querySelector('#bBack') as HTMLButtonElement).disabled).toBe(true);
  } finally {
    f.dom.window.close();
  }
});
