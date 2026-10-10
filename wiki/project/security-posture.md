---
title: "Security posture and claim boundaries"
type: Project
description: "Localhost and trusted-on-disk posture, with caller claims distinguished from authentication."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "SECURITY.md"}
  - {"id": "s2", "resource": "treadle/packages/web/src/servers.ts"}
  - {"id": "s3", "resource": "treadle/packages/core/src/specpack/admission.ts"}
  - {"id": "s4", "resource": "treadle/packages/core/src/specpack/record.ts"}
  - {"id": "s5", "resource": "treadle/packages/cli/src/commands/know.ts"}
---

# Operating authority

`SECURITY.md` remains the authority for vulnerability reporting and the accepted
threat model. This wiki page summarizes the current boundary.
Source: `SECURITY.md:1`.

The room and library bind localhost. Served Markdown is trusted-on-disk content;
the policy does not permit exposing the servers to untrusted networks or trees.
Sources: `treadle/packages/web/src/servers.ts:189`;
`treadle/packages/web/src/servers.ts:311`; `SECURITY.md:10`.
Security headers are defined in `treadle/packages/web/src/servers.ts:64`.

# Claims and authority

Answer and approval admission check a `human:` prefix.
Source: `treadle/packages/core/src/specpack/admission.ts:17`.
This is a shape check, not authenticated identity.
Task evidence can identify the agent that ran a command.
Source: `treadle/packages/core/src/specpack/record.ts:19`.
Knowledge finding resolution has no human-claim argument.
Source: `treadle/packages/cli/src/commands/know.ts:133`.

“Every write is authenticated human approval” would overstate implementation.
The operating rule remains that agents propose normative changes for humans.
See [findings enforcement](/domain/rule-declined-findings-immutable.md).

# Dated supply-chain evidence

Audit claims need a run date and output. The current command is
`pnpm audit:prod`, defined at `treadle/package.json:17`.
This repair does not independently establish the current vulnerability count.
The reporting policy retains its separately documented accepted risks.
