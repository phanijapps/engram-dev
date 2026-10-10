---
type: Domain
status: stable
created: 2026-10-08
updated: 2026-10-08
title: "The specpack status vocabulary: one table, machine-maintained"
description: "Every status a specpack carries or reports: level, statuses, who sets them, stored or reported, terminality. Complete packs are read-only reference for future loops."
# sources: retired with the python engines — evidence preserved at git tag python-final
tags: [contract, specpack, status, lifecycle, loom]
---

# Overview

Statuses are one machine-maintained vocabulary. One source of truth:
the constants in `specpack.py`, equal by guard test to the vendored
schema enums (`treadle/packages/core/src/schemas/`). A status
never arrives as a convention; it arrives as an enum extension plus a
guard plus a row in this table. [^s1]

The rule (owner directive, 2026-10-08): a complete pack is **read-only
reference**. Future loops query it (what was completed before, semantic
search over closed specs) but never rewrite it. The loop maintains
this: `status` is explicit from the first machine touch, and a frozen
pack's bytes do not move. [^s2]

# The table

Stored statuses live in the pack file. Reported statuses are transient
outputs of `loom next`; they are never stored.

| Level    | Statuses                                                                          | Stored or reported      | Who sets it                                             | Terminal                                                                     |
| -------- | --------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Pack     | `active`, `complete`                                                              | stored                  | machine (`complete` only via `loom close`, human-gated) | `complete` is final and frozen                                               |
| Task     | `todo`, `doing`, `done`, `blocked`                                                | stored                  | machine (`record`, `next`)                              | `done` per task; the pack may still need work                                |
| Decision | `proposed`, `accepted`, `rejected`                                                | stored                  | human claim via `loom accept` / `loom reject`           | accepted and rejected are history                                            |
| Question | `open`, `resolved`                                                                | stored                  | machine (resolved by an accepted decision)              | resolved is final                                                            |
| Verdict  | `PASS`, `IMPROVE`, `REPLAN`                                                       | stored (review section) | reviewer, recorded in the pack                          | append-only by convention (nothing rewrites verdicts; close requires a PASS) |
| Handout  | `task`, `DONE`, `BLOCKED`, `WAITING`, `needs_rebase`, `needs_closure`, `COMPLETE` | reported only           | machine (`loom next`)                                   | none: reports are per-run                                                    |

# Reading the lifecycle from statuses

```
pack active:  tasks todo -> doing -> done        (evidence each pass)
              next: task | needs_rebase | needs_closure | DONE
pack close:   human-gated; checks tasks, decisions, questions, review
pack complete: next reports COMPLETE; all writes refuse; bytes frozen
```

`DONE` and `COMPLETE` are not the same word for one thing. `DONE` is a
report: no work remains. `COMPLETE` is a stored state: the record is
closed and frozen. A pack can report `DONE` for weeks before an owner
closes it. [^s3]

# Spine mode is out of this table

The legacy spine (`sdd.json`) keeps its own state set
(`PENDING` through `SUCCEEDED`, uppercase). Specpack is the native
format; new statuses land here, not there. [^s4]

# Extending the vocabulary

Add a status in three moves, never two: extend the schema enum
(additive), add or update the constant and the guard, add the row
here. A status without all three is not a status. New meanings for
`complete` (indexes, search corpora, archival tiers) consume it; they
never redefine it.

# Relationships

- [loom: the loop engine of the SDD harness](/systems/treadle.md): the machine that maintains this table.
- [The wiki contract](/domain/wiki-contract.md): the bundle-side contract this mirrors.
- `docs/specs/status-vocabulary/specpack.json`: the initiative that installed the guard and closed itself under it.

# Evidence

[^s1]: `treadle/packages/core/src/specpack/specpack.ts` constants `PACK_STATUSES`, `TASK_STATUSES`, `DECISION_STATUSES`, `QUESTION_STATUSES`, `VERDICTS`, `HANDOUT_STATUSES`; the frozen status vocabulary is asserted across the core test suite (observed, 2026-10-10).

[^s2]: `load_specpack` materializes `status: active` when absent; `_next_specpack` skips the save for `COMPLETE` handouts (implementation-supported).

[^s3]: `treadle/packages/core/src/specpack/specpack.ts` `next_task` returns `DONE`; `close` sets `complete` (implementation-supported).

[^s4]: `treadle/packages/core/src/specpack/__init__.ts` `TASK_STATES` (observed).
