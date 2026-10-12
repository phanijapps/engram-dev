---
kind: bug
slug: install-bootstrap
title: Root source setup fails before Copilot initialization
status: draft
created: 2026-10-12
repo_head: 94ec40867d3df1d04fbbaea4bb8e68ddfbed77ef
wiki_freshness: fresh
source_state: Relevant implementation files clean; owner closure receipts and wiki stamp dirty and preserved
related: [../install-paths/research.md, ../copilot-hooks/design.md, ../search-kb/delivery-report.md]
---

## Purpose and scope

Diagnose cloned-source installation and propose a lasting repair. Include the
root manifest, nested workspace, source installers, and per-machine hook setup.
Exclude runtime engine changes, dependency upgrades, provider secrets, cloud
deployment, and silent migration of existing installer checkouts.

## Source pins and knowledge limits

HEAD is recorded above. Current relevant sources are clean. The dirty completed
search-kb pack, its owner audit, and the wiki stamp are unrelated and preserved.
The wiki reports fresh, zero errors and warnings, and 190 anchors with none
needing review. TypeScript and Markdown anchors remain unbaselined by the
Python-only scanner. Source inspection supplies the load-bearing evidence.
There is no `graphify-out/` graph; direct files and wiki retrieval supply context.

The historical install-paths research describes the root orchestrator as a
future registry shape. It does not establish that root pnpm installation works.
Current portable packaging deploys `@treadle/cli` from `treadle/`, independently
of root file dependencies. Sources: `../install-paths/research.md`;
`../../treadle/scripts/package-runtime.mjs`.

## Observed versus expected

| Claim | Evidence | Status |
| --- | --- | --- |
| Root frozen install fails because no root lockfile exists. | Prior clean archive probe: exit 1, `ERR_PNPM_NO_LOCKFILE`. Repeated by `probe.mjs`. | implementation-supported |
| Root unfrozen resolution cannot find workspace dependencies of file packages. | Prior clean archive probe: exit 1, `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`, brand dependency from web. | implementation-supported |
| Nested frozen lockfile validation succeeds. | Prior clean archive probe from `treadle/`: exit 0, all seven projects. | implementation-supported |
| A clone carries hook configuration but lacks ignored local scripts. | Git tracks `.github/hooks/wukong.json`; root `.gitignore` excludes `.harness/`; owner screenshot. | implementation-supported and declared |
| Source setup should work predictably from the clone root. | Owner request for a long-term fix. | declared |

The owner screenshot used macOS and Node 24.21.0. Local probes use the observed
Linux tool versions retained in `checks/probe-results.json`. Platform coverage
for the proposed repair is a later execution check, not a current claim.

## Hypothesis ledger

| ID | Mechanism | Evidence for | Evidence against | Result |
| --- | --- | --- | --- | --- |
| H1 | Brand package itself is absent. | Root pnpm reports no matching package. | `treadle/packages/brand/package.json` declares `@treadle/brand`; nested lock resolves it. | eliminated locally |
| H2 | Root file dependencies cross a workspace boundary that root pnpm cannot resolve. | Nested workspace dependencies fail through root file resolution; root has no workspace definition. | None in the deciding local probes. | confirmed locally |
| H3 | Frozen mode alone causes the failure. | Root lockfile is absent. | Root unfrozen resolution still fails on workspace dependencies. | eliminated as complete cause |
| H4 | Remote source installers use the wrong install directory. | Owner experiences root install failure. | Bash changes into source `treadle`; PowerShell uses the equivalent Push-Location. | eliminated for current scripts |
| H5 | Hook scripts were installed here but never materialized in the new clone. | Missing-module screenshot and Git ignore contract. | The installer declares wrapper, helper, and local pointer when hooks are enabled. | supported; remote init history unknown |

## Root cause and repair choices

Root installation combines an obsolete file-dependency orchestrator with a
separate active workspace. Changing frozen mode cannot repair that boundary.
The missing hook entry is a second setup issue: local generated files do not
travel through Git. Source setup and target-project init are separate actions.

| Choice | Consequence | Proposed disposition |
| --- | --- | --- |
| Thin private root setup wrapper with matching root lockfile | Root install delegates to the existing workspace; remove obsolete file dependencies and bundled registry metadata. | D-1 |
| Move the entire workspace and lockfile to the repository root | Changes workspace authority, CI, deployment paths, and existing developer conventions. | Too broad for this repair |
| Add only a setup command | Improves instructions but leaves ordinary root installation failing. | Incomplete |
| Commit machine-specific runtime files | Embeds another machine's executable paths and local state. | Reject; retain per-machine init |

## Bounded planning probe

Run `node specs/install-bootstrap/probe.mjs` before the plan registration.
Use disposable archives only. Reproduce root frozen and unfrozen resolution,
then nested frozen resolution. In a separate throwaway copy, remove obsolete
root dependency fields and create a minimal pnpm 9 root lockfile.
Validate that candidate lockfile in frozen mode with scripts disabled.
Stop after these resolution checks or 60 seconds. This proves only the proposed
manifest boundary, not the future setup helper, build, or real Copilot activation.
The probe records actual times, exits, tool versions, and source hashes.

Actual probe completed in 2.7 seconds on Linux, Node 24.19.0, pnpm 9.15.9.
Root frozen and unfrozen cases each exited 1 with the expected distinct errors.
Nested frozen resolution and the candidate root boundary each exited 0.
No implementation file changed. Logs and observed hashes are retained in
`checks/probe-results.json`. Scripts were disabled, so lifecycle and build
behavior still require the planned execution witness.

## Questions and assumptions

No human spec questions remain: the requested outcome and existing safeguards
define the behavior. D-1 retires unsupported root packaging metadata; D-2 chooses
the merged default branch. Their acceptance is still required before execution.

A-1: Corepack or the pinned pnpm is available. Validate version and report a
specific prerequisite error before clone mutation, install, or link.
A-2: Scripts-enabled root installation can call nested setup without recursion.
Prove this with a real clean install and build after implementation.
A-3: Copilot starts from the target root. Verify copied commands there; actual
native activation and other start directories remain separate host evidence.

## Verification and handoff

Regression checks must reproduce the root failure and prove frozen installation
without lockfile drift. Test source paths with spaces, command failure exits,
installer ref overrides, and cold-clone hook repair with unchanged target bytes.
Run all repository gates, wiki checks, and independent review after execution.
Actual planning observations belong in `checks/`; future execution results do
not belong in this analysis. Register FR-1 through FR-6 and D-1 through D-3 in
the new owner-gated pack. Source setup, installer reuse, and cold-clone recovery
are ready for planning; implementation awaits decision acceptance and Start.
