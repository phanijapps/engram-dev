"""Export oh-my-logo ANSI glyphs as font-independent SVG outlines.

Requires fontTools. Pass the ANSI outputs, an installed monospace font, and the
output directory. This renders the tool's glyphs and per-cell RGB values without
adding a runtime dependency to the application.
"""
import argparse
import html
import re
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

parser = argparse.ArgumentParser()
parser.add_argument('--light', type=Path, required=True)
parser.add_argument('--dark', type=Path, required=True)
parser.add_argument('--font', type=Path, required=True)
parser.add_argument('--out', type=Path, required=True)
parser.add_argument('--name', required=True, help='Current product name from the brand package')
args = parser.parse_args()
font = TTFont(args.font)
cmap = font.getBestCmap()
glyphs = font.getGlyphSet()
scale = 0.01
cell_width = font['hmtx'][cmap[ord(' ')]][0] * scale
cell_height = (font['hhea'].ascent - font['hhea'].descent) * scale
baseline = font['hhea'].ascent * scale


def read_cells(path):
    raw = path.read_text()
    color = '#0064d9'
    rows = [[]]
    for token in re.findall(r'\x1b\[[0-?]*[ -/]*[@-~]|[^\x1b]', raw):
        if token.startswith('\x1b'):
            match = re.fullmatch(r'\x1b\[38;2;(\d+);(\d+);(\d+)m', token)
            if match:
                color = '#%02x%02x%02x' % tuple(map(int, match.groups()))
        elif token == '\n':
            rows.append([])
        elif token != '\r':
            rows[-1].append((token, color))
    rows = [row for row in rows if any(c != ' ' for c, _ in row)]
    assert len(rows) == 6, 'Expected the complete filled-block wordmark'
    assert all(ord(c) in cmap for row in rows for c, _ in row), 'Missing font glyph'
    return rows


args.out.mkdir(parents=True, exist_ok=True)
for appearance, path, background in [('light', args.light, '#f5f5f7'),
                                      ('dark', args.dark, '#1c1c1e')]:
    rows = read_cells(path)
    characters = sorted({c for row in rows for c, _ in row if c != ' '})
    ids = {c: f'g{i}' for i, c in enumerate(characters)}
    defs = []
    for c in characters:
        pen = SVGPathPen(glyphs)
        glyphs[cmap[ord(c)]].draw(pen)
        defs.append(f'<path id="{ids[c]}" d="{pen.getCommands()}"/>')
    width, height = 960, 240
    left = (width - max(map(len, rows)) * cell_width) / 2
    top = (height - len(rows) * cell_height) / 2
    uses = []
    for y, row in enumerate(rows):
        for x, (c, color) in enumerate(row):
            if c == ' ':
                continue
            uses.append(f'<use href="#{ids[c]}" fill="{color}" '
                        f'transform="translate({left+x*cell_width:.3f} '
                        f'{top+y*cell_height+baseline:.3f}) scale({scale} {-scale})"/>')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="960" height="240" viewBox="0 0 960 240" role="img" aria-labelledby="title desc">
<title id="title">{html.escape(args.name)}</title>
<desc id="desc">Filled block wordmark generated with oh-my-logo 0.5.0. Quiet Blue palette, {appearance} appearance. Glyph outlines rendered from DejaVu Sans Mono.</desc>
<rect width="960" height="240" fill="{background}"/>
<defs>{''.join(defs)}</defs>
{''.join(uses)}
</svg>
'''
    (args.out / f'wordmark-{appearance}.svg').write_text(svg)
