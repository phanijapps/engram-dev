/** T-5 keyboard proof, standalone (run via tsx from the node-env test):
 *  the vitest-jsdom realm mangles cross-eval of the page's async boot;
 *  outside vitest the same harness drives the real ceremony. */
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
const scripts = [];
const html = raw.replace(/<script([^>]*)>([\s\S]*?)<\/script>\s*/g, (_m, attrs, body) => {
  const src = /src="([^"]+)"/.exec(attrs)?.[1];
  scripts.push(src ? { src } : { code: body });
  return '';
});
const dom = new JSDOM(html, { url: room.url, runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  return fetch(new URL(url, room.url).href, init);
};
w.INTERVIEW_CONFIG = { by: 'human:owner' };
for (const sc of scripts) {
  const code = sc.src ? readFileSync(join(WEB, sc.src.replace(/^\//, '')), 'utf8') : sc.code;
  w.eval(code);
}
const wait = async (pred, ms = 4000) => {
  const dl = Date.now() + ms;
  while (Date.now() < dl) {
    if (pred()) return true;
    await new Promise((r) => setTimeout(r, 30));
  }
  return false;
};
const key = (k) =>
  w.document.dispatchEvent(
    new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
  );

if (!(await wait(() => w.document.querySelector('.qcard')))) {
  console.error('FAIL: no qcard at boot');
  process.exit(1);
}
key('Enter'); // submits the preselected default
if (!(await wait(() => w.document.body.textContent.includes('say')))) {
  console.error('FAIL: Q-2 never appeared');
  process.exit(1);
}
const ta = w.document.querySelector('textarea');
ta.value = 'keyboard answer';
key('Enter');
if (!(await wait(() => w.document.body.textContent.toLowerCase().includes('approve')))) {
  console.error('FAIL: approve card never appeared');
  process.exit(1);
}
console.log('PASS: keyboard ceremony — Enter submits, approve card reached');
await room.close();
rmSync(tmp, { recursive: true, force: true });
