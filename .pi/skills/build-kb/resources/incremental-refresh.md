# Refresh after a critical change

Use this pass when a change affects public interfaces, event contracts, storage
models or migrations, authentication, authorization, domain invariants,
deployment topology, external dependencies, or a repository-designated critical
component. Also use it for an explicit bounded documentation update.
Changes to tests or configuration can reveal a changed critical contract.
Line count alone does not establish impact; routine formatting need not cause a
full documentation pass.

## Establish the change set

Use an explicit comparison base appropriate to the request, such as an approved
task base, a reviewed revision, or a named PR base. Do not guess an unspecified
branch. For an uncommitted change, inspect both the index and working tree.
Useful Git forms, run from the actual root, include:

```bash
git status --short
git diff --name-status -M
git diff --cached --name-status -M
git ls-files --others --exclude-standard
```

For committed work, inspect `git diff --name-status -M BASE HEAD` and its content,
using the resolved base. Then include relevant dirty changes. Read new files,
old and new contract definitions, deletions, and renames. Without Git, compare
available source snapshots and hashes; report an unknown base as a gap.

Keep the old baseline intact until affected claims have been checked. Stamping
first can conceal the very source changes the pass needs to inspect.

## Trace and update affected knowledge

1. Map changed sources to existing concepts using source references, searches,
   interfaces, and component ownership. Trace callers, consumers, providers,
   schemas, tests, and configuration across accessible boundaries.
2. Recheck each affected claim and related contract against current sources.
   A producer change can invalidate consumer documentation without editing a
   consumer file. Account for new, removed, and renamed contracts.
3. Update affected current pages and navigation. Preserve accepted decisions,
   original documents, closed records, and frozen generated sections. Deprecate
   obsolete current concepts where appropriate; link replacements.
4. Add evidenced chronological entries for meaningful behavior or architecture
   changes. Separate event dates, source dates, and observation dates.
5. Verify the affected coverage areas, source references, links, and representative
   flows. Run available checks, disclose unbaselined sources, and only then
   perform an authorized baseline or stamp update.

Return an impact account with changed sources, affected components and pages,
checked claims, chronology, command results, and unresolved consumers or gaps.
If no documentation needs an update, record which contracts and claims were
checked and why they remain accurate. Do not equate an unchanged HEAD or an
empty fingerprint result with no impact.

## Execution boundaries and triggers

This skill's description enables agent selection after critical changes. Run a
bounded pass after a coherent change and before review; do not rewrite the wiki
after every intermediate edit. Documentation writes do not recursively trigger
the same refresh.

Include affected documentation and its sources in the authorized task scope.
With frozen context, use the admitted context; missing sources or new scope
return to the repository's planning route. The pass cannot expand an approved
plan, accept decisions, or perform owner actions.

Skill text does not implement a watcher or host hook. When an actual host
integration exists, verify that it detects the repository diff, including shell
and external-editor changes, and routes to this bounded pass. Report unsupported
or inactive integrations honestly and use the agent or manual invocation path.
