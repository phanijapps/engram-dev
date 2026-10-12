# Execution log

Owner accepted D-1 through D-3 and recorded Start for digest
`4c108a984a111836932fafcb7502aed1d76b1f9fa16baf7537f9d2c7ec78c744`.
The actual receipts remain in the canonical pack; the root performed none.
Independent proposal review initially flagged a native lifecycle gap. The
reviewer accepted a real root lifecycle test in the already-owned test file,
which runs through the existing six native CI jobs. No plan or receipt changed.
PLAN PASS is retained separately from the future implementation PACK review.

T-1 admitted at revision 7. Implemented the private root wrapper, shared pinned
setup helper, matching root lockfile, and compiled local CLI entry. Initial
exact check passed 7 of 8 tests: pnpm reformatted the minimal handwritten root
lock despite successful root installation and build. Failure recorded at
revision 8. Generated the canonical root lock bytes with scripts disabled;
nested lock stayed unchanged. Exact rerun passed all 8 tests, including real
scripts-enabled frozen root install/build and both compiled CLI smoke checks.
Actual log: checks/T-1-attempt-2.log. Pass recorded at revision 9.
Windows process arguments use encoded literal PowerShell; caller paths enter
through cwd. The real lifecycle test supplies native CI evidence after PR runs;
local success does not establish those remote outcomes.

T-2 admitted at revision 10. Both source installers now default to main and
select pnpm 9.15.9 before source mutation. Shared setup performs install/build;
the installer retains nested global link and real command verification.
Protected branch mismatches still refuse without switching. Exact check after
formatting passed 19 tests with 10 Windows-only skips on Linux. Failure fixtures
cover wrong versions and failed update/setup/link/verification. Real root
lifecycle passes again. Actual log: checks/T-2-attempt-2.log; pass revision 11.

T-3 admitted at revision 12. Added full and hooks-only cold-clone fixtures with
committed config and absent local state. Wrapper/helper/pointer materialize;
the copied adapter executes against the controlled runtime. Target application
manifest/lock, foreign event metadata and sibling files remain preserved.
Full init creates exact guide backup; hooks-only preserves original guide and
does not install skills or agents. Added per-machine setup/reload output and
source-backed README, canonical hook guidance, wiki and dated HTML supplement.
Native temporary-root identity now uses realpath for platform aliases.
Exact check passed 49 tests; links and wiki validation also exit 0. Log
checks/T-3-attempt-2.log; pass revision 13. Native host activation is not claimed.

T-4 admitted at revision 14. First delivery passed root lifecycle, portable
runtime package/smoke, all six gates, and wiki checks. Independent implementation
audit found false materialization guidance for an empty custom manifest and
Corepack-only recovery guidance despite the supported fallback. Both contained
defects were repaired in the admitted scope. Added the empty-manifest regression;
recovery now uses node scripts/setup.mjs. Initial and repaired reports remain
separate; independent repaired audit passed 50 targeted tests.
Complete repaired delivery passed again: 327 tests, 10 native Windows-only
skips, all six gates, coverage above floors, wiki zero errors/warnings and 194
anchors with none needing review. Current logs:
checks/delivery-2026-10-12T14-42-51-201Z/ and checks/T-4-attempt-2.log.
Pass recorded at revision 15. Source/compiled artifacts are rebuilt. Final
current-digest PACK review and PR publication follow; owner Finish remains pending.
