---
kind: plan
slug: okf-only-engine
title: Removal wave — amputate, port, retarget, rewrite
status: draft
created: 2026-10-07
repo_head: 0956360
design_ref: design.md
analysis_inputs: [feature.md, impact-okf-only.md]
depth: compact-design
rationale_for_depth: subtractive + two small ports + prose; no shared API contracts change (file formats preserved)
---

# Plan — okf-only removal wave

## Task DAG

| ID | Task (goal, one line) | Implements | Prereqs | Verification expectation | Size | Status |
|----|------------------------|------------|---------|--------------------------|------|--------|
| T1 | Amputate: root members := okf only; `git rm -r engine/memex engine/core`; uv re-lock | E6, E10 | — | `uv sync` green; `cd engine/okf && uv run pytest -q` green; `rg -l "memex_core" engine/` empty | M | todo |
| T2 | Port freshness stamp: `okf code index` writes `.okf/last-index.json` (repo_head, counts) after each run | E2, D4 | T1 | unit test pins stamp contents; manual run on this repo writes stamp at current HEAD | S | todo |
| T3 | Port findings ledger: `okf_kit/core/findings.py` + `okf findings propose/list/resolve` on `<bundle>/.okf/findings.toml`, dedupe/declined-guard tests ported verbatim | E3, D4 (A2) | T1 | ported tests green; CLI round-trip propose→list→resolve on a temp bundle | M | todo |
| T4 | Retarget skills: build-kb + sdlc SKILL.mds (+ .pi copies) — okf verbs replace memex-core; record steps dropped with note; findings → `okf findings` | E1, E7 | T2, T3 | `rg -l "memex-core" skills/ .pi/skills/` returns only removal-wave mentions; every command in each SKILL.md exists per `okf --help` | M | todo |
| T5 | Wiki + docs + D1 execution: decline golden-path-416c0995; new okf-only decision page (draft, proposed via ported ledger); systems pages superseded/replaced; wiki-contract.md rewritten; AGENTS.md rewritten; supersede banners on one-engine docs; supersedes T6 | E4, E5, E11, D1, D7 | T2, T3, T4 | `okf validate wiki` 0 errors; `rg -l "memex_core" AGENTS.md` empty; ledger shows finding declined; new decision page drafted + finding proposed | L | todo |
| T6 | ~~Evidence-status tags on memex.md~~ — **superseded by T5** (target page rewritten wholesale) | review-1 F1 | — | — | S | superseded |

Walk: T1 → {T2, T3} → T4 → T5. No cycles; prereqs are output-needs
(T4's retarget documents T2/T3's new verbs; T5's ledger usage needs T3).

## Frozen context (per task)

- **T1:** root `pyproject.toml` (members list); `rg -l "memex_core|from memex" engine/okf/` = 0 (verified 0956360); engine/okf test count baseline 159.
- **T2:** engine/core `knowledge.py` stamp block (the schema being moved: repo_root, repo_head, indexed_at, written/updated/skipped) — **read before deletion, in T1's same sitting**; `okf code --help`.
- **T3:** `engine/core/src/memex_core/findings.py` (~150 LOC) + its tests — port verbatim, adapt imports only; TOML path `<bundle>/.okf/findings.toml`.
- **T4:** each SKILL.md's grounding/close sections; `okf --help` verb list; E7 note template: "record steps dropped — project memory back-burnered (owner round 1)".
- **T5:** findings.toml (decline flow); wiki systems/decisions/domain pages; AGENTS.md map rows; docs/product file headers; review-1 F1 (T6 supersession).

## Traceability matrix

| Effect (impact) | Design § | Task(s) | Verification |
|-----------------|----------|---------|--------------|
| E6+E10 workspace/tests | Change-by-surface rows 1–2 | T1 | uv sync + pytest + rg gates |
| E2 stamp | rows 3 | T2 | unit pin + manual run |
| E3 ledger | row 3 | T3, T5 | ported tests + round-trip |
| E1 skills | row 5 | T4 | rg + okf --help cross-check |
| E7 memory | row 5 (D5) | T4 (drop notes) | rg no record steps |
| E4/E5/E11 prose | rows 6–8 | T5 | validate + rg gates |
| E9 wave re-sequence | — | this plan + gap-1 note | strategy § below |
| D1 formal | Decisions | T5 | finding declined + page drafted |

## Ready set

**[T1]** — everything else unblocks downstream.

## Status ledger

| Task | Status | Evidence |
|------|--------|----------|
| — | — | (implement fills) |

## Handoff

- **Ready now:** T1 → `implement` (atomic amputation commit)
- **Blocked:** none within this wave; Q5-R gates a future `status` slice; U1 wave queued after
- **Next step:** `implement` T1; then T2+T3 (both small, disjoint files)

## Strategy — wave re-sequencing (supersedes gap-1 strategy §)

| Wave | Content | Note |
|------|---------|------|
| R (this plan) | amputate + port trust machinery + retarget + rewrite | workspace green at every commit boundary |
| U | U1 0.2 landing (audit G1/G6) — now THE version-contract wave | unchanged, okf-only, more central than ever |
| S | **sequel initiative:** semantic tree-sitter — business rules, encapsulated logic, patterns, policies as searchable, location-anchored wiki concepts (Q3) | own analyze/design cycle first |
| back-burner | future memex as consumer layer on okf; hooks/session capture (D5 non-goal); project memory (E7) | owner-set |
