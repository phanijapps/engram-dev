import { describe, expect, it } from 'vitest';
import { runCorpus } from '../src/runner.js';
import { join } from 'node:path';

const CORPUS = join(__dirname, '..', 'corpus');

describe('the golden corpus', () => {
  const results = runCorpus(CORPUS);

  it('executes every case', () => {
    expect(results.length).toBe(26);
  });

  it('is green — conformance, regardless of runner language', () => {
    const failed = results.filter((r) => !r.ok);
    expect(failed, failed.map((f) => `\n${f.case}: ${f.detail}`).join('')).toEqual([]);
  });

  it('covers all three layers', () => {
    const layers = new Set(results.map((r) => r.layer));
    expect(layers.has('L1-canonical')).toBe(true);
    expect(layers.has('L2-refusals')).toBe(true);
    expect(layers.has('L3-events')).toBe(true);
  });
});
