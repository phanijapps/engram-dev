---
type: BusinessRule
title: A declined finding is never re-proposed; terminal states are immutable
description: "The findings ledger refuses proposals at a declined (source, destination, kind) key, and accepted/declined findings can never change state again — the suggestion box cannot be worn down."
status: stable
created: 2026-10-07
updated: 2026-10-07
# sources: retired with the python engines — evidence preserved at git tag python-final
tags: [findings, authority, domain]
---

# Rule

A finding that was **declined** is dead at its key: re-proposing the same
`(source, destination, kind)` returns the declined finding with
`refused: true` and never creates a new proposal. A **resolved** finding
(accepted or declined) is terminal — resolving it again raises.

[^f1]:
    `engine/okf/okf_kit/core/findings.py:120-141` — `propose_finding`
    returns the existing finding untouched and flags `refused` when its status
    is `declined`.

[^f2]:
    `engine/okf/okf_kit/core/findings.py:144-158` — `resolve_finding`
    raises `FindingsError` for already-terminal findings, unknown ids, and
    invalid decisions.

# Enforcement

Enforced in code, not by convention: `propose_finding` looks up the dedupe
key before creating anything, and `resolve_finding` rejects non-pending
transitions unconditionally.

# Examples

Declining `golden-path-416c0995` (the old merge direction) means that
exact proposal can never return; a genuinely new direction needs a new
finding (as `golden-path-79bba45a` did).
