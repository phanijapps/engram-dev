---
kind: plan
slug: okf-wiki-audit
title: Wave 1 — wiki trust restoration (audit closes #1 #2 #3 #8)
status: draft
created: 2026-10-07
repo_head: 5d0f9e2
design_ref: design.md
analysis_inputs: [gap-1.md]
depth: compact-design
rationale_for_depth: two private seams + content, zero shared contracts (impact-class changes are U1's, planned separately)
---

# Plan — wave 1: wiki trust restoration

## Task DAG

| ID | Task (goal, one line) | Implements | Prereqs | Verification expectation | Size | Status |
|----|------------------------|------------|---------|--------------------------|------|--------|
| T1 | Sanitize paren fragments in `_clean_imports`; unit tests for plain/parenthesized/aliased/multi-line/module-specifier from-imports | G2, D1 | — | `cd engine/okf && uv run pytest -q` green incl. new tests | S | todo |
| T2 | Reindex: `memex-core wiki update`; confirm malformed labels gone | G2, A1 | T1 | `grep -rlF ".( " wiki/code` and `grep -rlF ".)" wiki/code` both empty; `wiki/code/engine/memex/memex/application/memory.py.md` lists `compiler.assemble_task_recall` etc. | S | todo |
| T3 | Curated corrections across 6 pages: web-server ghost, graphify ref, verb list, validate.py range, stamp→pointer (D4), stale pins→pointers, counting-rules + coverage/exclusions sections, evidence-status tags on edited sections, link label fix | G5, G10, G3(orphan half), D4 | T2 | re-verify each corrected claim against source at HEAD; `grep -i "web server" wiki/systems/memex.md` empty; `decisions/one-engine-strangler.md` reachable from root index | M | todo |
| T4 | Wire `regenerate_indexes` into `wiki_update` after `index_codebase` | G3, D3 | T2 | after `wiki update`: `wiki/index.md` enumerates concepts by type incl. curated; `okf_version: '0.2'` preserved; package dirs have index.md; `memex-core status` no new errors | S | todo |
| T5 | Mark U1–U6 rows done/partial/paper in Kit_Wiki_Engine_Plan.md | G12 | — | each of the 6 rows carries exactly one marker consistent with L3#18 evidence | S | todo |

Walk: T1→T2→{T3,T4}; T5 independent. No cycles, no self-prereqs; prereqs
are output-needs (T2 needs T1's fixed labels; T3/T4 need T2's clean
bundle to keep the clean-wiki invariant monotonic).

## Frozen context (per task)

- **T1:** engine/okf/okf_kit/code/treesitter/languages/base.py:104,120-133
  (`_clean_imports`); indexer.py:510-587 (`_resolve_imports`,
  `_normalize_import_labels` — do NOT touch; defect is upstream);
  existing import tests: `rg -n "import" engine/okf/tests -l`.
- **T2:** `uv run memex-core wiki update` from repo root; diff scope:
  wiki/code/**, wiki/code-summaries/** (managed only — no curated edits).
- **T3:** pages + exact lines: systems/memex.md:24,31-33; domain/
  wiki-contract.md:63-65 (+ add counting rules: 83 managed / 94
  concept_count / 95 files — resolve.py:78-81 rule); systems/
  one-engine.md:28,43-45 (pyproject dep edge is L10-13); systems/
  okf-kit.md:64,66; code-summaries/repository.md (scope statement:
  non-test Python only; docs/product + skills + fixtures uncovered).
- **T4:** engine/core/src/memex_core/knowledge.py (wiki_update body,
  ~L79-95); engine/okf/okf_kit/core/index.py:20-48 (regenerate_indexes).
- **T5:** docs/product/Kit_Wiki_Engine_Plan.md; evidence: gap-1.md G12
  row [L3#18].

## Traceability matrix

| Gap (analysis) | Design section | Task(s) | Verification |
|----------------|----------------|---------|--------------|
| G2 renderer defect | Approach/A · D1 | T1, T2 | T1 pytest; T2 greps empty |
| G5 falsified claims | Change-by-surface row 4 · D4 | T3 | per-claim re-verify + grep |
| G10 counting/coverage undocumented | same | T3 | sections present in wiki-contract.md, repository.md |
| G3 disclosure dead + orphan decision page | Change-by-surface row 3 · D3 | T3 (orphan check), T4 | root index enumerates; reachable |
| G12 U-scorecard drift | — | T5 | 6 rows marked |

## Ready set

**[T6]** — routed by review-1; T1–T5 done (review-1: slice PASS).
Wave-2 work (U1) enters via its own impact cycle per the strategy.

## Status ledger

| Task | Status | Evidence |
|------|--------|----------|
| T1 | done | `cd engine/okf && uv run pytest -q` → `159 passed in 0.97s` incl. 6 new `_clean_imports` pins; commit `3b47f7c`. Note: wiki was stale (stamp 5d0f9e2) at start — stale-pinned per freshness gate; task truth is source files, reindex belongs to T2 |
| T2 | done | `memex-core wiki update` → 83 updated; `grep -rlF ".( " wiki/code` = 0, `grep -rlF ".)" wiki/code` = 0 (were 13/13); `memory.py.md:55` lists `compiler.assemble_task_recall`; commit `c883fd2` |
| T3 | done | 10-point re-check green: web-server gone (grep 0), clear-transcripts in (cli.py:116), 39bad0f pins → pointers (D4; 2 remaining hits are correction-provenance notes), graphify removed + L10-13 correct, validate.py 25-29 ×2, counting-rules section present, label fixed, reachability via decisions/index.md:3; commit `1604e35`. Micro-adaptation recorded: scope statement lives in curated wiki-contract.md — repository.md is managed |
| T4 | done | `wiki update` → `indexes: 28`, root `okf_version: '0.2'` preserved, D5 held (0 `indexes` in stamp), engine/core pytest `15 passed`, status 0 errors/0 warnings/fresh; commit `036bed2`. Expectation-wording note for review: plan said "root enumerates concepts by type" — §8 shape is per-directory (root→subdir→concept); reachability core holds |
| T5 | done | 6/6 U-rows carry exactly one marker (`rg -c` = 6), consistent with L3#18; commit `01aa49b` |
| T6 | superseded by T5's page rewrites (review-1 F1) | — | — | — | S | superseded |
| T7 | done | OKF 0.2 lifecycle frontmatter on every concept (owner request): status + created + generated{by,at}. Evidence: `engine/okf pytest` → 161 passed (+2 pins); reindex ×2 → created identical, generated.at advances; validate 0 errors; commit `71e192c` |

## Handoff

- **Ready now:** T1 → `implement` (frozen context above); T5 → `implement`
- **Blocked:** nothing in this plan; wave-2 items live in gap-1.md
  (close #4 U1 needs impact mode; close #6 needs owner decision Q2)
- **Next step:** `implement` T1+T5 in one sitting (both small, disjoint),
  then T2→T3/T4.

## Strategy — wave sequencing beyond this plan

| Wave | Content | Why this order |
|------|---------|----------------|
| 1 (this plan) | G2 G5 G10 G3 G12 — small, disjoint, zero shared-contract risk | Restores the wiki's value as agent grounding now; every later wave consumes a trustworthy wiki |
| 2 | U1 landing (G1 G6, G9 half) — impact mode → own design/plan | Biggest trust lever, but touches validator × renderer × templates × fixture × status — needs its own gated cycle; consumes wave-1's fixed extraction + indexes |
| 3 | Ledger + stamp hardening (G7, G4 machinery) | Medium engine/core work, no upstream dependency; the authority mechanism should be solid before more normative content flows through it |
| ongoing | Upstream spec positions (G8) + PROFILE decision (G9 rest) | External cadence; QUESTIONs recorded in gap-1.md ride along |

Ordering rule: dependency × trust-payoff ÷ cost. Wave 1 is everything
with no gate in front of it; wave 2 is gated on its own impact analysis;
wave 3 gates on nothing but benefits from 1+2 landing first.
