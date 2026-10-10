# guided-loop — research (analysis)

Round A1. The question: how does a fresh session orient itself in
ongoing work — and what debts does the harness pay while wiring that?

## 1. What the owner asked

Four deliverables, one goal — **hooks that recall and guide**:

1. **Spec debts** (DEBT.md): §5.3 trust tiers (helper missing, owner
   decision pending), §9 log format (unchecked), §10 attested
   computation (no runtime-required rule), §8 index structure
   (partial), `stale_after` comparison (shape checked, comparison not).
2. **Skill refresh**: the sdlc skills still speak the retired engine
   (31 okf/loom/uv mentions in `treadle/harness/skills/sdlc/*/SKILL.md`).
3. **Hooks**: real payloads for codex + claude, a real extension for
   pi — beyond the one guard hook shipped in fresh-harness.
4. **Recall**: a workspace status that shows where open specs dangle,
   so a fresh "continue" pauses and asks which one when several are
   open (or several worktrees carry work).

## 2. Evidence — statuses

| Fact                                                                                                                                                                                                         | Status                                                                                                                   | Evidence                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| pi extension `session_start` event exists; `pi.sendMessage()` can inject content the model sees; long-lived resources start there                                                                            | **implementation-supported**                                                                                             | pi's own extensions.md (local docs): factory registers, `pi.on('session_start', …)` documented; sendMessage in the state table |
| Claude Code hooks support SessionStart matchers whose stdout becomes context                                                                                                                                 | **declared** (industry docs) — verify wiring keys at build; the settings-merge machinery already exists in the installer |
| Codex has NO session-start injection mechanism; `notify` is post-hoc only                                                                                                                                    | **declared** (fresh-harness R2 verified notify)                                                                          |
| Pack stages today: both delivered (stitch-ui rev 37, fresh-harness rev 40) — nothing dangles this minute; the recall needs a fixture to prove against                                                        | implementation-supported                                                                                                 | `docs/specs/*` scan                                                                                                            |
| `git worktree list` is the worktree source; today only main                                                                                                                                                  | implementation-supported                                                                                                 | one row                                                                                                                        |
| `do status` reports ONE pack; no workspace-level scan exists                                                                                                                                                 | implementation-supported                                                                                                 | CLI surface                                                                                                                    |
| DEBT.md lists 5 SPEC debts (§5.3, §9, §10, §8 partial, stale_after)                                                                                                                                          | implementation-supported                                                                                                 | treadle/DEBT.md lines 5–12                                                                                                     |
| §5.3 semantics are SPECIFIED (unverified / machine-confirmed / human-reviewed, derived from `verified` actors; advisory, consumers MUST NOT reject) — the missing piece is the derivation helper + surfacing | implementation-supported                                                                                                 | OKF_SPEC_v0.2.md §5.3                                                                                                          |
| The corpus (42 cases / 67 goldens) is the byte-stability gate for any knowledge-engine change (§5.3, §9, stale_after touch validate/read paths)                                                              | implementation-supported                                                                                                 | `pnpm corpus:check`                                                                                                            |
| The installer ships hooks via manifest wiring: pi extension file, claude settings-hooks, codex config-notify, copilot null                                                                                   | implementation-supported                                                                                                 | harness.json + apply.ts, dogfooded live                                                                                        |

## 3. The shape of the answer

- **The recall core is an engine command**: `treadle do where <workspace>`
  — scans live specs roots (not the archive) for packs: stage, open
  question count, next task, last evidence age; cross-references
  `git worktree list`; prints a human table, and `--json` emits the
  machine form the hooks consume. Dangling = every pack not
  `delivered`/`closed` + every worktree that is not the main checkout.
- **The recall hook injects it at session start**: pi extension
  (`session_start` → workspace status → `sendMessage` with the recall
  block); claude SessionStart wiring invoking the same payload's
  script entry; codex gets the honest subset (Q-3); the block ends
  with the discipline sentence: more than one open → ASK which one.
- **Guidance is soft** (Q-4): the recall block + the sdlc skills say
  pause-and-ask; no hard gate — gates fight the human.
- **Skills speak today**: every sdlc skill walks the current commands
  (`do where/init/add/next/record/check`, `know search/read/validate`)
  and current paths; brand handled per Q-2; the continue-pause rule
  lands in analyze/implement/plan; evals run after refresh.
- **Debts paid per Q-5**: §5.3 helper + surface (advisory), §9 log
  format in validate (warnings never block, §11), stale_after
  comparison with the injectable clock. Corpus goldens change ONLY
  where the debt fix changes engine output — regen is a reviewed
  contract change, diff in the commit.

## 4. Risks (named)

- **Injection is trust-sensitive**: a hook that speaks at session
  start must say only what the machine can prove (paths, stages,
  counts) — the recall block quotes the engine, never vibes.
- **Cross-worktree packs**: a worktree may carry specs the main tree
  cannot see; `do where` must read the worktree's own roots and say
  which tree each row came from.
- **Corpus coupling**: §9/stale_after are validate-path changes; the
  goldens move — deliberately, reviewed in the diff, never silently.
- **Claude SessionStart key drift**: declared, not verified; the
  wiring refuses what it cannot verify at build (the fresh-harness
  pattern).
- **Skill evals**: refresh changes skill text; evals must still pass
  or the eval rubric itself is honestly revised.

## 5. Round A2 — the owner's answers (2026-10-10, in the room)

All five answered by `human:owner`. Two recommendations overruled —
the owner's calls are the contract now:

- **Q-1 spec-faithful advisory helper** (as recommended): §5.3 tiers
  implement exactly as the spec derives them; advisory only.
- **Q-2 NEUTRAL PHRASING** (overruled the bin-token design): skills
  carry NO bin name at all. They speak bare subcommands (`do where`,
  `know validate`) and "the harness CLI". brand:set stays untouched;
  the fence stays trivially clean. The copy-paste cost is accepted.
- **Q-3 honest subset now** (as recommended): codex gets the
  prompt-file + notify; the plan prints what codex cannot do.
- **Q-4 HARD GATE** (overruled the soft discipline): when more than
  one spec is open and the FIRST user message is continue-shaped, the
  loop MUST ask — enforced, not suggested. Mechanism evidence:
  pi's `message_end` can REPLACE a finalized message while preserving
  its role (extensions.md, verified line), and `before_agent_start`
  can inject per-run prompt sections — either enforces the ask.
  Claude: UserPromptSubmit hooks can block with a reason the user
  sees (declared — verify keys at build). Codex: no such mechanism —
  the honest subset stands, and the plan says the gate is pi+claude
  only.
- **Q-5 ALL FIVE NOW** (overruled the subset): §5.3, §9, §10, §8,
  stale_after — the whole DEBT.md SPEC list this wave. §10 means
  real validation rules for Attested Computation concepts (runtime
  required; executor/attester shapes). §8 means the index structure
  becomes a conformance condition per §11.3. Corpus goldens move in
  more places; every diff reviewed in the commit.
