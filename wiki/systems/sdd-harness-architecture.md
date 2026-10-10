---
type: System
status: stable
created: 2026-10-08
updated: 2026-10-08
title: "SDD harness: the top architecture"
description: "How the parts compose: okf knows, loom does, the five skills integrate, the wiki remembers. Includes the repo criticality map and the dead code register."
# sources: retired with the python engines — evidence preserved at git tag python-final
tags: [system, architecture, criticality, harness, call-graph]
---

# Overview

> **Ported (2026-10-10):** treadle now hosts both planes natively; the
> python engines teach and witness — see [treadle](treadle.md) and the
> [port decision](../decisions/port-to-typescript.md).

The harness has four parts. Each part owns one job and no other part
does that job. [^p1]

| Part        | Job                                                                            | Location       |
| ----------- | ------------------------------------------------------------------------------ | -------------- |
| **treadle** | Do and know, in one strict-TypeScript harness — the ACTIVE engine.             | `treadle/`     |
| **okf**     | Know (python). RETIRED at `python-final`; witness lives in the corpus goldens. | git history    |
| **loom**    | Do (python). RETIRED at `python-final`.                                        | git history    |
| **Skills**  | Integrate. Drive both engines from the agent side.                             | `skills/sdlc/` |
| **Wiki**    | Remember. The shared knowledge state, in git.                                  | `wiki/`        |

# The two data planes

The harness keeps two flows apart on purpose. One plane builds
knowledge. The other plane executes work. Each plane has its own
engine, its own file format, and its own trust rule.

```
KNOWLEDGE PLANE (okf)                 EXECUTION PLANE (loom)
repository source code                intent, specs, questions
        |                                      |
  okf code index                          loom add
  (tree-sitter, AST)                     (spine nodes)
        |                                      |
  wiki/code/** concepts                sdd.json spine
  fingerprints, anchors                      |
        |                             loom next  -> one frozen task
  curated pages                          |            |
  (systems, domain,                    worker        loom record
   decisions, research)                  |             |
        |                            evidence rows <---+
  okf status: fresh?                  state moves only in the engines
```

**Why the split matters.** Knowledge can be stale and the loop still
runs. The loop can be mid-task and the wiki can rebuild. No plane
blocks the other. The only bridge is the worker: the worker reads the
wiki, then works a loom task, then records evidence. [^p2]

# Composition, and one deliberate gap

The two engines share **no code**. `loom_kit` imports nothing from
`okf_kit`. `okf_kit` imports nothing from `loom_kit`. The merged code
graph (1756 nodes, 3775 links) has **zero cross-package edges**. [^p3]

The skills layer is the only integration point:

```
skills/sdlc/{build-kb, analyze, plan, implement, review}
     |                |
     v                v
 uv run okf ...   uv run loom ...
 (knowledge)      (execution)
```

**Why the gap matters.** Each engine can ship and version alone. A
target team can install okf without loom, or loom without okf. The
packaging promise in the fast-track decision needs this. [^p4]

Entry points: `okf = okf_kit.cli:main` and `loom = loom_kit.cli:main`.
Each is a thin dispatch over its library. [^p5]

# Criticality map

Tiers, one meaning per tier: **CRITICAL** breaks the harness if it is
wrong. **CORE** degrades a major capability if it is wrong.
**PERIPHERAL** hurts convenience only. **DEAD** is unreferenced and can
be deleted. **STALE-DOC** is a doc that names things that do not exist.

| Area                                                     | Tier       | Why                                                                                                                                                                      |
| -------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| okf `core.parse` + `core.links`                          | CRITICAL   | Every read and write of the bundle passes through them. Parse is imported by 8 modules, links by 9 of 27. [^p6]                                                          |
| okf `code.indexer`                                       | CRITICAL   | Owns the whole extraction pipeline. The CLI writes the freshness stamp after it returns.                                                                                 |
| okf `core.stamp` + `core.findings`                       | CRITICAL   | The trust contract: fresh check and the normative ledger.                                                                                                                |
| loom `machine.py`                                        | CRITICAL   | The deterministic spine-mode state machine. Only it moves spine task states; in specpack mode, `specpack.py` moves them.                                                 |
| loom `spine.py` + `spine.schema.json`                    | CRITICAL   | Single authority for `sdd.json`. Fail-closed load.                                                                                                                       |
| loom `specpack.schema.json`                              | CRITICAL   | The native format contract, validated by `specpack.py` at check time, not at load.                                                                                       |
| okf `core.{validate,search,context,fingerprints,status}` | CORE       | Health, retrieval, drift detection.                                                                                                                                      |
| okf `code.{discovery,render,semantic,treesitter.*}`      | CORE       | The extraction pipeline stages.                                                                                                                                          |
| loom `specpack.py`                                       | CORE       | The specpack 0.3 native mode: slice resolver, pin and rebase, decision ledger, pack lifecycle (needs_closure, close, freeze), alignment checks, and its own state moves. |
| okf `core.{templates,index}`, `code.{paths,managed}`     | PERIPHERAL | Scaffolding and layout helpers.                                                                                                                                          |
| loom `templates.py`                                      | PERIPHERAL | Used only by `loom init` (three markdown templates). [^p7]                                                                                                               |
| `language_help()` in okf                                 | DEAD       | Defined at `code/discovery.py:201`, referenced nowhere. See the okf page.                                                                                                |
| `persist()` in loom                                      | DEAD       | Defined at `machine.py:321`, referenced nowhere. See the loom page.                                                                                                      |
| MCP server mentions                                      | STALE-DOC  | `okf_kit/__init__.py:1-7`, `core/__init__.py:4`, and `AGENTS.md:32` name an `okf-mcp` server. No such module and no such entry point exist. [^p8]                        |
| `loom run` command                                       | STALE-DOC  | `AGENTS.md:33` listed a `loom run` command and omitted `check`. No `run` subcommand exists. Fixed with this change. [^p8]                                                |

No dead modules exist. Every module in both engines is reachable from
its CLI entry point. [^p3]

# Relationships

- [okf: the engine of the SDD harness](/systems/treadle.md): the knowledge engine, internals.
- [loom: the loop engine of the SDD harness](/systems/treadle.md): the execution engine, internals.
- [The wiki contract](/domain/wiki-contract.md): bundle rules.
- [Fast-tracking graph engineering](/decisions/graph-engineering-fast-track.md): the ratified purpose.

# Evidence

[^p1]: `pyproject.toml` workspace members; `uv run okf --help`; `uv run loom --help` (observed, 2026-10-08).

[^p2]: `skills/sdlc/implement/SKILL.md`: frozen context from loom, grounding in the wiki (implementation-supported).

[^p3]: AST module graph over both packages, 2026-10-08: import edges, reverse edges, CLI reachability. Cross-import grep returned empty both ways (observed). graphify merge: 1756 nodes, 3775 links, no cross-package links (observed).

[^p4]: `docs/specs/okf-only-engine/design.md`; `wiki/decisions/graph-engineering-fast-track.md` (implementation-supported).

[^p5]: the bin lives at `treadle/packages/cli/package.json` `bin` — one `treadle` entry, two pedals (observed, 2026-10-10).

[^p6]: AST import counts, 2026-10-08; cross-checked against `wiki/code/**` "Used by" sections (implementation-supported).

[^p7]: `treadle/packages/core/src/specpack/cli.ts`: templates used in `cmd_init` only (observed).

[^p8]: the CLI speaks `do` (init, add, next, record, answer, approve, reject, close, check, status, events, interview, library) and `know` (search, read, validate, links, findings, fingerprints, anchors, stamp, status); no `run` (observed, 2026-10-10).
