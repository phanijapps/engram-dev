---
kind: impact
slug: okf-only-engine
title: Remove engine/memex + engine/core — okf becomes the sole engine
status: draft
created: 2026-10-07
change_pins: engine/memex/**, engine/core/** (removal); engine/okf/** (sole engine); skills/, wiki/, docs/product/, root workspace
repo_head: 0956360
wiki_freshness: fresh
related: [feature.md]
---

# Impact analysis — okf-only engine

> If the change itself is executed as framed, every effect below needs an
> accepted disposition. Dispositions here are **candidates** — acceptance
> is the owner's, via the question round in feature.md (Q1–Q5, D1–D3).

## The change under analysis

Delete `engine/memex` (memory plane: store, recall, hooks, transcripts,
~/.memex) and `engine/core` (memex-core: resolve/wiki/search/compile/
record/findings/status — the 8-op front face). `engine/okf` remains as
the sole engine: repository → knowledge, tree-sitter for codebase
understanding. Pinned: current tree at `0956360`; okf verified
standalone (pyyaml+pydantic only, zero cross-plane imports).

## Affected surfaces

| Surface | Reach mechanism | Evidence | Status |
|---------|-----------------|----------|--------|
| skills/sdlc/{analyze,plan,implement,review} + .pi copies | grounding steps call `memex-core resolve/wiki update/compile/record/findings` | rg: every SKILL.md + evals | implementation-supported |
| skills/sdlc/build-kb (+ .pi) | entire workflow drives memex-core | its SKILL.md §1–6 | implementation-supported |
| wiki/.okf/{last-index.json,findings.toml} | written by engine/core (knowledge.py, findings.py) | engine/core src | implementation-supported |
| wiki curated: systems/{memex,memex-core,one-engine,okf-kit}.md, decisions/one-engine-strangler.md, domain/wiki-contract.md | describe the three-plane world + contract implemented in memex_core | page contents | implementation-supported |
| pending finding golden-path-416c0995 | destination = the strangler decision page | findings.toml | implementation-supported |
| docs/product/{Merger_Brief,Memex_Core_Layer,Lean_Control_Plane_Review,Kit_Wiki_Engine_Plan}.md | document one-engine path + core layer | rg | implementation-supported |
| root pyproject workspace members | memex, okf, core | pyproject.toml | implementation-supported |
| docs/specs/okf-wiki-audit/* (this repo's first SDD cycle) | wave-2/3 strategy assumes core+kit | gap-1.md, plan.md strategy | implementation-supported |
| ~/.memex store | record/write targets it | session records incl. audit trail | implementation-supported |
| engine tests + eval fixtures | planes' test suites | engine/*/tests | implementation-supported |

## Candidate effects

| # | Effect (surface → consequence) | Confidence | Disposition | Evidence |
|---|--------------------------------|-----------|-------------|----------|
| E1 | SDD skills lose grounding (resolve/compile/record/findings) → pipeline unusable until retargeted | high | **revise** — retarget to okf CLI + files, per Q1/D2 answer | rg hits in all SKILL.mds |
| E2 | Freshness stamp unwritten → `wiki/code/**` trust contract ("fresh/stale") dies | high | **revise** — port stamp writing into okf `code index` (small, kit-side); or **defer** with consequence: wiki treated as unverified | knowledge.py stamp block |
| E3 | Findings ledger dies → normative flow (propose/resolve, never-settled-truth) loses its enforcement home | high | **revise** — port ledger to okf (mechanism is ~150 LOC + TOML); pending `golden-path-416c0995` **declined** as part of D1 | findings.py |
| E4 | One-engine decision page + systems pages (memex, memex-core, one-engine) assert a dead architecture | high | **replace** — new decision page (okf-only, drafted post-D1); old pages superseded/rewritten; wiki-contract.md rewritten for okf-only contract | page contents |
| E5 | docs/product one-engine documents mislead | high | **revise** — mark superseded with pointer, or archive; Merger_Brief §"one engine" needs an owner-level amendment | doc headers |
| E6 | Root workspace members reference deleted paths → uv sync breaks | high | **revise** — root pyproject members := okf only | pyproject.toml |
| E7 | ~/.memex project memory gone → cross-session records (audit trail, pipeline milestones) vanish | high | **defer** with consequence: no server-side memory; skills' record steps dropped or re-homed as bundle notes. Consequence accepted only by owner (Q4) | record calls in skills |
| E8 | okf MCP + web surfaces continue | high | **retain** — already okf-native | engine/okf/okf_kit/{mcp,web} |
| E9 | Audit wave strategy invalidated: wave 3 (ledger+stamp hardening in core) targets a deleted plane; wave 2 (U1 0.2 landing) still valid but becomes *the* enablement wave | high | **revise** — re-sequence: U1 moves first (it is the version-contract fix okf-only needs most), ledger port replaces wave 3 | gap-1.md, review-1.md |
| E10 | Engine test suites for memex/core deleted; okf's 159 tests become the floor | high | **revise** — okf suite + new port tests define CI | test runs this session |
| E11 | AGENTS.md map + build instructions describe three planes + memex-core front face | high | **revise** — repo map rewrite post-D1 | AGENTS.md |

## Verification obligations

- Wave-1's just-verified wiki state is **partially invalidated by E4**:
  systems/decisions pages will need re-verification after rewrite.
- If E2/E3 revisions land: port tests must pin stamp-writing and
  ledger-dedupe behavior (the review-1 evidence base transfers).
- Root workspace (E6): `uv sync` + all three CLIs → one CLI smoke test.

## Blocked work

Everything implementation-shaped waits on D1–D3 + Q1–Q5 (feature.md).
Wave-2 U1 work **unblocks**: it is okf-only and needed under any answer.

## Open questions

See feature.md Q1–Q5 (single register — not duplicated here).

## Handoff

- **Ready now:** wave-2 U1 impact+plan (valid under every outcome);
  D1 decision-page draft can be authored as `status: draft` anytime.
- **Blocked on:** Q1–Q5, D1–D3 (owner).
- **Next step:** owner question round → revise E-dispositions per
  answers → plan the removal in slices (E6+E10 first — cheap, unblocks
  workspace; E1 retarget second; E2/E3 ports third; E4/E5 wiki+docs
  last, after code settles).
