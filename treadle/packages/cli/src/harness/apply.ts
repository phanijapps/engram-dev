/** Apply: writes exactly the plan, records what it wrote, and reverses
 *  on demand. Never deletes unknown files except the EXACT leftovers
 *  the plan listed, under --force (R2 #2). Global writes are the
 *  caller's gate (--yes, D-7). One state record per agent (R2 #1). */
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
import { dirname, join } from 'node:path';
import { runtimeEntry } from '../serve/runtime.js';
import { normalize } from './content.js';
import { readCopilotHooks } from './manifest.js';
import { destRoots } from './paths.js';
import { wiringTarget } from './plan.js';
import type { InstallChoices, Plan, PlanRow } from './types.js';

const stateName = (agent: string): string => `harness-install.${agent}.json`;

interface WiringRecord {
  target: string;
  kind: 'settings-hooks' | 'config-notify' | 'config-hooks' | 'copilot-hooks';
  created?: boolean;
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
  removedLeftovers: string[];
  refused: PlanRow[];
  wiringNotes: string[];
  wiringRefused: string[];
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
import { relative } from 'node:path';

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
  return join(roots.state, stateName(choices.agent)); // one record per agent — never clobbered (R2 #1)
}

export function applyPlan(
  plan: Plan,
  choices: InstallChoices,
  manifestRoot: string,
  at: string,
): ApplyResult {
  const previous = existsSync(statePath(choices))
    ? (JSON.parse(readFileSync(statePath(choices), 'utf8')) as StateDoc)
    : undefined;
  if (
    previous &&
    (previous.format !== 'harness/0.1' ||
      previous.agent !== choices.agent ||
      previous.scope !== choices.scope ||
      !Array.isArray(previous.written) ||
      !Array.isArray(previous.wirings))
  )
    throw Error('Incompatible install record; inspect it before updating');
  for (const w of previous?.wirings ?? [])
    if (w.target !== wiringTarget(choices.agent, choices.scope, choices.root, w.kind))
      throw Error('Install record has an unexpected wiring target');
  if (choices.agent === 'copilot' && choices.hooks) {
    const invalid = plan.wirings.filter(
      (w) => w.kind === 'copilot-hooks' && !readCopilotHooks(w.target),
    );
    const refused = plan.rows.filter((r) => r.mode === 'refuse');
    const pointer = join(
      destRoots(choices.agent, choices.scope, choices.root).runtime,
      'hooks/runtime.json',
    );
    const desired =
      JSON.stringify(
        { format: 'runtime-pointer/1', node: process.execPath, entry: runtimeEntry(), protocol: 1 },
        null,
        2,
      ) + '\n';
    const pointerConflict =
      existsSync(pointer) && readFileSync(pointer, 'utf8') !== desired && !choices.force;
    if (invalid.length || refused.length || pointerConflict)
      return {
        written: 0,
        removedLeftovers: [],
        refused,
        wiringNotes: [],
        wiringRefused: [
          ...invalid.map(
            (w) =>
              `${w.target}: malformed or unsafe Copilot configuration; repair before installing`,
          ),
          ...(pointerConflict ? ['Runtime pointer differs; inspect it before using --force'] : []),
        ],
      };
  }
  const refused: PlanRow[] = [];
  const written: string[] = [];
  const removedLeftovers: string[] = [];
  for (const row of plan.rows) {
    if (row.mode === 'skip') continue;
    if (row.mode === 'refuse') {
      refused.push(row);
      continue;
    }
    // R2 #2: --force removes exactly the listed unmanaged leftovers — the note finally tells the truth
    if (choices.force && row.extras) {
      for (const extra of row.extras)
        rmSync(join(row.destination, extra), { force: true, recursive: true });
      removedLeftovers.push(...row.extras.map((e) => join(row.destination, e)));
    }
    copyTree(join(manifestRoot, row.source), row.destination, written);
  }
  const wiringRecords: WiringRecord[] = [];
  const wiringNotes: string[] = [];
  const wiringRefused: string[] = [];
  if (refused.length === 0) {
    for (const w of plan.wirings) {
      if (w.kind === 'copilot-hooks') {
        const [matcher, command] = w.detail.split(' → ');
        const doc = readCopilotHooks(w.target);
        if (!doc || !matcher || !command) {
          wiringRefused.push(`${w.target}: Copilot hook configuration refused`);
          continue;
        }
        const created =
          !existsSync(w.target) ||
          previous?.wirings.some((old) => old.target === w.target && old.created === true) ||
          wiringRecords.some((old) => old.target === w.target && old.created === true);
        const definition: unknown = JSON.parse(command);
        const entries = doc.hooks[matcher] ?? (doc.hooks[matcher] = []);
        const present = entries.some((entry) => sameDefinition(entry, definition));
        const owned = previous?.wirings.some(
          (old) =>
            old.target === w.target &&
            old.matcher === matcher &&
            sameDefinition(JSON.parse(old.command), definition),
        );
        if (!present) {
          entries.push(definition);
          mkdirSync(dirname(w.target), { recursive: true });
          writeFileSync(w.target, JSON.stringify(doc, null, 2) + '\n');
        }
        // An identical pre-existing foreign definition is usable, but remains unowned.
        if (!present || owned)
          wiringRecords.push({ target: w.target, kind: w.kind, matcher, command, created });
        wiringNotes.push(
          `wired ${w.target} (${matcher}${present && !owned ? '; existing foreign entry retained' : ''})`,
        );
      } else if (w.kind === 'settings-hooks' || w.kind === 'config-hooks') {
        const rec = mergeClaudeSettings(w.target, w.detail, w.kind);
        if (rec) {
          wiringRecords.push(rec);
          wiringNotes.push(`wired ${w.target} (${rec.matcher} → ${rec.command})`);
        } else {
          wiringRefused.push(
            `${w.target}: settings.json holds unparseable content — wiring refused, nothing overwritten (fix the file or move it aside)`,
          );
        }
      } else if (w.kind === 'config-notify') {
        const rec = setCodexNotify(w.target, w.detail);
        if (rec) {
          wiringRecords.push(rec);
          wiringNotes.push(`wired ${w.target} (notify)`);
        } else {
          wiringRefused.push(`${w.target}: config.toml unwritable — notify refused`);
        }
      }
    }
  }
  if (
    refused.length === 0 &&
    wiringRefused.length === 0 &&
    choices.hooks &&
    plan.rows.some((r) => r.kind === 'hook' && r.mode !== 'skip')
  ) {
    const roots = destRoots(choices.agent, choices.scope, choices.root);
    const folder =
      choices.agent === 'pi'
        ? join(roots.base, choices.scope === 'project' ? '.pi/extensions' : 'extensions')
        : join(roots.runtime, 'hooks');
    const pointer = join(folder, 'runtime.json');
    const value =
      JSON.stringify(
        { format: 'runtime-pointer/1', node: process.execPath, entry: runtimeEntry(), protocol: 1 },
        null,
        2,
      ) + '\n';
    if (existsSync(pointer) && readFileSync(pointer, 'utf8') !== value && !choices.force)
      wiringRefused.push('Runtime pointer differs; inspect it before using --force');
    else {
      mkdirSync(folder, { recursive: true });
      writeFileSync(pointer, value);
      written.push(pointer);
    }
  }
  if (
    refused.length === 0 &&
    wiringRefused.length === 0 &&
    (written.length > 0 || wiringRecords.length > 0)
  ) {
    if (choices.hooks)
      for (const old of previous?.wirings ?? [])
        if (!wiringRecords.some((current) => JSON.stringify(current) === JSON.stringify(old)))
          unwireRecorded(old);
    mkdirSync(dirname(statePath(choices)), { recursive: true });
    const doc: StateDoc = {
      format: 'harness/0.1',
      agent: choices.agent,
      scope: choices.scope,
      // Partial component updates retain ownership of earlier installed files.
      written: [...new Set([...(previous?.written ?? []), ...written])],
      wirings: choices.hooks ? wiringRecords : [...(previous?.wirings ?? []), ...wiringRecords],
      at,
    };
    writeFileSync(statePath(choices), JSON.stringify(doc, null, 2) + '\n');
  }
  return { written: written.length, removedLeftovers, refused, wiringNotes, wiringRefused };
}

function mergeClaudeSettings(
  target: string,
  detail: string,
  kind: WiringRecord['kind'] = 'settings-hooks',
): WiringRecord | null {
  const [matcher, command] = detail.split(' → ');
  if (!matcher || !command) return null;
  let doc: Record<string, unknown> = {};
  if (existsSync(target)) {
    try {
      doc = JSON.parse(readFileSync(target, 'utf8')) as Record<string, unknown>;
    } catch {
      return null; // foreign settings file — the caller reports the refusal (R2 #10)
    }
  }
  if (
    !doc ||
    typeof doc !== 'object' ||
    Array.isArray(doc) ||
    (doc['hooks'] !== undefined &&
      (!doc['hooks'] || typeof doc['hooks'] !== 'object' || Array.isArray(doc['hooks'])))
  )
    return null;
  const hooks = (doc['hooks'] as Record<string, unknown[]> | undefined) ?? (doc['hooks'] = {});
  const entries =
    (hooks[matcher] as { hooks: { type: string; command: string }[] }[] | undefined) ??
    (hooks[matcher] = []);
  if (
    !Array.isArray(entries) ||
    entries.some(
      (e) => !e || typeof e !== 'object' || (e.hooks !== undefined && !Array.isArray(e.hooks)),
    )
  )
    return null;
  const definition = command.startsWith('{')
    ? (JSON.parse(command) as { type: string; command: string; args?: string[] })
    : { type: 'command', command };
  const already = entries.some((e) =>
    e.hooks?.some((h) => JSON.stringify(h) === JSON.stringify(definition)),
  );
  if (!already) entries.push({ hooks: [definition] });
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(doc, null, 2) + '\n');
  return { target, kind, matcher, command };
}

function setCodexNotify(target: string, command: string): WiringRecord | null {
  let text = existsSync(target) ? readFileSync(target, 'utf8') : '';
  // forward slashes: valid on every OS and safe inside TOML basic strings (R2 #16)
  const arg = command
    .replace(/^node /, '')
    .split('\\')
    .join('/');
  const line = `notify = ["node", "${arg}"]`;
  if (/^notify\s*=/m.test(text)) {
    if (!text.split('\n').some((l) => l === line)) return null;
  } else text = (text.endsWith('\n') || text === '' ? text : text + '\n') + line + '\n';
  mkdirSync(dirname(target), { recursive: true });
  try {
    writeFileSync(target, text);
  } catch {
    return null;
  }
  return { target, kind: 'config-notify', matcher: 'notify', command: line };
}

function unwireRecorded(w: WiringRecord): boolean {
  if (w.kind === 'copilot-hooks') {
    const doc = readCopilotHooks(w.target);
    if (!doc) return false;
    const entries = doc.hooks[w.matcher];
    if (!entries) return false;
    const kept = entries.filter((entry) => !sameDefinition(entry, JSON.parse(w.command)));
    if (kept.length === entries.length) return false;
    if (kept.length) doc.hooks[w.matcher] = kept;
    else delete doc.hooks[w.matcher];
    if (
      w.created &&
      Object.keys(doc.hooks).length === 0 &&
      Object.keys(doc).every((key) => ['version', 'hooks'].includes(key))
    )
      rmSync(w.target);
    else writeFileSync(w.target, JSON.stringify(doc, null, 2) + '\n');
    return true;
  } else if (w.kind === 'settings-hooks' || w.kind === 'config-hooks') {
    if (existsSync(w.target)) {
      try {
        const d = JSON.parse(readFileSync(w.target, 'utf8')) as Record<string, unknown>;
        const hooks = d['hooks'] as Record<string, { hooks: { command: string }[] }[]> | undefined;
        const entries = hooks?.[w.matcher];
        if (entries) {
          hooks[w.matcher] = entries
            .map((e) => ({
              ...e,
              hooks: (e.hooks ?? []).filter((h) =>
                w.command.startsWith('{')
                  ? JSON.stringify(h) !== w.command
                  : h.command !== w.command,
              ),
            }))
            .filter((e) => e.hooks.length > 0);
          if ((hooks[w.matcher] ?? []).length === 0) delete hooks[w.matcher];
          if (Object.keys(hooks).length === 0) delete d['hooks'];
          writeFileSync(w.target, JSON.stringify(d, null, 2) + '\n');
          return true;
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
        return true;
      }
    }
  }
  return false;
}

export interface RemoveResult {
  removed: string[];
  unwired: string[];
}

/** --remove: delete exactly what the recorded plan wrote, undo wiring
 *  edits, remove the state file. Nothing else — and nothing outside
 *  the install roots, even if the state file says so (R2 #6). */
export function removeInstall(choices: InstallChoices): RemoveResult {
  const sp = statePath(choices);
  if (!existsSync(sp)) throw new Error(`no recorded install at ${sp} — nothing to remove`);
  const doc = JSON.parse(readFileSync(sp, 'utf8')) as StateDoc;
  const roots = destRoots(choices.agent, choices.scope, choices.root);
  if (choices.agent === 'copilot')
    for (const w of doc.wirings) {
      if (
        w.kind !== 'copilot-hooks' ||
        w.target !== wiringTarget(choices.agent, choices.scope, choices.root, w.kind)
      )
        throw Error('Install record has an unexpected Copilot wiring target');
      if (existsSync(w.target) && !readCopilotHooks(w.target))
        throw Error('Malformed or unsafe Copilot configuration; repair it before removal');
    }
  const sep = String.fromCharCode(92); // backslash, escaped for windows paths
  const insideRoots = (p: string): boolean =>
    p === roots.base ||
    p.startsWith(roots.base + '/') ||
    p.startsWith(roots.base + sep) ||
    p.startsWith(roots.runtime + '/') ||
    p.startsWith(roots.runtime + sep);
  const tampered: string[] = [];
  const removed: string[] = [];
  const shared = new Set<string>();
  for (const f of readdirSync(roots.state).filter(
    (f) => /^harness-install\..+\.json$/.test(f) && join(roots.state, f) !== sp,
  )) {
    const other = JSON.parse(readFileSync(join(roots.state, f), 'utf8')) as StateDoc;
    for (const file of other.written ?? []) shared.add(file);
  }
  for (const p of [...new Set(doc.written)].sort().reverse()) {
    if (shared.has(p)) continue;
    if (!insideRoots(p)) {
      tampered.push(p); // the state file is data — data never arms deletion outside the roots
      continue;
    }
    if (existsSync(p)) {
      rmSync(p);
      removed.push(p);
    }
  }
  if (tampered.length) {
    throw new Error(
      `state file lists paths outside the install roots — refusing to remove (tampered?): ${tampered.join(', ')}`,
    );
  }
  const unwired: string[] = [];
  for (const w of doc.wirings) {
    if (w.target !== wiringTarget(choices.agent, choices.scope, choices.root, w.kind))
      throw Error('Install record has an unexpected wiring target');
    if (unwireRecorded(w)) unwired.push(w.target);
  }
  // prune empty dirs we created (only if empty — never foreign content)
  for (const p of removed) {
    let dir = dirname(p);
    while (
      (dir.startsWith(roots.base) && dir !== roots.base) ||
      (dir.startsWith(roots.runtime) && dir !== roots.runtime)
    ) {
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

function sameDefinition(a: unknown, b: unknown): boolean {
  const canonical = (value: unknown): string => {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object')
      return (
        '{' +
        Object.entries(value)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, v]) => JSON.stringify(key) + ':' + canonical(v))
          .join(',') +
        '}'
      );
    return JSON.stringify(value);
  };
  return canonical(a) === canonical(b);
}
