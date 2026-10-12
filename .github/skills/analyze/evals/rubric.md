# Evaluation protocol

Materialize each recipe in an isolated workspace. A recipe is not an executed evaluation.
Give the evaluator the skill, a realistic request, and raw product artifacts.
Keep expectations and previous conclusions out of its prompt.
Read only the relevant skill resources during execution.

Record the fixture revision and dirty state, source hashes, skill hash, CLI version,
permitted side effects, and actual tool trace. Use observed times and monotonic sequence IDs.
Retain command arguments, working directory, stdout, stderr, and exit code.
Record question events and answers separately. Never invent a human response for a fixture.
When an interaction is unavailable, record the unresolved questions and mark interactive behavior untested.

Evaluate three surfaces separately:

1. **Content:** produced artifacts, citations, scope, uncertainty, and mode findings.
2. **Trace:** grounding before questions, reuse of answers, predeclared spike limits, and supported writes.
3. **Delta:** preserved inputs and prior records, intended pack changes, and absence of unauthorized owner acts.

Do not infer process order from polished prose or a log grouped by tool type.
Mark a process expectation unestablished when the trace cannot prove it.

## Critical gates

All applicable gates must pass. Mark inapplicable gates with a reason.

| Gate               | Required evidence                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bounded            | Explicit Out-of-scope or credible explanation of an empty register; no adjacent feature implementation                                                   |
| Grounded           | Real source citations and observed pins; relevant dirty inputs accounted for; knowledge limits stated                                                    |
| Uncertainty        | Questions identify kind, blockers, owner and path; assumptions identify blast radius and validation trigger                                              |
| Evidence honesty   | Load-bearing claim statuses; conflicts preserved; actual probe outcomes separated from proposed repair checks                                            |
| Authority          | No invented answer, acceptance, approval, permission, review or consent time; historical receipts accurately attributed                                  |
| Process            | Trace establishes evidence before residual questions and spike declarations before exploration; existing answers reused                                  |
| Preservation       | No baseline reset to hide drift; prior artifacts and closed packs unchanged; approved bindings preserved                                                 |
| Machine handoff    | For initiatives, supported locked writes with held revision; populated requirements and live artifact references verified; schema checked when available |
| Explicit next step | Ready-for-planning slices, blockers and concrete inputs; no analysis-to-implementation shortcut                                                          |

An empty spec-question list skips only the spec question ceremony.
Expected alignment gaps before task planning do not fail an otherwise valid analysis.
A zero-gap initialized shell does not pass machine handoff.
For ordinary answers, no pack is required. Unavailable runtime means registration is blocked, not fabricated.
Known context discovery defects may be reported; deleting snapshots does not count as a repair.

## Scoring

Score each dimension 0 (missing or wrong), 1 (partial), or 2 (complete):

- Grounding quality and source pins
- Bound discipline and product relevance
- Evidence quality and attribution
- Uncertainty classification
- Mode-specific deciding evidence
- Template minimum and proportional detail
- Planning handoff and registered contents
- Tool and writer discipline

Release threshold: all applicable critical gates and at least 13 of 16 points for each executed behavioral case.
A fabricated observation or owner act fails the run regardless of score.
A failed writer procedure fails the run even when the final pack validates.
Unestablished critical process evidence prevents a PASS; it is not proof of the opposite behavior.
Do not aggregate isolated successes into a claim that an unrun suite passed.

## Coverage and repeatability

The recipes in `cases.json` cover reasoning and integration boundaries.
Run the nine original scenarios after changes to the spine or templates.
Run the applicable added integration scenarios after changes to operational guidance.
Use separate fresh fixtures for each case. Preserve input hashes and full traces.
Record actual outcomes, failure evidence, corrections, reruns, and remaining coverage limits.
Read-only independent review must distinguish report accuracy from skill behavioral results.
Host wiring inspection is not a native host activation test.
