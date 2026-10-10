# graphify integration

`graphify` (v0.9.x) builds code knowledge graphs (`graphify-out/graph.json`)
and complements the wiki: the graph is machine-traversable structure, the
wiki is human/agent-readable knowledge.

## Setup

- CLI present? `graphify --version`.
- Skill not yet on your platform? `graphify install --platform pi`
  (also supports claude, codex, cursor, kiro, and others).
- Build: run the graphify skill/command over the repo (it extracts
  nodes/edges into `graphify-out/graph.json`). Mono-repos: build per
  package, then `graphify merge-graphs g1 g2 --out graphify-out/merged-graph.json`.

## Consuming the graph as wiki evidence

- `graphify explain "<symbol>"` — plain-language node + neighbors →
  paste-worthy material for a concept's `# Relationships` section.
- `graphify path "A" "B"` — shortest dependency path between two symbols →
  evidence for how a request flows (`workflows/*` concepts).
- `graphify diagnose multigraph` — same-endpoint edge collapse risks →
  record real findings in the relevant system concept, not silently.

## Discipline

- `graphify-out/` is generated output: keep it out of git (gitignore it);
  cite _findings_, not the artifact, in the wiki.
- The graph is a snapshot — regenerate when the stamp says the wiki is stale
  (`repo_head` ≠ HEAD), so graph and wiki describe the same revision.
- Graph claims are evidence, not authority: verify against source before a
  curated concept asserts a relationship.
