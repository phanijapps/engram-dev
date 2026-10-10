# Coverage source resolution gap

The pre-fix coverage run passes all 113 tests but fails the existing global
floors. It reports 59.7% lines and 65.71% functions. Core specpack source
functions appear unexecuted even though CLI ceremony and corpus tests run
their compiled package exports. Evidence: `coverage-before-source-aliases.log`.

H1: the engine has no exercised specpack paths. Eliminated: the ceremony and
golden-case tests execute those public functions. They import the package.

H2: coverage measures source paths while package resolution executes dist.
Confirmed by the source include scope retained at `treadle/vitest.config.ts:21`,
`treadle/packages/core/package.json:6`, and
test imports such as `treadle/packages/web/test/servers.test.ts:6`.
The coverage report counts source exports but does not attribute compiled
function calls to those source implementations.

T-5 supplies Vitest-only aliases for the four runtime package entry points.
Tests and the coverage meter then use the same source modules. Package exports,
production builds, include scope, and coverage thresholds remain unchanged.
The compiled corpus reproduction gate still checks production exports.

Verification: run the complete coverage suite and retain its measured floors.
Then run the full check and corpus/brand/link gates again, and obtain the
actual independent review. No source scope is excluded to raise the score.
