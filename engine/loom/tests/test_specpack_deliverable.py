"""Deliverable stage tests (status-model T-1/T-2: FR-1, FR-2, AC-1)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from loom_kit import specpack
from loom_kit.cli import main
from loom_kit.spine import LoomError


def _pack(tasks, *, decisions=None, questions=None, review=None, status=None):
    doc = {
        "format": "specpack/0.3", "name": "d", "title": "D",
        "spec": {
            "why": "w",
            "requirements": [{"id": "FR-1", "text": "r", "priority": "P1"}],
            "clarifications": questions or [],
        },
        "plan": {"decisions": decisions or [
            {"id": "D-1", "decision": "d", "because": "b", "status": "accepted", "accepted_by": "human:owner"}
        ]},
        "tasks": tasks,
    }
    if review:
        doc["review"] = review
    if status:
        doc["status"] = status
    return doc


def _t(status):
    return {"id": "T-1", "title": "one", "detail": "d", "satisfies": ["FR-1"],
            "verify": {"cmd": "true", "expect": "0"}, "status": status}


def _done():
    t = _t("done")
    t["evidence"] = [{"cmd": "true", "exit": 0, "at": "t", "by": "t"}]
    return t


PASS = {"verdicts": [{"on": "PACK", "verdict": "PASS", "by": "r"}]}


def test_every_stage_branch():
    assert specpack.derive_deliverable(_pack([_t("done")], status="complete", review=PASS, decisions=[
        {"id": "D-1", "decision": "d", "because": "b", "status": "accepted", "accepted_by": "human:owner"}],
        questions=[])) == "delivered"
    assert specpack.derive_deliverable(_pack([_t("blocked")])) == "blocked"
    assert specpack.derive_deliverable(_pack([_done()], decisions=[
        {"id": "D-1", "decision": "d", "because": "b", "status": "proposed"}])) == "awaiting_owner"
    assert specpack.derive_deliverable(_pack([_done()], questions=[
        {"id": "Q-1", "question": "q", "status": "open"}])) == "awaiting_owner"
    assert specpack.derive_deliverable(_pack([_done()])) == "in_review"
    assert specpack.derive_deliverable(_pack([_done()], review=PASS)) == "in_progress"  # closable, not closed
    assert specpack.derive_deliverable(_pack([_t("doing")])) == "in_progress"
    assert specpack.derive_deliverable(_pack([_t("todo")], questions=[
        {"id": "Q-1", "question": "q", "status": "open"}])) == "planning"
    assert specpack.derive_deliverable(_pack([_t("todo")])) == "drafted"
    assert specpack.derive_deliverable(_pack([])) == "drafted"  # total: empty is drafted


def test_doing_beats_blocked():
    doc = _pack([_t("blocked"), _t("doing")])
    assert specpack.derive_deliverable(doc) == "in_progress"


def test_save_writes_the_derivation(tmp_path: Path):
    d = tmp_path / "p"
    d.mkdir()
    (d / "pack.json").write_text(json.dumps(_pack([_t("todo")])))
    doc, path = specpack.load_specpack(d)
    specpack.save(doc, path)
    on_disk = json.loads(path.read_text())
    assert on_disk["deliverable"] == "drafted"


def test_load_refuses_hand_edited_stage(tmp_path: Path):
    d = tmp_path / "p"
    d.mkdir()
    doc = _pack([_t("todo")])
    doc["deliverable"] = "in_review"  # a lie
    (d / "pack.json").write_text(json.dumps(doc))
    with pytest.raises(LoomError, match="deliverable stage mismatch"):
        specpack.load_specpack(d)


def test_load_accepts_absent_stage(tmp_path: Path):
    """Old packs without the field load fine; the first save adds it."""
    d = tmp_path / "p"
    d.mkdir()
    (d / "pack.json").write_text(json.dumps(_pack([_t("todo")])))
    doc, path = specpack.load_specpack(d)
    assert "deliverable" not in doc  # materialized only on save
    specpack.save(doc, path)
    assert "deliverable" in json.loads(path.read_text())


def test_roundtrip_via_cli_next(tmp_path: Path, capsys):
    d = tmp_path / "p"
    d.mkdir()
    (d / "pack.json").write_text(json.dumps(_pack([_t("todo")])))
    assert main(["next", str(d), "--json"]) == 0
    out = json.loads(capsys.readouterr().out)
    assert out["status"] == "task"
    doc = json.loads((d / "pack.json").read_text())
    assert doc["deliverable"] == "in_progress"  # doing after handout
    # and the next load agrees
    doc2, _ = specpack.load_specpack(d)
    assert doc2["deliverable"] == "in_progress"


def test_status_headline(tmp_path: Path, capsys):
    from loom_kit.cli import main as m
    d = tmp_path / "p"
    d.mkdir()
    (d / "pack.json").write_text(json.dumps(_pack([_t("todo")])))
    assert m(["status", str(d)]) == 0
    out = capsys.readouterr().out
    assert out.splitlines()[0] == "deliverable: drafted (0 done, 0 doing, 1 todo, 0 blocked)"


def test_next_headline_human_and_json(tmp_path: Path, capsys):
    from loom_kit.cli import main as m
    d = tmp_path / "p"
    d.mkdir()
    (d / "pack.json").write_text(json.dumps(_pack([_t("todo")])))
    assert m(["next", str(d)]) == 0
    assert capsys.readouterr().out.splitlines()[0] == "deliverable: in_progress (0 done, 1 doing, 0 todo, 0 blocked)"
    assert m(["next", str(d), "--json"]) == 0
    out = json.loads(capsys.readouterr().out)
    assert out["deliverable"] == "in_progress"


def test_story_drift_coverage_both_directions():
    doc = _pack([_t("todo")])
    doc["spec"]["stories"] = [
        {"id": "US-1", "as": "a", "want": "w", "so": "s"},
        {"id": "US-2", "as": "a", "want": "w", "so": "s"},
    ]
    doc["spec"]["requirements"][0]["serves"] = ["US-1"]
    doc["spec"]["requirements"].append({"id": "FR-2", "text": "r2", "priority": "P2"})
    errs, cov = specpack.alignment(doc)
    assert errs == []  # drift is coverage-tier, never a violation
    assert cov["story_drift"] == {"requirements_without_stories": ["FR-2"], "stories_unserved": ["US-2"]}


def test_story_drift_clean_when_served():
    doc = _pack([_t("todo")])
    doc["spec"]["stories"] = [{"id": "US-1", "as": "a", "want": "w", "so": "s"}]
    doc["spec"]["requirements"][0]["serves"] = ["US-1"]
    errs, cov = specpack.alignment(doc)
    assert cov["story_drift"] == {"requirements_without_stories": [], "stories_unserved": []}


def test_story_acceptance_first_class():
    doc = _pack([_t("todo")])
    doc["spec"]["stories"] = [{"id": "US-1", "as": "a", "want": "w", "so": "s", "acceptance": [
        {"id": "AC-9", "given": "g", "when": "w", "then": "t"}]}]
    doc["tasks"][0]["accepts"] = ["AC-9"]
    errs, cov = specpack.alignment(doc)
    assert errs == []  # A2 resolves the story AC through the task link
    assert cov["US"] == {"AC-9": ["T-1"]}
    sl = specpack.slice_for(doc, "T-1")
    items = {i["id"]: i for i in sl["items"]}
    assert items["AC-9"]["family"] == "AC" and items["AC-9"]["given"] == "g"
    # the story rides along via the FR it serves
    doc["spec"]["requirements"][0]["serves"] = ["US-1"]
    sl2 = specpack.slice_for(doc, "T-1")
    fams = {i["id"]: i["family"] for i in sl2["items"]}
    assert fams.get("US-1") == "US"


def test_story_ac_duplicate_id_caught_by_a1():
    doc = _pack([_t("todo")])
    doc["spec"]["requirements"][0]["scenarios"] = [{"id": "AC-9", "given": "g", "when": "w", "then": "t"}]
    doc["spec"]["stories"] = [{"id": "US-1", "as": "a", "want": "w", "so": "s", "acceptance": [
        {"id": "AC-9", "given": "g", "when": "w", "then": "t"}]}]
    errs, _ = specpack.alignment(doc)
    assert any(e.startswith("A1 duplicate ids: AC-9") for e in errs), errs


def test_partially_done_is_in_progress():
    t1 = _t("done"); t1["evidence"] = [{"cmd": "x", "exit": 0, "at": "t", "by": "t"}]
    assert specpack.derive_deliverable(_pack([t1, _t("todo")])) == "in_progress"


def test_story_acs_report_once_under_us():
    doc = _pack([_t("todo")])
    doc["spec"]["stories"] = [{"id": "US-1", "as": "a", "want": "w", "so": "s", "acceptance": [
        {"id": "AC-9", "given": "g", "when": "w", "then": "t"}]}]
    doc["tasks"][0]["accepts"] = ["AC-9"]
    errs, cov = specpack.alignment(doc)
    assert "AC-9" not in cov["AC"]
    assert cov["US"]["AC-9"] == ["T-1"]
