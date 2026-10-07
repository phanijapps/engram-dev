All files read and cross-checked. The repo matches the task description (paths exist, LOC within tolerance: memory.py 842, consolidator.py 388, verify.py 271, graph_expansion.py 155, concept_types.py ~149, task_recall.py ~141, context_injection.py ~103, decay.py 67, ports.py 23, dto.py 25 ≈ 2,164 total). Proceeding with the review.

## Review — LANE 1: `engine/src/memex/application/`

### 1. Per-module verdict table

| Module | Purpose (1 line) | Real callers | LOC | Verdict | Rationale + evidence |
|---|---|---|---|---|---|
| `memory.py` | `Memex` facade composing store/index/links/transcripts/maintenance behind one API | cli.py (14+ commands), mcp_server.py (:142,:209,:212,:241,:266,:287), verify.py, context_injection.py:85, graph_expansion.py, task_recall.py:106 | 842 | **REFACTOR** | Correct but mixes ~13 responsibility clusters; control-plane role needs thin dispatch (see §2). Evidence: method map below |
| `consolidator.py` | LLM distillation of episodes → governed knowledge nodes | only `Memex.consolidate` (memory.py:366–374, lazy); CLI consolidate (cli.py:711), hook transcript `--consolidate` (cli.py:604), MCP `memex_consolidate` (mcp_server.py:241) | 388 | **CORE** | The single LLM edge; feeds the memory plane; governance rules (withdrawn types never resurrected, consolidator.py:330–367) match the project thesis |
| `verify.py` | Deterministic health + activity-evidence gate (exit code) | cli.py:777 (`memex verify`), marketplace/copilot/memex-verify.yml:22 (CI) | 271 | **REFACTOR** | Keep the gate; but `okf_checks` (verify.py:172–255) re-implements OKF linter rules that belong to the kit plane (kit/okf-kit/okf_kit/core/validate.py covers link integrity) — delegate when planes merge |
| `graph_expansion.py` | BFS expansion of recall seeds over typed links, token-budgeted | context_injection.py:88–96, task_recall.py:10–13,118 | 155 | **MERGE** | Engine-side twin of kit's `read_concept(depth)`; belongs in the compiler module (see §3) |
| `concept_types.py` | Project concept-type lifecycle (list/add/enable/remove/suggest) | `Memex.types` (memory.py:102) → cli.py:744–769 only; not on MCP | 149 | **CORE** | The project-resolve seam: a project's type set is its wiki directory declarations; mirrors the OKF bundle's typed concepts |
| `task_recall.py` | Bounded task-evidence assembly over per-question rankings | `Memex.recall_task` (memory.py:355–393) → cli.py:681 + MCP `memex_recall(questions=)` (mcp_server.py:202–209) | 141 | **MERGE** | Second compile path over the same pack/expand primitives; fold into compiler (§3) |
| `context_injection.py` | Hit rendering, budget packing, hook injection block | cli.py:521 (hook prompt/session-start), memory.py:289,:336 (`pack_to_budget`) | 103 | **MERGE** | Seed of the context compiler; absorb the other two |
| `decay.py` | Exponential importance decay | `Memex.apply_decay` (memory.py:811) — which has **zero production callers** (only tests/unit/test_facade.py:216) | 67 | **CUT** | No CLI/MCP/cron wiring; importance never affects ranking (bm25_retriever.py:228,:421 `ORDER BY score, w.slug`; navigation_search.py:111–113) — cosmetic metadata only |
| `ports.py` | `LLMClient` protocol + `LLMResponse` | consolidator.py:17, memory.py:14, llm_clients infra | 23 | **CORE** | Minimal port, exactly the lean shape wanted |
| `dto.py` | `to_jsonable` for CLI/MCP JSON | cli.py:615, mcp_server.py:26,:209 | 25 | **CORE** | Tiny, load-bearing |

### 2. Deep-dive `memory.py` (842 LOC) — responsibilities and decomposition

Distinct responsibilities (with line evidence):

1. **Composition/lifecycle** — `__init__`/`_open_storage`/`close` (memory.py:64–114): wires 10 collaborators + transparent rebuild-on-open.
2. **Write path** — `write` (117–176): reserved-guard, scrub, byte budgets, store+index+links+nav.
3. **Recall paths** — `recall` (178–287, engine dispatch + degraded FTS5→navigation fallback), `_navigation_recall` (289–353), `recall_task` (355–393).
4. **Consolidation wiring** — `consolidate` (395–430) + lazy `_consolidator`.
5. **Forget/retire** — `forget` (432–484) + `_validity_end` (486–500).
6. **Transcript capture** — `ingest_transcript` (502–537), `clear_transcripts` (539–543), `get_provenance`/`list_sessions` (767–770).
7. **Index maintenance** — `rebuild_index` (545–628).
8. **Backup/restore** — `backup`/`restore` (630–653).
9. **Governance mutations** — `_guard_reserved` (655–672), `approve` (674–687), `merge` (689–707).
10. **Navigation plumbing** — `_on_page_written` (709–715), `_refresh_navigation` (717–748).
11. **Health/status** — `status` (772–809).
12. **Decay** — `apply_decay` (811–822) — dead in production.
13. **LLM client resolution** — `_llm_client` (824–840).

**Proposed decomposition** (facade API unchanged; control-plane verbs):

| New module | Absorbs | Control-plane role |
|---|---|---|
| `Memex` (thin, ~150 LOC) | composition + delegation only | the headless entrypoint |
| `recorder.py` | write, forget, approve, merge, `_guard_reserved` | **record** seam |
| `search.py` | recall, `_navigation_recall`, engine dispatch + fallback | **search** seam |
| `compiler.py` | recall_task + merged trio (§3) | **compile** seam — later fans out to `<repo>/wiki/` OKF bundles |
| `maintenance.py` | rebuild_index, status, backup/restore, navigation refresh | **maintain** |
| `propose.py` | consolidate, `_llm_client` | **propose** (model edge) |

Notable wart: memory.py:44 imports **private** `_query_tokens` from infrastructure (used at :374) — promote it to a public port/domain helper when splitting.

### 3. Trio overlap: `context_injection` vs `task_recall` vs `graph_expansion`

Quantified overlap (399 LOC combined):

| Overlap | Evidence | Cost |
|---|---|---|
| **Three budget packers** | `pack_to_budget` (context_injection.py:30–40, skip-and-continue, first hit always kept); `_pack` (graph_expansion.py:141–155, reserve marker then greedy-fill); shrink-loop in `assemble_task_recall` (task_recall.py:82–88, pop-tail re-render) | ~45 LOC, 3 divergent policies |
| **Two expansion wirings** | `build_injection` (context_injection.py:94–103) vs `with_linked_pages` (task_recall.py:117–133): both expand_links → render_expansion → empty-guard → budget-guard → fallback | ~2×20 LOC |
| **Two `_identity` helpers with divergent semantics** | graph_expansion.py:110–111 normalizes `project_id or None`; task_recall.py:22–23 does not — `""` vs `None` project_id dedups differently between the two paths | latent inconsistency |
| **Token estimator duplicated across planes** | engine `estimate_tokens` = `len//4+1` (context_injection.py:25–27) vs kit `_estimate` = `len//4` (kit/okf-kit/okf_kit/core/context.py:118) | seam drift |

**Merged module shape — `application/compiler.py`** (mirror-name for kit's `core/context.py`):

- `estimate_tokens` (single)
- one `pack(items, budget, *, cost, reserve_marker)` primitive replacing all three packers
- `expand(seeds, depth)` = today's graph_expansion (BFS over `retriever.neighbours`, graph_expansion.py:63–112)
- `compile_prompt_context(query, ...)` = `build_injection`
- `compile_task_evidence(task)` = today's `assemble_task_recall` + `with_linked_pages`
- renderers (`format_context_block`, `_render`)

Net ~230 LOC (saves ~170), one identity key, one packing policy. The seam contract with kit's half is already implied by both docstrings citing OKF `read_concept(depth)` (graph_expansion.py:3–7, task_recall.py:110): *seed selection + BFS depth + budget + omission marker*, deterministic on both planes.

### 4. Dead / vestigial code paths

1. **`decay.py` + `Memex.apply_decay`** — no production caller anywhere in `src` (grep: only tests/unit/test_facade.py:216; no CLI subcommand — full `add_parser` inventory cli.py:51–262 has no decay; MCP exposes no decay tool mcp_server.py:130–287). Ranking ignores importance (bm25_retriever.py:228,:421; navigation_search.py:111–113). Config `[recency_decay]` (config.py:87, 217–224) feeds only this.
2. **Redundant local import** — memory.py:777 re-imports `hash_body` already imported at memory.py:51.
3. **`status()` scans the wiki twice** — memory.py:780 (stale check) and memory.py:799 (status counts); also duplicates verify.py:49–63's index-fresh check verbatim (same scan+get+hash comparison).
4. **`recall_task` input copy** — memory.py:358–371 rebuilds `TaskRecallInput` field-by-field only to coerce tags→list; `dataclasses.replace` would do.

Not dead (verified): `verify.py` require-flags are used by CI (marketplace/copilot/memex-verify.yml:22); the `navigation` recall engine is CLI-exposed (cli.py:103–108) plus the internal degraded fallback (memory.py:247–281).

### 5. Top 5 lean wins (LOC saved vs behavioral risk)

| # | Action | LOC saved | Risk | Evidence |
|---|---|---|---|---|
| 1 | **Cut `decay.py` + `apply_decay` + `[recency_decay]` config** | ~90 | Near zero (no production caller; ranking ignores importance) | §4.1 |
| 2 | **Merge trio → `compiler.py`** (one packer, one identity) | ~170 | Low — behavior pinned by tests/unit/test_link_expansion.py, test_budget_recall.py, task-recall tests; must consciously unify the 3 packing policies | §3 |
| 3 | **Split `memory.py`** into recorder/search/compiler/maintenance/propose behind the same facade | ~0 net, but 842→~150 facade | Low-medium (pure moves, API unchanged) | §2 |
| 4 | **Dedupe status/verify stale-check; single `scan_all` in status** | ~25 | Trivial | memory.py:779–809 vs verify.py:49–63 |
| 5 | **Delegate `okf_checks` to the kit linter when the knowledge plane merges** | ~80 | Medium (needs dependency direction decision — defer to the WS plan) | verify.py:172–255 |

- Correct: the layer is coherent, well-documented, test-pinned; `ports.py`/`dto.py` are exactly the lean shape the control-plane mandate wants; the governance logic in `consolidator.py` matches the "deterministic core, model edges" thesis.
- Finding (P2): `decay.py` is production-dead and its only effect (importance) never influences ranking or visibility — smallest fix: cut it, or wire it and make the ranker use importance (pick one).
- Finding (P2): three divergent budget packers + two `_identity` semantics inside the trio — merge as specified in §3 before the wiki-bundle compile path is added on top.
- Merge verdict: **OK with notes** — no blockers; the wins above are lean-out work, not defects.