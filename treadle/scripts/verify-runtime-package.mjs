import {
  mkdtempSync,
  rmSync,
  existsSync,
  readdirSync,
  lstatSync,
  realpathSync,
  mkdirSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep, relative, isAbsolute } from 'node:path';
import { spawnSync } from 'node:child_process';
import { packageRuntime } from './package-runtime.mjs';
const scratch = mkdtempSync(join(tmpdir(), 'runtime package ü '));
try {
  const physical = join(scratch, 'physical');
  const alias = join(scratch, 'alias');
  mkdirSync(physical);
  symlinkSync(physical, alias, process.platform === 'win32' ? 'junction' : 'dir');
  const root = packageRuntime(join(alias, 'installed'));
  function walk(dir) {
    for (const f of readdirSync(dir)) {
      const path = join(dir, f),
        st = lstatSync(path);
      const rel = st.isSymbolicLink() ? relative(realpathSync(root), realpathSync(path)) : '';
      if (st.isSymbolicLink() && (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)))
        throw Error(`External dependency: ${f}`);
      if (st.isDirectory()) walk(path);
    }
  }
  walk(root);
  for (const path of [
    'dist/src/main.js',
    'harness/harness.json',
    'node_modules/@treadle/web/dist/src/library.html',
    'node_modules/@treadle/web/dist/src/marked.min.js',
  ]) {
    if (!existsSync(join(root, path))) throw Error(`Missing packaged asset: ${path}`);
  }
  for (const args of [
    ['--version'],
    [
      'init',
      'harness',
      '--agent',
      'codex',
      '--scope',
      'project',
      '--no-agents',
      '--no-hooks',
      '--root',
      scratch,
      '--dry-run',
    ],
  ]) {
    const r = spawnSync(process.execPath, [join(root, 'dist/src/main.js'), ...args], {
      cwd: scratch,
      encoding: 'utf8',
    });
    if (r.status !== 0) throw Error(`Packaged CLI failed: ${r.stderr}`);
  }
  console.log(
    'Standalone runtime assets, dependencies and CLI verified outside checkout on',
    process.platform,
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
