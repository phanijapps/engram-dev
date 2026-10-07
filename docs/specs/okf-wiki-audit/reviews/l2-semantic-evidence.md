# Review — LEVEL 2 semantic/evidence review of `wiki/` vs source

> Fresh-context read-only reviewer (run 4785fc5b), 2026-10-07, repo @ HEAD 660ac42+.
> Recovered from the run's output log after an empty completion notification;
> content is the reviewer's unedited final report. Parent synthesis in ../gap-1.md.

**Counting integrity (mission 2) — reconciled exactly, no bug:** 95 = total `*.md` under `wiki/` (83 `wiki/code/**` + 5 `code-summaries` + 4 `systems` + 1 `decisions` + 1 `domain` + 1 `index.md`). 94 = resolve's `concept_count` = same set minus `index.md` (excluded by `resolve.py:78-81` `md.name not in {"index.md","log.md"}`). 83 = managed code concepts the indexer wrote/updated (`last-index.json: "updated": 83, "written": 0`). All three are correct under their own rules.

**Spot-checks passed (mission 1):** 12 concepts verified against HEAD across all four planes — core `cli.py.md`/`search.py.md`/`record.py.md`, memex `memory.py.md`/`cli.py.md`/`wiki_store` imports, okf `indexer.py.md`, eval `weighted_retriever.py.md`/`candidates.py.md`. Every symbol name, line range (`record_note 11-47`, `Memex 56-783`, `main 383-390`, `federated_search 101-125`…), import list, and "used by" edge matched source exactly. Curated page line citations all exact: `knowledge.py:43,79`, `search.py:36,60`, `compile_context.py:14`, `status.py:17,33`, `record.py:28`, `resolve.py:18,70`; versions memex-core 0.1.0 / memex 0.5.0 / okf-kit 0.1.0 all match pyprojects; okf CLI verbs match `cli.py`; `__init__.py` exports match; findings declined-guard exists (`findings.py:119`); `one-engine-strangler.md` correctly runs the draft/pending-finding flow it describes (matches `findings.toml`).

### Findings

1. **[major]** Renderer emits malformed, nonexistent dependency symbols for every parenthesized multi-line import — systematic across ≥21 pages. Evidence: `wiki/code/engine/memex/memex/application/memory.py.md:55,67-68` shows `memex.application.compiler.( assemble_task_recall` and bare `memex.domain.models.)` vs `engine/memex/memex/application/memory.py:351` (`from memex.application.compiler import (`); same at `wiki/code/engine/memex/eval/weighted_retriever.py.md:41` vs `eval/weighted_retriever.py:12-13`, `wiki/code/engine/core/src/memex_core/__init__.py.md:32`, and even the front-matter `description` of `wiki/code-summaries/repository.md:4-6`. Why: these names don't exist, poison search/impact edges, and leak into searchable front matter. Close: fix import-name extraction in `okf_kit/code/treesitter` (skip `(`/`)` tokens, use `dotted_name` inside `import_from` clause) and re-run `wiki update`.

2. **[major]** `domain/wiki-contract.md:65` cites a stamp that no longer exists: "live stamp from this rebuild: `repo_head 39bad0f…`, 70 written / 0 updated / 0 skipped" vs actual `wiki/.okf/last-index.json` (`repo_head 660ac42…`, 0 written / 83 updated / 0 skipped). The page's own evidence section is falsified by the live file it cites; the "70" count is stale. Close: restate as pointer ("see stamp file") instead of restating volatile values, or regenerate the citation.

3. **[major]** `systems/memex.md:24` lists "web server" among current `memex/infrastructure` adapters — falsified: `engine/memex/memex/infrastructure/web/` contains only stale `__pycache__/`; the module was cut in Lean_Control_Plane_Review P1 (doc line 83). Close: delete "web server" from the adapter list.

4. **[minor]** Stale HEAD pins: `systems/one-engine.md:28` ("verified at repo HEAD 39bad0f") and `systems/okf-kit.md:66` ("produced … at repo HEAD 39bad0f") vs current stamp HEAD `660ac42`. Revision-pinning is right discipline but now silently outdated. Close: update pins after each index, or add "as of" qualifier.

5. **[minor]** `systems/one-engine.md:43-45` cites "graphify per-package extracts" — `graphify-out/` is gitignored and absent from the repo (unverifiable episode memory stated as fact), and its fallback citation "`engine/core/pyproject.toml` L1" is wrong: L1 is `[build-system]`; the dep edge is L10-13. Close: cite L10-13; drop or mark the graphify reference as local-artifact.

6. **[minor]** Coverage (mission 3): managed tree is complete for non-test Python (83/83 across core/memex/okf — no missing modules, no dangling concepts), but nothing covers `docs/product/**` (the normative spec corpus), `skills/**`, root `AGENTS.md`/`pyproject.toml`, or `engine/okf/tests/fixtures/wiki/**` (the OKF 0.2 migration fixture); all ~90 test files excluded by the `include_tests=False` default — a design choice declared in `knowledge.py` docstring but never stated on any wiki page. Close: state the exclusion + scope on `code-summaries/repository.md`; curate concepts for the spec docs.

7. **[minor]** Evidence-status discipline (mission 5): no curated page (`systems/*`, `domain/wiki-contract.md`) tags claims with the repo's own declared/implementation-supported/inferred/unknown taxonomy (AGENTS.md "Evidence discipline"); they assert bare facts with citations. The "# Evidence" sections help, but status is implicit. Close: add per-claim status, at least in Relationships.

8. **[nit]** Counting rules undocumented where numbers surface: 94 vs 83 vs 95 each computed by different rules (resolve.py:78-81 vs indexer stamp vs raw file count); no page explains the difference, which is exactly what triggered the parent's discrepancy. Close: document the three counting rules on `wiki-contract.md`.

9. **[nit]** `systems/memex.md:31-33` verb list omits `clear-transcripts` (`engine/memex/memex/cli.py:116`); 15 verbs exist, 14 listed.

10. **[nit]** `domain/wiki-contract.md:63` cites `validate.py:26-31` for front-matter key rules; the frozenset actually spans `validate.py:25-29` (cited range covers it but starts one line late).

**Verdict:** Generated per-module concepts are semantically accurate (symbols, lines, imports, edges all verified), but the renderer's parenthesized-import bug pollutes ≥21 pages and two curated pages carry now-falsified claims (stale stamp, dead "web server").

Merge verdict: OK with notes — findings 1-3 should be fixed before this wiki is trusted as grounding for agents; all fixes are small (renderer token filter + two curated-page edits + reindex).
