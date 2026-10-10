---
type: Decision
status: stable
created: 2026-10-10
updated: 2026-10-10
title: "Port both engines to TypeScript as one harness (treadle)"
decided_by: "human:owner"
description: "Port both engines to strict TypeScript as one white-label harness (treadle), gated by the golden corpus; alternatives and consequences recorded."
sources:
  [
    { id: research, resource: docs/research/python-vs-node-the-harness.md },
    { id: naming, resource: docs/research/harness-naming.md },
    { id: standards, resource: docs/research/nodejs-engineering-standards.md },
  ]
tags: [decision, port, typescript, treadle]
---

# Context

The harness ran as two python engines (okf: knows; loom: does). The
owner commissioned research on python vs Node for a merged engine,
OSS-bound, fresh-named, minus tree-sitter (code indexing delegated to
graphify-class tools). [^d1]

# Decision

Port both planes to strict TypeScript as one white-label harness named
**treadle**, gated by a golden conformance corpus generated from the
python engines. The port must be proven, not hoped: every behavior the
python engines own lands in the corpus, and the corpus must reproduce
byte-for-byte before python retires. [^d2]

# Alternatives considered

- **Stay python**: kept as the fallback; the merge-in-python step was
  the recommendation until the corpus existed. Overtaken by the corpus
  proving equality.
- **Per-plane split** (TS loop, python knowledge): rejected — two
  runtimes forever, the exact cost the research named.

# Consequences

- One runtime end to end: pages, servers, CLI, engines.
- The frozen vocabularies became compile-time unions (illegal stages
  do not compile); refusal texts are golden contracts.
- The white-label fence (`brand` package + leak gate) makes rebranding
  a one-command act.
- Python engines become historical witness, then retire (tag, remove,
  keep history). [^d3]

# Sources

[^d1]: The research register with measured inventory and scored criteria.

[^d2]: The corpus design: `docs/research/golden-conformance-suite.md`.

[^d3]: The retirement board lives in `wiki/systems/treadle.md`.
