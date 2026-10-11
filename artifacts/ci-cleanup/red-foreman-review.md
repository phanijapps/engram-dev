# Independent implementation review — 2026-10-11

Reviewer: `/root/ci_cleanup_red`, read-only red-foreman agent, independent of
implementation. Comparison: main `18c527bd652847a2ae80c07212f4aaaaed9572e3`
through `76e2486c025de56df3ad795c508e5f75512eb3af` plus the final dirty
recorder/documentation repairs recorded in `source-pins.json`.

## Verdict

**PASS — nothing to fix.** No outstanding findings. The final pushed commit's
native rerun remains a completion check; the reviewed six-job green belongs to
the earlier source state and is not transferred to a new head.

## Findings retained and repaired

1. **DEFECT — development engine floor.** `README.md:216` and
   `CONTRIBUTING.md:6` originally promised Node 22.13+ or any 24.x, while the
   resolved DOM dependencies require 22.22.2+ or 24.15+. The README, contribution
   guide and wiki now state the actual development floors; runtime remains 22+.
   Reviewer rechecked package engines and documentation.
2. **DEFECT — malformed smoke report loses other outcomes.**
   `treadle/scripts/ci-report.mjs:14` originally parsed smoke JSON before saving
   the receipt. A failed smoke step with truncated JSON exited 1 without saving
   any gate outcomes. The recorder now saves outcomes, null smoke and explicit
   `smoke_error` before failing. Regression coverage and an independent temporary
   process probe both confirmed exit 1 with retained failure outcomes and
   SyntaxError text.
3. Four current wiki pages failed a scoped formatting check. They were formatted
   and the independent Prettier rerun exited 0. This repair does not rewrite
   closed historical packs or their bound evidence.

## Actual independent checks

```sh
CI= pnpm exec vitest run packages/core/test/feedback-paths.test.ts packages/core/test/feedback.test.ts packages/cli/test/native-path-identity.test.ts packages/cli/test/hook-entrypoint.test.ts packages/cli/test/feedback-snapshot.test.ts packages/cli/test/feedback-cli.test.ts packages/cli/test/feedback-loop.test.ts packages/cli/test/codex-project-paths.test.ts packages/cli/test/ci-report.test.ts packages/cli/test/installers-powershell.test.ts packages/brand/test/brand-gate.test.ts packages/web/test/feedback-api.test.ts packages/web/test/feedback-ui.test.ts packages/cli/test/feedback-harness.test.ts
```

Exit **0**, **72 passed**, **9 Windows-only skips** on Linux. The independent
malformed-report child probe exited **1** as expected, preserving failed check
and smoke outcomes in its receipt. Scoped Prettier exited **0**. All **42**
current source hashes matched the refreshed inspection pins.

Reviewer inspected trusted-root aliases versus forbidden descendant symlinks and
junctions; hook direct entry versus silent Pi imports; workflow step outcomes,
artifact uploads and action release SHA pins; portable fixtures; PowerShell
native command exits; generated-only brand exclusions; and bounded wiki
chronology. All four action pins matched release references, including the
dereferenced annotated pnpm tag.

All six native run 38175935828 receipts independently showed successful
install/check/coverage/corpus/brand/audit/links/package/smoke outcomes, actual
runner image versions and smoke payloads at PR merge
`400c231cfed503e5cfaf290ee97d9c069bf96750`. The dated G5 supplement preserves
the historical pack and separate real host acceptance. No approval, host trust
or human action was inferred from CI success.
