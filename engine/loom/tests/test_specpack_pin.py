"""Specpack pin tests: pin at handout, needs_rebase on drift, rebase re-pins (T-3 / FR-3, AC-3)."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pytest

from loom_kit import specpack
from loom_kit.cli import main
from loom_kit.spine import LoomError


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _pack(touch: list[dict]) -> dict:
    return {
        "format": "specpack/0.3",
        "name": "pin-fixture",
        "title": "Pin fixture",
        "spec": {"why": "fixture", "requirements": [{"id": "FR-1", "text": "fixture req", "priority": "P1"}]},
        "plan": {"decisions": [{"id": "D-1", "decision": "d", "because": "b", "status": "proposed"}]},
        "tasks": [
            {
                "id": "T-1",
                "title": "Pinned task",
                "detail": "touch one file",
                "satisfies": ["FR-1"],
                "verify": {"cmd": "true", "expect": "exit 0"},
                "status": "todo",
                "context": {"touch": touch},
            }
        ],
    }


def _ws(tmp_path: Path, touch: list[dict], file_bytes: bytes | None, artifacts: dict | None = None, links: list[dict] | None = None) -> Path:
    d = tmp_path / "pin-pack"
    d.mkdir()
    if file_bytes is not None:
        (d / "src").mkdir()
        (d / "src" / "thing.py").write_bytes(file_bytes)
    pack = _pack(touch)
    if artifacts:
        pack["artifacts"] = artifacts
    if links:
        pack["tasks"][0]["context"]["links"] = links
    (d / "pack.json").write_text(json.dumps(pack))
    return d


def test_artifact_digest_mismatch_refuses_handout(tmp_path: Path):
    note = b"# design notes v1\n"
    good = _sha(b"# design notes v1 original\n")
    d = _ws(tmp_path, [], None, artifacts={"design": {"file": "notes.md", "type": "text/markdown", "sha256": good}})
    (d / "notes.md").write_bytes(note)
    doc, path = _load(d)
    out = specpack.next_task(doc, path)
    assert out["status"] == "needs_rebase"
    assert out["drift"][0]["why"] == "artifact-digest"
    assert out["drift"][0]["current"] == _sha(note)


def test_artifact_digest_match_passes(tmp_path: Path):
    note = b"# design notes\n"
    d = _ws(tmp_path, [], None, artifacts={"design": {"file": "notes.md", "type": "text/markdown", "sha256": _sha(note)}})
    (d / "notes.md").write_bytes(note)
    doc, path = _load(d)
    assert specpack.next_task(doc, path)["status"] == "task"


def test_artifact_missing_does_not_refuse(tmp_path: Path):
    """FR-4 refuses on mismatch only; a missing artifact is an incomplete pack."""
    d = _ws(tmp_path, [], None, artifacts={"design": {"file": "gone.md", "type": "text/markdown", "sha256": _sha(b"x")}})
    doc, path = _load(d)
    assert specpack.next_task(doc, path)["status"] == "task"


def test_local_link_digest_mismatch_refuses(tmp_path: Path):
    data = b"runbook v2\n"
    wrong = _sha(b"runbook v1\n")
    d = _ws(tmp_path, [], None, links=[{"url": "docs/runbook.md", "why": "deploy order", "sha256": wrong}])
    (d / "docs").mkdir()
    (d / "docs" / "runbook.md").write_bytes(data)
    doc, path = _load(d)
    out = specpack.next_task(doc, path)
    assert out["status"] == "needs_rebase"
    assert out["drift"][0]["why"] == "link-digest"


def test_local_link_missing_does_not_refuse(tmp_path: Path):
    d = _ws(tmp_path, [], None, links=[{"url": "docs/gone.md", "why": "order", "sha256": _sha(b"x")}])
    doc, path = _load(d)
    assert specpack.next_task(doc, path)["status"] == "task"


def test_remote_link_with_digest_passes_through(tmp_path: Path):
    """The machine cannot verify remote URLs; it must not refuse on them."""
    d = _ws(tmp_path, [], None, links=[{"url": "https://example.org/x", "why": "pattern", "sha256": _sha(b"irrelevant")}])
    doc, path = _load(d)
    assert specpack.next_task(doc, path)["status"] == "task"


def _load(d: Path) -> tuple[dict, Path]:
    doc, path = specpack.load_specpack(d)
    return doc, path


def test_first_handout_pins_existing_file(tmp_path: Path):
    data = b"print('v1')\n"
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope"}], data)
    doc, path = _load(d)
    rev = doc.get("revision", 1)
    out = specpack.next_task(doc, path)
    assert out["status"] == "task"
    entry = doc["tasks"][0]["context"]["touch"][0]
    assert entry["sha256"] == _sha(data)
    assert doc["tasks"][0]["status"] == "doing"
    assert doc["revision"] == rev + 1


def test_drift_refuses_and_leaves_state_untouched(tmp_path: Path):
    data = b"print('v2')\n"
    wrong = _sha(b"print('v1')\n")
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope", "sha256": wrong}], data)
    doc, path = _load(d)
    rev = doc.get("revision", 1)
    out = specpack.next_task(doc, path)
    assert out["status"] == "needs_rebase"
    assert out["task"] == "T-1"
    assert out["drift"] == [{"path": "src/thing.py", "why": "changed", "pinned": wrong, "current": _sha(data)}]
    assert doc["tasks"][0]["status"] == "todo"  # not handed out
    assert doc.get("revision", 1) == rev  # no bump
    # drift entries are sorted by path
    doc["tasks"][0]["context"]["touch"].append({"path": "src/aaa.py", "why": "x", "sha256": wrong})
    out2 = specpack.next_task(doc, path)
    assert [e["path"] for e in out2["drift"]] == ["src/aaa.py", "src/thing.py"]


def test_missing_pinned_file_refuses(tmp_path: Path):
    pinned = _sha(b"gone")
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope", "sha256": pinned}], None)
    doc, path = _load(d)
    out = specpack.next_task(doc, path)
    assert out["status"] == "needs_rebase"
    assert out["drift"][0]["why"] == "missing"


def test_absent_file_pins_on_first_sighting_resume_safe(tmp_path: Path):
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "created by this task"}], None)
    doc, path = _load(d)
    out = specpack.next_task(doc, path)
    assert out["status"] == "task"  # absent at first sight: no pin, no refusal
    assert "sha256" not in doc["tasks"][0]["context"]["touch"][0]
    # the task runs, creates the file, then fails; resuming must not refuse
    (d / "src").mkdir(exist_ok=True)
    (d / "src" / "thing.py").write_bytes(b"print('created')\n")
    doc["tasks"][0]["status"] = "todo"
    out2 = specpack.next_task(doc, path)
    assert out2["status"] == "task"
    assert doc["tasks"][0]["context"]["touch"][0]["sha256"] == _sha(b"print('created')\n")


def test_rebase_repins_to_current_truth(tmp_path: Path):
    data = b"print('v3')\n"
    stale = _sha(b"print('v1')\n")
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope", "sha256": stale}], data)
    doc, path = _load(d)
    rev = doc.get("revision", 1)
    out = specpack.rebase(doc, "T-1", path, approved_by="human:owner")
    assert out == {"task": "T-1", "repinned": ["src/thing.py"], "dropped": []}
    assert doc["tasks"][0]["context"]["touch"][0]["sha256"] == _sha(data)
    assert doc["revision"] == rev + 1
    assert specpack.next_task(doc, path)["status"] == "task"


def test_rebase_drops_pin_for_deleted_file(tmp_path: Path):
    stale = _sha(b"gone")
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope", "sha256": stale}], None)
    doc, path = _load(d)
    out = specpack.rebase(doc, "T-1", path, approved_by="human:owner")
    assert out["dropped"] == ["src/thing.py"]
    assert "sha256" not in doc["tasks"][0]["context"]["touch"][0]


def test_cli_next_needs_rebase_exit_two_with_drift(tmp_path: Path, capsys):
    data = b"print('v2')\n"
    wrong = _sha(b"print('v1')\n")
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope", "sha256": wrong}], data)
    assert main(["next", str(d)]) == 2
    assert "needs_rebase" in capsys.readouterr().out
    # refused handout persisted nothing: pack on disk keeps its original bytes
    doc = json.loads((d / "pack.json").read_text())
    assert doc["tasks"][0]["status"] == "todo" and doc.get("revision", 1) == 1


def test_cli_rebase_then_next_hands_out(tmp_path: Path, capsys):
    data = b"print('v2')\n"
    wrong = _sha(b"print('v1')\n")
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope", "sha256": wrong}], data)
    assert main(["next", str(d)]) == 2
    assert main(["rebase", str(d), "--task", "T-1", "--expected-revision", "1", "--approved-by", "human:owner"]) == 0
    capsys.readouterr()
    assert main(["next", str(d), "--json"]) == 0
    out = json.loads(capsys.readouterr().out)
    assert out["status"] == "task"
    assert json.loads((d / "pack.json").read_text())["tasks"][0]["status"] == "doing"


def test_cli_rebase_stale_writer_refused(tmp_path: Path, capsys):
    data = b"x"
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope"}], data)
    assert main(["rebase", str(d), "--task", "T-1", "--expected-revision", "99", "--approved-by", "human:owner"]) == 1
    assert "REFUSED" in capsys.readouterr().out


def test_rebase_also_repins_artifact_digests(tmp_path: Path):
    """DEFECT-2 fix: the printed remedy must cure the drift it names."""
    note = b"notes v2\n"
    stale = _sha(b"notes v1\n")
    d = _ws(tmp_path, [], None, artifacts={"design": {"file": "notes.md", "type": "text/markdown", "sha256": stale}})
    (d / "notes.md").write_bytes(note)
    doc, path = _load(d)
    assert specpack.next_task(doc, path)["status"] == "needs_rebase"
    out = specpack.rebase(doc, "T-1", path, approved_by="human:owner")
    assert out["repinned"] == ["notes.md"]
    assert specpack.next_task(doc, path)["status"] == "task"


def test_touch_paths_may_not_escape_root(tmp_path: Path):
    d = _ws(tmp_path, [{"path": "../outside.py", "why": "x"}], None)
    (tmp_path / "outside.py").write_bytes(b"secret")
    doc, path = _load(d)
    out = specpack.next_task(doc, path)
    assert out["status"] == "needs_rebase"
    assert out["drift"] == [{"path": "../outside.py", "why": "invalid-path"}]


def test_absolute_touch_path_refused(tmp_path: Path):
    d = _ws(tmp_path, [{"path": "/etc/passwd", "why": "x"}], None)
    doc, path = _load(d)
    out = specpack.next_task(doc, path)
    assert out["drift"][0]["why"] == "invalid-path"


def test_loader_refuses_unknown_format(tmp_path: Path):
    d = _ws(tmp_path, [], None)
    pj = d / "pack.json"
    doc = json.loads(pj.read_text())
    doc["format"] = "specpack/0.4"
    pj.write_text(json.dumps(doc))
    with pytest.raises(LoomError, match="unsupported format"):
        specpack.load_specpack(d)


def test_rebase_refuses_agent_approval(tmp_path):
    """D-7: the approval claim must name a human (shape check, A7-style)."""
    data = b"x"
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope"}], data)
    doc, path = _load(d)
    with pytest.raises(LoomError, match="owner approval"):
        specpack.rebase(doc, "T-1", path, approved_by="agent:pi")
    specpack.rebase(doc, "T-1", path, approved_by="human:owner")  # passes

def test_cli_rebase_requires_approved_by(tmp_path, capsys):
    data = b"x"
    d = _ws(tmp_path, [{"path": "src/thing.py", "why": "in scope"}], data)
    import pytest as _pytest
    with _pytest.raises(SystemExit):
        main(["rebase", str(d), "--task", "T-1", "--expected-revision", "1"])
