---
type: Domain
status: stable
created: 2026-10-08
updated: 2026-10-08
title: Misfit-Governed Development — a design theory for AI-assisted software (arXiv 2610.01372)
description: 'Chen and Cheng, 2026. Fit is seen only through misfits. Verification is an enumerated, machine-checked misfit list. A dual loop separates machine-paced repair from human-paced judgment. The builder may never amend the law.'
sources: [{ id: src, resource: docs/specs/sdd-research/analysis.md }]
tags: [research, sdd, verification, loop]
---

# Overview

A design theory for AI-assisted development. It derives from
Christopher Alexander's theory of form. The central claim: good fit
between software (the form) and its demands (the context) can never be
seen directly. Only misfits — specific, enumerable failures — can be
seen. So verification is an explicit misfit list, and fit means the
absence of every listed misfit. The open question is the completeness
of the list, never the capability of the generator.

# Key concepts

- **The non-native vernacular builder.** The LLM is fluent in
  mainstream code and native to no local tradition. It carries a bias
  current: a pull toward mainstream idiom. Context can guide it but
  cannot prove the pull is gone.
- **Law versus harness.** The law holds normative authority:
  specifications, the pattern language, the misfit list. The harness
  renders verdicts: gates, fix loops, reconciliation checks. A gate's
  rule belongs to the law; its checker belongs to the harness.
- **Four-form pattern language.** A pattern exists only with all four
  forms: doctrine, template, prohibition, gate. The gate is a
  deterministic checker. Fixtures prove it still fires. Invocation
  evidence proves it is still reached.
- **The dual loop and S = P = T = W.** The inner loop runs at machine
  pace. It treats the specification as correct and repairs the
  candidate. The outer loop runs at human pace. It judges S = W — does
  the specification fit the world — and it alone amends the law.
- **The fix loop** batches violations, anchors repair in the violated
  pattern, re-runs prior gates every round, escalates after three
  stalled rounds, and freezes the context for the repair window.
- **Primary versus proxy.** A primary holds a demand's authority (the
  compiler, the runtime, a human ruling). A proxy restates it.
  Proxies drift. The false-green condition: all checks pass, the form
  is still wrong. Remedy: reconciliation checks, one designated
  original per rule, session-start consistency checks.
- **The permanent novice.** Observed compliance never retires a gate.
  A gate that cannot run counts as skipped, never passed (M_run = M).
- **Every escape is answered two ways only:** extend the enumeration,
  or record an explicit ruling that places the class outside it.
  Quietly fixing the defect and moving on is not permitted.

# Evidence status

All concepts: declared (the authors' theory) —
[the digest](/research/sdd-loop-synthesis.md) maps them onto our loop.
The empirical case is one system: 64 specifications, 28 blocking
gates, ≈1,300 generated tests, repeated rebuilds from empty
directories. Feasibility shown; portability untested. The S = T leg
(tests may assert the wrong business rule) is the least verified.

# Relationships

- Applied in [The SDD loop synthesis](/research/sdd-loop-synthesis.md).
- Builds on [Okf — the engine](/systems/okf-engine.md): the findings
  ledger plays the legislative circuit.
