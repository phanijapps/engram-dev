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
