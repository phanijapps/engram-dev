---
name: plan
description: Turn SDD analysis into a technical design, a populated JSON specpack, and an executable task DAG. Register requirements, dependencies, verification expectations, and frozen context before implementation handoff. Use for planning an analyzed change, not investigation or execution.
---

# plan — technical design + task DAG from analysis

One skill, two artifacts, depth-scaled. `design.md` answers _how the
system should change and why that way_ — it stabilizes early and is
reviewed once. `plan.md` is the executable consequence — a DAG of small,
independently verifiable slices that mutates as work lands. Design depth
scales with blast radius: the analysis's impact artifact already says
whether you owe a full design or a paragraph.

The gate: **plan consumes analysis, it does not re-do it.** Every design
choice traces to an R/Q/A/D id from `specs/<slug>/`. If you find
yourself analyzing, stop — that is the analyze skill's job; run it and
come back.

## 0. The planning contract

1. **Analysis-gated.** Inputs are the initiative's artifacts under
   `specs/<slug>/` (read them all). Plan **only the Handoff's
   Ready-now slices** unless the operator explicitly widens scope.
   Blocked slices may appear as placeholders marked `blocked-on: <Q/D
id>` — never designed around with invented answers.
2. **Ground before designing.** Same spine as analyze: resolve →
   freshness gate → compile/search the affected surfaces → read the
   load-bearing source. A design that cites no wiki concept or source
   path is an opinion.
3. **Bounded design.** Design just enough for the ready slices. Contracts
   (interfaces, data shapes, failure behavior) before mechanism. No
   speculative generality; out-of-scope register mandatory.
4. **Decisions are the deliverable.** Each design decision: choice,
   alternatives considered, two-way/one-way door, evidence status, and
   the question/assumption it resolves or carries. Insufficient evidence
   = the question stays open and the slice stays blocked. One-way doors
   need explicit owner acceptance before their tasks become ready.
5. **Tasks are the unit of delivery.** Small (one sitting / one reviewable
   change), independently verifiable, leaves the repo coherent. Real
   prerequisites only — a prereq is something whose _output_ you need,
   not something that merely feels earlier. AND-only, acyclic
   (self-prereq or cycle = defect in the plan).
6. **No task without an observable verification expectation.** "Tests
   pass", a command, a measurable observation — never "looks right".
   Expectations are plans; observed outcomes are recorded by implement/
   review with evidence, never asserted here.
7. **Frozen context per task.** Each task names its compile query, wiki
   concepts, and exact analysis/design refs. Implement loads exactly
   that — no browsing, no drift.
8. **Status is evidence, not hope.** The status column changes only to
   reflect observed evidence (command output, commit, review artifact).
   Plan revisions supersede slices, never silently rewrite them.

## 1. Inputs & gate (read-only first)

1. Locate `specs/<slug>/`; read every artifact's **Handoff** block.
   No artifacts there → offer to run the analyze skill; a trivial
   one-liner may proceed as a **micro-plan** (single plan.md, mini-design
   section, stated rationale for skipping analysis).
2. Extract: Ready-now slices, Blocked-on register (Q/A/D ids), route
   hints (needs impact? needs spike?).
3. **Ground:** freshness check (stamp `repo_head` vs `git rev-parse
HEAD`; fingerprints + stamp, or stale-pin) → `know search "<design
question>"` + `know read <cid>` per affected surface → open
   the cited wiki concepts and source files
   for anything load-bearing. Residual unknowns → ONE batched question
   round, recorded as new Q-ids in the artifact they belong to.

## 2. Route the depth

| The analysis says…                                          | Design output                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| impact artifact lists shared-contract effects / 2+ surfaces | full `design.md` + `plan.md`                                             |
| feature/spec touching one subsystem, no shared contracts    | compact `design.md` (contracts + decisions only) + `plan.md`             |
| bug with confirmed root cause, local fix                    | mini-design section inside `plan.md` (approach + fix options considered) |
| micro-plan (trivial)                                        | single `plan.md`, 1–3 tasks                                              |

State the chosen depth and why in the plan header. Depth is about
blast-radius honesty, not ceremony.

## 3. Author the design (assets/design.tmpl.md)

Approach selected against the analysis's constraints (alternatives
recorded, not strawmen) · change by surface (which modules/contracts move,
pinned to wiki cids) · external contracts & data shapes (before/after,
compatibility posture) · failure behavior (new failure modes, rollback
story) · decisions ledger continuing the analysis's D-numbering · open
questions/assumptions carried (never resolved by vibes) · out of scope.
One-way-door decisions are flagged and their tasks stay `blocked-on`
acceptance until the owner signs.

## 4. Author the task DAG (assets/plan.tmpl.md)

### Persist the machine plan

Load `specs/<slug>/<slug>.json`; create it through `do init` if a legacy
analysis lacks a pack. Keep Markdown as the design rationale and readable plan.
The JSON pack owns executable requirements, decisions, designs, task dependencies,
verification expectations, and frozen context. Register these before handoff.

Use `do add decision` and `do add task` for the fields those commands expose.
For remaining authored fields, use the existing core loader/writer API and check
alignment with `do check`. Do not hand-set derived stages, evidence-driven task
states, or human acceptance. Map prose IDs to canonical IDs explicitly when needed
(for example, R1 → FR-1 and T1 → T-1).

Before returning the ready set, `do check <packDir>` must succeed and
`do where <workspace>` must discover the pack. An empty shell pack is not a
completed plan: its tasks, dependencies, verification, and context must be present.
Future questions outside the current slice remain follow-ups, rather than
invented answers or unrelated closure blockers.

Per task: goal (one line, slice-shaped) · implements (R/D refs) ·
prereqs (task ids) · verification expectation (command/observation) ·
size (S/M/L) · status (todo). Frozen context per task listed in its own
block. Then:

1. **Walk the DAG**: topological order, cycle/self-prereq check, every
   blocked-on reference resolves to a real Q/D id or task.
2. **Traceability matrix**: R → design section → task(s) → verification
   expectation. Any R in the planned scope with no task = hole; any task
   implementing nothing = creep.
3. **Ready set**: tasks with prereqs satisfied and no blocking ids —
   this is implement's entry contract.

## 5. Close: record, hand off

1. Commit the artifacts — the git history is the durable record
   (project memory back-burnered, knowledge-engine decision D5).
2. Normative discoveries ("new code in X must…") → `know findings
propose wiki <evidence> wiki/<concept>.md <kind> --rationale "…"`,
   never written as settled truth.
3. Commit both artifacts. **Handoff**: ready set with per-task frozen
   context → `implement`; blocked set with owners → the analysis's
   question register.

## Rules

- No analysis, no plan (micro-plan exception stated in-plan).
- Design choices trace to R/Q/A/D ids or are marked `unrequested` and cut.
- Verification expectations are observable; no task ships without one.
- The DAG is validated by walking it, not by eyeballing it.
- Plan revisions: new slice statuses supersede old ones; the design is
  amended via new dated decision entries, never rewritten history.
- Statuses move only on evidence (output refs, commits, review artifacts).

## The ask-first rule (the hard gate's human contract)

When the session opens with a recall block showing MORE THAN ONE spec
in flight, and the user says "continue" (or go on / resume / pick up),
you do not choose. You list the open specs and ask which one. The
recall block is the source of truth (`do where <workspace>`); never
memory. On pi and Claude Code a hard gate enforces this; on you it is
discipline — the same rule either way.
