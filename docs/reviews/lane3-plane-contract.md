All evidence gathered. Here is the Lane 3 review.

---

# Lane 3 — Control-Plane Contract Review

**Repo match:** ✅ Matches description. `engine/` = memex v0.5.0 (`engine/src/memex/__init__.py:38`), `kit/` = okf-kit (`kit/okf-kit/okf_kit/`). Engine exposes ~26 CLI verbs (`engine/src/memex/cli.py:51–262`) and 5 MCP tools (`mcp_server.py:91–347`). Kit exposes 9 CLI verbs (`kit/.../cli.py:46–171`) and 5 MCP tools (`kit/.../mcp.py:5–12`). Proceeding.

**Grounding note:** the strategy docs describe a *superset* of the task mandate. `Engine_Conformance_Strategy.md` §6 plans a full knowledge-first web UI; the task mandate says headless "dark knight," lean and mean. Where they conflict I side with the task mandate and flag the conflict.

## 1. The minimal control-plane contract (8 ops)

Skill flows: **greenfield** = resolve → wiki init → record/propose → compile. **brownfield** = resolve (+freshness) → wiki update if stale → search → compile → record/propose.

| # | Op (verdict on candidate) | Signature sketch | Sources it reads |
|---|---|---|---|
| 1 | **`resolve`** — ACCEPT candidate "resolve project identity", RESHAPE to also answer "does this repo have a wiki, is it fresh" | `resolve(cwd) → {project_id, label, wiki?: {bundle_path, okf_version, freshness: fresh\|stale\|absent, pending_findings}, memory: {project_pages}}` | git remote/path (`infrastructure/workspace_context.py:51`), `~/.memex` registry (MISSING), `<repo>/wiki/index.md` |
| 2 | **`wiki init`** — ACCEPT candidate "register/init wiki bundle" (greenfield entry point) | `wiki_init(cwd) → {bundle_path, registered: true}` | kit `templates.init_bundle` (`core/templates.py:29`); engine-side registry write (MISSING) |
| 3 | **`wiki update`** — RESHAPE: candidate said "register/init"; brownfield also needs deterministic build/refresh | `wiki_update(cwd) → {written, updated, marked_stale, fingerprints_diff}` | kit `index_codebase` (`code/indexer.py:60`, tree-sitter); fingerprints/staleness = MISSING (U2) |
| 4 | **`search`** — ACCEPT "search across wiki+memories" (candidate generator; compilation is authoritative per Merger §3) | `search(query, {source: wiki\|memory\|both, scope, type/tag, top_k}) → hits[{origin, id, title, snippet, score, path}]` | kit `core/search.py` (FTS over bundle); engine `infrastructure/search/bm25_retriever.py` |
| 5 | **`compile`** — ACCEPT "compile task context" — this *is* the product function (Merger §1) | `compile({goal, questions?, required_ids, depth, budget_tokens}) → {context, manifest{included, omitted+why, tokens}, status: ok\|CONTEXT_INSUFFICIENT}` | kit `context.read_concept` (`core/context.py:43`); engine `assemble_task_recall` (`application/task_recall.py:65`) |
| 6 | **`record`** — ACCEPT "record episode/note" (memory blood supply; ECS §7) | `record({kind: note\|episode, title, body, scope, tags}) → {slug, file_path}` | `Memex.write` (`application/memory.py:112`), `ingest_transcript` (`memory.py:511`) |
| 7 | **`propose finding` / `resolve finding`** — ACCEPT "propose finding (normative approval)"; it's the authority path for wiki writes (ECS §4, kit plan §B.2) | `propose({source, destination, kind, rationale}) → {finding_id, disposition: pending}`; `resolve(id, accepted\|declined)` | `.okf/findings.toml` — MISSING today; memory-plane analog exists (`approve`, `memory.py:684`) |
| 8 | **`status`** — ACCEPT "freshness status" but RESHAPE thin: fold memory health into one readout; **REJECT** a standalone freshness *subsystem* (dashboard bloat) | `status(cwd) → {wiki: freshness+stale counts+pending findings, memory: pending pages, index ok}` | `Memex.status` (`memory.py:772`), kit `validate_bundle` |

**Rejected/absorbed candidates:** none of the seven listed candidates is rejected outright; three are reshaped (resolve, wiki init→init+update, freshness→thin status). A standalone `read concept` op is **rejected** as a contract op — kit `read_concept(depth=0)` covers drill-down and search returns snippets; a separate verb duplicates `compile` with a trivial config. A `forget` op is **rejected** from the control-plane surface (supersede-not-delete is the policy; destructive ops stay CLI-admin).

## 2. Capability map

| Contract op | Engine evidence | Kit evidence | Verdict |
|---|---|---|---|
| resolve | identity: `infrastructure/workspace_context.py:51,70` (git remote → SHA id); no wiki registry (grep for `bundle\|wiki_root` in engine: only OKF front-matter hits, e.g. `store/wiki_store.py:72`) | n/a | **PARTIAL** — identity half exists; repo↔bundle mapping MISSING (ECS §2 registry row, U6) |
| wiki init | none | `core/templates.py:29 init_bundle`; CLI `init` (`cli.py:46`); MCP `init_bundle` (`mcp.py`) | **PARTIAL across both** — kit creates bundle; engine registration MISSING |
| wiki update | none | `code/indexer.py:60 index_codebase` (deterministic tree-sitter, managed sections) | **PARTIAL (kit)** — no fingerprints/staleness (grep `fingerprint\|stale_after` in kit: no hits; U2 pending) |
| search | `bm25_retriever.py` + `index_manager.py` (FTS5, scopes/filters; `memory.py:185 recall`) | `core/search.py build_index/search` | **PARTIAL across both** — both rankers exist, zero federation between them (U6) |
| compile | `task_recall.py:65` (budget interleave, gap report, `ValueError` when envelope can't fit, `:100`); `context_injection.py:30 pack_to_budget`; chars/4 tokenizer (`context_injection.py:25`) | `context.py:43 read_concept` (BFS, budget, omission marker, deterministic) | **PARTIAL across both** — no unified manifest, no required-concept closure, no real tokenizer, kit truncates-with-marker instead of `CONTEXT_INSUFFICIENT` (U4 pending) |
| record | `memory.py:112 write`, `:511 ingest_transcript` | n/a | **EXISTS (engine)** |
| propose/resolve finding | `memory.py:684 approve` (memory pages only) | none (grep `findings`: only a docstring word, `core/validate.py:6`) | **MISSING** (kit U3) |
| status | `memory.py:772 status`; `verify.py:35` freshness/links checks | `validate_bundle` (conformance, not freshness) | **PARTIAL (engine)** — wiki freshness MISSING (stale_after unimplemented) |

## 3. Delete list (engine capabilities serving no contract op)

| Target | Evidence | Why no op needs it | Call |
|---|---|---|---|
| `viz` + `infrastructure/web/` (server ~950 lines, explorer, components, sessions, assets) | `cli.py:184`; `web/server.py:928` | Headless-first mandate; no contract op renders HTML. ⚠️ Charter Scope lists a "read-only local dashboard" and ECS §6 plans the knowledge-first IA — this is the one genuine strategy-vs-mandate conflict | **Freeze now** (stop ECS §6 work); delete requires a charter revision decision |
| `watch` + `store/watcher.py` | `cli.py:179` | Long-poll daemon mode; control plane is invoked per-command; charter says no always-running daemon | **Delete** |
| `decay` (`application/decay.py`, `forget --mode decay`) | `decay.py:26 RecencyDecay` | Superseded by design: Merger flaw #5 fix is authority+validity projections, not recency heuristics | **Delete** |
| `merge` verb | `cli.py:167`; `memory.py:698` | Manual curation verb; no skill op; supersede-not-delete covers the policy | **Delete** |
| `import`/`export` + `store/import_export.py` | `cli.py:136–140` | Backup/restore covers durability; JSON transfer is migration surface no op calls | **Delete verbs**, keep archive machinery |
| `types` verb group (list/add/enable/remove/suggest) + `application/concept_types.py` | `cli.py:145–165` | Once knowledge types live in OKF bundles, memory-plane type declarations duplicate the wiki taxonomy; `record` needs only note/episode kinds | **Delete verb group**; keep internal type validation the store relies on |
| `sessions` verb | `cli.py:173`; `web/sessions.py` | Dashboard listing; `status` + provenance cover the contract need | **Fold into `status`** |
| `recall --engine navigation` + `store/navigation_search.py` | `cli.py:107–111` | Second recall engine over generated index.md rows; federated search is the discovery op | **Trim flag**; keep index.md generation (store hygiene, `verify` depends on it, `verify.py:96`) |
| MCP `memex_consolidate`, `memex_forget` | `mcp_server.py:220,249` | Consolidation is the only LLM op (CLI/cron path); forget is destructive human-admin. Agent-facing surface should mirror the 8 contract ops | **Drop from MCP**, keep CLI |
| Marketplace pack scaffolds (copilot instructions/workflow, claude agents) | `marketplace/copilot/`, `installer.py:335–348` | ECS §7: scaffolds return as APM packages; **hook wiring must stay** (`installer.py:237–239` session-start/prompt/transcript) | Keep installers (capture blood supply); migrate pack assets to APM (WS5) |

**Kept despite looking trimmable:** `consolidate` (becomes the findings *proposer*, ECS §4), `verify` (deterministic gate), `backup/restore`, `rebuild-index`, `approve`, `episode_enrichment` (opt-in, feeds provenance).

## 4. Over-trim risks (charter invariants that must survive)

| Invariant | Charter ref | Enforced today at | Trim risk |
|---|---|---|---|
| Fail-open hooks | Principle 6 | `cli.py:518–522` (`_build_hook_injection` swallows ValueError → inject nothing, exit 0); `mcp_server.py:68–88` sanitized errors | High if hooks rewire onto `compile` — the rewire must keep the try/except |
| Provenance | Principle 7 | `transcript_hook.py:47–80` (raw transcripts + `transcript_ref`); `mcp_server.py:272` provenance tool; untrusted-evidence labeling `task_recall.py:30` | `record` op must keep transcript linking; don't drop `memex_provenance` |
| Approval flow | Principle 5, Merger T4 | `consolidator.py:311–326` (`knowledge_approval` policy; drafts always pending); `memory.py:684 approve`; forgery guard `memory.py:667–682` | Findings flow must land before any LLM-authored wiki write; never trim to direct `stable` writes |
| Deterministic checks | Principle 5 | `verify.py:35–118` (parse/fresh/links); kit `validate_bundle`; `context.py` determinism (BFS + alphabetical) | `verify` stays the CI gate; compiler must stay pure/deterministic |
| Local-first, no daemon | Scope (exclusions) | `web/server.py:928` on-demand only; SQLite disposable (`rebuild-index`, `verify.py:62` index-fresh) | Deleting `watch` *strengthens* this; don't add background indexing to federation |
| Files are truth | Principle 1–2 | Markdown store (`wiki_store.py`), kit bundle files; SQLite rebuildable | Federated index must stay disposable — authority in `<repo>/wiki/` + `~/.memex` files only |
| Budget honesty | Merger flaw #4 | `task_recall.py:100` envelope check; `context.py:63–75` omission marker | Current kit marker is silent-truncate-with-note, NOT `CONTEXT_INSUFFICIENT` — U4 must land before `compile` is trusted |

## 5. Post-trim API surface

**CLI (14 verbs):** `resolve` · `wiki init|update|status` · `search` (federated, `--source wiki|memory|both`) · `context compile|show` (already named in ECS §8) · `write` · `ingest-transcript` · `findings list|propose|accept|decline` · `approve` · `verify` · `rebuild-index` · `backup`/`restore` · `install`/`uninstall` · `hook session-start|prompt|transcript` (rewired onto search/compile) · `serve-mcp` · `info` (fold into `resolve`). Removed: `watch`, `viz`, `sessions`, `import`, `export`, `merge`, `types *`, `forget --mode decay`, `recall --engine navigation`, `clear-transcripts` (admin, kept out of contract docs only).

**MCP (8 tools):** `memex_resolve` · `memex_search` · `memex_compile_context` · `memex_record` (write) · `memex_propose_finding` · `memex_resolve_finding` · `memex_status` · `memex_provenance`. Dropped: `memex_consolidate`, `memex_forget`. Kit MCP's 5 tools stay kit-internal (bundle authoring); the control plane wraps, not duplicates, them.

## Ranked action list

1. **Build the bridge (biggest gap):** engine project registry mapping repo→bundle + federated search over bundle concepts + memories (U6/ECS §2). Everything else composes on it.
2. **Land kit U1→U4** in plan order (`Kit_Wiki_Engine_Plan.md` §C) — findings (U3) and compiler manifest/insufficiency (U4) are prerequisites for contract ops 5 and 7.
3. **Freeze the UI workstream** (ECS §6/WS4) — headless first; revisit only after the 8 ops exist. Escalate the charter dashboard line to a decision.
4. **Execute the delete list** (watch, decay, merge, import/export, types verbs, sessions fold, navigation recall engine) — each is self-contained, none touches the invariants.
5. **Rewire `hook session-start/prompt` internals onto `search`/`compile`**, preserving the fail-open envelope (`cli.py:518–522`).
6. **Trim MCP to the 8 contract tools + provenance**; move consolidate/forget to CLI-only.

---