#!/usr/bin/env node
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
const MANAGED = [/\/corpus\/.*\/golden\//, /\/corpus\/.*\/expected\//, /(^|\/)wiki\/code\//];
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

// ── script mode (claude settings wiring, codex notify, humans) ──
// enter ONLY when this file is the invoked program — not when pi
// imports it as an extension (pi's own argv must never reach here;
// the dogfooded load-kill proved why)
const invoked = (() => {
  try {
    return (
      process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].split('/').pop())
    );
  } catch {
    return false;
  }
})();
if (invoked) {
  let payload;
  try {
    payload = JSON.parse(process.argv[2]);
  } catch (e) {
    console.error(JSON.stringify({ ok: false, reason: `payload is not JSON: ${e.message}` }));
    process.exit(1);
  }
  const out = check(payload);
  console.log(JSON.stringify(out));
  process.exit(out.ok ? 0 : 3);
}

// ── extension mode (pi) ──
export default function (pi) {
  pi.on('tool_call', async (event) => {
    const args = event.input ?? {};
    const path = args.file_path ?? args.path ?? args.notebook_path ?? args.filePath ?? '';
    if (path === '') return; // nothing file-shaped to guard
    const out = check({ tool_path: String(path) });
    if (!out.ok) return { block: true, reason: out.reason };
  });
}
