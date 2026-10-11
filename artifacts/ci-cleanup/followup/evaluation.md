# Follow-up native failure and fixture repair — 2026-10-11

Run 38176545852 tested branch commit
`ff17f0050493b0811a7d562728d15887144e8f72`. Five jobs passed. Windows Node 22
failed the main check at `packages/web/test/owner-workflow.test.ts:153` with
`fetch failed`, cause `ECONNRESET`; its coverage, corpus, brand, audit, links,
runtime package and smoke steps passed. The failed run metadata and exact
compressed failed-step transcript are retained here. The earlier green run is
not transferred to this failed attempt.

The test hosted its HTTP server in the same event loop that repeatedly executed
synchronous CLI and verification children. The repaired fixture uses asynchronous
`execFile` and awaits each real child result. It preserves every owner act,
revision, task evidence and independent-review/closure assertion. Native `node`
executes the existing `node -e "process.exit(0)"` check directly, removing the
incidental dependency on Bash. Failed or timed-out children still fail assertions;
there is no retry, skip or server/backend modification.

Single-fetch local probes did not reproduce the reset. The retained two-mode
`keepalive-probe.mjs` warms two connections and gives the pool an event-loop turn
before starting the same six-second child. On Linux Node 22.14.0, blocking mode
then reproduced `ECONNRESET`; async mode returned `ok`. Each probe exited 0
under its explicit expected-result contract. This demonstrates the blocking
mechanism and supports the native explanation; Windows sockets were not directly
instrumented. Node documents its socket idle timeout and reset-reduction buffer
in [the HTTP API](https://nodejs.org/download/release/latest-v24.x/docs/api/http.html#serverkeepalivetimeoutbuffer).

## Independent review

The read-only red-foreman reviewer returned **PASS — nothing to fix** after one
contained defect was repaired: the helper initially allowed a string native
error code into its promised numeric/null status. It now preserves numeric
exit codes and maps launch errors to null. The exact reviewed test SHA256 is
`dbe755be4daf4a0c97402cb9ead9e55753387bec407da40d3c76d5f2d6fee04c`.

Actual independent checks:

- `CI= pnpm exec vitest run packages/web/test/owner-workflow.test.ts`: exit 0,
  all 11 existing tests pass.
- Scoped Prettier: exit 0.
- Strict TypeScript program for the exact helper: 0 diagnostics. This is not a
  claim that all repository test files are typechecked.
- Native execution probes: stdout/stderr preserved, success status 0, nonzero
  status 7, missing-executable status null.
- Both retained connection-pool probes independently reran with the expected
  blocking reset and async success.

Final local gate results and the additional source pins are retained in
`results.json`. The subsequently pushed head requires another six-job native run;
its final evidence belongs to PR 3 and GitHub's uploaded job receipts.
