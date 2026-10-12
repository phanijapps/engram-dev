import { brand } from '@treadle/brand';
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
 *    skip    no source, empty source, or component unwired (null wiring)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { normalizedHash } from './content.js';
import {
  destPath,
  sourceFile,
  readCopilotHooks,
  copilotPointerConflict,
  defaultManifestPath,
} from './manifest.js';
import { planProjectGuide } from './agents-guide.js';
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

export function wiringTarget(agent: Surface, scope: Scope, root: string, kind?: string): string {
  if (kind === 'copilot-hooks') return join(root, '.github/hooks', brand.binName + '.json');
  if (kind === 'config-hooks')
    return join(
      destRoots(agent, scope, root).base,
      scope === 'project' ? '.codex/hooks.json' : 'hooks.json',
    );
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
          note: `no ${agent} wiring for this component in the manifest`,
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
        // prompt-file wiring installs the PROMPT template, not the JS payload (R2 #10)
        const srcPath = w.kind === 'prompt-file' && w.prompt ? join(manifestRoot, w.prompt) : src;
        rows.push({
          component: h.id,
          kind: 'hook',
          surface: agent,
          source: relative(manifestRoot, srcPath),
          destination: destAbs,
          mode: modeForFile(srcPath, destAbs, choices.force),
          ...(w.kind === 'prompt-file'
            ? {
                note: 'manual recall fallback; current lifecycle context requires trusted host hooks',
              }
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
        // project Codex hooks resolve their relative payload from the nearest config root
        const detail =
          w.kind === 'config-notify'
            ? `node ${destAbs}`
            : w.matcher
              ? `${w.matcher} → ${hookCommand(w, destAbs, scope, choices.root)}`
              : (w.command ?? '');
        wirings.push({
          surface: agent,
          kind: w.kind,
          target: wiringTarget(agent, scope, choices.root, w.kind),
          detail,
        });
      }
      if (w.kind !== 'prompt-file')
        for (const companion of h.companions ?? []) {
          const folder =
            w.kind === 'extension' && w.dest
              ? dirname(destFor(w.dest, agent, scope, choices.root))
              : join(roots.runtime, 'hooks');
          const destination = join(folder, basename(companion));
          rows.push({
            component: `${h.id}-support`,
            kind: 'hook',
            surface: agent,
            source: companion,
            destination,
            mode: modeForFile(join(manifestRoot, companion), destination, choices.force),
          });
        }
      // additional wirings from array-valued wiring (claude multi-matcher — additive manifest)
      for (const extra of wiringList.slice(1)) {
        if (
          (extra.kind === 'settings-hooks' ||
            extra.kind === 'config-hooks' ||
            extra.kind === 'copilot-hooks') &&
          extra.matcher
        ) {
          wirings.push({
            surface: agent,
            kind: extra.kind,
            target: wiringTarget(agent, scope, choices.root, extra.kind),
            detail: `${extra.matcher} → ${hookCommand(extra, join(roots.runtime, 'hooks', h.file.split('/').pop()!), scope, choices.root)}`,
          });
        }
      }
    }
  }
  for (const wiring of wirings.filter((w) => w.kind === 'copilot-hooks')) {
    if (!readCopilotHooks(wiring.target))
      rows.push({
        component: 'copilot-config',
        kind: 'hook',
        surface: agent,
        source: '',
        destination: wiring.target,
        mode: 'refuse',
        note: 'Malformed or unsafe Copilot hook configuration; preserve it and repair before installing',
      });
  }
  if (wirings.some((w) => w.kind === 'copilot-hooks')) {
    const pointer = join(roots.runtime, 'hooks/runtime.json');
    const conflict = copilotPointerConflict(pointer, choices.force);
    if (conflict)
      rows.push({
        component: 'copilot-runtime-pointer',
        kind: 'hook',
        surface: agent,
        source: '',
        destination: pointer,
        mode: 'refuse',
        note: conflict,
      });
  }
  const guide =
    scope === 'project' && choices.projectGuide !== false
      ? planProjectGuide(choices.root, join(dirname(defaultManifestPath()), 'templates/AGENTS.md'))
      : undefined;
  return { rows, wirings, ...(guide ? { guide } : {}) };
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
  if (plan.guide?.mode === 'refuse') s.refuse++;
  return s;
}

// A session can start below the project root. Resolve the nearest host config,
// then its relative payload; no checkout path is embedded in project wiring.
// Keep the original cwd and inherited stdin for the lifecycle callback.
const projectHookLauncher = (config: string, host: string): string =>
  [
    "const fs=require('node:fs'),p=require('node:path');",
    'let root=process.cwd();',
    `while(!fs.existsSync(p.join(root,${config
      .split('/')
      .map((part) => `'${part}'`)
      .join(',')}))){`,
    'const parent=p.dirname(root);',
    `if(parent===root)throw Error('Project ${host} hook configuration not found');`,
    'root=parent;}',
    'const hook=p.resolve(root,process.argv[1]);',
    "const result=require('node:child_process').spawnSync(process.execPath,[hook,...process.argv.slice(2)],{stdio:'inherit'});",
    'if(result.error)throw result.error;',
    'process.exit(result.status??1);',
  ].join('');

function hookCommand(w: HookWiring, path: string, scope: Scope, root: string): string {
  const suffix = (w.command ?? '')
    .replace(/^node\s+\S+/, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (w.kind === 'copilot-hooks') {
    const payload = relative(root, path).split('\\').join('/');
    const args = ['node', payload, ...suffix];
    const quote = (value: string): string => "'" + value.replaceAll("'", "'\"'\"'") + "'";
    return JSON.stringify({
      type: 'command',
      bash: args.map(quote).join(' '),
      powershell: '& ' + args.map((s) => "'" + s.replaceAll("'", "''") + "'").join(' '),
      cwd: '.',
      timeoutSec: 60,
    });
  }
  if (w.kind === 'settings-hooks')
    return JSON.stringify({
      type: 'command',
      command: scope === 'project' ? 'node' : process.execPath,
      args:
        scope === 'project'
          ? [
              '-e',
              projectHookLauncher('.claude/settings.json', 'Claude'),
              '--',
              relative(root, path).split('\\').join('/'),
              ...suffix,
            ]
          : [path, ...suffix],
    });
  const quote = (s: string): string => "'" + s.replaceAll("'", "'" + '"' + "'" + '"' + "'") + "'";
  const argv =
    scope === 'project'
      ? [
          'node',
          '-e',
          projectHookLauncher('.codex/hooks.json', 'Codex'),
          '--',
          relative(root, path).split('\\').join('/'),
          ...suffix,
        ]
      : [process.execPath, path, ...suffix];
  return JSON.stringify({
    type: 'command',
    command: argv.map(quote).join(' '),
    commandWindows: argv.map((s) => '"' + s.replaceAll('"', '\\"') + '"').join(' '),
  });
}
