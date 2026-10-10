#!/usr/bin/env node
/** Golden provenance gate: the TS engines regenerate the corpus; the committed
 *  goldens are the frozen python witness (equality proven at the keystone
 *  commit; python retired at tag python-final). Zero python at the gate. */
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const treadle = join(here, '..');
const repo = join(treadle, '..');
try {
  execFileSync('./node_modules/.bin/tsx', ['conformance/generators/gen_corpus.ts'], {
    cwd: treadle,
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
