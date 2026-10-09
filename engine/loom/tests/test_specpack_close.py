"""Decision ledger + closure tests (T-8/T-9: FR-8, FR-9, AC-4, AC-5)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from loom_kit import specpack
from loom_kit.cli import main
from loom_kit.spine import LoomError


def _pack(**over):
    doc = {
        "format": "specpack/0.3",
        "name": "close-fixture",
        "title": "Close fixture",
        "spec": {
            "why": "f",
            "requirements": [{"id": "FR-1", "text": "r", "priority": "P1"}],
            "clarifications": [
                {"id": "Q-1", "question": "q1", "status": "open", "resolved_by": "D-2"},
                {"id": "Q-2", "question": "q2", "status": "open"},
            ],
        },
        "plan": {
            "decisions": [
                {"id": "D-1", "decision": "accepted one", "because": "b", "status": "accepted", "accepted_by": "human:owner"},
                {"id": "D-2", "decision": "proposed one", "because": "b", "status": "proposed", "resolves": ["Q-1"]},
                {"id": "D-3", "decision": "another", "because": "b", "status": "proposed"},
            ]
        },
        "tasks": [
            {"id": "T-1", "title": "one", "detail": "d", "satisfies": ["FR-1"],
             "verify": {"cmd": "true", "expect": "0"}, "status": "done",
             "evidence": [{"cmd": "true", "exit": 0, "at": "2026-10-08T00:00:00Z", "by": "t"}]},
        ],
    }
    doc.update(over)
    return doc


def test_accept_records_and_resolves_questions():
    doc = _pack()
    out = specpack.accept_decision(doc, "D-2", "human:owner")
    assert out == {"decision": "D-2", "status": "accepted", "accepted_by": "human:owner", "resolved_questions": ["Q-1"]}
    d2 = next(d for d in doc["plan"]["decisions"] if d["id"] == "D-2")
    assert d2["status"] == "accepted" and d2["accepted_by"] == "human:owner"
    q1 = next(q for q in doc["spec"]["clarifications"] if q["id"] == "Q-1")
    assert q1["status"] == "resolved" and "D-2" in q1["answer"]
    q2 = next(q for q in doc["spec"]["clarifications"] if q["id"] == "Q-2")
    assert q2["status"] == "open"  # untouched


def test_accept_resolves_both_link_halves():
    """FR-8: the questions a decision LISTS resolve, even without resolved_by."""
    doc = _pack()
    doc["plan"]["decisions"][1]["resolves"] = ["Q-1", "Q-2"]  # D-2 lists Q-2 too; Q-2 has no resolved_by
    out = specpack.accept_decision(doc, "D-2", "human:owner")
    assert out["resolved_questions"] == ["Q-1", "Q-2"]


def test_accept_refuses_non_human_claim():
    doc = _pack()
    with pytest.raises(LoomError, match="human claim"):
        specpack.accept_decision(doc, "D-2", "agent:pi")


def test_accept_reject_are_terminal():
    doc = _pack()
    specpack.accept_decision(doc, "D-2", "human:owner")
    with pytest.raises(LoomError, match="already accepted"):
        specpack.accept_decision(doc, "D-2", "human:owner")
    specpack.reject_decision(doc, "D-3", "human:owner", "not worth the complexity")
    with pytest.raises(LoomError, match="rejected"):
        specpack.accept_decision(doc, "D-3", "human:owner")
    d3 = next(d for d in doc["plan"]["decisions"] if d["id"] == "D-3")
    assert d3["rejected_because"] == "not worth the complexity"


def test_reject_leaves_questions_open():
    doc = _pack()
    specpack.reject_decision(doc, "D-2", "human:owner", "wrong rule")
    q1 = next(q for q in doc["spec"]["clarifications"] if q["id"] == "Q-1")
    assert q1["status"] == "open"


def test_next_needs_closure_names_owner_work():
    doc = _pack()
    out = specpack.next_task(doc)
    assert out["status"] == "needs_closure"
    assert out["pending_decisions"] == ["D-2", "D-3"]
    assert out["open_questions"] == ["Q-1", "Q-2"]
    specpack.accept_decision(doc, "D-2", "human:owner")  # resolves Q-1
    out = specpack.next_task(doc)
    assert out["pending_decisions"] == ["D-3"]
    assert out["open_questions"] == ["Q-2"]
    specpack.reject_decision(doc, "D-3", "human:owner", "no")
    doc["spec"]["clarifications"][1]["status"] = "resolved"
    doc["spec"]["clarifications"][1]["answer"] = "out of fashion"
    # only the review PASS remains: DONE, not needs_closure (review gates close)
    assert specpack.next_task(doc)["status"] == "DONE"


def test_cli_accept_then_done_flow(tmp_path: Path, capsys):
    d = tmp_path / "pack"
    d.mkdir()
    (d / "pack.json").write_text(json.dumps(_pack()))
    assert main(["next", str(d)]) == 2  # needs_closure
    out = capsys.readouterr().out
    assert "decision D-2 needs an owner verdict: loom accept" in out
    assert f"--expected-revision 1" in out  # runnable: the real revision, not <rev>
    assert main(["accept", str(d), "--decision", "D-2", "--by", "human:owner", "--expected-revision", "1"]) == 0
    assert "resolved Q-1" in capsys.readouterr().out
    assert main(["reject", str(d), "--decision", "D-3", "--by", "human:owner", "--because", "superseded", "--expected-revision", "2"]) == 0
    p = d / "pack.json"
    doc = json.loads(p.read_text())
    doc["spec"]["clarifications"][1]["status"] = "resolved"
    doc["spec"]["clarifications"][1]["answer"] = "dropped"
    doc.pop("deliverable", None)  # hand-amend: the derived field re-derives on the next save
    p.write_text(json.dumps(doc))
    assert main(["next", str(d)]) == 0  # DONE


def test_cli_accept_stale_writer(tmp_path: Path, capsys):
    d = tmp_path / "pack"
    d.mkdir()
    (d / "pack.json").write_text(json.dumps(_pack()))
    assert main(["accept", str(d), "--decision", "D-2", "--by", "human:owner", "--expected-revision", "9"]) == 1
    assert "REFUSED" in capsys.readouterr().out


def _closed_pack():
    doc = _pack()
    specpack.accept_decision(doc, "D-2", "human:owner")      # resolves Q-1
    specpack.reject_decision(doc, "D-3", "human:owner", "no")
    q2 = next(q for q in doc["spec"]["clarifications"] if q["id"] == "Q-2")
    q2["status"] = "resolved"
    q2["answer"] = "dropped"
    return doc


def test_close_refuses_naming_every_gap():
    doc = _pack()
    with pytest.raises(LoomError) as ei:
        specpack.close(doc, "human:owner")
    msg = str(ei.value)
    assert "D-2, D-3" in msg and "Q-1, Q-2" in msg and "no PASS verdict" in msg


def test_close_requires_review_pass_on_pack():
    doc = _closed_pack()
    with pytest.raises(LoomError, match="no PASS verdict"):
        specpack.close(doc, "human:owner")
    doc["review"] = {"verdicts": [{"on": "PACK", "verdict": "IMPROVE", "by": "agent:red-foreman"}]}
    with pytest.raises(LoomError, match="no PASS verdict"):
        specpack.close(doc, "human:owner")
    doc["review"]["verdicts"].append({"on": "PACK", "verdict": "PASS", "by": "agent:red-foreman"})
    out = specpack.close(doc, "human:owner")
    assert out == {"name": "close-fixture", "status": "complete", "closed_by": "human:owner", "revision": doc["revision"]}


def test_close_refuses_non_human():
    with pytest.raises(LoomError, match="human claim"):
        specpack.close(_closed_pack(), "agent:pi")


def test_complete_pack_is_frozen():
    doc = _closed_pack()
    doc["review"] = {"verdicts": [{"on": "PACK", "verdict": "PASS", "by": "agent:red-foreman"}]}
    specpack.close(doc, "human:owner")
    with pytest.raises(LoomError, match="frozen"):
        specpack.record(doc, "T-1", "fail", [{"command": "x", "exit_code": 1}], doc["revision"], "t")
    with pytest.raises(LoomError, match="frozen"):
        specpack.rebase(doc, "T-1", Path("."), approved_by="human:owner")
    with pytest.raises(LoomError, match="frozen"):
        specpack.accept_decision(doc, "D-3", "human:owner")
    with pytest.raises(LoomError, match="frozen"):
        specpack.close(doc, "human:owner")
    out = specpack.next_task(doc)
    assert out == {"status": "COMPLETE", "closed_by": "human:owner"}


def test_done_without_evidence_refuses_close():
    doc = _closed_pack()
    doc["tasks"][0].pop("evidence")
    doc["review"] = {"verdicts": [{"on": "PACK", "verdict": "PASS", "by": "agent:red-foreman"}]}
    with pytest.raises(LoomError, match="done without evidence: T-1"):
        specpack.close(doc, "human:owner")


def test_cli_close_and_status_lifecycle(tmp_path: Path, capsys):
    d = tmp_path / "pack"
    d.mkdir()
    (d / "pack.json").write_text(json.dumps(_closed_pack()))
    rev = json.loads((d / "pack.json").read_text()).get("revision", 1)
    assert main(["close", str(d), "--by", "human:owner", "--expected-revision", str(rev)]) == 1
    assert "no PASS verdict" in capsys.readouterr().err + capsys.readouterr().out  # the gap, not the fence
    p = d / "pack.json"
    doc = json.loads(p.read_text())
    doc["review"] = {"verdicts": [{"on": "PACK", "verdict": "PASS", "by": "agent:red-foreman"}]}
    p.write_text(json.dumps(doc))
    assert main(["close", str(d), "--by", "human:owner", "--expected-revision", str(doc.get("revision", 1)), "--at", "2026-10-08T16:00:00Z"]) == 0
    capsys.readouterr()
    assert main(["status", str(d)]) == 0
    out = capsys.readouterr().out
    assert "[complete]" in out and "frozen" in out
    assert main(["next", str(d)]) == 0  # COMPLETE
    assert "COMPLETE" in capsys.readouterr().out


def test_close_names_undone_tasks_gap():
    doc = _closed_pack()
    doc["tasks"].append({"id": "T-2", "title": "two", "satisfies": ["FR-1"],
                         "verify": {"cmd": "true", "expect": "0"}, "status": "todo"})
    doc["review"] = {"verdicts": [{"on": "PACK", "verdict": "PASS", "by": "r"}]}
    with pytest.raises(LoomError, match="tasks not done: T-2"):
        specpack.close(doc, "human:owner")


def test_status_prints_gap_hints_on_active_pack(tmp_path: Path, capsys):
    d = tmp_path / "pack"
    d.mkdir()
    (d / "pack.json").write_text(json.dumps(_pack()))
    assert main(["status", str(d)]) == 0
    out = capsys.readouterr().out
    assert "decision D-2 proposed: needs owner accept or reject" in out
    assert "question Q-1 open" in out


def test_complete_via_json_exits_zero(tmp_path: Path, capsys):
    d = tmp_path / "pack"
    d.mkdir()
    doc = _closed_pack()
    doc["review"] = {"verdicts": [{"on": "PACK", "verdict": "PASS", "by": "r"}]}
    specpack.close(doc, "human:owner")
    (d / "pack.json").write_text(json.dumps(doc))
    assert main(["next", str(d), "--json"]) == 0
    assert json.loads(capsys.readouterr().out)["status"] == "COMPLETE"


def test_close_at_must_be_iso(tmp_path: Path, capsys):
    d = tmp_path / "pack"
    d.mkdir()
    doc = _closed_pack()
    doc["review"] = {"verdicts": [{"on": "PACK", "verdict": "PASS", "by": "r"}]}
    (d / "pack.json").write_text(json.dumps(doc))
    rev = doc.get("revision", 1)
    assert main(["close", str(d), "--by", "human:owner", "--at", "garbage", "--expected-revision", str(rev)]) == 1
    assert "ISO-8601" in capsys.readouterr().out
