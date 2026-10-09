import { describe, expect, it } from 'vitest';
import { listCases } from '../src/corpus.js';

describe('the golden corpus', () => {
  it('carries at least the first L1 golden, discoverable', () => {
    const cases = listCases(new URL('../corpus', import.meta.url).pathname);
    const l1 = cases.filter((c) => c.layer.startsWith('L1'));
    expect(l1.length).toBeGreaterThanOrEqual(1);
    expect(l1.every((c) => c.hasExpectedEmit)).toBe(true);
  });
});
