---
kind: plan
slug: <kebab-slug>
title: <what this plan proposes>
status: draft
created: YYYY-MM-DD
repo_head: <commit observed at authoring>
design_ref: design.md | "mini-design below"
analysis_inputs: [spec.md, impact-<change>.md]
depth: full-design | compact-design | mini-design | micro-plan
rationale_for_depth: <reason based on impact evidence>
---

# Plan — <title>

> This is the readable delivery proposal. The canonical JSON pack owns tasks and evidence.
> Keep this artifact unchanged after start approval. Append progress to execution-log.md.

## Scope and machine record

- Canonical pack: <path, format, held revision>.
- Planned requirements: <FR IDs and prose ID mappings>.
- Deferred scope: <IDs, blocking question or decision, owner if known, and unblock action>.
- Current machine gate: <observed status; no implied permission>.

## Mini-design (only for mini or micro depth)

State the approach, real alternatives, contracts, failure behavior, exclusions, and proposed decision IDs.
Include a local Mermaid behavior diagram if it clarifies the change, or state the omission reason.
For full or compact depth, link to design.md instead of duplicating it.

## Task definitions

| ID     | Bounded outcome    | FR / DES / AC links   | Needs (T IDs)                   | Requires decisions (D IDs) | Verification command and expected observation                   |
| ------ | ------------------ | --------------------- | ------------------------------- | -------------------------- | --------------------------------------------------------------- |
| <T-id> | <goal and outputs> | <canonical trace IDs> | <prerequisite task IDs or none> | <proposed D IDs or none>   | <actual proposed command, working directory, measurable result> |

Name exclusions and allowed file changes per task. Give each task a coherent, independently verifiable outcome.
Unresolved follow-ups belong in the scope register, not fake tasks with question IDs as prerequisites or checks.
Walk the graph: no cycles, self-prerequisites, dangling IDs, or ordering without an output dependency.

## Delivery DAG (when useful)

For branching or nontrivial dependencies, insert a fenced Mermaid flowchart with canonical T IDs.
Use arrows from prerequisite to dependent. Match every edge to the JSON `needs` field.
State a caption and plain-text order, including branch and join behavior.
A diagram shows proposed dependencies, not execution status or permission.
For one task or a simple chain, state why the task table is sufficient.

## Context per task

For each canonical T ID, list:

- `context.touch`: allowed repository-relative paths; new paths are explicit.
- `context.read`: source and analysis/design files the worker must read.
- `context.wiki`, `links`, `notes`, `commands`: relevant concepts, references, constraints, and precise commands.
- Verification working directory and required tools.

Touch files pin at machine handout time. Read and wiki entries remain advisory unless explicitly supported pins are supplied.
Do not claim all references are hash-frozen. Missing context returns to planning rather than open-ended exploration.

## Traceability

| Planned FR / AC | Design element or section | Task(s) | Verification expectation        |
| --------------- | ------------------------- | ------- | ------------------------------- |
| <ID>            | <DES ID or section>       | <T IDs> | <command and observable result> |

Every planned requirement reaches a check. Every task reaches a requirement.
Report deferred requirement gaps separately; do not hide them behind a green alignment result.

## Proposal validation

Record actual alignment, status, discovery, schema, DAG, artifact, and diagram checks.
Include command, exit code, and evidence reference where applicable. Disclose unavailable checks.
Do not record planned verification as an observed pass.

## Handoff

- Pack and held revision: <actual path and revision>.
- Structural entry set: <tasks without unmet task prerequisites; proposal only>.
- Owner gate: <spec questions, decision acceptance, or separate start action as actually reported>.
- Follow-ups: <blocking IDs and unblock actions>.
- Next action: <owner review before permission; implement handout only after a valid start receipt>.
- Progress record: execution-log.md and canonical task evidence. There is no live status ledger in this approved plan.
