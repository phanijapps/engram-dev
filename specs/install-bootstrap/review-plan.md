# Independent proposal review — 2026-10-12

Reviewer: `/root/search_kb_plan_review`.
Verdict: **PLAN PASS — nothing to fix**.
This report does not certify implementation, PACK completion, or native activation.

## Native evidence concern and resolution

The initial review identified a potential verification gap.
Locations: `specs/install-bootstrap/spec.md:9`; `specs/install-bootstrap/plan.md:69`; `.github/workflows/ci.yml:9` and `:29`.
Current CI installs dependencies from `treadle/`; it does not have a separate root install step.
A Linux-only T-4 witness and native installer stubs would not prove the Windows root lifecycle.
The initial recommendation requested an explicit root CI step and corresponding task context.

The existing task context permits an equivalent test without a workflow change.
T-1 already owns `treadle/packages/cli/test/source-setup.test.ts`.
The current six-job OS and Node matrix executes this file through `pnpm check`.
A real root lifecycle integration test there supplies the required native execution path.
The root agent confirmed this execution strategy before implementation.
That clarification resolves the concern within the accepted scope.
It does not need another decision or Start solely to use the existing test path.

The test must execute actual scripts-enabled frozen root installation in an isolated source path with spaces.
It must establish nested install and build, unchanged root and nested lock hashes, and compiled CLI behavior.
Use actual pnpm processes and a realistic explicit timeout.
Keep mocked tool and failure tests as additional checks, not substitutes for this lifecycle witness.
Retain and inspect remote native outcomes before claiming their success.
No remote execution or platform result is established by this proposal review.

## Proposal checks and scope

`node specs/install-bootstrap/validate-plan.mjs` exited 0.
The canonical schema, artifact hashes, DAG, alignment, and discovery checks pass.
All five bound artifacts match their recorded hashes.
The task chain is T-1, T-2, T-3, then T-4.
All seven probe source hashes still match inspected sources.
Retained logs confirm the distinct root frozen and unfrozen failures.
Nested frozen resolution and the proposed root boundary resolution each exit 0.
These probe commands disable scripts; they do not establish lifecycle or build success.

The root wrapper design addresses the observed workspace boundary without moving its authority.
The nested workspace has no recursive prepare script.
The installer ref, pinned tool selection, safe argument handling, and failure checks are explicit.
The cold-clone plan covers local wrapper, helper, pointer, and config without claiming host activation.
It preserves target dependency bytes, foreign definitions, guide backups, and closed packs.
No other proposal defect emerged from source and contract inspection.

The owner accepted D-1 through D-3 and recorded Start during this read-only review.
At observed revision 6, the accepted plan digest is:
`4c108a984a111836932fafcb7502aed1d76b1f9fa16baf7537f9d2c7ec78c744`.
The reviewer performed no owner action, task admission, implementation, or native activation.
Only this report and the validator's pack-local check artifacts changed through reviewer actions.
