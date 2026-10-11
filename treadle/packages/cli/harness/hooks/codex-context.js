#!/usr/bin/env node
/** Shared lifecycle callback. No prompt/transcript persistence and no owner acts. */
import { execFile } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
export function runtimeConfig() {
  const pointer = join(dirname(fileURLToPath(import.meta.url)), 'runtime.json');
  if (process.env.HARNESS_RUNTIME_ENTRY)
    return { node: process.execPath, entry: resolve(process.env.HARNESS_RUNTIME_ENTRY) };
  if (existsSync(pointer)) {
    const p = JSON.parse(readFileSync(pointer, 'utf8'));
    if (
      p.format !== 'runtime-pointer/1' ||
      p.protocol !== 1 ||
      typeof p.node !== 'string' ||
      typeof p.entry !== 'string' ||
      !existsSync(p.entry)
    )
      throw Error(
        'Runtime pointer is incompatible or missing. Reinstall the harness from your installed runtime.',
      );
    return p;
  }
  const entry = fileURLToPath(new URL('../../dist/src/main.js', import.meta.url));
  if (existsSync(entry)) return { node: process.execPath, entry };
  throw Error(
    'Runtime is unavailable. Install Node >=22 and the runtime, then reinstall the harness.',
  );
}
function invoke(config, args, cwd) {
  return new Promise((done, reject) =>
    execFile(
      config.node,
      [config.entry, ...args],
      { cwd, timeout: 20000, maxBuffer: 1024 * 1024, windowsHide: true },
      (error, stdout) => {
        if (error)
          return reject(
            Error(
              'Runtime command failed or timed out; run project connect <workspace> and context --workspace <workspace> to inspect it.',
            ),
          );
        try {
          done(JSON.parse(stdout));
        } catch {
          reject(
            Error(
              'Runtime returned invalid context JSON; reinstall matching runtime and harness versions.',
            ),
          );
        }
      },
    ),
  );
}
export async function eventContext(workspace) {
  if (typeof workspace !== 'string' || !workspace.trim())
    return {
      available: false,
      block:
        'Harness connection unavailable: event workspace is missing. Use project connect <workspace> and context --workspace <workspace>.',
    };
  try {
    const config = runtimeConfig();
    const connection = await invoke(config, ['project', 'connect', workspace, '--json'], workspace);
    const report = await invoke(config, ['context', '--workspace', workspace, '--json'], workspace);
    if (report.format !== 'context/1' || !report.specs || !Array.isArray(report.specs.packs))
      throw Error('Unsupported context protocol; reinstall matching runtime and harness versions.');
    const lines = [
      `Harness connected: ${connection.service.url}projects/${connection.project.id}/library/`,
      `Workspace: ${report.workspace}`,
      `Knowledge: ${report.wiki.root} (${report.wiki.available ? 'available' : 'missing'}; freshness ${report.wiki.freshness ?? 'unavailable'})`,
      report.wiki.limit,
      `Specs: ${report.specs.root}`,
    ];
    for (const pack of report.specs.packs) lines.push(JSON.stringify(pack));
    if (report.specs.selectionRequired)
      lines.push('More than one spec is open. Ask which spec to continue; never guess.');
    lines.push(report.guidance.newSpec, report.guidance.continueSpec);
    return { available: true, block: lines.join('\n').slice(0, 24000), report };
  } catch (error) {
    return {
      available: false,
      block: `Harness connection unavailable: ${error.message}`.slice(0, 1000),
    };
  }
}
export async function stdinEvent() {
  return new Promise((done) => {
    let size = 0,
      raw = '',
      ended = false;
    const finish = (value) => {
      if (!ended) {
        ended = true;
        clearTimeout(timer);
        process.stdin.pause();
        done(value);
      }
    };
    const timer = setTimeout(() => finish(null), 5000);
    process.stdin.on('data', (chunk) => {
      size += chunk.length;
      if (size > 65536) return finish(null);
      raw += chunk;
    });
    process.stdin.on('end', () => {
      try {
        finish(JSON.parse(raw));
      } catch {
        finish(null);
      }
    });
    process.stdin.on('error', () => finish(null));
  });
}
export async function runEvent(host, expectedEvent) {
  const event = await stdinEvent();
  const name = event?.hook_event_name ?? expectedEvent;
  if (
    !['SessionStart', 'UserPromptSubmit'].includes(name) ||
    (expectedEvent && name !== expectedEvent)
  ) {
    console.log(
      JSON.stringify({
        systemMessage: 'Harness hook event is invalid. Reinstall the host integration.',
      }),
    );
    return;
  }
  const result = await eventContext(event?.cwd);
  console.log(
    JSON.stringify({
      ...(!result.available ? { systemMessage: result.block } : {}),
      hookSpecificOutput: { hookEventName: name, additionalContext: result.block },
    }),
  );
}
const invoked = (() => {
  try {
    return (
      process.argv[1] &&
      realpathSync.native(process.argv[1]) === realpathSync.native(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
})();
if (invoked) {
  const event = process.argv[process.argv.indexOf('--event') + 1];
  await runEvent('codex', event);
}
// pi may discover support modules in compatibility extension directories.
export default function () {}
