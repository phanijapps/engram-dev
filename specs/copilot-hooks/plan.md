# Proposed task plan

Status: awaiting owner review. Structural entry set: T-1.
Accept D-1 and D-2, then use the separate Start implementation action.
One receipt covers the complete approved sequence. No task is admitted here.

## T-1: Local Copilot lifecycle adapter

Implement `copilot-context.js` against the provider payload contract.
Reuse the bounded shared helper without changing Claude or Codex envelopes.
Test valid session context, discarded prompt output, missing cwd, malformed or oversized stdin, missing runtime, timeout, and recovery.
Invoke the wrapper as a child process with controlled runtime output; assert no prompt or token persistence.

Scope: authoritative wrapper, shared helper only if required within this contract, and `copilot-hooks.test.ts`.
Satisfies FR-2 and FR-4. Implements DES-1. Requires D-1 and D-2.
Check from `treadle`: `pnpm exec vitest run packages/cli/test/copilot-hooks.test.ts`.
Expected: protocol fixtures pass with exact output shapes and bounded failures.

## T-2: Project installer wiring and ownership

Needs T-1 because emitted commands invoke the verified adapter.
Add the manifest wiring kind, project JSON format branch, ownership records, and removal behavior.
Correct missing-wiring and global-scope messages.
Remove the init command exclusion that skips project bootstrap for Copilot after valid hook installation.
Cover clean install, dry-run, repeat install, upgrade, removal, foreign config, malformed version and arrays, force refusal, relocated checkout, and spaces.
Rerun all existing installer and lifecycle tests.

Scope: harness manifest; installer types, manifest, plan, apply, paths, and init command; installer and Copilot tests.
Satisfies FR-1, FR-3, FR-4, and FR-5. Implements DES-2. Requires D-1 and D-2.
Check from `treadle`: `pnpm exec vitest run packages/cli/test/copilot-hooks.test.ts packages/cli/test/init-engine.test.ts packages/cli/test/init-surfaces.test.ts packages/cli/test/codex-context.test.ts packages/cli/test/claude-context.test.ts packages/cli/test/codex-project-paths.test.ts packages/cli/test/claude-project-paths.test.ts`.
Expected: project wiring works, foreign data survives, invalid config refuses before writes, and existing hosts stay green.
Verify emitted Unix commands locally. Native Windows and actual Copilot runs remain follow-ups, not fixture claims.

## T-3: Documentation, installation witness, and delivery checks

Needs T-2 because documentation must describe the final emitted integration.
Update current documentation from integration pending to the verified installed behavior.
Install and remove in a temporary project through the CLI. Preserve a dry-run and actual output.
Do not patch installed host copies independently.
Run the 6 repository gates and the wiki maintenance block once after checking cited sources.
Keep source freshness limits visible.
Obtain independent read-only red-foreman review; fix within-scope findings and rerun affected expectations.
After current-plan PACK review, open the library review page for the separate owner Finish action.

Scope: README; guide; hook README; affected wiki pages and metadata; and `verify-delivery.mjs` inside this pack.
Satisfies FR-4 and FR-5. Implements DES-3. Requires D-1 and D-2.
Check from repository root: `node specs/copilot-hooks/verify-delivery.mjs`.
Expected: a retained temporary installer witness; all repository gates exit 0; wiki has 0 errors, 0 warnings, 0 anchors needing review, and a fresh stamp.
The verifier must report each subprocess exit and retain logs; no native host claim follows from this check.

## Follow-ups

| ID | Scope | Unblock evidence |
| --- | --- | --- |
| F-1 | Actual Copilot CLI activation on Linux, macOS, and Windows | Host versions, actual event observations, human trust where needed, restart and removal journeys |
| F-2 | Cloud bootstrap and job acceptance | Runtime installation inside sandbox, default-branch configuration, actual isolated job evidence |
| F-3 | User-level Copilot installation and VS Code integration | Separate approved design and host contracts |

No executable placeholder tasks cover these follow-ups.
The existing harness-host-acceptance pack is unchanged; it does not cover Copilot.
Checks in this plan are declared future checks. Current documentation and planning verification live in `checks/report.md`.
