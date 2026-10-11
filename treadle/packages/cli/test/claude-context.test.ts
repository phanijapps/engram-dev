import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const cli = fileURLToPath(new URL('../dist/src/main.js', import.meta.url)),
  hook = fileURLToPath(new URL('../harness/hooks/claude-context.js', import.meta.url));
it('connects startup/resume/preprompt workspace and never shuts down with session lifetime', () => {
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
    spawnSync(process.execPath, [cli, 'stop', 'serve'], { env });
    rmSync(root, { recursive: true, force: true });
  }
}, 30000);
