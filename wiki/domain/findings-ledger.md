---
type: Domain
title: Findings ledger — normative authority
description: Normative wiki content lands only through accepted findings; declined is forever
tags: [governance, authority, wiki]
---

# Overview

Normative knowledge (golden paths, constraints, standards — what new code
*must* conform to) never enters the wiki as settled truth by itself. The
path is: author as `status: draft` → `memex-core findings propose` with a
dedupe key `(source, destination, kind)` → human
`findings resolve --decision accepted|declined`. Rules:

- re-proposing an existing finding is idempotent;
- a **declined** finding is never re-proposed at that key;
- descriptive pages regenerate deterministically and need no findings.

# Relationships

- Ledger lives with the knowledge it governs: `<repo>/wiki/.okf/findings.toml`.
- `resolve` surfaces pending counts so staleness of authority is visible.

# Evidence

- Implementation + rules: `engine/core/src/memex_core/findings.py`.
- Design provenance: `docs/product/Repo_Knowledge_Skill.md` §B
  (adapt-to-project inheritance).
