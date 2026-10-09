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

## 6. specpack/0.3 — the handoff layer (additive)

0.3 answers one question: can a fresh session act on a pack it did not
write? The 0.2 handout flattened every node to a one-line `text`;
0.3 adds the layers that make the handout self-contained. Every 0.2
pack is a valid 0.3 pack; `format` is now an enum.

### The three layers

1. **TRACE links** (unchanged): implements / satisfies / accepts / honors.
2. **Slice expansion** (machine): full node bodies at handout; designs
   expand one hop through `addresses`, so the worker sees the FR behind
   the DES (`"via": "DES-x"`); every accepted decision rides along;
   prerequisite tasks contribute detail, produces, evidence; a plan
   prelude (approach, stack, env) leads.
3. **The context block** (new, per task):

```json
"context": {
  "touch":  [{"path": "src/TodoController.java", "sha256": "…", "why": "new file per DES-6"}],
  "read":   [{"path": "src/TodoService.java", "why": "T-2 produced this"}],
  "wiki":   ["systems/loom-engine.md"],
  "links":  [{"url": "https://example.org/pattern", "why": "the pattern DES-6 follows"}],
  "notes":  ["MigrationTest is flaky under parallel runners."],
  "commands": [{"cmd": "mvn -q test -Dtest=TodoControllerTest", "expect_exit": 0}]
}
```

### Enforcement levels — one rule per field

| Field | Enforcement |
|---|---|
| `touch` | pinned (sha256) by the machine at handout; drift refuses the handout |
| `read`, `wiki`, digestless `links` | advisory |
| `links` with `sha256` (local paths), `artifacts` with `sha256` | verified at handout; mismatch refuses |
| `notes` | none; provenance is the pack's git history |

Paths in `touch` and `read` are relative to the git root containing
the pack. Links may be URLs (never fetched; the machine cannot verify
what it cannot read) or repo-relative paths.

### Pin, drift, rebase

- First handout pins digests for files that exist. A file absent at
  first sighting stays unpinned until it exists (the task's own
  creation is not drift).
- Every later handout verifies pins against current bytes. A changed
  or missing pinned file returns `needs_rebase` with a drift list; no
  state moves, no revision bumps, nothing persists.
- `loom rebase <dir> --task T-x --expected-revision N` re-pins to
  current truth. Git history of the pack records who re-pinned and
  when; the machine keeps no clock of its own.

### Also in 0.3

- `verify.steps`: ordered checks (`run`, `expect_exit`,
  `expect_contains`). The record-time rule (A6) is unchanged: every
  evidence command must exit 0.
- `env` (pack level): `build`, `test`, `lint`, `toolchain` strings.
- Coverage (never violations) reports: tasks missing `detail` or
  `context.touch`, notes over 280 chars, absent `env`, open questions
  while work is active.

### Authoring rules

- **Promote-to-node**: when a note becomes load-bearing, promote it to
  a D / CON / Q node and shrink the note to a pointer.
- **Mirror auth-gated pages**: if a Confluence page matters, export it
  as a pack artifact with its digest; keep the URL as provenance.
- **Pin only the scope jail**: `touch` is what the task may change;
  everything else is `read` or `links`.

## 7. The decision ledger and the final state (0.3)

The loop records decision verdicts and closes the pack itself. Nothing
closure-shaped lives in chat memory or in a commit message alone.

### Owner commands (write-fenced, human-claim gated)

| Command | Effect |
|---|---|
| `loom accept <dir> --decision D-x --by human:<owner> --expected-revision N` | proposed to accepted, `accepted_by` recorded; the questions the decision resolves become resolved |
| `loom reject <dir> --decision D-x --because <why> --by human:<owner> --expected-revision N` | proposed to rejected, `rejected_because` recorded; its questions stay open |
| `loom close <dir> --by human:<owner> --expected-revision N [--at ISO]` | the pack moves to `status: complete`; the record freezes |

The human claim is a shape check (the A7 pattern): the machine checks
the form, git and review carry the truth.

### needs_closure

When every task is done but owner work remains, `loom next` returns
`needs_closure` instead of `DONE` and prints the runnable commands:

- a proposed decision needs a verdict (`accept` or `reject`),
- an open question needs an answer.

`DONE` means no work remains. The review gate lives at close, not at
DONE.

### close preconditions (each gap is named on refusal)

1. Every task is `done` and carries at least one evidence row.
2. No decision is `proposed` (accepted or rejected, never dangling).
3. No question is `open`.
4. `review.verdicts` holds a `PASS` on `PACK` (the closing review).

### The frozen record

A complete pack refuses `record`, `rebase`, `accept`, `reject`,
`close`, and task handouts. `loom next` reports `COMPLETE`. Follow-up work opens a
new pack that supersedes the old one; history is never edited.

### The status vocabulary (one table)

Every stored and reported status lives in one machine-maintained
table: `wiki/domain/specpack-status-vocabulary.md`. The constants in
`specpack.py` equal the schema enums by guard test. A new status lands
in three moves at once (schema enum, constant plus guard, table row);
a status without all three is not a status. Complete packs are
read-only reference for future loops: query them, never rewrite them.
Materializing an explicit `active` rides the next substantive save
and does not bump the revision fence: it governs no content.

## 8. The comfortable terms and the spec anatomy (owner direction, 2026-10-09)

The artifact chain, in the owner's words:

```
Feature Brief     a markdown file, the input (new; does not exist yet)
      |  Q&A with the user, based on the brief
      v
Spec              the JSON: born from that conversation
      v
Design            built from the spec
      v
Tasks             built from the design
      + supplemental work as needed
```

The word pack is retired in user-facing terms; the stored format tag
`specpack/0.x` stays so every existing file remains valid.

The spec section anatomy (three primary sources; see
docs/specs/status-model/spec-shape.md):

| Section | What it holds |
|---|---|
| `why` | the problem, two sentences |
| `stories` | title, as/want/so, priority, independent_test, acceptance (given/when/then) |
| `edge_cases` | boundary and error conditions |
| `requirements` | plain MUST statements, `serves` a story, no scenarios |
| `success_criteria` | measurable outcomes (SC-) |
| `constraints` | hard limits |
| `questions` | open, with owners |
| `assumptions` | beliefs the spec depends on |
| `out_of_scope` | explicit exclusions |

Rules: acceptance criteria live on the story (the Confirmation); a
story is done when its ACs are met by done tasks; requirements serve
stories; priority lives on the story and P1 alone must be a viable
MVP; success criteria are measurable, not restatements.
