/** The plan compiler: manifest + choices → an inspectable plan.
 *  No write happens before this exists (D-2). Modes are TRUTHFUL at
 *  compile time — every mode is computed by normalized-hash
 *  comparison, so --dry-run says exactly what apply would do:
 *
 *    create  destination absent
 *    same    normalized bytes equal
 *    update  bytes differ and --force is set
 *    refuse  bytes differ and no --force (apply exits 3)
 *    skip    no source for this surface, or hooks unsupported (null wiring)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative } from 'node:path';
import { normalizedHash } from './content.js';
import { destPath, sourceFile } from './manifest.js';
import { destRoots } from './paths.js';
import type { HarnessManifest, InstallChoices, Plan, PlanRow, Scope, Surface } from './types.js';

function stripSurfacePrefix(dest: string): string {
  return dest.replace(/^(\.pi|\.claude|\.codex)\//, '');
}

function destFor(projectDest: string, agent: Surface, scope: Scope, root: string): string {
  const roots = destRoots(agent, scope, root);
  return scope === 'project'
    ? join(root, projectDest)
    : join(roots.base, stripSurfacePrefix(projectDest));
}

function listFiles(abs: string, base = abs, out: string[] = []): string[] {
  const st = statSync(abs);
  if (st.isFile()) out.push(relative(base, abs));
  else for (const e of [...readdirSync(abs)].sort()) listFiles(join(abs, e), base, out);
  return out;
}

function modeForDir(
  sourceAbs: string,
  destAbs: string,
  force: boolean,
): { mode: PlanRow['mode']; note?: string } {
  const srcFiles = listFiles(sourceAbs);
  const destExists = existsSync(destAbs);
  if (!destExists) return { mode: 'create' };
  const destFiles =
    existsSync(destAbs) && statSync(destAbs).isDirectory() ? listFiles(destAbs) : [];
  const srcSet = new Set(srcFiles);
  const destSet = new Set(destFiles);
  const extra = [...destSet].filter((f) => !srcSet.has(f));
  for (const f of srcFiles) {
    const d = join(destAbs, f);
    if (!existsSync(d)) return { mode: force ? 'update' : 'refuse' };
    if (
      normalizedHash(readFileSync(join(sourceAbs, f), 'utf8')) !==
      normalizedHash(readFileSync(d, 'utf8'))
    ) {
      return { mode: force ? 'update' : 'refuse' };
    }
  }
  const note = extra.length
    ? `unmanaged leftover(s): ${extra.join(', ')} (--force removes exactly these)`
    : undefined;
  if (note !== undefined) return { mode: 'same', note };
  return { mode: 'same' };
}

function modeForFile(sourceAbs: string, destAbs: string, force: boolean): PlanRow['mode'] {
  if (!existsSync(destAbs)) return 'create';
  const same =
    normalizedHash(readFileSync(sourceAbs, 'utf8')) ===
    normalizedHash(readFileSync(destAbs, 'utf8'));
  if (same) return 'same';
  return force ? 'update' : 'refuse';
}

function wiringTarget(agent: Surface, scope: Scope, root: string): string {
  if (agent === 'claude') {
    const dir = scope === 'project' ? join(root, '.claude') : join(homedir(), '.claude');
    return join(dir, 'settings.json');
  }
  return join(homedir(), '.codex', 'config.toml'); // codex reads notify at user level only
}

export function compilePlan(
  manifest: HarnessManifest,
  manifestRoot: string,
  choices: InstallChoices,
): Plan {
  const { agent, scope } = choices;
  const roots = destRoots(agent, scope, choices.root);
  const rows: PlanRow[] = [];
  const wirings: Plan['wirings'] = [];

  for (const c of manifest.components) {
    if (c.kind === 'skill' && choices.skills !== 'all' && !choices.skills.includes(c.id)) continue;
    if (c.kind === 'agent' && !choices.agents) continue;
    const src = sourceFile(c, agent);
    const dst = destPath(c, agent);
    if (!src || !dst) {
      rows.push({
        component: c.id,
        kind: c.kind,
        surface: agent,
        source: '',
        destination: '',
        mode: 'skip',
        note: `no ${agent} source — honestly skipped`,
      });
      continue;
    }
    const sourceAbs = join(manifestRoot, src);
    const destAbs = destFor(dst, agent, scope, choices.root);
    if (!existsSync(sourceAbs)) {
      rows.push({
        component: c.id,
        kind: c.kind,
        surface: agent,
        source: src,
        destination: destAbs,
        mode: 'skip',
        note: 'source missing in the harness',
      });
      continue;
    }
    const st = statSync(sourceAbs);
    if (st.isDirectory()) {
      const { mode, note } = modeForDir(sourceAbs, destAbs, choices.force);
      rows.push({
        component: c.id,
        kind: c.kind,
        surface: agent,
        source: src,
        destination: destAbs,
        mode,
        ...(note !== undefined ? { note } : {}),
      });
    } else {
      rows.push({
        component: c.id,
        kind: c.kind,
        surface: agent,
        source: src,
        destination: descAbsOf(destAbs),
        mode: modeForFile(sourceAbs, destAbs, choices.force),
      });
    }
  }

  if (choices.hooks) {
    for (const h of manifest.hooks) {
      const w = h.wiring[agent];
      if (!w) {
        rows.push({
          component: h.id,
          kind: 'hook',
          surface: agent,
          source: h.file,
          destination: '',
          mode: 'skip',
          note: `hooks not supported on ${agent} — the honest no`,
        });
        continue;
      }
      const src = join(manifestRoot, h.file);
      if (!existsSync(src)) {
        rows.push({
          component: h.id,
          kind: 'hook',
          surface: agent,
          source: h.file,
          destination: '',
          mode: 'skip',
          note: 'payload not authored yet',
        });
        continue;
      }
      if (w.kind === 'extension' && w.dest) {
        const destAbs = destFor(w.dest, agent, scope, choices.root);
        rows.push({
          component: h.id,
          kind: 'hook',
          surface: agent,
          source: h.file,
          destination: destAbs,
          mode: modeForFile(src, destAbs, choices.force),
        });
      } else {
        const destAbs = join(roots.runtime, 'hooks', h.file.split('/').pop()!);
        rows.push({
          component: h.id,
          kind: 'hook',
          surface: agent,
          source: h.file,
          destination: destAbs,
          mode: modeForFile(src, destAbs, choices.force),
        });
        wirings.push({
          surface: agent,
          kind: w.kind,
          target: wiringTarget(agent, scope, choices.root),
          detail: w.matcher ? `${w.matcher} → ${w.command}` : (w.command ?? ''),
        });
      }
    }
  }
  return { rows, wirings };
}

function descAbsOf(p: string): string {
  return p;
}

export function planSummary(plan: Plan): {
  create: number;
  same: number;
  update: number;
  refuse: number;
  skip: number;
} {
  const s = { create: 0, same: 0, update: 0, refuse: 0, skip: 0 };
  for (const r of plan.rows) s[r.mode]++;
  return s;
}
