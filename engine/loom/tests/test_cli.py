"""CLI end-to-end tests through argparse main()."""

from __future__ import annotations

from pathlib import Path

import pytest

from loom_kit.cli import main
from loom_kit.spine import LoomError, load


@pytest.fixture()
def ws(tmp_path: Path) -> Path:
    d = tmp_path / "initiative"
    assert main(["init", str(d), "--spine-id", "demo", "--profile", "pi", "--by", "human:owner"]) == 0
    return d


def test_init_scaffolds_artifacts(ws: Path):
    assert (ws / "sdd.json").exists()
    for name in ("spec.md", "plan.md", "review.md"):
        assert (ws / name).exists()
    doc, _ = load(ws)
    assert doc["profile"] == "pi"
    assert set(doc["artifacts"]) >= {"spec", "plan"}


def test_add_validate_next_record_cycle(ws: Path):
    assert main(["add", str(ws), "--id", "t1", "--title", "First", "--text", "first task", "--by", "human:owner"]) == 0
    assert (
        main(
            [
                "add", str(ws), "--id", "t2", "--title", "Second", "--text", "needs t1",
                "--requires", "t1", "--artifact", 'plan#Tasks', "--by", "human:owner",
            ]
        )
        == 0
    )
    assert main(["validate", str(ws)]) == 0
    assert main(["next", str(ws)]) == 0
    doc, _ = load(ws)
    rev = doc["revision"]
    assert main(["record", str(ws), "--task", "t1", "--result", "pass", "--cmd", "pytest -q", "--exit", "0", "--expected-revision", str(rev)]) == 0
    # next hands t2 only after t1 succeeded
    assert main(["next", str(ws)]) == 0
    doc, _ = load(ws)
    states = {t["task_id"]: t["state"] for t in doc["runtime"]["task_states"]}
    assert states == {"t1": "SUCCEEDED", "t2": "RUNNING"}


def test_record_refuses_without_evidence(ws: Path):
    main(["add", str(ws), "--id", "t1", "--title", "First", "--text", "x"])
    main(["next", str(ws)])
    doc, _ = load(ws)
    rc = main(["record", str(ws), "--task", "t1", "--result", "pass", "--expected-revision", str(doc["revision"])])
    assert rc == 1  # REFUSED: no evidence


def test_status_and_json_next(ws: Path):
    main(["add", str(ws), "--id", "t1", "--title", "First", "--text", "x"])
    rc = main(["next", str(ws), "--json"])
    assert rc == 0
    assert main(["status", str(ws)]) == 0


def test_double_init_refused(ws: Path):
    # the CLI converts refusals into exit code 1 + a REFUSED line on stderr
    assert main(["init", str(ws)]) == 1


def test_bad_spine_rejected(ws: Path):
    import json

    p = ws / "sdd.json"
    doc = json.loads(p.read_text())
    doc["nodes"].append({**doc["nodes"][0]} if doc["nodes"] else {})  # force something odd
    doc["nodes"][-1]["kind"] = "WARP"
    p.write_text(json.dumps(doc))
    rc = main(["validate", str(ws)])
    assert rc == 1
