All evidence gathered. The repo matches the described layout (paths present, infrastructure measures ~7.6k LOC, web/ at 1,461). Composing the lane-2 report.

## Review

Repo state check: `engine/src/memex` matches the task description (cli.py 859 lines, mcp_server.py 384, infrastructure ≈7,585 LOC measured across store/search/web/harness + config/llm_clients/run_log/workspace_context; `marketplace/` has pi/claude/codex/copilot adapters). No mismatch; proceeding.

### 1. Verb map

Legend: callers = production callers found (adapter / docs / tests). "Registry" = `OPERATION_DESCRIPTIONS` shared contract (domain/operations.py:20).

**CLI verbs** (all defined in `engine/src/memex/cli.py`):

| Verb | Line | Who calls it | Verdict | Rationale |
|---|---|---|---|---|
| `write` | 51 | All 3 agent snippets instruct it (`marketplace/claude/CLAUDE-snippet.md:4`, `codex/AGENTS-snippet.md:6`, `copilot/…snippet.md:8`); MCP twin; tests | **KEEP** | Core memory write; part of the documented CLI contract |
| `recall` (+`--question`) | 86 | Snippets (`AGENTS-snippet.md:11`); MCP twin; hooks via facade; tests | **KEEP** | The control plane's primary read verb |
| `consolidate` | 109 | MCP twin (mcp_server.py:203); `hook transcript --consolidate` (cli.py:270); test_cli.py:353 | **KEEP** | Only LLM op, explicit-only; distills episodes→durable nodes |
| `forget` | 113 | MCP twin (mcp_server.py:238); test_cli.py:261 | **KEEP** | Memory lifecycle hygiene |
| `hook session-start/prompt/transcript` | 240/245/251/259 | **All adapters**: claude `settings-hooks.json:7–23`, codex `memex-codex-notify.py:100`, pi `extensions/memex.ts:47,57,73`; README:17–19 declares it the stability contract | **KEEP** | The L2 push surface — the headless backbone |
| `serve-mcp` | 182, 619 | Installer wires it into 4 harness configs (installer.py:196–206, 317, 387–392); test_install_mcp.py:121 | **KEEP** | The L1 pull surface |
| `verify` | 187 | Copilot CI workflow `memex-verify.yml:21`; guide.md:649; test_verify.py:91 | **KEEP** | L3 deterministic gate; headless-native |
| `install` / `uninstall` | 194 / 214 | README:52; test_install_and_harness_llm.py:104–144, test_harness_uninstall.py:216 | **KEEP** | One-time bootstrap, non-interactive with harness arg |
| `rebuild-index` | 126 | guide.md:21,149,388; acceptance test_operations_acceptance.py:92 | **KEEP** | Freshness primitive for a filesystem-truth store |
| `types` (5 subcmds) | 145 | guide.md:94–130; error path points users to it (guide.md:114); test_cli_types.py | **KEEP** | Project concept types = the knowledge-plane alignment seam |
| `approve` | 142 | guide.md:317; test_cli_prompt_and_status.py:151 | **KEEP** | Governance gate for pending pages |
| `harness install/uninstall` | 219–239 | Pure alias of install/uninstall (same `_run_install` dispatch, cli.py:662–668); **only tests** (test_harness_install.py:282, test_harness_uninstall.py:200) | **CUT** | Alias bloat; README documents only `memex install` |
| `viz` | 184, 625 | guide.md:364; test_viz_routes.py; `serve()` opens a **webbrowser** (web/server.py:943–947) | **CUT** | Interactive dashboard; directly contradicts headless mandate |
| `watch` | 179, 792–808 | guide.md:21,389; tests only. No adapter invokes it | **DEMOTE** | Foreground `while True: sleep` loop (cli.py:806) is not headless; freshness covered by `verify` + `rebuild-index` |
| `ingest-transcript` | 118 | Registry op (operations.py:121) but no MCP tool; manual/tests only — hooks are the real path | **DEMOTE** | Ops/debug escape hatch; keep documented as manual |
| `clear-transcripts` | 123 | Registry op; facade test only (test_transcript_hook.py:68) | **DEMOTE** | Destructive maintenance |
| `backup` / `restore` | 129 / 133 | guide.md:664–666; tests | **DEMOTE** | Ops utilities, off the runtime path |
| `export` / `import` | 136 / 139 | guide.md:667–668; test_cli.py:336–341; `import` is the untrusted-JSON boundary | **DEMOTE** | Migration/interop; keep for portability, not agent surface |
| `merge` | 167 | guide.md:310; facade test (test_cli_lifecycle.py:122) | **DEMOTE** | Human curation verb |
| `sessions` | 173 | facade `list_sessions`; web uses `list_sessions_report` (web/server.py:256) | **DEMOTE** | Observability; subsumed by viz removal + logs |
| `info` | 175 | test_cli_prompt_and_status.py:108 | **DEMOTE** | Diagnostics |
| `status` | 177 | test:101; web calls facade `status()` (server.py:334) | **DEMOTE** | `verify` supersedes with exit codes (verify.py:88–96 overlaps: index-fresh, zero-yield) |

**MCP tools** (mcp_server.py): `memex_write` (:70), `memex_recall` (:146), `memex_consolidate` (:203), `memex_forget` (:238), `memex_provenance` (:266) — all **KEEP**. Provenance is read-only evidence tracing, aligned with the project's evidence discipline; the 5-tool set is pinned by tests (test_mcp_server.py:82–87, test_domain_operations.py:81–92).

### 2. Infrastructure module table

| Module | LOC | Production consumers | Verdict | Coupling evidence |
|---|---|---|---|---|
| `store/wiki_store.py` | ~998 | facade, consolidator, concept_types, decay, verify, watcher, import_export, transcript_hook, navigation, navigation_search, eval | **CORE** | Filesystem truth; 11 importer sites (grep pass 2) |
| `search/index_manager.py` | ~430 | every read/write path | **CORE** | mem.db mirror; `connection` shared with LinkManager + watcher (index_manager.py:203) |
| `search/bm25_retriever.py` | ~610 | `Memex.recall`, `recall_task`, eval | **CORE** | The ranking engine |
| `search/link_manager.py` | ~255 | facade, verify (`links-resolve` check verify.py:65–72), graph expansion | **CORE** | wiki_links graph |
| `store/navigation.py` | ~466 | write-path refresh (memory.py `_refresh_navigation`), verify `diagnose`, watcher, concept_types | **CORE** | Snippets direct agents to generated `index.md` browsing (CLAUDE-snippet.md:9–10) — it *is* an agent-facing surface |
| `store/navigation_search.py` | ~323 | recall `--engine navigation` + empty-index fallback (memory.py:216–232) | **CORE** | Second engine behind the `engine=` seam (cli.py:103–105) — precedent for federation |
| `store/watcher.py` | ~163 | **only** cli.py:792 lazy import + tests | **DEMOTE** | No adapter, no facade use; foreground polling |
| `store/backup.py` | ~196 | facade `backup/restore` only | **DEMOTE** | Behind backup/restore verbs |
| `store/import_export.py` | ~240 | facade `import_export` only | **DEMOTE** | Behind export/import verbs |
| `web/` (server 951 + explorer 103 + sessions 152 + components 111 + markdown 144) | 1,461 | **only** cli.py:626 lazy import (`viz`) + test_viz_routes.py:20 | **CUT** | One-way dep web→core (server.py:22,256,334,340,445 import facade/run_log); zero core imports of web — verified by exhaustive grep |
| `harness/transcripts.py` | ~571 | cli.py:34 (parse for `hook transcript`) | **CORE** | Parsers for pi/claude/codex session formats — capture path |
| `harness/transcript_hook.py` | ~421 | facade (ingest, provenance, sessions) | **CORE** | Episode linking + provenance |
| `harness/installer.py` | ~766 | install/uninstall verbs | **CORE** | Registers serve-mcp into 4 harness configs — load-bearing |
| `harness/episode_enrichment.py` | ~100 | cli.py:574 hook transcript, on-by-default | **CORE** | Rides harness CLI, no API key (episode_enrichment.py:1–9) — headless-compatible |
| `config.py` / `run_log.py` / `workspace_context.py` | 318/59/90 | facade, verify, status, web | **CORE** | run_log backs verify evidence; workspace_context = federation seam (below) |
| `llm_clients.py` | ~118 | facade `_llm_client` only (memory.py:815–824) | **CORE** (isolated) | Sole user of the `openai` runtime dep (pyproject.toml:29); if consolidation is ever demoted, the dep can drop |

Answers to the specific coupling questions: **nothing besides the `viz` verb and viz tests imports `web/`**; **the watcher has no real users** — only the `watch` verb (manual, undocumented in any adapter) and its unit tests.

### 3. Wiki federation seam

The engine currently has **zero awareness of `<repo>/wiki/`** (exhaustive grep for okf/repo_root/bundle readers found none), though it already speaks OKF v0.2 natively (WikiNode "field set is OKF v0.2 first", domain/models.py:329–331; navigation emits `okf_version: "0.2"` indexes, navigation.py:260). Recommended seams:

1. **Identity/resolution seam — `infrastructure/workspace_context.py:52–66`.** `project_context()` already runs `git rev-parse --show-toplevel` (line 54–56) and then *discards the root*, returning only `(project_id, label, locator)`. Extend `ProjectContext` with `repo_root`/`wiki_root: Path | None`. This is the single place both write (MCP `scope="project"`, mcp_server.py:118–122) and recall (cli.py:830–847 `_project_arguments`) resolve "the project" today.
2. **Fan-out seam — `Memex.recall` / `recall_task` (application/memory.py:163, :299).** Every interface funnels here (CLI recall, MCP `memex_recall`, both hooks via `build_injection`, task recall). Add a new module (e.g. `application/federated_recall.py`) that merges BM25 hits from `~/.memex` with bundle hits from `<repo>/wiki` and re-uses `pack_to_budget` (context_injection.py:38–52) for budget discipline.
3. **Why NOT `IndexManager`:** mem.db is documented as a *disposable mirror of the personal wiki only* ("mem.db is disposable: a stale schema rebuilds from the wiki", memory.py:73–76, with rebuild-on-open). Mixing repo-owned bundle rows into it would break that ownership/freshness model and the rebuild-on-open semantics. The existing two-engine pattern (`--engine fts5|navigation`, cli.py:103–105; NavigationSearch empty-index fallback, memory.py:216–232) is the established precedent for adding a source *beside* the index, not inside it.
4. **Kit machinery to reuse, not duplicate:** `okf_kit.core.search.search()` (weighted rank over a bundle root, kit/okf-kit/okf_kit/core/search.py:1–8) and `okf_kit.core.context.read_concept(root, cid, depth, token_budget)` (BFS neighborhood within budget, context.py:31–40) already do bundle-side search and progressive context. Memex only needs hit-shape mapping into `RecallHit` plus a **source discriminator** (e.g. `okf:<repo>` vs memory) so `format_context_block` (context_injection.py:55–77) attributes provenance — matching the repo's evidence-discipline mandate.
5. **Constraint to design for:** link expansion is per-source today — `graph_expansion` walks `[[slug]]` inside `~/.memex` (context_injection.py:83–100) while kit uses cid adjacency; v1 federation should merge hit lists, not cross-follow links.

### 4. Hidden coupling that makes trimming hard

- **`serve-mcp` is wired into four harness configs** by the installer (installer.py:196–206 claude, :317 codex, :387–392 copilot; pi likewise) and pinned by tests (test_install_mcp.py:121, test_codex_config_placement.py:86, test_harness_uninstall.py:128). Untouchable without breaking adapter installs.
- **CLI owns business logic that belongs below the interface:** compaction-safe transcript merge (`_merge_turns`/`_load_turn_usage`, cli.py:424–478) and episode-enrichment write-back that reaches through the facade into `wiki_store`/`index_manager` directly (cli.py:576–585). Any CLI slimming must move these into `TranscriptHook`/facade first.
- **`harness` alias shares dispatch** with `install` (cli.py:662–668); its removal requires touching installer tests that use the alias form (test_harness_install.py:282, test_harness_uninstall.py:200).
- **Private-name coupling between store and search:** `navigation_search.py:25–27` imports `_query_tokens`, `_stable_dedupe` from `bm25_retriever` and `_node_from_dict` from `wiki_store` — extracting modules across that boundary needs those promoted to public names.
- **`verify` anchors `navigation`, `link_manager`, and `run_log`** (verify.py:16–17, 65–72, 89–96) — any "DEMOTE navigation" idea is vetoed by the L3 gate.
- **eval/ imports internals** (eval/run.py:23–25, workloads.py:19–20, realistic.py:15–19) — trimming search/store internals breaks the eval harness.
- **`apply_decay` has no interface entry point** — facade-only, called exclusively by tests (memory.py:811; test_decay.py, test_facade.py:214). Dead surface from the interface's perspective.
- **Registry asymmetry:** `OPERATION_DESCRIPTIONS` carries 4 CLI-only ops (`memex_ingest_transcript`, `memex_clear_transcripts`, `memex_export`, `memex_import`, operations.py:121–178) with no MCP tool; demoting those verbs must update the registry and its pin test (test_domain_operations.py:81–92) in the same change.

### 5. Phased trim plan

| Phase | Action | What breaks | Test proof |
|---|---|---|---|
| 1 | **CUT `web/` (1,461 LOC) + `viz` verb** (cli.py:184–186, 625–629; test_viz_routes.py; guide.md:364; gitpages/index.md:40) | Nothing in core — no core imports web (verified); only the human dashboard disappears | Full `uv run pytest` minus deleted viz tests passes; grep shows zero remaining `memex.infrastructure.web` imports; `memex --help` lists no `viz` |
| 2 | **CUT `harness` alias verb** (cli.py:219–239, 662–668) | Tests using the alias form only | Update test_harness_install.py:282 / test_harness_uninstall.py:200 to `install`; install+uninstall suites still green |
| 3 | **DEMOTE maintenance verbs** (`watch`, `backup`, `restore`, `export`, `import`, `clear-transcripts`, `ingest-transcript`, `merge`, `sessions`, `info`, `status`) into a documented "maintenance" section or `--expert` grouping; **CUT `watch` verb + fold `watcher.py`** after confirming external-edit flow is served by `rebuild-index`/`verify` | Guide references (guide.md:21,389,664–668); registry entries for demoted ops + pin test | Registry pin test updated in same commit; CLI smoke of each surviving verb; acceptance suite green |
| 4 | **DEMOTE `llm_clients`/consolidation behind config enablement** (optional, per product call) | The `openai` runtime dep — removable if consolidation is opt-in-off | Consolidation tests with mocked provider pass; `uv tree` shows openai gone |
| 5 | **Federation build-out (additive)**: `ProjectContext.wiki_root`; new `application/federated_recall.py`; merge at `Memex.recall`/`recall_task` | Nothing existing — additive seam | New `test_federation.py` pinning merge order, source attribution, budget behavior, and "no bundle → identical results" regression; existing recall/MCP/hook suites unchanged |

Note: I could not execute tests (read-only review, no shell tool). Phase proofs above are the commands a supervisor should run per phase; Phase 1's grep precondition is already satisfied by this review's own exhaustive grep.

- Correct: the codebase is already well-layered for this trim — web is a leaf, the adapter contract is 5 verbs + 5 MCP tools, and the recall path has a clean two-engine seam suited to federation.
- Fixed: none (read-only).
- Finding: **P2** — `apply_decay` is interface-unreachable dead surface (memory.py:811; only tests call it). Smallest fix: add maintenance verb or delete the facade method with its tests.
- Finding: **P2** — `watch` conflicts with the headless mandate (cli.py:792–808 foreground loop); no adapter or automated user exists. Smallest fix: cut verb + watcher.py after Phase 3 confirmation.
- Finding: **P2** — CLI-layer ownership of transcript merge/enrichment logic (cli.py:424–478, 576–585) blocks aggressive interface slimming; move into `TranscriptHook` first.
- Merge verdict: **OK with notes** — no blocking issues; findings are trim-planning inputs, not defects.