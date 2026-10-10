---
kind: design
slug: spec-completion-handoff
title: Versioned owner gates and an explicit delivery handoff
status: draft
created: 2026-10-10
repo_head: 5f0bd1fed1246e42f651f91f6d2166477a71c3c2
wiki_freshness: fresh
analysis_inputs: [bug-owner-gates.md, owner-flow.md, brief.md, spec.md]
related: [plan.md]
---

# Technical design

## Approach and authority

Declared: the owner's Q-1 answer specifies brief, spec question approval,
design decision approvals, task start permission, all-task implementation,
and independent review. Sources: owner-flow.md and interview.jsonl.

Proposed: implement this as a versioned contract with machine admission before
execution and explicit owner acts in the browser. A decision answer never counts
as start permission. The approved start covers the bounded sequence, not each
individual task. New or amended scope pauses for owner review.

The original analysis recommended scoped decision gates. The owner now specifies
a whole-plan decision barrier before task start. Keep per-task decision links
so rejected choices cannot release the tasks that implement them. Original
proposals and the owner's answer remain in pre-plan-revision-4.json.

## Alternatives and proposed decisions

All four decisions remain proposed and require explicit owner acceptance.
Reversibility is not an exemption from this gate.

| ID  | Proposed choice                                                                                                             | Real alternative and tradeoff                                                                                                                                                     | Door                                                    | Basis                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| D-1 | Whole-plan decision approval before start, with per-task accepted-decision links and explicit phase questions               | Scoped-only readiness can start an independent slice before all design decisions; conflicts with the owner's stated flow. Blanket acceptance would hide rejected choices.         | Two-way implementation                                  | Declared owner flow; FR-1/2/6                  |
| D-2 | Separate Finish spec act after evidenced tasks and current independent PACK PASS                                            | Automatic completion or overloading spec approval hides the final human act. Owner did not choose the final label in Q-1.                                                         | Two-way code; closure freezes the record                | Existing closePack human guard; FR-3/4         |
| D-3 | Add specpack/0.4 for gated work; legacy 0.2/0.3 remain explicit legacy contracts                                            | A 0.3 extension is silently ignored by older engines; globally changing legacy behavior breaks golden witnesses. New format fails closed on an old engine.                        | Two-way before adoption; preserve pre-adoption snapshot | Loader format gate and emit; FR-9              |
| D-4 | Separate start receipt bound to a canonical plan digest; serialize owner writes and persist receipts atomically in the pack | Reusing date.approved conflates spec and execution approval. Revision-only permission becomes stale on harmless evidence writes; no scope binding allows unapproved plan changes. | Two-way code; owner acts are append-only evidence       | FR-7/8; current savePack and revision behavior |

## Change by surface

| Surface                                            | Proposed change                                                                                                                                        | Evidence                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| core model/loader/emit/admission/next/record/close | Validate 0.4 workflow shape; compute gate state and plan scope; guard first handout, resume and evidence admission; require current review for closure | next.ts:62, record.ts:19, close.ts:15, loader.ts:19; implementation-supported       |
| CLI commands and pack writer                       | Explicit gated init/adopt/start/status; revision checks on owner acts; guarded mutation transaction                                                    | commands/do.ts:45; implementation-supported                                         |
| web event service and journals                     | Decision/start/close actions through core admission; revision preconditions and structured gate report                                                 | web/src/servers.ts:85; implementation-supported                                     |
| library UI                                         | Ordered phase flow, decision controls, task preview, Start implementation and Finish spec                                                              | web/src/library.js:459; implementation-supported                                    |
| four shipped SDD skills and installed copies       | Brief/spec handoff, decision barrier, start barrier, approved-sequence orchestration, independent review and closure handoff                           | harness/skills/sdlc; implementation-supported                                       |
| new contract and conformance fixtures              | Publish 0.4 schema and owner-workflow fixtures without rewriting protected 0.2/0.3 inputs or outputs                                                   | wiki/assets/contracts/specpack.schema.json; frozen corpus; implementation-supported |

## Contracts and data

The following shapes are proposed, not present runtime capabilities.

- `format: specpack/0.4`: existing canonical sections plus a `workflow` section.
  Insert workflow before review only when present, preserving legacy byte order.
- `workflow.policy: owner-gated/1`; explicit plan version; phase question ids;
  a `phase_questions.spec` list; optional `start_receipt: {by, at, plan_digest}`;
  durable `acts` receipts and a `pending_audit` queue. Draft birth may omit
  documents and a start receipt; these are named readiness gaps, not implicit
  authority. Malformed policy/receipt data refuses to load.
- `task.requires_decisions: D-id[]`: distinct from needs:T, implements:DES,
  honors:CON and accepts:AC. Validate every referenced decision. A rejected
  required decision blocks its task until a newly accepted design replaces it.
- Keep `date.approved` for the spec question ceremony. Store execution approval
  separately. Receipt actors require human claims; do not infer either act.
- Gate report phases: brief/spec questions, decisions, start, implementation,
  review, closure, delivered. This is an additive workflow projection, not
  a new value in the frozen seven-stage legacy vocabulary.
- Expose owner decision, start and close commands and a workflow endpoint.
  Every mutation requires held revision and recomputes eligibility at admission.
  Read eligibility cannot authorize a later stale write.
- Keep specweb-events/0.1 readable and unchanged. New owner workflow events use
  a separate `workflow.jsonl` with owner-workflow-events/0.1 header, typed ids,
  revision, by, at and scope. Do not append new kinds under the old header.
- The canonical pack's atomic save includes the owner receipt and a durable
  pending-audit entry. After save, append/fsync the separate audit journal.
  An interrupted audit append leaves a visible pending entry; recovery appends
  idempotently by event id and clears it without repeating the owner act.
  An action already recorded is reported as recorded, with audit status.
- Serialize mutations per pack across CLI and web with a pack lock. Competing
  revisions refuse after reload. Stale lock recovery fails closed and requires
  explicit verification; a timeout alone cannot discard another writer's lock.

Plan digest input: requirement/design/decision definitions, task dependencies,
verification instructions, declared context paths/queries/reads, and hashes of
immutable brief/spec/design/plan artifacts. Exclude task statuses/evidence, owner
answers and stamps, review verdicts, revision counters, audit progress, and
machine-populated touch hashes. Existing source-drift pins remain a separate
check. Keep the approved plan documents immutable; append execution observations
to execution-log.md with references to canonical task evidence. Any substantive
plan amendment is a new proposal and needs fresh start permission. A digest change stops new work and resume; do not silently refresh a
start receipt. The PACK review for 0.4 cites this digest as well.

Legacy compatibility: preserve 0.2/0.3 behavior and golden bytes. New SDD work
uses an explicit gated init option that emits 0.4. Existing active packs adopt
only through a reviewed owner act that preserves their prior bytes and never
claims retroactive start permission. No closed pack is adopted. Publish a new
0.4 schema; the vendored original schema stays unchanged. Its description says
x-* extensions, but its additionalProperties:false rules do not define them;
do not rely on that claimed extension support.

## Failure behavior and rollback

Proposed decision, missing spec answer/approval, missing start, rejected required
design, stale digest, stale revision, source drift and missing current review
return named gates before mutation. A failed task stops the orchestrator.

A decision or plan amendment invalidates execution permission before a resumed
handout. Spec approval never accepts a decision. PACK PASS never claims human
closure. A fresh human claim cannot bypass missing evidence.

Atomic pack save is the authoritative owner-act boundary. A failed audit append
is visible and recoverable; it never fabricates a second approval. Lock, missing
artifact and malformed 0.4 data failures refuse safely with a repair path.

Before adoption, rollback consists of discarding proposed changes. After 0.4
adoption, an old engine refuses that format. Recovery uses the preserved snapshot
or a deliberate new version; it does not delete recorded owner acts or edit a
closed record. Contract goldens require deliberate review before regeneration.

## Carried uncertainty and bootstrap

Q-1 supplies the owner flow. It does not resolve the final closure label or
accept D-1 through D-4. Those choices are in this decision table.

The current engine cannot enforce this proposal yet. All authored implementation
tasks therefore start blocked with owner gates recorded in their frozen context.
No failure evidence is invented. The current browser can ask explicit questions;
recorded per-decision consent can be admitted through the existing accept command.
Implementation also needs a separate answer authorizing the exact plan scope.
No do next command is run on this proposal before that permission.

After real owner decisions and start consent, unblock only the dependency-ready
task using recorded authorization. T-1 supplies the new policy. T-2 supplies
adoption and adapters; adopting this active pack preserves the bootstrap receipts
and prior JSON and does not backdate any receipt. Later tasks use the new gate.
This narrow bootstrap is specific to building the gate, not a general bypass.

## Out of scope

Resolving prior documentation decisions, closing prior initiatives, rollback of
the docs move, historical retrospectives, remote authentication, source-freshness
redesign, a generic job scheduler, and speculative parallel execution.

## Handoff

The design is concrete for owner review. D-1 through D-4 and the plan start
remain pending. No implementation slice is authorized yet.
