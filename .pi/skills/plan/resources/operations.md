# Machine plan authoring

Read the pack through the supported core loader before any mutation.
Use the current CLI help and exports; do not guess an API or command.
New initiatives use `do init <slug> --owner-gated` in the canonical specs root.
Existing legacy packs retain their format until an explicit owner adoption action.

The CLI exposes proposed decisions and tasks, but not all design or context fields:

```sh
do add decision <packDir> --id D-1 --decision "<choice>" --because "<evidence>" --expected-revision <held>
do add task <packDir> --id T-1 --title "<outcome>" --verify-cmd "<command>" --verify-expect "<observation>" --satisfies FR-1 --expected-revision <held>
```

Read the new revision after each write. These commands do not authorize implementation.
Stop before changing agreed work, even if a command can technically write it.
Use the shared locked core writer for fields without a CLI command.
Never fall back to raw JSON writes when the supported API is unavailable.
Report machine registration as blocked instead.

## Field mapping

The normalized loader document differs from canonical on-disk JSON.
Check the matching format schema before authoring fields.

| Normalized field                 | Canonical field              | Purpose                                                       |
| -------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `doc.spec.requirements`          | `spec.requirements`          | FR IDs and testable behavior                                  |
| `doc.plan.designs`               | `design.designs`             | DES IDs, requirements in `addresses`, actual design details   |
| `doc.plan.decisions`             | `design.decisions`           | Proposed D IDs and rationale                                  |
| `doc.plan.diagrams`              | `design.diagrams`            | DG IDs, artifact key, caption, format, covered FR/DES/CON IDs |
| `doc.artifacts[key]`             | `metadata[key]`              | Real file reference and observed SHA-256                      |
| `doc.tasks[].needs`              | `tasks[].needs`              | Only prerequisite T IDs                                       |
| `doc.tasks[].implements`         | `tasks[].implements`         | DES IDs, not R or D IDs                                       |
| `doc.tasks[].satisfies`          | `tasks[].satisfies`          | FR IDs                                                        |
| `doc.tasks[].accepts`            | `tasks[].accepts`            | AC IDs                                                        |
| `doc.tasks[].honors`             | `tasks[].honors`             | CON IDs                                                       |
| `doc.tasks[].requires_decisions` | `tasks[].requires_decisions` | Required D IDs                                                |
| `doc.tasks[].context`            | `tasks[].context`            | Allowed touch paths and advisory references                   |
| `doc.status`                     | `status.lifecycle`           | Preserve current lifecycle                                    |

For example, prose R1 can map to FR-1; prose design section 2 can map to DES-2.
State mappings explicitly. Do not put D IDs in `implements` or Q IDs in `needs`.
Use `context.touch` entries with repository-relative `path` fields for allowed changes.
Use `context.read` path entries for reference files, `wiki` for concept IDs,
`links` for URL entries, and `commands` for supported command-check objects.
Consult the schema for optional fields. Advisory context is not automatically hash-pinned.

## Preserve the record under a lock

1. Acquire `withPackLock(packDir, callback)` through the supported core runtime.
2. Within the callback, load with `loadPackWithMeta(packDir)`.
3. Refuse load errors, a held-revision mismatch, completed packs, or pending audit recovery.
4. Inspect existing approvals, receipts, artifact hashes, accepted decisions, and task evidence.
   Preserve bound records. A changed approved plan needs a successor proposal and owner review.
5. Merge only intended unapproved author fields. Preserve unrelated IDs, questions, evidence, and workflow state.
   Reconcile conflicting IDs explicitly; never replace their meaning silently.
6. Register relative artifact paths from the pack directory and hashes of actual bytes.
7. Increment the held revision once and call `savePack` with the actual observation time.
8. Inspect lock and save results. A durability error may follow publication; reload before any retry.
9. Reload and verify intended fields and preserved records.

The writer derives stage and emits canonical JSON atomically. It does not supply the lock or owner authority by itself.
For mini-designs without a separate `design.md`, register both `design` and `plan` artifact keys against the actual `plan.md` bytes.
The machine expects a design artifact even when the readable design lives inside the plan.
Use the same observed hash for those aliases; do not create an empty design document.

Author unapproved Markdown and diagram sources before registering their hashes.
Do not edit approved artifacts to update progress or make their hashes match.

A machine-registered diagram needs a real artifact, such as `diagrams/DG-1.mmd`.
Use the artifact key in `plan.diagrams[].artifact`, `format: mermaid`, and valid `covers` IDs.
Keep the raw `.mmd` source consistent with any inline view. The Markdown view is explanatory; it is not a separate ledger.
DG references describe diagrams. Tasks implement DES elements or satisfy FR requirements.

## Connect a successor proposal

For a started plan, keep bound paths unchanged. Draft dated successor files and explain the prior plan's observed path, revision, and digest.
Link the proposal from `execution-log.md`; do not silently update the bound machine plan or its artifact hashes.
When a separate successor initiative is intended, initialize a distinct owner-gated pack and link predecessor and successor in their prose.
Use real artifact references or advisory context links where appropriate. There is no built-in `supersedes` lifecycle field.
The predecessor receipt never authorizes the successor. Acceptance, start, and completion still use their separate owner gates.
Do not clone evidence or synthesize consent to make the successor appear ready.

## Verify without admitting a task

Run `do check <packDir>`, `do status <packDir>`, and `do where <workspace>`.
Inspect alignment violations, coverage gaps, current owner gate, tasks, and artifact bytes.
Validate canonical JSON against the matching schema when available.
A shell pack can pass alignment. Inspect the populated fields rather than treating exit 0 as completeness.
Report schema availability and unrun checks honestly.

Derive only a structural entry set from the proposed DAG.
Do not invoke `do next` during planning: it admits tasks and can pin source or mark work doing.
Actual execution readiness comes from the machine handout after owner start permission.
Never issue owner acceptance, start, adoption, unblock, or finish actions on the owner's behalf.
