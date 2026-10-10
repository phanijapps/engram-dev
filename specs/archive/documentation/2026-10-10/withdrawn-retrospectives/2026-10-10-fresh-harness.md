---
title: "fresh-harness: retrospective backfilled on 2026-10-10"
type: Retrospective
description: "Dated record-based retrospective for fresh-harness; reported outcomes are distinguished from current verification."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/specs/fresh-harness/fresh-harness.json"}
---

# Provenance and boundary

Author: `agent:codex`. Backfilled on 2026-10-10 from the preserved record.
Source HEAD: `b4dd8706f2646fbc1b122a49501445ee55ccb150`. Pack revision: 40.
Pack SHA-256: `8edc7c9a61eaef47694a16ca6af81ca0b4e67dcba18fd433537ba3ce65c941f3`.
Source: `docs/specs/fresh-harness/fresh-harness.json:1`, especially `review.verdicts` and task evidence.

This is a retrospective interpretation of recorded evidence. The historical
commands were not rerun for this backfill. The record reports delivery and a
PACK PASS; that does not establish every external outcome or owner acceptance
of the proposed lessons below. See [the initiative](/initiatives/fresh-harness.md).

# Intended result

Install the harness on agent platforms with truthful plans, reversible records, and working hooks.
Source selector: `spec` and `design` in `docs/specs/fresh-harness/fresh-harness.json:1`.

# Recorded result and what worked

The closing reviewer reports per-agent records, surgical removal, and real dogfood on two agents. The record includes refusals for tampering and unsupported combinations.
Evidence status: declared by recorded reviewers, not independently rerun here.
Source selector: `review.verdicts[on=PACK]` in `docs/specs/fresh-harness/fresh-harness.json:1`.

# Problems and corrections

Earlier command evidence masked failing exits. Installer state initially let one agent overwrite another. A test wrote to the real HOME. The record reports corrections and isolated verification.
Evidence status: declared in review corrections. Source selector:
`review.verdicts` in `docs/specs/fresh-harness/fresh-harness.json:1`.

# Causes and lesson candidates

Inferred from the correction notes: execution context, state ownership, and exit propagation were insufficiently isolated. Green prose did not reliably identify the process or files actually tested.
Evidence status: inferred. This is not a measured causal experiment.
The evidence basis is the review correction sequence above.

# Trade-offs

The final design keeps per-agent reversible state and explicit refusal paths instead of silently forcing foreign configuration.
Evidence status: inferred interpretation of the recorded correction sequence.

# Proposed follow-ups

G5: attach actual external CI run evidence. Candidate lesson: isolate HOME and check direct process exits when verifying installers.
Priority and execution owner are unassigned. A binding rule needs a separate
findings proposal and human resolution; this report does not create one.
See [the lifecycle draft](/project/documentation-lifecycle.md).

# Unknowns

The PACK review explicitly leaves FR-11, the remote CI green run, open for the push. No later run or owner feedback was established by this backfill.
A later observation belongs in a dated supplement. The source pack stays frozen.
