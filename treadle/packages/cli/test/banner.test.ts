import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { brand } from '@treadle/brand';

/** White-label contract: the CLI says the brand token, never a literal. */
describe('cli banner', () => {
  it('main.ts contains no literal brand name', () => {
    const src = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    expect(src).not.toContain(`'${brand.name}'`);
    expect(src).toContain('brand.binName');
    expect(src).toContain('brand.tagline');
  });
});
