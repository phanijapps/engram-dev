# Shared-workspace recall test failure

Hypothesis H1: migration broke the recall hook. Eliminated: the hook correctly
reports two active packs and refuses an ambiguous continue request.

Hypothesis H2: the test assumes the real repository has one open pack. Confirmed:
`treadle/packages/cli/test/init-surfaces.test.ts:355` invokes the real CLI and
expects continue to pass. `check-before-fixture-fix.log` records two open packs and the exit-2
refusal. This is workspace-dependent verification, not a hook runtime defect.

The bounded correction T-4 supplies an isolated CLI fixture to this test. It
checks zero and one open pack allow continue, two open packs refuse continue,
and a specific non-continue request is allowed. Runtime behavior stays unchanged.

This expands the plan only to the failing verification surface. A concurrent
deletion of `.mcp.json.example` has no established cause in these tests or our
commands; it is outside the migration and remains untouched and unstaged.

Ready now: T-4 fixture repair, then the full gates and independent review.
