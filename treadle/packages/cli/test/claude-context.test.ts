import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const cli = fileURLToPath(new URL('../dist/src/main.js', import.meta.url)),
  hook = fileURLToPath(new URL('../harness/hooks/claude-context.js', import.meta.url));
it('connects startup/resume/preprompt workspace and never shuts down with session lifetime', async () => {
  const root = mkdtempSync(join(tmpdir(), 'claude context ü ')),
    workspace = join(root, 'actual workspace'),
    state = join(root, 'state');
  mkdirSync(workspace);
  const env = { ...process.env, HARNESS_STATE_DIR: state, HARNESS_RUNTIME_ENTRY: cli };
  try {
    let instance;
    for (const event of ['SessionStart', 'UserPromptSubmit']) {
      const r = spawnSync(process.execPath, [hook, '--event', event], {
        env,
        input: JSON.stringify({
          cwd: workspace,
          hook_event_name: event,
          source: 'resume',
          prompt: 'not retained',
        }),
        encoding: 'utf8',
        timeout: 30000,
      });
      expect(r.status, r.stderr).toBe(0);
      const out = JSON.parse(r.stdout);
      expect(out.hookSpecificOutput.hookEventName).toBe(event);
      expect(out.hookSpecificOutput.additionalContext).toContain(workspace);
      const current = JSON.parse(readFileSync(join(state, 'service.json'), 'utf8')).instance;
      if (instance) expect(current).toBe(instance);
      instance = current;
    }
    expect(readFileSync(join(state, 'projects.json'), 'utf8')).not.toContain('not retained');
  } finally {
    const stopped = spawnSync(process.execPath, [cli, 'stop', 'serve'], {
      env,
      encoding: 'utf8',
      timeout: 15000,
    });
    try {
      expect(stopped.status, stopped.stderr).toBe(0);
    } finally {
      // Windows can briefly retain filesystem handles after service shutdown.
      await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  }
}, 30000);
it('keeps a crowded workspace inside the Claude Code inline limit through the real entrypoint', () => {
  const root = mkdtempSync(join(tmpdir(), 'claude context budget ')),
    runtime = join(root, 'runtime.mjs');
  const reason = 'Approve the answered spec questions before planning continues';
  const packs = Array.from({ length: 40 }, (_, i) => ({
    name: `pack-${i}`,
    stage: 'planning',
    workflow: { phase: 'spec', reasons: [reason, reason, reason] },
    doing: [],
    candidate: null,
    openQuestions: ['Q-1'],
  }));
  writeFileSync(
    runtime,
    `const args = process.argv.slice(2);
if (args[0] === 'project') console.log(JSON.stringify({ service: { url: 'http://127.0.0.1:1/' }, project: { id: 'p' } }));
else console.log(JSON.stringify({ format: 'context/1', workspace: process.cwd(), wiki: { root: 'wiki', available: true, freshness: 'fresh', limit: 'fixture' }, specs: { root: 'specs', packs: ${JSON.stringify(packs)}, selectionRequired: true }, guidance: { newSpec: 'n', continueSpec: 'c' } }));
`,
  );
  try {
    const r = spawnSync(process.execPath, [hook, '--event', 'UserPromptSubmit'], {
      env: { ...process.env, HARNESS_RUNTIME_ENTRY: runtime },
      input: JSON.stringify({ cwd: root, hook_event_name: 'UserPromptSubmit' }),
      encoding: 'utf8',
      timeout: 30000,
    });
    expect(r.status, r.stderr).toBe(0);
    const context: string = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
    // Claude Code inlines at most 10,000 characters of hook context.
    expect(context.length).toBeLessThanOrEqual(9000);
    expect(context.split('\n').at(-1)).toMatch(/^\d+ more open spec\(s\) omitted/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
