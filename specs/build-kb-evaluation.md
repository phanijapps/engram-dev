# Build kb rewrite and evaluation

Date: 2026-10-10, America/New_York.
Implementer: `agent:codex`.
Source revision: `ec337605f0aac3e6fde1225cd4842d88111c969e`, with the skill changes in the working tree.

The skill now defines source-backed discovery, bounded refresh after critical
changes, and read-only audit. It covers product context, related documents,
architecture, dependency direction, interfaces, domain entities, events, storage,
operations, and chronology. Each area needs evidence or an explicit gap.

This is a follow-up to `specs/build-kb-critical-review.md`.
The original review remains unchanged.

## Implemented changes

The authoritative directory is
`treadle/packages/cli/harness/skills/sdlc/build-kb/`.
It contains the revised entrypoint, four revised resources, and four new resources
for coverage, incremental refresh, chronological records, and current CLI forms.

The rewrite removes the retired indexing and template procedures.
Graph tools remain optional and their results require source checks.
The skill supports source inspection in any language and preserves existing
documentation formats. It does not require a harness installation.

Critical public interfaces, event contracts, storage, authentication, domain
invariants, deployment topology, and dependency changes select a refresh pass.
That pass examines staged, unstaged, new, renamed, and deleted sources.
It traces affected callers and consumers before updating current knowledge.
It respects admitted task scope and preserves accepted or closed records.

Chronological records distinguish event dates, observation dates, and unknown
dates. Ascending history concepts coexist with OKF logs in newest-first order.
Current explanations remain organized by topic.

The instructions establish agent routing, not a filesystem watcher or new host
hook. The evaluation does not establish automatic host execution.

## Evaluation method

Independent agents used the skill to produce actual documentation in isolated
fixtures under `/tmp/build-kb-forward-eval/`.
The initial discovery and refresh agents received realistic requests and raw
artifacts without the intended answer or the earlier review conclusions.
The implementer inspected their output against the supplied source behavior.

Acceptance criteria included complete coverage accounting, representative flow
traces, explicit inaccessible evidence, source-backed history, accurate critical
change impact, and preservation of original sources and accepted records.
CLI grammar and actual documentation checks were separate from semantic review.

| Scenario                     | Observed result                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Service discovery            | Produced five connected concepts, a root index, and a chronological log. Documented the web caller, authenticated `POST /parcels`, creation logic, SQLite schema and HTTP event provider. Separated domain, HTTP, event and database representations. Recorded the inaccessible notification contract and absent delivery guarantees. |
| Dirty monorepo refresh       | Inspected staged event changes, unstaged authorization, a staged client rename and an untracked migration despite a fresh HEAD stamp. Documented the unchanged reporting consumer's `orderId` incompatibility, missing client authorization and nullable `warehouse_id` addition. Preserved the accepted decision and source files.   |
| Initial Go library discovery | Preserved the existing plain Markdown home and documented the `Score` interface and local consumer. Events and storage remained not applicable. The run exposed an inappropriate OKF validation attempt; its exit 1 and missing-frontmatter results were retained.                                                                    |
| Final portable discovery     | Produced six connected concepts in a new compatible bundle while preserving all six original files, including plain Markdown history. Git checks exited 128; source hashes supplied provenance. Go tests and applicable document checks passed. No REST, events, storage, product personas or historical rationale were invented.     |
| Final library audit          | Audited the established plain Markdown home without writes or inappropriate OKF checks. Direct checks and Go tests passed. Reported one SMELL in generated documentation: adjacent float64 inputs can produce equal scores despite a decreasing mathematical formula. The bounded repair was reported without applying it.            |

The service's two tests passed with exit 0.
Its final bundle validation reported 0 errors and 0 warnings, with 32 unbaselined
source anchors. Search, read, links, and direct source checks passed.
The initial library's `go test ./...` passed with exit 0.
Direct checks across those two fixtures verified 59 links, 101 source locations,
and preservation of all 20 original files.

The refresh fixture's final validation reported 0 errors and 0 warnings, with 21
unbaselined source anchors. Search, read, links, and direct assertions passed.
The direct assertions reproduced `KeyError('orderId')`, inspected the client
request without network access, and applied both SQL statements in memory.
The source and accepted decision hashes remained unchanged.

The observed failures led to three final refinements:

- Harness checks apply to compatible bundles; other formats use their applicable checks.
- A nonexistent bundle's exit 0 cannot establish authored content or completeness.
- Repository Markdown outside an OKF bundle uses source resources and inline paths,
  avoiding invalid concept edges.

The fresh portable run also exposed missing new-bundle syntax guidance.
The final CLI resource now gives the current OKF version and a valid source
mapping example, with workspace-relative resources and optional source identifiers.
The exact example was instantiated in a separate fixture; validate, anchors, and
read each exited 0, with 0 validation errors, warnings, or informational messages.

Final portable checks verified 36 links, 27 source resources, 31 source citations,
and all six original file hashes. Validation reported 0 errors and 0 warnings.
All 27 anchors remain unbaselined and status correctly reported no stamp.
The read-only audit checked 21 links, 32 source references, and six original
hashes. Its Go test result came from cache, as reported by the evaluator.
These bounded scenarios do not establish accuracy for every possible repository.

Raw fixture reports and generated documents remain in the temporary evaluation
roots. Their command results and material findings are recorded here.

## CLI and skill verification

The skill-creator `quick_validate.py` exited 0 for the final skill.
A reference check covered all 9 Markdown files and found 0 missing links.
The entrypoint uses automatic skill selection defaults; no explicit-only policy
was added.

Thirteen documented CLI forms ran successfully in a separate temporary bundle.
These included validate, anchors, status, search, read, links, findings list,
fingerprints, stamp, and a positional findings proposal.
The proposal existed only in that evaluation bundle; no live finding or human
resolution was written. Every invocation exited 0.

Final entrypoint SHA-256:
`057b88dd7489a26e736d34266eaa12eaee67091f382cacf42f70e9737358420d`.

## Independent red foreman review

Reviewer: `/root/build_kb_critique`, with the red-foreman role.
Final verdict: **PASS — nothing to fix**.

The reviewer inspected all nine files and rechecked the final compatibility
refinements. Skill validation, diff checks, relative references, current CLI help,
and all three selective installer previews exited 0.
The reviewer independently reproduced empty-bundle validation, plain Markdown
incompatibility, and the outside-bundle Markdown link behavior.
The reviewer also rechecked the final bundle example against the contract and
reran its validate, anchors, and read operations, all with exit 0.
Final CLI resource SHA-256:
`b647ebfee01453584778959353f574e8ea9779bb7eb18b649eef663cbe96e26a`.

Each installer preview selected exactly one `build-kb` update, the correct host
destination, no extra-file deletion, and no wiring changes.
This verdict covers the instructions and installer plan. Behavioral outcomes
come from the separate forward evaluations and source inspection.

## Repository verification

All commands below ran after the final skill refinements from `treadle/`.

| Command             | Actual result                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm check`        | Exit 0; typecheck, lint, format checks, 39 test files and 172 tests passed.                    |
| `pnpm coverage`     | Exit 0; statements 86.22%, branches 76.08%, functions 94.71%, lines 86.22%; all floors passed. |
| `pnpm corpus:check` | Exit 0; committed golden bytes reproduced.                                                     |
| `pnpm brand:check`  | Exit 0; brand fence clean.                                                                     |
| `pnpm audit:prod`   | Exit 0; no known vulnerabilities reported.                                                     |
| `pnpm links`        | Exit 0; all checked live Markdown links resolve.                                               |

Read-only live wiki validation, anchors, and status each exited 0.
They reported 0 errors, 0 warnings, 153 anchors with 0 needing review, a fresh
HEAD stamp, and 1 existing pending finding.
Most source anchors remain unbaselined; these checks do not establish dirty
TypeScript or Markdown accuracy. The existing stamp was preserved.

## Installation verification

The installer updated `.pi/skills/build-kb`, `.codex/skills/build-kb`, and
`.claude/skills/build-kb` after the forward evaluations and final schema check.
Each invocation exited 0 and wrote 9 skill files.

The command used for each of `pi`, `codex`, and `claude`, from `treadle/`, was:

```text
pnpm exec tsx packages/cli/src/main.ts init harness --agent HOST --scope project --skills build-kb --no-agents --no-hooks --root /home/videogamer/code/memex_beta --manifest /home/videogamer/code/memex_beta/treadle/packages/cli/harness/harness.json --force
```

`HOST` was replaced with each requested host.
Fresh machine previews selected only `build-kb`, with no extras or wiring changes.
Post-install SHA-256 comparisons verified all 9 files on each host against the
authoritative source, for 27 matching installed files.
Existing installation ownership and wiring records were preserved.
The pre-existing wiki stamp, Codex hook configuration, and Claude settings
remained byte-identical. No unrelated skill or runtime hook was updated.
