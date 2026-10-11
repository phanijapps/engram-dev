/** Durable trusted roots, independent of host sessions. */
import { existsSync, readFileSync, realpathSync, statSync, lstatSync } from 'node:fs';
import { resolve, join, basename, sep, isAbsolute, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { atomicJSON, type ControlHandler } from './runtime.js';
export interface Project {
  id: string;
  label: string;
  workspace: string;
  wiki: string;
  specs: string;
}
export interface ProjectView extends Project {
  available: boolean;
  wikiAvailable: boolean;
  specsAvailable: boolean;
  error?: string;
}
interface Registry {
  format: 'projects/1';
  projects: Project[];
}
export function contained(root: string, path: string): string {
  const parent = realpathSync(root),
    child = existsSync(path) ? realpathSync(path) : resolve(path);
  const rel = relative(parent, child);
  if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel))
    throw Error('Path escapes its trusted project root');
  return child;
}
export function specsRoot(workspace: string): string {
  const canonical = join(workspace, 'specs'),
    legacy = join(workspace, 'docs/specs');
  return existsSync(canonical) || !existsSync(legacy) ? canonical : legacy;
}
function readRegistry(dir: string): Registry {
  const file = join(dir, 'projects.json');
  if (!existsSync(file)) return { format: 'projects/1', projects: [] };
  if (lstatSync(file).isSymbolicLink()) throw Error('Project registry may not be a symlink');
  const data = JSON.parse(readFileSync(file, 'utf8')) as Registry;
  if (data.format !== 'projects/1' || !Array.isArray(data.projects) || data.projects.length > 512)
    throw Error('Incompatible project registry');
  const ids = new Set<string>();
  for (const p of data.projects) {
    if (
      !p ||
      !/^[a-f\d]{24}$/.test(p.id) ||
      ids.has(p.id) ||
      typeof p.label !== 'string' ||
      p.label.length > 1000 ||
      ![p.workspace, p.wiki, p.specs].every((v) => typeof v === 'string' && isAbsolute(v))
    )
      throw Error('Malformed project registry');
    ids.add(p.id);
  }
  return data;
}
export function connectProject(dir: string, workspace: string): ProjectView {
  if (typeof workspace !== 'string' || !workspace.trim() || workspace.length > 4096)
    throw Error('Choose an explicit workspace');
  const root = realpathSync(resolve(workspace));
  if (!statSync(root).isDirectory()) throw Error('Workspace must be a directory');
  const p: Project = {
    id: createHash('sha256').update(root).digest('hex').slice(0, 24),
    label: basename(root) || root,
    workspace: root,
    wiki: contained(root, join(root, 'wiki')),
    specs: contained(root, specsRoot(root)),
  };
  const r = readRegistry(dir),
    old = r.projects.find((v) => v.id === p.id);
  if (!old && r.projects.length >= 512)
    throw Error('Project registry is full; disconnect an unused project');
  if (JSON.stringify(old) !== JSON.stringify(p)) {
    r.projects = [...r.projects.filter((v) => v.id !== p.id), p].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    atomicJSON(join(dir, 'projects.json'), r);
  }
  return projectView(p);
}
function projectView(p: Project): ProjectView {
  try {
    if (realpathSync(p.workspace) !== p.workspace || !statSync(p.workspace).isDirectory())
      throw Error('Workspace moved or unavailable');
    const wiki = contained(p.workspace, join(p.workspace, 'wiki')),
      specs = contained(p.workspace, specsRoot(p.workspace));
    return {
      ...p,
      wiki,
      specs,
      available: true,
      wikiAvailable: existsSync(wiki) && statSync(wiki).isDirectory(),
      specsAvailable: existsSync(specs) && statSync(specs).isDirectory(),
    };
  } catch (e) {
    return {
      ...p,
      available: false,
      wikiAvailable: false,
      specsAvailable: false,
      error: (e as Error).message,
    };
  }
}
export function listProjects(dir: string): ProjectView[] {
  return readRegistry(dir).projects.map(projectView);
}
export function disconnectProject(dir: string, id: string): boolean {
  const r = readRegistry(dir),
    remaining = r.projects.filter((p) => p.id !== id);
  if (remaining.length === r.projects.length) return false;
  atomicJSON(join(dir, 'projects.json'), { ...r, projects: remaining });
  return true;
}
export function projectControl(dir: string): ControlHandler {
  return (path, body) => {
    if (path === '/projects/connect') return connectProject(dir, String(body['workspace'] ?? ''));
    if (path === '/projects/list') return listProjects(dir);
    if (path === '/projects/disconnect')
      return { disconnected: disconnectProject(dir, String(body['id'] ?? '')) };
    return undefined;
  };
}
