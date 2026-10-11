# Analysis operations

Read this reference before registering an initiative or editing its machine record.
Examples use `do` and `know` subcommands. Prefix them with the installed harness executable.
Check its help and version. Resolve the workspace, knowledge bundle, and pack directory explicitly.
In the source workspace, the Node entry is `packages/cli/src/main.ts`, run through `tsx` from the package workspace root.
Do not assume that the analyzed product contains the harness source or its dependencies.

## Read context

```text
do where <workspace> --json
do status <packDir>
do check <packDir>
know validate <bundle>
know status <bundle> --workspace <workspace>
know anchors <bundle> --workspace <workspace>
know search <bundle> "<question>"
know read <bundle> <cid>
```

These commands inspect state. `do next` creates a task handout and changes the pack.
Do not use it for analysis context. Candidate tasks from lifecycle context have no execution permission.

Check that the bundle exists before validation. A successful validation is not proof of source freshness.
Record `git rev-parse HEAD` and relevant `git status --short` output.
Inspect staged and unstaged diffs. Hash relevant untracked and dirty files whose bytes support claims.
For a non-Git repository, state that limitation and use observed file hashes.
Never label an unbaselined anchor as verified merely because none require review.

Reconcile affected claims before knowledge maintenance. Do not stamp or replace fingerprints first.
The maintenance commands are `know fingerprints <workspace> <bundle>` and
`know stamp <bundle> --workspace <workspace>`.
They change knowledge metadata; they do not re-verify page content.
Use `build-kb` for a bounded refresh when authorized and useful.
Keep the old observations and report scanner limitations.
Code indexing belongs to external tools. There is no `know code index` command.

## Create or reuse an initiative

```text
do init <packDir> --owner-gated --title "<title>" --why "<purpose>"
```

New initiatives use `<workspace>/specs/<slug>/<slug>.json` with `specpack/0.4` and `owner-gated/1`.
The bare CLI default remains 0.3. Existing 0.2 and 0.3 packs retain their original contracts.
Use `do where` to find existing records rather than duplicating a legacy initiative in root specs.
Never adopt a legacy pack or reopen a completed pack as an analysis shortcut.

Initialization creates a shell. It does not register the analysis, requirements, or authority.
Read the pack and current revision before each mutation.
Use commands for supported operations:

```text
do add question <packDir> --id Q-1 --question "<unresolved behavior>" --phase spec --expected-revision <held>
do add decision <packDir> --id D-1 --decision "<proposed choice>" --because "<evidence>" --expected-revision <held>
```

Read the resulting revision before the next command. Missing or stale revisions must fail.
Do not retry by replacing a newer revision. Do not delete locks to make progress.

Question registration records an open question, not an answer.
Use spec phase only for human questions about required behavior.
Human answers and spec approval are separate owner actions when this membership is nonempty.
Keep membership empty when evidence resolves the spec questions.
Proposed design choices and start permission retain their later gates.
Do not issue owner commands or click approval controls on the owner's behalf.

## Author fields without a CLI command

The current CLI has no requirement or artifact add command.
Use the core loader and writer through the repository's supported runtime.
Check the current core exports before a local authoring adapter.
If that API is unavailable, retain the analysis and report machine registration as blocked.
Never fall back to an ordinary JSON write.

| Normalized core field      | Canonical on-disk field | Analysis use                                                                              |
| -------------------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| `doc.spec.requirements`    | `spec.requirements`     | Canonical `FR-*` IDs, testable `text`, optional `priority`, `scenarios`, `refs`, `serves` |
| `doc.spec.out_of_scope`    | `spec.out_of_scope`     | Bounded exclusions                                                                        |
| `doc.spec.clarifications`  | `spec.clarifications`   | Open questions; use the CLI for phase membership                                          |
| `doc.plan.decisions`       | `design.decisions`      | Proposed decisions; use the CLI when available                                            |
| `doc.artifacts[id].file`   | `metadata[id].ref`      | Relative path to the real artifact                                                        |
| `doc.artifacts[id].sha256` | `metadata[id].sha256`   | Observed hash of those bytes                                                              |
| `doc.status`               | `status.lifecycle`      | Read to preserve active or complete state                                                 |
| `doc.revision`             | `revision`              | Held revision plus one for a successful write                                             |

Requirement objects do not support `status` or `evidence` fields.
Keep their proposal status and evidence attribution in the analysis and spec prose.
Use supported `refs` where applicable. Use canonical `FR-*` and `AC-*` identifiers.
Check the matching format schema when available; do not assume a loader or alignment check validates every schema field.
The harness source repository supplies 0.4 in `wiki/assets/contracts/specpack-owner-workflow.schema.json`.
Its preserved original schema is `wiki/assets/contracts/specpack.schema.json`.
These source-repository paths need not exist in an arbitrary analyzed product.

Use this sequence for a bounded analysis mutation:

1. Acquire the shared writer lock through `withPackLock(packDir, callback)`.
2. Inside the callback, load through `loadPackWithMeta(packDir)`.
3. Refuse load errors, a held-revision mismatch, or a completed pack.
4. Check whether prior approval, start receipts, tasks, or accepted decisions bind the fields you would change.
   Preserve them. A changed approved scope returns to owner review.
   If audit recovery is pending, stop and preserve the canonical receipts.
5. Merge only intended candidate requirements, exclusions, and artifact references into the normalized document.
   Preserve unrelated fields, IDs, decisions, questions, tasks, evidence, and workflow records.
   Conflicting existing IDs require reconciliation; do not silently replace their meaning.
6. Use relative artifact paths within the pack. Hash actual artifact bytes.
   Use `analysis`, `brief`, and `spec` references as appropriate.
7. Increment the held revision once. Call `savePack(doc, loadedPath, { at: <actual observation time> })`.
   This time records a write, not owner consent.
8. Check the lock result and persistence result. A durability error or pending audit needs explicit recovery.
   A write can be recorded before a durability error; reload before any retry.
9. Reload the published pack. Verify the intended fields and preserved records.

`savePack` normalizes emission, derives stage, publishes atomically, and handles owner audit state.
It does not supply the shared lock or prove that a proposed edit respects approved scope.
A revision assertion followed by `writeFile` is not a locked writer.
Do not mix normalized `artifacts` with canonical `metadata` in raw JSON.

Write new, unapproved analysis documents before registering their references.
Do not edit approved digest-bound documents during this operation.
A successor records its relationship to the previous artifact without rewriting that artifact.

## Verify the planning handoff

Run `do check`, `do status`, and `do where` for the exact pack.
Then inspect the loaded record and referenced files:

- The pack is loadable at the reported path and revision.
- Analysis, brief, and spec references resolve to their actual bytes.
- Candidate requirements and exclusions match the bounded proposal.
- Required questions have the correct phase membership.
- Decisions remain proposed unless an existing real owner acceptance is cited.
- Prior receipts, task evidence, closed records, and unrelated fields remain intact.
- Alignment violations and expected unplanned gaps appear in the handoff.

Check each observed claim against the cited command or source for this workspace.
Keep shared check procedures reusable; derive case-specific findings from actual results.
An unrelated case's successful check or knowledge conflict is not evidence here.

`do check` reports alignment, not full JSON Schema conformance.
When the format schema is available, validate the published canonical JSON against it.
State schema availability and actual results in the handoff.
An empty shell can pass alignment. Passing `do check` alone does not establish a complete handoff.
Unplanned requirements can produce expected gaps before `plan` creates tasks.
An ANALYSIS review is separate from PLAN and PACK review, start permission, and Finish spec.

## Host context and refusal

The manifest is the authority for active wiring.
Current Pi, Claude, and Codex lifecycle routes supply context, rather than an analysis hard gate.
Codex activation also requires host hook trust. Copilot has no lifecycle hook wiring in the manifest.
The old `--claude-gate` compatibility branch is not the active Claude lifecycle route.

When context reports ambiguity, verify canonical discovery through `do where` and the exact pack loader.
Current lifecycle discovery can refuse directories with additional root JSON snapshots even when the core loader succeeds.
Report this discrepancy. Preserve snapshots and path guards; do not delete evidence or bypass task admission.
Resolve an ambiguous continuation with the user. An explicit bounded request can proceed independently of unrelated refused entries.
