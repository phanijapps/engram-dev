---
kind: plan
slug: spec-completion-handoff
title: Enforce owner decisions and exact-plan start before the approved task loop
status: draft
created: 2026-10-10
repo_head: 5f0bd1fed1246e42f651f91f6d2166477a71c3c2
design_ref: design.md
analysis_inputs: [bug-owner-gates.md, owner-flow.md, spec.md]
depth: full-design
rationale_for_depth: Shared machine contract, CLI/server admission, browser flow and installed skills change together.
---

# Implementation plan — proposal 1

The owner supplied the desired workflow in Q-1. This plan proposes its concrete
implementation. The machine pack owns the tasks and their real states.
No task has been handed out, attempted, or completed by authoring this plan.

## Task DAG

| Task | Goal                                                           | Requirements                                         | Prerequisites | Verification                                                                                                           | Initial status                 |
| ---- | -------------------------------------------------------------- | ---------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| T-1  | Implement the 0.4 contract and core owner gates                | FR-1, FR-3, FR-4, FR-6, FR-7, FR-9                   | None          | `cd treadle && pnpm exec vitest run packages/core/test/owner-workflow.test.ts packages/core/test/core.test.ts` exits 0 | blocked: owner decisions/start |
| T-2  | Add owner CLI acts, strict revisions and explicit adoption     | FR-1, FR-2, FR-6, FR-7, FR-9                         | T-1           | `cd treadle && pnpm exec vitest run packages/cli/test/owner-workflow.test.ts` exits 0                                  | blocked: owner decisions/start |
| T-3  | Admit browser owner acts with serialized durable audit         | FR-2, FR-3, FR-4, FR-7                               | T-2           | `cd treadle && pnpm exec vitest run packages/web/test/owner-workflow.test.ts` exits 0                                  | blocked: owner decisions/start |
| T-4  | Render the required owner workflow and approval controls       | FR-2, FR-3, FR-4, FR-6, FR-7                         | T-3           | `cd treadle && pnpm exec vitest run packages/web/test/workflow-ui.test.ts packages/web/test/inspector.test.ts` exits 0 | blocked: owner decisions/start |
| T-5  | Update the four SDD skills and synchronize installed copies    | FR-5, FR-8                                           | T-2           | `node specs/spec-completion-handoff/verify-skills.mjs` exits 0                                                         | blocked: owner decisions/start |
| T-6  | Verify full owner-flow integration and new conformance cases   | FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9 | T-4, T-5      | `cd treadle && pnpm check && pnpm coverage && pnpm corpus:check && pnpm brand:check && pnpm links` exits 0             | blocked: owner decisions/start |
| T-7  | Run independent red-foreman review and record the PACK verdict | FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9 | T-6           | `node specs/spec-completion-handoff/verify-review.mjs` exits 0                                                         | blocked: owner decisions/start |

Prerequisites represent real outputs: core policy enables adapters; server acts
enable UI; CLI policy enables skills; integrated UI and skills enable complete
conformance; that evidence enables independent review. T-5 needs T-2, not T-4.
The approved sequence chooses the first dependency-ready task by id.
The approved brief/spec/design/plan documents stay immutable. Execution
observations go to execution-log.md and the canonical task evidence, so normal
progress does not silently edit the scope the owner approved.

## Owner gates and ready set

**Ready implementation set: empty.** D-1 through D-4 remain proposed, and no
start permission exists. Every planned task is initially blocked on these
observable owner gates. This is a planned consent block, not a test failure.
The current engine consequently cannot hand out a task from this plan.

Owner review is ready now: read brief.md, spec.md, design.md and this task table.
Record per-decision acceptance first. Then give separate permission for the
exact plan scope captured in plan-scope.json. Answering the owner-flow question
is not either act. Generic spec approval alone is not start permission.

Bootstrap: current UI questions can record explicit decision consent and start
consent. Admit an unambiguous accepted D-id through existing do accept with its
recorded human actor; never turn a request for changes into acceptance. Only
then unblock the first dependency-ready task with the recorded start permission.
Until T-2 supplies new admission and adoption, this narrow step is supervised
from the actual owner records. It is not a permanent legacy bypass.

After T-2, adopt this still-active initiative into 0.4 with the preserved legacy
snapshot and actual bootstrap receipts. The adoption fails if owner consent or
the reviewed scope is absent or changed. It does not backdate start approval.

## Execution and stop contract

The owner's start permission authorizes the bounded task sequence. Implement
runs each ready task, records its actual result, and proceeds until the sequence
reaches the independent review phase. It does not request permission per task.

Stop on a failed expectation, source drift, changed approved scope, fresh proposed
decision, rejected required design, missing permission, or an authority mismatch.
A new decision or amended plan returns to owner review and start consent.
No task is marked done by a proposal, and no agent makes a human owner act.

T-7 is performed by the independent reviewer. The implementing agent supplies
the artifacts, rerun commands and evidence, then records the actual returned
verdict. It never manufactures PACK PASS. Finish spec remains the proposed
owner closure action after that review and all evidence, not automatic delivery.

## Frozen context

### T-1

Read brief.md, spec.md, owner-flow.md, design.md and plan.md T-1; wiki initiatives/spec-completion-handoff and domain/specpack-status-vocabulary. Owner gates: D-1,D-2,D-3,D-4 and separate exact-plan start. Initial blocked state records missing consent; no execution failure is claimed.

Owned paths: `treadle/packages/core/src/specpack`, `treadle/packages/core/src/index.ts`, `treadle/packages/core/test/owner-workflow.test.ts`, `wiki/assets/contracts/specpack-owner-workflow.schema.json`.

Expected evidence: Core fixtures exercise first handout/resume/record gates, rejected decision links, conditional spec ceremony, digest invalidation, current review/closure, actor claims and legacy output equality.

### T-2

Read brief.md, spec.md, owner-flow.md, design.md and plan.md T-2; wiki initiatives/spec-completion-handoff and domain/specpack-status-vocabulary. Owner gates: D-1,D-2,D-3,D-4 and separate exact-plan start. Initial blocked state records missing consent; no execution failure is claimed.

Owned paths: `treadle/packages/cli/src/commands/do.ts`, `treadle/packages/cli/test/owner-workflow.test.ts`, `treadle/packages/core/src/specpack`, `specs/spec-completion-handoff`.

Expected evidence: Init/adopt/start/status and owner mutation fixtures pass, stale revisions do not mutate, and adoption preserves actual owner consent without backdating or touching a closed pack.

### T-3

Read brief.md, spec.md, owner-flow.md, design.md and plan.md T-3; wiki initiatives/spec-completion-handoff and domain/specpack-status-vocabulary. Owner gates: D-1,D-2,D-3,D-4 and separate exact-plan start. Initial blocked state records missing consent; no execution failure is claimed.

Owned paths: `treadle/packages/web/src/servers.ts`, `treadle/packages/web/test/owner-workflow.test.ts`, `treadle/packages/core/src/specpack`.

Expected evidence: Decision/start/close events obey core gates and held revisions; concurrent writers serialize; audit fault and recovery fixtures preserve a single recorded owner act; old journals stay readable.

### T-4

Read brief.md, spec.md, owner-flow.md, design.md and plan.md T-4; wiki initiatives/spec-completion-handoff and domain/specpack-status-vocabulary. Owner gates: D-1,D-2,D-3,D-4 and separate exact-plan start. Initial blocked state records missing consent; no execution failure is claimed.

Owned paths: `treadle/packages/web/src/library.js`, `treadle/packages/web/src/library.html`, `treadle/packages/web/test/workflow-ui.test.ts`, `treadle/packages/web/test/inspector.test.ts`.

Expected evidence: DOM keyboard/pointer scenarios show the declared phase order, distinguish answers/decision/start/closure acts, and never offer execution or delivery through an unresolved gate. Record manual focus/target checks during implementation.

### T-5

Read brief.md, spec.md, owner-flow.md, design.md and plan.md T-5; wiki initiatives/spec-completion-handoff and domain/specpack-status-vocabulary. Owner gates: D-1,D-2,D-3,D-4 and separate exact-plan start. Initial blocked state records missing consent; no execution failure is claimed.

Owned paths: `treadle/packages/cli/harness/skills/sdlc/analyze`, `treadle/packages/cli/harness/skills/sdlc/plan`, `treadle/packages/cli/harness/skills/sdlc/implement`, `treadle/packages/cli/harness/skills/sdlc/review`, `.pi/skills`, `.codex/skills`, `.claude/skills`, `specs/spec-completion-handoff/verify-skills.mjs`.

Expected evidence: Four shipped skills match all three installed copies; skill evaluation covers brief/spec gates, reversible recorded decisions, explicit start, all-task stop conditions and independent review. No owner or PACK claim is fabricated.

### T-6

Read brief.md, spec.md, owner-flow.md, design.md and plan.md T-6; wiki initiatives/spec-completion-handoff and domain/specpack-status-vocabulary. Owner gates: D-1,D-2,D-3,D-4 and separate exact-plan start. Initial blocked state records missing consent; no execution failure is claimed.

Owned paths: `treadle/packages/conformance`, `treadle/conformance`, `treadle/packages/web/test/workflow-e2e.test.ts`, `specs/spec-completion-handoff/verify-review.mjs`, `wiki/initiatives/spec-completion-handoff.md`, `wiki/domain/specpack-status-vocabulary.md`.

Expected evidence: All gates pass; new owner-flow fixtures are reviewed deliberately and original golden bytes remain equal. End-to-end owner actors can progress through start, tasks, review and explicit completion; legacy approved documentation fixtures can use explicit decision/close controls without inferred consent.

### T-7

Read brief.md, spec.md, owner-flow.md, design.md and plan.md T-7; wiki initiatives/spec-completion-handoff and domain/specpack-status-vocabulary. Owner gates: D-1,D-2,D-3,D-4 and separate exact-plan start. Initial blocked state records missing consent; no execution failure is claimed.

Owned paths: `specs/spec-completion-handoff`, `wiki/initiatives/spec-completion-handoff.md`.

Expected evidence: An independent reviewer reruns task expectations, records real severity findings or PACK PASS for the current plan scope, and the verifier reads that actual artifact. The implementer cannot write its own independent verdict; owner closure remains separate.

## Traceability

| Requirement | Design                            | Tasks                        | Verification        |
| ----------- | --------------------------------- | ---------------------------- | ------------------- |
| FR-1        | DES-1, DES-2, DES-6               | T-1, T-2, T-6, T-7           | Task commands above |
| FR-2        | DES-2, DES-3, DES-4, DES-6        | T-2, T-3, T-4, T-6, T-7      | Task commands above |
| FR-3        | DES-1, DES-3, DES-4, DES-6        | T-1, T-3, T-4, T-6, T-7      | Task commands above |
| FR-4        | DES-1, DES-3, DES-4, DES-6        | T-1, T-3, T-4, T-6, T-7      | Task commands above |
| FR-5        | DES-5, DES-6                      | T-5, T-6, T-7                | Task commands above |
| FR-6        | DES-1, DES-2, DES-4, DES-6        | T-1, T-2, T-4, T-6, T-7      | Task commands above |
| FR-7        | DES-1, DES-2, DES-3, DES-4, DES-6 | T-1, T-2, T-3, T-4, T-6, T-7 | Task commands above |
| FR-8        | DES-5, DES-6                      | T-5, T-6, T-7                | Task commands above |
| FR-9        | DES-1, DES-2, DES-6               | T-1, T-2, T-6, T-7           | Task commands above |

## Status ledger

All 7 tasks: blocked on proposed decisions and missing start permission.
No execution evidence exists. Planning checks and independent PLAN review are
separate artifacts and cannot satisfy delivery PACK review.

## Handoff

- Ready now: owner review of four decisions and the exact seven-task scope.
- Blocked: all implementation tasks until recorded decision acceptance and separate start permission.
- Next step after those acts: implement the approved sequence; then independent red-foreman review.
- No prior documentation initiative is accepted or closed through this plan.
