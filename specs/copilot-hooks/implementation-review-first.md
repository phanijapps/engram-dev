# Independent implementation review: repair findings

Reviewer: agent:red-foreman. Reviewed source: 021d767.
The reviewer reproduced 2 DEFECT findings before a final PACK verdict.

1. `treadle/packages/cli/src/harness/plan.ts:283`: dry-run omitted runtime-pointer conflicts that apply refused.
Fix: expose pointer conflict in the compiled plan with matching force semantics.
2. `treadle/packages/cli/src/harness/apply.ts:407`: removal skipped config preflight for dangling symlinks because existsSync follows the target.
Fix: preflight recorded configuration independently of existsSync, allowing genuinely absent files and refusing unsafe links.

Actual probes: `pnpm exec tsx /tmp/copilot-review-probes.mts`, exit 0; `checks/implementation-review-probes.log` retains reproductions.
The independent exact T-1 check exited 0 with 25 tests; T-2 exited 0 with 63 tests in 7 files.
Those green checks did not cover the 2 defects. Repairs and regression checks return to independent review.
