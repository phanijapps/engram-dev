# Harness CLI forms and verification limits

Discover the available executable or documented Node entry and read its help.
Use these checks for harness-compatible bundles. Plain Markdown documentation
does not become an OKF bundle because the CLI is available. Preserve its format
and use direct source and link checks or its own validator instead.
Commands below are **argument forms**, prefixed by that executable and run from
the repository root. `wiki` is the actual bundle path; replace it if different.
Do not invent unavailable extraction or template commands.

## New bundle shape

Preserve the declared version of an existing bundle. For a new current OKF
bundle, root `index.md` can declare `okf_version: "0.2"` in frontmatter; its body
uses headings and bullet links to the authored concepts. Nested indexes and
`log.md` do not need concept frontmatter.

A minimal concept uses a mapping for each source, not a list of path strings:

```yaml
---
title: Component contracts
type: System
description: Public contract shapes observed in source.
status: draft
sources:
  - id: contracts
    resource: src/contracts.ts
---
```

This is an illustrative path; replace it with a source actually inspected.
Resources resolve relative to the workspace root supplied to anchor checks.
An `id` helps distinguish sources; it is optional in the current contract.
Do not add fabricated human verification metadata to make a page look accepted.

## Supported operations

```text
know validate wiki
know anchors wiki --workspace .
know status wiki --workspace .
know search wiki "contract term"
know read wiki systems/component
know links wiki
know findings list wiki
```

Record the actual command and exit code. Inspect counts and output as well as
the exit code: validation warnings, flagged anchors, and pending findings do not
all cause a nonzero exit. Check link targets directly or use the repository's
link check; `know links` output alone is not a failing link gate.
Validation of a nonexistent directory can exit 0 with empty-bundle information.
Check that the bundle and authored concepts exist before claiming a successful
documentation pass; a zero exit cannot establish coverage.

After affected claims are verified, an authorized maintenance pass can use:

```text
know fingerprints . wiki
know stamp wiki --workspace .
know anchors wiki --workspace .
know validate wiki
know status wiki --workspace .
```

The fingerprint scanner currently baselines Python files only. Other cited
sources can appear as `untracked` while the flagged-anchor count remains zero.
The freshness stamp compares Git HEAD, not dirty content. Neither result proves
that TypeScript, Markdown, or other knowledge is accurate. Inspect actual sources
and disclose unbaselined coverage. Never refresh a baseline to bypass review.

For a normative proposal, the current positional form is:

```text
know findings propose wiki src/contracts.ts wiki/domain/contracts.md golden-path --rationale "Observed evidence for a proposed convention"
```

Replace the source and destination with observed paths and the kind with the
actual proposal kind. Do not run placeholder proposals on a live ledger.
Human resolution is separate; the skill must not resolve proposals or repeat
declined keys on the owner's behalf.

Without the harness CLI, continue source-backed documentation in the repository's
existing format. Check links and source locations directly, use available
repository validators, and report harness checks as unavailable. Do not install
the harness or simulate passing checks as a side effect of documentation.
