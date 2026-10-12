# Delivery proposal: reliable source setup

Canonical pack: `install-bootstrap.json`, specpack/0.4, owner-gated/1.
Depth: compact design, because bootstrap interfaces and platform commands change.
This proposal is separate from completed installation and search-kb records.
FR-1 through FR-6 map directly to the spec table. DES-1 through DES-4 map to the
design sections. No source implementation is authorized by this document.

## Tasks and checks

Run all task verification commands from `treadle/`.

| Task | Outcome | Trace | Needs | Decisions | Exact verification |
| --- | --- | --- | --- | --- | --- |
| T-1 | Root manifest, lockfile, setup helper, and local bin wrapper work from the clone root. | FR-1/2/3; DES-1/2 | none | D-1 | `pnpm exec vitest run packages/cli/test/source-setup.test.ts` |
| T-2 | Both source installers use the shared pinned mechanism and merged default branch. | FR-3/4; DES-2 | T-1 | D-2 | `pnpm exec vitest run packages/cli/test/installers.test.ts packages/cli/test/installers-powershell.test.ts packages/cli/test/source-setup.test.ts` |
| T-3 | Cold-clone Copilot init creates complete hooks without changing target dependencies; docs explain lifecycle. | FR-5/6; DES-3 | T-2 | D-3 | `pnpm exec vitest run packages/cli/test/copilot-hooks.test.ts packages/cli/test/init-surfaces.test.ts packages/cli/test/source-setup.test.ts` |
| T-4 | Real root lifecycle and existing delivery gates pass; independent review and PR handoff are recorded. | FR-1/2/3/4/5/6; DES-4 | T-3 | D-1/2/3 | `node ../specs/install-bootstrap/verify-delivery.mjs` |

The proposed chain is T-1, T-2, T-3, T-4. The task table expresses the DAG;
a second diagram adds no information. T-1 is the structural entry task only.
The current machine gate still requires accepted decisions and a separate Start.

## Context and allowed changes

T-1 touch: root `package.json`, new root `pnpm-lock.yaml`, new
`scripts/setup.mjs`, `bin/engram.js`, `treadle/scripts/set-brand.mjs`, new
`treadle/packages/cli/test/source-setup.test.ts`, and delivery verifier in this
pack. Read the nested manifest and lockfile, runtime packager, bin naming source,
and historical install-paths research. Do not move or regenerate the nested lock.

T-2 touch: `install.sh`, `install.ps1`, both existing installer test files,
the shared setup helper, and source-setup tests. Read the root setup output and
existing installer refusal behavior. Platform tests must prove actual cwd and
failure short-circuiting, not merely match script text. Reconcile test fixtures
with the new shared Node call and real child process exits.

T-3 touch: canonical `treadle/packages/cli/src/commands/init.ts`, canonical
`treadle/packages/cli/harness/hooks/README.md`, canonical guide template if needed,
Copilot and init surface test files, `README.md`, `wiki/project/setup.md`, and
`wiki/assets/guide/index.html`. Refresh installed copies through the installer
only, if required; preserve installed root guide and custom agents. Read the
manifest, compile/apply pipeline, guide safeguards, and ignored runtime rule.
Use temporary targets for full and hooks-only clone tests. Preserve foreign
config, target manifests, lockfiles, and backup bytes. No new hook protocol.

T-4 touch: scoped files from the preceding tasks only for demonstrated repairs,
pack check/evidence/review artifacts, and wiki fingerprint or stamp metadata.
Do not change approved prose; use the execution log. The verifier must archive
current source bytes including dirty scoped files into a disposable fixture,
then run root frozen install with scripts enabled and smoke the compiled CLI.
Compare both lockfiles before and after. Exercise portable packaging through
existing checks. Retain each real command exit and all failures.

All tasks read brief, analysis, spec, design, this plan, the root instructions,
and relevant setup/wiki concepts. Touch paths pin at admission. Advisory reads
and wiki links are not claimed as frozen source hashes.

## Trace and evidence requirements

T-1 proves root resolution, setup command order, version selection, spaces,
missing tools, wrong versions, failed installation, failed build, and bin errors.
T-2 proves default main and explicit override, existing branch protection,
fast-forward failure, shared setup failure, link failure, and verification exits.
T-3 proves cold-clone scripts/pointer/config completeness and actual callback
execution with a controlled runtime. That runtime is not a native host witness.
T-4 proves the real root lifecycle, compiled assets, packaging, six gates,
coverage floors, and wiki zero errors/warnings/review anchors with fresh stamp.
Windows-only tests require native CI; unavailable local execution stays disclosed.

Independent red-forman review must inspect source and rerun exact checks before
PACK PASS. Publish a PR only after review and authorized publication. Owner
Finish remains distinct. Do not invent actor, acceptance, Start, or CI evidence.

## Proposal validation and handoff

Registration verifies all referenced artifacts and hashes, task DAG, trace IDs,
and canonical schema. Actual outputs are in `checks/plan-validation.log` and
`checks/plan-validation.json`. Machine alignment is separate from full schema
validation. These are proposal checks, not implementation tests.
No deferred required slice or human spec question is hidden behind alignment.
Review D-1 through D-3, then use Start implementation for this exact plan.
Progress goes in `execution-log.md` and actual task evidence.
