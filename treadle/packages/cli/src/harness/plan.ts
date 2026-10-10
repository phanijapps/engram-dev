/** The plan compiler: manifest + choices → an inspectable plan.
 *  No write happens before this exists (D-2). Modes are TRUTHFUL at
 *  compile time — every mode is computed by normalized-hash
 *  comparison, so --dry-run says exactly what apply would do:
 *
 *    create  destination absent
 *    same    normalized bytes equal (extras listed if leftovers exist)
 *    update  bytes differ and --force is set
 *    refuse  bytes differ and no --force (apply exits 3) — or the
 *            destination is occupied by a directory where a file belongs
 *    skip    no source, empty source, or hooks unsupported (null wiring)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { normalizedHash } from './content.js';
import { destPath, sourceFile } from './manifest.js';
import { destRoots } from './paths.js';
import type {
  HarnessManifest,
  HookWiring,
  InstallChoices,
  Plan,
  PlanRow,
  Scope,
  Surface,
} from './types.js';

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
  if (st.isFile()) out.push(relUnder(base, abs));
  else for (const e of [...readdirSync(abs)].sort()) listFiles(join(abs, e), base, out);
  return out;
}
import { relative } from 'node:path';
function relUnder(base: string, abs: string): string {
  return relative(base, abs);
}

function modeForDir(
  sourceAbs: string,
  destAbs: string,
  force: boolean,
): { mode: PlanRow['mode']; note?: string; extras?: string[] } {
  const srcFiles = listFiles(sourceAbs);
  if (srcFiles.length === 0) return { mode: 'skip', note: 'empty source — nothing to install' }; // R2 #14
  const destExists = existsSync(destAbs);
  if (!destExists) return { mode: 'create' };
  const destFiles = statSync(destAbs).isDirectory() ? listFiles(destAbs) : [];
  const srcSet = new Set(srcFiles);
  const destSet = new Set(destFiles);
  const extras = [...destSet].filter((f) => !srcSet.has(f));
  for (const f of srcFiles) {
    const d = join(destAbs, f);
    if (!existsSync(d)) return { mode: force ? 'update' : 'refuse', extras };
    if (
      normalizedHash(readFileSync(join(sourceAbs, f), 'utf8')) !==
      normalizedHash(readFileSync(d, 'utf8'))
    ) {
      return { mode: force ? 'update' : 'refuse', extras };
    }
  }
  if (extras.length) {
    return {
      mode: 'same',
      note: `unmanaged leftover(s): ${extras.join(', ')} (--force removes exactly these)`,
      extras,
    };
  }
  return { mode: 'same' };
}

function modeForFile(sourceAbs: string, destAbs: string, force: boolean): PlanRow['mode'] {
  const destStat = existsSync(destAbs) ? statSync(destAbs) : undefined;
  if (!destStat) return 'create';
  if (destStat.isDirectory()) return 'refuse'; // R2 #8: a directory squatting on a file row
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
    if (!existsSync(sourceAbs)) {
      rows.push({
        component: c.id,
        kind: c.kind,
        surface: agent,
        source: src,
        destination: '',
        mode: 'skip',
        note: 'source missing in the harness',
      });
      continue;
    }
    const destAbs = destFor(dst, agent, scope, choices.root);
    if (statSync(sourceAbs).isDirectory()) {
      const { mode, note, extras } = modeForDir(sourceAbs, destAbs, choices.force);
      rows.push({
        component: c.id,
        kind: c.kind,
        surface: agent,
        source: src,
        destination: destAbs,
        mode,
        ...(note !== undefined ? { note } : {}),
        ...(extras !== undefined ? { extras } : {}),
      });
    } else {
      rows.push({
        component: c.id,
        kind: c.kind,
        surface: agent,
        source: src,
        destination: destAbs,
        mode: modeForFile(sourceAbs, destAbs, choices.force),
      });
    }
  }

  if (choices.hooks) {
    for (const h of manifest.hooks) {
      const w0 = h.wiring[agent];
      const wiringList: HookWiring[] =
        w0 === undefined || w0 === null ? [] : Array.isArray(w0) ? w0 : [w0];
      const w = wiringList[0]; // the first wiring decides the payload destination; every wiring lands
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
      if ((w.kind === 'extension' || w.kind === 'prompt-file') && w.dest) {
        const destAbs = destFor(w.dest, agent, scope, choices.root);
        rows.push({
          component: h.id,
          kind: 'hook',
          surface: agent,
          source: h.file,
          destination: destAbs,
          mode: modeForFile(src, destAbs, choices.force),
          ...(w.kind === 'prompt-file'
            ? { note: 'recall prompt-file (the honest codex subset)' }
            : {}),
        });
        if (w.kind === 'prompt-file') continue; // the file IS the wiring — no settings to merge
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
        // config-notify wires at user level — the payload path must be absolute;
        // settings-hooks runs from the project root — the manifest command stands
        const detail =
          w.kind === 'config-notify'
            ? `node ${destAbs}`
            : w.matcher
              ? `${w.matcher} → ${w.command}`
              : (w.command ?? '');
        wirings.push({
          surface: agent,
          kind: w.kind,
          target: wiringTarget(agent, scope, choices.root),
          detail,
        });
      }
      // additional wirings from array-valued wiring (claude multi-matcher — additive manifest)
      for (const extra of wiringList.slice(1)) {
        if (extra.kind === 'settings-hooks' && extra.matcher) {
          wirings.push({
            surface: agent,
            kind: 'settings-hooks',
            target: wiringTarget(agent, scope, choices.root),
            detail: `${extra.matcher} → ${extra.command ?? ''}`,
          });
        }
      }
    }
  }
  return { rows, wirings };
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
