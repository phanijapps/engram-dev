# Independent review — one-command installation

Verdict: **PASS** for the repaired README, Bash installer behavior exercised below, and PowerShell source contract. Native Windows execution is **unverified**. No unresolved BLOCKER or DEFECT in this bounded review.

Reviewer: `agent:/root/roadmap_eval_revision`, independent of implementation. Date: 2026-10-11. Working-tree basis: `cf7788e70950dbf3fe9f0e75d28fbe2456fb4ec2`. Reviewer changed only this new report; no implementation, historical report, closed evidence, owner action, commit or publication was changed by the reviewer.

## Findings preserved and repaired

| Severity                 | Location at observation                   | Concrete issue                                                                                                                                                                                                                                                 | Final disposition                                                                                                                                                                                                                                                                                |
| ------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DEFECT                   | `install.sh:21` before repair             | `node -p` failed with exit9/no output inside an `if` expression. Independent disposable probe observed an integer-expression error, then clone/build/global link and installation success with overall exit0. The conditional swallowed failure despite set-e. | Version is now assigned outside the conditional; assignment failure propagates. Numeric validation precedes the floor. Same independent probe now exits9 after only the version query, with no source/link/success. Resolved.                                                                    |
| DEFECT — source contract | `install.ps1:8` before repair             | Native Node-version query status was not immediately checked; output24 with nonzero exit could pass the comparison and continue. No native PowerShell execution was available to reproduce this.                                                               | Current lines8–10 capture output, check LASTEXITCODE immediately and validate digits before the Node22 floor. Resolved by source inspection; native proof remains absent.                                                                                                                        |
| DEFECT — source contract | `install.ps1:13` before repair; current15 | PowerShell `-ne` compares strings case-insensitively, permitting a differently cased Git branch to pass the promised exact branch guard.                                                                                                                       | Current guard uses `-cne`, retaining native symbolic-ref exit check. Resolved by source inspection. [Microsoft comparison semantics](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_comparison_operators?view=powershell-7) support this distinction. |

## Independent actual commands and observations

From `treadle/`:

```sh
pnpm exec vitest run packages/cli/test/installers.test.ts
```

Initial actual exit0:4tests/1file,1.40s,16:20:49 local. It did not cover the additional failed-version probe above. Repaired actual exit0:7tests/1file,1.52s,16:21:53 local. The source/test bytes for that Bash rerun remain unchanged by the later PowerShell-only case fix.

The seven checks execute actual Bash with disposable Git/Node/pnpm/CLI stubs: fresh preview clone, selected existing-branch ff-only update, other-branch refusal, build failure without link/success, native version-query failure, invalid version and Node20 refusal. Paths containing spaces are exercised. There is no network clone, real dependency installation, global link or developer checkout mutation in these tests.

Independent negative witness using separate temporary stubs:

```json
{
  "before": {
    "version_query_exit": 9,
    "installer_exit": 0,
    "reported_success": true,
    "continued": [
      "clone",
      "install",
      "build",
      "link",
      "compiled_cli_version",
      "global_cli_version"
    ]
  },
  "after": {
    "version_query_exit": 9,
    "installer_exit": 9,
    "reported_success": false,
    "continued": []
  }
}
```

Probe harness itself exits0 after reporting the observed installer exits. Each temporary root was removed. `bash -n install.sh` independently exits0. Neither `pwsh` nor `powershell` is installed; command-discovery exits1. No PowerShell parse/native test result is invented.

## PowerShell invocation and source review

README's isolated `powershell -NoProfile -Command "irm ... | iex"` downloads a string for Invoke-Expression. The script's param block comes after comments and before executable statements, and its default Source/Repository/Ref fit the no-argument flow. Optional parameters remain for downloaded-script invocation; the pipeline is not presented as binding custom parameters. This is a source feasibility assessment, not executed Windows proof. Microsoft documents [string pipeline input/current-scope evaluation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-expression?view=powershell-7.5) and [powershell.exe command/terminating-error exit behavior](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe?view=powershell-5.1).

The script sets ErrorActionPreference Stop; Git update/clone, dependency install, build, global link, compiled entry and public command each check LASTEXITCODE before any success message. Location restoration uses finally blocks. Missing commands stop early. A native error becomes a nonzero outer process result rather than a claimed successful install; exact native error-code preservation is not asserted. The version and branch guards now fail closed at source level. No backend/application route or owner workflow change occurs.

## README and publication boundary

The filled `##` WUKONG wordmark is in a text fence. The README follows the requested reader sequence: workflow choices, numbered getting-started steps with single-command installers, separate agent-chat examples, explicit delivery approvals, browser feedback, records/docs, then developer-only cloning/options. It preserves separate Start/Finish, idle-host limits, activation/trust and legacy freshness limits.

Both download URLs name `codex/background-harness`; both scripts default to that same preview ref and canonical repository. Fresh clones select it, matching existing branches update ff-only, and a different branch is refused rather than switched. Existing macOS/Linux and Windows default source paths remain unchanged. The source bootstrap builds bundled assets and verifies the compiled entry plus public command. Developer clone instructions select the same branch.

These **new script bytes are pending the authorized follow-up push**. Earlier remote availability does not prove the new installer is published; this report does not claim current remote copies already match these hashes. Publication should carry README and both scripts together on that branch. Neither mutable branch selection nor a stubbed test is a signed release/native compatibility proof.

## Reviewed identities

| File                                         | SHA-256                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| README.md                                    | `8ea1225b1082371582093e13e4497134b33ed9aafe5f1d03f5f74b8714845328` |
| install.sh                                   | `15f2cfd7acbfcad7ff0fdf68e9bcaba41fa586ee062e73eb089feb94be14c12d` |
| install.ps1                                  | `897d258f7fd237542b30d6b9de06cc1d4cdb4721b409aeb65c4efd5bb44e5ad1` |
| treadle/packages/cli/test/installers.test.ts | `6db99b87a96ae25d7484f6b9ec1055a992fbdcaa1cb8664dea1f39d922bfbdca` |

No closed pack or historical evidence is repinned. This is independent bounded review, not owner permission or PACK re-certification. The reviewer did not rerun the full six repository gates: producer owns its actual full-check/coverage and remaining gate evidence. Do not attribute those runs to this reviewer. Native macOS/Windows install, real global PATH/link behavior, host activation, download failure behavior and remote CI remain outside the executed proof above.
