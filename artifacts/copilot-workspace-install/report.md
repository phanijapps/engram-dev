# Copilot workspace installation — 2026-10-11

Installed through the authoritative `treadle/packages/cli/harness/harness.json`:

```text
node treadle/packages/cli/dist/src/main.js init harness --agent copilot --scope project --root /home/videogamer/code/memex_beta --manifest treadle/packages/cli/harness/harness.json --dry-run --json
node treadle/packages/cli/dist/src/main.js init harness --agent copilot --scope project --root /home/videogamer/code/memex_beta --manifest treadle/packages/cli/harness/harness.json
```

Both exited 0. The dry run is `dry-run.json`; the actual install transcript is `install.log`.
The installer reported 48 written files, 2 identical files, and 6 unsupported entries skipped.
No forced overwrite was needed. Existing unsupported host hooks and the feedback skill remain outside Copilot wiring.

The requested project layout now includes:

- `.github/hooks/wukong.json`, with sessionStart and userPromptSubmitted definitions.
- `.github/agents/red-forman.md`.
- `.github/skills/`, with the 11 manifest-supported skills.

Hook commands use the shared wrapper and helper in `.harness/hooks`, plus the machine-local runtime pointer.
Those paths are installer outputs; they are not copied independently into a second authority.

Actual local callback checks each exited 0. sessionStart returned workspace context;
userPromptSubmitted returned `{}` after reconnect. See `verification.json` and the callback output files.
The same check compared 45 installed agent/skill files with their canonical source bytes; all matched.

From `treadle/`, the following command exited 0 with 39 tests passing:

```text
pnpm exec vitest run packages/cli/test/copilot-hooks.test.ts packages/cli/test/init-surfaces.test.ts
```

Transcript: `tests.log`. These checks prove local configuration and callback execution,
not host activation, a real Copilot session, Windows execution, or cloud sandbox bootstrap.
Reload/enable the integration in the host as needed.

The new search-kb skill is a separate owner-gated proposal at `specs/search-kb/`.
It has not been implemented or behaviorally evaluated yet.
