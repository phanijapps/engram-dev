/** T-2 (FR-6): the skin is thin — it renders choices and returns flags.
 *  No install logic above the flag layer. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { promptForMissing } from '../src/harness/skin.js';

describe('the interactive skin (T-2)', () => {
  it('non-TTY callers get their flags back unchanged — no fake interaction', async () => {
    const out = await promptForMissing({ agent: 'pi', scope: 'project' } as never, false);
    expect(out).toEqual({ agent: 'pi', scope: 'project' });
  });

  it('the skin module holds no engine: no fs, no apply, no plan imports (thin by construction)', () => {
    const src = readFileSync(join(import.meta.dirname, '..', 'src', 'harness', 'skin.ts'), 'utf8');
    expect(src).not.toMatch(/from 'node:fs'/);
    expect(src).not.toMatch(/from '\.\.\/\.\.\/harness\/(apply|plan|manifest)/);
    expect(src).toContain('@clack/prompts'); // Q-2: the chosen library
  });

  it('the command consults the skin only when a TTY exists and a choice is missing', () => {
    const src = readFileSync(join(import.meta.dirname, '..', 'src', 'commands', 'init.ts'), 'utf8');
    expect(src).toMatch(/isTTY\(\) &&/);
    expect(src).toContain('promptForMissing(f, true)');
  });
});
