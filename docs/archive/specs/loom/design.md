# Loom — the loop engine (design)

- **Status:** L0 built; L1–L3 pending. Spine for this initiative:
  `docs/specs/loom-engine/sdd.json`.
- **Decision basis:** owner directive 2026-10-08 ("like a Ralph loop with
  an SDD twist"; schema part of the harness and extendable; harness
  surfaces = codex, pi, claude; name = loom).

## What loom is

The execution engine of the harness. okf knows; loom does. One spine
file (sdd.json) is the machine authority for an initiative: nodes,
relations, task states, attempts, evidence. Markdown artifacts
(spec.md, plan.md, review.md) stay for humans; the spine refers to them
by role and section.

## Hard rules (from the research, now enforced by the machine)

1. M_run = M — a pass claim needs a recorded command with exit 0; a
   check that cannot run is FAIL, never PASS (MGD).
2. Severed backflow — every mutation is fenced by --expected-revision;
   a stale writer is refused (MGD).
3. Stall valve + root cause — two consecutive failed attempts BLOCK the
   task and name the upstream chain; a human unblocks (MGD's valve +
   SpecAgent's dependency tracing).
4. Piecemeal growth — loom next hands out exactly one task with a
   frozen, digested context (MGD context freezing; EPIC E3).
5. Extensions, not forks — the spine schema is versioned
   (https://schemas.example.org/loom/0.1.0/spine.schema.json, derived
   from docs/product/Harness.schema.json; enums and formats aligned)
   with namespaced extension envelopes; core rejects unknown keys.
   Client differences ride profile: generic | pi | claude | codex.
6. Deterministic core, model edges — only the machine moves states;
   the worker records observed evidence and never edits verdicts.

## Decisions

| # | Decision | Status |
|---|---|---|
| D1 | Name: loom | ACCEPTED (owner, 2026-10-08) |
| D2 | Spine = one sdd.json per initiative; markdown referenced, not embedded | ACCEPTED (owner) |
| D3 | Profiles: generic, pi, claude, codex | ACCEPTED (owner set the surfaces) |
| D4 | Evidence levels: attested (L0, in-session) vs captured (L1, loom run) | ACCEPTED |
| D5 | Schema namespace is reserved-example until an org namespace is adopted (repo rule) | NOTED |

## Phases

- L0 (done): schema + machine + CLI (init/add/validate/next/record/
  status/selftest); 19 tests + selftest.
- L1: loom run — the Ralph loop; profiles invoke the surface CLI per
  task; captured evidence with output digests.
- L2: okf handshake — context pulls verified patterns from the wiki by
  structural similarity; findings-ledger hook for accepted rules.
- L3: skills retarget (implement speaks the protocol; review records
  ACCEPT/IMPROVE/REPLAN into the spine); dogfood on a real initiative.
