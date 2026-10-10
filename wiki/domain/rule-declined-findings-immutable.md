---
title: "Declined findings cannot be re-proposed at the same key"
type: BusinessRule
description: "The current ledger preserves terminal states and deduplicates source, destination, and kind."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "treadle/packages/knowledge/src/findings.ts"}
  - {"id": "s2", "resource": "treadle/packages/cli/src/commands/know.ts"}
---

# Existing rule and enforcement

The ledger deduplicates `(source, destination, kind)`.
Re-proposing an existing entry returns it. A declined entry sets `refused: true`.
Source: `treadle/packages/knowledge/src/findings.ts:146`.

A pending entry can resolve once. Re-resolving a terminal entry or resolving
an unknown ID throws an Error.
Source: `treadle/packages/knowledge/src/findings.ts:178`.
The TypeScript API does not expose the retired Python `FindingsError` class.

The authority rule remains agents propose and humans accept.
The knowledge CLI resolution command itself does not authenticate a human or
require a `human:` argument. This is a limitation of enforcement, not permission
for an agent to resolve its own proposal.
Source: `treadle/packages/cli/src/commands/know.ts:133`.
See [security posture](/project/security-posture.md).

# History

This retains the existing accepted rule's meaning and corrects implementation
references. Its prior text is preserved in the documentation archive.
No new human acceptance is asserted by this repair.
