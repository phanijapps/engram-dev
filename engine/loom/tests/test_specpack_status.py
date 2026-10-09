"""Status vocabulary tests (status-vocabulary FR-1, FR-2; AC-1..AC-3).

The single source of truth is the constants in specpack.py; the vendored
schema enums must equal them, and the machine must keep pack status explicit
and frozen packs byte-untouched.
"""

from __future__ import annotations

import json
from pathlib import Path

from loom_kit import specpack
from loom_kit.cli import main

REPO = Path(__file__).resolve().parents[3]
SCHEMA = json.loads((Path(specpack.SCHEMA_PATH)).read_text())


def test_schema_enums_equal_the_code_constants():
    """AC-3: the schema is the truth; the constants must match it exactly."""
    assert tuple(SCHEMA["$defs"]["oldRoot"]["properties"]["status"]["enum"]) == specpack.PACK_STATUSES
    assert tuple(SCHEMA["$defs"]["statusGroup"]["properties"]["lifecycle"]["enum"]) == specpack.PACK_STATUSES
    assert tuple(SCHEMA["$defs"]["task"]["properties"]["status"]["enum"]) == specpack.TASK_STATUSES
    assert tuple(SCHEMA["$defs"]["decision"]["properties"]["status"]["enum"]) == specpack.DECISION_STATUSES
    assert tuple(SCHEMA["$defs"]["clarification"]["properties"]["status"]["enum"]) == specpack.QUESTION_STATUSES
    assert tuple(SCHEMA["$defs"]["verdict"]["properties"]["verdict"]["enum"]) == specpack.VERDICTS


def _mini(**over):
    pack = {
        "format": "specpack/0.3", "name": "s", "title": "S",
        "spec": {"why": "w", "requirements": [{"id": "FR-1", "text": "r"}], "clarifications": []},
        "plan": {"decisions": [{"id": "D-1", "decision": "d", "because": "b", "status": "proposed"}]},
        "tasks": [{"id": "T-1", "title": "one", "detail": "d", "satisfies": ["FR-1"],
                   "verify": {"cmd": "true", "expect": "0"}, "status": "todo"}],
    }
    pack.update(over)
    return pack


def test_handout_statuses_exactly_match_every_branch(tmp_path: Path):
    """SMELL-7 fix: drive every next_task branch and demand set equality."""
    seen = set()
    # task
    seen.add(specpack.next_task(_mini())["status"])
    # WAITING: work exists but nothing is ready and nothing is blocked
    doc = _mini()
    doc["tasks"][0]["needs"] = ["T-9"]
    seen.add(specpack.next_task(doc)["status"])
    # BLOCKED: only a blocked task remains
    doc = _mini()
    doc["tasks"][0]["status"] = "blocked"
    seen.add(specpack.next_task(doc)["status"])
    # needs_closure: all done, a decision still proposed
    doc = _mini(tasks=[{"id": "T-1", "title": "one", "detail": "d", "satisfies": ["FR-1"],
                        "verify": {"cmd": "true", "expect": "0"}, "status": "done",
                        "evidence": [{"cmd": "true", "exit": 0, "at": "t", "by": "t"}]}])
    doc["plan"]["decisions"][0]["status"] = "accepted"
    doc["plan"]["decisions"][0]["accepted_by"] = "human:owner"
    doc["plan"]["decisions"].append({"id": "D-2", "decision": "x", "because": "y", "status": "proposed"})
    seen.add(specpack.next_task(doc)["status"])
    # DONE: all done, decisions dispositioned, no open questions
    doc["plan"]["decisions"][1]["status"] = "rejected"
    doc["plan"]["decisions"][1]["rejected_because"] = "no"
    seen.add(specpack.next_task(doc)["status"])
    # COMPLETE: frozen
    doc["status"] = "complete"
    doc["closed_by"] = "human:owner"
    seen.add(specpack.next_task(doc)["status"])
    # needs_rebase: drifted pin (needs a real file)
    import hashlib

    d = tmp_path / "drift"
    d.mkdir()
    (d / "src.txt").write_bytes(b"v2")
    doc = _mini()
    doc["tasks"][0]["context"] = {"touch": [{"path": "src.txt", "why": "w", "sha256": hashlib.sha256(b"v1").hexdigest()}]}
    (d / "pack.json").write_text(json.dumps(doc))
    loaded, path = specpack.load_specpack(d)
    seen.add(specpack.next_task(loaded, path)["status"])
    assert seen == set(specpack.HANDOUT_STATUSES), (seen, specpack.HANDOUT_STATUSES)


def test_load_materializes_explicit_active(tmp_path: Path):
    """AC-1: an authored pack without status becomes explicitly active."""
    d = tmp_path / "pack"
    d.mkdir()
    pack = {
        "format": "specpack/0.3", "name": "s", "title": "S",
        "spec": {"why": "w", "requirements": [{"id": "FR-1", "text": "r"}]},
        "plan": {"decisions": [{"id": "D-1", "decision": "d", "because": "b", "status": "proposed"}]},
        "tasks": [{"id": "T-1", "title": "one", "satisfies": ["FR-1"],
                   "verify": {"cmd": "true", "expect": "0"}, "status": "todo"}],
    }
    (d / "pack.json").write_text(json.dumps(pack))
    doc, _ = specpack.load_specpack(d)
    assert doc["status"] == "active"
    # persisted by the machine save that follows (a task handout saves)
    assert main(["next", str(d)]) == 0
    on_disk = json.loads((d / "pack.json").read_text())
    assert on_disk["status"]["lifecycle"] == "active"


def test_frozen_pack_is_byte_untouched_by_next(tmp_path: Path, capsys):
    """AC-2: a complete pack is reference material; the loop reports, never rewrites."""
    d = tmp_path / "pack"
    d.mkdir()
    pack = {
        "format": "specpack/0.3", "name": "s", "title": "S",
        "spec": {"why": "w", "requirements": [{"id": "FR-1", "text": "r"}],
                 "clarifications": []},
        "plan": {"decisions": [{"id": "D-1", "decision": "d", "because": "b",
                                "status": "accepted", "accepted_by": "human:owner"}]},
        "tasks": [{"id": "T-1", "title": "one", "detail": "d", "satisfies": ["FR-1"],
                   "verify": {"cmd": "true", "expect": "0"}, "status": "done",
                   "evidence": [{"cmd": "true", "exit": 0, "at": "2026-10-08T00:00:00Z", "by": "t"}]}],
        "review": {"verdicts": [{"on": "PACK", "verdict": "PASS", "by": "r"}]},
    }
    (d / "pack.json").write_text(json.dumps(pack, indent=2) + "\n")
    doc, _ = specpack.load_specpack(d)  # materializes active in memory only
    specpack.close(doc, "human:owner")
    specpack.save(doc, d / "pack.json")
    before = (d / "pack.json").read_bytes()
    assert main(["next", str(d)]) == 0
    assert "COMPLETE" in capsys.readouterr().out
    assert (d / "pack.json").read_bytes() == before  # not even a byte moved


def test_deliverable_schema_enum_equals_constant():
    S = json.loads(Path(specpack.SCHEMA_PATH).read_text())
    assert tuple(S["$defs"]["oldRoot"]["properties"]["deliverable"]["enum"]) == specpack.DELIVERABLE_STAGES
    assert tuple(S["$defs"]["statusGroup"]["properties"]["deliverable"]["enum"]) == specpack.DELIVERABLE_STAGES


def test_deliverable_stage_set_equality_exhaustive():
    """FR-3: drive every branch; the exercised set must equal the vocabulary."""
    from test_specpack_deliverable import _pack, _t, _done, PASS

    seen = set()
    seen.add(specpack.derive_deliverable(_pack([_t("done")], status="complete", review=PASS)))
    seen.add(specpack.derive_deliverable(_pack([_t("blocked")])))
    seen.add(specpack.derive_deliverable(_pack([_done()], decisions=[
        {"id": "D-1", "decision": "d", "because": "b", "status": "proposed"}])))
    seen.add(specpack.derive_deliverable(_pack([_done()])))
    seen.add(specpack.derive_deliverable(_pack([_done()], review=PASS)))
    seen.add(specpack.derive_deliverable(_pack([_t("doing")])))
    seen.add(specpack.derive_deliverable(_pack([_t("todo")], questions=[
        {"id": "Q-1", "question": "q", "status": "open"}])))
    seen.add(specpack.derive_deliverable(_pack([_t("todo")])))  # awaiting_owner: the owner's gate
    seen.add(specpack.derive_deliverable(_pack([], decisions=[], questions=[])))  # drafted: nothing settled
    assert seen == set(specpack.DELIVERABLE_STAGES), (seen, specpack.DELIVERABLE_STAGES)
