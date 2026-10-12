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
