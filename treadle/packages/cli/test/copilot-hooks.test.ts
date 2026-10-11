import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const hook = fileURLToPath(new URL('../harness/hooks/copilot-context.js', import.meta.url));
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
function fixture(mode = 'ok') {
  const root = mkdtempSync(join(tmpdir(), 'copilot context ü '));
  roots.push(root);
  const runtime = join(root, 'runtime.mjs'),
    calls = join(root, 'calls.jsonl');
  writeFileSync(
    runtime,
    `import {appendFileSync} from 'node:fs';
const args=process.argv.slice(2);
appendFileSync(${JSON.stringify(calls)},JSON.stringify(args)+'\\n');
if(${JSON.stringify(mode)}==='hang'){setInterval(()=>{},1000);}
else if(${JSON.stringify(mode)}==='invalid'){console.log('not json');}
else if(${JSON.stringify(mode)}==='fail'){process.exit(1);}
else if(args[0]==='project'){console.log(JSON.stringify({service:{url:'http://127.0.0.1:9999/'},project:{id:'test'}}));}
else {console.log(JSON.stringify({format:'context/1',workspace:process.cwd(),wiki:{root:'wiki',available:true,freshness:'fresh',limit:'HEAD-only'},specs:{root:'specs',packs:[]},guidance:{newSpec:'New spec',continueSpec:'Continue spec'}}));}
`,
  );
  const run = (
    event = 'sessionStart',
    input = JSON.stringify({ cwd: root, prompt: 'PRIVATE_PROMPT', sessionId: 'PRIVATE_ID' }),
  ) =>
    spawnSync(process.execPath, [hook, '--event', event], {
      cwd: root,
      input,
      env: { ...process.env, HARNESS_RUNTIME_ENTRY: runtime },
      encoding: 'utf8',
      timeout: 28000,
    });
  return { root, runtime, calls, run };
}
it('returns session context in the Copilot envelope and reconnects on prompts', () => {
  const f = fixture(),
    start = f.run();
  expect(start.status, start.stderr).toBe(0);
  const out = JSON.parse(start.stdout);
  expect(Object.keys(out)).toEqual(['additionalContext']);
  expect(out.additionalContext).toContain(f.root);
  expect(out.additionalContext).toContain('Harness connected:');
  const prompt = f.run('userPromptSubmitted');
  expect(prompt.status, prompt.stderr).toBe(0);
  expect(JSON.parse(prompt.stdout)).toEqual({});
  const calls = readFileSync(f.calls, 'utf8');
  expect(calls.trim().split('\n')).toHaveLength(4);
  expect(calls).not.toMatch(/PRIVATE_PROMPT|PRIVATE_ID/);
  expect(start.stdout + prompt.stdout + start.stderr + prompt.stderr).not.toMatch(
    /PRIVATE_PROMPT|PRIVATE_ID/,
  );
});
it.each(['{', 'null', '[]', JSON.stringify({ prompt: 'PRIVATE_PROMPT' }), ' '.repeat(65537)])(
  'bounds invalid stdin and missing workspace (%#)',
  (input) => {
    const out = fixture().run('sessionStart', input);
    expect(out.status, out.stderr).toBe(0);
    expect(JSON.parse(out.stdout).additionalContext).toMatch(/invalid|workspace is missing/);
    expect(out.stdout + out.stderr).not.toContain('PRIVATE_PROMPT');
    expect(out.stdout.length + out.stderr.length).toBeLessThan(2500);
  },
);
it.each(['invalid', 'fail'])('reports runtime %s failures and recovers after repair', (mode) => {
  const f = fixture(mode),
    failed = f.run();
  expect(failed.status).toBe(0);
  expect(JSON.parse(failed.stdout).additionalContext).toContain('unavailable');
  expect(f.run('userPromptSubmitted').stdout.trim()).toBe('{}');
  const healthy = fixture();
  writeFileSync(f.runtime, readFileSync(healthy.runtime));
  expect(JSON.parse(f.run().stdout).additionalContext).toContain('Harness connected:');
});
it('rejects unsupported events before connecting', () => {
  const out = fixture().run('sessionEnd');
  expect(out.status).toBe(0);
  expect(JSON.parse(out.stdout)).toEqual({});
  expect(out.stderr).toContain('invalid');
});
it('reports unavailable runtime without exposing input', () => {
  const f = fixture();
  rmSync(f.runtime);
  const out = f.run();
  expect(out.status).toBe(0);
  expect(JSON.parse(out.stdout).additionalContext).toContain('unavailable');
  expect(out.stdout + out.stderr).not.toMatch(/PRIVATE_PROMPT|PRIVATE_ID/);
});
it('bounds a stalled runtime and returns recovery guidance', () => {
  const started = Date.now();
  const out = fixture('hang').run();
  expect(out.status, out.stderr).toBe(0);
  expect(JSON.parse(out.stdout).additionalContext).toContain('timed out');
  expect(Date.now() - started).toBeLessThan(27000);
}, 30000);
