import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { savePack } from '@treadle/core';
import { brand } from '@treadle/brand';
import { JSDOM } from 'jsdom';
import { startProjects, type ProjectSource } from '../src/project-server.js';
export function projectFixture() {
  const root = mkdtempSync(join(tmpdir(), 'project-ui-'));
  const projects: ProjectSource[] = ['a', 'b'].map((name, n) => {
    const workspace = join(root, name),
      wiki = join(workspace, 'wiki'),
      specs = join(workspace, 'specs');
    mkdirSync(join(specs, 'same'), { recursive: true });
    mkdirSync(wiki);
    writeFileSync(
      join(wiki, 'guide.md'),
      `---\ntitle: ${name} knowledge\ntype: concept\ndescription: local rules\n---\n${name} exclusive content`,
    );
    savePack(
      {
        format: 'specpack/0.3',
        name: 'same',
        title: name + ' spec',
        spec: { requirements: [], clarifications: [] },
        plan: { decisions: [] },
        tasks: [],
      },
      join(specs, 'same', 'same.json'),
      { at: new Date().toISOString() },
    );
    return {
      id: String(n + 1).repeat(24),
      label: name,
      workspace,
      wiki,
      specs,
      available: true,
      wikiAvailable: true,
      specsAvailable: true,
    };
  });
  return { root, projects };
}
it('renders public branding and current CLI guidance in an empty project browser', async () => {
  const ui = await startProjects(() => []);
  const dom = new JSDOM(await (await fetch(ui.url)).text(), {
    url: ui.url,
    runScripts: 'outside-only',
  });
  try {
    dom.window.fetch = ((path: string) => fetch(new URL(path, ui.url))) as typeof fetch;
    dom.window.eval(await (await fetch(ui.url + 'projects.js')).text());
    for (
      let i = 0;
      i < 100 &&
      !dom.window.document.getElementById('status')!.textContent!.includes('project connect');
      i++
    )
      await new Promise((r) => setTimeout(r, 10));
    expect(dom.window.document.title).toContain(brand.name);
    expect(dom.window.document.querySelector('h1')!.textContent).toContain(brand.name);
    expect(dom.window.document.getElementById('status')!.textContent).toContain(
      `${brand.binName} project connect`,
    );
  } finally {
    dom.window.close();
    await ui.close();
  }
});
it('isolates equal spec/concept slugs and preserves existing library routes', async () => {
  const { root, projects } = projectFixture();
  const ui = await startProjects(() => projects);
  try {
    expect(await (await fetch(ui.url + 'branding')).json()).toEqual({
      name: brand.name,
      command: brand.binName,
    });
    expect(await (await fetch(ui.url + 'projects')).json()).toHaveLength(2);
    for (const p of projects) {
      const base = `${ui.url}projects/${p.id}`;
      const rows = await (await fetch(base + '/library/specs')).json();
      expect(rows.specs[0].title).toBe(p.label + ' spec');
      expect((await (await fetch(base + '/wiki/search?q=exclusive')).json())[0].title).toBe(
        p.label + ' knowledge',
      );
      expect(await (await fetch(base + '/wiki/read?cid=guide')).text()).toContain(
        p.label + ' exclusive content',
      );
      const html = await (await fetch(base + '/library/')).text();
      expect(html).toContain('"safeMarkdown":true');
      const page = new JSDOM(html);
      expect(page.window.document.title).toBe(brand.name);
      expect(page.window.document.querySelector('h1')!.textContent).toBe(brand.name);
      page.window.close();
    }
    projects[0]!.available = false;
    expect((await fetch(ui.url + `projects/${projects[0]!.id}/library/specs`)).status).toBe(409);
  } finally {
    await ui.close();
    rmSync(root, { recursive: true, force: true });
  }
});
