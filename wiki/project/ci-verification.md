---
title: "CI verification and platform evidence"
type: Project
description: "Native matrix gates, retained receipts, platform path identity, and the limits of installer and host witnesses."
status: stable
created: 2026-10-11
updated: 2026-10-11
sources:
  - { id: workflow, resource: .github/workflows/ci.yml }
  - { id: receipt, resource: treadle/scripts/ci-report.mjs }
  - { id: paths, resource: treadle/packages/core/src/feedback/store.ts }
  - {
      id: snapshots,
      resource: treadle/packages/cli/src/harness/feedback-snapshot.ts,
    }
  - {
      id: identity-test,
      resource: treadle/packages/cli/test/native-path-identity.test.ts,
    }
  - {
      id: hook-test,
      resource: treadle/packages/cli/test/hook-entrypoint.test.ts,
    }
  - {
      id: windows-installer,
      resource: treadle/packages/cli/test/installers-powershell.test.ts,
    }
  - { id: dependencies, resource: treadle/pnpm-lock.yaml }
  - { id: original-run, resource: artifacts/ci-review-38173060745/run.json }
  - { id: repair, resource: artifacts/ci-cleanup/checks/results.json }
---

# What CI verifies

GitHub Actions runs Node 22 and 24 on Linux, macOS and Windows. Each installed
workspace attempts source typechecking, lint, formatting and tests; coverage;
corpus byte comparison; the brand fence; the production audit; documentation
links; portable runtime packaging; and the background harness smoke journey.
A failed gate keeps the job failed while later gates still run. Installation
failure prevents those dependent checks. Source: `.github/workflows/ci.yml`.

Vitest writes `test-results.json`. The outcome recorder writes
`ci-evidence/results.json` with the job commit, platform, Node version, runner
image, actual step outcomes and the smoke report when present. An executed smoke
step without its promised report makes the recorder fail. The upload step retains
these receipts and the coverage summary per matrix job even after failure.
Sources: `treadle/vitest.config.ts`; `treadle/scripts/ci-report.mjs`;
`treadle/packages/cli/test/ci-report.test.ts`.

The corpus gate invokes `pnpm corpus:check`, which regenerates and compares
committed bytes. A package-filter command with no test script is not that gate.
Generated diagnostic files are excluded from the brand scan; product source
continues to be checked. Sources: `treadle/scripts/corpus-check.mjs`;
`treadle/scripts/brand-check.mjs`; `treadle/packages/brand/test/brand-gate.test.ts`.

# Filesystem and host boundaries

Feedback containment accepts the explicitly supplied trusted root and its native
physical form. It maps the root alias before inspecting each descendant with
`lstat`; descendant symlinks and junctions remain forbidden. Windows path casing
differences also require matching filesystem identity. The Git workspace check
compares `realpathSync.native` results, which expands Windows short directory
names. Sources: `treadle/packages/core/src/feedback/store.ts`;
`treadle/packages/core/test/feedback-paths.test.ts`;
`treadle/packages/cli/src/harness/feedback-snapshot.ts`.

Codex context and write-guard hooks compare physical entrypoint paths. A direct
invocation through a trusted directory alias executes the hook; importing it as
a Pi module consumes no stdin and does not exit the host process. Sources:
`treadle/packages/cli/harness/hooks/codex-context.js`;
`treadle/packages/cli/harness/hooks/post-tool-check.js`;
`treadle/packages/cli/test/hook-entrypoint.test.ts`.

Bash installer contract tests run on POSIX. PowerShell contract tests run on
Windows with native command stubs, real exit codes and a source path containing
spaces. They cover new installs, selected-branch updates, refusal of another
branch, Node version failures and failed install/build/link stages. These tests
do not clone from the network, modify a global installation, activate a real
coding host or witness human hook trust. Sources:
`treadle/packages/cli/test/installers.test.ts`;
`treadle/packages/cli/test/installers-powershell.test.ts`.

# Toolchain

Development checks use ESLint 10.12.0, Vitest and V8 coverage 5.0.3, Vite 8.3.4
and Ajv 8.20.0. Including the resolved DOM dependencies, the supported development
lanes are Node 22.22.2+ in 22.x and Node 24.15+ in 24.x; the application runtime
minimum remains Node 22. pnpm remains pinned
to 9.15.9. Sources: `treadle/package.json`; `treadle/pnpm-lock.yaml`;
`CONTRIBUTING.md`. See [security posture](/project/security-posture.md) for dated
audit evidence and [engineering controls](/project/engineering-controls.md).

# Chronology — observed 2026-10-11

1. Run 38173060745 at main commit `18c527bd652847a2ae80c07212f4aaaaed9572e3`
   passed the two Linux jobs and failed the four macOS/Windows jobs. The retained
   inventory records 130 failed test executions and every reported annotation.
   Sources: `artifacts/ci-review-38173060745/run.json` and `inventory.json`.
2. Commit `95415c6b8d8d099b43293a9ad7cf2fbaee19eefe` repaired path and hook
   identity and enabled real corpus comparison and downstream evidence. Run
   38175456994 cleared the original failures but exposed a canonical-path test
   expectation and generated-output brand-scan failure. Its Windows identity
   probe observed `RUNNER~1` versus `runneradmin`, with equal native realpaths.
   Sources: `artifacts/ci-cleanup/first-native-run.json` and
   `artifacts/ci-cleanup/first-native-run.log.gz` (exact transcript, gzip encoded).
3. Commit `76e2486c025de56df3ad795c508e5f75512eb3af` repaired those checks,
   upgraded compatible development dependencies and added PowerShell and receipt
   tests. Local gates passed with coverage above every unchanged floor; full
   audit reported zero advisories. Source: `artifacts/ci-cleanup/checks/results.json`
   and `checks/audit-all.json`.
4. Run 38175935828 passed all six native jobs for that branch commit (PR merge
   `400c231cfed503e5cfaf290ee97d9c069bf96750`). POSIX jobs passed 266 tests with
   9 Windows-only skips; Windows passed 267 with 8 POSIX-only skips. All declared
   gate steps and six runtime smoke reports succeeded. Sources:
   `artifacts/ci-cleanup/native-run-76e2486.json` and
   `artifacts/ci-cleanup/native-76e2486/`.

The follow-up recorder repair retains outcomes even if smoke JSON is malformed;
its regression and final local gates are recorded in
`artifacts/ci-cleanup/checks/final-results.json`. The final PR run is the authority
for the subsequently pushed head; the earlier green run does not certify later
source bytes.

Remote results must name the actual tested commit and run. This chronology does
not modify any closed specpack or resolve native host acceptance by inference.
See [open work](/project/open-work.md). Freshness still uses Git HEAD and
Python-only fingerprints; it cannot detect dirty TypeScript or Markdown changes.

## Subsequent fixture repair — observed 2026-10-11

Run 38176545852 at `ff17f0050493b0811a7d562728d15887144e8f72` passed five
jobs but Windows Node 22 encountered `ECONNRESET` in the owner-workflow test.
That fixture now awaits asynchronous CLI and verification children so its local
HTTP server can process connection lifecycle events. All gate, revision,
evidence and closure assertions remain; there are no retries or backend changes.
A local warmed-pool probe reproduced a reset with a blocking child and succeeded
with an asynchronous child. Native socket timing remains inferred rather than
directly instrumented. Sources: `treadle/packages/web/test/owner-workflow.test.ts`;
`artifacts/ci-cleanup/followup/evaluation.md` and its retained run metadata/probes.
The subsequent PR run must validate this delta before a final green claim.
