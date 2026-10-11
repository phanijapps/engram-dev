import { Buffer } from 'node:buffer';
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readdirSync,
  lstatSync,
  realpathSync,
  readlinkSync,
  symlinkSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join, relative, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
export const workspace = fileURLToPath(new URL('..', import.meta.url));
function run(args) {
  // Avoid .cmd shell argument splitting for paths containing spaces or metacharacters.
  const script =
    '& pnpm ' +
    args.map((arg) => "'" + arg.replaceAll("'", "''") + "'").join(' ') +
    '; exit $LASTEXITCODE';
  const r =
    process.platform === 'win32'
      ? spawnSync(
          'powershell.exe',
          [
            '-NoProfile',
            '-NonInteractive',
            '-EncodedCommand',
            Buffer.from(script, 'utf16le').toString('base64'),
          ],
          { cwd: workspace, stdio: 'inherit' },
        )
      : spawnSync('pnpm', args, { cwd: workspace, stdio: 'inherit' });
  if (r.error || r.status !== 0)
    throw Error(`Package command failed: ${args.join(' ')} (${r.status ?? r.error?.message})`);
}
export function packageRuntime(destination) {
  const requested = resolve(destination);
  mkdirSync(dirname(requested), { recursive: true });
  // pnpm must calculate dependency links from the same physical root as its store.
  const parent =
    process.platform === 'win32'
      ? realpathSync.native(dirname(requested))
      : realpathSync(dirname(requested));
  const target = join(parent, basename(requested));
  const sourceCli = realpathSync(join(workspace, 'packages/cli'));
  if (existsSync(target)) {
    if (!existsSync(join(target, '.runtime-package.json')))
      throw Error('Output exists and is not a managed runtime package');
    rmSync(target, { recursive: true });
  }
  run(['build']);
  mkdirSync(resolve(target, '..'), { recursive: true });
  run(['--filter', '@treadle/cli', 'deploy', '--prod', target]);
  // pnpm 9 leaves a self-reference to the source package in its virtual store.
  // Redirect only that exact reference to the deployed package itself.
  function localize(dir) {
    for (const name of readdirSync(dir)) {
      const file = join(dir, name),
        st = lstatSync(file);
      if (st.isDirectory()) localize(file);
      else if (st.isSymbolicLink()) {
        let real;
        try {
          real = realpathSync(file);
        } catch (cause) {
          throw Error(`Broken deployed dependency link: ${file} -> ${readlinkSync(file)}`, {
            cause,
          });
        }
        if (real !== sourceCli) continue;
        rmSync(file);
        symlinkSync(
          process.platform === 'win32' ? target : relative(dirname(file), target),
          file,
          process.platform === 'win32' ? 'junction' : 'dir',
        );
      }
    }
  }
  localize(join(target, 'node_modules'));
  writeFileSync(
    join(target, '.runtime-package.json'),
    JSON.stringify({ format: 'runtime-package/1', node: '>=22' }) + '\n',
  );
  return target;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(packageRuntime(process.argv[2] ?? join(workspace, 'dist/runtime')));
}
