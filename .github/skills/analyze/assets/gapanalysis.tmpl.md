---
kind: gap
slug: <kebab-slug>
title: <what knowledge was missing, plainly>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | absent | unknown
trigger: <compile miss / search miss / review finding / blocked task / stale wiki>
source_state: <relevant staged, unstaged, untracked, or clean inputs>
source_hashes: {}
supersedes: []
related: []
---

# Gap analysis — <title>

> The register of what we do not know, why it matters, where the answer
> might live, and how to close it. Ends in a close plan — never a shrug.
> This mode fixes the _context layer_; it does not spec or fix anything
> itself.

## Source pins and limits

Record HEAD, relevant dirty state, observed source hashes, and knowledge limits.
Cite actual files and documents. A fresh stamp does not verify dirty source bytes.
Separate current observations from historical evidence and proposed checks.

## Scope and Out-of-scope

State the bounded question and included slice. List exclusions explicitly.
If no exclusions exist, explain why the boundary is complete.

## Trigger

What failed or felt missing, concretely: the compile that came back
insufficient, the search that missed, the review that found us guessing,
the task that stalled. Quote the moment — it is the evidence this gap is
real.

## Gap register

| ID  | What we don't know | Why it matters (what it blocks) | Where the answer might live                      | How to close                                     |
| --- | ------------------ | ------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| G1  | …                  | …                               | repo path / wiki area / a person / an experiment | build-kb update / read source / spike / ask-once |

## Coverage & confidence

What IS grounded (and its evidence status) vs what rests on `unknown`.
Note stale pins: claims pinned to an older revision than `repo_head`.
Honest coverage here is the deliverable — "we know A, B solidly; C is
inferred from …; D is pure unknown."

## Close plan

Concrete next moves, each mapped to its owner/tool:

- Bounded `build-kb` refresh or external index retrieval for …
- spike for … (experiment-sized unknowns)
- ask-once human list for … (only what no artifact can answer)
- new wiki concepts worth authoring (curated, evidence-cited) for …

## Assumptions

What we will proceed on while gaps stay open — each with blast radius and
the gap ID that closes it:

| ID  | Assumption | Blast radius | Validation trigger | Closed by |
| --- | ---------- | ------------ | ------------------ | --------- |

## Open questions

Classify each question as source, experiment, human spec, or design.

| ID  | Question | Kind | Blocks | Owner | Resolution path |
| --- | -------- | ---- | ------ | ----- | --------------- |

## Handoff

- **Pack:** canonical path, held revision, format and spec-question state; or why no initiative is needed.
- **Artifacts and requirements:** references and registered candidate IDs.
- **Ready for planning:** bounded slices supported by evidence.
- **Blocked on:** unresolved IDs, slices, owners and resolution paths.
- **Next step:** one next skill or action with its inputs.
- **Checks and limits:** actual command exits, expected alignment gaps and unrun checks.

Read `resources/operations.md` from the skill before machine registration.
Analysis grants no implementation permission or owner approval.
