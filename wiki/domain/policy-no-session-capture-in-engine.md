---
type: Policy
title: The engine never captures sessions, transcripts, or tokens
description: "Session capture and token accounting are declared non-goals of the knowledge engine — knowledge comes from repositories, not from surveilling agent runs."
status: stable
created: 2026-10-07
updated: 2026-10-07
verified:
  - { by: human:owner, at: 2026-10-07T23:55:00Z }
sources: [{ id: src, resource: wiki/decisions/okf-only-engine.md }]
tags: [policy, non-goal, owner-declared]
---

# Policy

The okf engine does not capture agent sessions, transcripts, or token
usage — through hooks or any other mechanism. Knowledge originates from
**repositories**; a future memex layer, if built, would be a _consumer_
of okf and would own any such concerns outside this engine.

[^pol1]:
    `wiki/decisions/okf-only-engine.md` — owner-declared non-goal
    (D5), 2026-10-07.

[^pol2]:
    `docs/archive/specs/okf-only-engine/design.md` — D5 in the removal-wave
    decision ledger.

# Status

**ACCEPTED 2026-10-07** (finding `policy-ff546069`, accepted by the owner via the findings ledger). This policy is binding: the engine never captures sessions, transcripts, or tokens.

# Implementation context — 2026-10-10

The accepted prohibition concerns capture of sessions, transcripts, and tokens.
The shipped harness now contains session-recall hooks that inspect work records;
the mere presence of hooks does not establish transcript capture.
Source: `treadle/packages/cli/harness/hooks/session-recall.js:1`.
The old “hooks are a non-goal” wording describes the former engine boundary.
See [the guided-loop record](/initiatives/guided-loop.md).
