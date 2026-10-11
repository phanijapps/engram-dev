# Independent red-foreman review — Quiet Blue wordmark

Verdict: **PASS** for the README picture, static wordmark assets and retained generation provenance. No BLOCKER, DEFECT or SMELL identified in the reviewed current bytes.

Reviewer: `agent:/root/roadmap_eval_revision`, independent of the producer. Date:2026-10-11. Basis: working-tree additions/diff from `0da8c8fe5201e627f221016e11e6cce084f77722`. Reviewer changed only this report; generation checks used an independent temporary output directory. No app source, owner state, closed pack, dependency/lockfile, implementation fix or publication was changed by the reviewer.

## Visual judgment and palette

Individually inspected both `artifacts/wukong-logo/preview-light.png` and `preview-dark.png` at their original960×240 size. Both visibly spell all six letters **WUKONG**, with filled letter bodies, consistent double-line shadow details, distinct letter spacing and adequate surrounding space. No letter is cropped or missing. The darker blue on the light neutral canvas and pale-to-medium blue on dark neutral canvas are readable; the dark treatment avoids a bright background panel.

Current library tokens substantiate the match: light canvas `#f5f5f7`, light primary `#0064d9` and deep blue `#004fa9`; dark canvas `#1c1c1e` and primary `#8ec1ff`. Additional transition colors are documented as gradient choices, not falsely represented as existing UI tokens. Logo contrast is a visual assessment, not full UI/WCAG conformance. No application theme or live UI changes follow from these documentation assets.

## Actual tool and reproducibility evidence

Read the installed npm package's package.json and README: `oh-my-logo` version0.5.0 supports filled/block font, letter spacing, horizontal direction and custom palette options. Independently invoked that exact cached package CLI with Node, `FORCE_COLOR=3`, WUKONG, `--filled --block-font block --letter-spacing 2 --direction horizontal --palette-colors … --color`, once per recorded palette. Both executions exited0 and reproduced the retained raw ANSI SHA-256 exactly. Both contain402RGB foreground SGR sequences; light7797bytes and dark8493bytes. This corroborates actual oh-my-logo use, not a manually reconstructed logo or a version inferred from a label.

Decoded manifest ANSI streams into `/tmp/wukong-logo-red-3g5fatem`, verified their hashes, and checked the actual DejaVuSansMono.ttf against the recorded font SHA256 `c805f9436dbc268644c1d9584f01a601a653e028e08fd74b9b949f6cf8304d88`. Executed the current documented exporter:

```sh
python3 artifacts/wukong-logo/export.py --light /tmp/wukong-logo-red-3g5fatem/light.ansi --dark /tmp/wukong-logo-red-3g5fatem/dark.ansi --font /usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf --name Wukong --out /tmp/wukong-logo-red-3g5fatem/out
```

Actual exit0; both emitted SVG files are byte-identical to the repository candidates and match manifest SVG hashes. An earlier probe omitted the newly added required `--name` and correctly exited2 before generation; the current documentation includes it and the exact rerun above passes. That invocation error is not substituted with an invented success.

| Variant | Retained ANSI SHA-256                                              | Reproduced SVG SHA-256                                             |
| ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| light   | `79bd0e8dadc1a125c8cfba6fbfa62131d2888392b660dc2f560080925505a69b` | `d9ee591fba6c860d04ace629cdbdb39be4de63f8ab35bbfcbccf92374d95b080` |
| dark    | `ca2e5de160c90b49a018a353664a540a69288aa1872e45219bca685a49a8dd88` | `de6ec8044cb58138104148228b65b670c50b5b255dda64bd6126319e5e617b0d` |

Exporter retains six nonblank rows, original cell ordering and per-cell RGB values, converting recorded glyphs into font outlines. Reproduction requires the pinned font and retained input bytes; a different font is not asserted to reproduce the same output. Exporter takes a product name and escapes it for XML metadata. No runtime font installation or ANSI rendering is needed to display the SVGs.

## SVG safety, README and scope

Independently parsed each complete SVG. Element inventory is only svg/title/desc/rect/defs/path/use; each variant has266use elements. All hrefs are fragment references to existing local glyph IDs. No script, event-handler attribute, external href, foreignObject, animation, stylesheet, external font, embedded font file or remote resource is present. Dimensions/viewBox are960×240; generated path and transform data remain static. The SVG metadata supplies title/description. This review concerns these exact assets, not unrestricted safety of arbitrary future generator input.

README paths at lines4–6 resolve to the two local brand assets. The dark source selects `prefers-color-scheme: dark`; img uses light fallback and `alt="Wukong"`. The same name remains in the Markdown heading. [GitHub's first-party picture guidance](https://github.blog/developer-skills/github/how-to-make-your-images-in-markdown-on-github-adjust-for-dark-mode-and-light-mode/) supports this source/fallback pattern. Post-publication GitHub rendering and every Markdown renderer were not exercised here; unsupported theme switching can still use the normal image fallback.

Assets reside in the brand fence. Current diff/additions are documentation, static brand art, authoring exporter/manifest/previews and generated freshness stamp. No application UI/backend behavior, endpoint/model/schema, package dependency or lockfile change. Closed evidence and historical reports remain intact. This is a bounded asset review, not owner Start/Finish or a new PACK verdict.

## Independently executed scoped checks

| Command from treadle                                                      | Actual exit / result                                                                                                                                           |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec prettier --check ../README.md packages/brand/assets/README.md` | 0; both formatted.                                                                                                                                             |
| `pnpm brand:check`                                                        | 0; public/internal names remain inside the naming fence.                                                                                                       |
| `pnpm links`                                                              | 0;108livefiles, Markdown links resolve. Local picture paths were checked independently because HTML image attributes are separate from Markdown link coverage. |
| `git diff --check` from root                                              | 0.                                                                                                                                                             |

Full repository gates are producer-owned; this reviewer did not rerun or claim them. No successful CI, native browser matrix, screen-reader interaction, runtime font installation, release publication or owner act is inferred from static assets or previews. Wiki freshness remains Python/HEAD-limited.

## Additional bound identities

| File                                    | SHA-256                                                            |
| --------------------------------------- | ------------------------------------------------------------------ |
| README.md                               | `fcb5ca5472ddeda8fb51e0def056e3dd75854f0fcd745fe0f0e57926caccd198` |
| treadle/packages/brand/assets/README.md | `8ea22efe19ac1e01a3a1687a50e4cbc7cd8492b56183e74a3076eba689d03aff` |
| artifacts/wukong-logo/export.py         | `1aeba2850e5e3b1b42a11b7fc6e921c0613fe5701b6b2ad511e2a41f6b06e755` |
| artifacts/wukong-logo/manifest.json     | `4cb81fb14b54e8fa60fe72c77c8400bc97f79d67443ce93725b1db7545dfc599` |
| artifacts/wukong-logo/preview-light.png | `acd2ab05f6f5bada163db1399fd88613b99c0c3df384eb1dc143a1f01140b33a` |
| artifacts/wukong-logo/preview-dark.png  | `1dcef79801c70662b236fcd7629fe3e34a916d15f7899f78476ae8bb5266facf` |
