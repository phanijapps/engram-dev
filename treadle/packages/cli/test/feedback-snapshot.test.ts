import { afterEach, describe, expect, it } from 'vitest';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  renameSync,
  existsSync,
  symlinkSync,
  chmodSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildFeedbackSnapshots } from '../src/harness/feedback-snapshot.js';
import { emitBytes, type PackDoc, FEEDBACK_LIMITS } from '@treadle/core';
const roots: string[] = [];
afterEach(() => {
  for (const p of roots.splice(0)) rmSync(p, { recursive: true, force: true });
});
function fixture(gitRepo = false) {
  const root = mkdtempSync(join(tmpdir(), 'feedback-snapshot-'));
  roots.push(root);
  const dir = join(root, 'specs', 'test');
  mkdirSync(dir, { recursive: true });
  const pack: PackDoc = {
    name: 'test',
    format: 'specpack/0.4',
    revision: 1,
    spec: { requirements: [], clarifications: [] },
    plan: { decisions: [] },
    tasks: [],
    artifacts: { plan: { file: 'plan.md' } },
    workflow: {
      policy: 'owner-gated/1',
      plan: 1,
      phase_questions: { spec: [] },
      acts: [],
      pending_audit: [],
    },
  };
  writeFileSync(join(dir, 'test.json'), emitBytes(pack));
  writeFileSync(join(dir, 'plan.md'), 'Plan\n');
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...args], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .toString('utf8')
      .trim();
  if (gitRepo) {
    git('init', '-q');
    git('config', 'user.name', 'test');
    git('config', 'user.email', 'test@example.invalid');
  }
  return {
    root,
    dir,
    git,
    commit: () => {
      git('add', '--all');
      git('commit', '-qm', 'test baseline');
      return git('rev-parse', 'HEAD');
    },
  };
}
describe('selected feedback snapshots', () => {
  it('reads registered Markdown and explicit documents without Git, and excludes unrelated dirty bytes', () => {
    const f = fixture();
    writeFileSync(join(f.root, 'README.md'), 'Selected');
    writeFileSync(join(f.root, 'unrelated.md'), 'private unrelated');
    const result = buildFeedbackSnapshots(f.root, f.dir, {
      mode: 'documents',
      paths: ['README.md'],
      artifacts: ['plan'],
    });
    expect(result.snapshots.map((s) => s.path)).toEqual(['README.md', 'specs/test/plan.md']);
    expect(result.snapshots.map((s) => s.after)).toEqual(['Selected', 'Plan\n']);
    expect(() => result.verify()).not.toThrow();
    writeFileSync(join(f.root, 'unrelated.md'), 'changed');
    expect(() => result.verify()).not.toThrow();
    writeFileSync(join(f.root, 'README.md'), 'drift');
    expect(() => result.verify()).toThrow('source bytes changed');
  });
  it('refuses duplicate, missing, directory, state, credential and escaping selections', () => {
    const f = fixture();
    for (const path of [
      '../else.md',
      '.git/config',
      '.codex/hooks.json',
      '.env',
      'secret.pem',
      'specs/test/feedback/a.md',
    ])
      expect(() =>
        buildFeedbackSnapshots(f.root, f.dir, { mode: 'documents', paths: [path] }),
      ).toThrow();
    expect(() =>
      buildFeedbackSnapshots(f.root, f.dir, { mode: 'documents', paths: ['none.md'] }),
    ).toThrow('absent');
    expect(() =>
      buildFeedbackSnapshots(f.root, f.dir, {
        mode: 'documents',
        paths: ['specs/test/plan.md'],
        artifacts: ['plan'],
      }),
    ).toThrow('twice');
    expect(() =>
      buildFeedbackSnapshots(f.root, f.dir, { mode: 'documents', artifacts: ['unknown'] }),
    ).toThrow('Unknown artifact');
    symlinkSync(join(f.dir, 'plan.md'), join(f.root, 'link.md'));
    expect(() =>
      buildFeedbackSnapshots(f.root, f.dir, { mode: 'documents', paths: ['link.md'] }),
    ).toThrow('Symlink');
    mkdirSync(join(f.root, 'folder.md'));
    expect(() =>
      buildFeedbackSnapshots(f.root, f.dir, { mode: 'documents', paths: ['folder.md'] }),
    ).toThrow('directories');
  });
  it('refuses binary, invalid UTF-8 and oversized text instead of truncating', () => {
    const f = fixture();
    const path = join(f.root, 'doc.md');
    for (const bytes of [
      Buffer.from([0, 1]),
      Buffer.from([255]),
      Buffer.alloc(FEEDBACK_LIMITS.file + 1, 65),
    ]) {
      writeFileSync(path, bytes);
      expect(() =>
        buildFeedbackSnapshots(f.root, f.dir, { mode: 'documents', paths: ['doc.md'] }),
      ).toThrow();
    }
  });
  it('snapshots staged/unstaged edits, explicit additions and deletions against an immutable baseline', () => {
    const f = fixture(true);
    writeFileSync(join(f.root, 'edit.ts'), 'before\n');
    writeFileSync(join(f.root, 'delete.ts'), 'deleted\n');
    const base = f.commit();
    writeFileSync(join(f.root, 'edit.ts'), 'staged\n');
    f.git('add', 'edit.ts');
    writeFileSync(join(f.root, 'edit.ts'), 'unstaged\n');
    rmSync(join(f.root, 'delete.ts'));
    writeFileSync(join(f.root, 'add.ts'), 'untracked\n');
    writeFileSync(join(f.root, 'not-selected.ts'), 'excluded');
    const result = buildFeedbackSnapshots(f.root, f.dir, {
      mode: 'diff',
      paths: ['edit.ts', 'delete.ts', 'add.ts'],
      base,
    });
    expect(result.snapshots).toMatchObject([
      { path: 'edit.ts', before: 'before\n', after: 'unstaged\n' },
      { path: 'delete.ts', before: 'deleted\n', after: null },
      { path: 'add.ts', before: null, after: 'untracked\n' },
    ]);
    expect(result.selection.base).toBe(base);
    result.verify();
    writeFileSync(join(f.root, 'edit.ts'), 'new source');
    expect(() => result.verify()).toThrow('source bytes changed');
  });
  it('keeps both sides of selected renames and reads committed head comparisons', () => {
    const f = fixture(true);
    writeFileSync(join(f.root, 'old.ts'), 'rename me\n');
    const base = f.commit();
    renameSync(join(f.root, 'old.ts'), join(f.root, 'new.ts'));
    const pure = buildFeedbackSnapshots(f.root, f.dir, {
      mode: 'diff',
      paths: ['old.ts', 'new.ts'],
      base,
    });
    expect(pure.snapshots).toMatchObject([
      { old_path: 'old.ts', path: 'new.ts', before: 'rename me\n', after: 'rename me\n' },
    ]);
    f.git('add', '--all');
    writeFileSync(join(f.root, 'new.ts'), 'rename me\nchanged\n');
    const staged = buildFeedbackSnapshots(f.root, f.dir, {
      mode: 'diff',
      paths: ['old.ts', 'new.ts'],
      base,
    });
    expect(staged.snapshots[0]).toMatchObject({
      old_path: 'old.ts',
      path: 'new.ts',
      after: 'rename me\nchanged\n',
    });
    const head = f.commit();
    writeFileSync(join(f.root, 'new.ts'), 'dirty ignored');
    const committed = buildFeedbackSnapshots(f.root, f.dir, {
      mode: 'diff',
      paths: ['old.ts', 'new.ts'],
      base,
      head,
    });
    expect(committed.snapshots[0]!.after).toBe('rename me\nchanged\n');
    committed.verify();
  });
  it('does not execute external diff, textconv, clean or smudge commands', () => {
    const f = fixture(true);
    writeFileSync(join(f.root, 'source.ts'), 'old\n');
    writeFileSync(join(f.root, '.gitattributes'), '*.ts diff=trap filter=trap\n');
    const base = f.commit();
    const driver = join(f.root, 'driver');
    const marker = join(f.root, 'executed');
    writeFileSync(driver, '#!/bin/sh\nprintf executed > "' + marker + '"\ncat\n');
    chmodSync(driver, 0o755);
    f.git('config', 'diff.external', driver);
    f.git('config', 'diff.trap.textconv', driver);
    f.git('config', 'filter.trap.clean', driver);
    f.git('config', 'filter.trap.smudge', driver);
    writeFileSync(join(f.root, 'source.ts'), 'changed\n');
    const result = buildFeedbackSnapshots(f.root, f.dir, {
      mode: 'diff',
      paths: ['source.ts'],
      base,
    });
    result.verify();
    expect(result.snapshots[0]!.after).toBe('changed\n');
    expect(existsSync(marker)).toBe(false);
  });
  it('detects moving refs, literal path names and unsupported/no Git selections', () => {
    const f = fixture(true);
    const odd = ':(glob)*.ts';
    writeFileSync(join(f.root, odd), 'literal');
    const base = f.commit();
    const result = buildFeedbackSnapshots(f.root, f.dir, {
      mode: 'diff',
      paths: [odd],
      base: 'HEAD',
    });
    expect(result.snapshots).toHaveLength(1);
    expect(result.snapshots[0]!.path).toBe(odd);
    writeFileSync(join(f.root, 'extra.ts'), 'new');
    f.commit();
    expect(() => result.verify()).toThrow('reference moved');
    expect(() =>
      buildFeedbackSnapshots(f.root, f.dir, { mode: 'diff', paths: ['source.ts'] }),
    ).toThrow('baseline');
    const noGit = fixture();
    expect(() =>
      buildFeedbackSnapshots(noGit.root, noGit.dir, { mode: 'diff', paths: ['doc.md'], base }),
    ).toThrow('Git comparison');
    symlinkSync(join(f.dir, 'plan.md'), join(f.root, 'link.ts'));
    expect(() =>
      buildFeedbackSnapshots(f.root, f.dir, { mode: 'diff', paths: ['link.ts'], base }),
    ).toThrow('Symlink');
    expect(readFileSync(join(f.dir, 'plan.md'), 'utf8')).toBe('Plan\n');
  });
});
