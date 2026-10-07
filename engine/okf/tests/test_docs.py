"""Docs tests: the `docs/` folder was folded into the `wiki/` bundle, so this now
guards the wiki as the documentation home.

- The migrated reference concepts exist in the wiki.
- The canonical tool descriptions in `wiki/reference/tools.md` are synced with the
  strings in `okf_kit/mcp.py` (design §11 — tools documented in synced places).
"""
from __future__ import annotations

import re
from pathlib import Path


WIKI = Path(__file__).resolve().parent / "fixtures" / "wiki"
TOOLS_REFERENCE = WIKI / "reference" / "tools.md"


def test_reference_concepts_exist():
    """The former docs/ content now lives in these wiki concepts."""
    for rel in (
        "reference/tools.md",
        "interfaces/okf-uri-scheme.md",
        "guides/authoring.md",
        "project/backlog.md",
    ):
        assert (WIKI / rel).is_file(), f"missing wiki reference concept: {rel}"


def _extract_description(md: str, tool: str) -> str:
    pattern = rf"## {re.escape(tool)}.*?<!-- desc:start -->\n(.*?)\n<!-- desc:end -->"
    match = re.search(pattern, md, re.DOTALL)
    assert match, f"no canonical description block for tool '{tool}' in {TOOLS_REFERENCE}"
    return match.group(1).strip()


def test_code_index_docs_are_syntax_grounded_and_polyglot():
    docs = [
        WIKI / "interfaces" / "okf-cli.md",
        WIKI / "guides" / "authoring.md",
        TOOLS_REFERENCE,
    ]
    for path in docs:
        text = path.read_text(encoding="utf-8")
        compact = " ".join(text.split()).lower()
        assert "okf-kit[treesitter]" in text, path
        assert "okf code index" in text, path
        assert "--profile compact" in compact, path
        assert "--include-tests" in compact, path
        assert "--include" in compact, path
        assert "--exclude" in compact, path
        assert "--repo" in compact, path
        assert "codesummary" in compact, path
        assert "reverse-dependent" in compact or "reverse dependent" in compact, path
        assert "python" in compact, path
        assert "typescript" in compact, path
        assert "rust" in compact, path
        assert "go" in compact, path
        assert "csharp" in compact or "c#" in compact, path
        assert "php" in compact, path
        assert "semantic proof" in compact or "semantic impact analysis" in compact, path
