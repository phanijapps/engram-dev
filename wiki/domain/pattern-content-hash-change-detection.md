---
type: Pattern
title: Content hashes drive change detection everywhere
description: 'Every extracted artifact carries a sha256 of the bytes it came from — modules, rule candidates, freshness stamps — so change detection is always byte-comparison, never timestamps.'
status: stable
created: 2026-10-07
updated: 2026-10-07
sources: [{ id: src, resource: engine/okf/okf_kit/code/treesitter/languages/base.py }]
tags: [pattern, hashing, freshness]
---

# Pattern

When okf extracts or scans something, it records
`hashlib.sha256(source_bytes).hexdigest()` alongside the result. Change
detection is then a plain hash comparison — no mtimes, no clocks.

[^h1]: `engine/okf/okf_kit/code/treesitter/languages/base.py:79` — module
extraction pins the source hash used for citations and change detection.
[^h2]: `engine/okf/okf_kit/code/semantic.py` — every rule candidate carries
its file's hash, so wave-U2 fingerprints can diff without re-analysis.

# When to apply

Adding any new extraction or scan: include the content hash in the
artifact. Consumers decide freshness; producers never guess.
