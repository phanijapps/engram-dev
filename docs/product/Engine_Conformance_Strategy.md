---
title: Engine Conformance Strategy — memory engine → knowledge-first context engine
document_type: strategy
status: proposed
version: 0.1.0
date: 2026-10-05
depends_on: [Merger_Brief.md, Repo_Knowledge_Skill.md]
---

# Engine Conformance Strategy

Transform the absorbed engine (`engine/`, memex v0.5.0) from a memory-centric
tool into the merged product's core: **per-project knowledge is the headline,
memory is a co-equal citizen, compiled context is the product function, and
the UI reorients around knowledge.** Legacy per-harness pack configs
(`engine/.agents`, `.claude`, `.codex`) are already removed; they return as
APM packages (WS5), not as checked-in scaffolding.

## 1. Grounding: what the engine is today

| Area | Current | Conforms via |
|---|---|---|
| Domain (`domain/models.py`) | WikiNode (prose page), SemanticLink, WriteInput, Recall* | Add typed knowledge model alongside (§3) |
| Application | memory, consolidator, context_injection, task_recall, graph_expansion, decay, verify, concept_types | Compiler supersedes the injection trio; consolidator becomes proposer (§4) |
| Store (`infrastructure/store`) | WikiStore (Markdown pages), navigation, watcher, backup | Store keeps notes+episodes; knowledge moves in-repo (§2) |
| Search (`infrastructure/search`) | bm25_retriever, index_manager (SQLite FTS5), link_manager | Schema bump for knowledge tables (§5); stays disposable |
| Web (`infrastructure/web`) | htmx dashboard: memories, sessions | Same stack, knowledge-first IA (§6) |
| Harness (`infrastructure/harness`, `marketplace/`) | transcript capture, installers for pi/Claude/Codex/Copilot | Keep capture; install APM packs instead of pack scaffolds (§7) |
| CLI | write/recall/consolidate/approve/types/… | New `knowledge` + `context` verb groups; nothing removed (§8) |

## 2. Store split: knowledge lives with the project

**Principle: knowledge about a repository lives in the repository** (Merger
Brief §6 option A). `~/.memex` remains home for personal and global memory.

| Artifact | Home | Shape |
|---|---|---|
| Knowledge wiki (articles, taxonomy, ontology, indexes) | `<repo>/wiki/` (managed dir, git-versioned with the code it describes) | Markdown articles + `manifest.json` + `index.json` |
| Findings ledger (normative approvals) | `<repo>/wiki/` (`.findings/`) | TOML/JSONL, dedupe key `(source, destination, kind)` |
| Episodes + transcripts | `~/.memex` | unchanged |
| Global/project notes (nuggets) | `~/.memex` | unchanged — untyped pages are notes forever |
| Project registry (repo ↔ wiki mapping, identity) | `~/.memex` | extends workspace_context repo identity |

`memex knowledge init` (run in a repo) creates `wiki/` and registers the
project. Wiki commits in the user's repo are the knowledge revisions — the
first concrete instance of git-as-revision-authority (Merger Brief T1).

## 3. Domain additions (typed, opt-in, additive)

- `KnowledgeNode` (article): `kind` (system/concept/interface/message/rule/
  workflow + normative kinds golden-path/constraint/standard), stable ID,
  taxonomy/ontology refs, evidence records, bindingness label, lifecycle
  (active/retired/stale). Strict validation only when kind is present.
- `TypedRelation`: `is_a`, `represents`, `maps_to`, `derived_from`,
  `checks`, `constrains` — endpoint-validated, replaces ad-hoc link
  expansion for knowledge (notes keep plain links).
- `EvidenceRecord`: repo revision, path, locator, content hash, status
  (declared / implementation-supported / inferred / conflicting / unknown).
- `FreshnessFingerprint`: source-unit hash set → invalidation inputs.
- `Finding`: normative/restructuring proposal with disposition
  (accepted/declined/pending) — never re-propose declined at the observed
  scope.
- `ContextManifest` / `CompiledContext`: selections, omissions, digests,
  budget accounting (Plane 2 contract seeds).

## 4. Application service changes

- **New `knowledge.py`**: the build-repo-knowledge v2 pipeline (Phases 0–7 of
  `Repo_Knowledge_Skill.md`) as deterministic orchestration — scanner →
  extractor (LLM port, evidence discipline) → reconciler (fingerprints,
  identity registry) → compiler (canonical bytes) → wiki renderer → findings
  flow. Deterministic steps are pure code; model work rides `llm_clients`
  and always proposes.
- **New `context_compiler.py`**: mandatory typed closure per task → manifest
  → budgeted canonical context; `CONTEXT_INSUFFICIENT` instead of silent
  drops. Supersedes `context_injection` + `task_recall` +
  `graph_expansion` (kept as renderers/degraded modes during migration).
- **`consolidator.py` → proposer**: emits Findings/WriteInputs under
  authority policy; supersede-not-delete; episodes pinned as evidence.
- **`verify.py` extends**: knowledge schema checks, endpoint resolution,
  evidence existence, reproducibility (compile-twice byte equality),
  findings idempotence.

## 5. Index evolution (SQLite, still disposable)

Schema bump adds: `articles`, `relations`, `evidence`, `fingerprints`,
`findings`, `context_manifests`. Search gains article fields (title, aliases,
exact names, categories) per the brk front-matter contract; BM25 remains the
ranker (eval-gated per engine doctrine). `rebuild-index` reconstructs all of
it from `wiki/` + `~/.memex` pages.

## 6. UI reorientation (change accepted)

Keep the htmx stack (`infrastructure/web`); change the information
architecture from "memories browser" to **knowledge-first**:

- **Home = Projects**: each with knowledge status chips (fresh / stale /
  gaps / findings pending), memory counts, last compile.
- **Project → Knowledge**: wiki browser (articles by category/system),
  typed-relation graph view, evidence drill-down per claim, staleness badges
  with "what changed" diffs, golden-path articles visually distinct
  (normative tier), findings inbox with per-finding accept/edit/decline.
- **Memory** (existing views, demoted one level): notes, episodes, sessions,
  approval queue.
- **Context**: compiled contexts per task — manifest, inclusions/omissions,
  budget, usage feedback (was this memory/article actually cited downstream —
  flaw #9 made visible).

## 7. Harness + packaging

- Transcript capture and MCP tools keep working unchanged (they are the
  memory blood supply).
- The deleted pack scaffolds return as **APM packages**: `skills/build-repo-knowledge/`
  (v2 per Repo_Knowledge_Skill.md) first; delivery-loop skills later.
  `memex install <harness>` (marketplace/) installs the APM pack plus the
  capture hooks. Harness-agnostic SKILL.md + per-platform manifests; no
  checked-in `.claude/.codex` directories in this repo.

## 8. CLI surface

Additive only:

```
memex knowledge init|build|update|status|search|findings   # wiki lifecycle
memex context compile|show                                 # Plane 2
memex viz                                                 # now serves the new IA
```

All existing verbs (write/recall/consolidate/approve/types/…) unchanged.

## 9. Workstreams and gates

| WS | Deliverable | Gate (exit evidence) |
|---|---|---|
| WS1 Store contracts | Typed model + in-repo wiki layout + index schema | Round-trip: untyped stores unchanged; typed wiki rebuilds byte-identical |
| WS2 Knowledge pipeline | Phases 0–7 in engine, LLM behind port | Reproducibility + coverage-gap report on 2 real repos; findings never re-proposed |
| WS3 Context compiler | Mandatory closure + manifest + insufficiency | Injection eval: task recall ≥ focused-query baseline (6/6) within budget |
| WS4 UI reorientation | New IA in viz | Findings inbox usable; staleness visible; old views still reachable |
| WS5 APM packaging | build-repo-knowledge v2 pack installs on pi + Claude Code | Fresh-clone install → wiki builds end-to-end |
| WS6 Delivery loop (Plane 3) | deferred by Merger Brief sequencing | — |

WS1–WS3 together are the first release gate ("ship 1b + 2", Merger Brief §8).

## 10. Compatibility commitments

- Existing `~/.memex` stores and all current CLI/MCP behavior keep working
  (untyped page = note, forever).
- `engine/` history and ADRs remain authoritative for the store layer; new
  ADRs land in this repo's docs as the merged product's ledger.
- No daemon, no vector DB, no cloud — charter constraints hold (Merger
  Brief T2: `memex local` is the only v1 runtime).
