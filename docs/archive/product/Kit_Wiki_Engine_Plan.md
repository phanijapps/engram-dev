---
title: Kit Wiki Engine Plan — okf-kit 0.1beta → OKF 0.2 and the project wiki
document_type: plan
status: proposed
version: 0.1.0
date: 2026-10-05
depends_on: [Engine_Conformance_Strategy.md, Repo_Knowledge_Skill.md, OKF_SPEC_v0.2.md]
---

# Kit Wiki Engine Plan

`kit/` (absorbed from `phanijapps/okf-kit@main`, 1d7bbc1, Apache-2.0) is the
**knowledge-plane codebase**. The project wiki is an **OKF bundle** at
`<repo>/wiki/` built from concepts per the OKF v0.2 spec
(`docs/product/OKF_SPEC_v0.2.md`, vendored). `engine/` remains the
**memory-plane codebase**. This plan upgrades kit from OKF 0.1beta to v0.2
and improves it into the wiki engine the merger brief calls Plane 1b.

## 0. What kit already gives us (verified)

- `core/`: permissive frontmatter parse, Concept model, link graph +
  adjacency, `index.md` regen, FTS search, bundle templates, conformance
  validator, and `context.py` — a deterministic progressive-context loader
  (BFS neighborhood, token budget, omission marker, cycle-safe).
- `code/`: language discovery + **tree-sitter** extraction, managed
  generated/human section splitting, concept rendering. Source → concepts
  pipeline is real and deterministic.
- `web/`: server + graph view (cytoscape), `mcp.py`, agent skills
  (okf-author/okf-code/okf-search) + installer.
- Its own `wiki/` — the dogfooded bundle, and our first 0.2 migration
  fixture.
- 224 tests green in this repo (`cd kit && uv run --extra dev pytest`).

## A. Upgrade 0.1beta → v0.2 (mechanical, per SPEC §13)

| # | Change | Kit surface |
|---|---|---|
| U1.1 | `timestamp` → `generated: { by, at }` | write `generated` on authoring/render; reader falls back to legacy `timestamp` |
| U1.2 | body `# Citations` → frontmatter `sources` | validator warns on legacy lists; reader may parse them for old docs |
| U1.3 | `sources` family: `id/resource/title/author/usage_count/last_modified` + `usage_window`; per-claim footnotes keyed to `sources[].id` | model, validate, author templates, per-claim attribution in render |
| U1.4 | `verified` list (bare-mapping normalizes to one-element list) + trust tiers: unverified / machine-confirmed / human-reviewed | validate, surface in index regen, search, web |
| U1.5 | `status: draft\|stable\|deprecated` (absent ⇒ stable) and `stale_after` absolute instant | model + staleness checks in validate; chips in web |
| U1.6 | Actor convention `<producer>/<version>`, `human:<id>`, `process:<id>`; trust keys off the `human:` prefix | validate actor syntax wherever `by` appears |
| U1.7 | Root `index.md` `okf_version: "0.2"` | templates + validate |
| U1.8 | Keep v0.2 permissiveness: never reject unknown keys; broken links tolerated | regression tests for both |

Gate: kit's own `wiki/` migrated to 0.2 inside the upgrade change; v0.1
fixture bundles still validate under fallback rules. (Attested Computation
concepts are deferred — they become interesting later as VSG verification
receipts.)

## B. Wiki engine improvements (the "improve upon it" part)

1. **Repo-first sources + freshness.** `okf code index` writes `sources`
   entries pinning repo path + content hash (+ commit when clean). A
   fingerprints manifest (`.okf/fingerprints.json`, managed) maps source
   units → hashes. Re-runs diff fingerprints: unchanged units are skipped;
   changed units re-extract; affected concepts get marked
   `stale_after=now` / NEEDS_REVIEW rather than silently rewritten.
   Realizes Merger Brief §2.1 freshness and brk reconciliation.
2. **Findings ledger.** `.okf/findings.toml` in-bundle: normative and
   restructuring proposals with `(source, destination, kind)` dedupe,
   dispositions accepted/declined/pending, never re-propose declined.
   The gardener and every agent write normative content through findings;
   deterministic regeneration (descriptive tier) never needs them.
3. **Bindingness ladder for normative concepts.** Types `Golden Path`,
   `Constraint`, `Standard` carry `bindingness: explicit |
   framework-owned | convergent | tentative` (an OKF-legal extension key).
   Validator rule: a normative concept may be `status: stable` only with
   explicit/framework-owned evidence or an accepted finding; convergent
   stays `draft` labeled inference; tentative never binds. This is the
   adapt-to-project inheritance and the VSG authority mapping.
4. **Typed relations as an extension key.** OKF links stay untyped for
   portability (spec §6.1); an optional `relations: [{ to, kind }]`
   frontmatter key adds typed edges (`is_a`, `represents`, `maps_to`,
   `derived_from`, `checks`, `constrains`) that the index, graph view, and
   compiler consume when present. Plain links keep working forever.
5. **Context compiler upgrade** (`core/context.py` → Plane 2): from BFS
   link neighborhoods to mandatory-selection closure — task → required
   concepts via relations + provenance; explicit manifest
   (included/omitted + why); real tokenizer port (engine's counter as
   first port); `CONTEXT_INSUFFICIENT` instead of silent truncation;
   stable canonical ordering. Deterministic core preserved.
6. **Engine federation.** Project registry (engine) maps repo → bundle
   path. Recall searches store notes + bundle concepts together.
   Consolidation proposes into bundles via findings. Episodes/capture stay
   in `~/.memex`. MCP surfaces coexist; later a merged verb set.
7. **LLM gardener port.** kit is deterministic-only today — keep that
   core. Add an explicit LLM port (mirroring engine's `llm_clients`/ports)
   for article authoring (okf-author), stale-refresh proposals, and
   summaries — always through findings, never directly `stable`.
8. **UI.** cytoscape view gains: trust-tier badges, staleness chips with
   "what changed" (fingerprint diff), evidence drill-down (sources +
   footnotes), findings inbox with per-finding accept/edit/decline,
   bindingness styling for normative concepts.

## C. Sequencing and gates

| Step | Deliverable | Gate | Status (2026-10-07 audit, gap-1.md G12 / L3#18) |
|---|---|---|---|
| U1 | 0.2 upgrade (A-table) | kit wiki migrated; 0.1 fixtures still validate; tests extended | **paper in kit** — core writes 0.2 declarations (`memex_core/knowledge.py:20`) while kit validates/authors 0.1 (`validate.py:32`, `templates.py:29`) |
| U2 | Sources + fingerprints | re-index of unchanged repo = zero concept diff; changed file marks only dependents stale | **paper** — no fingerprint code anywhere in `engine/`; `.okf/` holds only stamp + findings |
| U3 | Findings + bindingness | declined finding never re-proposed (idempotence test); normative-stable rule enforced | **partial** — ledger real but lives in `engine/core`, not kit as §D assigns; `bindingness` absent repo-wide |
| U4 | Context compiler | manifest exact; insufficiency explicit; deterministic bytes on frozen inputs | **partial** — `compile_context` real (manifest, CONTEXT_INSUFFICIENT) but keyword federated search, not relations+provenance mandatory closure |
| U5 | UI + MCP polish | findings inbox usable; staleness visible | **paper** — no findings inbox in `engine/okf/web`; staleness not surfaced |
| U6 | Engine federation | `memex recall` spans store + bundle; consolidation lands as finding | **partial** — core `search` federates memory+wiki; consolidation→findings path missing |

U1–U4 correspond to conformance WS1–WS3 (first release gate of the merger
brief); the engine-side work narrows to federation (U6) and its own
memory-plane improvements.

## D. Division of labor (two codebases, one product)

| Concern | Codebase |
|---|---|
| OKF bundle machinery, code→concept extraction, wiki render, bundle web/MCP | `kit/` |
| Memory store, episodes/capture, consolidation, harness install, BM25 eval discipline | `engine/` |
| Context compilation | `kit/` (compiler core) + `engine/` (task identity, store federation) |
| Authority/approval UX | findings ledger in-bundle (`kit/`) + engine approval flow |
| APM packaging | packs built here install kit skills + engine adapters |
