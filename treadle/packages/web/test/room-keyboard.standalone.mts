/** T-5 keyboard proof, standalone (run via tsx from the node-env test):
 *  the vitest-jsdom realm mangles cross-eval of the page's async boot;
 *  standalone tsx runs it true. Waits anchor on the QUESTION card (the
 *  loading card is also a .qcard — the race that broke v1 lives here). */
import { startRoom } from '../src/servers.ts';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const tmp = mkdtempSync(join(tmpdir(), 'kb5-'));
const d = join(tmp, 'p');
mkdirSync(d, { recursive: true });
writeFileSync(
  join(d, 'p.json'),
  JSON.stringify({
    format: 'specpack/0.3',
    name: 'p',
    revision: 1,
    title: 'Room fixture',
    spec: {
      why: 'w',
      requirements: [],
      clarifications: [
        {
          id: 'Q-1',
          question: 'pick',
          status: 'open',
          owner: 'human:owner',
          kind: 'choice',
          options: ['a', 'b'],
          default: 'a',
        },
        { id: 'Q-2', question: 'say', status: 'open', owner: 'human:owner' },
      ],
    },
    plan: {
      decisions: [
        { id: 'D-1', decision: 'd', because: 'b', status: 'accepted', accepted_by: 'human:owner' },
      ],
    },
    tasks: [],
  }),
);
const room = await startRoom(d);

const raw = readFileSync(join(WEB, 'page.html'), 'utf8');
const scripts: { src?: string; code?: string }[] = [];
const html = raw.replace(
  /<script([^>]*)>([\s\S]*?)<\/script>\s*/g,
  (_m, attrs: string, body: string) => {
    const src = /src="([^"]+)"/.exec(attrs)?.[1];
    scripts.push(src ? { src } : { code: body });
    return '';
  },
);
const dom = new JSDOM(html, { url: room.url, runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
  return fetch(new URL(url, room.url).href, init);
}) as typeof fetch;
(w as unknown as Record<string, unknown>)['INTERVIEW_CONFIG'] = { by: 'human:owner' };
for (const sc of scripts) {
  const code = sc.src ? readFileSync(join(WEB, sc.src.replace(/^\//, '')), 'utf8') : sc.code!;
  w.eval(code);
}

const wait = async (pred: () => boolean, ms = 5000): Promise<boolean> => {
  const dl = Date.now() + ms;
  while (Date.now() < dl) {
    if (pred()) return true;
    await new Promise((r) => setTimeout(r, 30));
  }
  return false;
};
const key = (k: string): void => {
  w.document.dispatchEvent(
    new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
  );
};

// the QUESTION card: an option row or a textarea — never the loading card
const questionReady = () => w.document.querySelector('.qcard .opt, .qcard textarea') !== null;
if (!(await wait(questionReady))) {
  console.error('FAIL: question card never rendered');
  process.exit(1);
}
key('Enter'); // submits the preselected default ('a')
if (!(await wait(() => (w.document.body.textContent ?? '').includes('say')))) {
  console.error('FAIL: Q-2 never appeared after Enter');
  process.exit(1);
}
const taReady = await wait(() => w.document.querySelector('.qcard textarea') !== null);
if (!taReady) {
  console.error('FAIL: no textarea for Q-2');
  process.exit(1);
}
const ta = w.document.querySelector('textarea') as HTMLTextAreaElement;
ta.value = 'keyboard answer';
key('Enter');
if (!(await wait(() => (w.document.body.textContent ?? '').toLowerCase().includes('approve')))) {
  console.error('FAIL: approve card never appeared');
  process.exit(1);
}
console.log('PASS: keyboard ceremony — Enter submits, approve card reached');
await room.close();
rmSync(tmp, { recursive: true, force: true });
