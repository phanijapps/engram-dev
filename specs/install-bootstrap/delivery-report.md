# Implemented source setup repair — 2026-10-12

Root frozen installation now resolves a private setup wrapper with a matching
root lockfile. Its prepare lifecycle calls the shared Node helper, which checks
the pinned package manager, installs from the nested frozen lockfile, then builds.
Explicit setup provides the same operation. The active workspace, dependencies,
global CLI link, and portable deployment remain under the existing nested paths.
The root local CLI entry uses compiled workspace assets and gives backend-neutral
setup guidance when missing. Root registry bundle metadata was retired by D-1.

Bash and PowerShell source installers default to main, check prerequisites before
source mutation, call the shared helper, and retain protected branch selection,
global link, and actual command verification. Explicit refs remain supported;
existing other-branch checkouts are not silently switched.

Copilot full project init and hooks-only repair were tested from cold clones
with existing portable config but absent local state. All local payloads and
the runtime pointer materialize. Target application manifest and lock bytes,
foreign config entries, and sibling files remain preserved. Full init backs up
original guide bytes; hooks-only preserves the guide and omits other components.
The copied callback executes against a controlled runtime. Init now explains
per-machine setup/reload and claims hook materialization only when the expected
files and native wiring actually exist. No target package manager is invoked.

## Actual evidence

- T-1 exact check: 8 passed, including actual scripts-enabled frozen root
  installation/build, both lock hashes unchanged, and compiled CLI smoke.
- T-2 exact check: 19 passed, 10 Windows-only skips on Linux.
- T-3 exact check: 49 passed; independent repaired three-suite check: 50 passed.
- T-4 complete repaired delivery: exit 0, including root lifecycle and portable
  runtime packaging, compiled help, and Copilot install preview.
- Full suite: 327 passed, 10 skipped. All six repository gates passed.
- Coverage: 84.83% statements, 76.94% branches, 88.73% functions, 87.75% lines.
- Wiki: zero errors and warnings, 194 anchors checked, none needing review, fresh.

Logs are in checks/delivery-2026-10-12T14-42-51-201Z/.
The initial root-lock formatting failure and both implementation findings remain
retained beside their repairs. An initial PLAN concern was resolved by actual
root lifecycle coverage inside the already-approved test file; no receipt changed.

## Limits and owner handoff

The real lifecycle test runs through the existing six native CI jobs; their
remote results still need actual PR execution evidence. Linux checks cannot
establish Windows or macOS success. Controlled copied-hook execution does not
establish real Copilot activation. Provider keys, cloud runtime bootstrap, and
automatic installation on clone remain outside this repair.

Wiki fingerprints cover Python; the stamp compares HEAD. Neither proves dirty
TypeScript or Markdown content. Changed claims and implementation were inspected
directly. Final current-digest PACK review follows the source commit and task
evidence. The owner performs Finish separately; no agent Finish occurred.
