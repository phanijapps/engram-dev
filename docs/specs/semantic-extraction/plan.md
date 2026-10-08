---
kind: plan
slug: semantic-extraction
title: Wave S — semantic extraction build
status: draft
created: 2026-10-07
repo_head: ca7de98
design_ref: design.md
depth: compact-design
rationale_for_depth: additive okf code + one resource doc; no existing contracts change
---

# Plan — wave S: semantic extraction

## Task DAG

| ID | Task (goal, one line) | Implements | Prereqs | Verification expectation | Size | Status |
|----|------------------------|------------|---------|--------------------------|------|--------|
| S1 | done |
| S1 | `okf_kit/code/semantic.py`: python candidate queries (validation-raise guards, asserts, permission/require calls, state enums, schema validators, decorators) returning located candidates | design §Change row 1, SD4 | — | unit tests pin candidates on a synthetic module (each pattern → expected location+kind); `uv run pytest` green | M | todo |
| S2 | done |
| S2 | `okf code rules <workspace> <bundle>` verb: write `.okf/candidates.json` manifest (path, lines, snippet, kind, symbol, source_hash) | row 2, SD1 | S1 | `okf code rules . wiki` on THIS repo writes a manifest; every entry has path+lines+hash; jq-parseable | S | todo |
| S3 | done |
| S3 | Type templates: BusinessRule / EncapsulatedLogic / Pattern / Policy (0.2 frontmatter, sources, anchor footnotes) in kit templates | row 3 | — | `okf new wiki BusinessRule "t"` scaffolds a conforming page; validate 0 errors | S | todo |
| S4 | done |
| S4 | Gardening procedure: `build-kb/resources/semantic-extraction.md` — candidates → pages → normative-through-ledger flow, with a worked example from S2's real manifest | row 4, SD3 | S2, S3 | procedure references only existing commands; worked example cites real manifest entries | S | todo |
| S5 | done |
| S5 | Dogfood: run the full loop on this repo — manifest → first 3-5 real rule/pattern/policy pages in `wiki/domain/` (normative ones via findings) | SD1 end-to-end | S4 | pages exist, validate clean, anchors resolve to real path:line, searchable via `okf search` | M | todo |

Walk: S1 → S2 → {S3, S4} → S5. No cycles.

## Frozen context (per task)

- **S1:** `engine/okf/okf_kit/code/treesitter/languages/__init__.py` (adapter
  pattern), `runtime.py` (node walking), design.md §Change row 1.
- **S2:** `engine/okf/okf_kit/cli.py` (code subcommand pattern), `stamp.py`
  (state-dir write pattern), design §Change row 2.
- **S3:** `engine/okf/okf_kit/core/templates.py` (type templates),
  SPEC §5.1 (sources family).
- **S4:** `skills/sdlc/build-kb/SKILL.md` §5 (findings flow),
  `design.md` SD3.
- **S5:** this repo: `engine/okf/okf_kit/` (rules live there: e.g. managed-
  section discipline, declined-finding guard), `skills/` (patterns).

## Traceability matrix

| Design element | Task(s) | Verification |
|----------------|---------|--------------|
| Deterministic candidates | S1, S2 | unit pins + real manifest |
| Concept types | S3 | scaffold + validate |
| Gardening flow (SD3) | S4 | procedure consistency |
| End-to-end honesty | S5 | real pages, real anchors, searchable |

## Ready set

**[S1, S3]** — independent.

## Status ledger

| Task | Status | Evidence |
|------|--------|----------|
| — | — | (implement fills) |

## Handoff

- **Ready now:** S1 + S3 (disjoint) → `implement`
- **Blocked:** S2 on S1; S4 on S2+S3; S5 last
- **Next step:** `implement` S1


## Wave U2 — executed 2026-10-07

Fingerprints landed: okf_kit/core/fingerprints.py (+okf fingerprints update, +okf anchors, +anchors line in okf status). Verdicts: current/changed/untracked/missing-file/wiki-internal. First real run caught the scanner's own edit staleness — refresh cycle resolved it. +6 tests (185 total). Cross-repo: okf code rules verified on a scratch repo.

## Strategy after wave S

U2 fingerprints (per-anchor staleness → NEEDS_REVIEW) consumes S2's
manifest hashes; more language adapters follow demand; future-memex
(back-burner) consumes the rule corpus via search.
