import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  proposeFinding,
  resolveFinding,
  listFindings,
  writeFingerprints,
  readFingerprints,
  anchorReview,
  writeFreshnessStamp,
  readFreshness,
} from '../src/index.js';

const AT = '2026-10-10T12:00:00Z';

describe('the findings ledger', () => {
  it('proposes idempotently, guards declined keys, resolves terminally', () => {
    const bundle = mkdtempSync(join(tmpdir(), 'fl-'));
    const a = proposeFinding('wiki/a.md', 'wiki/b.md', 'relates', {
      bundle,
      rationale: 'why',
      at: AT,
    });
    expect(a.deduped).toBe(false);
    const again = proposeFinding('wiki/a.md', 'wiki/b.md', 'relates', { bundle, at: AT });
    expect(again.deduped).toBe(true);
    expect(again.id).toBe(a.id);
    const resolved = resolveFinding(a.id, 'declined', { bundle, at: AT });
    expect(resolved.status).toBe('declined');
    const refused = proposeFinding('wiki/a.md', 'wiki/b.md', 'relates', { bundle, at: AT });
    expect(refused.refused).toBe(true); // declined keys are never re-raised
    expect(() => resolveFinding(a.id, 'accepted', { bundle, at: AT })).toThrow('already declined');
    expect(listFindings({ status: 'declined', bundle })).toHaveLength(1);
    // the ledger on disk is TOML, managed shape
    const disk = readFileSync(join(bundle, '.okf', 'findings.toml'), 'utf8');
    expect(disk).toContain('# okf findings ledger (managed)');
    expect(disk).toContain('[[findings]]');
  });
});

describe('fingerprints + anchors', () => {
  it('records hashes and reviews verdicts', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'fp-'));
    const workspace = join(tmp, 'repo');
    const bundle = join(workspace, 'wiki'); // the bundle lives in the repo, like the real one
    mkdirSync(join(workspace, 'pkg'), { recursive: true });
    mkdirSync(bundle, { recursive: true });
    writeFileSync(join(workspace, 'pkg', 'mod.py'), 'x = 1\n');
    writeFileSync(join(workspace, 'other.py'), 'y = 2\n');
    writeFileSync(
      join(bundle, 'page.md'),
      '---\ntitle: P\ntype: system\nsources:\n  - {id: s1, resource: pkg/mod.py}\n  - {id: s2, resource: other.py}\n  - {id: s3, resource: wiki/internal.md}\n  - {id: s4, resource: gone.py}\n  - {id: s5, resource: new.py}\n---\nbody\n',
    );
    writeFingerprints(workspace, bundle, { at: AT });
    const fp = readFingerprints(bundle);
    expect(fp['pkg/mod.py']).toBeDefined();
    expect(fp['other.py']).toBeDefined();
    let review = anchorReview(bundle, workspace);
    const byRes = Object.fromEntries(review.map((r) => [r.resource, r.verdict]));
    expect(byRes['pkg/mod.py']).toBe('current');
    expect(byRes['other.py']).toBe('current');
    expect(byRes['wiki/internal.md']).toBe('wiki-internal');
    expect(byRes['gone.py']).toBe('missing-file');
    writeFileSync(join(workspace, 'pkg', 'mod.py'), 'x = 2\n'); // code moved
    review = anchorReview(bundle, workspace);
    const changed = review.find((r) => r.resource === 'pkg/mod.py');
    expect(changed?.verdict).toBe('changed');
    const fresh = review.find((r) => r.resource === 'new.py');
    writeFileSync(join(workspace, 'new.py'), 'z = 3\n');
    expect(anchorReview(bundle, workspace).find((r) => r.resource === 'new.py')?.verdict).toBe(
      'untracked',
    );
  });
});

describe('the freshness stamp', () => {
  it('fresh at HEAD, stale after motion', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'st-'));
    const repo = join(tmp, 'repo');
    const bundle = join(repo, 'wiki');
    mkdirSync(bundle, { recursive: true });
    execFileSync('git', ['init', '-q'], { cwd: repo });
    execFileSync('git', ['config', 'core.autocrlf', 'false'], { cwd: repo });
    execFileSync('git', ['config', 'user.email', 't@t'], { cwd: repo });
    execFileSync('git', ['config', 'user.name', 't'], { cwd: repo });
    writeFileSync(join(repo, 'a.txt'), 'one\n');
    execFileSync('git', ['add', '.'], { cwd: repo });
    execFileSync('git', ['commit', '-qm', 'one'], { cwd: repo });
    writeFreshnessStamp(bundle, repo, { written: 1, updated: 0, skipped: 0 }, { at: AT });
    expect(readFreshness(bundle, repo)).toBe('fresh');
    writeFileSync(join(repo, 'a.txt'), 'two\n');
    execFileSync('git', ['add', '.'], { cwd: repo });
    execFileSync('git', ['commit', '-qm', 'two'], { cwd: repo });
    expect(readFreshness(bundle, repo)).toBe('stale');
    expect(readFreshness(join(tmp, 'nowhere'), repo)).toBe('absent'); // bundle itself missing
    const emptyBundle = join(tmp, 'empty-wiki');
    mkdirSync(emptyBundle);
    expect(readFreshness(emptyBundle, repo)).toBe('no-stamp'); // bundle present, never indexed
  });
});

describe('cross-engine round-trips (red-forman harden list)', () => {
  it('a foreign literal-string rationale never corrupts the ledger', async () => {
    const bundle = mkdtempSync(join(tmpdir(), 'rt-'));
    const a = proposeFinding('x.md', 'y.md', 'relates', { bundle, at: AT });
    // a foreign tool writes a single-quoted literal (valid TOML, not our managed shape)
    const path = join(bundle, '.okf', 'findings.toml');
    writeFileSync(
      path,
      readFileSync(path, 'utf8').replace(/rationale = ""/, "rationale = 'hand written'"),
    );
    const listed = listFindings({ bundle });
    expect(listed[0]?.rationale).toBe('hand written'); // coerced, never undefined
    proposeFinding('z.md', 'y.md', 'relates', { bundle, at: AT }); // a write-through must stay valid TOML
    const again = listFindings({ bundle });
    expect(
      again.every((f) => typeof f.rationale === 'string' && !f.rationale.includes('undefined')),
    ).toBe(true);
  });

  it('the python clock format on default stamps', async () => {
    const bundle = mkdtempSync(join(tmpdir(), 'clk-'));
    const r = proposeFinding('a.md', 'b.md', 'k', { bundle }); // no at: default clock
    expect(r.proposed_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}\+00:00$/);
  });
});
