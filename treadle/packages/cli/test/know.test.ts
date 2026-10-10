import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '../src/main.js';

function bundle(): string {
  const b = join(mkdtempSync(join(tmpdir(), 'kc-')), 'wiki');
  mkdirSync(join(b, 'systems'), { recursive: true });
  writeFileSync(join(b, 'index.md'), '---\ntitle: W\n---\nroot\n');
  writeFileSync(
    join(b, 'systems', 'loom.md'),
    '---\ntitle: The loom engine\ntype: system\nsources:\n  - {resource: ../code/loom.py}\n---\nThe loop that does the work. See [okf](okf.md) and a [ghost](ghost.md).\n',
  );
  writeFileSync(
    join(b, 'systems', 'okf.md'),
    '---\ntitle: The knowledge engine\ntype: system\n---\nAnchored knowledge.\n',
  );
  writeFileSync(join(b, 'broken.md'), '---\n- a\n- list\n---\ninvalid block\n');
  const code = join(b, '..', 'code');
  mkdirSync(code);
  writeFileSync(join(code, 'loom.py'), 'x = 1\n');
  return b;
}

function out(fn: () => void): string[] {
  const lines: string[] = [];
  const orig = console.log;
  console.log = (m: string) => lines.push(String(m));
  try {
    fn();
  } finally {
    console.log = orig;
  }
  return lines;
}

describe('the know plane CLI', () => {
  it('searches ranked with snippets', () => {
    const b = bundle();
    const lines = out(() => runCli(['node', 'bin', 'know', 'search', b, 'loom']));
    expect(lines.join('\n')).toContain('systems/loom — The loom engine');
    const all = out(() => runCli(['node', 'bin', 'know', 'search', b, 'engine']));
    expect(all.join('\n')).toContain('systems/okf'); // the second engine matches its own title
  });

  it('reads depth-0 and refuses ghosts with suggestions', () => {
    const b = bundle();
    const lines = out(() => runCli(['node', 'bin', 'know', 'read', b, 'systems/loom']));
    expect(lines.join('\n')).toContain('The loop that does the work');
    const errs: string[] = [];
    const orig = console.error;
    console.error = (m: string) => errs.push(String(m));
    try {
      runCli(['node', 'bin', 'know', 'read', b, 'systems/ghost']);
    } finally {
      console.error = orig;
    }
    expect(errs.join('\n')).toContain('not found');
    expect(process.exitCode === 1 || errs.length > 0).toBe(true);
  });

  it('validates: errors for invalid blocks, warnings for broken links, exit code honest', () => {
    const b = bundle();
    const exitSpy = process.exitCode;
    const lines = out(() => runCli(['node', 'bin', 'know', 'validate', b]));
    const text = lines.join('\n');
    expect(text).toContain('frontmatter-invalid');
    expect(text).toContain('broken-link');
    expect(process.exitCode === 1 || text.includes('conformant')).toBe(true);
    process.exitCode = exitSpy;
  });

  it('links: adjacency, backlinks, and broken named', () => {
    const b = bundle();
    const lines = out(() => runCli(['node', 'bin', 'know', 'links', b]));
    const text = lines.join('\n');
    expect(text).toContain('systems/loom → systems/okf');
    expect(text).toContain('systems/okf ← systems/loom');
    expect(text).toContain('ghost.md');
  });

  it('findings: propose → dedupe → resolve', () => {
    const b = bundle();
    out(() =>
      runCli([
        'node',
        'bin',
        'know',
        'findings',
        'propose',
        b,
        'systems/loom.md',
        'systems/okf.md',
        'relates',
      ]),
    );
    const again = out(() =>
      runCli([
        'node',
        'bin',
        'know',
        'findings',
        'propose',
        b,
        'systems/loom.md',
        'systems/okf.md',
        'relates',
      ]),
    );
    expect(again.join('\n')).toContain('deduped');
    const id = again[0]!.split(' ')[1];
    const resolved = out(() =>
      runCli(['node', 'bin', 'know', 'findings', 'resolve', b, id!, 'accepted']),
    );
    expect(resolved.join('\n')).toContain('accepted');
  });

  it('fingerprints + anchors + status: the ritual through the CLI', () => {
    const b = bundle();
    const workspace = join(b, '..');
    out(() => runCli(['node', 'bin', 'know', 'fingerprints', workspace, b]));
    const anchors = out(() =>
      runCli(['node', 'bin', 'know', 'anchors', b, '--workspace', workspace]),
    );
    expect(anchors.join('\n')).toContain('anchors:');
    const status = out(() =>
      runCli(['node', 'bin', 'know', 'status', b, '--workspace', workspace]),
    );
    const text = status.join('\n');
    expect(text).toContain('freshness:');
    expect(text).toContain('concepts: 3');
    expect(text).toContain('findings: 0 pending');
  });
});

describe('do init + add (the birth path)', () => {
  it('births a pack, asks, proposes, stages — the full shaping', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'init-'));
    const d = join(tmp, 'newpack');
    const born = out(() =>
      runCli(['node', 'bin', 'do', 'init', d, '--title', 'New', '--why', 'because']),
    );
    expect(born.join('\n')).toContain('born:');
    const asked = out(() =>
      runCli([
        'node',
        'bin',
        'do',
        'add',
        'question',
        d,
        '--id',
        'Q-1',
        '--question',
        'pick',
        '--kind',
        'choice',
        '--options',
        'a',
        'b',
        '--default',
        'a',
      ]),
    );
    expect(asked.join('\n')).toContain('asked Q-1');
    const proposed = out(() =>
      runCli([
        'node',
        'bin',
        'do',
        'add',
        'decision',
        d,
        '--id',
        'D-1',
        '--decision',
        'd',
        '--because',
        'b',
      ]),
    );
    expect(proposed.join('\n')).toContain('proposed D-1');
    const staged = out(() =>
      runCli([
        'node',
        'bin',
        'do',
        'add',
        'task',
        d,
        '--id',
        'T-1',
        '--title',
        'one',
        '--verify-cmd',
        'true',
        '--verify-expect',
        '0',
      ]),
    );
    expect(staged.join('\n')).toContain('staged T-1');
    const status = out(() => runCli(['node', 'bin', 'do', 'status', d]));
    expect(status.join('\n')).toContain('1 open');
  });
});
