"""spec-library T-4: the words layer (FR-10, DES-5, D-2, Q-3/Q-10)."""

from __future__ import annotations

from pathlib import Path

JS = (Path(__file__).resolve().parents[1] / "src" / "loom_kit" / "web" / "library.js").read_text()

SEVEN = ["awaiting_owner", "planning", "in_progress", "blocked", "in_review", "delivered", "drafted"]


def test_every_stage_translated():
    """All seven frozen stages carry owner words — no leaks."""
    for st in SEVEN:
        assert f"{st}:" in JS, st
    assert '"Waiting on you"' in JS and '"Stuck — needs attention"' in JS


def test_engineer_term_one_hover_away():
    """Q-10: the tooltips are the technical teams' on-ramp."""
    assert 'title="${esc(st)}"' in JS or "title=\"${esc(st)}\"" in JS


def test_plain_dates_with_precise_hover():
    """FR-10: plain phrase on screen, ISO in the tooltip."""
    assert "plainDate" in JS and "title=\"" in JS
    for w in ("today", "yesterday", "days ago"):
        assert w in JS


def test_task_words_too():
    assert '"Not started"' in JS and '"Stuck"' in JS


def test_friendly_empty_states():
    """Q-8: 'Not written yet', never a mystery."""
    assert "Not written yet." in JS


def test_legacy_read_only():
    """Q-9: legacy listed, no acts."""
    assert "read-only" in JS and 'data-legacy' in JS
    assert JS.index('S.sel.startsWith("legacy:")') < JS.index("function paintActs")
