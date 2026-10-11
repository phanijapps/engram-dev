# CI cleanup — 2026-10-11

The requested repairs cover the failures and false-green gates identified in
`artifacts/ci-review-38173060745/cleanup-plan.md`. Source comparison starts at
main `18c527bd652847a2ae80c07212f4aaaaed9572e3`; `source-pins.json` records the
final inspected source bytes, including uncommitted follow-up repairs.

## Repairs

- Feedback maps the explicitly trusted root alias to native physical identity,
  then rejects redirects beneath that root. Git workspace checks use native
  realpaths. Root alias, sibling, traversal and descendant symlink/junction
  tests preserve the containment boundary.
- Hooks identify direct execution through physical paths; importing them as Pi
  modules leaves stdin and the host process intact. The authoritative harness
  tree was updated first; the installer refreshed Codex, Claude and Pi payloads
  with `--hooks-only --force`. Installed Pi copies are committed.
- Fixtures use canonical roots where they model enrolled projects. Portable
  bracket filenames and POSIX-only Git magic names are separate tests. The
  durability test still checks exact flushed paths, now in physical form.
  Fixture Git line-ending configuration prevents checkout-dependent warnings.
- CI attempts all downstream checks after an earlier installed-workspace gate
  fails. It now invokes the real corpus byte comparison and documentation link
  check, records actual outcomes, and uploads diagnostics, coverage and smoke
  receipts per matrix job. Missing or malformed executed smoke reports fail the
  recorder after it preserves other outcomes. Regression tests cover both cases.
- GitHub actions are pinned to reviewed releases using Node 24. The obsolete
  root npm workspace declaration was removed. Generated reports stay outside
  the product brand fence; a test proves source literals are still rejected.
- ESLint 10.12.0, Vitest/coverage 5.0.3, Vite 8.3.4 and Ajv 8.20.0 replace the
  obsolete development chain. Vite is explicit to satisfy Vitest's peer contract.
  Lint fixes remove unused initializers and preserve the manifest error cause.
  Development checks require Node 22.22.2+ in 22.x or 24.15+ in 24.x due to the
  resolved DOM dependencies; the application runtime remains Node 22+.
- Windows runs nine PowerShell installer contracts with native command exit
  codes and paths containing spaces. POSIX continues running the Bash contracts.
  These disposable stubs do not establish an actual global installation or host
  trust/activation.

## Actual validation

The original failing run remains preserved byte-for-byte. First repair commit
`95415c6b8d8d099b43293a9ad7cf2fbaee19eefe` cleared the original failures in
run 38175456994, but that run still failed: its durability assertion expected
lexical paths and its brand scan encountered generated test diagnostics. Both
were repaired before the next push; the failed run remains retained.

Run [38175935828](https://github.com/phanijapps/wukong/actions/runs/38175935828)
passed **all six jobs** for branch commit
`76e2486c025de56df3ad795c508e5f75512eb3af` (tested PR merge
`400c231cfed503e5cfaf290ee97d9c069bf96750`). POSIX jobs passed 266 tests with
9 Windows-only skips; Windows jobs passed 267 tests with 8 POSIX-only skips.
Every declared gate and all six smoke reports exited successfully. Run metadata,
the exact compressed transcript, receipts, coverage summaries and compressed
test reports are retained beside this report.

The native identity probe confirmed the original Windows root mismatch:
`C:\\Users\\RUNNER~1` versus `C:\\Users\\runneradmin`, with equal native realpaths.
This converts the investigation's earlier short-name hypothesis into an observed
cause. macOS reported `/var` versus `/private/var` aliases as expected.

After the independent review's recorder repair, final local checks exited 0:
`pnpm check`, `coverage`, `corpus:check`, `brand:check`, `audit:prod`, and `links`.
The suite passed **267 tests**, with 9 Windows-only skips. Coverage is **84.32%
statements, 76.16% branches, 88.44% functions and 87.15% lines**; every unchanged
floor passed. The full dependency audit reported **zero advisories**.
See `checks/final-results.json`, individual logs and `checks/audit-all.json`.

The final PR run must validate the subsequently pushed commit; the earlier native
green does not certify later source bytes. Final remote evidence remains attached
to [PR 3](https://github.com/phanijapps/wukong/pull/3) and its check run rather than
creating a self-referential evidence-only commit cycle.

Independent read-only red-foreman review concluded **PASS — nothing to fix**.
It reran 72 tests, checked the two repaired defects, action pins, source hashes
and scoped formatting, and independently inspected the six native receipts.
The full verdict and actual commands are retained in `red-foreman-review.md`.

## Documentation and limits

The bounded build-kb refresh inspected dependencies, filesystem boundaries,
hook consumers, outcome storage and CI operations. It added
`wiki/project/ci-verification.md`, refreshed engineering controls, security
posture, architecture and the open-work supplement, and linked dated chronology
through `wiki/log.md`. Product context, domain entities, REST contracts, existing
feedback event schemas and application storage models are unchanged and do not
require new explanations. There are no inaccessible external runtime consumers
established by this pass; real host activation remains unresolved separately.

Wiki checks reported **47 concepts, 177 anchors, 0 needing review, 0 errors and
0 warnings**, and a fresh stamp at the held head. The existing pending finding
was preserved. Fingerprints still cover Python only and freshness still compares
Git HEAD; neither establishes dirty TypeScript/Markdown coverage. A final local
stamp refresh follows the final commit without a stamp-only commit loop.

Residual upstream diagnostics are not repository check failures: the pinned
pnpm 9 CLI can emit `DEP0169` on local Node 24, and pnpm/action-setup emits
`DEP0190` on Windows from its native-command invocation. Expected negative Git
fixtures also print fatal diagnostics. These were not suppressed to invent a
warning-free claim. Runner capacity/image migration notices remain provider
conditions; actual image versions are retained in the matrix receipts.

Closed specpacks and their hash-bound evidence were preserved. The earlier
investigation report and its pins remain historical; the cleanup records do not
replace them or invent retrospective owner receipts.
