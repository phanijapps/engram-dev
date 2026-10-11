# Critical review of the build-kb skill

Review date: 2026-10-10, America/New_York.
Source revision: `ec337605f0aac3e6fde1225cd4842d88111c969e`.
Reviewer: `agent:codex`.
Independent reviewer: `/root/build_kb_critique`, with the red-foreman role.

The current skill does not meet the requested documentation scope.
It has useful evidence rules, but it lacks coverage requirements and a change maintenance workflow.
Some procedures still describe the retired code indexer.
This review proposes changes. It does not approve or implement a new harness workflow.

The reviewed authority is `treadle/packages/cli/harness/skills/sdlc/build-kb/`.
The installed Codex `SKILL.md` matches that source byte for byte.
Related sources include the current knowledge CLI, lifecycle hooks, implementation skill, review skill, and documentation lifecycle proposal.

## Findings

### F1 BLOCKER The index procedure describes absent capabilities

`SKILL.md:41` names a deterministic tree-sitter index procedure.
Lines 43 through 47 say indexing is delegated, then promise managed concepts, incremental extraction, and a stamp.
The single-project resource still includes detached index flags at line 7.
The monorepo resource promises generated package summaries at line 18.
These instructions cannot form an executable procedure for the current engine.

`resources/semantic-extraction.md:3` requires `know code rules`.
Line 24 requires `know new`.
Neither command appears in the current CLI at `treadle/packages/cli/src/commands/know.ts:28`.
An actual `know code rules .. ../wiki` invocation exits 1 with `unknown command 'code'`.

Fix: replace the index procedure with source inspection and optional external extraction.
State the supported commands and each tool's actual limits.
Remove retired commands from all linked resources.

### F2 BLOCKER Freshness can conceal source changes

`SKILL.md:17` checks HEAD against the stamp.
Line 30 uses a fresh stamp to skip discovery steps.
`resources/single-project-strategy.md:26` uses the same comparison as a completion signal.
The skill does not require inspection of dirty, new, renamed, or deleted sources.

The current scanner selects Python files at `treadle/packages/knowledge/src/fingerprints.ts:54`.
The stamp compares HEAD values at `treadle/packages/knowledge/src/stamp.ts:77`.
The CLI reports untracked anchors without flagging them for review at `treadle/packages/cli/src/commands/know.ts:158`.
Consequently, green freshness and zero flagged anchors cannot establish current TypeScript or Markdown knowledge.

Fix: inspect the actual diff and cited sources before each maintenance pass.
Preserve the previous source baseline until the affected claims have been checked.
Report unbaselined sources explicitly.
Reliable automatic detection across languages needs separate runtime work.

### F3 DEFECT The findings example does not match the CLI

`SKILL.md:70` supplies `--destination` and `--kind` after positional arguments.
The CLI supports positional bundle, source, destination, and kind arguments plus `--rationale` at `treadle/packages/cli/src/commands/know.ts:112`.
`resources/semantic-extraction.md:33` also uses unsupported named arguments.
Its search example at line 36 omits the bundle argument.

Fix: use the current argument forms throughout the skill and resources.
Retain human resolution of normative proposals.
Do not run a findings proposal merely to test its syntax against the live ledger.

### F4 DEFECT Product context and related documents have no coverage requirement

`SKILL.md:21` inventories repository shape, branch state, and technologies.
Lines 58 through 63 offer broad concept guidance.
They do not require product purpose, users, capabilities, domain vocabulary, or a document inventory.
The monorepo resource mentions package documents only as a gotcha at line 43.

Fix: inventory existing product documents, requirements, READMEs, design records, runbooks, and interface specifications before authorship.
Record their locations, authority, dates, and conflicts with current code.
Distinguish observed implementation from intended product behavior.
Mark missing context as unknown instead of inferring user needs from module names.

### F5 DEFECT Architecture, dependencies, and entities lack an explicit contract

`SKILL.md:60` asks for systems, relationships, and evidence.
The resource seeds do not require inbound consumers, outbound providers, external systems, or contract inventories.
They do not distinguish domain entities from REST resources, event payloads, and database models.
An agent can follow these instructions and omit all those surfaces.

Fix: require the coverage matrix below.
For each dependency, define direction relative to the documented component.
Record unknown consumers and unavailable external documents explicitly.
Do not treat package dependencies or import graphs as a complete runtime dependency map.

### F6 DEFECT Git history does not supply a chronological documentation view

`SKILL.md:82` treats Git history as the durable record.
It does not define dated entries, source references, chronological navigation, or supersession.
Git history can establish a source change; it cannot establish the reason for every decision.
The owner rejected historical retrospective reconstruction, as recorded at `wiki/project/documentation-lifecycle.md:21`.

Fix: maintain a chronological index of evidenced changes and decisions alongside the current topic pages.
Preserve original records and link later corrections or superseding records.
Separate event dates from observation dates.
Keep undated events explicitly undated.
Do not reconstruct session experiences or owner intent from commits.

### F7 DEFECT Critical changes do not trigger a defined maintenance pass

The trigger description at `SKILL.md:3` contains explicit documentation requests only.
The post-tool guard at `treadle/packages/cli/harness/hooks/post-tool-check.js:17` protects managed paths.
It does not classify critical changes or invoke `build-kb`.
The context reader at `treadle/packages/cli/src/harness/context.ts:83` reports wiki availability and freshness.
It does not compute affected knowledge or schedule an update.

The implementation skill notes staleness as a task or review follow-up at `treadle/packages/cli/harness/skills/sdlc/implement/SKILL.md:47`.
The review skill checks knowledge conformance at `treadle/packages/cli/harness/skills/sdlc/review/SKILL.md:38`.
Neither defines an invocation contract for incremental `build-kb` work.
Documentation maintenance remains a draft practice at `wiki/project/documentation-lifecycle.md:17`.

Fix: define critical changes, the affected source set, and the expected maintenance result.
Integrate a bounded documentation pass into the approved task context and review expectation.
Host hooks need separate implementation and acceptance checks.
A skill description alone cannot guarantee automatic execution.

### F8 DEFECT Validation does not establish documentation completeness

`SKILL.md:79` checks bundle conformance, freshness, and findings.
It does not check whether documented interfaces match code or whether required coverage is complete.
Its instruction to omit unevidenced sections at line 63 can conceal missing product context or dependencies.

Fix: report each required area as evidenced, absent, inaccessible, unresolved, or not applicable, with a reason.
Verify important claims against sources and representative tests.
Use discovery, incremental refresh, and audit modes with explicit scope and exit criteria.
Keep validation success distinct from documentation completeness.

## Proposed documentation coverage

| Area                      | Required content                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Product context           | Purpose, users, capabilities, primary journeys, constraints, domain terms, and evidence gaps.                                                   |
| Related documents         | Source inventory, authority, date, current applicability, conflicts, and references to original records.                                        |
| Architecture              | System boundary, components, responsibilities, deployment topology, important request and data flows.                                           |
| Dependencies              | Inbound callers and consumers; outbound providers; exchanged contracts; ownership, versions, and failure behavior where evidenced.              |
| Domain entities           | Identity, lifecycle, relationships, invariants, and the code that implements them.                                                              |
| REST and other interfaces | Methods, routes or operations, inputs, outputs, authentication, errors, and callers where evidenced.                                            |
| Events                    | Producers, consumers, channels, payloads, versions, delivery guarantees, retries, ordering, and idempotency where evidenced.                    |
| Database and storage      | Tables or collections, fields, keys, relationships, constraints, migrations, and read and write paths. Include files and caches where relevant. |
| Operations                | Configuration, build and test commands, deployments, diagnostics, and recovery procedures where evidenced.                                      |
| Chronology                | Dated source changes and decisions linked to affected current pages and original evidence.                                                      |

Each area needs an evidence result, including gaps and not applicable results.
Existing repository formats and the accepted bundle contract determine page metadata and placement.
The skill should inspect any language or repository shape without requiring an unavailable language-specific indexer.
External extraction tools remain optional and their results require source checks.

## Proposed chronological records

A chronological index can use known event dates in ascending order.
Existing OKF `log.md` files must retain their date groups in newest-first order.
That log convention appears at `wiki/assets/contracts/OKF_SPEC_v0.2.txt:542`.
An ascending view needs a separate index; it must not reverse the established log format.
Each entry should include the observation date, affected components, factual change, evidence reference, and links to current pages.
Use a commit or release reference when available.
Use source hashes for observations of uncommitted content.
Record rationale only when an actual decision record supplies it.
Place undated records in an explicit undated group, ordered by observation date.

Current explanations should remain easy to find by topic.
The chronological index links those explanations to their evolution.
This preserves both the requested history and a usable account of the present system.

## Proposed critical change triggers

Critical changes include public interfaces, event schemas, database schemas, migrations, authentication, authorization, and core domain invariants.
They also include dependency substitutions, deployment topology changes, and changes to cross-component behavior.
A repository can add evidenced critical paths or components to this definition.
File size and line count alone do not establish criticality.

1. Establish an explicit comparison base and scope.
2. Inspect committed changes and staged, unstaged, new, renamed, and deleted files within that scope.
3. Trace affected interfaces, callers, consumers, storage, and wiki sources.
4. Update the affected current pages and chronological entries after a coherent change.
5. Verify the affected claims, links, anchors, and coverage results before review.

The maintenance result should identify changed sources, affected pages, evidence, and unresolved gaps.
A no-update result should explain why documentation remains accurate.
Run a bounded refresh for affected knowledge; a critical change need not cause a complete repository rewrite.

Instructions can establish the agent practice once the workflow is accepted.
Automatic host integration needs a detector and a supported event on each host.
Detection should inspect the actual repository diff because shell commands and external editors can bypass file-edit events.
The trigger should record a maintenance need and schedule a coherent pass, avoiding recursive updates after every document write.
Unsupported or inactive hosts need an explicit manual fallback.

Approved task plans must include the affected documentation and sources before execution.
The current implementation skill restricts work to its frozen context at `treadle/packages/cli/harness/skills/sdlc/implement/SKILL.md:21`.
A maintenance trigger cannot silently expand that scope or perform owner actions.
Runtime enforcement and the skill rewrite are separate changes with different verification needs.

## Verification evidence

The following commands ran from `treadle/` during this review.

| Command                                                                      | Actual result                                                                                             |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                                                 | Exit 0; 39 test files and 172 tests passed, with typecheck, lint, and format checks.                      |
| `pnpm coverage`                                                              | Exit 0; statements 86.22%, branches 76.08%, functions 94.71%, lines 86.22%. All repository floors passed. |
| `pnpm corpus:check`                                                          | Exit 0; 90 golden files reproduce exactly.                                                                |
| `pnpm brand:check`                                                           | Exit 0; brand fence clean.                                                                                |
| `pnpm audit:prod`                                                            | Exit 0; no known vulnerabilities reported.                                                                |
| `pnpm links`                                                                 | Exit 0; 95 live files, all checked Markdown links resolve.                                                |
| `pnpm exec tsx packages/cli/src/main.ts know --help`                         | Exit 0; current command inventory confirmed.                                                              |
| `pnpm exec tsx packages/cli/src/main.ts know findings propose --help`        | Exit 0; positional arguments and `--rationale` confirmed.                                                 |
| `pnpm exec tsx packages/cli/src/main.ts know code rules .. ../wiki`          | Exit 1; unknown command `code`, confirming the broken procedure.                                          |
| `pnpm exec tsx packages/cli/src/main.ts know validate ../wiki`               | Exit 0; 0 errors, 0 warnings, 93 informational messages.                                                  |
| `pnpm exec tsx packages/cli/src/main.ts know anchors ../wiki --workspace ..` | Exit 0; 153 anchors checked, 0 flagged for review; untracked sources reported.                            |
| `pnpm exec tsx packages/cli/src/main.ts know status ../wiki --workspace ..`  | Exit 0; fresh HEAD stamp, 44 concepts, 0 errors, 0 warnings, 1 pending finding.                           |

These repository checks do not test semantic completeness of the skill.
The freshness limitations remain material despite the passing results.
The existing dirty stamp and untracked Codex hook file were preserved.
This review did not rewrite fingerprints, refresh the stamp, commit files, or modify the skill or runtime.

## Independent review

Verdict: **MAJOR REWRITE**.
The independent reviewer returned 2 blockers and 5 defects against the current skill.
The blockers concern the absent indexing pipeline and the HEAD-based freshness shortcut.
The defects concern broken CLI examples, incomplete coverage, missing change triggers, absent chronology, and weak completion criteria.
The reviewer independently inspected the skill, resources, CLI, hooks, and knowledge source checks.

The reviewer reran these commands from the repository root:

| Command or check                                                                                                                                                                                | Actual result                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `node treadle/packages/cli/dist/src/main.js know --help`                                                                                                                                        | Exit 0; absent extraction and template commands confirmed.                        |
| `node treadle/packages/cli/dist/src/main.js know code rules . wiki`                                                                                                                             | Exit 1; unknown command `code`.                                                   |
| `node treadle/packages/cli/dist/src/main.js know new wiki BusinessRule review-placeholder`                                                                                                      | Exit 1; unknown command `new`.                                                    |
| `node treadle/packages/cli/dist/src/main.js know status wiki --workspace .`                                                                                                                     | Exit 0; fresh stamp and 0 flagged anchors.                                        |
| Read-only `anchorReview` call                                                                                                                                                                   | Exit 0; 147 untracked source anchors, 6 wiki-internal anchors, 0 current anchors. |
| `node treadle/packages/cli/dist/src/main.js know findings propose wiki README.md review-placeholder golden-path --destination wiki/review-placeholder.md --kind golden-path --rationale review` | Exit 1; unknown option `--destination`; no proposal written.                      |
| `node treadle/packages/cli/dist/src/main.js know search review-placeholder`                                                                                                                     | Exit 1; required query missing.                                                   |
| `node treadle/packages/cli/dist/src/main.js know validate wiki`                                                                                                                                 | Exit 0; 0 errors and 0 warnings.                                                  |

The independent review also identified the existing OKF log order.
The proposal above preserves that order and separates an optional ascending chronological view.
Neither reviewer applied implementation fixes or owner actions.
