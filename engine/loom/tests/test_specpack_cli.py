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
    assert main(["next", str(ws)]) == 0  # DONE
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
