---
kind: feature
slug: okf-only-engine
title: Strip the engine to okf only — repository knowledge via tree-sitter understanding
status: draft
created: 2026-10-07
repo_head: 0956360
wiki_freshness: fresh
related: [impact-okf-only.md]
---

# Feature analysis — okf-only engine

## Problem & evidence

Operator direction: keep **only `engine/okf`** as the engine; drop
`engine/memex` (memory plane) and `engine/core` (control plane). The
product becomes *knowledge built from repositories*, with tree-sitter
aimed at **understanding the codebase** — deliberately different from
today's structural extraction. (declared — operator statement, this
conversation)

Evidence bearing on the direction:

- **okf is already standalone**: dependencies are `pyyaml`+`pydantic`
  only; **zero** imports of memex/memex_core anywhere in `okf_kit`
  (implementation-supported: `engine/okf/pyproject.toml`, repo-wide rg).
  The split is technically clean from okf's side.
- **The one-engine direction was never accepted**: `decisions/
  one-engine-strangler.md` is `status: draft` with finding
  `golden-path-416c0995` still pending human acceptance
  (implementation-supported: findings.toml). This change *conflicts
  with* a pending proposal, not an accepted decision — the conflict
  resolves by declining the finding, not by reversing settled truth.
- **Cost side**: the SDD skill suite (analyze/plan/implement/review +
  build-kb) grounds through `memex-core` resolve/compile/record/findings
  (implementation-supported: rg hits in every SKILL.md); the wiki
  freshness stamp and findings ledger are implemented in engine/core
  (implementation-supported: knowledge.py, findings.py). Removing core
  orphans the pipeline's grounding layer and the wiki-contract
  machinery.

## Current behavior

Three planes: `engine/memex` (memory: store, recall, hooks, transcripts),
`engine/okf` (knowledge: bundle machinery + tree-sitter code indexer),
`engine/core` (memex-core: 8-op control CLI fronting both). Wiki contract
implemented across core (stamps, ledger, wiki_init/update, resolve,
record, compile) and kit (bundle, indexer, managed sections).

## Proposed behavior

One plane: `engine/okf`. Repository in → knowledge out; tree-sitter
shifts from structural cache-filling to codebase *understanding*
(specifics = Q3, open). No memory store, no control-plane CLI, no
cross-plane federation.

## Affected surfaces

| Surface | Why affected | Evidence | Status |
|---------|--------------|----------|--------|
| engine/memex, engine/core | removed entirely | operator direction | declared |
| engine/okf | becomes sole engine; CLI front; absorbs or drops stamp/ledger | okf CLI: init/new/validate/search/read/index/code | implementation-supported |
| skills/sdlc/* + .pi copies | grounding steps call memex-core | rg: every SKILL.md | implementation-supported |
| skills/sdlc/build-kb | drives memex-core end-to-end | its SKILL.md | implementation-supported |
| wiki curated pages | systems/{memex,memex-core,one-engine}, decisions/one-engine-strangler, domain/wiki-contract describe the three-plane world | wiki tree | implementation-supported |
| findings ledger + pending golden-path-416c0995 | ledger implemented in core; finding conflicts with this direction | findings.toml | implementation-supported |
| docs/product (Merger_Brief, Memex_Core_Layer, Lean_Control_Plane_Review, Kit_Wiki_Engine_Plan) | document the one-engine path | rg | implementation-supported |
| root uv workspace | members: memex, okf, core | pyproject.toml | implementation-supported |
| ~/.memex project memory | record/write ops live in core/memex | knowledge of session records | implementation-supported |
| audit wave strategy (gap-1 waves 2–3) | wave 3 hardens engine/core; dies with it | gap-1.md close plan | implementation-supported |

## Impact candidates

Shared contracts, storage, and public APIs are touched at every layer →
full impact analysis run as a separate artifact: **[impact-okf-only.md](impact-okf-only.md)**
(11 candidate effects with dispositions).

## Open questions

| ID | Question | Blocks | Owner | Resolution path |
|----|----------|--------|-------|-----------------|
| Q1 | What becomes the agent/skill grounding surface after core dies — okf CLI grows the needed verbs, or skills retarget to plain okf + files? | all 5 sdlc skills, build-kb | owner | owner decision → plan |
| Q2 | Do the findings ledger and freshness stamp survive (port into okf) or die with core? | wiki trust contract, normative flow, T6-style discipline | owner | owner decision → plan |
| Q3 | "Tree-sitter mainly for understanding, different from the current way" — what concretely? (deeper semantic concepts vs per-module extraction? codebase Q&A? architecture-level pages?) | the core product change itself | owner | owner answer → feature revision |
| Q4 | Does ~/.memex project memory disappear entirely (cross-session records gone)? | skills' record steps, audit trail | owner | owner decision |
| Q5 | Project identity/freshness reporting (resolve) — keep, and where? | every skill's anchor step | owner | owner decision |

## Assumptions

| ID | Assumption | Blast radius | Validation trigger |
|----|-----------|--------------|--------------------|
| A1 | Direction is firm: okf-only, both other planes go | everything above | operator confirmation at Q-round |

## Decisions needed

| Decision | Needed by (what it unblocks) | Two-way / one-way | Evidence status |
|----------|------------------------------|-------------------|-----------------|
| D1: formally supersede the one-engine direction (decline pending finding golden-path-416c0995, replace draft decision page) | before any plane removal | one-way (product direction) | declared |
| D2: grounding surface post-core (Q1) | sdlc skills' next use | two-way (retargetable) | open |
| D3: stamp/ledger fate (Q2) | wiki trust contract | one-way if dropped (trust contract lost) | open |

## Handoff

- **Route:** impact analysis done (linked); plan blocked on Q1–Q5.
- **Ready now:** nothing implementation-shaped — this change is gated on
  the owner's answers and D1.
- **Blocked on:** Q1–Q5 (owner), D1–D3.
- **Next step:** owner answers the question round → revise feature per
  Q3 → plan the removal/retarget in slices.
