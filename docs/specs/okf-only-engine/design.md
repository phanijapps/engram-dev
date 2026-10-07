---
kind: design
slug: okf-only-engine
title: Amputation + port design — engine becomes okf only
status: draft
created: 2026-10-07
repo_head: 0956360
analysis_inputs: [feature.md, impact-okf-only.md]
---

# Technical design — okf-only transition (removal wave)

## Approach

Subtractive first, ports second, prose last — three moves in strict
order: (1) amputate memex+core from the workspace and CI, (2) port the
two small trust mechanisms the wiki contract needs into okf (freshness
stamp, findings ledger), (3) rewrite wiki/docs/skills prose to the new
reality. The semantic tree-sitter vision (rules/logic/patterns/policies)
is explicitly **not** in this wave — it is the sequel initiative.

**Options considered:**

| Option | Verdict |
|--------|---------|
| A (selected): amputate → port stamp+ledger → retarget skills → rewrite prose | clean seams; every step verifiable; workspace green throughout |
| B: big-bang single PR | unreviewable; breaks uv sync for the duration | rejected |
| C: keep core as a shim during transition | preserves complexity the owner explicitly cut; "perfect okf engine" wants no strangler remnants | rejected |

## Change by surface

| Surface | What changes | Contracts touched | Evidence |
|---------|--------------|-------------------|----------|
| root `pyproject.toml` | `members := ["engine/okf"]` | uv workspace | implementation-supported |
| `engine/memex/**`, `engine/core/**` | deleted (git history retains) | none outside repo | implementation-supported |
| `engine/okf/okf_kit/core/` | + `findings.py` (ported from memex_core, same TOML contract at `<bundle>/.okf/findings.toml`) + stamp write in `code index` (`.okf/last-index.json`: repo_head, counts) | stamp/ledger file formats unchanged | implementation-supported (both are small, self-contained today) |
| `engine/okf` CLI | + `findings propose/list/resolve` verbs; status command = Q5-reframed, gated slice (not this wave) | CLI additive | implementation-supported |
| `skills/sdlc/*`, `.pi/skills/*`, `skills/sdlc/build-kb` | grounding retargeted: `memex-core resolve/compile/search` → `okf read --depth`/`okf search` + stamp check; `record` steps dropped (E7 back-burner); `findings` → `okf findings` | skill prose contracts | implementation-supported |
| wiki curated pages | memex.md, memex-core.md → superseded headers; one-engine.md → replaced by okf-only architecture decision page (draft, proposed through the ported ledger — dogfood); wiki-contract.md rewritten (stamp+ledger now okf-owned) | descriptive prose | implementation-supported |
| `wiki/.okf/findings.toml` | pending `golden-path-416c0995` **declined** (D1 execution) — declined findings are never re-proposed | ledger data | implementation-supported |
| `AGENTS.md`, `docs/product/*` | map/build rewrite; supersede banners on one-engine docs | prose | implementation-supported |

## Contracts & data

File formats are the stability promise: `.okf/last-index.json` and
`.okf/findings.toml` keep their schemas; only the writer moves
(core → okf). CLI additions are additive. Deleted planes take no
consumers with them except those revised above. Compatibility posture:
**revise** (E1–E6, E9–E11), **retain** (E8 okf MCP/web), **defer**
(E7 memory — consequence accepted by owner: no cross-session records).

## Failure behavior

Deletion is recoverable via git (planes are in history). Port risks:
ledger dedupe/declined-guard regressions — mitigated by porting the
existing unit tests verbatim (they pin behavior); stamp writer racing
nothing (single-writer CLI). Rollback = revert commit; workspace
amputation is the only step that breaks `uv sync` mid-flight, so it
lands as one atomic commit.

## Decisions

| ID | Decision | Alternatives | Door | Resolves | Status |
|----|----------|--------------|------|----------|--------|
| D1 | okf-only engine; future memex = consumer layer; pending strangler finding declined | keep core as shim | **one-way** (direction) | feature.md D1 | **owner-signed in substance (round 1)** — formal execution = T5 |
| D4 | Port stamp + ledger into okf, file formats unchanged | drop both (loses trust contract + normative flow) | two-way | E2, E3 | made — ledger port flagged A2 (owner may shrink) |
| D5 | Hooks/session/token capture are a declared engine **non-goal** | — | two-way (can be revisited) | owner round 1 | made |
| D6 | Semantic extraction (Q3: rules/logic/patterns/policies) = sequel initiative with its own analyze/design cycle; NOT in this wave | design it here | two-way | Q3 | made |
| D7 | T6 (from review-1) superseded by T5 — its target page gets rewritten wholesale | do T6 first | two-way | review-1 F1 | made |

## Carried uncertainty

| ID | Carried | Blocks | Path |
|----|---------|--------|------|
| Q5-R (reframed) | okf `status` command shape | a future slice, not this wave | owner answer |
| A2 | ledger port is wanted | T3 only — shrinks if owner declines | owner can veto anytime |

## Out of scope

Semantic tree-sitter extraction (D6 — sequel initiative). Okf `status`
command (Q5-R). U1 0.2 landing (next wave — unchanged by this one).
MCP/web changes (E8 retain). Anything re-adding memory/hooks (D5).

## Evidence index

| Claim | Source | Status |
|-------|--------|--------|
| okf standalone | pyproject + rg (this session) | implementation-supported |
| Strangler finding pending, not accepted | findings.toml | implementation-supported |
| Ledger ~150 LOC + TOML, tests pin dedupe/declined-guard | findings.py + tests | implementation-supported |
