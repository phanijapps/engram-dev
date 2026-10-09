"""spec-library T-6: the journey strip (FR-13, DES-6, Q-5)."""

from __future__ import annotations

from pathlib import Path

JS = (Path(__file__).resolve().parents[1] / "src" / "loom_kit" / "web" / "library.js").read_text()


def test_five_lit_nodes_on_the_path():
    """The PO path: Just started → Being shaped → In progress → In review → Done."""
    assert 'const PATH = ["drafted", "planning", "in_progress", "in_review", "delivered"];' in JS
    assert "jnode" in JS and "jdot" in JS and "jbar" in JS


def test_position_from_the_frozen_stage():
    assert "posOf" in JS and "PATH.indexOf(stage)" in JS


def test_two_flags_above_the_path():
    """awaiting_owner and blocked rise as flags — presentation, not vocabulary."""
    assert 'stage === "awaiting_owner" ? `<span class="jflag you"' in JS
    assert 'stage === "blocked" ? `<span class="jflag stuck"' in JS


def test_the_strip_lives_in_overview():
    assert "journey(" in JS and "tabOverview" in JS
