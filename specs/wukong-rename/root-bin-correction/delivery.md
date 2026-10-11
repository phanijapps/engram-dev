# Root executable correction — 2026-10-11 UTC

The owner requested “go fix and push it” after the remaining root package
executable mapping was identified. This supplement records the correction;
the completed canonical pack and its approved artifacts remain unchanged.

The root package now exposes `wukong` through `bin/engram.js`. That wrapper now
calls the imported CLI program's asynchronous parser, so it actually processes
commands. The rebrand helper updates the root and workspace executable names
together, preserves their paths and internal package names, and validates both
manifests before writing. A standalone workspace remains supported.

## Verification

`node specs/wukong-rename/root-bin-correction/verify.mjs` exited 0. Actual
commands, timestamps and exit codes are in [results.json](gates/results.json).
All six repository gates passed: check, coverage, corpus comparison, brand
fence, production audit and links. The suite passed 172 tests across 39 files.
Coverage was 86.22% statements and lines, 76.06% branches and 94.71% functions.

The verifier deployed the actual CLI dependency tree outside the checkout,
copied the root wrapper and metadata, and checked its `--help` and `--version`.
Help reports `Usage: wukong` and Wukong. This proves the deployed wrapper runs;
it does not establish an actual npm global install or a new native CI result.

Wiki fingerprint, stamp, anchor, validation and status commands all exited 0:
44 concepts, 0 errors, 0 warnings, 153 anchors checked and 0 needing review.
One existing finding remains pending. Freshness uses Git HEAD and Python-only
fingerprints; it does not prove detection of dirty TypeScript or Markdown.

The retained first attempt failed the brand fence because the test fixture used
a literal product directory name; the fixture now uses `workspace`. The second
attempt caught the root wrapper exiting successfully without producing help,
which exposed the missing CLI invocation. Their logs and results remain in
`gates/attempt-1-*` and `gates/attempt-2-*`; the final results above follow both
repairs. An earlier direct checkout invocation also failed package resolution
because root dependencies were not installed there; the deployed fixture
provides the actual launch evidence.

Independent final review: [review.md](review.md).
