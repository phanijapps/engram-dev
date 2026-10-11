# Observed Windows shutdown issue

CI run [38103822214](https://github.com/phanijapps/engram-dev/actions/runs/38103822214)
tested rename source `33ebde12642fb3133238febcf495d95edebf6005`. All six
Linux/macOS/Windows Node 22/24 rows passed, with Windows Node 22 succeeding on
an identical-source retry. Its first coverage attempt failed in the existing
Claude callback test's final shutdown: `EPERM` opening `service.json`.
The original failure is retained in [attempt-1-windows22.log](attempt-1-windows22.log)
and the completed run in [result.json](result.json).

Independent red-foreman identified a DEFECT at
`treadle/packages/cli/src/serve/runtime.ts:311`: descriptor reads in post-shutdown
polling can throw a transient Windows file-access error. The rename changed
only the stable storage token in this module; the shutdown behavior and Claude
callback test were inherited. The passing retry does not establish a fix.

A follow-up should reproduce the polling failure and verify bounded retries
after authenticated shutdown, while preserving strict pre-authentication
descriptor reads and refusal to stop an unverified process. Retry exhaustion
must remain a failure. This is proposed follow-up scope, with no implementation
or owner start approval recorded here.
