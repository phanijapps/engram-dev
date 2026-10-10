---
title: "Installation and workspace setup"
type: Project
description: "Find the installation walkthrough, local work library, and current build commands."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {id: guide, resource: wiki/assets/guide/index.html}
  - {id: package, resource: treadle/package.json}
  - {id: cli, resource: treadle/packages/cli/src/commands/do.ts}
---

# Installation

Open [the installation walkthrough](../assets/guide/index.html).
The guide is a relocated asset; its source bytes remain unchanged.
Source: `wiki/assets/guide/index.html:1`.

# Local work and verification

From `treadle`, serve current work with:

```bash
pnpm exec tsx packages/cli/src/main.ts do library ../specs
```

The command opens the localhost library. Decisions, approval, and closure
remain explicit owner actions. Source: `treadle/packages/cli/src/commands/do.ts:243`.
Build and verification commands are declared at `treadle/package.json:9`.
See [engineering controls](/project/engineering-controls.md) and
[security posture](/project/security-posture.md).
