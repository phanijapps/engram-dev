#!/usr/bin/env node
/** Legacy recall scripts plus the current pi lifecycle context extension. Core gates own admission. */
import { eventContext, runtimeConfig } from './codex-context.js';
import { execFile } from 'node:child_process';

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

function whereJSON(workspace) {
  return new Promise((resolve) => {
    let cli,
      prefix = [];
    if (process.env.HARNESS_CLI) {
      cli = process.env.HARNESS_CLI;
      if (/\.m?js$/i.test(cli)) {
        prefix = [cli];
        cli = process.execPath;
      }
    } else {
      try {
        const runtime = runtimeConfig();
        cli = runtime.node;
        prefix = [runtime.entry];
      } catch (error) {
        resolve({ unavailable: error.message });
        return;
      }
    }
    execFile(
      cli,
      [...prefix, 'do', 'where', workspace, '--json'],
      { timeout: 15000 },
      (err, stdout) => {
        if (err) {
          resolve({ unavailable: String(err.message) });
          return;
        }
        try {
          resolve(JSON.parse(stdout));
        } catch {
          resolve({ unavailable: 'do where did not speak JSON' });
        }
      },
    );
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

// pi lifecycle uses the host's current workspace on every event, including resume/new/fork.
const installed = new WeakSet();
export default function (pi) {
  if (installed.has(pi)) return;
  installed.add(pi);
  pi.on('session_start', async (_event, ctx) => {
    const result = await eventContext(ctx?.cwd);
    pi.sendMessage({ customType: 'project-context', content: result.block, display: true });
  });
  pi.on('before_agent_start', async (_event, ctx) => {
    const result = await eventContext(ctx?.cwd);
    return { message: { customType: 'project-context', content: result.block, display: false } };
  });
}
