import { it, expect } from 'vitest';
import { mkdirSync, writeFileSync, symlinkSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { request } from 'node:http';
import { startProjects } from '../src/project-server.js';
import { projectFixture } from './project-library.test.js';
it('rejects privilege routes, forged hosts, cross-origin/CSRF writes and filesystem escapes', async () => {
  const { root, projects } = projectFixture();
  const p = projects[0]!;
  mkdirSync(join(p.wiki, '.okf'));
  mkdirSync(join(p.wiki, 'archive'));
  for (const f of ['.okf/secret.md', 'archive/old.md'])
    writeFileSync(join(p.wiki, f), '---\ntitle: secret\n---\nprivate');
  writeFileSync(join(root, 'secret.md'), 'private outside');
  symlinkSync(join(root, 'secret.md'), join(p.wiki, 'escape.md'));
  symlinkSync(join(root, 'secret.md'), join(p.specs, 'same', 'evil.md'));
  const ui = await startProjects(() => projects);
  const base = ui.url + `projects/${p.id}`;
  try {
    expect((await fetch(ui.url + 'shutdown', { method: 'POST' })).status).toBe(403);
    expect((await fetch(ui.url + 'projects/connect')).status).toBe(404);
    const wiki = await (await fetch(base + '/wiki')).json();
    expect(wiki.map((v: { cid: string }) => v.cid)).toEqual(['guide']);
    for (const cid of ['../secret', '.okf/secret', 'archive/old', 'escape'])
      expect((await fetch(base + '/wiki/read?cid=' + encodeURIComponent(cid))).status).toBe(404);
    expect((await fetch(base + '/library/artifact/same/evil.md')).status).toBe(404);
    const html = await (await fetch(base + '/library/')).text();
    const token = /"ownerToken":"([a-f\d]+)"/.exec(html)![1]!;
    for (const headers of [
      {},
      { Origin: 'http://evil.test', 'X-Owner-Token': token },
      { Origin: ui.url.slice(0, -1) },
    ]) {
      expect(
        (
          await fetch(base + '/library/event/same', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: '{}',
          })
        ).status,
      ).toBe(403);
    }
    const status = await new Promise<number>((done) => {
      const r = request(ui.url, { headers: { Host: 'evil.test' } }, (res) => {
        res.resume();
        done(res.statusCode!);
      });
      r.end();
    });
    expect(status).toBe(403);
    const js = readFileSync(new URL('../src/library.js', import.meta.url), 'utf8');
    expect(js).toContain("frame.setAttribute('sandbox', '')");
    expect(js).not.toContain('allow-same-origin');
    // Missing roots created after enrollment cannot become external read authority.
    rmSync(p.wiki, { recursive: true });
    symlinkSync(root, p.wiki, process.platform === 'win32' ? 'junction' : 'dir');
    expect((await fetch(base + '/wiki')).status).toBe(403);
  } finally {
    await ui.close();
    rmSync(root, { recursive: true, force: true });
  }
});
