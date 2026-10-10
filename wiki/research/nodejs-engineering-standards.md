---
title: "Node engineering standards: proposed rules versus observed controls"
type: Research
description: "Forty-rule research retained as an input, with current enforcement described separately."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "docs/research/nodejs-engineering-standards.md"}
  - {"id": "s2", "resource": "treadle/eslint.config.mjs"}
  - {"id": "s3", "resource": "treadle/packages/knowledge/package.json"}
  - {"id": "s4", "resource": "treadle/package.json"}
---

# Input and interpretation

The source lists forty engineering rules for the proposed Node harness.
Source: `docs/research/nodejs-engineering-standards.md:1`.
It describes desired tooling as well as principles. The list is not proof that
all tools, release processes, or code-example checks currently exist.

The [observed controls](/project/engineering-controls.md) are the current reference.
For example, the ESLint configuration uses recommended rules and explicit additions.
Source: `treadle/eslint.config.mjs:21`.
The knowledge package has no core dependency.
Source: `treadle/packages/knowledge/package.json:5`.
These facts qualify the proposed lint preset and package chain.

# Disposition

Preserve the original standards document for lineage and pinned skill references.
Use implementation-supported controls for current guarantees. Route proposed new
requirements through the findings ledger or a bounded future work initiative.
Deferred coverage, publishing, and typecheck improvements remain
[open work](/project/open-work.md), rather than implied completed rules.
