# Evaluation protocol — analyze skill

Run each case against its fixture with the skill and a clean workspace.
Evaluate the produced artifact, not the conversation. Keep expectations
out of the execution prompt. Record fixture revision, skill version,
tools (memex-core version), results, and failure evidence. Do not label
unevaluated cases as passed.

## Critical gates (all must pass — zero tolerance)

1. **Bounded:** artifact has an explicit Out-of-scope register (or stated
   credibility for none); no adjacent-scope creep.
2. **Uncertainty preserved:** open questions and assumptions are recorded
   with owners/paths (questions) and blast radius/triggers (assumptions);
   none silently resolved.
3. **Evidence honesty:** every load-bearing claim carries an evidence
   status; no invented content; unsupported sections omitted or marked
   "none identified" with rationale; conflicts recorded as `conflicting`.
4. **Grounding order:** deterministic sources (resolve/search/compile,
   wiki, files) consulted before any user question; no re-asking of
   recorded questions.
5. **No authority claims:** no acceptance, success, or verified marks;
   normative claims routed through findings proposals.
6. **Explicit handoff:** ready-now / blocked-on / next-step present and
   slice-shaped — work can proceed on unblocked slices immediately.

## Scoring dimensions (0 = absent/incorrect, 1 = partial, 2 = complete)

- Grounding quality (tools used, citations real)
- Bound discipline (smallest unblocking artifact)
- Evidence quality (statuses, pins, no fabrication)
- Uncertainty handling (question/assumption registers)
- Mode routing (right mode, right artifact, no mode blur)
- Template conformance (contract filled honestly)
- Handoff quality (interleavable next steps)
- Tool discipline (memex-core used as specified; freshness gate honored)

Release threshold: all critical gates + at least 13/16. A single
fabricated-evidence or authority-claim instance fails the run regardless
of score.

## Notes

- Cases specify synthetic fixture recipes; materialize them in isolated
  test directories before execution. They are not claims of completed
  evaluations.
- Anti-waterfall is the point: an analysis that is complete-but-late or
  complete-but-fabricated fails even when polished.
- Repeat after changing the spine, templates, or routing table.
