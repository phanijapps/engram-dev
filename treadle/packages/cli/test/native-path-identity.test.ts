import { it, expect } from 'vitest';
import { mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

it('identifies the same native Git root despite filesystem path representations', () => {
  const input = mkdtempSync(join(tmpdir(), 'native path identity '));
  try {
    execFileSync('git', ['init', '-q'], { cwd: input, stdio: 'pipe' });
    const gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: input,
      encoding: 'utf8',
    }).trim();
    const report = {
      platform: process.platform,
      node: process.version,
      input,
      gitRoot,
      lexicalWorkspace: realpathSync(input),
      lexicalGit: realpathSync(gitRoot),
      nativeWorkspace: realpathSync.native(input),
      nativeGit: realpathSync.native(gitRoot),
    };
    console.log('native-path-identity/1 ' + JSON.stringify(report));
    expect(report.nativeGit).toBe(report.nativeWorkspace);
  } finally {
    rmSync(input, { recursive: true, force: true });
  }
});
