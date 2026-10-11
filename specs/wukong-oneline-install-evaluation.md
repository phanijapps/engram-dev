# Wukong README pattern and one-command installers

Observed on 2026-10-11. Implementing agent: Codex.

## Reference pattern and adaptation

The [current Spec Kit README](https://github.com/github/spec-kit/blob/main/README.md)
starts with a compact purpose, a table of reader goals, installation, and concrete
workflow examples. It separates terminal setup from agent skills, then links to
longer guides and contributor information. These are reader-navigation choices,
not an API or capability specification for Wukong.

The revised Wukong README adopts that structure with original product-specific
text. It has a filled ASCII WUKONG wordmark, a workflow chooser, single-command
installation, project connection, separate agent prompts, browser feedback, and
links to current documentation. Manual clone/build instructions appear only in
For developers. Existing human approval and host activation limits remain explicit.
The installed writer skill supplied the plain technical writing rules; full STE
dictionary conformance is not claimed.

## Installer behavior

Both download URLs select `codex/background-harness`, the current preview branch.
Both scripts clone that same ref by default instead of silently installing old
main. They use the existing machine-local source directory names. A repeat install
updates that branch with fast-forward-only Git. A different or detached existing
branch refuses before pull/build/link; no branch switch, reset or clean is added.
PowerShell compares ref names case-sensitively.

Node major version is captured and its command status checked before comparison.
Bash's numeric validation and PowerShell's immediate native exit check prevent a
failed probe from becoming a successful installation. The scripts verify the
actual compiled entry and the global CLI after the build/link sequence.

No app endpoint, UI route, stored record, approval rule, package dependency, or
lockfile changes. Closed packs and earlier README review hashes remain historical.

## Actual commands and limits

Commands ran from `treadle/` unless specified. All listed final checks exited 0.

| Command                                                     | Observed outcome                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm check`                                                | Source typecheck, lint, formatting; 256 tests in 52 files passed.                                |
| `pnpm coverage`                                             | 256 tests passed. Statements/lines 88.51%, branches 78.43%, functions 95.39%; all floors passed. |
| `pnpm corpus:check`                                         | 90 goldens reproduce exactly.                                                                    |
| `pnpm brand:check`                                          | Brand fence clean.                                                                               |
| `pnpm audit:prod`                                           | No known production vulnerabilities found.                                                       |
| `pnpm links`                                                | All current Markdown file links resolve.                                                         |
| `bash -n install.sh` (repository root)                      | Bash syntax passed.                                                                              |
| `pnpm exec vitest run packages/cli/test/installers.test.ts` | Seven disposable Bash contract tests passed.                                                     |

The composite and coverage checks were rerun after the Node preflight repairs.
Corpus and dependency audit preceded those repairs; their inputs and runtime
packages did not change. Brand and links were rerun. Stored logs trim only
trailing whitespace: [check logs](../artifacts/wukong-oneline-install/checks/).

The Bash tests execute the real script with disposable dependency stubs. They
cover default source selection, explicit ref updates, branch mismatch, failed
build, failed Node probe, invalid version, and an unsupported Node version.
They are not a real network install or a new global installation witness.
PowerShell is unavailable on this Linux host. Its source and command form were
reviewed, but native Windows execution and parsing are unverified here.

Each wiki command ran separately with its actual exit checked: fingerprints,
stamp, anchors, validate, and status. Validation returned 0 errors and 0 warnings;
status was fresh, 46 concepts, 167 anchors checked, 0 needing review, 1 pending
finding. HEAD freshness and Python-only fingerprints retain their dirty-source
limits. Current installer and README source were inspected directly.

Independent findings and repaired dispositions are recorded in
[wukong-oneline-install-review.md](wukong-oneline-install-review.md).
Publication uses the existing PR branch; URL byte identity must be checked after
the push. Local checks do not establish a new remote CI pass or native host activation.
