---
kind: feature
slug: <kebab-slug>
title: <capability change, plainly>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | absent | unknown
source_state: <relevant staged, unstaged, untracked, or clean inputs>
source_hashes: {}
supersedes: []
related: []
---

# Feature analysis — <title>

> Connect the sourced problem to a bounded capability change. Summarize affected
> contracts and consequences. Link a detailed spec or impact artifact when useful.
> Label evidence and uncertainty; do not invent content to fill the template.

## Source pins and limits

Record HEAD, relevant dirty state, observed source hashes, and knowledge limits.
Cite actual files and documents. A fresh stamp does not verify dirty source bytes.
Separate current observations from historical evidence and proposed checks.

## Scope and Out-of-scope

State the bounded question and included slice. List exclusions explicitly.
If no exclusions exist, explain why the boundary is complete.

## Problem & evidence

The problem in the user's terms, and the pinned evidence that it exists
(issues, failing scenarios, wiki concepts — with status labels).

## Current behavior

What the system does today, pinned to HEAD and relevant source hashes. Cite wiki concepts
(`wiki/systems/**`, `wiki/code/**`) and source paths. If knowledge conflicts,
record the conflict and use inspected source evidence for current behavior.

## Proposed behavior

What should change, at the capability level (not implementation detail).
One paragraph, testable in principle.

## Affected surfaces

| Surface | Why affected | Evidence (wiki cid / path) | Status                   |
| ------- | ------------ | -------------------------- | ------------------------ |
| …       | …            | …                          | implementation-supported |

From knowledge traversal and actual source reads, not guesswork. Unknown surfaces are listed
with status `unknown` — that is a finding, not a failure.

## Impact candidates

Shared contracts, storage formats, or public APIs touched? If yes →
summarize the effects and verification consequences. Link a separate **impact**
artifact when the detail needs it. If no → "none identified" + why credible.

## Open questions

Classify each question as source, experiment, human spec, or design.

| ID  | Question | Kind | Blocks | Owner | Resolution path |
| --- | -------- | ---- | ------ | ----- | --------------- |

## Assumptions

| ID  | Assumption | Blast radius | Validation trigger |
| --- | ---------- | ------------ | ------------------ |

## Decisions needed

| Decision | Needed by (what it unblocks) | Two-way / one-way | Evidence status |
| -------- | ---------------------------- | ----------------- | --------------- |

Decisions not yet made stay here — do not manufacture them.

## Handoff

- **Pack:** canonical path, held revision, format and spec-question state; or why no initiative is needed.
- **Artifacts and requirements:** references and registered candidate IDs.
- **Ready for planning:** bounded slices supported by evidence.
- **Blocked on:** unresolved IDs, slices, owners and resolution paths.
- **Next step:** one next skill or action with its inputs.
- **Checks and limits:** actual command exits, expected alignment gaps and unrun checks.

Read `resources/operations.md` from the skill before machine registration.
Analysis grants no implementation permission or owner approval.
