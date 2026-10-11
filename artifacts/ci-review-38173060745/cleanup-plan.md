# CI cleanup plan: run 38173060745

Date: 2026-10-11. Mode: bug analysis and proposed repair sequence.
Scope: inspect all six jobs, classify every failed test, and define a cleanup plan.
No runtime, workflow, installed harness, dependency or closed spec changes were applied.

## Result

[This main-branch run](https://github.com/phanijapps/wukong/actions/runs/38173060745)
failed on macOS and Windows with both Node versions. Both Linux jobs passed all
executed steps. Node version is not the observed dividing factor.

| Platform | Node 22                         | Node 24                         | Failing suites per job |
| -------- | ------------------------------- | ------------------------------- | ---------------------- |
| Ubuntu   | 256 passed                      | 256 passed                      | 0                      |
| macOS    | 57 failed, 199 passed           | 57 failed, 199 passed           | 8                      |
| Windows  | 8 failed, 241 passed, 7 skipped | 8 failed, 241 passed, 7 skipped | 3                      |

The run produced 130 failed test executions across four failed jobs.
GitHub annotations report 38 errors, 10 warnings and 4 notices. Annotation counts
do not enumerate every failed test. The complete inventory maps each failure to
its job, title, diagnostics and full-log line: [inventory.json](inventory.json).

All four failures occurred during Vitest in `pnpm check`; typecheck, ESLint,
Prettier and dependency installation reached successful completion beforehand.
Coverage, brand, audit, named conformance, runtime packaging and harness smoke
were skipped in those jobs. Their outcome on those platforms is unknown.

## Evidence and source identity

Run HEAD: `18c527bd652847a2ae80c07212f4aaaaed9572e3`, the merge of PR #2.
Workspace HEAD: `a615746a89efd9ebd9c1b7278532560fc24118d2`.
`git diff --name-only HEAD origin/main` returned no paths after fetching the run
HEAD. The two committed trees contain identical source bytes.

The only pre-existing dirty input was `wiki/.okf/last-index.json`.
Analysis artifacts are new and do not alter that file. Source hashes and the
retrieved log hash are in [source-pins.json](source-pins.json).
[Run metadata](run.json) and [complete retrieved log](run.log) preserve all jobs.

Knowledge status returned fresh, 46 concepts, 167 checked anchors, none needing
review, and zero errors or warnings. One finding remains pending. The existing
scanner tracks Python and the stamp compares HEAD. Source inspection supplies
the TypeScript evidence; no freshness reset was performed during this review.

Relevant context: `wiki/project/open-work.md` identifies missing CI evidence and
test typechecking as existing gaps. `SECURITY.md` requires explicit trusted real
workspaces, containment, and existing write guards.

## Failure groups and causal evidence

### F1. macOS feedback: mixed physical and aliased paths

**Priority P0. Evidence: implementation-supported; native alias spelling inferred.**

56 failures per macOS job occur in feedback suites: core 22, CLI 10, snapshot 9,
loop 4, harness 2, web API 3, web UI 6. They include 45 direct containment errors,
secondary assertion failures, and an unavailable enrolled-project fixture.

`treadle/packages/core/src/feedback/store.ts:76` resolves the trusted root through
`realpathSync`, then resolves an absolute candidate without mapping its root alias.
An equivalent absolute path through an alias is outside that lexical physical root.
`treadle/packages/cli/src/harness/feedback-snapshot.ts:140` exposes the same mismatch
when it canonicalizes the workspace but supplies the original absolute pack path.

The test fixtures derive roots from `tmpdir()` without canonicalizing them.
The registry fixture writes that spelling directly at
`treadle/packages/cli/test/feedback-cli.test.ts:38`. The real project registry
requires a canonical workspace at `treadle/packages/cli/src/serve/projects.ts:84`.
That invalid fixture identity explains the separate unavailable-project symptom.

A Linux root-alias probe reproduced the exact containment error for an equivalent
pack directory. Its physical spelling passed. The actual macOS alias spellings
were not printed in the retrieved logs; capture them during the native baseline.
Do not conclude that changing temporary fixtures alone repairs every public entry.

Proposed repair: define one trusted-root normalization policy at the feedback
boundary. Accept equivalent spellings of the explicitly trusted root. Walk and
validate descendant components before following them. Preserve rejection of
descendant symlinks, Windows junctions/reparse redirects, traversal, credential
paths and unrelated roots. Do not simply realpath every selected file or relax
containment. Align ordinary fixtures with the actual registry contract and retain
dedicated alias regressions.

### F2. macOS global Codex hook: successful exit with empty output

**Priority P0. Evidence: implementation-supported; native alias spelling inferred.**

One failure per macOS job occurs at
`treadle/packages/cli/test/codex-project-paths.test.ts:158`: parsing empty stdout.
The preceding exit-status assertion passes.

`treadle/packages/cli/harness/hooks/codex-context.js:140` compares lexical argv
with the ESM module URL. An aliased entry path and a resolved module path can
differ. The script then silently skips its entrypoint. The controlled Linux
probe reproduced exit 0 with empty stdout through an alias; physical invocation
emitted the expected JSON. This is a behavior defect, not just a JSON test issue.

Proposed repair: compare verified entrypoint identity consistently while preserving
the distinction between direct execution and Pi/module import. Inspect the same
pattern at `treadle/packages/cli/harness/hooks/post-tool-check.js:47` as a related
latent risk; this run does not establish a failure of that hook.
Change only authoritative harness files, then use the installer for requested
surfaces. Add direct, aliased, nested and relocated execution checks, plus an
import check that emits nothing and does not consume stdin or exit its host.

### F3. Windows Git snapshots: strict root string identity

**Priority P0. Evidence: implementation-supported failure; exact cause unknown.**

Seven failures per Windows job stop at
`treadle/packages/cli/src/harness/feedback-snapshot.ts:207`. Six report the root
guard directly; the offline-object test fails before its intended check.
The affected suites are CLI 1, loop 1, and snapshot 5.

The code compares `realpathSync(gitRoot)` against `realpathSync(workspaceInput)`
with strict string equality. Windows logs show short user-directory names such
as `RUNNER~1`. Short/long names, retained case, or Git path spelling are plausible
sources of inequality. The logs omit both computed operands, so selecting one
as the proven native cause would exceed the evidence.

First capture the input workspace, both realpath forms, Git toplevel bytes, native
realpath forms and directory identity on Windows. Then choose the smallest safe
identity comparison supported by those measurements. Preserve the requirement
that the enrolled workspace is the Git root. Reject nested workspaces, unrelated
repositories, sibling prefixes, cross-drive/UNC escapes and redirected descendants.
Do not use a blanket lowercase comparison or remove the guard.

Node's [realpath documentation](https://nodejs.org/docs/latest-v24.x/api/fs.html#fsrealpathpath-options-callback)
does not promise case conversion. A Linux `path.win32` example illustrates
representation differences; it is not a native Windows filesystem witness.

### F4. Windows fixture: invalid literal-path filename

**Priority P1. Evidence: implementation-supported.**

One failure per Windows job occurs before snapshot code runs.
`treadle/packages/cli/test/feedback-snapshot.test.ts:281` creates `:(glob)*.ts`,
which contains characters Windows cannot use in an ordinary filename.

Split this combined test into independent literal-path, moving-ref, no-Git,
missing-baseline and symlink cases. Use a valid Windows wildcard-sensitive name,
such as `[literal].ts`, with a decoy match to verify exact selection. Retain the
POSIX-specific magic-name case as a separate platform-qualified test if useful.
Do not skip the entire suite or lose the remaining assertions on Windows.

## Warnings, notices and misleading checks

| Item                                          | Status and proposed disposition                                                                                                                                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four missing smoke artifacts                  | Secondary to skipped smoke stages. Upload test diagnostics for failures. Upload smoke evidence only when that step ran; still fail if an executed smoke step omits its promised report.                                                                       |
| Six Node 20 action warnings                   | Action runtimes need maintenance. Keep application Node 22 and 24 in the matrix; upgrading actions does not change that support contract.                                                                                                                     |
| `url.parse` and `punycode` deprecations       | Emitted by action tooling. Recheck after action upgrades; do not suppress warnings globally.                                                                                                                                                                  |
| Six unsupported `workspaces` warnings         | setup-node's pnpm store lookup runs at repository root and encounters the legacy root package. Clarify root-wrapper responsibility and cache lookup before editing or retiring it. Runtime workspace authority remains `treadle/pnpm-workspace.yaml`.         |
| ESLint 9 and transitive glob deprecations     | Dependency maintenance follow-up. Compatibility review must precede a major upgrade. Install and production audit succeeded; these warnings did not fail this run.                                                                                            |
| LF-to-CRLF warnings in Windows fixtures       | Set fixture-repository `core.autocrlf=false` before staging when tests assert exact bytes. Add explicit CRLF cases where relevant. Do not normalize product snapshots or closed evidence to silence warnings.                                                 |
| Expected `fatal: not a git repository` output | Negative fixture noise, not a failing job on its own. Capture expected stderr and assert its outcome; retain unexpected diagnostic output.                                                                                                                    |
| macOS capacity notices                        | Queue information, not a code defect. Preserve the platform in the matrix.                                                                                                                                                                                    |
| Ubuntu image migration notice                 | Record exact runner OS/image/architecture. Evaluate an explicit image label or scheduled migration separately; do not attribute current failures to Linux.                                                                                                    |
| Named conformance step                        | `.github/workflows/ci.yml:32` invokes a package without a test script. Linux logs show no test output for that step. Root Vitest does execute conformance tests, but this step does not regenerate/compare corpus bytes. Replace it with `pnpm corpus:check`. |
| Missing link gate                             | Add `pnpm links`, required by AGENTS and available in `treadle/package.json`.                                                                                                                                                                                 |

Current Node-24 action candidates were verified through official release APIs
and their `action.yml`: checkout 7.0.1, setup-node 7.1.0, upload-artifact 7.0.2,
pnpm/action-setup 6.1.0. See [action-versions.json](action-versions.json).
Review migration notes, inputs, permissions and cache behavior before choosing
exact commit pins. Keep pnpm 9.15.9 and the frozen product lockfile for this slice.

## Proposed repair sequence

This is a reviewable cleanup proposal, not an admitted task DAG or Start receipt.
Use separate, small commits with explicit responsibilities:

1. **Capture native baseline and regression inputs.** Own the affected tests and
   CI diagnostic output. Print path identity operands in bounded test diagnostics.
   Retain results for all six matrix combinations. Separate F4's combined test.
2. **Repair the feedback path boundary.** Own the core containment helper, relevant
   CLI boundary and canonical fixtures. Address F1 and the measured F3 mechanism.
   Run containment, feedback snapshot, CLI, loop, API, UI and registry regressions.
3. **Repair direct hook execution.** Own authoritative harness hooks and their tests.
   Address F2 with the same supported identity rules. Verify Pi import safety,
   stdin, relocation, nested cwd and both direct hook modes. Install surface updates
   only after the authoritative change and tests pass.
4. **Make CI evidence complete.** Own `.github/workflows/ci.yml` and small diagnostic
   helpers. Replace the ineffective conformance command. Add links, test reports,
   coverage artifacts and explicit smoke-step state. Give each gate a clear name.
   Preserve actual failing exits; do not add `continue-on-error`, widen timeouts
   without evidence, or remove macOS/Windows coverage.
5. **Refresh action tooling separately.** Own only workflow action references and
   necessary compatible inputs. Pin reviewed Node-24 releases. Recheck deprecations
   and pnpm cache behavior. Keep runtime version and product dependencies stable.
6. **Validate the complete candidate.** Run every repository gate locally, then
   require all six native CI jobs on the same candidate commit. Obtain independent
   review of the path/security repairs and retain dated remote evidence.

The root-package/cache warning and ESLint/glob upgrades can follow as separate
maintenance slices after the platform blockers. They must have an explicit owner,
scope and verification method; do not bury them in a broad dependency update.

## Acceptance and closure

- Every F1–F4 failure title maps to a preserved regression or a documented split.
- All six matrix jobs pass on the exact candidate commit. Re-running the old
  commit does not repair deterministic behavior.
- Each job actually runs check, coverage, corpus, brand, production audit, links,
  portable package verification and runtime smoke. No unplanned platform skips.
  Existing seven Bash-only installer tests are reported separately on Windows.
- Coverage meets 75% statements, lines and functions, and 65% branches on the
  required platforms. Retain reports instead of copying Linux percentages.
- Trusted-root aliases work while escaping paths and redirected descendants fail.
  Immutable retries, stale reattachment and offline/no-filter Git checks still pass.
- Direct hooks emit valid JSON; imports remain silent and cannot terminate Pi.
- Each job produces diagnostics. An absent smoke report distinguishes a skipped
  stage from an executed failure. No failed exit becomes a success via report code.
- Review the fresh corpus diff deliberately. Preserve closed packs and old evidence.
- Wiki verification has zero errors/warnings and zero anchors needing review,
  with the existing freshness limits disclosed.
- Native Windows installer coverage is a separate remaining gap: seven skipped
  Bash tests do not verify PowerShell installation. Plan a disposable PowerShell
  contract test and native install witness before claiming Windows onboarding.

## Actual checks and open questions

`gh run view --json`, the complete log retrieval, all six annotation requests,
source reads, Git tree comparison and wiki status returned exit 0.
The declared temporary probe ran once under Linux Node 24.19.0, exited 0, and
completed in 198 ms. It retained both successful physical invocation and failed
alias behavior. See [probe plan](probe-plan.md), [probe](probe.mts),
[results](probe-results.json), and [stderr](probe-stderr.log).
The repository-required local gates also ran on the unchanged source. Each
exited 0: check, coverage, corpus, brand, production audit and links. Check and
coverage each passed 256 tests in 52 files. Coverage was 88.51% statements/lines,
78.44% branches and 95.39% functions. Wiki validation returned zero errors and
warnings. [Local logs](local-checks/) preserve these separate observations.
These Linux results do not repair or verify the failing native jobs. No native
macOS or Windows repair, CI rerun, commit or publication occurred.

The exact named conformance command also returned exit 0 with no test output
locally. This corroborates the missing-script gap; it does not verify the corpus.
Independent findings and their dispositions are in the
[red-foreman review](red-foreman-review.md).

| Question                                      | Kind          | Blocks                               | Resolution owner and method                                                                    |
| --------------------------------------------- | ------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Q1: Exact macOS root/entrypoint spellings?    | Experiment    | Final native root-cause confirmation | Implementer captures operands in matrix diagnostics.                                           |
| Q2: Exact Windows Git-root identity mismatch? | Experiment    | Choosing F3's identity fix           | Implementer captures operands and filesystem identity on Windows.                              |
| Q3: Safe shared identity/containment design?  | Design        | Path and hook implementation         | Plan author proposes alternatives; independent security review verifies preserved trust rules. |
| Q4: Keep or retire the legacy root package?   | Source/design | Later cache/root cleanup             | Maintainer traces remaining callers before a separate bounded change.                          |

Assumption: repair of these shared blockers will expose any currently hidden
downstream failures. Its blast radius is the skipped native stages. The next
matrix run must validate them; this proposal does not declare them green.

No new executable initiative was created for this requested review.
The artifacts and F1–F4 findings are ready for planning. F3's exact normalization
remains blocked on Q2. Next: register a bounded owner-gated CI repair initiative
and use `plan` with this evidence, native diagnosis and acceptance criteria.
Implementation still needs the approved plan's separate Start permission.
