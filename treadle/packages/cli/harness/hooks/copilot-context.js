#!/usr/bin/env node
/** Copilot command hooks use top-level context instead of the Claude envelope. */
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { eventContext, stdinEvent } from './codex-context.js';
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
  // Copilot discards prompt command-hook output. Only reconnect on that event.
  console.log(
    JSON.stringify(expectedEvent === 'sessionStart' ? { additionalContext: result.block } : {}),
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
