# Analysis: search-kb

Mode: feature. Depth: one subsystem, with portable agent instructions.
Evidence pins: `context/source-pins.json`, observed HEAD `c843b8b7bfb685f748d8b568dee91043db9288ae`.
The manifest and current guide include the prior reviewed reviewer rename as dirty input.
That rename remains a separate prerequisite change; this slice does not rewrite its evidence.

## Evidence

| Claim | Status | Source |
| --- | --- | --- |
| The knowledge plane already supports weighted search, type/tag filters, and deterministic rankings. | implementation-supported | `treadle/packages/knowledge/src/search.ts`, `treadle/packages/cli/src/commands/know.ts` |
| Read can return one concept or its linked neighborhood; its budget limits neighbors, not the seed. | implementation-supported | `treadle/packages/knowledge/src/read.ts` |
| Existing SDLC skills ask for wiki context but lack a dedicated retrieval skill. | implementation-supported | canonical `skills/sdlc/{analyze,plan,implement,review}/SKILL.md` |
| OKF permits unknown types, missing optional metadata, and broken links; sources and trust remain distinct. | declared | vendored `wiki/assets/contracts/OKF_SPEC_v0.2.txt`, sections 4–6 and 11 |
| This repository resolves source anchors relative to the workspace, while OKF concept links use bundle paths. | implementation-supported | `wiki/domain/wiki-contract.md`; `treadle/packages/knowledge/src/links.ts` |
| The owner wants the new skill evaluated and delivered through a PR. | declared | current user request |

## Knowledge limits

Read-only `know search`, `know read`, `know anchors`, `know validate`, and `know status` succeeded locally.
The wiki reported fresh, 0 errors, 0 warnings, and 185 anchors with 0 needing review.
The scanner covers Python only; the stamp compares HEAD rather than dirty content.
Direct source reads and hashes support this proposal. No baseline was reset for analysis.

## Proposed outcome

Retrieve a small, relevant set of concepts using the existing CLI and bundle navigation.
Inspect frontmatter, related concepts, and sources before asserting current behavior.
Separate the concept's claim from source-confirmed behavior and from a proposed rule.
Report missing sources, broken links, stale definitions, omitted neighbors, and genuine no-hit results.
Use direct Markdown reads when the harness CLI is unavailable; report that limit.
Return context to analyze, plan, implement, or review without mutating the wiki or pack.

## Questions and assumptions

Human spec questions: none. The user supplies the target surface and desired capability.
D-1 and D-2 are design choices, proposed in the design rather than invented owner answers.
Source question S-1: ensure portable installs include the skill's resources; resolved by installer tests in T-2.
Experiment E-1: can agents apply the trust and source rules correctly? Resolved by blind evaluations in T-3.
Assumption A-1: the existing CLI is sufficient. Blast radius: retrieval instructions only.
Trigger: a fixture needs behavior the CLI cannot supply. Use direct reads or return a gap; do not add engine behavior.

## Scope and handoff

Ready now: write the search skill and evaluation fixtures, connect the skill to SDLC and installers, evaluate and verify delivery.
Out of scope: new indexes, embeddings, remote search services, hook protocol changes, cloud bootstrap, attested execution, owner acts, and automatic wiki repair.
Planning continues in this pack. D-1/D-2 acceptance and a distinct Start action gate implementation.
