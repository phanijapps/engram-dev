---
name: implement
description: Execute one planned task's slice against its frozen context — the implementation stage of the SDD loop. Takes a T-id from a plan.md ready set, loads exactly the frozen context (compile query, wiki cids, exact refs — insufficient context stops and routes back instead of browsing), works inside the scope jail (no drive-by refactors), treats the task's verification expectation as the exit criterion (runs it, records verbatim evidence in the status ledger, never writes done without the observation), and closes with ledger update + commit + memory. Micro-decisions are allowed (two-way, recorded); requirement-level surprises route back to analyze/plan. Triggers are "implement T1", "do the next task", "execute this slice", "work the ready set". Not for planning (plan), analyzing (analyze), or verifying landed work (review).
---

# implement — one task, frozen context, observed evidence

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
   A discovered drive-by improvement is *creep*: record it as a task
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
   task's expectation *as written*; record verbatim evidence in the
   status ledger: command, outcome, commit ref. `done` without the
   observation is fabrication. A red expectation is a valid intermediate
   state — record it red-with-reason and either fix within scope or
   stop; do not ship hoping review saves you.
6. **Checkpoint on interruption.** If the task is interrupted: record
   changed files, current state (`doing`), and what remains. Recovery
   resumes from the ledger's evidence, never from memory.
7. **Close per task:** ledger update (evidence-cited) → commit (message
   carries `<slug> T<n>: <goal>`) → `memex-core record` only at
   cross-task milestones. If the change invalidates wiki content, note
   the staleness in the ledger entry (wiki update is a task or review
   follow-up — never skipped silently).
8. **Task done ≠ requirement verified.** `done` means *this task's
   expectation was observed*. Requirement-level verification, conformance
   to design, and evidence currency are `review`'s job.

## 1. Select

Read `docs/specs/<slug>/plan.md`: ready set, status ledger. Pick the
topologically first executable task. No ready tasks → stop and report
the first unblock move (which Q/D/task gates it).

## 2. Load

1. `memex-core resolve` → freshness gate (`wiki update` or stale-pin,
   same rule as always).
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

1. Run the verification expectation **as written**. Record the evidence
   row: command, outcome (verbatim/pinned), commit ref.
2. Flip status on evidence only (`done`, or `doing` + red-with-reason).
3. Task-candidates discovered en route: one line each in the plan's
   Handoff (for the next `plan` pass). Never self-expand scope.
4. Commit; `memex-core record` at milestones ("slug: T1+T2 done, T3
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
