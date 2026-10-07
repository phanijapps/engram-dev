---
kind: plan
slug: <kebab-slug>
title: <what this plan executes>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
design_ref: design.md | "mini-design below"
analysis_inputs: [spec.md, impact-<change>.md]
depth: full-design | compact-design | mini-design | micro-plan
rationale_for_depth: <one line — usually the impact artifact's verdict>
---

# Plan — <title>

> The executable consequence of design.md. Tasks are small, AND-only,
> acyclic, each with an observable verification expectation and frozen
> context. Status changes reflect observed evidence only.

## Mini-design (only when depth = mini/micro)

Approach + options considered + the one decision made. Skip for
full/compact depth — design.md owns that.

## Task DAG

| ID | Task (goal, one line) | Implements | Prereqs | Verification expectation | Size | Status |
|----|------------------------|------------|---------|--------------------------|------|--------|
| T1 | … | R1, D2 | — | `<command>` exits 0 / <observable> | S | todo |
| T2 | … | R1 | T1 | <command or observation> | M | todo |
| T3 | … | R2 | — | blocked-on: Q3 | S | blocked |

Rules enforced by walking, not eyeballing: no cycles, no self-prereqs,
every prereq output exists as a later task's input, every blocked-on id
resolves to a real Q/D id.

## Frozen context (per task)

What implement loads for the task — exactly this, no browsing:

- **T1:** `okf search "<question>"` + `okf read <cid> --depth 1`; wiki:
  `<cid list>`; refs: spec.md §R1, design.md §D2, `<source paths>`; key
  files: `<paths>`.

## Traceability matrix

| Requirement | Design section | Task(s) | Verification |
|-------------|----------------|---------|--------------|
| R1 | §Approach/§Contracts | T1, T2 | T1+T2 expectations |
| R2 | §Change-by-surface | T3 | T3 expectation |

Any planned R with no task = hole (fix the plan). Any task implementing
nothing = creep (cut it).

## Ready set

Tasks with all prereqs done and no blocking ids — implement's entry
contract: **[T1]**. If empty, the plan is a parking lot: name the first
unblock move instead.

## Status ledger

Observed evidence only — commands run (with outcome refs), commits,
review artifacts. "Should work" is not a status.

| Task | Status | Evidence |
|------|--------|----------|
| — | — | (implement/review fill this; plan leaves it empty) |

## Handoff

- **Ready now:** T1 → `implement` (frozen context as listed)
- **Blocked:** T3 (Q3 → owner/path from the analysis register)
- **Next step:** single next skill invocation and its input
