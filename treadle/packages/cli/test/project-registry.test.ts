import { it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  connectProject,
  listProjects,
  disconnectProject,
  projectControl,
} from '../src/serve/projects.js';
import { runService, control } from '../src/serve/runtime.js';
const roots: string[] = [],
  close: (() => Promise<void>)[] = [];
const scratch = () => {
  const p = mkdtempSync(join(tmpdir(), 'project-test-'));
  roots.push(p);
  return p;
};
afterEach(async () => {
  for (const f of close.splice(0)) await f();
  for (const p of roots.splice(0)) rmSync(p, { force: true, recursive: true });
});
it('persists canonical identities and never merges canonical-empty with legacy', () => {
  const state = scratch(),
    root = scratch(),
    alias = join(scratch(), 'alias');
  mkdirSync(join(root, 'docs/specs'), { recursive: true });
  symlinkSync(root, alias, process.platform === 'win32' ? 'junction' : 'dir');
  const first = connectProject(state, root);
  expect(first.specs).toBe(join(first.workspace, 'docs/specs'));
  expect(connectProject(state, alias).id).toBe(first.id);
  expect(listProjects(state)).toHaveLength(1);
  mkdirSync(join(root, 'specs'));
  expect(listProjects(state)[0]!.specs).toBe(join(first.workspace, 'specs'));
  const second = connectProject(state, scratch());
  expect(second.id).not.toBe(first.id);
  rmSync(root, { recursive: true });
  expect(listProjects(state).find((p) => p.id === first.id)?.available).toBe(false);
  expect(disconnectProject(state, first.id)).toBe(true);
  expect(disconnectProject(state, first.id)).toBe(false);
  expect(listProjects(state)).toHaveLength(1);
});
it('refuses escaped roots, malformed state and implicit workspaces', () => {
  const state = scratch(),
    root = scratch(),
    outside = scratch();
  symlinkSync(outside, join(root, 'wiki'), process.platform === 'win32' ? 'junction' : 'dir');
  expect(() => connectProject(state, root)).toThrow('escapes');
  expect(() => connectProject(state, '')).toThrow('explicit');
  writeFileSync(join(state, 'projects.json'), '{"format":"projects/2","projects":[]}');
  expect(() => listProjects(state)).toThrow('Incompatible');
});
it('serialized control enrollment survives daemon restarts and guards project identity', async () => {
  const dir = scratch(),
    workspace = scratch();
  const h = await runService({ dir, port: 0, controlHandler: projectControl(dir) });
  close.push(h.close);
  const rows = await Promise.all(
    Array.from({ length: 5 }, () => control(h.descriptor, '/projects/connect', { workspace })),
  );
  expect(new Set(rows.map((r) => (r['result'] as { id: string }).id)).size).toBe(1);
  expect((await control(h.descriptor, '/projects/list', {}))['result']).toHaveLength(1);
  await h.close();
  const next = await runService({ dir, port: 0, controlHandler: projectControl(dir) });
  close.push(next.close);
  expect((await control(next.descriptor, '/projects/list', {}))['result']).toHaveLength(1);
});
