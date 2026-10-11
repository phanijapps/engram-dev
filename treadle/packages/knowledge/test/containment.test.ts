/** The containment battery (red-forman B1/D7, proven by fixtures that broke
 *  the lexical guard): symlink escapes read nothing, sibling prefixes route
 *  right, and enumeration refuses symlinked dirs. */
import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  readConcept,
  buildAdjacency,
  iterConceptFiles,
  parseConcept,
  anchorReview,
} from '../src/index.js';

function bundleWith(parent: string): string {
  const b = join(parent, 'wiki');
  mkdirSync(join(b, 'sub'), { recursive: true });
  writeFileSync(join(b, 'sub', 'page.md'), '---\ntitle: P\ntype: system\n---\nbody text\n');
  writeFileSync(join(b, 'root.md'), '---\ntitle: R\ntype: note\n---\nroot page\n');
  return b;
}

describe('realpath containment (B1)', () => {
  it('keeps concept ids and links relative to an aliased bundle root', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'root-alias-'));
    try {
      const bundle = bundleWith(tmp);
      const alias = join(tmp, 'alias');
      symlinkSync(bundle, alias, process.platform === 'win32' ? 'junction' : 'dir');
      writeFileSync(
        join(bundle, 'sub', 'page.md'),
        '---\ntitle: P\ntype: system\n---\n[Root](../root.md)\n',
      );
      const concepts = iterConceptFiles(alias).map((p) => parseConcept(p, alias));
      expect(concepts.map((c) => c.cid)).toEqual(['root', 'sub/page']);
      expect(buildAdjacency(alias, concepts)['sub/page']).toEqual(['root']);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('a symlinked file escaping the bundle reads nothing', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'esc-'));
    writeFileSync(join(tmp, 'secret.md'), '---\ntitle: S\ntype: note\n---\nSECRET CONTENT\n');
    const b = bundleWith(tmp);
    symlinkSync(join(tmp, 'secret.md'), join(b, 'leak.md'));
    // enumeration: the escape is never listed
    const cids = iterConceptFiles(b).map((p) => parseConcept(p, b).cid);
    expect(cids).not.toContain('leak');
    // direct read: refused, not the secret's content
    expect(() => readConcept(b, 'leak')).toThrow(/not found/);
    // adjacency: no edge into the escape
    writeFileSync(
      join(b, 'sub', 'page.md'),
      '---\ntitle: P\ntype: system\n---\nsee [the leak](../leak.md)\n',
    );
    const concepts = iterConceptFiles(b).map((p) => parseConcept(p, b));
    const adj = buildAdjacency(b, concepts);
    expect(adj['sub/page'] ?? []).not.toContain('leak');
  });

  it('a symlinked directory escaping the bundle is refused', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'diresc-'));
    const outside = join(tmp, 'out');
    mkdirSync(outside);
    writeFileSync(join(outside, 'evil.md'), '---\ntitle: E\ntype: note\n---\nEVIL\n');
    const b = bundleWith(tmp);
    symlinkSync(outside, join(b, 'adir'));
    expect(() => readConcept(b, 'adir/evil')).toThrow(/not found/);
    const cids = iterConceptFiles(b).map((p) => parseConcept(p, b).cid);
    expect(cids.join(',')).not.toContain('adir');
  });

  it('an in-bundle symlink alias reads, and dedupes to its target (one truth)', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'alias-'));
    const b = bundleWith(tmp);
    symlinkSync(join(b, 'root.md'), join(b, 'alias.md'));
    // readable through the alias: realpath lands inside the bundle
    expect(readConcept(b, 'alias')).toContain('root page');
    // enumeration dedupes by realpath: the alias IS its target, listed once
    const cids = iterConceptFiles(b).map((p) => parseConcept(p, b).cid);
    expect(cids.filter((c) => c === 'root' || c === 'alias')).toHaveLength(1);
  });
});

describe('anchor routing (D7)', () => {
  it('sibling sharing the bundle prefix is code, not wiki-internal', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'sib-'));
    const repo = join(tmp, 'repo');
    const b = join(repo, 'wiki');
    mkdirSync(join(repo, 'wiki.d'), { recursive: true });
    writeFileSync(join(repo, 'wiki.d', 'evil.py'), 'x = 1\n');
    mkdirSync(b, { recursive: true });
    writeFileSync(
      join(b, 'page.md'),
      '---\ntitle: P\ntype: system\nsources:\n  - {id: s1, resource: wiki.d/evil.py}\n---\nbody\n',
    );
    const review = anchorReview(b, repo);
    // NOT wiki-internal: it is a real source file outside the bundle → tracked/untracked, never misrouted
    expect(review[0]?.verdict).not.toBe('wiki-internal');
    expect(review[0]?.verdict).toBe('untracked');
  });
});
