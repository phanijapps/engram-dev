/** T-3: the five SPEC debts — trust tiers (§5.3), log/index structure as
 *  the §11.3 conformance clause, §10 admission rules, stale_after. */
import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  validateBundle,
  trustTier,
  logStructureIssues,
  indexStructureIssues,
} from '../src/validate.js';

function bundle(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'debt-'));
  // §5/§10 semantics are gated on the declared 0.2 version (the versioning contract)
  const index = '---\nokf_version: "0.2"\n---\n\n# Concepts\n\n* [c](c.md) - the fixture concept\n';
  writeFileSync(join(root, 'index.md'), index);
  for (const [name, body] of Object.entries(files)) {
    const p = join(root, name);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, body);
  }
  return root;
}

const concept = (fm: string, body = 'body text') => `---\n${fm}\n---\n\n${body}\n`;

describe('the five debts (T-3)', () => {
  it('§5.3: trust tiers derive from verified actors — advisory info, never a rejection', () => {
    expect(trustTier(undefined)).toBe('unverified');
    expect(trustTier([{ by: 'agent:pi' }])).toBe('machine-confirmed');
    expect(trustTier([{ by: 'agent:pi' }, { by: 'human:owner' }])).toBe('human-reviewed');
    const r = validateBundle(
      bundle({ 'c.md': concept('type: Concept\nverified:\n  - by: human:owner') }),
    );
    expect(r.errors).toEqual([]);
    expect(
      r.info.some((i) => i.code === 'trust-tier' && i.message.includes('human-reviewed')),
    ).toBe(true);
  });

  it('§9 (§11.3): log.md structure is conformance — ISO dates, newest first', () => {
    const good = bundle({ 'log.md': '# Log\n\n## 2026-05-22\n* one\n\n## 2026-05-15\n* two\n' });
    expect(validateBundle(good).errors.filter((e) => e.code === 'log-structure')).toEqual([]);
    const bad = bundle({ 'log.md': '# Log\n\n## May 22\n* one\n\n## 2026-05-15\n* two\n' });
    const errs = validateBundle(bad).errors.filter((e) => e.code === 'log-structure');
    expect(errs.length).toBeGreaterThan(0);
    expect(logStructureIssues('## 2026-01-02\n## 2026-01-15')).toContain(
      'entries are not newest-first',
    );
  });

  it('§8 (§11.3): index.md structure is conformance — headings with bullet links', () => {
    expect(indexStructureIssues('# Section\n* [A](a.md) - x')).toEqual([]);
    expect(indexStructureIssues('* [A](a.md) - x')).toContain('no section headings');
    expect(indexStructureIssues('# Section\njust prose')).toContain(
      'no bullet links under the headings',
    );
  });

  it('§10: Attested Computation admission — runtime REQUIRED, shapes checked', () => {
    const missing = bundle({ 'c.md': concept('type: Attested Computation\nruntime-x: nope') });
    expect(validateBundle(missing).errors.some((e) => e.code === 'attested-runtime-required')).toBe(
      true,
    );
    const badExec = bundle({
      'c.md': concept('type: Attested Computation\nruntime: bigquery\nexecutor:\n  resource: x'),
    });
    expect(validateBundle(badExec).errors.some((e) => e.code === 'attested-executor-receipt')).toBe(
      true,
    );
    const badParams = bundle({
      'c.md': concept('type: Attested Computation\nruntime: dbt\nparameters:\n  - name: only-name'),
    });
    expect(
      validateBundle(badParams).errors.some((e) => e.code === 'attested-parameters-shape'),
    ).toBe(true);
    const good = bundle({
      'c.md': concept(
        'type: Attested Computation\nruntime: dbt\nparameters:\n  - name: p1\n    type: string\n    required: true\nexecutor:\n  resource: runs/dbt.sh\n  receipt:\n    - job_id\nattester:\n  resource: checks/job.js',
      ),
    });
    expect(validateBundle(good).errors).toEqual([]);
  });

  it('stale_after: the comparison runs, with the injectable clock (§5.5)', () => {
    const past = bundle({ 'c.md': concept('type: Concept\nstale_after: "2020-01-01T00:00:00Z"') });
    expect(validateBundle(past).warnings.some((w) => w.code === 'stale-after-passed')).toBe(true);
    const future = bundle({
      'c.md': concept('type: Concept\nstale_after: "2999-01-01T00:00:00Z"'),
    });
    expect(validateBundle(future).warnings.some((w) => w.code === 'stale-after-passed')).toBe(
      false,
    );
    // clock injection: the same bundle flips with the clock
    const r = validateBundle(past, { now: () => Date.parse('2019-01-01T00:00:00Z') });
    expect(r.warnings.some((w) => w.code === 'stale-after-passed')).toBe(false);
  });
});
