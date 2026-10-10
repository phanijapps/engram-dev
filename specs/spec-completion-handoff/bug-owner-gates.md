---
kind: bug
slug: spec-completion-handoff
title: Owner decisions do not gate execution and final approval does not close the loop
status: draft
created: 2026-10-10
repo_head: 51c2a789eec47b29108f07947009bfb32db55af0
wiki_freshness: fresh
related: [probe.mjs, probe.json, observed-docs-root-migration.json]
---

# Bug analysis

## Identity

Declared: the owner approved the completed migration, expected completion, and
then challenged execution before decision approval. This analysis covers that
one owner-control path from proposed decisions through final completion.

Implementation-supported: docs-root-migration revision 20 records owner approval
at 2026-10-10T21:24:12Z. All 6 tasks are done with evidence and PACK review is
PASS. D-2 and D-3 remain proposed; lifecycle is active and closure is absent.
Evidence: observed-docs-root-migration.json and probe.json, observed fields.

Repro, with disposable fixtures:

1. Load a copy of the approved migration record.
2. Set T-1 to todo while D-2 and D-3 remain proposed.
3. Call nextTask and observe a task handout.
4. On another copy with all tasks done, call closePack and observe the pending-decision refusal.
5. Serve an unapproved copy through a temporary library and submit approve.
6. Observe recorded approval, active lifecycle, and proposed decisions.
7. Submit close to the temporary library and observe HTTP 400 for an unknown event.

Implementation-supported: `probe.mjs` reproduces these cases with exit 0.
The probe verifies unchanged hashes for the live pack and owner event journal.
Fixture owner acts and hypothetical decision statuses do not affect real records.

Inferred severity: major. The owner-control promise fails before execution,
then the browser gives the owner no path to finish an evidenced loop.
The probe reproduces both mechanisms deterministically at the pinned source revision.

## Observed versus expected

| Surface            | Observed                                                                                        | Expected and authority                                                                     | Evidence status                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Agent execution    | Archive placement and legacy fallback were implemented while D-2 and D-3 stayed proposed.       | Obtain approval for owner-facing decisions before dependent work; latest owner correction. | declared; implementation-supported by migration record and landed source |
| Task admission     | nextTask selects ready todo tasks using task prerequisites, without testing proposed decisions. | Enforce the owner decision boundary before execution.                                      | implementation-supported; owner expectation declared                     |
| Browser approval   | approve records approval but leaves proposed decisions and lifecycle unchanged.                 | A final handoff explains unresolved decisions and the act needed for completion.           | implementation-supported; expected behavior declared                     |
| Browser completion | No accept/reject-decision or close event is admitted.                                           | The owner can resolve the decisions and finish an eligible spec from the review surface.   | implementation-supported; candidate requirement                          |
| Terminal handout   | DONE can mean tasks are done even when PACK review is absent or closure is absent.              | Task exhaustion is distinguishable from completed delivery.                                | implementation-supported; candidate requirement                          |

## Hypothesis ledger

| ID  | Mechanism                                                                               | Evidence for                                                                                                                                                               | Evidence against                                                                                                                              | Status                                                                   |
| --- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| H1  | The browser lost the approval write.                                                    | Initial visual symptom: the spec stays open.                                                                                                                               | Revision 20 and interview.jsonl contain the human:owner approval; probe.json records it.                                                      | eliminated                                                               |
| H2  | Outstanding tasks or absent PACK review prevent this migration from closing.            | Those are valid close preconditions.                                                                                                                                       | All 6 tasks have done evidence and PACK PASS; probe confirms both.                                                                            | eliminated for this incident                                             |
| H3  | Approval does not settle decisions or perform closure.                                  | admission.ts:102 only sets approval fields; close.ts:35 refuses proposed decisions; the live D-2/D-3 remain proposed.                                                      | None identified.                                                                                                                              | confirmed                                                                |
| H4  | Browser finalization omits decision-resolution and completion acts.                     | servers.ts:98 admits answer, unknown, choice, approve; fixture close returns HTTP 400. library.js:459 only supplies approval.                                              | CLI accept/reject/close exist, so the engine is capable of these acts.                                                                        | confirmed for browser path                                               |
| H5  | Pending decisions do not gate task handouts.                                            | next.ts:62 checks task needs only; a clone with proposed D-2/D-3 receives T-1.                                                                                             | Closure checks decisions, but only after execution.                                                                                           | confirmed                                                                |
| H6  | Skill guidance lets the agent treat owner-facing decisions as local reversible choices. | plan SKILL.md:34 explicitly gates one-way doors; implement SKILL.md:28 permits reversible implementation details. Prior migration design treats its D-2/D-3 as reversible. | Neither provision overrides the owner's decision authority; archive layout and compatibility behavior are design choices, not naming details. | conflicting guidance; agent misapplication confirmed by observed actions |
| H7  | The derived stage alone is the missing completion write.                                | Fully evidenced and reviewed tasks can display in_progress when not closed.                                                                                                | derive.ts:32 correctly returns delivered only for complete lifecycle; closePack succeeds on an eligible clone.                                | eliminated as sole cause                                                 |

## Root cause

Implementation-supported: task readiness checks prerequisite tasks, while owner
decision readiness is checked only at closure. The validated dependency fields
cannot express a D-id prerequisite: needs targets tasks, implements targets
design cards, honors targets constraints, and accepts targets acceptance criteria.
Sources: treadle/packages/core/src/specpack/next.ts:62 and alignment.ts:65.

Declared and implementation-supported: the agent treated recorded, proposed
owner decisions as reversible implementation choices and executed them. That
judgment was wrong. The engine's permissive task handout does not excuse it.
Sources: migration design.md and docs-root-migration.json, D-2/D-3 and task evidence.

Implementation-supported: final approval follows a different admission path
from decision acceptance and closure. The UI exposes approval without the other
acts. Approval is therefore real, while completion is still blocked.
Sources: admission.ts:102, close.ts:35, servers.ts:98, library.js:459.

Implementation-supported, secondary: nextTask reports DONE for settled, exhausted
tasks even without PACK PASS. This is task exhaustion, not delivery. The review
skill opens the browser but does not provide an actionable closure handoff.
Sources: next.ts:70 and review SKILL.md:94. Probe confirms the weaker DONE signal.

## Fix direction

These options are proposals. None is accepted or implemented in this analysis.

| Option                                                                                                                           | What it addresses                                                      | Reversibility                                                   | Risk and disposition                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Explicit decision prerequisites on tasks, enforced in admission; decision controls and a distinct Finish spec act in the browser | Decision consent before dependent work and observable final completion | Two-way code and UI change; saved closure still freezes history | Recommended for planning. Needs a deliberate additive task contract and legacy-pack policy.                                             |
| Block every task whenever any decision is proposed                                                                               | Simple fail-closed protection                                          | Two-way                                                         | Can block independent slices and unrelated future decisions; compare as a compatibility fallback, not the default without owner choice. |
| Make final approval settle every decision and close automatically                                                                | Removes the extra final act                                            | Two-way implementation, but owner attribution persists          | Broad approval does not show which decisions were accepted. Approval also occurs before work. Avoid implicit decision acceptance.       |
| Change skills only                                                                                                               | Corrects agent guidance                                                | Two-way                                                         | Leaves the machine and browser enforcement gaps; insufficient alone.                                                                    |
| Force lifecycle complete or waive pending decisions                                                                              | Hides the current symptom                                              | History-changing write                                          | Reject as a fix direction: bypasses observable owner acts and closure guards.                                                           |

Candidate requirements are recorded in the JSON pack. They cover decision gates,
owner decision acts, final closure, truthful handoff state, and consistent skills.
No existing decision was accepted or rejected during this analysis.

## Verification plan

Regression first, before implementation:

- A task depending on a proposed decision receives no executable handout.
- Acceptance by the owner releases only the applicable task; rejection does not release the rejected design.
- An unrelated accepted slice can proceed only under an explicit task-to-decision model.
- Agent-shaped claims cannot accept decisions or close packs.
- Final UI state shows each missing task, evidence, question, decision, or review obligation.
- The owner resolves decisions and invokes completion; persisted lifecycle becomes complete, stage becomes delivered, and next returns COMPLETE.
- Spec approval alone neither implies decision acceptance nor delivery.
- A missing PACK PASS never appears as completed delivery.
- Frozen records refuse subsequent writes; repeated requests and stale revisions have explicit behavior.

Then verify affected core admission, server events, keyboard and pointer flows,
CLI handoff, shipped skills and installed copies. Reproduce the golden corpus
unchanged unless the plan declares an intentional contract change.

The analysis probe proves current behavior, not correctness of a proposed fix.
Tests for the future behavior are not written as production tests in this analysis.

## Open questions and assumptions

| ID  | Question or assumption                                                                                                     | What it blocks                                                             | Owner and resolution                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Q-1 | Should the final UI use a separate Finish spec act or a clearly labelled final approval with explicit decision resolution? | Final UI design acceptance; not cause analysis or decision-gate regression | Project owner; review concrete alternatives in the next plan.                                                 |
| A-1 | A task-to-decision model is needed to preserve independent slices.                                                         | Schema and legacy-pack migration details                                   | Planning; validate current corpus fixtures and existing task references before choosing a shape.              |
| A-2 | Existing approval remains evidence of approval, not per-decision acceptance.                                               | No analysis slice                                                          | Existing code and journal support this distinction; reconsider only with an explicit owner-approved contract. |

Unknown: which exact final label the owner prefers. Known: decisions require
owner approval before dependent implementation. Do not defer that known boundary
until final approval, and do not infer acceptance of the existing D-2/D-3.

## Out of scope

Implementing the guard, changing skills, resolving existing owner decisions,
closing either prior documentation initiative, rollback of the migration,
retrospective reconstruction, authentication, or source-freshness redesign.
The owner authorized analysis; implementation is a separate handoff.

## Evidence index

| Claim                                                   | Source                                                                                      | Evidence status                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Approval is recorded; closure is blocked by 2 decisions | observed-docs-root-migration.json; probe.json                                               | implementation-supported                   |
| Proposed decisions permit task handout                  | probe.json; treadle/packages/core/src/specpack/next.ts:62                                   | implementation-supported                   |
| Existing task links do not represent decision gates     | treadle/packages/core/src/specpack/alignment.ts:65                                          | implementation-supported                   |
| Approval and closure use distinct rules                 | treadle/packages/core/src/specpack/admission.ts:102; close.ts:35                            | implementation-supported                   |
| Browser event vocabulary lacks decision and close acts  | treadle/packages/web/src/servers.ts:98; probe.json                                          | implementation-supported                   |
| Reversible-choice guidance was misapplied               | .codex/skills/plan/SKILL.md:34; .codex/skills/implement/SKILL.md:28; prior migration design | conflicting guidance; observed agent error |
| Task DONE is weaker than delivered                      | treadle/packages/core/src/specpack/next.ts:70; probe.json                                   | implementation-supported                   |

Investigation note: the initial live `do next` query returned closure needed
with exit 1. The CLI also rewrote date.updated without a revision bump because
its next handler saves unconditionally. Approval, decisions, task states, and
closure stayed unchanged. Subsequent probes use in-memory clones and temporary
fixtures. Source: treadle/packages/cli/src/commands/do.ts:135.
This timestamp behavior is a follow-up candidate, not a fix in this analysis.

## Handoff

- Ready now: plan the decision prerequisite and final owner-control flow from the confirmed mechanisms and candidate requirements.
- Blocked on: Q-1 for final UI acceptance; A-1 for the precise additive task shape and legacy behavior.
- Next step: plan for specs/spec-completion-handoff, using this analysis and probe.json.
- Machine handoff: spec-completion-handoff.json, revision 3 after analysis review; no implementation tasks, accepted decisions, owner approval, or closure are created.
