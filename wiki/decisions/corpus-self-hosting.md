---
type: Decision
status: stable
created: 2026-10-10
updated: 2026-10-10
title: "The corpus self-hosts; python becomes the frozen witness"
decided_by: "human:owner"
description: "The corpus regenerates from the TS engines and gates to zero; the committed goldens are the frozen python witness — equality proves the port."
sources:
  [
    { id: generator, resource: treadle/conformance/generators/gen_corpus.ts },
    { id: gate, resource: treadle/scripts/corpus-check.mjs },
  ]
tags: [decision, corpus, witness, determinism]
---

# Context

The corpus gate originally regenerated goldens **from the python
engines** — provenance meant a python runtime at every gate. That kept
python load-bearing after the port was complete. [^c1]

# Decision

Write the TS generator, prove its output byte-identical to the
committed python-witnessed goldens, and flip the gate: TS regenerates,
`git diff` gates to zero. The committed goldens ARE the witness —
equality with them proves TS ≡ python forever. [^c2]

# Consequences

- `pnpm corpus:check` needs no python.
- Golden changes are deliberate: regenerate, review the diff, commit
  with intent (a contract change).
- The python generator stays in-tree as the witness reference; the
  engines stay until the retirement ceremony removes them. [^c3]

# Sources

[^c1]: The flip commit: "THE KEYSTONE — the corpus self-hosts".

[^c2]:
    Determinism: fixed clocks throughout (the engine's wall clock is
    pinned for the whole generation run).

[^c3]: The retirement board: `wiki/systems/treadle.md`.

# Implementation context — 2026-10-10

The retirement ceremony has occurred: Python is preserved at tag `python-final`.
The historical consequence above described the transition, not a current file.
The TypeScript generator and committed corpus are the active witnesses.
Sources: `treadle/conformance/generators/gen_corpus.ts:1`;
`treadle/scripts/corpus-check.mjs:1`. Equality applies to corpus-covered behavior.
