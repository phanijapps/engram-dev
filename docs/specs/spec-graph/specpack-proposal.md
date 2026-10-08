# specpack proposal — the codified json, ideated per owner direction

- **Status:** IDEATION — owner reviews before anything binds.
- **Owner directive (2026-10-08):** "Take Spec Kit's spec, plan, task
  templates, roll them into one json file with clearly identifying
  dependencies, and refer to artifacts within the json. Use html as
  the reference to visualize it."
- **Format version:** 0.2 (flow/trace split, designs, diagrams)
- **Artifacts of this proposal:**
  - `specpack.schema.json` — the schema (every property titled and
    described; the schema itself must not be cryptic)
  - `example-add-todo.specpack.json` — the worked example (add a todo,
    Spring Boot)
  - `example-add-todo-specpack.html` — the rendered reference
- **Validation evidence:** real python-jsonschema — schema checks;
  example conforms, 0 errors. The first validation run caught a real
  design gap (a task could not name an acceptance scenario as a
  dependency) which became a schema fix, not a workaround. HTML embed
  is byte-equal to the json on disk.

## Design principles (what makes this NOT cryptic)

1. **Speckit-native reading order**: `spec` → `plan` → `tasks` →
   `review` — the four artifacts the owner named, in the order a
   person reads them. No plane vocabulary, no tenant fields.
2. **Typed ids carry every dependency**: `US-` stories, `FR-`
   requirements, `AC-` scenarios, `CON-` constraints, `Q-`
   clarifications, `D-` decisions, `T-` tasks. A task's `needs[]` is
   the whole dependency declaration; "who needs me" is a computed
   reverse index, never stored twice (the doubly-linked rule).
3. **Verify rides the task**: every task carries
   `verify: {cmd, expect}` — the observable check is born with the
   task, not bolted on later (M_run = M from birth). `done` without
   an `evidence` row is a defect the schema's consumers enforce.
4. **Artifacts are pointed at, never embedded**: the `artifacts` map
   (key → file + type + optional sha256) plus `refs` citing
   `"key#anchor"` (markdown heading) or `"key!Sheet"` (spreadsheet).
   docx, xlsx, md are equal citizens — only `type` differs.
5. **Uncertainty is data**: open `Q-` items with owners sit next to
   resolved ones that cite the `D-` that settled them.
6. **Reviews are verdicts on ids**: PASS / IMPROVE / REPLAN
   (SpecAgent's routing) with BLOCKER/DEFECT/SMELL findings, each
   finding carrying its one-line fix.
7. **Extensions by convention**: `x-*` fields are legal anywhere (the
   standard json-schema answer to "not all clients are the same") —
   no envelope machinery until something needs it.
8. **The schema reads like documentation**: every property has a
   `title` and most have a `description`. A newcomer reads the schema
   and understands the format.

## Proof it demonstrates the owner's three asks

| Ask | Where |
|---|---|
| "clearly identifying dependencies" | typed ids; `needs[]` on every task; `resolves` on decisions; rendered as clickable chips |
| "refer to artifacts within the json" | `artifacts` map + `refs` (`prd#Add Task`, `pricing!FieldCaps`) |
| "progressively load" | the slice demo: T-3's transitive needs closure = 5 items in, 3 tasks omitted — deterministically, omit-records visible in the render |

## Relationship to the VSG Harness schema

specpack is the **file-plane front**. It lifts cleanly into VSG defs
when a server plane ever wants it: FR→REQUIREMENT, AC→ACCEPTANCE,
CON→CONSTRAINT, Q→QUESTION, D→DECISION, T→TASK, verify-criterion→
VERIFICATION, verdicts→review-request/verification-result. The lift is
a mechanical generator (brainstorm option B), so specpack stays the
human-authoring format and the VSG stays the authority vocabulary.
This reframes `schema-brainstorm.md` Q1: the practical answer is
"specpack front-file + generator", with the VSG defs as target — not
as the thing humans read.

## v0.2 — flow and trace, separated (owner: "that link has to be established")

The 0.1 `needs[]` mixed two kinds of links. 0.2 splits them:

- **Flow** — `task.needs` holds only `T-` ids: execution order.
  Loom schedules from it (topological, deterministic tie-break by id).
- **Trace** — four typed arrays carry the alignment:
  `implements` (DES-…), `satisfies` (FR-…), `accepts` (AC-…),
  `honors` (CON-…). This is the task ↔ design ↔ spec link, stated per
  task, verifiable by machine.

New plan content: `designs[]` (DES-… elements with `addresses` back to
FR/CON — the indirect half of alignment) and `diagrams[]` (DG-…
references to mermaid/svg/excalidraw artifacts, with `covers`).

### Alignment rules (loom-enforced, all decidable)

- **A1** ids unique per family.
- **A2** every reference resolves (needs/implements/satisfies/accepts/
  honors/addresses/resolves/diagram covers).
- **A3** `needs` graph is acyclic.
- **A4** every task reaches ≥1 FR: directly (`satisfies`) or through a
  design element (`implements` → DES `addresses` an FR).
- **A5** coverage is computed and reported in canonical (sorted) order:
  uncovered FRs, uncovered ACs, unimplemented DESes are **reported,
  never guessed**. (The worked example ships with two honest gaps:
  FR-2 — P2, not this slice — and DES-3, caught because
  plan.structure lists TodoRepository.java while no task produces it.
  The machinery works; it found a hole in its own example.)
- **A6** `done` ⇒ ≥1 evidence row with exit 0.

### Determinism statement

Same specpack in, same everything out: slices are the transitive
closure over flow + trace, rendered in sorted-id order; coverage
reports sort by id; the HTML embed is generated from the json file,
never hand-synced. No clocks, no randomness, no map iteration order
anywhere in the render.

## Open questions (owner)

| # | Question | Default if silent |
|---|---|---|
| Q1 | Format name: `specpack`? File name per initiative (`sdd.json`? `<name>.json`)? | specpack, `<name>.json` |
| Q2 | Statuses: keep the lean `todo/doing/done/blocked` (file plane) and map to the VSG's 8 states only at lift time? | yes — lean stays |
| Q3 | Should `x-*` extensions stay convention-only, or does loom validate registered x-namespaces from day one? | convention-only until L2 |
| Q4 | Markdown twins (`spec.md` alongside the json): keep as rendered convenience (generated FROM json, never hand-edited)? | generated-from-json |
| Q5 | Does specpack replace loom's L0 spine format now (the hand-typed one dies), with `loom` speaking specpack natively at L1? | yes — pending your call |
