---
name: build-kb
description: Build and maintain a project knowledge base (wiki) from an existing codebase — the brownfield understanding skill. Drives the okf CLI (bundle init, tree-sitter code indexing, search, findings) and optionally graphify for code graphs. Triggers are "Understand this codebase", "Build knowledge", "Document this repo/project", "Build the wiki".
---

# build-kb — build the project knowledge base

The project wiki is an **OKF bundle at `<repo>/wiki/`** — concepts as
Markdown, git-versioned with the code. All engine operations go through
the **`okf` CLI** (run from the repo root; `uv run okf …`). Never hand-edit generated sections inside `wiki/code/**`.

## 1. Understand the repo (always, read-only)

Anchor first: `okf validate wiki` (health) and the freshness check —
compare `wiki/.okf/last-index.json` `repo_head` to `git rev-parse HEAD`.
Record:

1. **Shape** — mono-repo vs single project vs partial wiki
   (`resolve` reports `wiki.present` / `freshness`). Pick the matching
   strategy: `resources/mono-repo-strategy.md` or
   `resources/single-project-strategy.md`.
2. **State** — git remote + branch + branching strategy at a glance;
   `resolve` pins `repo_head`.
3. **Technologies** — languages, frameworks, build system (from manifests,
   not guesses).

If `wiki.present` is true and `freshness` is `fresh`, skip to §5 (curate).
If `stale`, run §3 then §5.

## 2. Knowledge base shape (create or adopt)

- No wiki → `okf init wiki` (creates `<repo>/wiki/` as an OKF bundle,
  `.okf/` state dir). Then §3.
- Wiki exists → never re-init; adopt it: read `wiki/index.md` and the
  newest concepts, then §3 (update is incremental and fingerprint-safe).

## 3. Deterministic index (tree-sitter, no LLM)

`okf code index . wiki` with the strategy's `--include`/`--exclude`
globs. This writes managed `wiki/code/**` concepts (modules, symbols,
imports) and stamps `.okf/last-index.json` — which is what makes the
freshness check report freshness. Re-runs re-extract only what changed; unchanged sources are
never rewritten.

## 4. Code graph (optional, when graphify is installed)

If `graphify` is on PATH (or installed as a platform skill), follow
`resources/graphify.md`: build the graph, then use `graphify explain` and
`graphify path` outputs as _evidence_ for relationship sections in curated
concepts. The graph supplements the wiki; it never replaces it.

## 5. Curated concepts (the layer agents actually read)

Authored concepts live beside the generated ones — one page per idea,
OKF front matter (`type`, `title`, `description`, `tags`), body sections
`# Overview`, `# Relationships`, `# Evidence` when applicable. Write for a
new engineer: systems first (`type: System`), then rules, decisions, and
workflows. Every factual claim cites a path (and revision when it matters).
Omit sections you cannot evidence — never invent.

Normative content (golden paths, constraints, standards — "what new code
must conform to") is **never written directly as settled truth**: author it
as `status: draft` and route acceptance through the findings ledger:

```
okf findings propose wiki --source <evidence-path> \
  --destination wiki/<concept>.md --kind golden-path --rationale "…"
```

A human accepts or declines (`okf findings resolve wiki <id> --decision
accepted|declined`). Declined findings are never re-proposed.

## 6. Validate, record, commit

1. `uv run okf validate wiki` (conformance) and the freshness check
   (stamp `repo_head` == HEAD); `okf findings list wiki --status pending`
   must be 0 or known.
2. Commit the wiki with the code it describes — git history is the
   durable record (project memory back-burnered, okf-only-engine D5).
3. Commit `wiki/` **with the code it describes** (same commit or an
   adjacent one). The wiki travels with the repo.

## Rules

- Managed sections regenerate; hand edits belong in curated concepts only.
- Evidence over invention; when sources disagree, record the conflict.
- The wiki documents what _is_; normative pages (what _should be_) go
  through findings.
- Freshness is the contract: if `resolve` says `stale`, update before
  trusting `wiki/code/**`.
