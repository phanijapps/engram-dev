---
title: "SDD harness architecture"
type: System
description: "Current package boundaries, knowledge flow, work admission, and runtime limits."
status: stable
created: 2026-10-10
updated: 2026-10-11
sources:
  - { "id": "s1", "resource": "treadle/pnpm-workspace.yaml" }
  - { "id": "s2", "resource": "treadle/packages/core/src/specpack/derive.ts" }
  - {
      "id": "s3",
      "resource": "treadle/packages/core/src/specpack/admission.ts",
    }
  - { "id": "s4", "resource": "treadle/packages/core/src/specpack/record.ts" }
  - { "id": "s5", "resource": "treadle/packages/cli/src/harness/where.ts" }
  - { "id": "s6", "resource": "treadle/packages/knowledge/src/parse.ts" }
  - { id: service, resource: treadle/packages/cli/src/serve/runtime.ts }
  - { id: projects, resource: treadle/packages/web/src/project-server.ts }
  - { id: context, resource: treadle/packages/cli/src/harness/context.ts }
  - { id: planning, resource: treadle/packages/cli/harness/skills/sdlc/plan/SKILL.md }
  - { id: hook-paths, resource: treadle/packages/cli/src/harness/plan.ts }
  - { id: hook-guard, resource: treadle/packages/cli/harness/hooks/post-tool-check.js }
  - {
      id: owner,
      resource: specs/documentation-consolidation/owner-decision-revision.md,
    }
---

# Purpose and flow

The harness connects repository knowledge with evidence-based work.
The active runtime is the TypeScript workspace in `treadle/`.
Package membership is declared in `treadle/pnpm-workspace.yaml:1`.

```text
repository → wiki sources → know search/read → bounded analysis
analysis → design/task plan → specpack admission → evidence → review
observed session → wiki retrospective → proposed lessons
historical specpack → factual initiative snapshot
```

The owner rejected retrospective reconstruction from historical specpacks.
Source: `specs/documentation-consolidation/owner-decision-revision.md:1`, D-3.
Automatic retrospective capture is not implemented.
See [the lifecycle proposal](/project/documentation-lifecycle.md).

# Boundaries

`core` owns specpack normalization, stages, admission, evidence, and drift pins.
`knowledge` owns OKF concepts, links, validation, search, findings, and stamps.
`web` supplies the localhost room and library; `cli` exposes both planes.
`conformance` tests the golden corpus; `brand` holds naming configuration.
See [the active engine](/systems/treadle.md) for package source references.

Answers and approval require human-shaped claims.
Task evidence can identify an agent or human. These are caller claims,
not authentication. Sources: `treadle/packages/core/src/specpack/admission.ts:17`
and `treadle/packages/core/src/specpack/record.ts:19`.

Stages derive from recorded state. They are not manually maintained wiki fields.
Source: `treadle/packages/core/src/specpack/derive.ts:30`.
The CLI discovers packs under `specs/`, including registered worktrees.
Source: `treadle/packages/cli/src/harness/where.ts:109`.

# Knowledge limits

The bundle enumerates Markdown and parses its frontmatter.
It does not reconstruct a code graph or execute spec tasks.
Source: `treadle/packages/knowledge/src/parse.ts:123`.
External code indexing remains delegated. Current freshness limitations are
[documented separately](/domain/pattern-content-hash-change-detection.md).

# History

The prior Python architecture explanation is preserved at
`specs/archive/documentation/2026-10-10/wiki/systems/sdd-harness-architecture.md`.
The [TypeScript decision](/decisions/port-to-typescript.md) explains the transition.

# Shared background service — 2026-10-10

`start serve` detaches one service per operating-system user; `stop serve`
requests authenticated shutdown. Startup/recovery publishes owned directories
atomically and never expires a live lock. Project enrollment persists separately
from the process descriptor. Source: `treadle/packages/cli/src/serve/runtime.ts`
and `treadle/packages/cli/src/serve/projects.ts`.

```text
project install / session event
    → ensure shared service → enroll explicit event workspace
    → read-only context → choose new or continuing spec
shared browser → project → wiki/search + spec library → existing owner gates
stop serve → next session event → ensure + reconnect
session exit → service remains running
```

The browser lists enrolled roots and uses project-qualified library/wiki routes;
equal spec slugs in different roots stay separate. Missing/moved roots are
reported unavailable. It does not discover or enroll unrelated worktrees.
Source: `treadle/packages/web/src/project-server.ts`.

Context reports core workflow gates, doing work, evidence, refused packs and
non-admitted candidates. It does not grant approval or advance task state.
Freshness still has Python-only/HEAD limits; dirty TypeScript and Markdown
require direct inspection. Source: `treadle/packages/cli/src/harness/context.ts`.
Native artifacts and compatibility wiring come from one authoritative tree;
activation/trust remains a host action. Actual native OS/host release coverage
is tracked in `specs/background-harness/`, not inferred from a CI declaration.

# Planning views and portable Codex wiring — 2026-10-11

The plan skill selects Mermaid views for questions about boundaries, process branches,
interaction order, or delivery dependencies. C4 views stay at a stated abstraction level.
Flowchart notation provides a fallback when the target renderer lacks native C4 support.
The plan reports diagram validation limits and traces visual claims to the proposed design.
The canonical pack still owns task definitions and evidence; diagrams do not grant execution permission.
Source: `treadle/packages/cli/harness/skills/sdlc/plan/SKILL.md` and its `resources/diagrams.md`.

Project Codex compatibility hooks resolve the relative payload from the nearest ancestor
`.codex/hooks.json`, preserving the session directory and stdin. The generated commands
contain no absolute checkout path. Global hooks retain absolute payload locations.
The runtime pointer remains machine-local; moving the runtime needs reinstallation.
Native packaged hooks keep their plugin-root entry. Host trust and activation remain host actions.
Source: `treadle/packages/cli/src/harness/plan.ts` and
`treadle/packages/cli/harness/hooks/README.md`.

# Hook repairs — observed 2026-10-11

Project Claude callbacks now resolve their relative payload from the nearest ancestor `.claude/settings.json`.
They preserve event stdin and the session directory after checkout relocation.
The installer records current lifecycle callbacks and their companion helper.
Legacy manual callbacks need exact ownership reconciliation before replacement to avoid duplicate events.
Source: `treadle/packages/cli/src/harness/plan.ts` and `treadle/packages/cli/harness/hooks/README.md`.

The machine-managed guard covers corpus `expected.*` witness files as well as legacy generated directories.
Pi checks these paths before a write; reads remain permitted.
Claude PostToolUse consumes stdin and supplies advisory context after the completed call.
Source: `treadle/packages/cli/harness/hooks/post-tool-check.js`.

The context bridge uses the exact event directory as the workspace.
Sessions below the repository root look for their own wiki and specs directories.
Use a repository-root session for the canonical knowledge and work context.
Source: `treadle/packages/cli/harness/hooks/codex-context.js`.


# Browser feedback plane — observed 2026-10-11

The local library supports selected Markdown documents and Git diffs for active
owner-gated packs. The CLI snapshots explicit targets; the browser submits review
comments; an active agent reads batches, replies and publishes another round.
The feedback skill is installed for Claude, Codex and Pi from the canonical harness.
Sources: `treadle/packages/cli/src/commands/feedback.ts:195`;
`treadle/packages/cli/harness/skills/sdlc/feedback/SKILL.md:1`.

| Provider | Consumer | Exchanged contract |
| --- | --- | --- |
| CLI snapshot builder | Core feedback store | Explicit document targets or Git before/after bytes, selection and hashes |
| Core feedback store | Project-qualified web API | `feedback/1` state, immutable snapshots, revision and operation receipts |
| Human browser | Core feedback store | Draft comment, Submit batch, Resolve or Reattach with held feedback revision |
| Core read API | Active agent CLI | `feedback-result/1`, session cursor and stable submitted batch IDs |
| Lifecycle context | Claude, Codex and Pi | Bounded session IDs and counts; comment bodies stay in explicit feedback reads |

Sources: `treadle/packages/cli/src/harness/feedback-snapshot.ts:134`;
`treadle/packages/core/src/feedback/model.ts:1`;
`treadle/packages/web/src/project-server.ts:255`;
`treadle/packages/cli/src/harness/context.ts:15`.

Within a spec directory, `feedback/state.json` stores sessions, threads, batches
and operation receipts. `feedback/rounds/` stores immutable selected source bytes.
A session fixes its selection; each round records hashes for before/after targets.
A thread retains its original anchor and subsequent reattachment, resolution and
reply history. Submit seals a round and assigns a stable batch cursor. Repeated
reads do not consume batches. Identical operation retries return the original
receipt; changed payloads and stale revisions conflict under the shared writer lock.
Sources: `treadle/packages/core/src/feedback/model.ts:42`;
`treadle/packages/core/src/feedback/store.ts:615`.

Limits are 32 targets, 256 KiB per file, 4 MiB per round and ledger, 20 rounds
per session, 8 KiB per body and 84 MiB total storage. The snapshot builder uses
Git object reads and direct worktree bytes with no external diff, text converter,
clean/smudge filter or lazy network fetch. Credential/state paths, symlinks and
binary content are refused. The localhost API retains origin, path, role and
revision guards; actor strings record claims rather than authenticate people.
Sources: `treadle/packages/core/src/feedback/model.ts:1`;
`treadle/packages/core/src/feedback/store.ts:76`;
`treadle/packages/cli/src/harness/feedback-snapshot.ts:44`;
`treadle/packages/cli/src/harness/feedback-snapshot.ts:80`;
`treadle/packages/web/src/project-server.ts:42`.

The browser does not launch or wake an idle coding agent. An active CLI wait
checks for submitted batches for 1–60 seconds, or the agent reads them on a later
prompt. Context reports counts without recording sessions, transcripts or tokens.
A stale anchor needs human Reattach and Submit before redelivery. Worktree rounds
support iteration; a fixed `--head` keeps the committed after-side and a changed
head needs a new session. Closed packs retain read-only feedback history; legacy
packs do not adopt owner gates automatically.
Sources: `treadle/packages/cli/src/commands/feedback.ts:98`;
`treadle/packages/core/src/feedback/store.ts:125`;
`treadle/packages/core/src/feedback/store.ts:754`;
`treadle/packages/cli/harness/skills/sdlc/feedback/resources/protocol.md:1`.

See [browser feedback evidence and chronology](/initiatives/browser-agent-feedback.md)
and [owner authority](/systems/owner-workflow.md). Canonical specpacks retain
execution state; this page does not become a second task ledger.
