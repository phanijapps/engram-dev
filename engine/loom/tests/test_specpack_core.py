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


def test_slice_closure_and_determinism():
    doc = json.loads(EXAMPLE.read_text())
    a = specpack.slice_for(doc, "T-3")
    b = specpack.slice_for(doc, "T-3")
    assert a["slice_digest"] == b["slice_digest"]
    got = {i["id"] for i in a["items"]}
    assert got == {"T-3", "T-2", "T-1", "DES-1", "DES-2", "DES-4", "FR-1", "AC-1", "AC-2", "CON-1", "CON-2"}, got
    assert a["omitted_tasks"] == ["T-4"]


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
