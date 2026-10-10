import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  type Stats,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { normalize } from './content.js';
import { destRoots } from './paths.js';
import type { InstallChoices, Plan, PlanRow } from './types.js';

export const STATE_FILE = 'harness-install.json';

interface WiringRecord {
  target: string;
  kind: 'settings-hooks' | 'config-notify';
  matcher: string;
  command: string;
}

interface StateDoc {
  format: 'harness/0.1';
  agent: string;
  scope: string;
  written: string[];
  wirings: WiringRecord[];
  at: string;
}

export interface ApplyResult {
  written: number;
  refused: PlanRow[];
  wiringNotes: string[];
}

function stat(p: string): Stats | undefined {
  try {
    return statSync(p);
  } catch {
    return undefined;
  }
}

function listRel(abs: string, base = abs, out: string[] = []): string[] {
  const st = statSync(abs);
  if (st.isFile()) out.push(relative(base, abs));
  else if (st.isDirectory())
    for (const e of [...readdirSync(abs)].sort()) listRel(join(abs, e), base, out);
  return out;
}

function copyTree(sourceAbs: string, destAbs: string, written: string[]): void {
  const st = stat(sourceAbs);
  if (!st) return;
  if (st.isFile()) {
    mkdirSync(dirname(destAbs), { recursive: true });
    writeFileSync(destAbs, normalize(readFileSync(sourceAbs, 'utf8')));
    written.push(destAbs);
    return;
  }
  for (const f of listRel(sourceAbs)) copyTree(join(sourceAbs, f), join(destAbs, f), written);
}

export function statePath(choices: InstallChoices): string {
  const roots = destRoots(choices.agent, choices.scope, choices.root);
  return join(roots.state, STATE_FILE);
}

export function applyPlan(
  plan: Plan,
  choices: InstallChoices,
  manifestRoot: string,
  at: string,
): ApplyResult {
  const refused: PlanRow[] = [];
  const written: string[] = [];
  for (const row of plan.rows) {
    if (row.mode === 'skip') continue;
    if (row.mode === 'refuse') {
      refused.push(row);
      continue;
    }
    copyTree(join(manifestRoot, row.source), row.destination, written);
  }
  const wiringRecords: WiringRecord[] = [];
  const wiringNotes: string[] = [];
  if (refused.length === 0) {
    for (const w of plan.wirings) {
      if (w.kind === 'settings-hooks') {
        const rec = mergeClaudeSettings(w.target, w.detail);
        if (rec) {
          wiringRecords.push(rec);
          wiringNotes.push(`wired ${w.target} (${rec.matcher} → ${rec.command})`);
        }
      } else if (w.kind === 'config-notify') {
        const rec = setCodexNotify(w.target, w.detail);
        if (rec) {
          wiringRecords.push(rec);
          wiringNotes.push(`wired ${w.target} (notify)`);
        }
      }
    }
  }
  if (refused.length === 0 && (written.length > 0 || wiringRecords.length > 0)) {
    mkdirSync(dirname(statePath(choices)), { recursive: true });
    const doc: StateDoc = {
      format: 'harness/0.1',
      agent: choices.agent,
      scope: choices.scope,
      written,
      wirings: wiringRecords,
      at,
    };
    writeFileSync(statePath(choices), JSON.stringify(doc, null, 2) + '\n');
  }
  return { written: written.length, refused, wiringNotes };
}

function mergeClaudeSettings(target: string, detail: string): WiringRecord | undefined {
  const [matcher, command] = detail.split(' → ');
  if (!matcher || !command) return undefined;
  let doc: Record<string, unknown> = {};
  if (existsSync(target)) {
    try {
      doc = JSON.parse(readFileSync(target, 'utf8')) as Record<string, unknown>;
    } catch {
      return undefined; // foreign settings file — refuse silently upward (plan said create/merge)
    }
  }
  const hooks = (doc['hooks'] as Record<string, unknown[]> | undefined) ?? (doc['hooks'] = {});
  const entries =
    (hooks[matcher] as { hooks: { type: string; command: string }[] }[] | undefined) ??
    (hooks[matcher] = []);
  const already = entries.some((e) => e.hooks?.some((h) => h.command === command));
  if (!already) entries.push({ hooks: [{ type: 'command', command }] });
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(doc, null, 2) + '\n');
  return { target, kind: 'settings-hooks', matcher, command };
}

function setCodexNotify(target: string, command: string): WiringRecord | undefined {
  let text = existsSync(target) ? readFileSync(target, 'utf8') : '';
  const line = `notify = ["node", "${command.replace(/^node /, '')}"]`;
  if (/^notify\s*=/m.test(text)) text = text.replace(/^notify\s*=.*$/m, line);
  else text = (text.endsWith('\n') || text === '' ? text : text + '\n') + line + '\n';
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
  return { target, kind: 'config-notify', matcher: 'notify', command: line };
}

export interface RemoveResult {
  removed: string[];
  unwired: string[];
}

/** --remove: delete exactly what the recorded plan wrote, undo wiring
 *  edits, remove the state file. Nothing else. */
export function removeInstall(choices: InstallChoices): RemoveResult {
  const sp = statePath(choices);
  if (!existsSync(sp)) throw new Error(`no recorded install at ${sp} — nothing to remove`);
  const doc = JSON.parse(readFileSync(sp, 'utf8')) as StateDoc;
  const removed: string[] = [];
  for (const p of [...doc.written].sort().reverse()) {
    if (existsSync(p)) {
      rmSync(p);
      removed.push(p);
    }
  }
  const unwired: string[] = [];
  for (const w of doc.wirings) {
    if (w.kind === 'settings-hooks') {
      if (existsSync(w.target)) {
        try {
          const d = JSON.parse(readFileSync(w.target, 'utf8')) as Record<string, unknown>;
          const hooks = d['hooks'] as
            Record<string, { hooks: { command: string }[] }[]> | undefined;
          const entries = hooks?.[w.matcher];
          if (entries) {
            hooks[w.matcher] = entries
              .map((e) => ({ hooks: (e.hooks ?? []).filter((h) => h.command !== w.command) }))
              .filter((e) => e.hooks.length > 0);
            if ((hooks[w.matcher] ?? []).length === 0) delete hooks[w.matcher];
            if (Object.keys(hooks).length === 0) delete d['hooks'];
            writeFileSync(w.target, JSON.stringify(d, null, 2) + '\n');
            unwired.push(w.target);
          }
        } catch {
          // foreign file now — leave it; --remove deletes only what we wrote
        }
      }
    } else if (w.kind === 'config-notify') {
      if (existsSync(w.target)) {
        const text = readFileSync(w.target, 'utf8');
        const without = text
          .split('\n')
          .filter((l) => l.trim() !== w.command.trim())
          .join('\n');
        if (without !== text) {
          writeFileSync(w.target, without);
          unwired.push(w.target);
        }
      }
    }
  }
  // prune empty dirs we created (only if empty — never foreign content)
  const roots = destRoots(choices.agent, choices.scope, choices.root);
  for (const p of removed) {
    let dir = dirname(p);
    while (dir.startsWith(roots.base) && dir !== roots.base) {
      try {
        if (readdirSync(dir).length === 0) {
          rmSync(dir);
          dir = dirname(dir);
        } else break;
      } catch {
        break;
      }
    }
  }
  rmSync(sp);
  return { removed, unwired };
}
