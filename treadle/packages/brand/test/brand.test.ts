import { describe, expect, it } from 'vitest';
import { brand } from '../src/index.js';

describe('brand tokens', () => {
  it('carries the name, bin, tagline, and lineage', () => {
    expect(brand.name).toBe('Wukong');
    expect(brand.binName).toBe('wukong');
    expect(brand.formerly).toBe('treadle');
    expect(brand.stateDirectory).toBe('treadle');
  });

  it('keeps format tags as contracts, not brands', () => {
    expect(brand.formatTags.pack).toBe('specpack/0.3');
  });
});
