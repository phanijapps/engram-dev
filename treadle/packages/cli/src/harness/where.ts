/** `do where` — the recall core: where does work dangle? Scans live
 *  specs roots (the archive is never listed) and every git worktree
 *  that carries its own specs. Engine-quoted lines only; a report,
 *  not a gate — exit 0 always. */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadPackWithMeta } from '@treadle/core';

interface PackDocLike {
  name?: string;
  revision?: number;
  deliverable?: string;
  status?: unknown;
  spec: { clarifications?: { status?: string }[] };
  tasks?: { id: string; status?: string; needs?: string[]; evidence?: { at?: string }[] }[];
}

export interface PackRow {
  name: string;
  path: string;
  stage: string;
  openQuestions: number;
  nextTask: string | null;
  revision: number | null;
  lastEvidenceAt: string | null;
  tree: string; // which checkout this row came from ('' = the given root)
}

export interface WhereReport {
  root: string;
  packs: PackRow[];
  worktrees: { path: string; packs: PackRow[] }[];
  worktreesUnavailable?: string;
}

function scanSpecsDir(dir: string, tree: string): PackRow[] {
  const rows: PackRow[] = [];
  if (!existsSync(dir)) return rows;
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (!e.isDirectory() || e.name === 'archive') continue; // archive is frozen history — never listed
    const packDir = join(dir, e.name);
    const json = join(packDir, `${e.name}.json`);
    if (!existsSync(json)) continue;
    const v = loadPackWithMeta(packDir);
    const loaded = v as { ok: boolean; value?: { doc: PackDocLike } };
    if (!loaded.ok || !loaded.value) {
      rows.push({
        name: e.name,
        path: packDir,
        stage: 'refused',
        openQuestions: 0,
        nextTask: null,
        revision: null,
        lastEvidenceAt: null,
        tree,
      });
      continue;
    }
    const doc = loaded.value.doc;
    const openQuestions = (doc.spec.clarifications ?? []).filter(
      (q: { status?: string }) => q.status === 'open',
    ).length;
    const ready = readyTask(doc);
    const lastEvidence = lastEvidenceAt(doc);
    rows.push({
      name: doc.name ?? e.name,
      path: packDir,
      // the deliverable stage lives flat or nested depending on which writer touched the pack last — read both, honestly
      stage: String(
        doc.deliverable ??
          (doc.status as { deliverable?: string } | undefined)?.deliverable ??
          'unknown',
      ),
      openQuestions,
      nextTask: ready,
      revision: doc.revision ?? null,
      lastEvidenceAt: lastEvidence,
      tree,
    });
  }
  return rows;
}

function readyTask(doc: {
  tasks?: { id: string; status?: string; needs?: string[] }[];
}): string | null {
  const tasks = doc.tasks ?? [];
  const done = new Set(tasks.filter((t) => t.status === 'done').map((t) => t.id));
  for (const t of tasks) {
    if (t.status !== 'todo') continue;
    if ((t.needs ?? []).every((n) => done.has(n))) return t.id;
  }
  return null;
}

function lastEvidenceAt(doc: { tasks?: { evidence?: { at?: string }[] }[] }): string | null {
  let last: string | null = null;
  for (const t of doc.tasks ?? []) {
    for (const e of t.evidence ?? []) {
      if (e.at && (!last || e.at > last)) last = e.at;
    }
  }
  return last;
}

function canonicalPath(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return resolve(path);
  }
}

export function where(workspace: string): WhereReport {
  const root = canonicalPath(workspace); // Include native aliases and Windows short paths.
  const packs = scanSpecsDir(specsRoot(root), '');
  const report: WhereReport = { root, packs, worktrees: [] };
  try {
    const out = execSync('git worktree list --porcelain', { cwd: root, encoding: 'utf8' });
    const trees = out
      .split(/\r?\n/)
      .filter((l) => l.startsWith('worktree '))
      .map((l) => canonicalPath(l.slice('worktree '.length)))
      .filter((p) => p !== root);
    for (const p of trees) {
      const treePacks = scanSpecsDir(specsRoot(p), p);
      report.worktrees.push({ path: p, packs: treePacks });
    }
  } catch {
    report.worktreesUnavailable = 'no git — worktree scan unavailable';
  }
  return report;
}

/** Canonical-empty is intentional: never merge it with a second work root.
 * Legacy-only external checkouts remain readable during their migration. */
function specsRoot(workspace: string): string {
  const canonical = join(workspace, 'specs');
  return existsSync(canonical) ? canonical : join(workspace, 'docs', 'specs');
}

const OPEN_STAGES = new Set([
  'awaiting_owner',
  'planning',
  'drafted',
  'in_progress',
  'in_review',
  'blocked',
]); // the frozen vocabulary incl. blocked (R2 #6)
export function isOpen(row: PackRow): boolean {
  return OPEN_STAGES.has(row.stage) || row.stage === 'refused';
}

/** The recall block — engine-quoted lines only, never memory. */
export function recallBlock(report: WhereReport): string {
  const all = [...report.packs, ...report.worktrees.flatMap((w) => w.packs)];
  const open = all.filter(isOpen);
  const lines: string[] = [];
  lines.push(
    open.length > 0
      ? `work in flight (${open.length}):`
      : 'nothing in flight — every spec is delivered or closed.',
  );
  for (const r of open) {
    const bits = [r.name.padEnd(14), r.stage];
    if (r.openQuestions > 0) bits.push(`Q open: ${r.openQuestions}`);
    if (r.nextTask) bits.push(`next: ${r.nextTask}`);
    if (r.revision !== null) bits.push(`rev ${r.revision}`);
    if (r.lastEvidenceAt) bits.push(`evidence ${r.lastEvidenceAt.slice(0, 10)}`); // FR-1: the human surface too (R2 #12)
    if (r.tree) bits.push(`(${r.tree})`);
    lines.push('  ' + bits.join('  ').trim());
  }
  if (open.length > 1) {
    lines.push('more than one is open: ASK which one continues. never guess.');
  }
  return lines.join('\n');
}
