#!/usr/bin/env node
/** Copilot command hooks use top-level context instead of the Claude envelope. */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eventContext, openPacks, packLine, runtimeConfig, stdinEvent } from './codex-context.js';
const sha = (value) => createHash('sha256').update(value).digest('hex');
// Copilot discards prompt-hook context, so the model is told to pull state itself (D-1).
function pullInstruction() {
  try {
    const { node, entry } = runtimeConfig();
    return `This host does not refresh spec state on each prompt. Before any stage-dependent action (answer, approve, plan, implement, record), run: "${node}" "${entry}" do status <packDir>`;
  } catch {
    return 'This host does not refresh spec state on each prompt. Before any stage-dependent action, run do status <packDir> with the installed harness runtime.';
  }
}
// Per-session fingerprints only: hashed pack names mapped to hashed compact lines (D-3).
const stateDir = () => process.env.HARNESS_COPILOT_STATE_DIR || join(tmpdir(), 'wukong-copilot');
function statePath(event) {
  const session = event.session_id ?? event.sessionId;
  if (typeof session !== 'string' || !session) return undefined;
  return join(stateDir(), sha(`${session}\0${event.cwd}`) + '.json');
}
function fingerprints(report) {
  return Object.fromEntries(openPacks(report).map((pack) => [sha(pack.name), sha(packLine(pack))]));
}
/** Remember the current fingerprints; return the open packs that differ from the last call. */
function changedPacks(event, report) {
  const path = statePath(event);
  if (!path) return [];
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
    return [];
  }
  if (!previous || typeof previous !== 'object') return [];
  return openPacks(report).filter((pack) => previous[sha(pack.name)] !== current[sha(pack.name)]);
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
  const result = await eventContext(event.cwd);
  if (!result.available) console.error(result.block);
  if (expectedEvent === 'sessionStart') {
    if (result.available) changedPacks(event, result.report);
    const block = result.available ? `${result.block}\n${pullInstruction()}` : result.block;
    console.log(JSON.stringify({ additionalContext: block }));
    return;
  }
  // VS Code shows systemMessage to the user; Copilot CLI ignores it (E).
  const changed = result.available ? changedPacks(event, result.report) : [];
  console.log(
    JSON.stringify(
      changed.length
        ? {
            systemMessage: `Spec state changed since your last prompt: ${changed
              .map(
                (pack) => `${pack.name} (${pack.stage}, gate ${pack.workflow?.phase ?? 'unknown'})`,
              )
              .join('; ')}. Ask the agent to run do status before it continues.`,
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
