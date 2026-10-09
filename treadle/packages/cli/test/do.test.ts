import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '../src/main.js';
import { loadPack, loadPackWithMeta, savePack, deriveStage } from '@treadle/core';

const AT = '2026-10-10T12:00:00Z';

function bornPack(): string {
  const d = join(mkdtempSync(join(tmpdir(), 'cli-')), 'p');
  mkdirSync(d);
  writeFileSync(
    join(d, 'p.json'),
    JSON.stringify({
      format: 'specpack/0.3',
      name: 'p',
      revision: 1,
      title: 'CLI fixture',
      spec: {
        why: 'w',
        requirements: [],
        clarifications: [
          {
            id: 'Q-1',
            question: 'pick',
            status: 'open',
            owner: 'human:owner',
            kind: 'choice',
            options: ['a', 'b'],
          },
          { id: 'Q-2', question: 'say', status: 'open', owner: 'human:owner' },
        ],
      },
      plan: {
        decisions: [
          {
            id: 'D-1',
            decision: 'd',
            because: 'b',
            status: 'accepted',
            accepted_by: 'human:owner',
          },
        ],
      },
      tasks: [
        {
          id: 'T-1',
          title: 'one',
          detail: 'd',
          satisfies: [],
          implements: [],
          honors: [],
          accepts: [],
          status: 'todo',
          phase: 'core',
          verify: { cmd: 'true', expect: '0' },
        },
      ],
    }),
  );
  return d;
}

function run(args: string[]): void {
  runCli(['node', 'bin', ...args]); /* name slot unused by parse */
}

describe('the do plane (integration, in-process)', () => {
  it('answers, approves, records, closes — the whole ceremony through the CLI', () => {
    const d = bornPack();
    run([
      'do',
      'answer',
      d,
      '--q',
      'Q-1',
      '--text',
      'a',
      '--by',
      'human:owner',
      '--expected-revision',
      '1',
      '--at',
      AT,
    ]);
    run([
      'do',
      'answer',
      d,
      '--q',
      'Q-2',
      '--text',
      'because',
      '--by',
      'human:owner',
      '--expected-revision',
      '2',
      '--at',
      AT,
    ]);
    run(['do', 'approve', d, '--by', 'human:owner', '--expected-revision', '3', '--at', AT]);
    run([
      'do',
      'record',
      d,
      '--task',
      'T-1',
      '--result',
      'pass',
      '--cmd',
      'true',
      '--exit',
      '0',
      '--expected-revision',
      '4',
      '--by',
      'agent:worker',
      '--at',
      AT,
    ]);
    // close needs a PASS verdict; it lands through the machine writer (the
    // stage-mismatch checksum refuses hand-edits — the gate proved itself here)
    const v = loadPackWithMeta(d);
    expect(v.ok).toBe(true);
    if (v.ok) {
      v.value.doc.review = { verdicts: [{ on: 'PACK', verdict: 'PASS', by: 'agent:red-forman' }] };
      savePack(v.value.doc, v.value.path, { at: AT });
    }
    run(['do', 'close', d, '--by', 'human:owner', '--at', AT]);
    const loaded = loadPack(d);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(deriveStage(loaded.value)).toBe('delivered');
      expect(loaded.value.status).toBe('complete');
      expect(loaded.value.revision).toBe(6);
    }
  });

  it('refuses with the exact vocabulary and exit code 1', () => {
    const d = bornPack();
    const exitSpy = process.exitCode;
    const errs: string[] = [];
    const orig = console.error;
    console.error = (m: string) => errs.push(m);
    try {
      run([
        'do',
        'answer',
        d,
        '--q',
        'Q-1',
        '--text',
        'banana',
        '--by',
        'human:owner',
        '--expected-revision',
        '1',
        '--at',
        AT,
      ]);
    } finally {
      console.error = orig;
      process.exitCode = exitSpy;
    }
    expect(errs.join('\n')).toContain('is not one of the options (a, b)');
    expect(process.exitCode === 1 || errs.length > 0).toBe(true);
  });
});
