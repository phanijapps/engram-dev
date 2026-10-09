"""The approval act (spec-web T-2; FR-4, DES-4, D-11; AC-16)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from loom_kit import specpack
from loom_kit.cli import main
from loom_kit.spine import LoomError


def _pack(open_q=True):
    cls = [{"id": "Q-1", "question": "Still open?", "status": "open", "owner": "human:owner"}] if open_q else []
    return {
        "format": "specpack/0.3", "name": "ap", "title": "Approval",
        "spec": {"why": "w", "requirements": [{"id": "FR-1", "text": "r", "priority": "P1"}], "clarifications": cls},
        "plan": {"decisions": []},
        "tasks": [{"id": "T-1", "title": "t", "detail": "d", "satisfies": ["FR-1"], "verify": {"cmd": "true", "expect": "0"}, "status": "todo"}],
    }


def _load(tmp_path: Path, open_q=True):
    d = tmp_path / "p"
    d.mkdir(exist_ok=True)
    (d / "p.json").write_text(json.dumps(_pack(open_q)))
    return specpack.load_specpack(d)


def test_approve_happy_records_at_by(tmp_path: Path):
    doc, path = _load(tmp_path, open_q=False)
    out = specpack.approve_spec(doc, "human:owner", at="2026-10-09T18:00:00Z")
    assert out["approved_by"] == "human:owner"
    specpack.save(doc, path)
    on_disk = json.loads(path.read_text())
    assert on_disk["date"]["approved"] == {"at": "2026-10-09T18:00:00Z", "by": "human:owner"}


def test_approve_refused_with_open_questions(tmp_path: Path):
    """AC-16."""
    doc, _ = _load(tmp_path, open_q=True)
    with pytest.raises(LoomError, match="open questions remain.*Q-1"):
        specpack.approve_spec(doc, "human:owner")


def test_approve_refuses_nonhuman_and_repeat(tmp_path: Path):
    doc, _ = _load(tmp_path, open_q=False)
    with pytest.raises(LoomError, match="human claim"):
        specpack.approve_spec(doc, "agent:pi")
    specpack.approve_spec(doc, "human:owner")
    with pytest.raises(LoomError, match="already approved"):
        specpack.approve_spec(doc, "human:owner")


def test_approve_refused_when_complete(tmp_path: Path):
    doc, _ = _load(tmp_path, open_q=False)
    doc["status"] = specpack.PACK_COMPLETE
    with pytest.raises(LoomError, match="frozen"):
        specpack.approve_spec(doc, "human:owner")


def test_dual_read_roundtrip_approved(tmp_path: Path):
    doc, path = _load(tmp_path, open_q=False)
    specpack.approve_spec(doc, "human:owner", at="2026-10-09T18:00:00Z")
    specpack.save(doc, path)
    again, _ = specpack.load_specpack(path.parent)
    assert again["approved_at"] == "2026-10-09T18:00:00Z"
    assert again["approved_by"] == "human:owner"


def test_cli_approve_flow(tmp_path: Path):
    d = tmp_path / "p"
    d.mkdir()
    (d / "p.json").write_text(json.dumps(_pack(open_q=False)))
    rev = lambda: json.loads((d / "p.json").read_text()).get("revision", 1)  # noqa: E731
    assert main(["approve", str(d), "--by", "human:owner", "--expected-revision", str(rev())]) == 0
    on_disk = json.loads((d / "p.json").read_text())
    assert on_disk["date"]["approved"]["by"] == "human:owner"
    assert on_disk["revision"] == 2  # the house bump
    # stale writer refused
    assert main(["approve", str(d), "--by", "human:owner", "--expected-revision", "1"]) == 1
    # open-question pack refused (AC-16 at the CLI)
    d2 = tmp_path / "q"
    d2.mkdir()
    (d2 / "q.json").write_text(json.dumps(_pack(open_q=True)))
    assert main(["approve", str(d2), "--by", "human:owner", "--expected-revision", "1"]) == 1


def test_answered_unknown_still_blocks_approval(tmp_path: Path):
    """The honest unknown gates the ceremony, not just closure."""
    doc, _ = _load(tmp_path, open_q=True)
    specpack.answer_question(doc, "Q-1", "human:owner", unknown=True)
    with pytest.raises(LoomError, match="open questions remain"):
        specpack.approve_spec(doc, "human:owner")


def test_derivation_reads_approval(tmp_path: Path):
    """AC-6: the derived stage reflects the approval act, never hand-set."""
    doc, path = _load(tmp_path, open_q=False)
    doc["plan"]["decisions"] = [{"id": "D-1", "decision": "d", "because": "b", "status": "accepted", "accepted_by": "human:owner"}]
    specpack.save(doc, path)  # ceremony settled, approval pending
    on_disk = json.loads(path.read_text())
    assert on_disk["status"]["deliverable"] == "awaiting_owner"
    specpack.approve_spec(doc, "human:owner")
    specpack.save(doc, path)
    on_disk = json.loads(path.read_text())
    assert on_disk["status"]["deliverable"] == "planning"  # released to proceed
    # a newborn pack with nothing settled stays drafted
    (tmp_path / "fresh").mkdir()
    doc2, path2 = _load(tmp_path / "fresh", open_q=False)
    doc2["plan"]["decisions"] = [{"id": "D-1", "decision": "d", "because": "b", "status": "proposed"}]
    specpack.save(doc2, path2)
    assert json.loads(path2.read_text())["status"]["deliverable"] == "drafted"
