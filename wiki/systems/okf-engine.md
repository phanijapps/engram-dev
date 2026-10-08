---
type: System
status: stable
created: 2026-10-08
updated: 2026-10-08
title: okf — the engine of the SDD harness
description: 'The knowledge engine: repository in, anchored searchable knowledge out. Internal architecture in two layers, the module call graph, criticality tiers, and the dead code and stale docs found.'
sources: [{ id: src, resource: engine/okf/okf_kit/cli.py }, { id: indexer, resource: engine/okf/okf_kit/code/indexer.py }]
tags: [system, okf, engine, architecture, call-graph, criticality]
---

# Overview

okf turns a repository into an OKF bundle of anchored, searchable
knowledge. It gives agents the trust machinery that keeps that
knowledge honest: a freshness stamp, a findings ledger, fingerprints,
and anchor checks.

**CLI surface** (entry `okf = okf_kit.cli:main`): `init`, `new`,
`validate`, `search`, `read`, `index`, `code index`, `code rules`,
`status`, `findings`, `fingerprints`, `anchors`. [^c1]

# Internal architecture — two layers

The package splits into two layers with one rule between them:
`core` speaks Markdown bundles. `code` speaks source code. Nothing in
`core` imports from `code`. [^m1]

```
okf_kit/
  cli.py            thin dispatch: 11 commands -> library calls
  core/             BUNDLE MECHANICS (Markdown in, Markdown out)
    parse.py        frontmatter + body -> Concept        CRITICAL
    links.py        relative-link graph: resolve, backlinks CRITICAL
    model.py        Concept, Report value types            CRITICAL
    validate.py     OKF conformance checks
    search.py       full-text index + query
    context.py      progressive read (depth-based)
    index.py        per-directory index.md regeneration
    templates.py    init bundle, create concept from type
    findings.py     normative proposal ledger (.okf/findings.toml) CRITICAL
    fingerprints.py per-file sha256 map
    stamp.py        freshness stamp (.okf/last-index.json)   CRITICAL
    status.py       one screen: fresh, counts, findings, anchors
  code/             EXTRACTION PIPELINE (source in, concepts out)
    discovery.py    walk workspace, map languages to adapters
    treesitter/     parse: runtime + per-language adapters
    indexer.py      orchestrates extraction + summaries + stamp CRITICAL
    render.py       CodeModule and CodeSummary markdown writer
    semantic.py     rule-shaped candidates (guards, enums, TODOs)
    model.py        CodeModule value type
    paths.py        workspace-relative path mapping
    managed.py      managed-section markers (okf-code:start/end)
```

# Module call graph

Derived from AST imports, 2026-10-08. "in" counts importers inside the
package. Every module is reachable from the CLI. [^m2]

```
                    cli (in 0, root)
       _______________|_______________
      |         |          |         |
   validate   search    status    code index/rules
   (core)    (core)    (core)     (code pipeline)
      |         |         |            |
   parse(8)  parse     findings    indexer(2)
      |      links(9)  fingerprints  |    |
    links     model     stamp     discovery  semantic
                          |          |         |
                        validate  treesitter  runtime
                                  languages   languages
```

**The two hubs.** `core.parse` (in-degree 8) and `core.links`
(in-degree 9) sit on nearly every path. A defect in either breaks
validate, search, context, index, templates, and the whole extraction
pipeline. That is why they are CRITICAL. [^m2]

**The pipeline path** for `okf code index . wiki`:

1. `cli._cmd_code_index` calls `index_codebase` (`indexer.py:43`) and
   then writes the stamp (`stamp.py`). [^c2]
2. `index_codebase` calls `discovery` to find repositories and map
   languages to adapters.
3. `treesitter` parses each file. `semantic` scans rule shapes.
4. `render` writes `wiki/code/**` and `wiki/code-summaries/**` inside
   managed markers.
5. The stamp records `repo_head`. `okf status` compares it to HEAD.
   This comparison is the freshness contract. [^c1]

# Criticality register

| Module | Tier | Reason |
|---|---|---|
| `core.parse`, `core.links`, `core.model` | CRITICAL | Bundle read and write path. Highest fan-in. |
| `code.indexer` | CRITICAL | Pipeline owner. Writes concepts and triggers the stamp. |
| `core.stamp`, `core.findings` | CRITICAL | Trust contract: freshness and normative acceptance. |
| `core.validate`, `core.search`, `core.context`, `core.fingerprints`, `core.status` | CORE | Health, retrieval, drift detection. |
| `code.discovery`, `code.render`, `code.semantic`, `code.treesitter.*` | CORE | Pipeline stages. |
| `core.templates`, `core.index`, `code.paths`, `code.managed` | PERIPHERAL | Scaffolding and layout. |

# Dead code and stale docs (found 2026-10-08)

1. **DEAD** — `language_help()` at `code/discovery.py:201`. No caller
   in the package, the tests, the skills, or the docs. It was meant
   for CLI help. the CLI instead hardcodes the language list at
   `cli.py:154`. Two sources of truth: the adapter registry
   (`ADAPTERS`) and the hardcoded string. They can drift. [^d1]
2. **STALE-DOC** — `okf_kit/__init__.py:1` and `core/__init__.py:4`
   describe an `okf-mcp` server. `pyproject.toml` defines one script:
   `okf`. No mcp module exists. Same stale claim in `AGENTS.md:32`
   ("MCP and web views included"). [^d2]

# Non-goals

No hooks, no session or token capture. A future memex is a consumer
layer on top, never a plane inside. [^n1]

# Relationships

- [SDD harness — the top architecture](/systems/sdd-harness-architecture.md)
- [loom — the loop engine](/systems/loom-engine.md) — the other plane.
- [Okf-only engine](/decisions/okf-only-engine.md) — the accepted decision.
- [The wiki contract](/domain/wiki-contract.md) — bundle rules okf enforces.

# Evidence

[^c1]: `engine/okf/okf_kit/cli.py` `_dispatch`, `_cmd_*` handlers; `engine/okf/pyproject.toml` `[project.scripts]` (observed).
[^c2]: `engine/okf/okf_kit/cli.py` `_cmd_code_index` imports `index_codebase` and `write_freshness_stamp` (observed).
[^m1]: AST import scan, 2026-10-08: no `core.*` module imports `code.*` (observed).
[^m2]: AST module graph, 2026-10-08: in-degrees and CLI reachability, cross-checked with `wiki/code/**` "Used by" sections (implementation-supported).
[^d1]: Definition at `engine/okf/okf_kit/code/discovery.py:201`; package-wide and repo-wide grep for `language_help` returns the definition only (observed).
[^d2]: `engine/okf/okf_kit/__init__.py:1-7`; `engine/okf/okf_kit/core/__init__.py:4`; `engine/okf/pyproject.toml:41-42` (observed).
[^n1]: owner-declared non-goal, 2026-10-07 (declared); `wiki/domain/policy-no-session-capture-in-engine.md`.
