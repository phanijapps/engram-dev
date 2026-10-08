# Schema primer — how the Harness organizes data (Phase-1 artifact)

- **Status:** reference — read before any codification decision.
- **Source:** `docs/product/Harness.schema.json` (18 defs, extracted
  verbatim; quotes are the schema's own words/fields).
- **Purpose:** answer, from the schema itself: how is data organized,
  where do markdown/docx/excel files live, and where do tasks,
  approach, verification, and review steps reside?

## 1. The document anatomy — five planes, one file

A Harness document (the `package` def) is one JSON file with five
planes. Everything is in one of these; nothing floats.

```
package
├── identity      schema_version, tenant_id, initiative_id, title,
│                 package_revision, event_sequence, exported_at,
│                 lifecycle, policy_ref, scope
├── CONTENT       nodes[], relations[]                ← the deterministic
│                 (13 node kinds, 9 relation kinds)    structure, the
│                                                      thing you traverse
├── AUTHORITY     node_states[], authority_records[],
│                 change_dispositions[]             ← who accepted what,
│                                                     what replaced what
├── EXECUTION     task_states[], attempts[], contexts[],
│                 operations[], verification_results[],
│                 review-request                      ← the loop's runtime
├── EVIDENCE      artifacts[]                        ← every file, with
│                                                     digest + pointer
└── extensions    namespaced envelopes on every object ← client/loom needs
```

The trust model of the planes: **content proposes, authority disposes,
execution observes, evidence proves.** A node never vouches for
itself; an authority record or an observed result does.

## 2. Where markdown / docx / excel live: the `artifacts` plane

Rich files never live inside the graph — the graph holds **pointers
with digests**. Each file is one entry in `artifacts[]`:

```json
{
  "artifact_id": "prd-payments-v2",
  "kind": "DOCUMENT",                      // SOURCE | PATCH | BUILD |
                                           // TEST_REPORT | CONTEXT |
                                           // RECEIPT | ENVIRONMENT |
                                           // DOCUMENT | OTHER
  "media_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "storage_uri": "artifact://initiatives/payments/prd-v2.docx",
  "sha256": "3f7a…64-hex",
  "size_bytes": 184322,
  "created_at": "2026-10-08T10:00:00Z",
  "producer_attempt_id": "att-7",          // optional: which attempt produced it
  "extensions": {}
}
```

- **markdown spec** → `kind: "DOCUMENT"`, `media_type: "text/markdown"`
- **excel workbook** → `kind: "SOURCE"` or `"DOCUMENT"`,
  `media_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"`
- **code files** → `kind: "SOURCE"`; **diffs** → `PATCH`; **test
  output** → `TEST_REPORT`; **frozen task briefs** → `CONTEXT`;
**`storage_uri` is `artifact://`** — an address in a content-addressed
store, not a filesystem path. The bytes sit outside; the digest inside
the graph proves the bytes you later read are the bytes that were
reviewed. **A markdown/docx/excel file is just another artifact; the
difference is only `media_type`.**

### How content points at artifacts (honest gap note)

The schema binds artifacts to work at the places where work happens:

| Referencing object | Field |
|---|---|
| `proposal` (a node admission) | `evidence_artifact_ids` |
| `attempt` | `outputs[]` (OutputSlot: description + artifact_kind) |
| `verification_result` | `evidence_artifact_ids`, `environment_artifact_id` |
| `context` (frozen brief) | `rendered_artifact_id` |
| `operation` | `receipt_artifact_id` |
| `review-request` | `evidence_artifact_ids` |

**Gap:** a node itself has `provenance_refs` (to other *nodes*) but no
first-class artifact reference — its `body` is free-form `{}` and
admission-time evidence lives on the proposal. For the file plane we
will need a decision: a body convention (`body.artifact_ids`) or a
namespaced extension (`loom.evidence/1.0.0`). That is RQ1 material —
recorded, not improvised. (Our L0 spine's `artifact_refs` on nodes is
a hand-drawn sketch of exactly this.)

## 3. Where tasks, approach, verification, review reside

**The split to internalize: CONTENT says what should be; the runtime
arrays say what happened.** A task is two records, not one.

### Tasks — content in `nodes`, state in `task_states`, work in `attempts`

```json
// nodes[] — the task AS SPECIFIED (deterministic, revisable)
{ "node_id": "task-refund-endpoint", "kind": "TASK",
  "title": "Refund endpoint", "body": {"text": "…what it produces…"} }

// relations[] — its prerequisites (the AND-DAG loom already schedules)
{ "kind": "requires", "from_ref": {"node_id": "task-refund-endpoint"},
  "to_ref": {"node_id": "design-refunds"} }

// task_states[] — the task AS IT STANDS (the state machine)
{ "task_ref": {"node_id": "task-refund-endpoint", "revision": 3},
  "state": "RUNNING", "state_version": 4, "blockers": [] }

// attempts[] — one observed run of one worker
{ "attempt_id": "att-7", "task_ref": {"node_id": "task-refund-endpoint"},
  "context_id": "ctx-0042", "state": "RUNNING",
  "fence_token": 11,                       // ← the write-fence (loom's
  "worker_ref": "pi",                       //   expected_revision)
  "repository_pins": [{"repository_id": "memex", "uri": "…", "commit": "d1b58…"}],
  "outputs": [{"output_id": "o1", "artifact_kind": "PATCH", …}],
  "verification_result_ids": ["vr-19"] }
```

### Approach — DESIGN/DECISION nodes + authority records

"The approach" is content: `DESIGN` nodes (the how) linked to the
requirements they answer (`addresses`) and the tasks that implement
them (`implements`). What makes an approach binding is not the node —
it is an **`authority_record`** (who accepted it, when) and, when it
changes, a **`change_disposition`** (old_ref → new_ref: supersede,
never mutate). The frozen *per-task* view of the approach is a
`context` record:

```json
{ "context_id": "ctx-0042", "task_ref": {"node_id": "task-refund-endpoint"},
  "budget": {…}, "used_input_tokens": 3811,
  "selections": […],                     // what was included
  "omissions": […],                      // what was left out — RECORDED
  "outcome": "COMPILED", "rendered_artifact_id": "ctx-brief-0042" }
```

This is the progressive-loading machinery, already in the schema:
load selections within budget, record omissions, digest the rendered
brief (`M_run = M` applied to *loading*).

### Verification — criterion vs observation, strictly separated

- `VERIFICATION` **node** (content): the criterion — what must be
  checked and the command/machine that decides it.
- `verification_results[]` (observation): one row per real run —

```json
{ "result_id": "vr-19", "verification_ref": {"node_id": "verif-refund", "revision": 2},
  "criterion_refs": […], "attempt_id": "att-7",
  "result": "PASS",                      // PASS | FAIL | INCONCLUSIVE
  "runner_ref": "pytest-runner", "exit_code": 0,
  "implementation_pins": […],            // exactly what was verified
  "environment_artifact_id": "env-ci-3",
  "evidence_artifact_ids": ["test-report-88"] }
```

A `VERIFICATION` node never says "passed". Only a
`verification_result` says that, and it points at the run's evidence.

### Review steps — review-request + authority + disposition

- `review-request`: `node_refs`, `decision`, `rationale`,
  `evidence_artifact_ids`, `expected_package_revision` — a formal ask
  for a human judgment on named nodes at a named revision.
- The outcome lands as `authority_records` (accept/reject — the
  findings-ledger bridge) and `change_dispositions` (supersede/replace
  verdicts). ACCEPT/IMPROVE/REPLAN routing from the research maps onto
  these two arrays.

## 4. Your linked-list model, made concrete

`relations[]` is the single edge list — the schema never stores a link
twice. Doubly-linked navigation is **two derived indexes over one
array**:

- forward: `by_from[from_id] → [relations]` (what this unlocks)
- backward: `by_to[to_id] → [relations]` (what unlocks this — impact
  analysis: change requirement R7 → walk backward to every task and
  verification_result that depends on it)

Both indexes are computed at load (in-memory) or cached in a derived
sidecar whose own digest is recorded — never hand-maintained. Stable
ordering (sort by relation_id) makes traversal deterministic, so two
loads of the same document yield byte-identical slices.

## 5. What this means for the file plane (bridge to the brainstorm)

Our L0 spine invented small versions of these (role-keyed artifact map,
`artifact_refs`, ad-hoc attempts, an `escalation` object). The primer's
mapping: role map → `artifacts[]` entries; `artifact_refs` → body
convention or `loom.evidence` extension (RQ1); ad-hoc attempts → the
real `attempt` def; `escalation` → `Blocker`-shaped data in a
`loom.stall` extension; frozen contexts → the real `context` def. The
option choice (A/B/C in `schema-brainstorm.md`) decides *how* the
defds arrive (direct / generated / overlaid) — the *shape* above is
not in question; it is the schema's own.
