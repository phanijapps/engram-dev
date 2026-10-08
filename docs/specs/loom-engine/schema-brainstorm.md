# The spine schema — brainstorm (owner, this is the slop discussion)

- **Status:** OPEN — decision requested. Nothing rebuilt until you call it.
- **Trigger:** owner review 2026-10-08: "Harness.schema.json is perfect.
  You created some super slop."
- **Verdict up front:** the owner is right. Here is exactly what is
  wrong, then three ways out.

## 1. The slop I built — named precisely

What L0 shipped (`engine/loom/src/loom_kit/schemas/spine.schema.json` + the
`MiniValidator` in `loom_kit/spine.py`):

1. **Hand-re-typed enums = a fork that rots silently.** I copied the 13
   node kinds, 9 relation kinds, 8 task states, and the Id/Digest/
   Timestamp patterns out of `docs/product/Harness.schema.json` into a
   new hand-written schema. The moment the authority changes, my copy
   diverges with no signal. The repo's own rule says schemas are
   authority objects, not copy-paste material.
2. **A hand-written validator replaced the mandated one.** The repo
   standard is JSON Schema Draft 2020-12 via python-jsonschema with
   format checking enabled. `MiniValidator` covers a subset I chose,
   so its holes are silent.
3. **Runtime shapes drifted from the real definitions:**
   - my `task_id` string vs the real `task_ref` (a `NodeRef` — exact
     node + revision);
   - my ad-hoc `attempt` vs the real `attempt` def, which already has
     what I reinvented: `fence_token` (my `expected_revision`),
     `state` incl. `RECONCILE_REQUIRED`, `repository_pins`, `outputs`,
     `verification_result_ids`, `failure`;
   - my invented `escalation` object vs the real `Blocker` def
     (`code`, `detail`, `node_refs` — that IS the escalation shape);
   - my ad-hoc `event` vs the real `event` def (sequence, actor_ref,
     correlation_id);
   - no `authority_records` — the real def for who accepted what, which
     is the natural bridge to the okf findings ledger;
   - no real `context` def — the frozen-context machinery
     (budget, selections, omissions, rendered_artifact_id) already
     exists and I sketched my own.
4. **The spine document is neither one thing nor the other.** It is
   not a VSG package document (the real, complete shape), and it is
   not a disciplined derived subset. It is a third thing I typed.

## 2. The real question

How close to the VSG document should loom's file-backed spine be? The
tension is real: the VSG `package` def is the server plane's format —
it requires `tenant_id`, `policy_ref`, `event_sequence`, `operations`.
A CLI file does not want to fake a tenant. But anything hand-invented
is exactly the slop above. So the options:

### Option A — the spine IS a VSG package

Validate `sdd.json` directly against `Harness.schema.json`. Fill the
server-plane fields with single-tenant placeholders (`tenant_id:
"local"`).

- **For:** zero drift, ever — the schema is the authority, loaded and
  done. Full fidelity for free (authority_records, contexts, blockers).
- **Against:** every spine carries dead required fields; the reserved
  example namespace; event_sequence/operations bookkeeping with no
  server behind it; heavier documents.

### Option B — a mechanically generated strict subset (my recommendation)

A checked-in generator (`tools/gen_spine_schema.py`) reads
`Harness.schema.json`, extracts the chosen `$defs` **verbatim**
(common, node, relation, task-state, attempt, verification-result,
event, context — hence Blocker), rewrites `$ref` bases to the generated
bundle's own `$id`, and emits `engine/loom/src/loom_kit/schemas/spine.schema.json`
with a provenance header and the source digest.

- A test regenerates and compares bytes: **drift alarms, not rots.**
- Loom drops `MiniValidator` for real python-jsonschema (repo standard).
- Everything loom-specific that has no VSG home rides the Extensions
  envelope as proper namespaced extensions — `loom.stall/0.1.0` with
  Blocker-shaped data, `loom.artifacts/0.1.0`, `loom.profile/0.1.0`.
  That is what the envelopes were designed for.
- **Against:** a generation step to maintain; fidelity choices must be
  written down (which defs, which required fields relaxed for the
  file plane — e.g. `tenant_id` dropped from generated defs, with the
  drop recorded in the generator, not hand-edited in output).

### Option C — a live $ref overlay

The loom schema keeps only loom-specific defs and `$ref`s the
Harness.schema.json defs at validation time
(`file:../../../docs/product/Harness.schema.json#/$defs/...`).

- **For:** zero duplication, zero generation.
- **Against:** a shipped engine coupled to a path in `docs/`;
  cross-file ref resolution; a murky version story ("which authority
  version did this spine validate against?").

## 3. Refactors required under ANY option

| # | Change | From → To |
|---|---|---|
| R1 | task identity | `task_id` string → `task_ref` NodeRef (node + revision) |
| R2 | attempts | ad-hoc → real `attempt` def; my `expected_revision` fence maps to `fence_token` semantics |
| R3 | escalation | ad-hoc → `Blocker` shape (`code`, `detail`, `node_refs`) |
| R4 | events | ad-hoc → real `event` def (or drop events until L1 if we do not adopt sequences) |
| R5 | frozen context | ad-hoc → real `context` def (budget/selections/omissions included or explicitly deferred, recorded in the generator) |
| R6 | validation | MiniValidator deleted → python-jsonschema, format checking on |
| R7 | authority | add `authority_records` — the bridge to the okf findings ledger (this is the memex consumer-layer moment) |

## 4. Questions for the owner

| # | Question |
|---|---|
| Q1 | Option A, B, or C? (I recommend B.) |
| Q2 | Full runtime fidelity now (attempts with repository_pins/outputs) or a recorded, progressive subset? |
| Q3 | Namespace: stay on the reserved example namespace until the org-owned namespace decision, or adopt one now (repo rule says before shipping)? |
| Q4 | Do authority_records bind to the okf findings ledger in L2 (owner accepts via ledger → authority record in the spine)? |
