---
type: Policy
title: The engine never captures sessions, transcripts, or tokens
description: 'Hooks, session capture, and token accounting are a declared non-goal of the okf engine — knowledge comes from repositories, not from surveilling agent runs.'
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
**repositories**; a future memex layer, if built, would be a *consumer*
of okf and would own any such concerns outside this engine.

[^pol1]: `wiki/decisions/okf-only-engine.md` — owner-declared non-goal
(D5), 2026-10-07.
[^pol2]: `docs/specs/okf-only-engine/design.md` — D5 in the removal-wave
decision ledger.

# Status

**ACCEPTED 2026-10-07** (finding `policy-ff546069`, accepted by the owner via the findings ledger). This policy is binding: the engine never captures sessions, transcripts, or tokens.
