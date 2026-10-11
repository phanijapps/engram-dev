# Plan skill and portable Codex hooks review

Date: 2026-10-11. Scope: requested plan skill, design/plan templates, installed
Pi/Codex/Claude copies, and project Codex compatibility wiring.

## Findings and changes

The previous skill had useful traceability and owner gates, but inconsistent templates.
The plan template invited updates to a live status ledger inside the approved plan.
It used question IDs as verification placeholders and blurred proposed entry tasks with executable work.
The design template emphasized one-way decisions despite the requirement for acceptance of all proposed decisions.
Machine-field authoring lacked the shared-lock, held-revision, schema, and normalized-field detail present in analyze.
Advisory context appeared more strongly frozen than the runtime actually supports.
The skill also claimed a live Pi/Claude hard gate where current lifecycle hooks provide context.

The revision corrects those inconsistencies. Progress belongs in canonical evidence and execution-log.md.
Planning reports the structural entry set separately from the machine owner gate and never calls `do next`.
Machine operations document canonical FR/DES/D/T links, artifact hashes, lock/revision/save behavior, and actual pin limits.
Closed and approved records stay intact; changed agreed work gets an explicit successor proposal and new owner review.

The diagram resource selects views by their purpose:

| View                    | Purpose                                                                                 | Usual location                     |
| ----------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| C4 context or container | Actors, system boundaries, upstream/downstream relationships, internal responsibilities | design.md                          |
| Process flowchart       | Branches, validation, rejection, recovery                                               | Design contract or failure section |
| Sequence diagram        | Request/event ordering, persistence, retries, failure alternatives                      | Design interaction section         |
| Task DAG flowchart      | Real prerequisite outputs, branches and joins                                           | plan.md                            |

Captions state proposed/current behavior, trace IDs, evidence and uncertainty, and a plain-text explanation.
Native C4 is experimental; flowchart subgraphs provide a portable C4 model when native support is unavailable.
Small fixes can omit diagrams with a reason. Parser success does not establish visual readability.
The evaluation corpus now has fourteen recipes; three realistic forward scenarios were executed in this pass.
This is a bounded behavioral evaluation, not a claim that every recipe passed.

## Actual evaluations

| Scenario                                                                        | Authored outcome                                                                                           | Observed checks                                                                                                                             |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Multi-service order submission, unsupported native C4, deferred retention scope | Full design, C4 container flowchart, sequence, task DAG, four registered tasks; revision 3; decisions gate | Alignment 0 violations/0 gaps; schema; DAG/diagram edges; nine artifact hashes; upstream source preservation; six inline/raw Mermaid parses |
| Confirmed local validation defect                                               | Mini-design, one task; revision 4; D-1 proposed and T-1 todo                                               | Alignment/status/discovery; schema; actual hashes; original source unchanged; expected baseline regression failure                          |
| Revision of a started plan with unsupported Markdown completion                 | Separate dated successor; revision 3; D-2 proposed; original pack/design/plan/receipt unchanged            | Matching prior digest; preservation hashes; alignment/status/discovery; schema; no manufactured evidence                                    |

All proposals kept decisions proposed and start permission absent. No real owner commands, implementation, or task admission occurred.
Historical owner records in the revision fixture are explicitly synthetic.
The evaluator encountered two guidance gaps: mini-design artifact aliasing and successor representation.
Both are now clarified. An initial full-case Mermaid syntax failure and its locked repair history remain in the evidence.
Mermaid 12.1.0 also parsed all five reusable guidance examples successfully.

The canonical installer updated the plan skill on all three requested surfaces.
All twenty-one source/install file pairs match. Previous owned paths remain, and Pi/Claude hook wiring stays intact.

## Codex path portability

Project hooks now use Node from PATH and resolve the project-relative payload from the nearest ancestor `.codex/hooks.json`.
They preserve session cwd and stdin, including subdirectory sessions, without embedding the checkout path.
Global hooks retain absolute paths for use across unrelated directories. Native packaging remains unchanged.
Regression tests execute moved/root/subdirectory paths, nearest-config failure boundaries, owned-wiring upgrade/removal,
foreign-hook preservation, and global execution from an unrelated directory.

The first actual refresh retained older committed commands because their `node` executable differed from the local ownership record.
It therefore initially duplicated both events. The exact two entries from committed `.codex/hooks.json`
were reconciled into machine-local installer ownership under the user's requested replacement.
The installer then removed them; each event now has one portable callback. No broad deletion or foreign-hook cleanup was added.
The reconciliation and actual installer commands are retained in the evidence.

## Repository verification and review

All six gates exited 0: check, coverage, corpus:check, brand:check, audit:prod, and links.
Check ran 175 tests in 40 files. Coverage: 86.48% statements/lines, 95.04% functions, 76.36% branches.
The five wiki commands exited 0: 44 concepts, 0 errors/warnings, 155 anchors, 0 needing review, one pending finding, fresh stamp.
The architecture wiki now describes planning views and portable project wiring with source references.
The scanner still covers Python only; HEAD freshness does not prove dirty TypeScript/Markdown freshness.

Independent read-only red-foreman review by `agent:roadmap_eval_revision`: **PASS — nothing to fix**.
The reviewer independently verified 21 installed file pairs, 35 fixture snapshots,
three normalized pack/schema/alignment/gate/digest checks, and 11 Mermaid parses.
The reviewer corrected an initial invocation of older-draft Ajv to Ajv2020;
the initial exit 1 and corrected exit 0 are recorded as a tooling correction, not an artifact defect.
Its initial installed-wiring defect is resolved. Independent targeted reruns passed 49 tests in six files.
Native Windows execution, real host activation/trust, and visual rendering remain untested.
Test files remain outside the composite source typecheck/lint surface; executed tests do not close that gap.

Actual outputs, versions, fixture snapshots, hashes, retained failures and limits are in `plan-skill-evaluation-evidence.json`.
