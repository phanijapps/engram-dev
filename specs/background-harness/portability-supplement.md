# Portability supplement — 2026-10-10

This execution supplement records repairs within the requested native Linux,
macOS and Windows scope. It does not change the approved plan or owner acts.

Actual CI run 38098956047 reached tests on all six OS/Node combinations and
failed. `ci-second-run.json` retains the observed job results. Failures exposed
legacy recall's dependence on a global CLI, Unix-only executable shims and
path assertions, URL pathname handling on Windows, and a production receipt
flush failure. The earlier bootstrap failures remain recorded separately.

The authoritative recall adapter now uses the installed runtime pointer,
with an explicit legacy CLI override retained. JavaScript override fixtures run
through Node. Test and corpus subprocesses use Node's tsx import, and native
paths are normalized with node:path and fileURLToPath.

For specpack/0.4, POSIX retains the parent-directory flush. Windows flushes the
published pack or journal file because Node cannot open the directory handle
used by the POSIX path. File flush errors still preserve pending canonical
receipts; no approval is repeated or bypassed. SECURITY.md explicitly limits
power-loss claims. The existing owner-workflow and recovery tests exercise the
ordinary receipt behavior; actual Windows CI must supply the native witness.

Full local gates are rechecked after these changes. Native runtime witnesses
and full agent-host journeys are distinct: a passing CI smoke does not establish
human hook trust, host reload behavior, or owner completion. Those release
limits remain in delivery-review.md and the canonical specpack.

Local repair verification on Node v24.19.0/Linux: `pnpm check` (38 files,
166 tests), `pnpm coverage` (86.12% statements/lines, 76.10% branches,
94.59% functions), `pnpm corpus:check`, `pnpm brand:check`, `pnpm audit:prod`
and `pnpm links` all exited 0. Exact commands, times and exits are retained in
`delta-gates/results.json` with raw logs. `node scripts/verify-runtime-package.mjs`
exited 0 (`portability-package.log`), and the isolated Linux lifecycle smoke
exited 0 (`linux-smoke.json`). Source whitespace verification exited 0; raw
logs retain original output whitespace.

Third native run 38099342799 passed Linux Node 22/24. macOS exposed root aliases
(`/var` and `/private/var`) breaking relative concept ids, links and worktree
identity. Windows exposed native-home fixture assumptions and worktree path
normalization. These are recorded actual failures, not successful release
witnesses. The owner receipt tests now pass on Windows in this run.

Enumeration now expresses a contained, deduplicated real target relative to the
caller's bundle-root spelling. Realpath still guards containment and excluded
paths. A root-alias regression failed on Linux before the change, then passed.
Worktree identity uses realpaths and handles CRLF records. Tests compare canonical
registry roots and isolate the native home variable, and the pi privacy assertion
uses a unique prompt token so the macOS system path cannot masquerade as a leak.

Fourth native run 38099542276 passes the Linux rows and macOS tests, but
macOS portable packaging fails on a dangling pnpm self-reference. Windows
still fails duplicate current worktree reporting. `ci-fourth-run.json` records the actual result. The source
reviewer rejected raw-string directory identity. The repair uses NUL-separated,
unquoted Git records, Windows native final-path handles, and bigint device/inode
comparison before a canonical-path fallback. The linked-worktree fixture includes
Unicode and spaces and reports paths on failure. Native confirmation follows.

Primary implementation references: [Node filesystem API](https://nodejs.org/download/release/latest-jod/docs/api/fs.html#fsrealpathsyncnativepath-options)
and [libuv Windows final-path implementation](https://github.com/libuv/libuv/blob/v1.x/src/win/fs.c#L2821).


Correction to the preliminary status: macOS test success did not establish a
full row pass. Actual fifth run 38099859100 confirms the packaging failure
after tests; ci-fourth-run.json and ci-fifth-run.json retain the failed rows.
The fifth run fixes native worktree reporting but exposes an intermittent
Windows Node 22 incomplete host asset copy.

Runtime deployment now canonicalizes its destination parent before pnpm
calculates links, computes the source self-reference once, and reports broken
links explicitly rather than skipping them. The standalone verifier uses an
aliased parent on every OS. Host packaging captures every expected asset hash
before copying and refuses incomplete output before its package descriptor is
written. Windows uses Node's JS directory traversal through an explicit copy
filter, avoiding the native fast path with upstream Windows regressions. This
last choice is an inference from the observed missing asset and upstream
implementation; native CI must confirm it.

Sources: [Node directory-copy implementation](https://github.com/nodejs/node/blob/v22.x/lib/internal/fs/cp/cp-sync.js#L129)
and [upstream Windows copy regressions](https://github.com/nodejs/node/issues/59636).

Windows Node 24 in the fifth run reached the brand gate and exposed a legacy
separator bug: legitimate fenced paths and generated corpus/coverage files were
flagged because the whitelist compared forward slashes to native backslashes.
The checker now normalizes only its comparison path; source reads and allowed
rules are unchanged. Independent follow-up and `pnpm brand:check` exited 0.
Final local check and aliased standalone packaging also exited 0 after repairs.

The sixth native run 38100335336 confirmed the macOS Node 22 package and runtime
journey, then exposed a macOS Node 24 shutdown race: service.json disappeared
between the stop caller's stat and read. readDescriptor now treats only ENOENT
during filesystem access as absent; malformed JSON, symlinks, unsupported
protocols and other I/O failures still refuse. A deterministic test removes the
descriptor between those operations and checks malformed replacements remain
refused. Independent read-only red-foreman review returned PASS and reran all
7 lifecycle tests. Native CI must still verify the repaired source.

Both Windows rows in the sixth run passed check, coverage and brand, then
failed portable deployment across drives (checkout D:, temporary output C:).
pnpm 9 computes modulesDir with path.relative, whose cross-drive result is an
absolute Windows path; downstream joining prefixed the checkout to that path.
Packaging now deploys to an owned temporary staging root beside the workspace,
validates every dependency link, copies through the JS traversal and relocates
links within the final requested root. Staging is removed in finally. The
aliased standalone Linux verifier exits 0 with the relocated package.
Source: [pinned pnpm deploy implementation](https://github.com/pnpm/pnpm/blob/v9.15.9/releasing/plugin-commands-deploy/src/deploy.ts).
The failure and its tested revision are retained in ci-sixth-run.json; native
confirmation of the cross-drive repair remains required.
