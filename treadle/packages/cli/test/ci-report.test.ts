import { expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

function report(outcome: string, smoke?: object) {
  const dir = mkdtempSync(join(tmpdir(), 'ci receipts '));
  try {
    if (smoke) writeFileSync(join(dir, 'harness-smoke.json'), JSON.stringify(smoke));
    const steps = { check: { outcome: 'failure' }, smoke: { outcome } };
    const result = spawnSync(
      process.execPath,
      [resolve(import.meta.dirname, '../../../scripts/ci-report.mjs')],
      {
        cwd: dir,
        env: {
          ...process.env,
          RUNNER_TEMP: dir,
          CI_STEP_RESULTS: JSON.stringify(steps),
          GITHUB_SHA: 'fixture-head',
        },
        encoding: 'utf8',
      },
    );
    const receipt = JSON.parse(readFileSync(join(dir, 'ci-evidence/results.json'), 'utf8'));
    return { result, receipt, steps };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

it('retains failed and skipped gate outcomes without inventing a smoke success', () => {
  const { result, receipt, steps } = report('skipped');
  expect(result.status, result.stderr).toBe(0);
  expect(receipt.steps).toEqual(steps);
  expect(receipt.smoke).toBe(null);
  expect(receipt.commit).toBe('fixture-head');
});
it('retains an actual failed smoke report', () => {
  const smoke = { pass: false, checks: [{ id: 'fixture', pass: false }] };
  const { result, receipt } = report('failure', smoke);
  expect(result.status, result.stderr).toBe(0);
  expect(receipt.smoke).toEqual(smoke);
  expect(receipt.steps.smoke.outcome).toBe('failure');
});
it('fails when an executed smoke step omitted its promised report, preserving the receipt', () => {
  const { result, receipt } = report('success');
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('omitted its required report');
  expect(receipt.steps.smoke.outcome).toBe('success');
  expect(receipt.smoke).toBe(null);
});
