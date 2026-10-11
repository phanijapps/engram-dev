---
name: implement
description: Execute the owner-approved specpack sequence one task at a time from machine handouts and frozen context. Run checks and record actual evidence. Use for implementation after start permission, not planning or independent review.
---

CLI examples below use `do` and `know` subcommands. Prefix them with the installed
harness executable; check its `--help` output or use the documented Node entry.

# implement — approved sequence, one task at a time

The plan's contract is load-bearing: the task, its context, its
verification expectation, and its prereqs were settled by `plan`. This
skill's job is faithful execution + honest evidence — not re-deciding.

## 0. The implementation contract

1. **One task at a time.** Input is a T-id (or "next" → the plan's ready
   set, topologically first). A task is executable only if its prereqs
   are done **with evidence in the status ledger** and it carries no
   `blocked-on` ids. Anything else: pick a genuinely ready task or stop.
2. **Frozen context, exactly.** Load the task's compile query, wiki
   concepts, refs, and key files — nothing else. If the context is
   insufficient to execute: **STOP** with `MORE_CONTEXT_REQUIRED`,
   naming the missing bit, and route to `plan` (context revision) or
   `analyze` (new question). Browsing-around-until-it-makes-sense is
   drift, and drift is how silent context omission happens.
3. **Scope jail.** Touch only what the task's goal + frozen context name.
   A discovered drive-by improvement is _creep_: record it as a task
   candidate in the plan (one line), then decline it. "While we're here"
   has a skill — it's called `plan`.
4. **Micro-decisions vs routing back.** Two-way, implementation-level
   choices (naming, local structure, error message wording) are fine —
   record one-line rationale in the ledger entry. Anything that (a)
   contradicts a design decision, (b) changes a requirement/contract, or
   (c) is a one-way door → **STOP**, route back to `analyze` (new
   question) or `plan` (slice/decision change). The plan is never
   amended silently from inside a task.
5. **The verification expectation is the exit criterion.** Run the
   task's expectation _as written_; record verbatim evidence in the
   status ledger: command, outcome, commit ref. `done` without the
   observation is fabrication. A red expectation is a valid intermediate
   state — record it red-with-reason and either fix within scope or
   stop; do not ship hoping review saves you.
6. **Checkpoint on interruption.** If the task is interrupted: record
   changed files, current state (`doing`), and what remains. Recovery
   resumes from the ledger's evidence, never from memory.
7. **Close per task:** ledger update (evidence-cited) → commit (message
   carries `<slug> T<n>: <goal>`); milestone notes live in execution-log.md beside the plan's
   ledger (project memory back-burnered, knowledge-engine decision D5). If the change invalidates wiki content, note
   the staleness in the ledger entry (wiki update is a task or review
   follow-up — never skipped silently).
8. **Task done ≠ requirement verified.** `done` means _this task's
   expectation was observed_. Requirement-level verification, conformance
   to design, and evidence currency are `review`'s job.
9. **Stuck states ask the owner (D-7).** `needs_rebase` (drifted digests)
   and `BLOCKED` (stall limit) are stops, not self-serve fixes. Show the
   owner: what drifted (paths, pinned vs current) or why it stalled, the
   remedies (re-pin and continue, replan, or unblock), and the risk of
   each. Resume only after the actual owner repair action. Spec approval does not
   replace start permission. Use `do record --result unblock` for an authorized
   unblock, and a fresh `do start` receipt if the plan changed. Never
   re-pin, unblock, or amend the pack silently to keep moving.

## Owner permission and sequence

New initiatives use specpack/0.4. Use `do status <packDir>` to read the current gate.
Spec approval, decision acceptance and start permission are separate acts.
Do not run the first task until the owner accepts every plan decision
and gives separate permission to start the exact plan.
Actual recorded start permission covers all tasks in that bounded sequence.
Do not ask for permission again at each task boundary.

For each task, run `do next <packDir> --expected-revision <held revision>`.
Load the returned context. Execute only that task. Run its declared check.
Record the actual command and exit with `do record` at the current revision.
Continue to the next admitted task after a successful record.
Do not run tasks concurrently or maintain a second ready set in prose.

Stop on an owner gate, failed task, source drift or changed plan.
An implementation detail within the accepted design can proceed.
A new design choice cannot proceed merely because it is reversible.
Keep approved plan documents unchanged. Append progress to execution-log.md.
A changed plan needs a new owner start receipt; do not silently re-pin approval.

When all implementation checks pass, hand off to an independent reviewer.
Task completion does not mark the spec complete.
After independent review, open the library for the owner's Finish spec action.
Do not call `do close` or click Finish spec for the owner.
Legacy packs retain their original contract; adoption is a separate owner action.

## 1. Select

Load the initiative's JSON pack first. Missing pack or unregistered tasks route
back to `plan`; do not begin implementation from Markdown alone. Use
`do next <packDir>` to obtain the machine handout and revision. Match that
task to the explanatory Markdown plan instead of maintaining a second ready set.

Read `specs/<slug>/plan.md`: ready set, status ledger. Pick the
topologically first executable task. No ready tasks → stop and report
the first unblock move (which Q/D/task gates it).

## 2. Load

1. Freshness gate: stamp `repo_head` vs `git rev-parse HEAD`
   (fingerprints + stamp, or stale-pin, same rule as always).
2. Run the task's frozen-context compile query; open the listed wiki
   cids and key files. Read the design sections the task implements.
3. Insufficient → STOP (rule 2). Sufficient → state `doing` in the
   ledger.

## 3. Execute

Work the slice inside the scope jail. Commit at coherent checkpoints
(uncommitted mountains are unrecoverable state). Apply rule 4 at every
surprise. For spikes' follow-up tasks: probe code stays out or clearly
marked throwaway — a spike that ships feature code failed.

## 4. Verify & close

Record each executed expectation through `do record <packDir> --task <id>
--result pass|fail --cmd "<executed command>" --exit <actual exit>
--expected-revision <held revision> --by agent:<name>`. Re-read the pack after
admission; the engine owns the resulting task state. Markdown observations
reference this evidence. An agent may record its own execution but cannot invent
owner approval or close the pack. Disclose failed repository gates even when a
bounded task's distinct verification expectation passes.

1. Run the verification expectation **as written**. Record the evidence
   row: command, outcome (verbatim/pinned), commit ref.
2. Flip status on evidence only (`done`, or `doing` + red-with-reason).
3. Task-candidates discovered en route: append them to execution-log.md
   for the next `plan` pass. Never self-expand scope.
4. Commit; milestone notes in the plan ledger ("slug: T1+T2 done, T3
   ready — see plan.md").

## 5. Recovery

Resuming an interrupted task: read the ledger entry first, `git status`
second — reconcile the two before touching anything. Ambiguous partial
state (unknown whether a step ran) → re-run the idempotent core of the
step or restart the slice; never guess-and-continue on effects you
cannot observe.

## Rules

- No task without a plan; no plan without analysis (micro-plan exception).
- The frozen context is the whole world; its insufficiency is a finding,
  not an inconvenience to browse past.
- Every `done` cites an observation. Every observation is re-runnable by
  `review`.
- Creep becomes a task candidate, not a diff.
- Route-backs carry the T-id, the surprise, and the proposed destination
  (analyze/plan) — a routed task must never half-land as a "small fix".

## The ask-first rule (the hard gate's human contract)

When the session opens with a recall block showing MORE THAN ONE spec
in flight, and the user says "continue" (or go on / resume / pick up),
you do not choose. You list the open specs and ask which one. The
recall block is the source of truth (`do where <workspace>`); never
memory. On pi and Claude Code a hard gate enforces this; on you it is
discipline — the same rule either way.
