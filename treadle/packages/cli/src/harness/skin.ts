/** The interactive skin (T-2, D-3): renders choices, returns flags.
 *  Every answer maps to a flag the engine already understands; this
 *  module holds NO install logic — thin by construction (FR-6). */
import * as p from '@clack/prompts';
import type { Flags } from '../commands/init.js';

export interface PromptOutcome {
  flags: Flags;
  cancelled: false;
}

/** Ask only what the flags have not already answered. */
export async function promptForMissing(flags: Flags, isTTY: boolean): Promise<Flags | 'cancelled'> {
  if (!isTTY) return flags; // the caller turns missing flags into exit 2 — no fake TTY
  p.intro('harness install');

  const agent =
    flags.agent ??
    (await pick('Your coding agent', [
      { value: 'pi', label: 'pi' },
      { value: 'claude', label: 'Claude Code' },
      { value: 'codex', label: 'Codex' },
      { value: 'copilot', label: 'GitHub Copilot' },
    ]));
  if (agent === undefined) return 'cancelled';

  const scope =
    flags.scope ??
    (await pick('Install level', [
      { value: 'project', label: 'this project' },
      { value: 'global', label: 'global (user dirs — confirm shown)' },
    ]));
  if (scope === undefined) return 'cancelled';

  const hooks =
    flags.hooks === false
      ? false
      : flags.hooks === true
        ? true
        : await confirm('Install hooks where the surface supports them?', true);
  if (hooks === undefined) return 'cancelled';

  const agents =
    flags.agents === false
      ? false
      : flags.agents === true
        ? true
        : await confirm('Install the harness agents (red-foreman)?', true);
  if (agents === undefined) return 'cancelled';

  const out: Flags = { ...flags, agent: String(agent), scope: String(scope), hooks, agents };
  p.outro('choices made — the plan prints next');
  return out;
}

async function pick(
  message: string,
  options: { value: string; label: string }[],
): Promise<string | undefined> {
  const a = await p.select({ message, options });
  if (p.isCancel(a)) {
    p.cancel('install cancelled');
    return undefined;
  }
  return a as string;
}

async function confirm(message: string, initial: boolean): Promise<boolean | undefined> {
  const a = await p.confirm({ message, active: 'yes', inactive: 'no', initialValue: initial });
  if (p.isCancel(a)) {
    p.cancel('install cancelled');
    return undefined;
  }
  return a as boolean;
}
