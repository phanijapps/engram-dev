# Source setup requirements

Status: proposed. The canonical pack owns requirement and task state.

| ID | Required outcome | Observable acceptance check |
| --- | --- | --- |
| FR-1 | Root `pnpm install --frozen-lockfile` succeeds with scripts enabled and delegates install and build to the existing `treadle` workspace. Root `pnpm run setup` invokes the same operation. | Clean source fixture; complete real install and build; both lockfiles remain unchanged. |
| FR-2 | Keep runtime dependencies, workspace authority, and deploy packaging under `treadle`. Remove root file dependency resolution and obsolete bundle metadata. Root CLI entry resolves the compiled nested entry and reports build guidance when absent. | Frozen root manifest consistency, entry smoke, nested deploy smoke, and source pins. |
| FR-3 | Setup uses pnpm 9.15.9 through Corepack when available, or an explicitly checked pnpm fallback. Reject unavailable or wrong tools; propagate install and build failures without later operations. Support source paths with spaces on Unix and Windows. | Real command-process fixtures plus native CI. |
| FR-4 | Bash and PowerShell source installers default to `main` and reuse the shared setup helper. Preserve explicit ref overrides, branch mismatch refusal, fast-forward update, link scope, and actual exit propagation. | Both installer contract suites; real source setup witness. |
| FR-5 | Copilot project init and hooks-only recovery materialize wrapper, helper, runtime pointer, and config in a clone that has committed config but no `.harness` state. Preserve foreign entries, preview no-write behavior, guide backups, and application manifests or lockfiles. | Cold-clone full and hooks-only fixtures; generated command execution; before and after hashes; existing installer regression suite. |
| FR-6 | Document source install versus target init and print actionable next steps. Verify all repository gates, wiki health, independent review, and proposed changes before PR publication. | Checked docs, exact task evidence, review report, and published PR when authorized. |

Frozen installation must not regenerate the nested lockfile or add brand as a
registry dependency. An install with lifecycle scripts disabled cannot promise
compiled outputs; documentation points to the explicit setup command.

Target init uses the installed CLI's canonical harness sources. It copies local
payloads before activation wiring and creates a pointer for that installation.
It does not invoke a target package manager or change application dependencies.
An unchanged full guide remains unchanged. Differing backup collisions and
foreign payload conflicts retain existing refusal behavior.

Out of scope: workspace relocation, registry publication of the root package,
dependency upgrades, provider authentication, GitHub cloud sandbox bootstrap,
automatic installation when Copilot opens, and migration of existing local
installer checkouts without an explicit directory or ref selection.
