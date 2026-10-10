import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const Ajv = require('ajv/dist/2020.js');
const schema = JSON.parse(
  readFileSync(
    new URL(
      '../../../../wiki/assets/contracts/specpack-owner-workflow.schema.json',
      import.meta.url,
    ),
    'utf8',
  ),
);
const validate = new Ajv({ strict: false, allErrors: true, validateFormats: false }).compile(
  schema,
);
const corpus = new URL('../corpus/L4-owner-workflow/', import.meta.url);

describe('the owner workflow schema', () => {
  it('validates every owner phase with the repository validator', () => {
    const phases = readdirSync(corpus);
    expect(phases).toHaveLength(6);
    for (const phase of phases) {
      const doc = JSON.parse(readFileSync(new URL(`${phase}/input/p.json`, corpus), 'utf8'));
      expect(validate(doc), JSON.stringify(validate.errors)).toBe(true);
    }
  });

  it('refuses agent claims in owner acts', () => {
    const doc = JSON.parse(readFileSync(new URL('delivered/input/p.json', corpus), 'utf8'));
    expect(validate(doc), JSON.stringify(validate.errors)).toBe(true);
    const act = {
      id: 'approval',
      kind: 'start',
      by: 'human:owner',
      at: '2026-10-10T12:00:00Z',
      revision: 1,
    };
    doc.workflow.acts.push(act);
    expect(validate(doc), JSON.stringify(validate.errors)).toBe(true);
    act.by = 'agent:invented';
    expect(validate(doc)).toBe(false);
  });
});
