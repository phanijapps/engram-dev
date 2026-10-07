
> **SUPERSEDED 2026-10-07 (in part or whole):** the engine is now okf only — `engine/memex` and `engine/core` were removed; the one-engine direction was declined. See `wiki/decisions/okf-only-engine.md` and `docs/specs/okf-only-engine/`. This document is preserved for history.
# memex-core — the one-engine seed

**End goal: one engine.** This package is the unified control plane that
spans both planes today and absorbs them over time (strangler fig):

```
                ┌──────────── memex-core ────────────┐
   agents ────► │ resolve · wiki init/update ·       │
   skills  ───► │ search (federated) · compile ·     │
   CLI/MCP ───► │ record · findings · status         │
                └──────┬───────────────────┬─────────┘
                       ▼ delegates         ▼ delegates
          engine/memex (memory)     engine/okf (knowledge)
          memex v0.5.0              okf-kit (OKF)
```

**CLI front face:** `memex-core` is the porcelain — the surface agents,
skills, and users drive. The plane CLIs (`memex`, `okf`) are plumbing:
`memex` remains the deployed hook/capture surface adapters install today;
`okf` remains bundle tooling (validate/serve/read) for wiki maintainers and
CI. During migration their verbs fold into core; at the end core's binary
takes the `memex` name and the plumbing CLIs retire.

## The minimal shape (8 ops)

| Op | Delegates to | Status |
|---|---|---|
| `resolve(cwd)` | engine `workspace_context` + wiki convention `<repo>/wiki/` | full |
| `wiki_init(cwd)` | kit `templates.init_bundle` (OKF 0.2) + `.okf/` state dir | full |
| `wiki_update(cwd)` | kit `code.indexer.index_codebase` (tree-sitter, managed sections) + freshness stamp | full |
| `search(query, source)` | engine `recall` + kit `search`, origin-tagged, round-robin merged | full |
| `compile(questions, budget)` | federated search + engine `compiler` packing → context + manifest | full (minimal manifest) |
| `record(title, body)` | engine `write` | full |
| `findings propose/accept/decline` | `.okf/findings.toml` ledger (dedupe, never re-propose declined) | full (minimal) |
| `status` | engine `status` + kit `validate_bundle` + wiki freshness + pending findings | full |

## Conventions

- The project wiki is an **OKF bundle at `<repo>/wiki/`** — convention over
  registry (no mapping table to keep in sync).
- Memory store is `~/.memex` (or `--data-dir`); wiki is per-repo. Federation
  merges hit lists beside each engine's own index — neither index absorbs
  the other's rows.
- Findings ledger lives with the knowledge it governs:
  `<repo>/wiki/.okf/findings.toml`.
- `wiki_update` writes `<repo>/wiki/.okf/last-index.json`
  (`repo_head`, counts); `resolve` compares it to `git HEAD` →
  `fresh | stale | unknown`.
- Everything is local-first, files-as-truth, no daemon.

## Migration path to one engine

1. **Now:** core fronts engine + kit via their public APIs (this version).
2. **Next:** contract ops stabilize; MCP/CLI surface moves here; kit U1–U4
   (OKF 0.2, fingerprints, bindingness) land behind `wiki_update`.
3. **Then:** internals migrate inward — engine's store/search and kit's
   bundle machinery become `memex_core` internals; `engine/` and `kit/`
   shrink to compatibility shims, then vanish. The repo renames to
   **memex** and this package takes the `memex` name.

## Development

```bash
cd core && uv sync --extra dev && uv run pytest -q
uv run memex-core --help
```

Tests use isolated temporary stores and bundles only — the developer's real
`~/.memex` is never touched.
