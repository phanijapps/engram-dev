---
type: Domain
status: stable
created: 2026-10-08
updated: 2026-10-08
title: The wiki contract — bundle rules every harness repo follows
description: "The concrete rules an okf wiki bundle follows: location, state dir, freshness stamp, findings ledger, managed vs curated sections."
# sources: retired with the python engines — evidence preserved at git tag python-final
tags: [contract, okf, conventions]
---

# Overview

One bundle per repository at `<repo>/wiki/` — convention, no registry.
Concepts are Markdown with YAML frontmatter; the root `index.md` declares
`okf_version`.

**State dir.** `wiki/.okf/` holds engine state, never concepts:
`last-index.json` (freshness stamp — written by `okf code index`,
`okf_kit/core/stamp.py`), `findings.toml` (the normative proposal ledger —
`okf findings`, `okf_kit/core/findings.py`), `fingerprints.json`
(per-file sha256 for anchor staleness — `okf_kit/core/fingerprints.py`),
`candidates.json` (semantic rule candidates — `okf code rules`).

**Freshness.** `okf status wiki` compares the stamp's `repo_head` to
`git rev-parse HEAD`: equal → `fresh`; anything else → `stale`, refresh
before trusting `wiki/code/**`.

**Managed vs curated.** `wiki/code/**` and `wiki/code-summaries/**` are
machine-managed — everything between `<!-- okf-code:start -->` and
`<!-- okf-code:end -->` regenerates; hand edits there are lost or brick
the indexer. Hand-authored knowledge lives in curated concepts
(`systems/**`, `domain/**`, `decisions/**`, `research/**` — research-derived
knowledge with paper-anchored evidence).

**Normative content.** Rules, policies, golden paths never become settled
truth directly: author `status: draft`, then
`okf findings propose wiki --source <evidence> --destination
wiki/<page>.md --kind <kind> --rationale "…"`. A human accepts or
declines; declined keys are never re-proposed.

**Lifecycle fields.** Every concept carries `status`
(draft/stable/deprecated), `created`, and `generated: {by, at}` — the
last-meaningful-change instant. Trust tier comes from `verified` events.

# Evidence

- `treadle/packages/knowledge/src/core/stamp.ts`, `findings.py`, `fingerprints.py`,
  `templates.py`; `treadle/packages/knowledge/src/code/indexer.ts` (implementation-supported)
