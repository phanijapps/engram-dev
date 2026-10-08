---
type: System
status: stable
created: 2026-10-08
updated: 2026-10-08
title: loom — the loop engine of the SDD harness
description: 'The execution engine: a schema-backed spine (sdd.json) is the machine authority, the deterministic state machine moves tasks, specpack 0.2 is the native format. Internal architecture, the task loop call graph, criticality tiers, and the dead code found.'
sources: [{ id: machine, resource: engine/loom/src/loom_kit/machine.py }, { id: spine, resource: engine/loom/src/loom_kit/spine.py }, { id: specpack, resource: engine/loom/src/loom_kit/specpack.py }]
tags: [system, loom, engine, architecture, call-graph, criticality]
---

# Overview

okf knows. loom does. loom runs one initiative as a loop: the spine
(`sdd.json` or a specpack) holds nodes, relations, task states, and
evidence. The machine owns every state move. The model works inside
the machine and proposes. [^l1]

**CLI surface** (entry `loom = loom_kit.cli:main`): `init`, `add`,
`validate`, `next`, `record`, `check`, `status`, `selftest`. Client
profiles: `generic`, `pi`, `claude`, `codex`. [^l2]

# Internal architecture — four modules, one authority

loom is small by design: 6 modules, about 1150 source lines. The
shape is a star around the spine. [^m1]

```
loom_kit/
  cli.py        thin dispatch: 8 commands            (425 LOC)
  spine.py      THE AUTHORITY: load, validate, save   CRITICAL (291)
                sdd.json schema + semantic invariants
                (MiniValidator, fail-closed, thread lock)
  machine.py    THE STATE MACHINE: add_node, promote, CRITICAL (322)
                next_task, compile_context, record
  specpack.py   specpack 0.2 native mode: load,       CORE     (318)
                validate, alignment A1-A6, next, record
  templates.py  three markdown stubs for init         PERIPHERAL (64)
  schemas/      spine.schema.json + specpack.schema.json  CRITICAL
```

**Import graph** (AST, 2026-10-08): `cli -> {machine, specpack,
templates, spine}`; `machine -> spine`; `specpack -> spine`. Nothing
imports `machine` or `specpack` except the CLI. The spine imports
nothing local except the package constants. [^m1]

**Why the star matters.** One writer protocol, one validation path.
Every mutation goes through `spine.save` under a thread lock, and
every load re-validates against the vendored schema. A corrupted spine
refuses to load. Fail-closed is the design rule. [^l3]

# The task loop — call paths

`loom next` is the whole loop in one call: [^t1]

```
cli cmd_next
  -> machine.next_task(doc)          machine.py:175
       -> promote(doc)               machine.py:129
            PENDING -> READY when all requires are SUCCEEDED
       -> pick first takeable task in node_id order:
            READY, or FAILED under the stall limit (2),
            or RUNNING with zero attempts (crash recovery)
       -> state = RUNNING, version += 1
       -> compile_context(doc, id)   machine.py:142
            walks the upstream chain (_upstream_chain)
            sha256 digest pins the frozen context
       -> spine.bump(doc) + save
  -> print task id + frozen context + digest
```

`loom record` closes the loop: [^t2]

```
cli cmd_record
  -> machine.record(doc, id, result, commands, revision, by)
       result: pass | fail | unblock | cancel
       pass   -> VERIFYING or SUCCEEDED; evidence row appended
       fail   -> attempts grow; 2 fails in a row -> BLOCKED
       unblock/cancel -> human decisions, logged
  -> spine.save
```

**Why takeable is defined this way.** Three states can re-enter the
loop: READY (never started), FAILED (retry allowed twice), and RUNNING
with zero attempts (a crashed worker; the context digest is already
pinned, so the resumed worker sees the same frozen context). [^t1]

# Two modes: legacy spine and native specpack

`specpack.load_specpack` refuses a directory that holds `sdd.json`:
the legacy spine takes precedence. Specpack mode has its own states
(`todo`, `doing`, `done`, `blocked`), its own alignment checks, and
its own `record` path in the CLI. [^s1]

The A checks, run by `loom check`: [^s2]

| Check | Meaning |
|---|---|
| A1 | ids unique across families |
| A2 | references resolve (needs, implements, satisfies, accepts, honors, addresses, resolves) |
| A3 | canonical family order |
| A4 | family shape (sorted, no dupes) |
| A5 | coverage report (requirements with no tasks, and like gaps) |
| A6 | canonical slice order |

Determinism rules for specpack: every reported list is sorted; slices
render canonically with sha256 digests; the only clock in the system
lives inside evidence rows the caller supplies. [^s1]

# Criticality register

| Module | Tier | Reason |
|---|---|---|
| `spine.py` + `schemas/spine.schema.json` | CRITICAL | Single load and save path. Fail-closed validation. Corrupt spine stops the loop by design. |
| `machine.py` | CRITICAL | The only code that moves task states. A defect here breaks the loop contract. |
| `schemas/specpack.schema.json` | CRITICAL | The native format contract. |
| `specpack.py` | CORE | The 0.2 native mode. A1 to A6 checks. |
| `cli.py` | CORE | Dispatch and profiles. Thin by design. |
| `templates.py` | PERIPHERAL | Three stub files for `loom init`. Referenced only at `cli.py:85`. |

# Dead code (found 2026-10-08)

**DEAD** — `persist()` at `machine.py:321`. A one-line wrapper over
`spine.save`. No caller in the package, the tests, the skills, or the
docs. Every caller uses `spine.save` directly. [^d1]

# Relationships

- [SDD harness — the top architecture](/systems/sdd-harness-architecture.md)
- [okf — the engine of the SDD harness](/systems/okf-engine.md) — the knowledge plane.
- [The anti-waterfall loop](/domain/pattern-anti-waterfall-loop.md) — the pattern loom enforces.
- `docs/specs/loom-l1/` — the initiative that made loom speak specpack natively.

# Evidence

[^l1]: `engine/loom/src/loom_kit/__init__.py` module docstring; `machine.py` docstrings (implementation-supported).
[^l2]: `engine/loom/src/loom_kit/cli.py` subparsers; `engine/loom/pyproject.toml` `[project.scripts]`; `__init__.py` PROFILES (observed).
[^l3]: `engine/loom/src/loom_kit/spine.py` — `_LOCK = threading.Lock()`, `save`, `load`, `MiniValidator` "FAIL-CLOSED" docstring (observed).
[^m1]: AST module graph over `engine/loom/src`, 2026-10-08 (observed).
[^t1]: `engine/loom/src/loom_kit/machine.py:175-226` `next_task` (implementation-supported).
[^t2]: `engine/loom/src/loom_kit/machine.py:229-306` `record`; stall limit logic `_fail_streak` at `:309` (implementation-supported).
[^s1]: `engine/loom/src/loom_kit/specpack.py:1-6` module docstring; `load_specpack` at `:37`; STATES and STALL_LIMIT at `:20-21` (observed).
[^s2]: `engine/loom/src/loom_kit/specpack.py` `alignment` at `:75` and its A1 to A5 branches; `cli.py` `cmd_check` help "A1-A6" (implementation-supported).
[^d1]: Definition at `engine/loom/src/loom_kit/machine.py:321`; package-wide and repo-wide grep for `persist` against loom returns the definition only (observed).
