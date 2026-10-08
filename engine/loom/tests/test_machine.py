"""Machine-level tests: transitions, fences, evidence rules, stall valve."""

from __future__ import annotations

import pytest

from loom_kit import machine
from loom_kit.spine import LoomError, new_spine, semantic_errors, validate_schema

PASS = [{"command": "true", "exit_code": 0, "evidence_level": "attested"}]
FAIL = [{"command": "false", "exit_code": 1, "evidence_level": "attested"}]


def fresh(tasks: int = 1) -> dict:
    doc = new_spine("t", "generic", "test")
    for i in range(tasks):
        machine.add_node(doc, f"t{i + 1}", "TASK", f"T{i + 1}", f"task {i + 1}", "test")
    return doc


def test_new_spine_validates_clean():
    doc = fresh()
    assert validate_schema(doc) == []
    assert semantic_errors(doc) == []


def test_pending_not_next_until_promoted():
    doc = fresh(1)
    out = machine.next_task(doc)
    assert out["status"] == "task" and out["task"] == "t1"
    assert doc["runtime"]["task_states"][0]["state"] == "RUNNING"


def test_requires_gates_readiness():
    doc = fresh(2)
    doc["relations"].append(
        {
            "relation_id": "r1",
            "kind": "requires",
            "from_ref": {"node_id": "t2", "revision": 1},
            "to_ref": {"node_id": "t1", "revision": 1},
            "epistemic_state": "DECLARED",
            "extensions": {},
            "revision": 1,
            "created_at": doc["created_at"],
            "created_by": "test",
        }
    )
    out = machine.next_task(doc)
    assert out["task"] == "t1"
    machine.record(doc, "t1", "pass", PASS, doc["revision"], "test")
    out = machine.next_task(doc)
    assert out["task"] == "t2"


def test_cycle_in_requires_detected():
    """A requires cycle injected into the data is caught by the invariants."""
    doc = fresh(2)
    ts = doc["created_at"]
    for rid, a, b in (("r1", "t1", "t2"), ("r2", "t2", "t1")):
        doc["relations"].append(
            {
                "relation_id": rid,
                "kind": "requires",
                "from_ref": {"node_id": a, "revision": 1},
                "to_ref": {"node_id": b, "revision": 1},
                "epistemic_state": "DECLARED",
                "extensions": {},
                "revision": 1,
                "created_at": ts,
                "created_by": "test",
            }
        )
    errs = semantic_errors(doc)
    assert any("cycle" in e for e in errs), errs


def test_dangling_requires_target_refused():
    doc = fresh(1)
    with pytest.raises(LoomError, match="unknown requires targets"):
        machine.add_node(doc, "tx", "TASK", "X", "x", "test", requires=["nope"])


def test_duplicate_node_refused():
    doc = fresh(1)
    with pytest.raises(LoomError):
        machine.add_node(doc, "t1", "TASK", "Dup", "d", "test")


def test_pass_requires_zero_exit():
    doc = fresh(1)
    machine.next_task(doc)
    with pytest.raises(LoomError, match="M_run = M"):
        machine.record(doc, "t1", "pass", [], doc["revision"], "test")
    with pytest.raises(LoomError, match="M_run = M"):
        machine.record(doc, "t1", "pass", FAIL, doc["revision"], "test")


def test_stale_writer_refused():
    doc = fresh(1)
    machine.next_task(doc)
    rev = doc["revision"]
    with pytest.raises(LoomError, match="stale writer"):
        machine.record(doc, "t1", "pass", PASS, rev - 1, "test")


def test_fail_then_pass_recovers():
    doc = fresh(1)
    machine.next_task(doc)
    machine.record(doc, "t1", "fail", FAIL, doc["revision"], "test")
    assert doc["runtime"]["task_states"][0]["state"] == "FAILED"
    out = machine.next_task(doc)
    assert out["task"] == "t1"  # retry allowed before the stall limit
    machine.record(doc, "t1", "pass", PASS, doc["revision"], "test")
    assert doc["runtime"]["task_states"][0]["state"] == "SUCCEEDED"


def test_stall_valve_blocks_with_upstream_chain():
    doc = fresh(2)
    doc["relations"].append(
        {
            "relation_id": "r1",
            "kind": "requires",
            "from_ref": {"node_id": "t2", "revision": 1},
            "to_ref": {"node_id": "t1", "revision": 1},
            "epistemic_state": "DECLARED",
            "extensions": {},
            "revision": 1,
            "created_at": doc["created_at"],
            "created_by": "test",
        }
    )
    machine.next_task(doc)
    machine.record(doc, "t1", "pass", PASS, doc["revision"], "test")
    machine.next_task(doc)
    machine.record(doc, "t2", "fail", FAIL, doc["revision"], "test")
    machine.next_task(doc)
    out = machine.record(doc, "t2", "fail", FAIL, doc["revision"], "test")
    assert out["state"] == "BLOCKED"
    assert out["escalation"]["upstream"] == ["t2", "t1"]
    # blocked is not handed out; human unblocks
    out = machine.next_task(doc)
    assert out["status"] == "BLOCKED"
    machine.record(doc, "t2", "unblock", [], doc["revision"], "human")
    assert doc["runtime"]["task_states"][1]["state"] == "READY"


def test_terminal_states_immutable():
    doc = fresh(1)
    machine.next_task(doc)
    machine.record(doc, "t1", "pass", PASS, doc["revision"], "test")
    with pytest.raises(LoomError, match="terminal"):
        machine.record(doc, "t1", "cancel", [], doc["revision"], "test")


def test_context_is_frozen_and_digested():
    doc = fresh(2)
    doc["relations"].append(
        {
            "relation_id": "r1",
            "kind": "requires",
            "from_ref": {"node_id": "t2", "revision": 1},
            "to_ref": {"node_id": "t1", "revision": 1},
            "epistemic_state": "DECLARED",
            "extensions": {},
            "revision": 1,
            "created_at": doc["created_at"],
            "created_by": "test",
        }
    )
    ctx = machine.compile_context(doc, "t2")
    again = machine.compile_context(doc, "t2")
    assert ctx["digest"] == again["digest"]
    assert {n["node_id"] for n in ctx["context"]["nodes"]} == {"t1", "t2"}
    assert ctx["context"]["requires_chain"] == ["t1"]


def test_unknown_profile_refused():
    from loom_kit.spine import LoomError as E

    with pytest.raises(E):
        new_spine("x", "warp", "test")


def test_running_task_with_zero_attempts_is_resumable():
    doc = fresh(1)
    out = machine.next_task(doc)  # t1 -> RUNNING, no attempts yet
    assert out["task"] == "t1"
    # a fresh worker (crash recovery) gets the same task handed out again
    out = machine.next_task(doc)
    assert out["status"] == "task" and out["task"] == "t1"
    # once work is recorded, the task is no longer handed out while RUNNING
    machine.record(doc, "t1", "fail", FAIL, doc["revision"], "test")
    out = machine.next_task(doc)
    assert out["task"] == "t1"  # FAILED is a retry, not a resume


def test_unblock_round_trips_through_load(tmp_path):
    """Regression: unblock used to leave escalation=null, which failed the schema on reload."""
    from loom_kit.spine import load, save

    doc = fresh(1)
    d = tmp_path
    save(doc, d / "sdd.json")
    doc, path = load(d)
    machine.next_task(doc)
    machine.record(doc, "t1", "fail", FAIL, doc["revision"], "test")
    machine.next_task(doc)
    out = machine.record(doc, "t1", "fail", FAIL, doc["revision"], "test")
    assert out["state"] == "BLOCKED"
    save(doc, path)
    doc, _ = load(d)  # blocked state validates
    machine.record(doc, "t1", "unblock", [], doc["revision"], "human")
    save(doc, path)
    doc, _ = load(d)  # unblocked state must validate too (escalation fully removed)
    assert doc["runtime"]["task_states"][0]["state"] == "READY"
    assert "escalation" not in doc["runtime"]["task_states"][0]


# --- red-foreman findings 1/4/6: validator negative table + fail-closed ---


def _mutated(base, fn):
    import copy

    doc = copy.deepcopy(base)
    fn(doc)
    return doc


def test_validator_negative_table():
    """Table-driven invalid documents, each asserting the error appears."""
    from loom_kit.spine import validate_schema

    base = fresh(1)
    cases = [
        # red-foreman BLOCKER 1: artifacts entries must actually validate
        (lambda d: d["artifacts"].__setitem__("spec", {}), "missing required 'path'"),
        (lambda d: d["artifacts"]["spec"].__setitem__("path", 42), "expected string"),
        (lambda d: d["artifacts"]["spec"].__setitem__("hax", True), "unknown key 'hax'"),
        (lambda d: d.__setitem__("warp", True), "unknown key 'warp'"),
        (lambda d: d["nodes"][0].__setitem__("kind", "WARP"), "not in enum"),
        (lambda d: d["nodes"][0].__setitem__("revision", 0), "below minimum"),
        (lambda d: d["nodes"][0].__setitem__("title", ""), "too short"),
        (lambda d: d["extensions"].__setitem__("bad", {"version": "0.1.0", "data": {}}), "unknown key"),
        (lambda d: d["runtime"]["task_states"][0].__setitem__("state", "WARP"), "not in enum"),
    ]
    for i, (mutate, expect) in enumerate(cases):
        errs = validate_schema(_mutated(base, mutate))
        assert errs, f"case {i}: expected errors, got none"
        assert any(expect in e for e in errs), f"case {i}: wanted '{expect}' in {errs}"


def test_validator_fail_closed_on_unsupported_keyword():
    """A schema keyword the validator does not implement must error, not silently pass."""
    from loom_kit.spine import MiniValidator

    v = MiniValidator({"type": "object", "oneOf": []})
    errs = v.validate({"a": 1})
    assert any("not supported" in e for e in errs), errs


def test_schema_ships_inside_the_package():
    """red-foreman DEFECT 2: an installed wheel must find the schema."""
    from loom_kit import spine as sp

    assert sp.SCHEMA_PATH.exists(), sp.SCHEMA_PATH
    assert "loom_kit" in str(sp.SCHEMA_PATH)


def test_save_is_atomic_and_leaves_no_tmp(tmp_path):
    """red-foreman DEFECT 3: a mid-write crash must not destroy the spine."""
    import json as _json

    from loom_kit.spine import new_spine, save

    d = tmp_path / "sdd.json"
    doc = new_spine("atomic", "generic", "test")
    save(doc, d)
    good = d.read_text()

    original = _json.dump

    def boom(*a, **k):
        raise OSError("disk full mid-write")

    import loom_kit.spine as sp

    sp.json.dump = boom
    try:
        try:
            save(doc, d)
        except OSError:
            pass
    finally:
        sp.json.dump = original
    assert d.read_text() == good  # original content intact
    assert not list(d.parent.glob("*.tmp"))
