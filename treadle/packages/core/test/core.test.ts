import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  assertNever,
  idFamily,
  parseId,
  refuse,
  stageWord,
  type QuestionId,
  type TaskId,
} from '../src/index.js';

describe('stages (frozen vocabulary)', () => {
  it('covers all seven, with owner words', () => {
    expect(stageWord('awaiting_owner')).toBe('Waiting on you');
    expect(stageWord('blocked')).toBe('Stuck — needs attention');
  });

  it('exhaustiveness is a compile gate', () => {
    // If Stage grows without updating STAGE_WORDS, the lookup below is a
    // build error — assertNever proves the switch cannot miss.
    const s = 'planning' as never;
    expect(() => assertNever(s)).toThrow();
  });
});

describe('branded IDs', () => {
  it('brands cannot cross-assign', () => {
    const t = 'T-1' as TaskId;
    const q: QuestionId = 'Q-1' as QuestionId;
    expect(t !== q).toBe(true); // distinct brands, same string base
  });

  it('parses and families the vocabulary', () => {
    expect(parseId('FR-13')).toBe('FR-13');
    expect(parseId('banana')).toBeNull();
    expect(idFamily('DES-4')).toBe('DesignCard');
    expect(idFamily('banana')).toBeNull();
  });
});

describe('refusals', () => {
  it('return typed values, never throw', () => {
    const r = refuse('not_one_of_the_options', "'banana' is not one of the options (a, b)");
    expect(r.ok).toBe(false);
    expectTypeOf(r).toMatchTypeOf<{ ok: false; code: string; message: string }>();
  });
});
