---
type: Domain
status: stable
created: 2026-10-08
updated: 2026-10-08
title: SpecAgent — agentic synthesis of formal specifications (arXiv 2610.05132)
description: "2026. Specification synthesis for C program verification. Forward-only workflows with localized repair fail: weak upstream specifications cause cascading downstream failures. SpecAgent traces root causes across dependencies, revisits finished specifications, and critiques strength beyond proof success."
sources: [{ id: src, resource: specs/archive/specs/sdd-research/analysis.md }]
tags: [research, verification, specification, loop]
---

# Overview

An agentic framework that writes formal ACSL specifications for
real-world C programs and verifies them with Frama-C/WP. Its lesson
generalizes beyond C: **a failure's cause may live upstream of the
failure site.** A locally acceptable but weak specification causes
cascading failures downstream. Repair loops that only patch the failure
site never converge.

# The workflow

1. **Planning agent** — outputs a specification plan: targets,
   semantics, dependencies, order. It works from a deterministic
   program context (signatures, caller/callee relations, loop
   positions).
2. **Generation agent** — retrieval-augmented from a knowledge base of
   184 verified specification examples. Examples carry 32-bit
   structural fingerprints; retrieval ranks by Jaccard similarity. The
   agent may edit specifications only — never the implementation.
3. **Verification gate** — every candidate passes Frama-C/WP. Verdicts
   become structured reports with source, caller, callee, and line
   provenance.
4. **Repairing agent** — diagnoses root causes. It may revisit
   specifications finished in earlier stages. It iterates until the
   gate passes or the budget runs out.
5. **Quality gate and critique agent** — proof success is not
   strength. Weak or vacuous specifications verify easily. The
   critique returns one verdict: **ACCEPT** (done), **IMPROVE** (local
   weakness — regenerate), or **REPLAN** (structural weakness —
   restart from planning). A static completeness probe supplies
   stable evidence.

# Evidence status

Results declared by the authors: 96.82% precision and 88.95% recall on
50 programs from 14 repositories, ahead of all baselines including
Codex with GPT-5.6. 604 of 811 real verification targets discharged
(best baseline 523). Single-tool domain (C, ACSL); generalization to
other stacks is our inference.

# Relationships

- ACCEPT / IMPROVE / REPLAN is proposed as the review verdict routing
  in [The SDD loop synthesis](/research/sdd-loop-synthesis.md).
- The verified-example knowledge base validates our own design: the
  wiki with anchored patterns and the code scanner
  [okf — the engine](/systems/treadle.md).
