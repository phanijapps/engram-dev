---
kind: bug
slug: <kebab-slug>
title: <defect, plainly>
status: draft
created: YYYY-MM-DD
repo_head: <commit pinned at authoring>
wiki_freshness: fresh | stale | absent | unknown
source_state: <relevant staged, unstaged, untracked, or clean inputs>
source_hashes: {}
supersedes: []
related: []
---

# Bug analysis — <title>

> Hypothesis ledger BEFORE fix talk. Root cause is written only from a
> confirmed hypothesis; an analysis that ends at the ledger plus
> deciding-evidence is a valid outcome. Evidence status on every claim.

## Source pins and limits

Record HEAD, relevant dirty state, observed source hashes, and knowledge limits.
Cite actual files and documents. A fresh stamp does not verify dirty source bytes.
Separate current observations from historical evidence and proposed checks.

## Scope and Out-of-scope

State the bounded question and included slice. List exclusions explicitly.
If no exclusions exist, explain why the boundary is complete.

## Identity

- **Repro steps:** minimal, ordered, starting from a clean state.
- **Environment:** revision / platform / config pins that matter.
- **Frequency:** always / intermittent-under-<condition> / seen once.
- **Severity rationale:** what breaks for whom (evidence or `inferred`).

## Observed vs expected

|          | Behavior | Evidence                                             |
| -------- | -------- | ---------------------------------------------------- |
| Observed | …        | path / command / log (status)                        |
| Expected | …        | requirement, wiki concept, or stated intent (status) |

## Hypothesis ledger

| ID  | Hypothesis               | Evidence FOR | Evidence AGAINST | Status                        |
| --- | ------------------------ | ------------ | ---------------- | ----------------------------- |
| H1  | <mechanism, not a place> | …            | …                | open / confirmed / eliminated |

One mechanism per hypothesis. "The bug is in X" is a place, not a
hypothesis — say what X does wrong. Eliminated hypotheses stay listed:
they are the record of where the bug is not.

## Root cause

Only if a hypothesis reached `confirmed` (cite the deciding evidence and
its status). Otherwise this section states: "not yet established — H<n>
and H<m> remain open; <specific evidence> would decide between them."

## Fix direction

Options, not a commitment — and never a fix riding an unconfirmed cause
unless explicitly labeled a bet (with the question it leaves open):

| Option | Addresses | Door (two-way / one-way) | Risks |
| ------ | --------- | ------------------------ | ----- |

## Verification plan

- **Regression test first:** the failing case as a test before the fix.
- **How we know fixed:** observable check tied to the repro.
- **How we know nothing else broke:** suites/areas the fix touches
  (cite wiki concepts for blast radius).
  Keep planned repair checks separate from actual investigation outcomes.

## Open questions

Classify each question as source, experiment, human spec, or design.

| ID  | Question | Kind | Blocks | Owner | Resolution path |
| --- | -------- | ---- | ------ | ----- | --------------- |

## Evidence index

| Claim | Source | Status |
| ----- | ------ | ------ |

## Assumptions

| ID  | Assumption | Blast radius | Validation trigger |
| --- | ---------- | ------------ | ------------------ |

## Handoff

- **Pack:** canonical path, held revision, format and spec-question state; or why no initiative is needed.
- **Artifacts and requirements:** references and registered candidate IDs.
- **Ready for planning:** bounded slices supported by evidence.
- **Blocked on:** unresolved IDs, slices, owners and resolution paths.
- **Next step:** one next skill or action with its inputs.
- **Checks and limits:** actual command exits, expected alignment gaps and unrun checks.

Read `resources/operations.md` from the skill before machine registration.
Analysis grants no implementation permission or owner approval.
