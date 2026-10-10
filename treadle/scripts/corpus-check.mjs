#!/usr/bin/env node
/** Golden provenance gate (red-forman D14): regenerating the corpus from the
 *  python engines must reproduce the committed goldens byte for byte. Run
 *  from the repo root via pnpm corpus:check. */
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
try {
  execFileSync('uv', ['run', 'python', 'treadle/conformance/generators/gen_corpus.py'], {
    cwd: repo,
    stdio: 'inherit',
  });
} catch {
  console.error('corpus:check: generator failed');
  process.exit(1);
}
try {
  execFileSync('git', ['diff', '--exit-code', '--', 'treadle/packages/conformance/corpus'], {
    cwd: repo,
    stdio: 'inherit',
  });
  console.log('corpus:check: goldens reproduce exactly');
} catch {
  console.error('corpus:check: DRIFT — regenerate deliberately, review, commit with intent');
  process.exit(1);
}
