---
title: Versioned Solution Graph Harness
document_type: structured_brief
version: 1.0.0
status: proposed
date: 2026-10-05
architecture_option: 2
canonical_format: JSON
schema_dialect: https://json-schema.org/draft/2020-12/schema
---

# Versioned Solution Graph Harness

## 1. Decision

Build a delivery harness around a versioned solution graph. A single logical package connects PRD sources, goals, requirements, acceptance criteria, constraints, questions, decisions, design, tasks, and verification. Deterministic software controls persistence, context compilation, scheduling, permissions, and evidence checks. Model reasoning supplies proposals and implementation work.

The package is a review and interchange surface. PostgreSQL is the recommended initial authoritative store, with artifact storage for larger evidence and isolated workers for execution. A dedicated graph database is an alternative if measured traversal workloads justify it. A linked list is insufficient for shared prerequisites, many-to-many traceability, and reverse change impact.

This is a proposed build contract, not an implemented production harness. The schemas and reference checker are executable. Identity, authorization, persistence, worker isolation, durable execution, and external adapters remain to be built and evaluated.

## 2. Problem

Document-first workflows lose the relationship between intent, design decisions, code changes, and current evidence. Loading entire specifications wastes context, while loading only a local task can omit decisive constraints. Mutable status fields hide the distinction between a completed historical attempt and a currently valid solution.

The harness must make these relationships explicit without requiring the complete initiative to be designed before any bounded task can begin. It must preserve uncertainty and permit investigations, clarification, and changes during implementation.

## 3. Desired behavior

| Capability | Required behavior |
|---|---|
| Clarify intent | Record requested behavior, proposed additions, questions, and assumptions separately. |
| Preserve authority | Product interpretations and architectural choices become accepted only through configured authority. |
| Load context progressively | Compile the necessary accepted knowledge, global constraints, source evidence, and exact repository pins for one task. |
| Schedule deterministically | Use a validated prerequisite DAG, stable ordering, resource claims, budgets, and leases. |
| Reconsider changes | Find candidate downstream effects and require dispositions before stale evidence can satisfy current completion. |
| Recover execution | Reconcile ambiguous effects before retrying; preserve uncertainty when an adapter cannot establish the outcome. |
| Establish completion | Check current criteria against identified implementation and environment revisions, including integration behavior. |

## 4. Initial operating scope

Start with one existing repository and bounded features, business-rule changes, or reproducible defects. Reuse its build, tests, CI, and release process. Support one worker initially, then concurrency with fencing and explicit resource conflicts.

The first pilot produces a reviewable patch and current verification evidence. Production deployment, irreversible data migrations, and cross-system rewrites are outside that pilot unless explicitly authorized and supported by tested adapters.

Repository discovery must be language-neutral at the initiative level. Language and platform adapters extract facts and report limitations. Reuse `build-repo-knowledge` after its output is mapped to these contracts and evaluated.

## 5. Architecture

| Module | Responsibility |
|---|---|
| Initiative API | Authenticate callers, resolve scope, accept proposals and authorized commands, return snapshots. |
| Schema registry | Load frozen schemas locally; validate core contracts and registered extension payloads. |
| Graph store | Keep immutable node/relation revisions, head projections, authority records, and change dispositions. |
| Proposal processor | Validate expected revisions, references, graph invariants, permissions, and atomic changes. |
| Context compiler | Resolve mandatory coverage, frozen sources, budgets, ordering, and integrity manifests. |
| Scheduler | Compute eligibility, acquire resource claims and leases, and create attempts. |
| Durable orchestrator | Persist progress, waiting, retries, cancellation, and recovery. |
| Isolated workers | Execute authorized model/tool/build/test operations against pinned inputs. |
| Effect adapters | Provide action-specific idempotency, observation, receipts, and compensation capabilities. |
| Evidence service | Ingest actual artifacts and runner observations; derive completion and release readiness. |
| Operational views | Expose blockers, decisions, graph impact, readiness, cost, recovery, and audit history. |

Prefer a modular service with separate execution workers initially. Existing durable workflow infrastructure can be reused. Temporal is one candidate, not a mandatory dependency.

## 6. Key contracts

1. Stable identities are distinct from revision numbers. Revisions are immutable.
2. `node_states` selects current node heads and projects authority/validity. `task_states` projects execution. Neither belongs in model-proposable node content.
3. `package_revision` changes when graph meaning, authority, policy bindings, validity decisions, or lifecycle changes. Runtime observations also advance `event_sequence`; they do not automatically increment the graph revision.
4. Proposals are atomic, carry an expected package revision, and cannot set acceptance, actors, timestamps, execution success, or permissions.
5. A unified export contains current heads and every referenced historical record needed to resolve the included graph and runtime records. Artifact bytes remain external.
6. Imported JSON is untrusted. It enters as a draft proposal; its authority and success claims are never adopted as authorization.
7. All extension payloads use namespaced, versioned envelopes. Trusted registry configuration defines their schemas and allowed behavior.

## 7. Skills to author later

| Skill | Purpose | Stage |
|---|---|---|
| `delivery-workflow` | Propose the next justified reasoning activity. | Pilot |
| `requirement-discovery` | Ideate, clarify, and expose assumptions. | Pilot |
| `requirement-modeling` | Produce testable requirements and criteria. | Pilot |
| `feasibility-investigation` | Resolve bounded technical uncertainty. | Pilot |
| `solution-design` | Propose contracts and design decisions. | Pilot |
| `task-planning` | Produce verifiable tasks and real prerequisites. | Pilot |
| `task-implementation` | Implement authorized tasks against frozen context. | Pilot |
| `solution-verification` | Assess behavior and evidence coverage. | Pilot |
| `adversarial-review` | Challenge interpretations and completion claims. | Pilot |
| `change-impact-analysis` | Propose retain/revise/replace/defer dispositions. | Pilot |
| `context-gap-investigation` | Find missing sources and relationships. | Pilot |
| `execution-recovery-triage` | Investigate exceptional ambiguous effects. | Hardening |

Skills guide reasoning. They do not implement the state machine, acquire leases, validate authorization, or declare authoritative success. No skill or agent package is created by this deliverable.

## 8. Build sequence and exit evidence

| Milestone | Deliverable | Exit evidence |
|---|---|---|
| M0 Contracts | Adopt schemas, relation semantics, policy owners, workload scope, and baseline. | Representative examples accepted; unsafe counterexamples rejected; decisions recorded. |
| M1 Graph | Transactions, immutable revisions, authority records, outbox, and local schema registry. | Stale writes and dangling references rejected; concurrent commit and restoration tested. |
| M2 Context | Mandatory selection, source resolution, canonical output, manifests, and gap handling. | Identical frozen inputs yield identical bytes; omitted constraints and exhausted budgets block execution. |
| M3 Pilot execution | Task readiness, isolated worker, artifact ingestion, verification, existing CI integration. | Reviewable changes with current evidence; historical success cannot satisfy changed scope. |
| M4 Enterprise hardening | Identity isolation, fencing, durable recovery, budget enforcement, restoration, and operations. | Fault injection, tenant isolation, adapter reconciliation, backup restore, and support procedures pass. |
| M5 Expansion | More change types, repositories, languages, and effect adapters. | Representative cross-boundary scenarios meet agreed quality and recovery targets. |

## 9. Evaluation and stop criteria

Hard invariants have zero tolerance in the evaluated workload: unauthorized effects, overwritten accepted revisions, unresolvable references, fabricated evidence, silent mandatory-context omission, or unbounded retries. A passing reference test suite does not establish these production guarantees.

Measure requirement misses, rework, human review effort, total delivery time/cost, consequential context omissions, and recovery outcomes against comparable baseline changes. Graph coverage is reported separately from semantic correctness. Include blocked and abandoned work in the comparison.

Narrow or stop the rollout if graph maintenance exceeds its reduction in rework, review effort rises without better outcomes, or recovery still requires guessing. Enterprise readiness applies only to the tested scope.

## 10. Deliverable boundaries

`Technical_Spec.md` provides API behavior, storage contracts, state transitions, deterministic algorithms, extension governance, and acceptance cases. `schemas/` contains executable JSON Schema contracts. `examples/` contains synthetic fixtures, including the unified package and a registered extension. `tools/` and `tests/` provide a reference checker and adversarial contract tests.

The fixture policy, actor identifiers, repository commits, skill digest, and token estimates are illustrative. They do not represent authenticated decisions, actual repository changes, executed integration tests, or a production tokenizer.
