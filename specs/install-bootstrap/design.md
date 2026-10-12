# Technical design: one source setup mechanism

Depth: compact design. This repair changes bootstrap interfaces, not engine
contracts. Claims about current behavior are grounded in the analysis; the
changes below are proposed until owner approval.

## Root source interface: DES-1

D-1 makes the private root package a source setup wrapper. Retain its identity,
pinned package manager, and public CLI name. Remove file dependencies and
bundleDependencies. Add a matching minimal root lockfile. A Node setup helper
under `scripts/` resolves `treadle` relative to its own file, not the caller cwd.
The root `prepare` lifecycle and explicit `setup` script both invoke that helper.
Root frozen installation therefore reaches valid root resolution, then nested
installation and build. The nested package has no recursive prepare lifecycle.

Use the existing compiled entry from the root bin wrapper. Missing compiled
assets report the explicit root setup command and exit nonzero. Keep global
installation through the nested CLI link and portable deployment through the
existing runtime packaging command. Root npm registry packaging stays unsupported.
Update the brand setter if changed root metadata requires it; retain its name fence.

Alternative: move workspace authority to root. That option changes too many
consumer paths for this repair. Adding only instructions leaves the reproduced
failure. D-1 is reversible through the prior root files; accepted closed packs
retain their original bytes and historical conclusions.

## Shared setup and source installers: DES-2

The Node helper selects Corepack with pnpm 9.15.9 when available. If Corepack is
absent, accept only pnpm 9.15.9. Use direct argument arrays on Unix. For Windows
command shims, use encoded PowerShell with literal arguments, following the
existing runtime packager pattern. Pass the workspace path through process cwd.
Do not interpolate source paths into an unquoted shell command.

Validate tools before dependency changes. Install with the nested frozen
lockfile, then build. Propagate the actual failing exit and stop. Setup never
links globally or initializes a target project. Installers call the helper
after a valid source clone or update, then perform their existing nested global
link and command verification. D-2 switches their defaults to `main`.
Ref overrides and branch mismatch refusal remain; there is no implicit switch
of an existing preview checkout. A prerequisite check must happen before Git
mutates that checkout. No silent package-manager upgrade is allowed.

Alternative: duplicate setup logic in each shell. D-2 chooses a shared helper
to prevent directory and version differences. Reverting the helper call and
default is possible without a storage migration.

## Target init and clone recovery: DES-3

D-3 retains copied project hook payloads and a generated local pointer.
The default manifest owns sources and destinations. Local init uses the installed
runtime, not dependencies in the target project. The target can be empty or
contain arbitrary package manifests without any dependency install.

For Copilot, full project init materializes these files:

| Output | Role |
| --- | --- |
| `.github/hooks/wukong.json` | Host event configuration |
| `.harness/hooks/copilot-context.js` | Copilot event wrapper |
| `.harness/hooks/codex-context.js` | Shared helper |
| `.harness/hooks/runtime.json` | Local Node and CLI entry pointer |
| `.github/skills/` and `.github/agents/` | Selected canonical components |
| `AGENTS.md` and, when required, `AGENTS.backup.md` | Existing generated-guide contract |

Git retains portable host definitions. Local pointer and state remain ignored.
A different machine or runtime requires init again. Hooks-only recovery copies
the three local files and reconciles config without guide, skills, or agents.
Verify this from a cold clone with no ownership state and existing identical
configuration. Preserve identical foreign ownership semantics; do not broaden
force or removal permissions to make the test pass.

Add output or canonical documentation explaining successful materialization,
per-machine setup, and host reload. No host activation is inferred from copied
files. If an installer action or enrollment fails, preserve truthful failure
output and stop; do not claim a working Copilot session.

## Decisions and uncertainty

| ID | Proposed choice | Consequence |
| --- | --- | --- |
| D-1 | Retire root file-package orchestration in favor of a private setup wrapper and matching root lockfile. | Root installs work; unsupported future root bundle metadata is removed; workspace stays nested. |
| D-2 | Use one pinned setup helper and `main` defaults in both source installers. | Shared behavior; existing other-branch checkouts still require explicit selection or a new directory. |
| D-3 | Retain per-machine project init; verify and explain full and hooks-only cold-clone recovery. | Machine paths stay local; cloning alone does not activate the harness. |

These decisions require owner acceptance. No human spec questions are needed.
A-1 through A-3 from analysis remain validation obligations. Windows setup and
real scripts-enabled root lifecycle behavior need execution evidence.

## Verification boundary

DES-4 verifies all FRs through exact task checks, a clean source lifecycle
witness, repository gates, wiki validation, and independent review. Documentation
states actual platform and host limits. Source inspection cannot establish a
native Copilot session. No architecture diagram is needed: this is a simple
sequence of source setup, global CLI link, then explicit target init.

Out of scope remains the spec's register. The root CLI wrapper change does not
change runtime protocols, engine schemas, server binding, or provider setup.
