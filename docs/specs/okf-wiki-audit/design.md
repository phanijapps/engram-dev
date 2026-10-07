---
kind: design
slug: okf-wiki-audit
title: Trust-restoration wave for the generated wiki (audit closes #1 #2 #3 #8)
status: draft
created: 2026-10-07
repo_head: 5d0f9e2 (analysis pinned 660ac42; wiki re-stamped during grounding)
wiki_freshness: fresh (re-anchored during grounding)
analysis_inputs: [gap-1.md, reviews/l1-conformance.md, reviews/l2-semantic-evidence.md, reviews/l3-spec-systemic.md]
related: []
---

# Technical design — wiki trust restoration (wave 1)

## Approach

Fix the four ready-now closes from gap-1.md as one wave: the renderer's
import-extraction defect (G2), the falsified curated claims (G5/G10),
dead progressive disclosure (G3), and the U-scorecard honesty edit (G12).
All are independent of U1 and of each other's contracts — this wave
restores the wiki's value as agent grounding while the U1/ledger work is
designed separately.

**Options considered:**

| Option | Meets constraints? | Cost / risk | Verdict |
|--------|--------------------|-------------|---------|
| A (selected): fix import sanitization in `_clean_imports`, reindex, correct curated pages, wire `regenerate_indexes` | Yes — kills G2 at its actual source; content + wiring are additive | Small; reindex is deterministic and diffable | chosen — D1, D3 |
| B: structured per-adapter import extraction (reviewer L2#1's suggestion — parse `import_from_statement` via tree fields) | Overkill | Medium; new adapter hook surface for a problem one layer up | rejected — grounding shows `_clean_imports` already decomposes from-imports; only paren fragments are unsanitized (impl: base.py:120-133) |
| C: fix renderer only, defer curated corrections | Leaves falsified claims in the pages agents read first | Trust payoff halved | rejected — G5 is the product thesis breaking on its flagship |

## Change by surface

| Surface | What changes | Contracts touched | Evidence |
|---------|--------------|-------------------|----------|
| `engine/okf/okf_kit/code/treesitter/languages/base.py` (`_clean_imports`, ~120-133) | Sanitize paren fragments in from-import name lists; drop empty/paren-only names; unit tests pinning: plain, parenthesized, aliased, multi-line, module-specifier cases | none (private helper; output becomes a *subset* of today's labels minus garbage) | implementation-supported |
| `wiki/code/**` + `wiki/code-summaries/**` (regenerated) | Malformed `memex.domain.models.)`-style labels disappear from 13+ pages incl. repository.md frontmatter | bundle content only | impl-supported |
| `engine/core/src/memex_core/knowledge.py` (`wiki_update`, after `index_codebase`) | Call `okf_kit.core.index.regenerate_indexes(bundle)`; root `index.md` remains generated (preserves `okf_version` from existing root — index.py:44-48); stamp contract unchanged (indexes are reserved files, excluded from concept counts) | additive; `resolve` already excludes `index.md` (resolve.py:78-81); validator tolerates nested indexes at info level | impl-supported |
| `wiki/systems/memex.md`, `wiki/domain/wiki-contract.md`, `wiki/systems/one-engine.md`, `wiki/systems/okf-kit.md`, `wiki/code-summaries/repository.md` | Correct falsified claims; volatile values → pointers; add counting-rules + coverage/exclusions; evidence-status tags on edited sections | none — descriptive curation (no findings-ledger route needed per build-kb: findings govern normative content only) | impl-supported |

## Contracts & data

No external contract changes. Import labels become strictly cleaner
(no consumer can depend on malformed names). New `index.md` files appear
in every directory containing concepts — reserved files per §8; root
retains `okf_version: '0.2'`. Compatibility posture: **retain**
(validator/search/resolve behavior unchanged or strictly improved).

## Failure behavior

Worst case is a bad reindex — recoverable by construction: managed pages
regenerate from source, and git holds the prior bundle. `regenerate_
indexes` overwrites root `index.md` wholesale: any hand-authored root
content would be lost — accepted (root is currently an empty stub; §8
index is the generated contract; curated discovery happens through the
index's concept enumeration, which fixes the orphan decision page as a
side effect).

## Decisions

| ID | Decision | Alternatives | Door | Resolves | Status |
|----|----------|--------------|------|----------|--------|
| D1 | Sanitize paren fragments in `_clean_imports` (name parts stripped of `()`, empties dropped) | B structured adapter hook; C defer | two-way | G2 | made |
| D2 | Grouped curly imports (JS/TS `{a,b}`) stay dropped (`_normalize_import_labels` returns []) — recorded as known gap, fixed with U1's keyset work | Expand groups now | two-way | — (records scope cut) | made |
| D3 | `regenerate_indexes` wired into `wiki_update` (not a new verb); root index is generated, not curated | Separate `wiki index` verb; hand-authored root | two-way | G3 | made |
| D4 | Volatile values (stamp contents, HEAD pins) in curated pages become pointers to `.okf/last-index.json`, never restated copies | Re-state values each rebuild | two-way | G4 (page-pin half) | made |
| D5 | Stamp contract unchanged (no `indexes` count) | Add index counts to stamp | two-way | — (stability over richness; revisit in U1) | made |

## Carried uncertainty

| ID | Carried question / assumption | Blocks | Path |
|----|-------------------------------|--------|------|
| Q1 (from audit) | U1 scope (0.2 keyset landing) | close #4 — separate impact+plan cycle | impact mode |
| Q2 (from audit) | private-key prefixing vs profile-only | close #6 | owner decision |
| A1 | Fixing `_clean_imports` covers all 13+ polluted pages (they all originate in from-import decomposition) | T2 verification | walk `grep -rF` after reindex |

## Out of scope

Everything in the audit's blocked set: U1 landing (G1/G6), findings-ledger
hardening (G7), stamp dirty-tree/profile (G4 machinery half), upstream
spec positions (G8), `.okf/PROFILE.md` (G9). JS/TS grouped-import
expansion (D2). Evidence-status retrofit of *unedited* curated sections.

## Evidence index

| Claim | Source | Status |
|-------|--------|--------|
| Defect lives in `_clean_imports`, not treesitter walk | base.py:104,120-133 read at 5d0f9e2 | implementation-supported |
| `regenerate_indexes` preserves root `okf_version` | engine/okf/okf_kit/core/index.py:20-48 | implementation-supported |
| Curated falsifications at cited lines | gap-1.md G5; re-read this session | implementation-supported |
