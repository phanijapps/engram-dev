# Independent implementation review — 2026-10-12

Reviewer: `/root/search_kb_plan_review`.
Verdict: **FIX BEFORE DELIVERY**.
Scope: source commits `ed9b257`, `0ab005b`, and `2fc227e`.
This is an implementation audit, not the final PACK review.

## DEFECT

**1. Init reports nonexistent Copilot hook outputs.**
Location: `treadle/packages/cli/src/commands/init.ts:194`.
The new success message tests requested flags, rather than actual hook materialization.
A valid empty custom manifest enables the default hooks flag but has no hook rows.
Actual isolated CLI initialization exited 0 and printed that hook scripts and a runtime pointer were installed.
The fixture had no `.harness/hooks` directory.
This violates FR-6's truthful setup guidance.
Fix: guard the message on successful non-skipped hook output and add an empty or unavailable-hook regression.

**2. Root bin recovery guidance excludes the supported fallback.**
Location: `bin/engram.js:8`.
The shared setup helper accepts pinned pnpm when Corepack is absent.
The missing-entry message instructs that supported user to run only `corepack pnpm run setup`.
That command cannot execute without Corepack, although setup itself supports the environment.
Fix: print backend-neutral guidance such as `node scripts/setup.mjs`, and update the missing-entry regression.

## Actual checks

The combined targeted command exited 0:

```text
pnpm exec vitest run packages/cli/test/source-setup.test.ts packages/cli/test/installers.test.ts packages/cli/test/installers-powershell.test.ts packages/cli/test/copilot-hooks.test.ts packages/cli/test/init-surfaces.test.ts
```

Result: 60 tests passed and 10 tests skipped on Linux.
Log: `checks/review-implementation-tests.log`.
The native root lifecycle test performs actual frozen installation, build, both lock checks, and compiled CLI smoke in a temporary path with spaces.
Windows-only installer tests remain skipped locally; future remote results must remain explicit.

Source inspection confirms literal argument arrays on Unix and encoded literal arguments for Windows shims.
Tool and version checks precede dependency changes and installer Git mutation.
Setup stops on failed installation or build; installers protect other branches and retain ref overrides.
Root packaging no longer resolves nested packages through unsupported file dependencies.
Cold-clone tests materialize the wrapper, helper, pointer, and config, and execute the copied callback against a controlled runtime.
They preserve target dependency bytes, foreign config, and applicable guide or backup bytes.
The docs distinguish source setup, target initialization, and native activation.
No additional source or documentation defect emerged from this audit.

The reviewer performed no source repair, task admission, owner action, wiki mutation, or closed-pack edit.
Only this report and its pack-local test log changed through reviewer actions.
Final PACK review remains necessary after repairs and delivery gates.
