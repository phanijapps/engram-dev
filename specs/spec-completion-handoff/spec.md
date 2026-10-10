---
kind: spec
slug: spec-completion-handoff
status: draft
repo_head: 5f0bd1fed1246e42f651f91f6d2166477a71c3c2
related: [owner-flow.md, brief.md, design.md, plan.md]
---

# Proposed contract

Authority: owner-flow.md records the declared workflow. The numbered requirements
below turn it into proposed, observable implementation behavior. They do not
accept design decisions or authorize execution.

| ID   | Requirement                                                                                                                                            | Acceptance scenario and method                                                                                                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-1 | Applicable recorded design decisions require owner acceptance before dependent execution. The whole plan waits while any current decision is proposed. | Given a proposed decision, next/record/resume refuse execution; after decision acceptance alone they still wait for start permission. Core tests.                                                                                                            |
| FR-2 | The review surface exposes explicit decision acceptance and rejection.                                                                                 | Given D-1 proposed, an owner accept act persists its human claim; an agent claim or a stale request refuses without mutation. Server and DOM tests.                                                                                                          |
| FR-3 | Completion uses existing evidence requirements and an explicit owner closure act.                                                                      | Given all tasks evidenced and current PACK PASS, Finish spec persists complete/delivered; each missing obligation refuses; a frozen record refuses repeats. Core/server tests.                                                                               |
| FR-4 | Task exhaustion, pending owner decisions, missing review, and pending closure appear as distinct handoffs.                                             | Given all tasks done without current review, the UI requests review and does not show delivery. Core/DOM tests.                                                                                                                                              |
| FR-5 | Analyze, plan, implement, and review carry the same owner gates in shipped and installed instructions.                                                 | Verify matching Pi/Codex/Claude copies and evaluation cases for proposed reversible decisions and late scope changes. Artifact comparison and skill review.                                                                                                  |
| FR-6 | Requirement, brief, spec, design/plan, and task proposal are connected artifacts. Spec questions gate readiness; design decisions have separate acts.  | Given an unresolved spec question, start refuses; when the required spec question ceremony and approval are settled, design and start gates remain independent. Core/DOM tests.                                                                              |
| FR-7 | A separate owner start permission covers the exact immutable plan scope.                                                                               | Given accepted decisions without a matching start receipt, next/record refuse. Changed requirements, decision definitions, task instructions or frozen plan artifacts invalidate permission, including resume. State/evidence timestamps do not. Core tests. |
| FR-8 | Implementation runs the approved sequence, admits each task's actual evidence, then invokes independent red-foreman review.                            | An orchestration fixture covers success through review handoff; failure, fresh decision, drift, or missing permission stops the loop. The implementer cannot manufacture PACK PASS or human closure. Skill evaluation and integration test.                  |
| FR-9 | New gated contracts fail closed on engines that cannot enforce them; legacy witnesses stay byte-identical.                                             | Old engines refuse format 0.4; current engines preserve old 0.2/0.3 fixture outputs. New workflow fixtures exercise all gates. Conformance tests.                                                                                                            |

Approval boundaries: answering a question is not generic decision acceptance.
Accepting decisions is not start permission. Start permission is not final closure.
Rejection does not release tasks that depend on the rejected design.

The conditional spec-approval rule applies when spec questions require the
owner ceremony. A pack with no spec questions proceeds to design without an
extra inferred owner act. Phase membership is explicit in the new contract.

No evidence, task state, decision acceptance, start receipt, review PASS, or
closure is fabricated by authoring this specification.
