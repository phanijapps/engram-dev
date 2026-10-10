---
title: "install-paths: retrospective backfilled on 2026-10-10"
type: Retrospective
description: "Dated record-based retrospective for install-paths; reported outcomes are distinguished from current verification."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/specs/install-paths/install-paths.json"}
---

# Provenance and boundary

Author: `agent:codex`. Backfilled on 2026-10-10 from the preserved record.
Source HEAD: `b4dd8706f2646fbc1b122a49501445ee55ccb150`. Pack revision: 12.
Pack SHA-256: `cbbf1406e12113669ba792e5b4658e37b39f87f854a711db9353cb8c17b26f62`.
Source: `docs/specs/install-paths/install-paths.json:1`, especially `review.verdicts` and task evidence.

This is a retrospective interpretation of recorded evidence. The historical
commands were not rerun for this backfill. The record reports delivery and a
PACK PASS; that does not establish every external outcome or owner acceptance
of the proposed lessons below. See [the initiative](/initiatives/install-paths.md).

# Intended result

Provide a supported installation path that works from a clean environment on both Node floors.
Source selector: `spec` and `design` in `docs/specs/install-paths/install-paths.json:1`.

# Recorded result and what worked

The closing review reports clean-room scripts for clone/link and install.sh. The working remote path uses clone, Corepack, pnpm install, build, and link.
Evidence status: declared by recorded reviewers, not independently rerun here.
Source selector: `review.verdicts[on=PACK]` in `docs/specs/install-paths/install-paths.json:1`.

# Problems and corrections

PATH shadowing blessed old launchers twice. Five npm packaging mechanisms failed in experiments. The build found a real dist manifest-path and harness-content packaging problem.
Evidence status: declared in review corrections. Source selector:
`review.verdicts` in `docs/specs/install-paths/install-paths.json:1`.

# Causes and lesson candidates

Inferred: executable identity was not fixed in earlier proofs, and npm assumptions did not match the workspace protocol and package content layout.
Evidence status: inferred. This is not a measured causal experiment.
The evidence basis is the review correction sequence above.

# Trade-offs

The design retained a working native pnpm installation chain after registry-style mechanisms failed. The record rewrote unsupported promises to observed behavior.
Evidence status: inferred interpretation of the recorded correction sequence.

# Proposed follow-ups

Candidate lesson: call the intended built binary directly under isolated PATH. A future registry publish needs artifact-level conformance rather than source-tree assumptions.
Priority and execution owner are unassigned. A binding rule needs a separate
findings proposal and human resolution; this report does not create one.
See [the lifecycle draft](/project/documentation-lifecycle.md).

# Unknowns

Historical reviewer reports do not establish today’s remote URL availability, npm publication, or license clearance. No remote installation was rerun here.
A later observation belongs in a dated supplement. The source pack stays frozen.
