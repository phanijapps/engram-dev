---
title: Memex Merger and Product Brief
document_type: brief
status: draft_for_discussion
version: 0.2.0
date: 2026-10-05
supersedes: none
---

# Memex Merger and Product Brief

Merge direction and product shape for folding the existing memex memory layer
(`~/projects/memex`, v0.2) into the Graph Engineering structure
(`memex_beta`), which renames to **memex** as the final home.

## 1. Thesis

Current memex is a *recall engine*: query in, ranked pages out. Graph
Engineering specifies a *delivery harness* around a versioned solution graph.
The gap between them is the context engine:

> The merged memex answers "what is the complete, current, budgeted context
> for this task?" — and the delivery loop turns briefs into shipped work on
> top of it.

## 2. The big change: nuggets → elaborated knowledge (LLM as wiki)

Current memex captures **nuggets**: one preference, one rule, one episode per
page. Correct shape for cross-project facts; wrong shape for codebase
knowledge, which is *structure* — interconnected, hierarchical,
evidence-pinned, and stale when code moves.

The product change: memex becomes a **curated knowledge engine**. Building
knowledge from codebases and docs produces an elaborate, navigable,
evidence-backed **wiki** (taxonomy, ontology, knowledge graph, rendered
articles, search index) — the `build-repo-knowledge` skill's output — and the
LLM's job includes **gardening that wiki** continuously.

### 2.1 Operating principles

1. **Knowledge is compiled, not just retrieved.** The wiki is a cache with
   provenance and invalidation. Reading curated pinned pages beats re-reading
   a subsystem per task (token economics of shift-left).
2. **Graph is the model; wiki is the view.** Canonical graph compiled
   deterministically from frozen facts (per `build-repo-knowledge`
   compilation contract); articles are renders with typed front matter.
   Human notes preserved; managed sections marked; regeneration is safe.
3. **Evidence or it didn't happen.** Article sections carry evidence status
   (declared / implementation-supported / inferred / conflicting / unknown)
   pinned to repo revision + locator. Rot is solved by invalidation
   machinery: source fingerprint change → affected pages `NEEDS_REVIEW` →
   incremental re-extraction of only those source units.
4. **Curation is a triggered loop.** On-change (diff hook marks stale),
   on-task (compiler refreshes a stale article before including it),
   on-consolidate (scheduled gardening pass). All gardener writes are
   proposals under authority policy.
5. **Humans co-edit.** Generated vs human sections separated; managed-file
   manifest; never overwrite unrelated destination content.

### 2.2 Artifact classes

| | Notes (nuggets) | Articles (wiki) |
|---|---|---|
| Shape | atomic prose page | elaborated page, schema'd front matter, managed sections |
| Truth | the page itself | the graph; page is a render |
| Freshness | provenance + validity dates | evidence pins + fingerprint invalidation |
| Author | capture/consolidation (proposer) | wiki gardener (proposer) |
| Recall | search | search + typed-relation traversal + index descent |

## 3. Unified shape

```
┌ Plane 3: DELIVERY LOOP ── briefs → tasks → attempts → verified change ──┐
│  scheduler · DAG readiness · leases/fencing · effect ledger · evidence   │
├ Plane 2: CONTEXT COMPILER ─ task → frozen ctx assembled FROM THE WIKI ───┤
│  typed closure · mandatory selection · canonical bytes · manifests        │
├ Plane 1b: KNOWLEDGE WIKI ── articles, taxonomy, ontology, graph, evidence ┤
├ Plane 1a: MEMORY NUGGETS ── episodes, preferences, rules (memex today) ───┤
└──────────── one store model: git-versioned files + disposable index ──────┘
```

Search does not die: it remains the discovery/browsing interface and the
candidate generator for context-gap investigation. Compilation is the
authoritative injection path.

## 4. Known memex flaws and their fixes

| # | Wrong (evidence from memex docs) | Fix |
|---|---|---|
| 1 | Broad-goal recall misses prerequisites — 2/6 one-shot vs 6/6 focused (backlog/001) | Task identity → mandatory typed closure |
| 2 | Active goal lost after compaction (backlog/002) | GOAL/TASK nodes + deterministic re-compilation of frozen task context |
| 3 | Link expansion unmeasured; fixture 2/123 linked cards, none resolve (backlog/003) | Typed relations with endpoint validation; traversal costed in manifest |
| 4 | Injection not strictly bounded; mandatory constraints can silently drop | Whole-request budget; omission manifest; `CONTEXT_INSUFFICIENT` |
| 5 | Recent ≠ applicable; newest-wins misleading | Authority + validity projections; supersession relations; dual timestamps |
| 6 | Consolidation lossy, duplicates identities (v1_enhance B1/B2/B5) | Consolidation becomes a proposer; supersede-not-delete; episodes pinned as SOURCE |
| 7 | Concurrent tasks conflated under project identity | Initiative/task scoping |
| 8 | Approval is a side-channel | Approval becomes authority-record processing |
| 9 | Memory usage unmeasured (F1) | Invocation envelopes bind context digests to reports |
| 10 | Nugget-only content model cannot hold codebase structure | Plane 1b wiki: articles + taxonomy + ontology + graph (this brief §2) |

## 5. Tensions and recommended resolutions

- **T1 Files-as-truth vs immutable revisions** → the store is a git repo;
  commits are revisions; HEAD is `package_revision`; atomic proposal = commit
  that fails if HEAD moved. Runtime records are append-only JSONL; lease/fence
  state deterministically replayed from the ledger; SQLite stays disposable.
  Postgres becomes the later team-scale runtime over the same contracts.
- **T2 Local-first vs service** → one contract, two runtimes (`memex local`
  first; `memex service` later, explicitly separate).
- **T3 Prose vs typed nodes** → typed front matter is opt-in per page;
  untyped pages remain valid notes forever; strict validation only when kind
  present.
- **T4 Consolidation vs authority** → capture, consolidation, and the coding
  agent are all proposers; per-scope policy sets auto-accept (summaries yes,
  decisions never).
- **T5 Harnesses vs workers** → pi/Claude Code/Codex/Cursor/Kiro are
  execution surfaces, not isolated workers; memex local compiles context and
  accepts fenced reports; adapters packaged via APM.

## 6. Wiki location (open, recommendation made)

- **A (recommended): in-repo wiki + federated compiler.** Articles live in
  the repository (managed directory, default `wiki/`), team-shared, diffed
  with code. Nuggets/episodes stay in `~/.memex`. Context engine index spans
  both. Every harness reads in-repo Markdown — portability for free.
- **B: in-store wiki** under `~/.memex/docs/projects/<repo>/wiki/` —
  personal, consistent with today's layout, but invisible to teammates and
  detached from code history.

## 7. Merge and naming plan (draft)

1. `memex_beta` renames to **memex**; owns contracts (`schemas/`, spec,
   briefs) and the new planes.
2. Absorb `~/projects/memex` `src/memex` as the Plane-1 store engine module;
   migrate its eval harness, specs, and ADRs (the ADR history is the decision
   ledger).
3. `build-repo-knowledge` becomes the Plane-1b wiki engine, its output
   mapped onto harness contracts (SOURCE nodes, evidence, `derived_from`).
4. Published `phanijapps/memex` supersedes/redirects; typed front matter is
   additive so v0.2 stores migrate without a rebuild.
5. "Graph Engineering" remains the name of the method/discipline; the
   product is memex.

## 8. Sequencing (recommended)

Ship **Plane 1b (wiki engine) together with Plane 2 (context compiler
reading the wiki)** before Plane 3 (scheduler/attempts). The wiki is the
context layer; it fixes flaws #1–4 and #10 first. Delivery loop follows once
context quality is measured (reuse `eval/` corpora).

## 9. Open decisions

1. Confirm git-as-revision-authority (T1).
2. Confirm wiki location A vs B (§6).
3. Engine home: absorb engine into renamed repo vs keep as dependency.
4. Charter edge: does "local-first, no daemon" stay hard for the merged
   product, with the service edition explicitly deferred?
