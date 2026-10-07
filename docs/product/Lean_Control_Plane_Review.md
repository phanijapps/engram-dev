---
title: Lean Control Plane Review — subagent code review synthesis
document_type: review_synthesis
status: executing — P1, P2a, P2b landed 2026-10-06 (owner approved all); P2c–P4 remain
version: 0.1.0
date: 2026-10-05
review_method: 3 parallel fresh-context read-only reviewers (app-services, surface-trim, plane-contract); parent synthesis
artifacts:
  - subagent-artifacts/70c944a0_reviewer_output.md (lane 1)
  - subagent-artifacts/723d2087_reviewer_output.md (lane 3)
  - subagent-artifacts/cbdce36d_reviewer_output.md (lane 2)
---

# Lean Control Plane Review — synthesis

**Verdict: OK with notes.** The engine is well-layered for this trim: `web/`
is a leaf with zero core imports, the adapter contract is small and
test-pinned, and the recall path already has the two-engine seam federation
needs. No defects found — the findings below are lean-out work. **No code
has been cut yet; every deletion below awaits owner approval.**

## 1. The control-plane contract (the target shape)

memex = headless dark knight. 8 ops, consumed by the future greenfield and
brownfield skills:

| # | Op | Status today |
|---|---|---|
| 1 | `resolve(cwd)` → project identity + wiki presence/freshness + memory counts | PARTIAL (identity exists, wiki registry MISSING) |
| 2 | `wiki init` (greenfield entry) | PARTIAL (kit creates bundle; engine registry MISSING) |
| 3 | `wiki update` (deterministic rebuild; fingerprints) | PARTIAL (kit indexer; freshness U2 MISSING) |
| 4 | `search(query, source: wiki\|memory\|both)` | PARTIAL (both rankers exist; zero federation) |
| 5 | `compile(goal, questions, required_ids, budget)` → context + manifest + `CONTEXT_INSUFFICIENT` | PARTIAL (both halves exist; no unified manifest/insufficiency) |
| 6 | `record(note\|episode)` | EXISTS (engine) |
| 7 | `propose finding` / `resolve finding` | MISSING (kit U3) |
| 8 | `status` (thin: wiki freshness + pending findings + memory health + index ok) | PARTIAL |

Skill flows: **greenfield** = resolve → wiki init → record/propose →
compile. **brownfield** = resolve → wiki update if stale → search →
compile → record/propose. These become the first two APM skill packs on
this contract.

## 2. Cross-lane conflicts — parent arbitration

| Conflict | Lane positions | Ruling |
|---|---|---|
| `types` verb group | L1 CORE / L2 KEEP / L3 DELETE | **Transitional KEEP** — store governance relies on it today; folds into OKF bundle types at federation (U1+). Not an immediate cut. |
| UI / `viz` | L2 CUT (leaf, zero core imports) / L3 freeze + escalate charter | **CUT engine `web/`; UI re-targets to the knowledge plane** (kit's bundle web browses `<repo>/wiki/`, which is human-facing by nature). Resolves the charter "dashboard" line: the dashboard was never the dark knight's face. Charter revision recorded as a decision below. |
| `merge`, `import`/`export` verbs | L2 DEMOTE / L3 DELETE | **DELETE recommended** (supersede-not-delete is the product policy; backup/restore covers durability) — flagged for owner sign-off since it removes a human-curation verb. |
| MCP `memex_consolidate` / `memex_forget` | L2 KEEP (test-pinned) / L3 DROP | **DROP from MCP** — agent surface mirrors the 8 ops; consolidation becomes the internal proposer behind `propose`; `forget` stays CLI-admin. |
| `recall --engine navigation` | L2 CORE seam / L3 trim flag | **Keep the seam and fallback; remove from agent-facing docs.** The `engine=` parameter is the federation precedent — keep it. |

## 3. Dispositioned findings

**Valid, cut-list (approved-pending):** `web/`+`viz` (1,461 LOC, leaf —
verified zero core imports); `watch` verb + `store/watcher.py` (~230, no
adapter calls it, foreground loop violates no-daemon charter); `decay.py` +
`apply_decay` + `[recency_decay]` config (~90 — production-dead, ranking
ignores importance: bm25_retriever orders by score,slug only); `harness`
alias verb (pure duplicate dispatch, tests-only callers).

**Valid, refactor-list:** merge `context_injection`/`task_recall`/
`graph_expansion` → `application/compiler.py` (~170 LOC saved; today there
are **three divergent budget packers and two `_identity` semantics** — a
latent inconsistency that must be unified before the wiki compile path
lands on top); split `memory.py` (842 LOC, ~13 responsibility clusters)
into recorder/search/compiler/maintenance/propose behind a ~150-LOC
facade; dedupe the status/verify stale-check (~25 LOC, verbatim duplicate
scan); promote private `_query_tokens` cross-module import to a public
port; move CLI-owned transcript merge/enrichment logic
(cli.py:424–478, 576–585) down into TranscriptHook/facade.

**Valid, deferred:** delegate `verify.okf_checks` (~80 LOC) to the kit
linter — only after the dependency-direction decision (planes merge).

**Stale/invalid:** none — all findings verified against current HEAD by
the reviewers with file:line evidence.

## 4. The phased lean-down (awaiting approval)

| Phase | Action | LOC effect | Proof gate |
|---|---|---|---|
| **P1 — pure cuts** | Delete `web/` + `viz`; `watch` + `watcher.py`; `decay` + config; `harness` alias | −~1,800 runtime | Full pytest green minus deleted suites; grep zero `memex.infrastructure.web` imports; `--help` shows no viz/watch |
| **P2 — compiler + facade** | Trio merge → `compiler.py`; `memory.py` split; stale-check dedupe; transcript logic moves out of CLI | −~200 net, facade 842→~150 | Existing budget/expansion/task-recall tests pin behavior; packing-policy unification is an explicit, tested decision |
| **P3 — surface alignment** | MCP → 8 contract tools (+`memex_provenance`); consolidate internal; `sessions`/`info` fold into `status`/`resolve`; hooks rewired onto search/compile **preserving the fail-open envelope (cli.py:518–522)**; registry + pin tests updated same-commit | surface 26 verbs → ~14 | Registry pin test updated; hook suites unchanged |
| **P4 — federation (additive)** | `ProjectContext.wiki_root`; `application/federated_recall.py` merging BM25 + kit bundle search with source attribution (`okf:<repo>` vs memory); v1 merges hit lists, does not cross-follow links | +new | `test_federation.py`: merge order, attribution, budget, no-bundle regression |

Post-trim surface: **CLI ~14 verbs** (`resolve`, `wiki init|update|status`,
`search`, `context compile|show`, `write`, `ingest-transcript`,
`findings …`, `approve`, `verify`, `rebuild-index`, `backup/restore`,
`install/uninstall`, `hook …`, `serve-mcp`) · **MCP 8+1 tools**.

## 5. Invariants that survive every phase (over-trim guard)

Fail-open hooks (cli.py:518–522 try/except must survive the rewire) ·
provenance/transcript linking · approval flow (findings before any
LLM-authored wiki write; never direct `stable`) · deterministic verify as
the CI gate · local-first/no daemon (deleting `watch` *strengthens* this) ·
files-are-truth, disposable index (federation must NOT mix bundle rows
into mem.db) · budget honesty (kit's truncate-with-marker is not
`CONTEXT_INSUFFICIENT` — U4 lands before `compile` is trusted).

## 6. Decisions requested from the owner

**All approved 2026-10-06 ("go for it all").** Execution log:

| Phase | Status | Commit | Notes |
|---|---|---|---|
| P1 cuts (web/viz, watch, decay, harness alias, merge, import/export) | **done** | 6abf3b9 | −3,800 LOC; gates green; baseline failures unchanged (2 unit env, 1 integration score) |
| P2a trio merge → `application/compiler.py` | **done** | 07f76d9 | one estimator/identity/expansion; named packing policies; eval harness rewired |
| P2b stale-check dedupe | **done** | f6ad3f7 | `verify.count_stale_index_rows` shared by `status()`; single scan |
| P2c facade split (recorder/search/compiler/maintenance/propose) | next | — | pure moves behind unchanged facade API |
| P2d transcript merge/enrichment logic out of cli.py | next | — | moves into TranscriptHook/facade |
| P3 surface alignment (MCP 8+1, sessions/info folds, registry) | next | — | registry pin updated same-commit |
| P4 federation (wiki_root, federated recall) | next | — | additive; hit-list merge, no mem.db mixing |

Note: mid-execution, `skills/sdlc/*` drafts appeared in the working tree
(not authored by this work); kept on disk, excluded from commits.
