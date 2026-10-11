# Quiet Blue README wordmark

Observed on 2026-10-11. Producer: Codex.

The README now displays a filled WUKONG wordmark generated with
[oh-my-logo](https://github.com/shinshin86/oh-my-logo) 0.5.0. Light and dark
variants use the existing Quiet Workspace blue and neutral colors. Additional
gradient colors provide a gentle transition. The theme-aware picture uses static
SVG glyph outlines and a light fallback with accessible product-name text.

Actual tool commands used `FORCE_COLOR=3 npx --yes oh-my-logo@0.5.0 WUKONG`,
`--filled --block-font block --letter-spacing 2 --direction horizontal`,
`--palette-colors` with each recorded palette, and `--color`. Both exited 0.
The commands and optional export procedure are in the
[asset guide](../treadle/packages/brand/assets/README.md). Retained ANSI bytes,
version, palette and hashes are in the
[manifest](../artifacts/wukong-logo/manifest.json). Both exported previews were
inspected visually. The independent reviewer reproduced both ANSI streams and
SVG files exactly and checked local-only SVG references.

No application source, backend, data model, endpoint, dependency manifest or
lockfile changed in this logo iteration. Python/fontTools are optional artifact
authoring tools; they are not application dependencies. Historical installer
evaluation and closed spec records remain unchanged.

## Current verification

Each command ran from `treadle/` and exited 0 after the logo assets were added.

| Command             | Observed result                                                            |
| ------------------- | -------------------------------------------------------------------------- |
| `pnpm check`        | Typecheck, lint, format and 256 tests in 52 files passed.                  |
| `pnpm coverage`     | Statements/lines 88.51%, branches 78.43%, functions 95.39%; floors passed. |
| `pnpm corpus:check` | 90 contract goldens reproduce exactly.                                     |
| `pnpm brand:check`  | Naming fence passed.                                                       |
| `pnpm audit:prod`   | No known production vulnerabilities found.                                 |
| `pnpm links`        | Current Markdown file links resolve.                                       |

The five wiki commands ran separately: fingerprints, stamp, anchors, validate
and status. Each exited 0. Status: fresh; 46 concepts; 167 anchors checked; 0
needing review; 0 errors and 0 warnings; 1 pending finding. The scanner tracks
Python, and freshness compares HEAD; these results do not establish dirty
TypeScript or Markdown freshness. Logs are retained in
[checks](../artifacts/wukong-logo/checks/), with trailing whitespace removed.

[Independent red-foreman review](wukong-logo-review.md): PASS. The review binds
the exact logo, README and provenance bytes. It does not claim remote CI,
every Markdown renderer, or native Windows installation. The installer changes
belong to the preceding [evaluation](wukong-oneline-install-evaluation.md).
