import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { feedbackContainedPath } from '../src/index.js';

it('maps the trusted root alias while refusing redirected descendants and sibling escapes', () => {
  const base = realpathSync.native(mkdtempSync(join(tmpdir(), 'feedback boundary ')));
  const root = join(base, 'trusted');
  const alias = join(base, 'alias');
  const outside = join(base, 'trusted-sibling');
  mkdirSync(join(root, 'specs', 'test'), { recursive: true });
  mkdirSync(outside);
  const linkType = process.platform === 'win32' ? 'junction' : 'dir';
  symlinkSync(root, alias, linkType);
  try {
    expect(feedbackContainedPath(alias, join(alias, 'specs/test'))).toBe(join(root, 'specs/test'));
    expect(feedbackContainedPath(alias, join(root, 'specs/test'))).toBe(join(root, 'specs/test'));
    expect(feedbackContainedPath(alias, 'specs/test/new/file.md')).toBe(
      join(root, 'specs/test/new/file.md'),
    );
    expect(() => feedbackContainedPath(alias, outside)).toThrow('leaves');
    expect(() => feedbackContainedPath(alias, '../trusted-sibling')).toThrow('leaves');
    symlinkSync(outside, join(root, 'redirect'), linkType);
    expect(() => feedbackContainedPath(alias, 'redirect/new.md')).toThrow('Symlink');
    symlinkSync(join(root, 'specs'), join(root, 'inside-link'), linkType);
    expect(() => feedbackContainedPath(alias, 'inside-link/test')).toThrow('Symlink');
    writeFileSync(join(root, 'ordinary.md'), 'preserved');
    expect(feedbackContainedPath(alias, 'ordinary.md')).toBe(join(root, 'ordinary.md'));
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
