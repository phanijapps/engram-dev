/** Surface + scope → destination roots. Global writes land outside the
 *  repo; the caller gates them on --yes (D-7). Copilot has no global. */
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Scope, Surface } from './types.js';

export interface DestRoots {
  /** where component destinations resolve */
  base: string;
  /** where hook payload files land for claude/codex (project runtime dir) */
  runtime: string;
  /** where the applied-plan state file lives */
  state: string;
}

export function destRoots(agent: Surface, scope: Scope, root: string): DestRoots {
  if (scope === 'project') {
    return { base: root, runtime: join(root, '.harness'), state: join(root, '.harness') };
  }
  const home = homedir();
  const bases: Record<Surface, string | null> = {
    pi: join(home, '.pi', 'agent'),
    claude: join(home, '.claude'),
    codex: join(home, '.codex'),
    copilot: null, // no user-global install for copilot — refuse, never guess
  };
  const base = bases[agent];
  if (base === null) {
    throw new Error('copilot has no global scope — project only (the honest no)');
  }
  return { base, runtime: join(home, '.harness'), state: join(home, '.harness') };
}
