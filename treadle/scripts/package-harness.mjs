// Source-workspace convenience; installed CLI exposes the same generator.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const result = spawnSync(
  process.execPath,
  [
    fileURLToPath(new URL('../packages/cli/dist/src/main.js', import.meta.url)),
    'package',
    'harness',
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit' },
);
process.exitCode = result.status ?? 1;
