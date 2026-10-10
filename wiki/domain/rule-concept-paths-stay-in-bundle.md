---
title: "Concept reads and links stay inside the bundle"
type: BusinessRule
description: "The current resolver checks segments and realpath containment; external Markdown sources are evidence, not graph edges."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - {"id": "s1", "resource": "treadle/packages/knowledge/src/links.ts"}
  - {"id": "s2", "resource": "treadle/packages/knowledge/src/parse.ts"}
---

# Existing boundary

Concept IDs must pass segment validation. Their resolved paths must identify
files inside the real bundle root. Invalid IDs and escapes return null.
Source: `treadle/packages/knowledge/src/links.ts:49`.
Outgoing Markdown edges also require realpath containment.
Source: `treadle/packages/knowledge/src/links.ts:74`.
The validator reports broken or out-of-bundle Markdown targets.
Source: `treadle/packages/knowledge/src/links.ts:94`.

Enumeration skips file symlink escapes and duplicate real paths.
Source: `treadle/packages/knowledge/src/parse.ts:123`.
This describes the current read/link paths. It does not claim a general concept
writer or code indexer exists in the TypeScript knowledge package.

# Documentation consequence

Keep normal wiki Markdown links inside the bundle. Reference external spec
Markdown through source metadata and repository locators.
Source evidence may be outside the bundle; it is not an outgoing concept edge.
See [the authority map](/project/documentation-map.md).

# History

The prior page asserted Python writer/indexer enforcement at retired paths.
Its byte-for-byte text remains in the documentation archive.
This repair does not broaden the supported writer contract.
