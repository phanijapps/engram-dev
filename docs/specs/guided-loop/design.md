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
@treadle/knowledge: trust tiers + log format + stale_after  [Q-5]
```

### The recall block (the contract)

```
work in flight (2):
  guided-loop   planning      Q-1..Q-5 open     rev 6   docs/specs/
  spec-web      in_review     R2 waiting        rev 28  ../other-tree/ (worktree)
nothing delivered is listed; the archive is never listed.
if more than one: ASK which one continues. never guess.
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

### Spec debts (Q-5 default: subset)

- **§5.3**: `trustTier(frontmatter)` in knowledge — unverified /
  machine-confirmed / human-reviewed from `verified` actors; surfaced
  as info in `know read` + `know validate`; advisory only (§11 holds).
- **§9**: `know validate` checks log.md ISO date headings; warnings
  never block.
- **stale_after**: the comparison `now >= stale_after` with the
  injectable clock; status surfaces stale honestly.
- **§10 + §8**: recorded-deferred in DEBT.md (§10 is a wave of its
  own).
- Corpus: goldens move only where output changes; `corpus:regen`,
  diff reviewed in the commit — a contract change on record.

### Skills (Q-2 default: bin tokens brand:set rewrites)

- Every sdlc skill walks the current commands and paths; evals run.
- The pause-and-ask lands in analyze/plan/implement: more than one
  open spec → ask; the recall block is the source of truth.
- brand:set gains `harness/skills/**` to its rewrite set — the fence
  and the skills move together, white-label stays true.

## Open by design

Q-1..Q-5 recorded in the pack; the defaults above assume the
recommendations stand. Contradicting answers rewrite the DES entries
before build.
