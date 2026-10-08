"""Specpack CLI e2e: check / next / record / status through main()."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import pytest

from loom_kit.cli import main
from loom_kit.spine import LoomError

REPO = Path(__file__).resolve().parents[3]
EXAMPLE = REPO / "docs" / "specs" / "spec-graph" / "example-add-todo.specpack.json"


@pytest.fixture()
def ws(tmp_path: Path) -> Path:
    d = tmp_path / "todo-api"
    d.mkdir()
    shutil.copy(EXAMPLE, d / "todo-api.json")
    return d


def _rev(ws: Path) -> int:
    return json.loads((ws / "todo-api.json").read_text()).get("revision", 1)


def test_check_reports_gaps_and_exits_zero(ws: Path):
    assert main(["check", str(ws)]) == 0  # FR-2/DES-3 gaps are report-only


def test_check_invalid_specpack_exits_one(ws: Path):
    p = ws / "todo-api.json"
    doc = json.loads(p.read_text())
    doc["tasks"][2]["needs"].append("T-99")
    p.write_text(json.dumps(doc))
    assert main(["check", str(ws)]) == 1


def test_next_record_loop_to_done(ws: Path):
    # shipped history: T-3 is doing with a prior FAIL row — one more fail stalls it
    assert main(["next", str(ws)]) == 0  # resumes T-3
    assert main(["record", str(ws), "--task", "T-3", "--result", "fail",
                 "--cmd", "mvn -q test", "--exit", "1", "--expected-revision", str(_rev(ws))]) == 0
    assert main(["next", str(ws)]) == 2  # BLOCKED (prior FAIL + this one = stall)
    assert main(["record", str(ws), "--task", "T-3", "--result", "unblock",
                 "--expected-revision", str(_rev(ws))]) == 0
    assert main(["next", str(ws)]) == 0  # human unblocked → resume
    assert main(["record", str(ws), "--task", "T-3", "--result", "pass",
                 "--cmd", "mvn -q test", "--exit", "0", "--expected-revision", str(_rev(ws))]) == 0
    assert main(["next", str(ws)]) == 0  # T-4
    assert main(["record", str(ws), "--task", "T-4", "--result", "pass",
                 "--cmd", "mvn -q test", "--exit", "0", "--expected-revision", str(_rev(ws))]) == 0
    assert main(["next", str(ws)]) == 2  # needs_closure: shipped example keeps Q-2 open
    p = ws / "todo-api.json"
    doc = json.loads(p.read_text())
    q2 = next(q for q in doc["spec"]["clarifications"] if q["id"] == "Q-2")
    q2["status"] = "resolved"
    q2["answer"] = "resolved in the follow-up initiative"
    p.write_text(json.dumps(doc))
    assert main(["next", str(ws)]) == 0  # DONE once the owner work closes
    doc = json.loads((ws / "todo-api.json").read_text())
    assert {t["id"]: t["status"] for t in doc["tasks"]} == {
        "T-1": "done", "T-2": "done", "T-3": "done", "T-4": "done"}


def test_two_fails_block_then_unblock(ws: Path):
    assert main(["next", str(ws)]) == 0
    rev = _rev(ws)
    main(["record", str(ws), "--task", "T-3", "--result", "fail",
          "--cmd", "x", "--exit", "1", "--expected-revision", str(rev)])
    main(["next", str(ws)])
    main(["record", str(ws), "--task", "T-3", "--result", "fail",
          "--cmd", "x", "--exit", "1", "--expected-revision", str(_rev(ws))])
    assert main(["next", str(ws)]) == 2  # BLOCKED
    assert main(["record", str(ws), "--task", "T-3", "--result", "unblock",
                 "--expected-revision", str(_rev(ws))]) == 0


def test_record_refused_without_evidence(ws: Path):
    main(["next", str(ws)])
    rc = main(["record", str(ws), "--task", "T-3", "--result", "pass",
               "--expected-revision", str(_rev(ws))])
    assert rc == 1  # the CLI converts the refusal to exit 1


def test_legacy_spine_dir_still_routes_to_legacy(tmp_path: Path, capsys):
    (tmp_path / "sdd.json").write_text("{}")  # presence flips mode; the empty spine fails schema validation
    assert main(["next", str(tmp_path)]) == 1
    # the legacy loader's message proves the legacy branch was taken
    assert "schema violations" in capsys.readouterr().err


def test_next_renders_steps_env_and_context(tmp_path: Path, capsys):
    """FR-5: the human handout prints verify steps, env, and the context block."""
    import hashlib
    d = tmp_path / "ctx-pack"
    d.mkdir()
    (d / "src").mkdir()
    (d / "src" / "thing.py").write_bytes(b"v1\n")
    pack = {
        "format": "specpack/0.3",
        "name": "render-fixture",
        "title": "Render fixture",
        "env": {"build": "uv sync", "test": "uv run pytest -q", "toolchain": "Python 3.12"},
        "spec": {"why": "f", "requirements": [{"id": "FR-1", "text": "r", "priority": "P1"}]},
        "plan": {"approach": "render it", "stack": {"language": "Python"}, "decisions": [{"id": "D-1", "decision": "d", "because": "b", "status": "proposed"}]},
        "tasks": [{
            "id": "T-1", "title": "Rendered", "detail": "d", "satisfies": ["FR-1"],
            "verify": {"cmd": "true", "expect": "exit 0", "steps": [{"run": "echo ok", "expect_exit": 0, "expect_contains": "ok"}]},
            "status": "todo",
            "context": {
                "touch": [{"path": "src/thing.py", "why": "in scope"}],
                "read": [{"path": "pyproject.toml", "why": "toolchain"}],
                "wiki": ["systems/loom-engine.md"],
                "links": [{"url": "https://example.org/p", "why": "pattern"}, {"url": "docs/r.md", "why": "r", "sha256": hashlib.sha256(b"x").hexdigest()}],
                "notes": ["watch the flaky test"],
                "commands": [{"cmd": "uv run pytest -q", "expect_exit": 0}],
            },
        }],
    }
    (d / "pack.json").write_text(json.dumps(pack))
    assert main(["next", str(d)]) == 0
    out = capsys.readouterr().out
    assert 'step 1: echo ok  [exit 0]  contains \'ok\'' in out
    assert "env:" in out and "uv sync" in out
    assert "touch: src/thing.py" in out
    assert "read: pyproject.toml" in out
    assert "wiki: systems/loom-engine.md" in out
    assert "link: https://example.org/p (advisory)" in out
    assert "link: docs/r.md (pinned)" in out
    assert "note: watch the flaky test" in out
    assert "cmd: uv run pytest -q" in out


def test_check_prints_context_coverage_lines(ws: Path, capsys):
    """FR-6: loom check prints the context section, exit stays 0."""
    p = ws / "todo-api.json"
    doc = json.loads(p.read_text())
    doc["spec"]["clarifications"] = [{"id": "Q-1", "question": "ship?", "status": "open"}]
    doc["tasks"][3]["status"] = "todo"  # an active task with no context block
    p.write_text(json.dumps(doc))
    assert main(["check", str(ws)]) == 0
    out = capsys.readouterr().out
    assert "context: env block absent" in out
    assert "context: touch missing: T-3, T-4" in out
    assert "context: detail missing" not in out  # T-4 has detail
    assert "context: open questions: Q-1" in out  # test replaced clarifications, so only Q-1 exists


def test_next_renders_ac_and_us_lines(ws: Path, capsys):
    """DEFECT-3 fix: AC and US must render, not print empty labels."""
    assert main(["next", str(ws)]) == 0  # example pack: T-4 hands out with AC-1..AC-4 in slice
    out = capsys.readouterr().out
    assert "Given" in out and "/ When" in out and "/ Then" in out
