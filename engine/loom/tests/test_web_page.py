"""The page assets (spec-web T-4; FR-1, FR-5, FR-8; AC-1, AC-3, AC-12).

Headless structural tests: the behavioral contract the assets carry
(canonical order, event vocabulary, endpoints, no engine binding).
Browser interaction is exercised in test_web_server.py through the
adapter, and disclosed as manual in T-4 evidence.
"""

from __future__ import annotations

import re
from pathlib import Path

from loom_kit import events, specpack

WEB = Path(specpack.__file__).parent / "web"
HTML = (WEB / "page.html").read_text()
JS = (WEB / "page.js").read_text()


def _array_after(name: str, src: str) -> list[str]:
    m = re.search(rf"{name}\s*=\s*\[(.*?)\]", src, re.S)
    assert m, f"{name} array not found"
    return re.findall(r'"([^"]+)"', m.group(1))


def test_dossier_order_is_canonical():
    """FR-1/AC-12: the render walks the canonical order, exactly."""
    assert _array_after("SECTIONS", JS) == list(specpack.CANONICAL_ORDER)


def test_event_vocabulary_matches_the_contract():
    assert _array_after("KINDS", JS) == list(events.EVENT_KINDS)


def test_stage_ring_matches_engine_stages():
    assert _array_after("STAGES", JS) == list(specpack.DELIVERABLE_STAGES)


def test_page_never_binds_the_engine():
    """FR-9/AC-10: no engine name anywhere in the assets."""
    for asset in (HTML, JS):
        assert "loom" not in asset.lower(), "the page binds to events only, never the engine"


def test_adapter_endpoints_present():
    assert '"/spec"' in JS or "'/spec'" in JS or "fetch(\"/spec\")" in JS or 'fetch("/spec")' in JS
    assert '"/event"' in JS or "fetch(\"/event\")" in JS or 'fetch("/event")' in JS


def test_owner_injection_seam():
    """The adapter injects the owner identity; the page never hardcodes a person."""
    assert "INTERVIEW_CONFIG" in JS


def test_page_consumes_emitted_layout_keys():
    for key in ("date.approved", "status", "metadata", "clarifications", "revision"):
        assert key.split(".")[0] in JS
    assert "approved" in JS  # date.approved drives the ceremony view
    assert "deliverable" in JS  # the ring reads the derived stage


def test_question_vocabulary_consumed():
    for field in ("kind", "options", "unknown", "answered_by"):
        assert field in JS


def test_rounds_strip_present():
    """FR-5: what changed since the last visit, from revision history."""
    assert "since your last visit" in JS and "revision" in JS
