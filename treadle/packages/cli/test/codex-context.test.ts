import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cli = fileURLToPath(new URL('../dist/src/main.js', import.meta.url));
const hook = fileURLToPath(new URL('../harness/hooks/codex-context.js', import.meta.url));
it('runs the documented stdin/context contract, event workspace and next-event restart without owner acts', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex context ü ')),
    state = join(root, 'state'),
    workspace = join(root, 'workspace');
  mkdirSync(workspace);
  const env = { ...process.env, HARNESS_STATE_DIR: state, HARNESS_RUNTIME_ENTRY: cli };
  const callback = () =>
    spawnSync(process.execPath, [hook, '--event', 'UserPromptSubmit'], {
      input: JSON.stringify({
        hook_event_name: 'UserPromptSubmit',
        cwd: workspace,
        prompt: 'secret not persisted',
      }),
      env,
      encoding: 'utf8',
      timeout: 30000,
    });
  try {
    const a = callback();
    expect(a.status, a.stderr).toBe(0);
    const out = JSON.parse(a.stdout);
    expect(out.hookSpecificOutput.hookEventName).toBe('UserPromptSubmit');
    expect(out.hookSpecificOutput.additionalContext).toContain(workspace);
    const first = JSON.parse(readFileSync(join(state, 'service.json'), 'utf8'));
    expect(out.hookSpecificOutput.additionalContext).not.toContain(first.token);
    expect(readFileSync(join(state, 'projects.json'), 'utf8')).not.toContain(
      'secret not persisted',
    );
    const stop = spawnSync(process.execPath, [cli, 'stop', 'serve'], { env, encoding: 'utf8' });
    expect(stop.status).toBe(0);
    expect(callback().status).toBe(0);
    expect(JSON.parse(readFileSync(join(state, 'service.json'), 'utf8')).instance).not.toBe(
      first.instance,
    );
    const missing = spawnSync(process.execPath, [hook, '--event', 'SessionStart'], {
      input: '{}',
      env,
      encoding: 'utf8',
    });
    expect(JSON.parse(missing.stdout).systemMessage).toContain('workspace is missing');
  } finally {
    spawnSync(process.execPath, [cli, 'stop', 'serve'], { env });
    rmSync(root, { recursive: true, force: true });
  }
}, 30000);
it('bounds malformed input and unavailable runtime with actionable status', () => {
  const out = spawnSync(process.execPath, [hook, '--event', 'SessionStart'], {
    input: '{',
    env: { ...process.env, HARNESS_RUNTIME_ENTRY: '/missing/runtime' },
    encoding: 'utf8',
  });
  expect(out.status).toBe(0);
  expect(JSON.parse(out.stdout).systemMessage).toContain('workspace is missing');
});
