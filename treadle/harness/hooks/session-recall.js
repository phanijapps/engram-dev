#!/usr/bin/env node
/** session-recall (harness/0.1) — the loop remembers where work dangles.
 *
 *  Entries (one file, one contract):
 *  - script mode:   node session-recall.js <workspace>            → prints
 *                   the recall block (humans, claude SessionStart stdout
 *                   context with --claude-start, which reads the cwd from
 *                   stdin JSON payload).
 *  - claude gate:   node session-recall.js --claude-gate           → reads
 *                   Claude's UserPromptSubmit stdin JSON; exit 2 + stderr
 *                   = the ask (the run stops, the user sees the list);
 *                   exit 0 = allow.
 *  - extension mode: loaded by pi as an extension — session_start injects
 *                   the block (sendMessage), and the HARD GATE fires on
 *                   continue-shaped FIRST user messages (no prior user
 *                   entry in the transcript; resumed sessions included)
 *                   when more than one spec is open: message_end replaces
 *                   the message (role preserved) with the original + the
 *                   block + the ASK directive; before_agent_start also
 *                   injects the ask-first guideline.
 *
 *  The block is engine-quoted: this payload shells out to the harness
 *  CLI (`do where --json`) and prints what the engine says — never
 *  memory. No CLI → the block says so and the gate stays inert (a gate
 *  without data is a guess; we do not guess).
 */
import { execFile } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const CONTINUE_SHAPED =
  /^\s*(continue|go( on| ahead| darling)?|keep going|resume|pick (up|it up)|carry on|next)\b/i;

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

export async function recallBlockFor(workspace) {
  const report = await whereJSON(workspace);
  if (report.unavailable) {
    return `work recall unavailable (${report.unavailable}) — run do where <workspace> yourself`;
  }
  const all = [...(report.packs ?? []), ...(report.worktrees ?? []).flatMap((w) => w.packs ?? [])];
  const OPEN = new Set([
    'awaiting_owner',
    'planning',
    'drafted',
    'in_progress',
    'in_review',
    'refused',
  ]);
  const open = all.filter((p) => OPEN.has(p.stage));
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
    if (p.tree) bits.push(`(${p.tree})`);
    lines.push('  ' + bits.join('  ').trim());
  }
  if (open.length > 1) lines.push('more than one is open: ASK which one continues. never guess.');
  return lines.join('\n');
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
  if (args[0] === '--claude-gate') {
    // Claude UserPromptSubmit: stdin JSON {prompt, cwd}; exit 2 + stderr blocks with the reason shown
    let raw = '';
    await new Promise((r) => process.stdin.on('data', (d) => (raw += d)).on('end', r));
    let prompt = '';
    let cwd = process.cwd();
    try {
      const payload = JSON.parse(raw || '{}');
      prompt = String(payload.prompt ?? '');
      if (payload.cwd) cwd = String(payload.cwd);
    } catch {
      console.error(
        'session-recall: stdin was not JSON — allowing (a gate without data never blocks)',
      );
      return; // exit 0
    }
    if (!CONTINUE_SHAPED.test(prompt)) return; // not continue-shaped → allow
    const block = await recallBlockFor(cwd);
    if (!block.includes('ASK which one continues')) return; // ≤1 open → allow
    console.error(block + ASK_DIRECTIVE);
    process.exit(2);
  }
  const workspace = args[0] ?? (args[0] === '--claude-start' ? undefined : '.');
  const ws = args[0] === '--claude-start' ? process.cwd() : (args[0] ?? '.');
  console.log(await recallBlockFor(ws));
}

if (invoked) {
  runScript();
}

// ── extension mode (pi) ──
export default function (pi) {
  let openCount = 0;
  let block = '';
  let firstUserSeen = false;

  pi.on('session_start', async () => {
    block = await recallBlockFor(process.cwd());
    openCount = block.includes('ASK which one continues')
      ? 2
      : block.startsWith('work in flight (1)')
        ? 1
        : 0;
    if (block && !block.startsWith('work recall unavailable')) {
      pi.sendMessage(block);
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
    const text = typeof msg.content === 'string' ? msg.content : String(msg.content ?? '');
    if (!CONTINUE_SHAPED.test(text)) return;
    if (openCount < 2) return; // zero or one open: continue resolves — never fire
    // replace the message (role preserved — the doc-verified mechanism)
    return { message: { ...msg, content: text + ASK_DIRECTIVE + '\n\n' + block } };
  });

  pi.on('before_agent_start', async (event) => {
    if (openCount < 2) return;
    if (!CONTINUE_SHAPED.test(String(event.prompt ?? ''))) return;
    event.systemPromptOptions.promptGuidelines = [
      ...(event.systemPromptOptions.promptGuidelines ?? []),
      'HARD GATE: more than one spec is open. Ask the user which one continues before doing anything. Never guess.',
    ];
  });
}

function countUserEntries(pi) {
  try {
    const entries = pi.sessionManager.entries ?? pi.sessionManager.getEntries?.() ?? [];
    return entries.filter((e) => String(e?.message?.role ?? e?.role) === 'user').length;
  } catch {
    return 0;
  }
}
