# Implementation observations

2026-10-11: The owner’s Start receipt is recorded at revision 25 for plan digest a893d71ed15098e51c3c4804132b4e7f8515e93a5989c31bea96772d94ac0e8f. No owner act was issued by the implementing agent. CLI do next admitted T-1 at revision 26. The full machine slice is in checks/T-1-context.json; CLI output is in checks/T-1-handout.log. Prior uncommitted hook repairs remain intact.

T-1 implementation choices: use a separate typed feedback ledger and immutable text snapshots. Feedback transitions share the pack lock, record explicit claims, and never rewrite canonical pack or receipt bytes.

T-1: declared verification `pnpm exec vitest run packages/core/test/feedback.test.ts` exited 0 with 19 tests. Source typecheck and focused ESLint exited 0. The engine recorded passing evidence at revision 27. Snapshot and pointer failure-injection tests cover unacknowledged publication and explicit recovery. Current wiki pages do not yet describe feedback; T-7 owns that update.

T-2: admitted at revision 28; the exact declared CLI/snapshot command exited 0 (15 tests), logged in checks/T-2-attempt-1.log. Typecheck and source lint exited 0. The engine recorded passing evidence at revision 29. Git object/index reads plus direct worktree reads prevent configured diff/textconv/clean/smudge execution. CLI retries replay original immutable snapshots. Native binaries for Claude, Codex and Pi are available; native delivery witnesses still belong to T-6. Commit f972f33 contains T-1 and the approved proposal; its HEAD change makes the knowledge stamp stale until T-7, without changing frozen plan bytes.
