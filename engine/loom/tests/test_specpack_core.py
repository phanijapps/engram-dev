"""Specpack core tests: schema digest-sync, validation, alignment A1–A4, slices."""

from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

import pytest

from loom_kit import specpack
from loom_kit.spine import LoomError

REPO = Path(__file__).resolve().parents[3]
DOCS_SCHEMA = REPO / "docs" / "specs" / "spec-graph" / "specpack.schema.json"
EXAMPLE = REPO / "docs" / "specs" / "spec-graph" / "example-add-todo.specpack.json"
L1 = REPO / "docs" / "specs" / "loom-l1" / "loom-l1.json"


def test_vendored_schema_matches_docs_copy():
    """CON-3 / red-foreman pattern: the vendored schema must never drift."""
    vendored = Path(specpack.SCHEMA_PATH).read_bytes()
    assert hashlib.sha256(vendored).hexdigest() == hashlib.sha256(DOCS_SCHEMA.read_bytes()).hexdigest()


def test_examples_validate():
    for f in (EXAMPLE, L1):
        doc = json.loads(f.read_text())
        assert specpack.validate(doc) == [], f"{f.name}: {specpack.validate(doc)}"


def test_alignment_example_reports_honest_gaps_sorted():
    doc = json.loads(EXAMPLE.read_text())
    errs, cov = specpack.alignment(doc)
    assert errs == []
    assert cov["FR"]["FR-1"], "FR-1 covered"
    assert cov["FR"]["FR-2"] == [], "FR-2 is the recorded gap"
    assert cov["AC"]["AC-1"] and cov["AC"]["AC-2"]
    assert cov["DES"]["DES-3"] == [], "DES-3 is the recorded gap"


def _mutated(base, fn):
    doc = copy.deepcopy(base)
    fn(doc)
    return doc


def test_alignment_negatives_a1_to_a4():
    doc = json.loads(EXAMPLE.read_text())
    cases = [
        (lambda d: d["tasks"].append({**d["tasks"][0], "id": "T-1"}), "A1 duplicate ids"),
        (lambda d: d["tasks"][2]["needs"].append("T-99"), "A2 T-3.needs dangling: T-99"),
        (lambda d: d["tasks"][2].update(satisfies=["FR-99"]), "A2 T-3.satisfies dangling: FR-99"),
        (lambda d: d["plan"]["designs"][0]["addresses"].append("FR-99"), "A2 DES-1.addresses dangling: FR-99"),
        (lambda d: d["tasks"][1].update(needs=["T-2"]), "A3 needs cycle"),
        (lambda d: d["tasks"].append({
            "id": "T-9", "title": "unmoored", "phase": "polish", "status": "todo",
            "needs": [], "implements": [], "satisfies": [], "accepts": [], "honors": [],
            "verify": {"cmd": "true", "expect": "exit 0"}}), "A4 T-9 does not align"),
    ]
    for i, (fn, expect) in enumerate(cases):
        errs, _ = specpack.alignment(_mutated(doc, fn))
        assert any(expect in e for e in errs), f"case {i}: wanted '{expect}' in {errs}"


def test_a7_accepted_needs_human():
    doc = json.loads(EXAMPLE.read_text())
    doc["plan"]["decisions"][0]["accepted_by"] = "agent:pi"
    errs, _ = specpack.alignment(doc)
    assert any("A7 D-1" in e for e in errs), errs
    doc["plan"]["decisions"][0]["accepted_by"] = "human:owner"
    errs, _ = specpack.alignment(doc)
    assert not any("A7" in e for e in errs), errs


def test_slice_closure_and_determinism():
    doc = json.loads(EXAMPLE.read_text())
    a = specpack.slice_for(doc, "T-3")
    b = specpack.slice_for(doc, "T-3")
    assert a["slice_digest"] == b["slice_digest"]
    got = {i["id"] for i in a["items"]}
    # accepted decisions ride along (D-1, D-2); designs expand one hop (DES-2 -> CON-1)
    assert got == {
        "T-3", "T-2", "T-1", "DES-1", "DES-2", "DES-4", "FR-1",
        "AC-1", "AC-2", "CON-1", "CON-2", "D-1", "D-2",
    }, got
    assert a["omitted_tasks"] == ["T-4"]


def test_slice_full_bodies_not_one_liners():
    """FR-2 of the slice resolver: full node bodies, prereq produces and evidence."""
    doc = json.loads(EXAMPLE.read_text())
    sl = specpack.slice_for(doc, "T-3")
    items = {i["id"]: i for i in sl["items"]}
    # prereq task carries its full body, not a one-line summary
    t2 = items["T-2"]
    assert t2["family"] == "TASK" and t2["detail"] and t2["produces"] and t2["evidence"]
    # FR carries its own text and priority (full body)
    fr = items["FR-1"]
    assert fr["family"] == "FR" and fr["text"] and fr.get("priority")
    # decisions carry decision + because, not a flattened line
    d1 = items["D-1"]
    assert d1["family"] == "D" and d1["decision"] and d1["because"]


def test_slice_via_marker_names_the_serving_design():
    """AC-2: an FR reached through a design's addresses gains via = DES id."""
    doc = json.loads(EXAMPLE.read_text())
    sl = specpack.slice_for(doc, "T-3")
    items = {i["id"]: i for i in sl["items"]}
    # every design in the closure addresses FR-1; smallest id wins deterministically
    assert items["FR-1"].get("via") == "DES-1"
    # DES-2 also addresses CON-1 -> CON-1 carries via too
    assert items["CON-1"].get("via") == "DES-2"


def test_slice_expands_fr_not_directly_satisfied():
    """A design pulls in an FR the task never linked directly (the G3 fix)."""
    doc = json.loads(EXAMPLE.read_text())
    doc["spec"]["requirements"].append({"id": "FR-9", "text": "MUST also stream events", "priority": "P3"})
    doc["plan"]["designs"][3]["addresses"].append("FR-9")  # DES-4, implemented by T-3
    sl = specpack.slice_for(doc, "T-3")
    items = {i["id"]: i for i in sl["items"]}
    assert items["FR-9"]["text"] == "MUST also stream events"
    assert items["FR-9"]["via"] == "DES-4"


def test_slice_prelude_carries_approach_stack_env():
    doc = json.loads(EXAMPLE.read_text())
    sl = specpack.slice_for(doc, "T-3")
    assert sl["prelude"]["approach"] and sl["prelude"]["stack"]
    assert "env" not in sl["prelude"]  # example pack predates env
    doc["env"] = {"build": "mvn -q compile", "test": "mvn -q test"}
    sl2 = specpack.slice_for(doc, "T-3")
    assert sl2["prelude"]["env"]["build"] == "mvn -q compile"
    assert sl["slice_digest"] != sl2["slice_digest"]  # prelude is frozen context


def test_record_mrun_m_and_stall(tmp_path):
    """T-4 is history-free in the example (T-3 carries a prior FAIL row — the
    machine reads file history, so the stall walk uses a clean task)."""
    doc = json.loads(EXAMPLE.read_text())
    doc["tasks"][3]["status"] = "doing"
    with pytest.raises(LoomError, match="M_run = M"):
        specpack.record(doc, "T-4", "pass", [{"command": "x", "exit_code": 1}], doc.get("revision", 1), "t")
    specpack.record(doc, "T-4", "fail", [{"command": "x", "exit_code": 1}], doc.get("revision", 1), "t")
    assert _task_status(doc, "T-4") == "todo"
    doc["tasks"][3]["status"] = "doing"
    specpack.record(doc, "T-4", "fail", [{"command": "x", "exit_code": 1}], doc.get("revision", 1), "t")
    assert _task_status(doc, "T-4") == "blocked"
    specpack.record(doc, "T-4", "unblock", [], doc.get("revision", 1), "human")
    assert _task_status(doc, "T-4") == "todo"


def test_stale_writer_refused():
    doc = json.loads(EXAMPLE.read_text())
    doc["tasks"][3]["status"] = "doing"
    rev = doc.get("revision", 1)
    with pytest.raises(LoomError, match="stale writer"):
        specpack.record(doc, "T-4", "pass", [{"command": "x", "exit_code": 0}], rev - 1, "t")


def test_done_requires_zero_exit():
    doc = json.loads(EXAMPLE.read_text())
    doc["tasks"][3]["status"] = "doing"
    with pytest.raises(LoomError, match="M_run = M"):
        specpack.record(doc, "T-4", "pass", [{"command": "x", "exit_code": 0}, {"command": "y", "exit_code": 2}], doc.get("revision", 1), "t")


def _task_status(doc, tid):
    return next(t for t in doc["tasks"] if t["id"] == tid)["status"]


def test_coverage_context_section_reports_not_blocks():
    """FR-6: context completeness is coverage-tier, sorted, never a violation."""
    doc = json.loads(EXAMPLE.read_text())
    errs, cov = specpack.alignment(doc)
    assert errs == []  # context gaps never become violations
    assert cov["context"]["env_absent"] is True
    assert isinstance(cov["context"]["missing_touch"], list)


def test_coverage_context_fixture_exact():
    doc = {
        "spec": {
            "why": "f",
            "requirements": [{"id": "FR-1", "text": "r"}],
            "clarifications": [{"id": "Q-1", "question": "q", "status": "open"}, {"id": "Q-2", "question": "q", "status": "resolved"}],
        },
        "plan": {"decisions": [{"id": "D-1", "decision": "d", "because": "b", "status": "proposed"}]},
        "tasks": [
            {"id": "T-1", "title": "a", "verify": {"cmd": "true", "expect": "0"}, "status": "todo", "satisfies": ["FR-1"]},  # no detail, no touch
            {"id": "T-2", "title": "b", "detail": "d", "verify": {"cmd": "true", "expect": "0"}, "status": "doing", "satisfies": ["FR-1"],
             "context": {"touch": [{"path": "x"}], "notes": ["x" * 281]}},
            {"id": "T-3", "title": "c", "detail": "d", "verify": {"cmd": "true", "expect": "0"}, "status": "done", "satisfies": ["FR-1"]},  # done: not reported
        ],
    }
    errs, cov = specpack.alignment(doc)
    assert errs == []
    assert cov["context"]["missing_detail"] == ["T-1"]
    assert cov["context"]["missing_touch"] == ["T-1"]
    assert cov["context"]["long_notes"] == ["T-2"]
    assert cov["context"]["open_questions"] == ["Q-1"]  # open while work is active
    assert cov["context"]["env_absent"] is True
