import { it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

it('executes hooks through ancestor aliases and leaves imported hooks silent with stdin intact', () => {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'hook identity ü ')));
  const physical = join(root, 'physical');
  const alias = join(root, 'alias');
  mkdirSync(physical);
  symlinkSync(physical, alias, process.platform === 'win32' ? 'junction' : 'dir');
  const files = ['codex-context', 'post-tool-check'];
  for (const name of files)
    writeFileSync(
      join(physical, name + '.mjs'),
      readFileSync(join(import.meta.dirname, '../harness/hooks', name + '.js')),
    );
  const stub = join(root, 'runtime.cjs');
  writeFileSync(
    stub,
    `const args=process.argv.slice(2); const cwd=args[args.indexOf('--workspace')+1]??args[2]; console.log(JSON.stringify(args[0]==='project'?{service:{url:'http://127.0.0.1:1/'},project:{id:'fixture'}}:{format:'context/1',workspace:cwd,wiki:{root:cwd+'/wiki',available:false},specs:{root:cwd+'/specs',packs:[]},guidance:{newSpec:'fixture',continueSpec:'fixture'}}));`,
  );
  try {
    for (const dir of [physical, alias]) {
      const context = spawnSync(
        process.execPath,
        [join(dir, 'codex-context.mjs'), '--event', 'SessionStart'],
        {
          input: JSON.stringify({ cwd: physical, hook_event_name: 'SessionStart' }),
          env: { ...process.env, HARNESS_RUNTIME_ENTRY: stub },
          encoding: 'utf8',
          timeout: 10000,
        },
      );
      expect(context.status, context.stderr).toBe(0);
      expect(JSON.parse(context.stdout).hookSpecificOutput.additionalContext).toContain(
        'Harness connected:',
      );
      const guard = spawnSync(
        process.execPath,
        [
          join(dir, 'post-tool-check.mjs'),
          JSON.stringify({ tool: 'write', path: 'corpus/expected.json' }),
        ],
        { encoding: 'utf8' },
      );
      expect(guard.status, guard.stderr).toBe(3);
      expect(JSON.parse(guard.stdout).ok).toBe(false);
    }
    const host = join(root, 'host.mjs');
    writeFileSync(
      host,
      `import {readFileSync} from 'node:fs';
      ${files.map((name) => `await import(${JSON.stringify(pathToFileURL(join(alias, name + '.mjs')).href)});`).join('\n')}
      console.log('import-safe:'+readFileSync(0,'utf8'));`,
    );
    const imported = spawnSync(process.execPath, [host], {
      input: 'untouched stdin',
      encoding: 'utf8',
      timeout: 10000,
    });
    expect(imported.status, imported.stderr).toBe(0);
    expect(imported.stdout.trim()).toBe('import-safe:untouched stdin');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
