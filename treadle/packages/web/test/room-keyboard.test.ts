/** T-5 keyboard proof — runs the standalone harness (vitest-jsdom cross-realm
 *  eval mangles the page's async boot; standalone tsx runs it true). */
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

describe('the room keyboard (standalone harness)', () => {
  it('drives the ceremony: Enter submits, approve card reached', () => {
    const out = execFileSync(
      process.execPath,
      ['--import', 'tsx', join(here, 'room-keyboard.standalone.mjs')],
      {
        cwd: join(here, '..', '..', '..'),
        encoding: 'utf8',
        timeout: 30000,
      },
    );
    expect(out.trim()).toContain('PASS: keyboard ceremony');
  });
});
