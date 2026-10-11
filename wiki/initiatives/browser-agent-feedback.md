---
title: "Browser feedback for coding agents"
type: Initiative
description: "Local document and Git diff review, explicit native agent delivery, preserved owner authority and observed verification limits."
status: stable
created: 2026-10-11
updated: 2026-10-11
sources:
  - { id: scope, resource: specs/browser-agent-feedback/spec.md }
  - { id: design, resource: specs/browser-agent-feedback/design.md }
  - { id: record, resource: specs/browser-agent-feedback/browser-agent-feedback.json }
  - { id: history, resource: specs/browser-agent-feedback/execution-log.md }
  - { id: native, resource: specs/browser-agent-feedback/implementation-review-native.md }
  - { id: waiver, resource: specs/browser-agent-feedback/checks/native-owner-test-waiver.json }
  - { id: store, resource: treadle/packages/core/src/feedback/store.ts }
  - { id: cli, resource: treadle/packages/cli/src/commands/feedback.ts }
---

# Product scope and current use

The owner chose browser review of plans, documents and code diffs, with comments
followed by coding-agent revisions, inside Wukong's existing local web app.
Crit supplied the reference interaction. The approved scope and design remain in
`specs/browser-agent-feedback/spec.md:1` and `design.md:1`. The canonical JSON
owns current task state, review and completion; this page explains the capability.

An agent opens an explicitly selected document or Git diff session through
`do feedback open`. The returned project-qualified URL opens the Feedback tab.
The human selects an anchor, saves a draft and separately submits it. An active
agent reads or waits for submitted batches, verifies anchors and source hashes,
revises within authorized scope, replies and publishes a new round. The human
inspects and resolves threads. Stale threads require Reattach on the existing
thread and Submit; a new comment does not exercise that recovery path.
Sources: `treadle/packages/cli/src/commands/feedback.ts:195`;
`treadle/packages/core/src/feedback/store.ts:615`.

The [architecture](/systems/sdd-harness-architecture.md) describes package,
interface and storage relationships. [Owner workflow](/systems/owner-workflow.md)
explains why Submit, Resolve, Start and Finish remain separate acts. The canonical
feedback skill documents exact commands and revision/idempotency handling at
`treadle/packages/cli/harness/skills/sdlc/feedback/SKILL.md:1`.

# Observed chronology — 2026-10-11

This is a source and evidence chronology, not a reconstructed retrospective.
Entries below use day precision; detailed event times remain in the cited records.

1. The original analysis, decisions and task DAG were reviewed. Actual decision
   acceptance and separate Start receipt bind the agreed plan. Those receipts
   remain in `specs/browser-agent-feedback/workflow.jsonl:1` and the canonical pack.
2. Core storage, selected snapshots/CLI and guarded web APIs landed in commits
   `f972f33`, `74ceab0`, `891a911` and the repair `ccea33f`. Original failures and repairs
   remain in `specs/browser-agent-feedback/implementation-review.md:1`.
3. Browser source review and canonical Claude/Codex/Pi guidance landed in commits
   `c935f36` and `00e5e77`. Chromium captures found and repaired header occlusion
   and cramped source columns. The bounded repaired review is
   `specs/browser-agent-feedback/implementation-review-ui-repaired.md:1`.
4. Six isolated native fixtures were committed at `d919603`. Real human browser
   submissions reached actual Claude, Codex and Pi CLI processes in both document
   and diff modes. Each published a fixture revision. Codex's original stale
   document thread was reattached by the human and redelivered to native Codex,
   preserving the original anchor and discussion. Actual commands, results and
   source hashes are bound by `specs/browser-agent-feedback/checks/native-witness.json:1`.
5. Seven of eight threads received observed human Resolve events. The owner
   instructed the coordinator to ignore anything remaining. The sole remaining
   Claude diff Resolve is waived and unverified; no Resolve event was invented.
   The exact instruction and ledger binding are preserved in
   `specs/browser-agent-feedback/checks/native-owner-test-waiver.json:1`.
6. Commit `bf72a87` retains the qualified native acceptance. Independent native
   review reports `pass_with_owner_waiver`: six deliveries/revisions and five fully
   completed human-resolution journeys. The exact T-6 combined check exits 0,
   including four synthetic recovery/approval-boundary tests. Synthetic tests do
   not replace human/native witnesses. Sources:
   `specs/browser-agent-feedback/implementation-review-native.md:1`;
   `specs/browser-agent-feedback/checks/T-6-final-qualified.log:1`.

# Boundaries and remaining evidence gaps

The application binds localhost and uses the existing project/path/origin/write
controls. It is not a remote authenticated collaboration service. Actor labels
are claims. Feedback persists selected source and comments, without exporting
host sessions, transcripts or credentials. Sources: `SECURITY.md:1`;
`treadle/packages/core/src/feedback/store.ts:615`.

Browser events do not wake idle agents. Delivery requires an active bounded wait,
a later prompt or manual invocation. The observed native matrix covers the exact
installed host versions and commands retained in its witness; it does not certify
all models, operating systems or host permission modes. The successful Codex run
used CLI `danger-full-access`; a failed restricted run is retained as historical
failure. Source: `specs/browser-agent-feedback/checks/native-witness.json:1`.

UI evidence covers Chromium, 20 repaired captures, keyboard submission, static
HTML validation and an axe subset with zero violations/incomplete results. Full
WCAG 2.2 AA, other browser engines, zoom and field Core Web Vitals remain
unverified. Source: `specs/browser-agent-feedback/host-witnesses.md:1`, UI section.

The current knowledge scanner fingerprints Python only and the stamp compares
Git HEAD. Dirty TypeScript/Markdown accuracy requires source inspection. PACK
review and the owner's separate Finish act remain governed by the canonical pack;
neither this knowledge page nor the native test waiver grants completion.
