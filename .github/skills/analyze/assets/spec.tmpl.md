---
kind: spec
slug: <kebab-slug>
title: <what must be true, plainly>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | absent | unknown
source_state: <relevant staged, unstaged, untracked, or clean inputs>
source_hashes: {}
supersedes: []
related: []
---

# Spec — <title>

> One bounded slice of testable contract. Spec ONLY in-scope behavior.
> Every claim carries an evidence status: declared / implementation-supported /
> inferred / conflicting / unknown. Sections without content say "none
> identified" and why that is credible — never invented filler.

## Source pins and limits

Record HEAD, relevant dirty state, observed source hashes, and knowledge limits.
Cite actual files and documents. A fresh stamp does not verify dirty source bytes.
Separate current observations from historical evidence and proposed checks.

## Why

Problem, user-visible outcome, and the evidence that it is a real problem
(links to feature.md, issues, wiki concepts — with status labels).

## Scope

**In:** the slices this spec makes testable.

**Out-of-scope (mandatory):** everything deliberately excluded. An empty register
must state why completeness is credible.

## Requirements

| ID   | Requirement (testable, MUST/SHOULD) | Acceptance criterion | Evidence / status                    |
| ---- | ----------------------------------- | -------------------- | ------------------------------------ |
| FR-1 | …                                   | …                    | path:line (implementation-supported) |

Requirements cover in-scope slices only. No "while we're here" creep.
Use canonical `FR-*` IDs in both prose and machine records.
Proposal and evidence status stay in prose, not extra fields on requirement objects.

## Acceptance criteria

Given/when/then per requirement, with the **method** that will check it
(test, inspection, measurement). Method is a plan, not a result. Report actual investigation
outcomes separately; they do not establish that proposed behavior is implemented.

- **AC-1 (checks FR-1):** Given … when … then … — method: …

## Constraints

| Constraint | Mandatory / preference | Source                                    | Applies to |
| ---------- | ---------------------- | ----------------------------------------- | ---------- |
| …          | mandatory              | wiki/<concept>.md, spec, or decision link | FR-1, FR-2 |

## Open questions

Classify each question as source, experiment, human spec, or design.

| ID  | Question | Kind | Blocks | Owner | Resolution path |
| --- | -------- | ---- | ------ | ----- | --------------- |

Questions are deliverables. None of them may be silently resolved to make
the spec look finished.

## Assumptions

| ID  | Assumption | Blast radius | Validation trigger                  |
| --- | ---------- | ------------ | ----------------------------------- |
| A1  | …          | FR-3 + AC-3  | when X happens / before milestone Y |

## Proposed decisions and cited existing decisions

| Decision | Alternatives considered | Door (two-way / one-way) | Resolves |
| -------- | ----------------------- | ------------------------ | -------- |
| D1       | …                       | two-way                  | Q1       |

Label new choices proposed. Cite existing acceptance only from an actual record.
If evidence cannot support a choice, keep the question open. One-way doors get extra scrutiny and name their reversibility cost.

## Evidence index

| Claim | Source                | Status                   |
| ----- | --------------------- | ------------------------ |
| …     | path:line or wiki cid | implementation-supported |

## Handoff

- **Pack:** canonical path, held revision, format and spec-question state; or why no initiative is needed.
- **Artifacts and requirements:** references and registered candidate IDs.
- **Ready for planning:** bounded slices supported by evidence.
- **Blocked on:** unresolved IDs, slices, owners and resolution paths.
- **Next step:** one next skill or action with its inputs.
- **Checks and limits:** actual command exits, expected alignment gaps and unrun checks.

Read `resources/operations.md` from the skill before machine registration.
Analysis grants no implementation permission or owner approval.
