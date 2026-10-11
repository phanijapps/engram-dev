import { expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const hook = join(import.meta.dirname, '../harness/hooks/post-tool-check.js');
const corpus = join(import.meta.dirname, '../../conformance/corpus/L1-canonical/specpack-context');

it('guards actual corpus witnesses through argv, Claude stdin and Pi tool_call', async () => {
  const mod = await import(hook);
  let guard: (event: unknown) => Promise<{ block: boolean } | undefined>;
  mod.default({ on: (_name: string, fn: typeof guard) => (guard = fn) });
  const previous = process.env.HARNESS_ALLOW_MACHINE_EDITS;
  delete process.env.HARNESS_ALLOW_MACHINE_EDITS;
  try {
    for (const file of ['expected.emit.json', 'expected.check.json']) {
      const path = join(corpus, file);
      expect(existsSync(path)).toBe(true);
      for (const candidate of [path, path.replaceAll('/', '\\'), `corpus/example/${file}`]) {
        const argv = spawnSync(process.execPath, [hook, JSON.stringify({ path: candidate })], {
          encoding: 'utf8',
        });
        expect(argv.status, argv.stderr).toBe(3);
        expect(JSON.parse(argv.stdout).ok).toBe(false);
        const stdin = spawnSync(process.execPath, [hook], {
          input: JSON.stringify({
            hook_event_name: 'PostToolUse',
            tool_name: 'Write',
            tool_input: { file_path: candidate },
          }),
          encoding: 'utf8',
        });
        expect(stdin.status, stdin.stderr).toBe(0);
        expect(JSON.parse(stdin.stdout).systemMessage).toContain('machine-managed');
        expect((await guard!({ toolName: 'write', input: { path: candidate } }))?.block).toBe(true);
        expect(await guard!({ toolName: 'read', input: { path: candidate } })).toBeUndefined();
      }
    }
    for (const path of [
      'corpus/example/expected.err',
      'corpus/golden/out.json',
      'corpus/expected/out.json',
    ])
      expect(mod.check({ path }).ok).toBe(false);
    for (const path of [
      'src/expected.emit.json',
      'corpus/example/input.json',
      'corpus/example/unexpected.json',
    ])
      expect(mod.check({ path }).ok).toBe(true);
    process.env.HARNESS_ALLOW_MACHINE_EDITS = '1';
    expect(mod.check({ path: join(corpus, 'expected.emit.json') }).ok).toBe(true);
  } finally {
    if (previous === undefined) delete process.env.HARNESS_ALLOW_MACHINE_EDITS;
    else process.env.HARNESS_ALLOW_MACHINE_EDITS = previous;
  }
});
