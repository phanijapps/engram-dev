import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildIndex, search, splitFrontmatter } from '../src/index.js';

function bundle(): string {
  const root = join(mkdtempSync(join(tmpdir(), 'kb-')), 'wiki');
  mkdirSync(join(root, 'systems'), { recursive: true });
  writeFileSync(
    join(root, 'systems', 'loom.md'),
    '---\ntitle: The loom engine\ntype: system\ntags: [engine, loop]\ndescription: The loop that does.\n---\nThe loom hands out frozen tasks and records evidence.\n',
  );
  writeFileSync(
    join(root, 'systems', 'okf.md'),
    '---\ntitle: The knowledge engine\ntype: system\ntags: [engine, knowledge]\n---\nAnchored knowledge, freshness stamps, findings ledger.\n',
  );
  writeFileSync(join(root, 'plain.md'), 'no frontmatter here, just a body about looms');
  return root;
}

describe('the know plane (parse + search)', () => {
  it('splits frontmatter permissively', () => {
    const r = splitFrontmatter('---\ntitle: x\n---\nbody');
    expect(r.present).toBe(true);
    expect(r.data['title']).toBe('x');
    expect(splitFrontmatter('no block').present).toBe(false);
    const bad = splitFrontmatter('---\n- just\n- a list\n---\nbody');
    expect(bad.present).toBe(true);
    expect(bad.error).toContain('must be a YAML mapping');
  });

  it('indexes non-reserved concepts and ranks deterministically', () => {
    const idx = buildIndex(bundle());
    expect(idx.docs.length).toBe(3);
    const hits = search(idx, 'loom');
    expect(hits.length).toBeGreaterThan(0);
    const exact = search(idx, 'the loom engine');
    expect(exact[0]?.cid).toBe('systems/loom');
    expect(exact[0]?.score).toBeGreaterThanOrEqual(100);
  });

  it('filters by type and tag', () => {
    const idx = buildIndex(bundle());
    expect(search(idx, 'engine', { type: ['system'] }).length).toBeGreaterThan(0);
    expect(search(idx, 'engine', { tag: ['knowledge'] }).map((h) => h.cid)).toEqual([
      'systems/okf',
    ]);
  });

  it('skips symlink escapes during enumeration', () => {
    const root = bundle();
    const outside = join(root, '..', 'outside.md');
    writeFileSync(outside, 'secret');
    try {
      symlinkSync(outside, join(root, 'escape.md'));
      const idx = buildIndex(root);
      expect(idx.docs.some((d) => d.cid === 'escape')).toBe(false);
    } finally {
      // temp dir cleans itself
    }
  });
});
