---
type: Domain
status: stable
created: 2026-10-08
updated: 2026-10-08
title: The SDD loop synthesis — three research lines, one loop
description: 'What three 2026 papers agree on, where they tension, and what our harness loop should adopt. Arming the loop redesign (proposals P-1 to P-5, pending owner decisions Q1/Q2).'
sources: [{ id: src, resource: docs/specs/sdd-research/analysis.md }]
tags: [research, sdd, loop, synthesis]
---

# Overview

Three papers, three directions, one convergence: **distrust the
generator, trust the stack of artifacts and checks; keep the
world-judgment human.**

- [Misfit-Governed Development](/research/misfit-governed-development.md)
  — the theory of verification: fit is negative; the enumeration rules.
- [The EPIC framework](/research/epic-framework.md) — the anatomy of
  good artifacts: 40 practices in 10 dimensions.
- [SpecAgent](/research/specagent.md) — the dynamics of repair: root
  causes live upstream; strength is not proof success.

# Convergences

1. Distrust the generator. Enforcement beats guidance; agents fill
   gaps with assumptions; repairers get narrow edit rights.
2. Artifacts are the control surface. What they contain (EPIC), how
   they govern (MGD), and how their weakness propagates (SpecAgent).
3. Determinism where decidable; structure everywhere else. Gates and
   verifiers render verdicts; structured reports feed repair; model
   judgment stays advisory or gets a static probe.
4. The world-judgment is non-delegable. MGD's S = W; EPIC's "making a
   decision even if I don't"; SpecAgent's REPLAN.
5. Loop state must persist. Amendment records, unresolved-item
   tracking, revisitable specification sets.

# Tensions, resolved for us

- **Who owns the specification?** MGD: humans own it. SpecAgent: the
  agent writes and revises it. Resolution: SpecAgent specs verify
  fixed code; MGD specs generate new code. In our harness the
  authority stays human through the findings ledger; agents propose.
- **How much process, how early?** MGD carries heavy machinery from
  day one; EPIC practitioners want to "just run it right now."
  Resolution: the MGD economics argument — endlessly regenerated
  artifacts need machinery; one-shot artifacts can afford human
  validation. Adopt checks as artifact classes earn reuse.
- **How heavy?** MGD's reference harness is enormous. The paper itself
  fixes the obligations and leaves the mechanisms as choices. We adopt
  obligations, not mechanism sizes.

# What our loop already has

See the digest, §5, for the full mapping table. Headlines: the findings
ledger is the legislative circuit; fingerprints and anchors are proxy
reconciliation; "never claim a check you did not run" is M_run = M;
bounded artifacts are piecemeal growth.

# Proposals for the loop redesign

Full statements with rationale live in
`docs/specs/sdd-research/analysis.md` §6. Pending owner decision (Q1):

1. **P-1** — checks first-class; a check that cannot run is FAIL,
   never PASS.
2. **P-2** — EPIC as the analyze/plan review checklist;
   `[NEEDS CLARIFICATION]` as a standard marker mapped to recorded
   questions.
3. **P-3** — ACCEPT / IMPROVE / REPLAN as review verdict routing; a
   twice-failing fix escalates upstream with the failure chain named.
4. **P-4** — four-form wiki patterns: doctrine + examples today; add
   prohibition and gate sections (Q2).
5. **P-5** — implement retrieves verified patterns by structural
   similarity to the task's target files.

# Evidence

- [The digest](/research/sdd-loop-synthesis.md) anchors every claim to
  a paper section: `docs/specs/sdd-research/analysis.md`.
- Paper identities: arXiv 2610.01372, 2610.07534v1, 2610.05132v1.
