# Wukong title and README evaluation

Date: 2026-10-11. Implementing agent: Codex.

The library header and browser title use the product name from `@treadle/brand`.
The shared asset reader substitutes an escaped name in the existing HTML asset.
This is presentation rendering only. No API, event, stored record, approval rule,
security header, or runtime dependency changed.

The root README uses the installed writer skill's plain technical writing rules.
It includes ASCII art and explicit Bash and PowerShell installation commands.
Commands select the current preview branch because GitHub `main` still has the
older Bash installer and lacks the Windows installer. Both paths invoke the
existing scripts from their default source directories. The full STE dictionary
is not bundled; this is not a dictionary-conformance claim. Native Windows
installation was not executed during this copy change.

## Actual checks

Commands ran from `treadle/` unless specified. Every listed command exited 0.

| Command                                                                    | Observed result                                                                                      |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pnpm check`                                                               | Source typecheck, lint, formatting, 51 test files and 249 tests passed.                              |
| `pnpm coverage`                                                            | 249 tests passed. Statements and lines 88.51%, branches 78.44%, functions 95.39%; all floors passed. |
| `pnpm corpus:check`                                                        | 90 golden files reproduce exactly.                                                                   |
| `pnpm brand:check`                                                         | Product tokens remain within their naming fence.                                                     |
| `pnpm audit:prod`                                                          | No known production vulnerabilities found.                                                           |
| `pnpm links`                                                               | 108 live files, all Markdown links resolve. Reran after preview-install correction.                  |
| `pnpm build`                                                               | TypeScript build and browser asset copy succeeded.                                                   |
| `pnpm exec prettier --check ../README.md`                                  | Final corrected README formatting passed.                                                            |
| `bash -n install.sh` (repository root)                                     | Bash installer syntax passed.                                                                        |
| `node treadle/packages/cli/dist/src/main.js stop serve` (repository root)  | Existing local service stopped.                                                                      |
| `node treadle/packages/cli/dist/src/main.js start serve` (repository root) | Rebuilt service started at `http://127.0.0.1:8788/`.                                                 |

Repository logs: [checks](../artifacts/wukong-polish/checks/). Stored test logs
trim trailing whitespace only; command output and results remain intact.

The wiki maintenance block ran fingerprints, stamp, anchors, validate, and status.
Observed validation: 0 errors and 0 warnings. Status: fresh, 46 concepts,
167 anchors checked, 0 needing review, 1 pending finding. A separate status rerun
exited 0; [status log](../artifacts/wukong-polish/checks/wiki-status.log).
Python-only fingerprints and Git HEAD stamps do not establish dirty TypeScript
or Markdown freshness. Sources and the current diff were inspected directly.

An actual browser reload of the connected project's Quiet Workspace overview
showed document title **Wukong**, visible header **Wukong**, and the actual owner
completion state. No owner control was clicked. The original route and spec
state remained intact. [Screenshot](../artifacts/wukong-approval-ux/output/Wukong-Library-Title.png).

## Preservation and publication

The user requested all pending changes. These include the approved UX decks,
concept/build outputs, actual owner close receipt and workflow event, and wiki
machine metadata. Historical Quiet Workspace source pins and evidence remain
unchanged. This later title change does not revalidate or repin that closed pack.

Independent red-foreman review is recorded separately in
[wukong-polish-review.md](wukong-polish-review.md).
The existing branch PR will receive this commit and the prior unpushed frontend
commits. Local results are not claims of a new remote CI run.
