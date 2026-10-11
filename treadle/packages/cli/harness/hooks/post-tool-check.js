#!/usr/bin/env node
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
/** post-tool-check (harness/0.1) — the machine-managed guard.
 *
 *  Refuses writes into machine-managed trees (the golden corpus, the
 *  generated wiki code index) unless HARNESS_ALLOW_MACHINE_EDITS=1 is
 *  set. Hand edits there fight the engines; the guard makes the fight
 *  loud instead of silent.
 *
 *  Dual entry, one contract:
 *  - script mode:  node post-tool-check.js '<json>'  — argv JSON in,
 *    decision out. Exit 0 = pass, 3 = refuse, 1 = error (never guess).
 *  - extension mode: loaded by pi as an extension; the default export
 *    registers the same guard on tool_call.
 */
const MANAGED = [
  /(^|\/)corpus\/(?:[^/]+\/)*(?:golden\/|expected\/|expected\.[^/]+$)/,
  /(^|\/)wiki\/code\//,
];
const ALLOW_ENV = 'HARNESS_ALLOW_MACHINE_EDITS';

/** Pure check: { ok, reason } for a payload with a file path. */
export function check(payload) {
  if (!payload || typeof payload !== 'object')
    return { ok: false, reason: 'no payload — refusing rather than guessing' };
  const path = payload.tool_path ?? payload.file_path ?? payload.path;
  if (typeof path !== 'string' || path === '')
    return { ok: false, reason: 'no file path in payload — refusing rather than guessing' };
  if (process.env[ALLOW_ENV] === '1') return { ok: true, reason: `${ALLOW_ENV}=1 set` };
  const hit = MANAGED.find((re) => re.test(path.split('\\').join('/')));
  if (hit)
    return {
      ok: false,
      reason: `machine-managed (${String(hit)}) — the engines write here; hand edits fight them (${ALLOW_ENV}=1 overrides)`,
    };
  return { ok: true, reason: 'not machine-managed' };
}

// ── script mode (Claude PostToolUse stdin, legacy argv callers) ──
// enter ONLY when this file is the invoked program — not when pi
// imports it as an extension (pi's own argv must never reach here;
// the dogfooded load-kill proved why)
const invoked = (() => {
  try {
    return (
      process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
    );
  } catch {
    return false;
  }
})();
if (invoked) {
  let payload;
  try {
    if (process.argv[2] !== undefined) payload = JSON.parse(process.argv[2]);
    else {
      let input = '';
      for await (const chunk of process.stdin) {
        input += chunk;
        if (Buffer.byteLength(input) > 65536) throw Error('hook input exceeds 64 KiB');
      }
      payload = JSON.parse(input);
    }
  } catch (e) {
    console.error(
      JSON.stringify({ ok: false, reason: `payload is not bounded JSON: ${e.message}` }),
    );
    process.exit(1);
  }
  if (payload?.hook_event_name === 'PostToolUse') {
    const args = payload.tool_input ?? {};
    const path = args.file_path ?? args.path ?? args.notebook_path ?? args.filePath;
    // PostToolUse cannot prevent a completed write; report its result as advisory context.
    if (
      typeof path === 'string' &&
      /(write|edit|patch|create|replace|notebook|apply)/i.test(String(payload.tool_name ?? ''))
    ) {
      const out = check({ tool_path: path });
      console.log(JSON.stringify(out.ok ? {} : { systemMessage: out.reason }));
    } else console.log('{}');
    process.exit(0);
  }
  const out = check(payload);
  console.log(JSON.stringify(out));
  process.exit(out.ok ? 0 : 3);
}

// ── extension mode (pi) ──
// guards WRITES only — reads of machine-managed trees stay free (R2 #20)
const WRITE_TOOL = /(write|edit|patch|create|replace|notebook|apply)/i;
export default function (pi) {
  pi.on('tool_call', async (event) => {
    if (!WRITE_TOOL.test(String(event.toolName ?? ''))) return; // reads pass
    const args = event.input ?? {};
    const path = args.file_path ?? args.path ?? args.notebook_path ?? args.filePath ?? '';
    if (path === '') return; // nothing file-shaped to guard
    const out = check({ tool_path: String(path) });
    if (!out.ok) return { block: true, reason: out.reason };
  });
}
