---
kind: bug
slug: documentation-consolidation
title: Markdown handoff omitted the executable specpack
status: draft
created: 2026-10-10
repo_head: 88bd171
---

# Missing specpack correction

## Reproduction and evidence

The documentation repair produced analysis, design, plan, and verification files
but no `documentation-consolidation.json`. `do where` therefore could not track
it. This was an agent workflow error, explicitly documented in the original
wiki initiative page, rather than a successful machine handoff.

Implementation-supported sources: `treadle/packages/cli/src/harness/where.ts:109`;
`treadle/packages/cli/src/commands/do.ts:257`; the prior commit `88bd171`.

## Hypotheses

| ID | Hypothesis | Evidence | Disposition |
| --- | --- | --- | --- |
| H1 | JSON creation failed in the engine. | No `do init` invocation was made in the repair. A fresh invocation now creates the pack successfully. | Eliminated for this omission |
| H2 | The agent followed a prose handoff without creating machine work state. | The analysis, plan, implement, and review skills describe Markdown handoffs but omit an explicit machine-registration step. The agent also chose a prose-only exception. | Confirmed workflow cause |
| H3 | Pi automatically creates packs. | Existing packs identify Pi actors, but that does not establish automatic creation. | Unknown; not needed for the fix |

## Bounded correction — R7

Create the missing pack through `do init`. Backfill requirements, proposed
decisions, task dependencies, artifact references, and actual re-verification
evidence through the core writer and admission functions. Preserve the original
analysis and observations. No approval or closure is fabricated.

Update the four shipped SDD skills with explicit machine handoffs and sync the
project Pi/Codex copies through the installer. Markdown remains explanatory;
the JSON pack owns tasks, evidence, and derived stage. Analysis-only requests
do not authorize implementation or owner approval.

## Verification

The loader admits the pack; alignment has zero violations; `do where` discovers
it. Original protected records remain unchanged. Task evidence identifies the
current agent and current command exits. Human approval and closure fields remain
absent. Skills validate, and installed copies match shipped files.

The known `where.test.ts` failure stays explicit: creating this pack must not
reopen the closed `install-paths` pack to satisfy its test assumption.

## Out of scope and uncertainty

No runtime or schema changes; no automatic skill-behavior enforcement; no historical
command timestamps invented. Pi's earlier operational context was not reconstructed.

## Handoff

- **Ready now:** R7 machine-record backfill and narrow skill handoff correction.
- **Blocked on:** No correction task; approval and closure remain owner acts.
- **Next step:** Register T5 alongside the four prior documentation tasks and verify
  the corrected machine handoff.
