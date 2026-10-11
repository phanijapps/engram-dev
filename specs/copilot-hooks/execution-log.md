# Copilot hooks execution observations

The owner accepted D-1/D-2 and started plan digest `cec6d1dcad85ee74b4b48070da21c63fb1feccb761a1afbc8ababf6ddcc31194` at canonical revision 7.
T-1 was admitted through `do next --expected-revision 7`, producing revision 8.

T-1 implementation detail: a separate wrapper reuses bounded stdin and eventContext, and keeps Copilot output separate from existing hosts.
The first file-write attempt used repository-prefixed paths from `treadle` and failed; its subsequent empty test selection exited 1.
No task pass was recorded for that failure; the retained log is `checks/T-1-path-failure.log`.
The corrected T-1 expectation exited 0 with 11 fixtures, including the actual 20-second child timeout. Canonical evidence records the pass at revision 9. Commit: `55f6c4c`.
Approved proposal documents remain unchanged.


T-2 was admitted at revision 10. Its exact expectation exited 0 with 63 tests in 7 files.
The installer now handles direct Copilot event arrays and preflights malformed configuration, payload conflicts, and pointer conflicts before writes.
Ownership records distinguish installed definitions from identical foreign definitions.
Removal preserves foreign keys, edited entries and sibling files, and refuses malformed configuration before deleting payloads.
Unix commands were executed after checkout relocation; native Windows host execution remains unverified.
A preliminary brand gate exited 1 because the JSON filename contained a literal product name in source/tests.
The implementation now derives that filename from `brand.binName`; the repaired brand check exits 0.
Checks: `checks/T-2-pass.log`, `checks/T-2-brand.log`. Source typecheck and scoped ESLint exited 0.
