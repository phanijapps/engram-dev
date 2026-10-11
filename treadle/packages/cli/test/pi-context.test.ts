import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cli = fileURLToPath(new URL('../dist/src/main.js', import.meta.url));
it('registers once, uses ctx.cwd and reconnects before prompts without message mutation or session-owned shutdown', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pi-context-')),
    workspace = join(root, 'active'),
    state = join(root, 'state');
  mkdirSync(workspace);
  const original = process.env.HARNESS_STATE_DIR,
    entry = process.env.HARNESS_RUNTIME_ENTRY;
  process.env.HARNESS_STATE_DIR = state;
  process.env.HARNESS_RUNTIME_ENTRY = cli;
  try {
    const module = await import('../harness/hooks/session-recall.js');
    const handlers = new Map<string, Function>(),
      sent: unknown[] = [];
    const pi = {
      on: (name: string, fn: Function) => {
        expect(handlers.has(name)).toBe(false);
        handlers.set(name, fn);
      },
      sendMessage: (message: unknown) => sent.push(message),
    };
    module.default(pi);
    module.default(pi);
    expect([...handlers.keys()]).toEqual(['session_start', 'before_agent_start']);
    await handlers.get('session_start')!({}, { cwd: workspace });
    expect((sent[0] as { content: string }).content).toContain(workspace);
    const before = JSON.parse(readFileSync(join(state, 'service.json'), 'utf8')).instance;
    expect(spawnSync(process.execPath, [cli, 'stop', 'serve'], { env: process.env }).status).toBe(
      0,
    );
    const message = await handlers.get('before_agent_start')!(
      { prompt: 'private' },
      { cwd: workspace },
    );
    expect(message.message.customType).toBe('project-context');
    expect(message.message.content).toContain(workspace);
    expect(JSON.parse(readFileSync(join(state, 'service.json'), 'utf8')).instance).not.toBe(before);
    expect(readFileSync(join(state, 'projects.json'), 'utf8')).not.toContain('private');
  } finally {
    spawnSync(process.execPath, [cli, 'stop', 'serve'], { env: process.env });
    if (original === undefined) delete process.env.HARNESS_STATE_DIR;
    else process.env.HARNESS_STATE_DIR = original;
    if (entry === undefined) delete process.env.HARNESS_RUNTIME_ENTRY;
    else process.env.HARNESS_RUNTIME_ENTRY = entry;
    rmSync(root, { recursive: true, force: true });
  }
}, 30000);
