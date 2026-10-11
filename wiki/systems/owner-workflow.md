---
title: "Owner approval and completion workflow"
type: System
description: "Implemented specpack 0.4 gates, browser actions, durable receipts and legacy compatibility."
status: stable
created: 2026-10-10
updated: 2026-10-11
sources:
  - {id: core, resource: treadle/packages/core/src/specpack/workflow.ts}
  - {id: web, resource: treadle/packages/web/src/servers.ts}
  - {id: cli, resource: treadle/packages/cli/src/commands/do.ts}
  - {id: audit, resource: treadle/packages/core/src/specpack/audit.ts}
---

# The implemented flow

New SDD skills create `specpack/0.4` with `do init --owner-gated`.
The CLI default remains 0.3 for compatibility.
Sources: `treadle/packages/cli/src/commands/do.ts:1`;
`treadle/packages/cli/harness/skills/sdlc/analyze/SKILL.md:1`.

| Step | Recorded authority |
| --- | --- |
| Requirement and brief | Authored requirement, purpose and bounded scope |
| Spec questions | Explicit phase membership; real human answers and spec approval when questions exist |
| Design decisions | Each proposed decision needs acceptance; rejected required choices block their tasks |
| Task plan | Complete task preview with dependencies and declared checks |
| Start implementation | Separate human receipt for the current plan digest |
| Implementation | One admitted task at a time; actual check command and exit evidence |
| Independent review | Current PACK PASS with a separate reviewer and matching plan and evidence digests |
| Finish spec | Separate human completion action; the record becomes frozen |

The engine checks these gates before execution and task evidence admission.
An empty spec question list skips the question approval ceremony.
Decision acceptance does not give permission to start.
A changed plan needs new start permission.
Sources: `treadle/packages/core/src/specpack/workflow.ts:1`;
`treadle/packages/core/src/specpack/next.ts:1`;
`treadle/packages/core/src/specpack/record.ts:1`.

The plan digest includes definitions, dependencies, checks, context paths
and the actual brief, spec, design and plan file contents.
It excludes status, evidence, owner answers, revisions and audit progress.
The start receipt therefore survives successful task records.
It does not survive a change to the agreed work.
Source: `treadle/packages/core/src/specpack/workflow.ts:1`.

# Browser and command-line actions

The library shows the nine owner steps and the current wait state.
The owner can accept or reject decisions, start implementation, and finish the spec.
Finish spec requires a separate confirmation.
The phase inspector remains a navigation surface.
Source: `treadle/packages/web/src/library.js:1`.

The workflow endpoint reports eligibility and admits separate owner actions.
Each write reloads the pack under the shared lock and checks its held revision.
The room also sends its revision for question answers.
Sources: `treadle/packages/web/src/servers.ts:1`;
`treadle/packages/web/src/page.js:1`;
`treadle/packages/core/src/specpack/transaction.ts:1`.

The pack saves each owner receipt before the separate workflow journal.
A failed audit append leaves a pending entry in the canonical pack.
Recovery matches event ids and preserves complete records.
It clears pending entries after durable append, without repeating consent.
Sources: `treadle/packages/core/src/specpack/save.ts:1`;
`treadle/packages/core/src/specpack/audit.ts:1`.

# Versions and limits

Formats 0.2 and 0.3 retain their original contracts and golden bytes.
They do not acquire the new start gate automatically.
Active legacy packs can adopt through a separate owner action.
Adoption saves their exact prior JSON. Closed packs cannot adopt.
Source: `treadle/packages/cli/src/commands/do.ts:1`.

The separate [0.4 schema](/assets/contracts/specpack-owner-workflow.schema.json)
describes the new shape. The original schema remains preserved.
The conformance corpus contains six new owner phase witnesses beside the old cases.
Source: `treadle/conformance/generators/gen_corpus.ts:1`.

The plan receipt does not replace existing source pins.
Source freshness redesign remains separate work.
See [status vocabulary](/domain/specpack-status-vocabulary.md),
[the initiative](/initiatives/spec-completion-handoff.md), and
[open work](/project/open-work.md).


# Feedback and owner authority — observed 2026-10-11

The Feedback tab reviews selected documents or code diffs. Save draft retains a
comment in the feedback ledger; Submit makes a stable batch available to
an active agent. Agent replies and published rounds preserve the original source
and discussion. Human Resolve records inspection; stale comments need explicit
human Reattach and Submit to reach the agent against the newer source.
Sources: `treadle/packages/core/src/feedback/store.ts:615`;
`treadle/packages/web/src/project-server.ts:255`.

Feedback uses a separate revision and `feedback/1` ledger. Its browser endpoints
admit only comment, submit, resolve and reattach. Agents use open, read, wait,
reply and round through the CLI. Feedback does not answer spec questions, accept
design decisions, grant Start permission, record PACK review or Finish the spec.
The existing owner controls and plan/evidence digest gates remain authoritative.
A browser Start action records permission; it does not wake an idle coding agent.
Sources: `treadle/packages/web/src/project-server.ts:319`;
`treadle/packages/cli/src/commands/feedback.ts:195`;
`treadle/packages/core/src/specpack/workflow.ts:1`.

Read the [browser feedback initiative](/initiatives/browser-agent-feedback.md)
for actual native-host witnesses and the explicit remaining manual-test exception.
That test exception is not a fabricated Resolve event or owner completion action.
