"""spec-library T-3: the detail — tabs, router, traceability (FR-3, FR-9, DES-3/DES-4, D-3)."""

from __future__ import annotations

from pathlib import Path

JS = (Path(__file__).resolve().parents[1] / "src" / "loom_kit" / "web" / "library.js").read_text()
HTML = (Path(__file__).resolve().parents[1] / "src" / "loom_kit" / "web" / "library.html").read_text()


def test_five_tabs_deep_linked():
    """FR-3: the five tabs the owner commissioned, hash-routed (D-3)."""
    assert 'const TABS = [["overview", "Overview"], ["spec", "Spec"], ["design", "Design"], ["tasks", "Tasks"], ["review", "Review"]];' in JS
    assert "hashchange" in JS and 'location.hash = "#/" + S.sel' in JS


def test_pane_groups_needs_you_first():
    """DES-3 (Q-2): the owner's action leads the list."""
    assert '["you", "Waiting on you"' in JS
    assert '["moving", "Moving"' in JS and '["done", "Done"' in JS
    assert "open_questions > 0" in JS  # open questions pull a spec into "you"


def test_every_id_mention_jumps():
    """FR-9: the ID regex covers the pack's whole vocabulary."""
    assert "(US|AC|FR|CON|Q|D|DES|T)-" in JS
    assert 'data-jump' in JS and "function jump(" in JS
    assert "scrollIntoView" in JS  # the jump lands


def test_requirements_show_coverage():
    """FR-9: coverage computed from satisfies, gaps named honestly."""
    assert "coveredBy" in JS and "satisfies" in JS
    assert "not covered yet" in JS


def test_markdown_renders_client_side():
    """FR-4 (D-1): marked renders the discovered documents."""
    assert "marked.parse" in JS
    assert 'src="/marked.min.js"' in HTML


def test_docs_discovered_not_assumed():
    """Q-7: every .md from the folder listing, not a hard-coded name."""
    assert ".glob(\"*.md\")" in (Path(__file__).resolve().parents[1] / "src" / "loom_kit" / "web" / "library.py").read_text()
    assert "docs" in JS  # consumed from /specs
