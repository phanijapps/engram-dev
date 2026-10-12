---
kind: design
slug: <kebab-slug>
title: <approach, plainly>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | unknown
analysis_inputs: [feature.md, spec.md, impact-<change>.md, spike-n-<topic>.md]
related: []
---

# Technical design — <title>

> Bounded to the Ready-now slices of the analysis Handoff. Every choice
> traces to an R/Q/A/D id from `specs/<slug>/`. Evidence status on
> load-bearing claims: declared / implementation-supported / inferred /
> conflicting / unknown.

## Approach

The selected way the system changes, in 1–3 paragraphs — enough for a
reviewer to check the reasoning, not a manual.

**Options considered** (from analysis + grounding; alternatives are real,
not strawmen):

| Option       | Meets constraints? | Cost / risk | Verdict        |
| ------------ | ------------------ | ----------- | -------------- |
| A (selected) | …                  | …           | chosen — D<n>  |
| B            | …                  | …           | rejected — why |

## Change by surface

| Surface (wiki cid / path) | What changes | Contracts touched | Evidence                 |
| ------------------------- | ------------ | ----------------- | ------------------------ |
| …                         | …            | …                 | implementation-supported |

From the analysis's affected-surfaces table + fresh grounding, not
memory. Surfaces not touched: one line saying so, or they appear here.

## Architecture and behavior views (when useful)

Select Mermaid views with `resources/diagrams.md`. Keep only views that answer a concrete question.
Use C4 context or container views for boundaries and dependencies.
Use flowcharts for process branches and sequence diagrams for message order and failure alternatives.
Use portable flowchart notation for C4 when native C4 support is unavailable.

For each view, include its caption, current/proposed status, FR/DES/D references, and evidence or uncertainty.
Insert a fenced `mermaid` block and a plain-text explanation beside the related contract or failure section.
Record parser/render validation and its limits. If omitted, state why diagrams do not clarify this change.
Do not leave an illustrative example or placeholder diagram in the authored design.

## Contracts & data

External interfaces, data shapes, file formats, CLI/API — before/after.
Compatibility posture for anything shared (this is what the impact
artifact's dispositions constrain): retain / revise / replace, and what
migrates.

## Failure behavior

New failure modes the change introduces, error handling posture, rollback
story. "None" must be credible, not assumed.

## Decisions

Continues the analysis's D-numbering. Each: choice · alternatives ·
two-way/one-way door · evidence status · resolves/defers.

| ID   | Decision | Alternatives | Door    | Resolves | Status                             |
| ---- | -------- | ------------ | ------- | -------- | ---------------------------------- |
| D<n> | …        | …            | one-way | Q<m>     | proposed — owner sign-off required |

**All proposed decisions:** dependent tasks name canonical D IDs in `requires_decisions`.
Keep decisions proposed until actual owner acceptance. Reversibility does not waive acceptance.
Record accepted actor and date only from the real owner record.

## Carried uncertainty

Questions/assumptions this design leaves open — verbatim ids from the
analysis, plus any new ones discovered here (registered back in the
owning artifact, never orphaned in this file).

| ID  | Carried question / assumption | Blocks | Path |
| --- | ----------------------------- | ------ | ---- |

## Out of scope

Explicit, mandatory. Includes everything the analysis excluded plus what
this design deliberately declines. Empty register must state why that is
credible.

## Evidence index

| Claim | Source | Status |
| ----- | ------ | ------ |
