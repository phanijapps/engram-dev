# guided-loop — design

Draft 1. Decisions D-1..; design entries DES-.. land with the tasks
after the owner answers (the fresh-harness pattern: defaults assumed
below, answers fold in).

## Approach

The loop learns to orient itself. One engine command becomes the
recall source; hooks carry it into every session; the skills speak
the current truth; the spec debts that touch trust and freshness get
paid.

```
treadle do where <workspace> [--json]     ← the recall core (new)
harness/hooks/session-recall.js           ← payload: workspace → recall block
  pi:      extension (session_start → sendMessage)
  claude:  SessionStart settings wiring → stdout context
  codex:   honest subset (prompt-file + notify)  [Q-3]
harness/skills/sdlc/**                    ← refreshed to the current loop
@treadle/knowledge: ALL FIVE debts — §5.3 tiers, §9 log structure, §10 admission rules, §8 conformance, stale_after  [Q-5]
```

### The hard gate (Q-4 — the owner overruled soft)

When the recall scan finds MORE THAN ONE open spec and the FIRST user
message is continue-shaped (continue / go on / keep going / resume /
pick up …), the loop ASKS — enforced:

- **pi**: the extension replaces the continue-shaped user message
  (message_end preserves role — verified in pi's docs) with the
  original text + the recall block + "ASK which spec before any
  action"; belt-and-braces: before_agent_start injects the same rule
  as a per-run guideline.
- **claude**: UserPromptSubmit hook returns a block decision with
  the recall block as the reason — the user sees the list (declared;
  keys verified at build, refused if unverifiable).
- **codex**: no mechanism — the honest subset; the plan and the
  prompt-file both say the gate lives on pi and claude.

The gate NEVER fires when exactly one spec is open (continue resolves
to it) or when none are (the block says so).

### The recall block (the contract)

```
work in flight (2):
  guided-loop   planning      Q-1..Q-5 open     rev 6   docs/specs/
  spec-web      in_review     R2 waiting        rev 28  ../other-tree/ (worktree)
nothing delivered is listed; the archive is never listed.
if more than one: ASK which one continues. never guess. (hard gate, Q-4 — see the hard gate section)
```

Every line quotes the engine (`do where`), never memory. The block
ends with the discipline sentence (soft, Q-4).

### `do where`

- Walks LIVE specs roots (default `<workspace>/docs/specs`, `--roots`
  to add); the archive is excluded by design.
- Per pack: name, stage, open questions, next ready task, revision,
  evidence age.
- Cross-references `git worktree list`: a worktree row carries its own
  specs scan, labeled with its path.
- `--json` for hooks; human table otherwise; exit 0 always (recall is
  a report, not a gate).

### The recall payload (dual entry, same contract as the guard)

- script mode: `node session-recall.js <workspace>` → prints the
  block (claude SessionStart stdout context; humans).
- extension mode: `session_start` → run the same scan →
  `pi.sendMessage(block)`; long-lived resources start per the pi
  contract.

### Spec debts (Q-5 — ALL FIVE this wave)

- **§5.3**: `trustTier(frontmatter)` in knowledge — unverified /
  machine-confirmed / human-reviewed from `verified` actors; surfaced
  as info in `know read` + `know validate`; advisory only (§11 holds).
- **§9**: `know validate` checks log.md ISO date headings; warnings
  never block.
- **§10**: Attested Computation validation — `runtime` REQUIRED for
  `type: Attested Computation` concepts; `executor`/`attester`
  shapes checked per §10.2 (execution machinery stays out — this is
  the admission contract, not the runtime).
- **§8**: the index structure becomes a conformance condition per
  §11.3 (partial → enforced).
- **stale_after**: the comparison `now >= stale_after` with the
  injectable clock; status surfaces stale honestly.
- Corpus: goldens move wherever output changes; `corpus:regen`, diff
  reviewed in the commit — a contract change on record.

### Skills (Q-2 — neutral phrasing, no bin names)

- Every sdlc skill walks the current commands and paths; evals run.
- Skills speak BARE subcommands (`do where`, `do next`, `know
validate`) and "the harness CLI" — zero brand strings; brand:set
  untouched; the fence trivially green.
- The ask-first rule lands in analyze/plan/implement as the human
  contract; the hard gate enforces what the skills teach.

## R1 fold notes (the review's findings, answered)

- **"FIRST user message" is defined**: no prior user entry in the
  session transcript (`ctx.sessionManager` entries); resumed sessions
  included — the gate can fire again after a resume, by design.
- **§11.3 is one clause** (D-6, proposed): index.md (§8) and log.md
  (§9) structure are a single conformance condition — both enforce at
  error level; "warnings never block" applies to the other §11 checks,
  not to §11.3. Spec-faithful, mirroring Q-1's pattern.
- **`do where` without git**: the worktree section reports
  `unavailable (no git)` and the scan still exits 0 (fixture-proven).
- **`do library` divergence**: the standing single-root surface stays
  as-is this wave; recorded in out_of_scope + DEBT.md.
- The design record IS this file plus the pack's design entries
  (DES-1..6); nothing rides on stale prose.
