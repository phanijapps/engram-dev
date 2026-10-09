"""Event vocabulary + file (spec-web T-3; FR-6; AC-17)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from loom_kit import events


def test_event_shapes():
    a = events.event("answer", "human:owner", q="Q-1", text="because")
    assert a["kind"] == "answer" and a["q"] == "Q-1" and a["text"] == "because" and a["at"]
    c = events.event("choice", "human:owner", q="Q-2", option="interview.jsonl")
    assert c["option"] == "interview.jsonl" and "text" not in c
    ap = events.event("approve", "human:owner")
    assert "q" not in ap


def test_event_guards():
    with pytest.raises(ValueError, match="unknown event kind"):
        events.event("comment", "human:owner")
    with pytest.raises(ValueError, match="human claims"):
        events.event("approve", "agent:pi")
    with pytest.raises(ValueError, match="name a question"):
        events.event("answer", "human:owner")
    with pytest.raises(ValueError, match="pack-scoped"):
        events.event("approve", "human:owner", q="Q-1")
    with pytest.raises(ValueError, match="only choice"):
        events.event("answer", "human:owner", q="Q-1", option="x")


def test_file_header_then_append(tmp_path: Path):
    p = tmp_path / "interview.jsonl"
    events.write_event(p, events.event("answer", "human:owner", q="Q-1", text="yes"))
    events.write_event(p, events.event("unknown", "human:owner", q="Q-2"))
    events.write_event(p, events.event("approve", "human:owner"))
    lines = p.read_text().strip().splitlines()
    assert json.loads(lines[0]) == {"format": "specweb-events/0.1"}
    assert len(lines) == 4
    replayed = events.read_events(p)
    assert [e["kind"] for e in replayed] == ["answer", "unknown", "approve"]


def test_read_rejects_bad_header(tmp_path: Path):
    p = tmp_path / "interview.jsonl"
    p.write_text('{"format": "something-else/0.9"}\n{"kind": "approve", "by": "human:owner", "at": "x"}\n')
    with pytest.raises(ValueError, match="bad event format"):
        events.read_events(p)


def test_read_rejects_malformed_event(tmp_path: Path):
    p = tmp_path / "interview.jsonl"
    p.write_text('{"format": "specweb-events/0.1"}\n{"kind": "approve", "by": "agent:pi", "at": "x"}\n')
    with pytest.raises(ValueError, match="human claims"):
        events.read_events(p)


def test_events_path_is_d12_shape(tmp_path: Path):
    assert events.events_path(tmp_path) == tmp_path / "interview.jsonl"


def test_module_is_portable():
    """CON-4/FR-9: the seam imports nothing from the engine."""
    import ast
    import loom_kit.events as evmod
    tree = ast.parse(Path(evmod.__file__).read_text())
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            assert all(a.name.split(".")[0] != "loom_kit" for a in node.names), f"engine import: {ast.dump(node)}"
        elif isinstance(node, ast.ImportFrom):
            assert (node.module or "").split(".")[0] != "loom_kit", f"engine import: {node.module}"
