# Quiet Blue wordmark

The README wordmark uses **oh-my-logo 0.5.0**, filled `block` mode, two spaces
between letters, and a horizontal gradient. It follows Quiet Workspace's
existing blue action color and neutral surfaces. This adds no application theme,
runtime dependency, or animated logo.

| Role            | Light appearance | Dark appearance |
| --------------- | ---------------- | --------------- |
| Canvas          | `#F5F5F7`        | `#1C1C1E`       |
| Gradient start  | `#004FA9`        | `#8EC1FF`       |
| Gradient middle | `#0064D9`        | `#70AAFB`       |
| Gradient end    | `#4090E6`        | `#4B91DE`       |

The primary and deep blue come from the current light theme. The pale blue comes
from the current dark theme. The remaining colors provide a gentle transition.
Sources: `../../web/src/library.html:23` and `../../web/src/library.html:54`.

`wordmark-light.svg` and `wordmark-dark.svg` contain static glyph outlines.
They do not depend on a viewer's font, a remote resource, or ANSI support.
The root README uses GitHub's supported picture element to select the appearance.
The normal image supplies the light fallback and an accessible product name.

## Regenerate

Use the current `brand.name` from `../src/brand.ts`, in uppercase, for the text.
These commands show the current brand:

```sh
FORCE_COLOR=3 npx --yes oh-my-logo@0.5.0 WUKONG --filled --block-font block --letter-spacing 2 --direction horizontal --palette-colors '["#004fa9","#0064d9","#4090e6"]' --color > /tmp/logo-light.ansi
FORCE_COLOR=3 npx --yes oh-my-logo@0.5.0 WUKONG --filled --block-font block --letter-spacing 2 --direction horizontal --palette-colors '["#8ec1ff","#70aafb","#4b91de"]' --color > /tmp/logo-dark.ansi
```

From the repository root, use the artifact exporter with an installed DejaVu Sans
Mono font. This optional authoring tool needs Python and fontTools. The Wukong
runtime does not need them.

```sh
python3 artifacts/wukong-logo/export.py --light /tmp/logo-light.ansi --dark /tmp/logo-dark.ansi --font /usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf --name Wukong --out treadle/packages/brand/assets
```

Retained tool output, its hashes, and the chosen palette live in
`artifacts/wukong-logo/manifest.json`. Preview PNGs live beside that manifest.
The SVG paths render glyphs from DejaVu Sans Mono; they contain no font file.
Regenerate and inspect the assets when the brand changes.

References: [oh-my-logo](https://github.com/shinshin86/oh-my-logo) and
[GitHub theme-aware images](https://github.blog/developer-skills/github/how-to-make-your-images-in-markdown-on-github-adjust-for-dark-mode-and-light-mode/).
