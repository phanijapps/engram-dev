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
// Below Claude Code's 10,000-character inline limit for prompt-hook context (D-2).
export const CONTEXT_BUDGET = 9000;
const PACK_LINE_LIMIT = 700;
const isRefused = (pack) => pack.stage === 'refused' || Boolean(pack.error);
const isFinished = (pack) => ['delivered', 'closed'].includes(String(pack.stage));
/** One compact line per open pack; the full record stays one `do status` away. */
export function packLine(pack) {
  const gate = pack.workflow ?? {};
  const reasons = (gate.reasons ?? []).slice(0, 3).map(String);
  const parts = [
    `${pack.name}: ${pack.stage}`,
    `gate ${gate.phase ?? 'unknown'}${reasons.length ? ` (${reasons.join('; ')})` : ''}`,
  ];
  if (pack.doing?.length) parts.push(`doing ${pack.doing.join(',')}`);
  if (pack.candidate) parts.push(`candidate ${pack.candidate.id} (not admitted)`);
  if (pack.openQuestions?.length) parts.push(`open ${pack.openQuestions.join(',')}`);
  if (pack.feedback) parts.push(`feedback (counts/IDs only) ${JSON.stringify(pack.feedback)}`);
  const line = parts.join(' | ');
  return line.length > PACK_LINE_LIMIT ? line.slice(0, PACK_LINE_LIMIT - 1) + '…' : line;
}
export function openPacks(report) {
  return report.specs.packs.filter((pack) => !isRefused(pack) && !isFinished(pack));
}
/** Guidance first, then whole pack lines until the budget; omissions are stated, never cut. */
export function compactBlock(report, connection, budget = CONTEXT_BUDGET) {
  const packs = report.specs.packs;
  const open = openPacks(report);
  const refused = packs.filter(isRefused);
  const finished = packs.filter((pack) => !isRefused(pack) && isFinished(pack));
  const head = [
    `Harness connected: ${connection.service.url}projects/${connection.project.id}/library/`,
    `Workspace: ${report.workspace}`,
    `Knowledge: ${report.wiki.root} (${report.wiki.available ? 'available' : 'missing'}; freshness ${report.wiki.freshness ?? 'unavailable'})`,
    report.wiki.limit,
    `Specs: ${report.specs.root}`,
    ...(report.specs.selectionRequired
      ? ['More than one spec is open. Ask which spec to continue; never guess.']
      : []),
    report.guidance.newSpec,
    report.guidance.continueSpec,
    `Open specs: ${open.length}; delivered or closed: ${finished.length}; refused: ${refused.length}${refused.length ? ` (${refused.map((pack) => pack.name).join(', ')})` : ''}`,
  ];
  const lines = [...head];
  let size = head.join('\n').length;
  const omittedNote = (n) =>
    `${n} more open spec(s) omitted; run do where ${report.workspace} --json for the full list.`;
  const reserve = omittedNote(open.length).length + 1;
  for (const [index, pack] of open.entries()) {
    const line = packLine(pack);
    const last = index === open.length - 1;
    if (size + 1 + line.length + (last ? 0 : reserve) > budget) {
      lines.push(omittedNote(open.length - index));
      break;
    }
    lines.push(line);
    size += 1 + line.length;
  }
  return lines.join('\n').slice(0, budget);
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
    return { available: true, block: compactBlock(report, connection), report };
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
