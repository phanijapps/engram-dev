"""loom answer + question vocabulary (spec-web T-1; FR-2, FR-3; AC-14, AC-15)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from loom_kit import specpack
from loom_kit.cli import main
from loom_kit.spine import LoomError


def _pack():
    return {
        "format": "specpack/0.3", "name": "ans", "title": "Answers",
        "spec": {"why": "w", "requirements": [{"id": "FR-1", "text": "r", "priority": "P1"}], "clarifications": [
            {"id": "Q-1", "question": "Open or choice?", "status": "open", "owner": "human:owner", "kind": "choice",
             "options": ["open text", "choice list"], "default": "choice list"},
            {"id": "Q-2", "question": "Free form?", "status": "open", "owner": "human:owner"},
        ]},
        "plan": {"decisions": []},
        "tasks": [{"id": "T-1", "title": "t", "detail": "d", "satisfies": ["FR-1"], "verify": {"cmd": "true", "expect": "0"}, "status": "todo"}],
    }


def _load(tmp_path: Path):
    d = tmp_path / "p"
    d.mkdir(exist_ok=True)
    (d / "p.json").write_text(json.dumps(_pack()))
    return specpack.load_specpack(d)


def test_answer_resolves_with_human_claim(tmp_path: Path):
    doc, _ = _load(tmp_path)
    q = specpack.answer_question(doc, "Q-1", "human:owner", text="choice list")
    assert q["status"] == "resolved"
    assert q["answer"] == "choice list"
    assert q["answered_by"] == "human:owner"
    assert q["answered_at"]


def test_answer_refuses_nonhuman_claim(tmp_path: Path):
    doc, _ = _load(tmp_path)
    with pytest.raises(LoomError, match="human claim"):
        specpack.answer_question(doc, "Q-1", "agent:pi", text="x")


def test_answer_refuses_empty_and_missing(tmp_path: Path):
    doc, _ = _load(tmp_path)
    with pytest.raises(LoomError, match="empty"):
        specpack.answer_question(doc, "Q-1", "human:owner", text="  ")
    with pytest.raises(LoomError, match="no such question"):
        specpack.answer_question(doc, "Q-9", "human:owner", text="x")


def test_unknown_records_honestly_and_still_gates(tmp_path: Path):
    """AC-14: answered-unknown keeps blocking closure."""
    doc, _ = _load(tmp_path)
    q = specpack.answer_question(doc, "Q-1", "human:owner", unknown=True)
    assert q["status"] == "open"  # still gating
    assert q["unknown"] is True
    assert q["answer"] == "(unknown)"
    gaps = specpack.closure_gaps(doc)
    assert "Q-1" in gaps["open_questions"]


def test_reanswering_resolved_refused(tmp_path: Path):
    doc, _ = _load(tmp_path)
    specpack.answer_question(doc, "Q-1", "human:owner", text="open text")
    with pytest.raises(LoomError, match="already resolved"):
        specpack.answer_question(doc, "Q-1", "human:owner", text="again")


def test_unknown_then_real_answer_lands(tmp_path: Path):
    doc, _ = _load(tmp_path)
    specpack.answer_question(doc, "Q-2", "human:owner", unknown=True)
    q = specpack.answer_question(doc, "Q-2", "human:owner", text="now I know")
    assert q["status"] == "resolved"
    assert q["unknown"] is True  # history preserved: was unknown once
    assert q["answer"] == "now I know"


def test_cli_answer_flow(tmp_path: Path):
    d = tmp_path / "p"
    d.mkdir()
    (d / "p.json").write_text(json.dumps(_pack()))
    rev = lambda: json.loads((d / "p.json").read_text()).get("revision", 1)  # noqa: E731
    assert main(["answer", str(d), "--q", "Q-1", "--text", "choice list", "--by", "human:owner", "--expected-revision", str(rev())]) == 0
    on_disk = json.loads((d / "p.json").read_text())
    found = [c for c in on_disk["spec"]["clarifications"] if c["id"] == "Q-1"][0]
    assert found["status"] == "resolved" and found["answered_by"] == "human:owner"
    # stale writer refused (AC-15 shape: machine guards, exit 1)
    assert main(["answer", str(d), "--q", "Q-2", "--text", "x", "--by", "human:owner", "--expected-revision", "1"]) == 1
    # non-human claim refused
    assert main(["answer", str(d), "--q", "Q-2", "--text", "x", "--by", "agent:pi", "--expected-revision", str(rev())]) == 1


def test_vocabulary_validates_both_ways(tmp_path: Path):
    """Old questions (no kind) and new (kind/options/default) both validate."""
    doc, path = _load(tmp_path)
    assert specpack.validate(doc, path) == []
    specpack.save(doc, path)
    assert specpack.validate(json.loads(path.read_text()), path) == []
    specpack.answer_question(doc, "Q-2", "human:owner", unknown=True)
    specpack.save(doc, path)
    assert specpack.validate(json.loads(path.read_text()), path) == []
