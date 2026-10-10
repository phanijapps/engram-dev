---
title: "guided-loop: retrospective backfilled on 2026-10-10"
type: Retrospective
description: "Dated record-based retrospective for guided-loop; reported outcomes are distinguished from current verification."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/specs/guided-loop/guided-loop.json"}
---

# Provenance and boundary

Author: `agent:codex`. Backfilled on 2026-10-10 from the preserved record.
Source HEAD: `b4dd8706f2646fbc1b122a49501445ee55ccb150`. Pack revision: 21.
Pack SHA-256: `c431fe358d97b85f66e1d29e6dc5b9336e84b8998966d4100d654454e5e528a4`.
Source: `docs/specs/guided-loop/guided-loop.json:1`, especially `review.verdicts` and task evidence.

This is a retrospective interpretation of recorded evidence. The historical
commands were not rerun for this backfill. The record reports delivery and a
PACK PASS; that does not establish every external outcome or owner acceptance
of the proposed lessons below. See [the initiative](/initiatives/guided-loop.md).

# Intended result

Recall unfinished work, ask instead of guessing between open initiatives, and bring remaining OKF admission behavior into conformance.
Source selector: `spec` and `design` in `docs/specs/guided-loop/guided-loop.json:1`.

# Recorded result and what worked

The closing reviewer reports worktree discovery, recall hooks, the multi-open ask gate, and golden witnesses for corrected index/log validation.
Evidence status: declared by recorded reviewers, not independently rerun here.
Source selector: `review.verdicts[on=PACK]` in `docs/specs/guided-loop/guided-loop.json:1`.

# Problems and corrections

An earlier index rule invented a glyph constraint and rejected the repo wiki. The claim that goldens covered every error path was overstated. Relative workspace paths could count one tree twice.
Evidence status: declared in review corrections. Source selector:
`review.verdicts` in `docs/specs/guided-loop/guided-loop.json:1`.

# Causes and lesson candidates

Inferred: interpretation of prose format rules outran concrete negative witnesses. Path normalization and actual returned data needed verification before recall decisions.
Evidence status: inferred. This is not a measured causal experiment.
The evidence basis is the review correction sequence above.

# Trade-offs

The ask gate derives open counts from returned JSON rather than matching prose. Positive and malformed fixtures witness different obligations.
Evidence status: inferred interpretation of the recorded correction sequence.

# Proposed follow-ups

G3: replace the real-workspace open-wave test assumption with stable fixtures. Candidate lesson: prove rejection paths, not only conformant examples.
Priority and execution owner are unassigned. A binding rule needs a separate
findings proposal and human resolution; this report does not create one.
See [the lifecycle draft](/project/documentation-lifecycle.md).

# Unknowns

The backfill does not independently rerun historical hook installations on every supported platform or establish owner usability feedback.
A later observation belongs in a dated supplement. The source pack stays frozen.
