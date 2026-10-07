---
type: System
title: okf-kit — the knowledge plane
description: 'engine/okf (package okf-kit v0.1.0): Open Knowledge Format bundle machinery - parse/model/links/index/search/validate/context - plus the tree-sitter code indexer that writes managed wiki/code concepts.'
tags: [knowledge, okf, package, engine-okf, tree-sitter]
---

# Overview

`engine/okf` ships `okf-kit` (v0.1.0) — "Open Knowledge Format (OKF): bundle
machinery and CLI (knowledge plane internals)" (`engine/okf/pyproject.toml`).
An OKF bundle is a directory of Markdown concepts with YAML front matter,
root `index.md` carrying `okf_version`; this wiki is one such bundle
(`okf_version: '0.2'`).

Two subsystems:

- **Bundle core** (`okf_kit/core/`): `parse` (front-matter split), `model`
  (`Concept`), `links`, `index` (regenerate per-directory `index.md`),
  `search` (full-text), `validate` (SPEC §9 conformance — errors for
  missing/invalid front matter, warnings for missing recommended fields and
  broken internal links), `context`.
- **Code indexer** (`okf_kit/code/`): tree-sitter extraction of modules,
  symbols, imports, and dependency edges into **managed** concepts under
  `wiki/code/**` (modules) and `wiki/code-summaries/**` (repository, area,
  package summaries — the indexer is workspace-aware via
  `code/discovery.py:WorkspaceRepo/discover_repositories`). Managed bodies
  are fenced by `<!-- okf-code:start/end -->` markers
  (`code/managed.py:split_generated/merge_managed`); narrative outside the
  markers is preserved. Re-runs are fingerprint-safe: unchanged sources are
  not rewritten (`source_hash` in each managed concept's front matter).

CLI: `okf` — bundle tooling for wiki maintainers and CI: `init`, `new`,
`validate`, `search`, `read`, `index regen`, `code index`.

# Relationships

- **Fronted by core**: `wiki init/update`, `search`, `resolve`, and `status`
  call this plane's APIs — `okf_kit.core.templates.init_bundle`
  (`engine/core/src/memex_core/knowledge.py:43`),
  `okf_kit.code.indexer.index_codebase` (`knowledge.py:79`),
  `okf_kit.core.search` (`engine/core/src/memex_core/search.py:60`),
  `okf_kit.core.parse.split_frontmatter` (`resolve.py:70`),
  `okf_kit.core.validate.validate_bundle` (`status.py:33`).
- **Source of the wiki format**: the OKF concept/front-matter rules this
  package's validator enforces are the same rules every hand-written concept
  in this wiki follows — see [wiki-contract](/domain/wiki-contract.md).
- **Spec lineage**: vendored frozen OKF v0.2 reference at
  `docs/product/OKF_SPEC_v0.2.md` (Apache-2.0, source
  GoogleCloudPlatform/knowledge-catalog); upgrade plan U1–U6 in
  `docs/product/Kit_Wiki_Engine_Plan.md`; history remote `okfkit` points at
  the absorbed `phanijapps/okf-kit@main` tree.

# Evidence

- `engine/okf/pyproject.toml` — deps `pyyaml>=6.0`, `pydantic>=2.0`;
  tree-sitter optional extra (the indexer's only heavy dep);
  `[project.scripts] okf = "okf_kit.cli:main"`; import package `okf_kit`.
- `engine/okf/okf_kit/core/validate.py` — the conformance checks described
  above (`_KNOWN_FRONTMATTER_KEYS`, `_RECOMMENDED_WARN_FIELDS=("title",
  "description")`, `broken_links`).
- `engine/okf/okf_kit/code/indexer.py` — `index_codebase`,
  `extract_module`; `code/managed.py` — managed-section merge/split.
- This wiki's own generated tree: [code/](/code/engine/core/src/memex_core/knowledge.py.md)
  and [code-summaries/](/code-summaries/repository.md) produced by that
  indexer at repo HEAD 39bad0f.
- [okf package summary](/code-summaries/packages/engine/okf.md).
