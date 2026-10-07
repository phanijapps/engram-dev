---
type: Domain
title: The wiki contract — bundle layout, freshness stamp, findings ledger
description: 'The implemented contract the three engine packages exchange: OKF bundle at <repo>/wiki/, .okf/last-index.json freshness semantics, .okf/findings.toml proposal ledger, managed-section markers, and front-matter rules.'
tags: [contract, okf, freshness, findings, conventions]
---

# Overview

The engine packages exchange knowledge through one concrete contract,
implemented in `memex_core` and enforced by `okf-kit`:

**Bundle location and shape.** The project wiki is an OKF bundle at
`<repo>/wiki/` — convention over registry, no mapping table. Root
`index.md` carries `okf_version`. Concepts are Markdown files whose cid is
the path relative to the bundle root without `.md`.

**State dir.** `wiki/.okf/` holds engine state, never concepts:
`last-index.json` (the freshness stamp) and `findings.toml` (the proposal
ledger).

**Freshness stamp.** `wiki update` writes `last-index.json` with `repo_head`
and counts (`written/updated/skipped`). `resolve` compares the stamped
`repo_head` to `git HEAD` and reports `fresh | stale | unknown` (plus
`absent` when no wiki exists). Freshness is the trust contract for
`wiki/code/**`: a stale stamp means the generated tree may not describe the
code at HEAD.

**Managed vs curated.** Generated concepts under `wiki/code/**` and
`wiki/code-summaries/**` are managed by `okf-code` — everything between
`<!-- okf-code:start -->` and `<!-- okf-code:end -->` regenerates; hand
edits belong only in curated concepts (e.g. `wiki/systems/**`,
`wiki/domain/**`, `wiki/decisions/**`) or narrative outside the markers.

**Findings ledger.** Normative content (golden paths, constraints,
standards — "what new code must conform to") is never written directly as
settled truth: it is authored `status: draft` and routed through
`memex-core findings propose`; a human accepts or declines
(`findings resolve <id> --decision …`). Declined findings are never
re-proposed. The ledger lives with the knowledge it governs, in
`wiki/.okf/findings.toml`.

**Front matter.** Non-empty `type` is required; `title` and `description`
recommended; known keys are `type, title, description, resource, tags,
timestamp, okf_version`; unknown keys are allowed extensions
(`engine/okf/okf_kit/core/validate.py:25-29`).

# Relationships

- `memex-core resolve/status` read the stamp and ledger;
  `wiki init/update` write them
  (`engine/core/src/memex_core/resolve.py`, `knowledge.py`, `findings.py`,
  `status.py`).
- `okf-kit` defines the bundle format the contract is written in
  ([okf-kit](/systems/okf-kit.md)); the memory plane's page codec speaks the
  same front-matter dialect (`engine/memex/memex/domain/frontmatter.py`).
- The [one-engine](/systems/one-engine.md) architecture doc references this
  contract for where wiki state lives.

# Counting rules and coverage

Three different concept counts surface in this repo; each is correct
under its own rule (implementation-supported: `resolve.py:78-81`,
`wiki/.okf/last-index.json`, raw file enumeration):

- **83 managed concepts** — what `wiki update` wrote/updated under
  `wiki/code/**` (the indexer's count).
- **94 concept_count** — `memex-core resolve`: every `.md` under `wiki/`
  except `index.md`/`log.md` and anything under `.okf/` (managed +
  curated + summaries).
- **95 files** — raw `*.md` count: the 94 plus the root `index.md`.

**Coverage:** the managed tree indexes non-test Python across the three
packages only (`include_tests=False` default, `knowledge.py`). Not
indexed: `docs/product/**` (the normative spec corpus), `skills/**`,
root manifests, `engine/okf/tests/fixtures/wiki/**`, and all test
modules. `code-summaries/repository.md` is managed (regenerates every
update) — scope statements live here, not there.

# Evidence

- `engine/core/src/memex_core/resolve.py` — `WIKI_DIRNAME`,
  `OKF_STATE_DIRNAME`, `LAST_INDEX_STAMP` constants; freshness comparison.
- `wiki/.okf/last-index.json` — the live freshness stamp (repo_head,
  written/updated/skipped). Values are read from the file, never restated
  here: restated copies rot — this line previously froze a 39bad0f-era
  stamp and was falsified within a day (implementation-supported).
- `engine/core/src/memex_core/findings.py` — `Finding`,
  `findings_path`, propose/resolve with declined-reproposal guard.
- `engine/okf/okf_kit/code/managed.py` — the managed-section markers.
- `engine/okf/okf_kit/core/validate.py:25-29` — front-matter key rules.
- `docs/product/Memex_Core_Layer.md` — "Conventions" section states the
  same rules as design intent.
