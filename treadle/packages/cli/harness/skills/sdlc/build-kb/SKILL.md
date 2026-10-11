---
name: build-kb
description: >-
  Build, refresh, or audit codebase knowledge from source code and related documents.
  Use for documenting a repository, product context, architecture, dependencies,
  interfaces, entities, and their history. Also use after critical changes to public
  APIs, events, storage, authentication, domain invariants, deployment topology, or
  external dependencies to refresh affected documentation.
---

# build-kb

Document the current system and its evidenced evolution. Support applications,
services, libraries, and repositories in any language through source inspection.
External indexers can assist; they are not prerequisites.

Use the repository's existing knowledge home and formats. If none exists, create
`wiki/`. Adopt existing documents as sources; do not relocate them or create a
second authority for task state. Preserve generated sections and `wiki/code/**`.
State the selected knowledge home. A directory of loose documents can supply
sources or become that home; its name alone does not establish an OKF bundle.

## Choose the pass

- **Discover:** build initial knowledge or fill broad coverage gaps. Read
  [the coverage contract](resources/coverage.md), then the relevant
  [single-project](resources/single-project-strategy.md) or
  [monorepo strategy](resources/mono-repo-strategy.md).
- **Refresh:** after a critical component change or an explicit update request,
  inspect the diff and refresh affected knowledge. Read
  [incremental refresh](resources/incremental-refresh.md) and the affected rows
  of the coverage contract. Run this pass before the code change's review.
- **Audit:** compare existing knowledge with current sources and the coverage
  contract. Return omissions, contradictions, stale claims, and repair routes.
  Audit is read-only unless the user requests repairs.

For dated records in any pass, read
[chronological records](resources/chronological-records.md).
Use [semantic extraction](resources/semantic-extraction.md) for domain rules and
[graph evidence](resources/graphify.md) when a suitable graph tool is available.
Read only the resources that apply to the pass.

## Inspect before writing

1. Establish the requested repository roots, knowledge home, and scope.
   Inspect manifests, entry points, source layout, tests, existing documents,
   and deployment or build configuration. Distinguish active code from archives.
2. Inventory relevant product briefs, requirements, READMEs, architecture records,
   interface specifications, migration records, and runbooks. Record authority,
   dates, and conflicts with code. Ask only for context the available evidence
   cannot supply; record unavailable documents or unknown product intent.
3. Inspect repository state and actual source content. Include staged, unstaged,
   untracked, renamed, and deleted sources within scope. Record the revision,
   comparison base, and hashes of dirty sources used as evidence. Without Git,
   record source hashes and observation dates.
4. For an existing harness-compatible bundle, run available read-only health
   checks using [the current CLI forms](resources/cli.md). For a new wiki, verify
   that authored concepts exist before treating validation as meaningful.
   Preserve other document formats and use their applicable checks. A matching HEAD stamp is not proof
   of source accuracy. The current harness fingerprint scanner covers Python
   only; TypeScript, Markdown, and other sources can remain unbaselined.

Do not skip discovery or claim accuracy because the stamp says `fresh`.
Do not rewrite baselines or stamp the bundle before checking affected claims.

## Author connected knowledge

Cover product context, related documents, architecture, upstream and downstream
dependencies, domain entities, interfaces, events, storage, and important flows.
Use the coverage contract to distinguish evidenced, absent, inaccessible,
unresolved, and not applicable areas. A missing section must not hide a gap.

Keep current explanations organized by topic. Link components, contracts,
entities, and flows so readers can follow interactions in both directions.
For each relationship, name its producer or provider, caller or consumer, and
the exchanged contract. Verify graph relationships against code and tests.

Cite each load-bearing claim to observed source locations. Use revisions or
source hashes when needed to distinguish observations. Product intent comes
from product evidence; module names alone do not establish users or outcomes.
When sources disagree, record the conflict and the basis of the current account.

For harness bundles, concepts need `title`, `type`, and `description`; add
`sources` for evidence and use `status: draft|stable|deprecated` where applicable.
Indexes and logs follow the bundle contract. In other repositories, preserve
their established format and explain any verification limits.

Describe existing enforced behavior directly. Proposed policies, golden paths,
and future constraints remain drafts and use the findings ledger when available.
Human acceptance stays separate from documentation authorship. Never resolve a
finding, invent approval, or repeat a declined proposal on the owner's behalf.

Record dated changes and decisions in chronological navigation, with links to
current explanations. Preserve original and closed records. Later corrections
use dated supplements or superseding records. Do not infer historical intent or
session experiences from task statuses or commits.

## Verify the pass

- **Discover:** account for every coverage area and trace representative flows
  through components, interfaces, events, and storage. Record evidence gaps.
- **Refresh:** account for changed sources, affected callers and consumers,
  updated pages, checked claims, chronology, and any justified no-update result.
- **Audit:** report severity, source locations, missing coverage, affected pages,
  and bounded repair routes. Do not apply fixes in an audit-only request.

Check links, source locations, and document-to-code consistency. For a
harness-compatible bundle, run available validation, anchors, status, and
representative search/read checks. Use applicable checks for other formats.
Report actual commands and exit codes, warnings, unbaselined sources, and pending
findings. Format validation alone does not establish semantic completeness.
Use repository-specific verification requirements when they are stricter.

After verification, refresh fingerprints or stamps only when the authorized
pass calls for it, and retain their coverage limits in the result. A content
baseline does not establish that every claim was reviewed.

Return the scope, coverage result, changed pages, chronological entries, checks,
and remaining gaps. Commit only when the user or repository workflow authorizes
it. This skill defines agent routing; it does not install or claim a filesystem
watcher or automatic host hook. Existing task scope and owner gates still apply.
