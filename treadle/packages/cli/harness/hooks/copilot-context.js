#!/usr/bin/env node
/** Copilot command hooks use top-level context instead of the Claude envelope. */
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  eventContext,
  openPacks,
  packSummary,
  runtimeConfig,
  stdinEvent,
} from './codex-context.js';
const sha = (value) => createHash('sha256').update(value).digest('hex');
// Copilot discards prompt-hook context, so the model is told to pull state itself (D-1).
// PowerShell reads a leading quoted path as a string, so Windows needs the call operator.
export function pullInstruction(platform = process.platform) {
  try {
    const { node, entry } = runtimeConfig();
    const call = `${platform === 'win32' ? '& ' : ''}"${node}" "${entry}" do status <packDir>`;
    return `This host does not refresh spec state on each prompt. Before any stage-dependent action (answer, approve, plan, implement, record), run: ${call}`;
  } catch {
    return 'This host does not refresh spec state on each prompt. Before any stage-dependent action, run do status <packDir> with the installed harness runtime.';
  }
}
// Per-session fingerprints only: hashed pack names mapped to hashed compact lines (D-3).
const stateDir = () => process.env.HARNESS_COPILOT_STATE_DIR || join(tmpdir(), 'wukong-copilot');
const STATE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const STATE_FILE = /^[0-9a-f]{64}\.json$/;
function pruneState(now = Date.now()) {
  let files;
  try {
    files = readdirSync(stateDir()).filter((file) => STATE_FILE.test(file));
  } catch {
    return;
  }
  for (const file of files) {
    const path = join(stateDir(), file);
    try {
      if (now - statSync(path).mtimeMs > STATE_MAX_AGE_MS) rmSync(path, { force: true });
    } catch {
      // A concurrent session may have pruned it already.
    }
  }
}
function statePath(event) {
  const session = event.session_id ?? event.sessionId;
  if (typeof session !== 'string' || !session) return undefined;
  return join(stateDir(), sha(`${session}\0${event.cwd}`) + '.json');
}
function fingerprints(report) {
  return Object.fromEntries(
    openPacks(report).map((pack) => [sha(pack.name), sha(packSummary(pack))]),
  );
}
/** Remember the current fingerprints; report changed open packs and how many left the list. */
function changedPacks(event, report) {
  const none = { changed: [], left: 0 };
  const path = statePath(event);
  if (!path) return none;
  const current = fingerprints(report);
  let previous;
  try {
    previous = JSON.parse(readFileSync(path, 'utf8')).packs;
  } catch {
    previous = undefined;
  }
  try {
    mkdirSync(stateDir(), { recursive: true });
    writeFileSync(path, JSON.stringify({ packs: current, at: new Date().toISOString() }));
  } catch {
    return none;
  }
  pruneState();
  if (!previous || typeof previous !== 'object') return none;
  return {
    changed: openPacks(report).filter(
      (pack) => previous[sha(pack.name)] !== current[sha(pack.name)],
    ),
    left: Object.keys(previous).filter((key) => !(key in current)).length,
  };
}
export async function runCopilotEvent(expectedEvent) {
  const event = await stdinEvent();
  if (
    !['sessionStart', 'userPromptSubmitted'].includes(expectedEvent) ||
    !event ||
    typeof event !== 'object' ||
    Array.isArray(event)
  ) {
    const guidance = 'Harness Copilot hook input is invalid. Reinstall the host integration.';
    console.error(guidance);
    console.log(
      JSON.stringify(expectedEvent === 'sessionStart' ? { additionalContext: guidance } : {}),
    );
    return;
  }
  const instruction = expectedEvent === 'sessionStart' ? [pullInstruction()] : [];
  const result = await eventContext(event.cwd, instruction);
  if (!result.available) console.error(result.block);
  if (expectedEvent === 'sessionStart') {
    if (result.available) changedPacks(event, result.report);
    // The pull rule matters most when the runtime is down; keep it on both paths.
    const block = result.available ? result.block : `${result.block}\n${instruction[0]}`;
    console.log(JSON.stringify({ additionalContext: block }));
    return;
  }
  // VS Code shows systemMessage to the user; Copilot CLI ignores it (E).
  const { changed, left } = result.available
    ? changedPacks(event, result.report)
    : { changed: [], left: 0 };
  const parts = changed.map(
    (pack) => `${pack.name} (${pack.stage}, gate ${pack.workflow?.phase ?? 'unknown'})`,
  );
  if (left) parts.push(`${left} spec(s) left the open list (finished, closed or refused)`);
  console.log(
    JSON.stringify(
      parts.length
        ? {
            systemMessage: `Spec state changed since your last prompt: ${parts.join('; ')}. Ask the agent to run do status before it continues.`,
          }
        : {},
    ),
  );
}
const invoked = (() => {
  try {
    return (
      process.argv[1] &&
      realpathSync.native(process.argv[1]) === realpathSync.native(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
})();
if (invoked) {
  const index = process.argv.indexOf('--event');
  await runCopilotEvent(index < 0 ? undefined : process.argv[index + 1]);
}
