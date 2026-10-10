#!/usr/bin/env node
/** session-recall (harness/0.1) — the loop remembers where work dangles.
 *
 *  Entries (one file, one contract):
 *  - script mode:   node session-recall.js <workspace>            → prints
 *                   the block (humans; claude SessionStart stdout context
 *                   with --claude-start, which reads the cwd from stdin).
 *  - claude gate:   node session-recall.js --claude-gate           → reads
 *                   Claude's UserPromptSubmit stdin JSON; exit 2 + stderr
 *                   = the ask (the run stops, the user sees the list);
 *                   exit 0 = allow.
 *  - extension mode: loaded by pi as an extension — session_start sends
 *                   the block as a custom message (the model SEES it),
 *                   and the HARD GATE fires on continue-shaped FIRST
 *                   user messages (no prior user entry in the transcript;
 *                   resumed sessions included) when more than one spec
 *                   is open: message_end replaces the message (role
 *                   preserved) with the original + the block + the ASK
 *                   directive; before_agent_start also injects the
 *                   ask-first guideline.
 *
 *  Engine-quoted: this payload shells out to `do where --json` and
 *  renders from the JSON (the open count comes from the data, never
 *  from string-matching prose). No CLI → the block says so and the
 *  gate stays inert (a gate without data is a guess; we do not guess).
 */
import { execFile } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const CONTINUE_SHAPED =
  /^\s*(continue|go( on| ahead| darling)?|keep going|resume|pick (up|it up)|carry on|next)\b/i;
const OPEN_STAGES = new Set([
  'awaiting_owner',
  'planning',
  'drafted',
  'in_progress',
  'in_review',
  'blocked',
  'refused',
]);
const STDIN_TIMEOUT_MS = 5000; // a manual TTY run must not hang the hook (R2 #15)

function findCLI() {
  const candidates = [
    process.env.HARNESS_CLI,
    join(homedir(), '.local', 'bin', 'treadle'),
    '/usr/local/bin/treadle',
  ].filter(Boolean);
  for (const c of candidates) if (c && existsSync(c)) return c;
  return 'treadle'; // PATH
}

function whereJSON(workspace) {
  return new Promise((resolve) => {
    const cli = findCLI();
    execFile(cli, ['do', 'where', workspace, '--json'], { timeout: 15000 }, (err, stdout) => {
      if (err) {
        resolve({ unavailable: String(err.message) });
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve({ unavailable: 'do where did not speak JSON' });
      }
    });
  });
}

/** Render the block FROM THE JSON — the count and the lines share one source. */
export async function recall(workspace) {
  const report = await whereJSON(workspace);
  if (report.unavailable) {
    return {
      block: `work recall unavailable (${report.unavailable}) — run do where <workspace> yourself`,
      openCount: 0,
    };
  }
  const all = [...(report.packs ?? []), ...(report.worktrees ?? []).flatMap((w) => w.packs ?? [])];
  const open = all.filter((p) => OPEN_STAGES.has(p.stage));
  const lines = [];
  lines.push(
    open.length > 0
      ? `work in flight (${open.length}):`
      : 'nothing in flight — every spec is delivered or closed.',
  );
  for (const p of open) {
    const bits = [p.name, p.stage];
    if (p.openQuestions > 0) bits.push(`Q open: ${p.openQuestions}`);
    if (p.nextTask) bits.push(`next: ${p.nextTask}`);
    if (p.revision !== null && p.revision !== undefined) bits.push(`rev ${p.revision}`);
    if (p.lastEvidenceAt) bits.push(`evidence ${p.lastEvidenceAt.slice(0, 10)}`);
    if (p.tree) bits.push(`(${p.tree})`);
    lines.push('  ' + bits.join('  ').trim());
  }
  if (open.length > 1) lines.push('more than one is open: ASK which one continues. never guess.');
  return { block: lines.join('\n'), openCount: open.length };
}

/** Real pi content is parts-shaped: [{type:'text',text},…] — extract the text. */
function textOf(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((p) => p && typeof p === 'object' && p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text)
      .join('\n');
  }
  return '';
}

function readStdinJSON() {
  return new Promise((resolve) => {
    let raw = '';
    const timer = setTimeout(() => {
      resolve(null); // stdin never closed — treat as no payload, never hang (R2 #15)
      process.stdin.removeAllListeners();
    }, STDIN_TIMEOUT_MS);
    process.stdin.on('data', (d) => (raw += d));
    process.stdin.on('end', () => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve(null);
      }
    });
    process.stdin.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

const ASK_DIRECTIVE =
  '\n\n[the hard gate] More than one spec is open. Do NOT proceed with any of them. Ask the user which one continues, listing the open specs above. Never guess.';

// ── script + claude entries ──
const invoked = (() => {
  try {
    const name = process.argv[1].split('/').pop().split('\\').pop();
    return import.meta.url.endsWith(name);
  } catch {
    return false;
  }
})();

async function runScript() {
  const args = process.argv.slice(2);
  if (args[0] === '--claude-gate' || args[0] === '--claude-start') {
    const payload = (await readStdinJSON()) ?? {};
    const cwd =
      typeof payload.cwd === 'string' && payload.cwd.length > 0 ? payload.cwd : process.cwd();
    if (args[0] === '--claude-start') {
      const { block } = await recall(cwd);
      console.log(block);
      return;
    }
    // --claude-gate: UserPromptSubmit — exit 2 + stderr blocks with the list shown
    const prompt = typeof payload.prompt === 'string' ? payload.prompt : '';
    if (!CONTINUE_SHAPED.test(prompt)) return; // not continue-shaped → allow
    const { block, openCount } = await recall(cwd);
    if (openCount < 2) return; // zero or one open → allow (the gate never over-fires)
    console.error(block + ASK_DIRECTIVE);
    process.exit(2);
  }
  const { block } = await recall(args[0] ?? '.');
  console.log(block);
}

if (invoked) {
  runScript();
}

// ── extension mode (pi) ──
export default function (pi) {
  let openCount = 0;
  let block = '';

  pi.on('session_start', async () => {
    const out = await recall(process.cwd());
    block = out.block;
    openCount = out.openCount;
    if (block && !block.startsWith('work recall unavailable')) {
      // sendMessage takes {customType, content, display} — a bare string is
      // silently dropped (R2 #2); the model must SEE this
      pi.sendMessage({ customType: 'session-recall', content: block, display: true });
    }
  });

  pi.on('message_end', async (event) => {
    const msg = event.message ?? {};
    if (String(msg.role) !== 'user') return;
    const prior = pi.sessionManager ? countUserEntries(pi) : firstUserSeen ? 1 : 0;
    if (prior > 0) {
      firstUserSeen = true;
      return;
    }
    firstUserSeen = true;
    const text = textOf(msg.content); // parts-shaped in real pi (R2 #1)
    if (!CONTINUE_SHAPED.test(text)) return;
    if (openCount < 2) return; // zero or one open: continue resolves — never fire
    return {
      message: { ...msg, content: [{ type: 'text', text: text + ASK_DIRECTIVE + '\n\n' + block }] },
    };
  });

  pi.on('before_agent_start', async (event) => {
    if (openCount < 2) return;
    if (!CONTINUE_SHAPED.test(textOf(event.prompt ?? event.prompt?.content ?? ''))) return;
    event.systemPromptOptions.promptGuidelines = [
      ...(event.systemPromptOptions.promptGuidelines ?? []),
      'HARD GATE: more than one spec is open. Ask the user which one continues before doing anything. Never guess.',
    ];
  });
}

let firstUserSeen = false;

function countUserEntries(pi) {
  try {
    const entries = pi.sessionManager.entries ?? pi.sessionManager.getEntries?.() ?? [];
    return entries.filter((e) => String(e?.message?.role ?? e?.role) === 'user').length;
  } catch {
    return 0;
  }
}
