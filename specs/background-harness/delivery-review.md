# Delivery review — 2026-10-10

Independent reviewer: `/root/red_foreman_plan` (read-only red-foreman).

**Implementation verdict: PASS — nothing to fix.** Final follow-up reran
init-engine, init-surfaces and harness-packages: 30 tests passed. Earlier full
implementation review reran 57 tests across 12 focused suites and verified the
standalone runtime package outside the checkout on Linux.

The follow-up independently checked guard invocation, malformed smoke
validation, installer ownership merge/removal, and native package generation.
The implementer did not supply the review verdict.

Prior findings and repairs:

- Startup/recovery ownership could be interrupted between directory creation
  and owner publication. `serve/runtime.ts` now publishes a prepared owned
  directory atomically; dead-owner recovery tests pass.
- Prefix containment was unsafe across native path separators. Registry,
  knowledge iterator and browser guards now use path.relative with both parent
  and absolute-path refusal. Focused traversal/symlink tests pass.
- Actual Claude validation rejected the agents directory and explicit default
  hook declaration risked duplicate loading. Generation now uses default
  Claude scans; the real host validator exits 0 with existing metadata warnings.
- Windows absolute paths could skip the legacy Claude guard. Script invocation
  now compares resolve(argv[1]) with fileURLToPath(import.meta.url).
- Malformed smoke artifacts without checks could count as runtime witnesses.
  The verifier now requires an array and all six named expectations.
- Partial installer updates could lose previous file ownership. Updates retain
  ownership and replace only exact recorded obsolete wiring; foreign definitions
  and matcher metadata survive. Regression test and independent rerun pass.

**Release/PACK verdict: not complete.** The canonical T-12 release matrix still
requires actual native macOS/Windows runtime evidence and full host journeys,
including separate Codex desktop/IDE behavior and human hook trust. Published
contracts, fixture callbacks, plugin validation or a CI declaration do not
supply that evidence. T-14 and the owner's separate Finish spec remain pending;
no PACK PASS or human completion is fabricated.

Local repository gates passed on the final source. `gates/results.json` retains
the full run and wiki maintenance block; `delta-gates/results.json` retains the
final source recheck. The earlier failed lint attempt remains in
`delta-gates-attempt-1/`. Wiki validation/status reported zero errors/warnings,
zero anchors needing review and a fresh HEAD stamp. Python-only fingerprints
and HEAD-based stamps do not establish dirty TS/Markdown freshness.

The final display follow-up removes leading wiki YAML metadata from previews.
The independent reviewer reran project-library and project-security (3 tests),
confirmed the opaque sandbox and authority boundaries remain intact, and
returned PASS. Final `pnpm check` output is retained in `final-check.log`.

First actual CI run 38098882555 failed before tests: Windows checkout rejected
colon-bearing gate log names; pnpm setup's version 9 conflicted with the pinned
9.15.9 on Linux/macOS. Log filenames and future runner output now replace colons
with dashes (bytes preserved), and CI selects the exact workspace pin. The
failed jobs are retained in ci-first-run.json; they establish no runtime pass.

The native receipt/fixture repair at c263caf received an independent read-only
red-foreman verdict: **PASS — nothing to fix**. The reviewer reran 41 focused
owner, where, installer, keyboard and corpus tests. This verdict covers source
repairs; it does not supply native host activation or PACK completion.

Actual CI run 38099342799 passed both Linux rows and failed macOS/Windows rows.
The results are retained in ci-third-run.json. It exposed macOS /var realpath
aliases, Windows short-path/line-ending worktree identities and home-directory
fixture assumptions. The aliased-bundle regression in alias-regression-before.log
reproduced the knowledge defect on Linux before its repair (exit 1).

The alias/worktree repair at a0defcb received an independent read-only
red-foreman verdict: **PASS — nothing to fix**. The reviewer reran 45 focused
containment, worktree, registry, pi and installer tests, then rechecked 15
alias/worktree/registry tests after CRLF parsing. Native CI/PACK completion
remains outside that source verdict.

The final worktree identity review first required replacing raw path comparison,
then found that the renamed fixture's failure cleanup still used its old name.
Both findings were repaired: native/NUL/filesystem identity is used, and each
fixture owns a unique sandbox with both sibling checkouts. Independent final
red-foreman verdict: **PASS — nothing to fix**; 7 worktree tests passed. The final
local `pnpm check` (167 tests) is retained in final-check.log. Native CI still
supplies the Windows witness separately.

The fifth native run exposed packaging failures after successful macOS tests,
and an intermittent Windows Node 22 missing host asset. A preliminary macOS
full-pass report was corrected; ci-fourth-run.json and ci-fifth-run.json retain
the actual failures. Windows Node 24 also reached and failed the legacy brand
gate because its slash-based exemptions did not match native path separators.

After repair, independent packaging review returned **PASS — nothing to fix**
and reran host package generation plus the aliased standalone runtime verifier.
Independent brand-gate follow-up returned **PASS — nothing to fix**, with
`pnpm brand:check` exit 0. Host assets are now compared with source hashes before
the package descriptor is written; runtime deployment canonicalizes its parent
and refuses broken links with explicit diagnostics. Windows native rows must
confirm the platform copy workaround; no native success is inferred locally.

The sixth run exposed descriptor removal during macOS Node 24 shutdown.
Independent review of the narrow ENOENT repair and deterministic regression
returned **PASS — nothing to fix**, with all 7 lifecycle tests passing. The
reader still refuses malformed descriptors and other filesystem failures.
This source verdict does not assert completion of the remaining native run
or any host trust/activation journey.

Independent review of the same-drive staging and dependency relocation repair
returned **PASS — nothing to fix**, with the aliased standalone runtime verifier
exit 0. A concurrent local gate attempt discovered test files inside staging
before cleanup; delta-gates-staging-attempt preserves that failed run. Staging
was moved beside the TypeScript workspace so its test discovery cannot include
the package. Final repository gates are rerun sequentially.

The staging-parent correction received a separate read-only red-foreman PASS.
The sequential final local run passed all six repository gates (168 tests);
actual command exits remain in delta-gates/results.json.
