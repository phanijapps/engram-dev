"""Layout tests (spec-layout FR-1, FR-2, FR-3, FR-5; AC-1, AC-2)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from loom_kit import specpack
from loom_kit.cli import main
from loom_kit.spine import LoomError


def _pack():
    return {
        "format": "specpack/0.3", "name": "lay", "title": "Layout",
        "artifacts": {"research": {"file": "r.md", "type": "text/markdown", "description": "d", "sha256": "a" * 64}},
        "spec": {"why": "w", "requirements": [{"id": "FR-1", "text": "r", "priority": "P1"}], "clarifications": []},
        "plan": {"decisions": [{"id": "D-1", "decision": "d", "because": "b", "status": "accepted", "accepted_by": "human:owner"}]},
        "tasks": [{"id": "T-1", "title": "one", "detail": "d", "satisfies": ["FR-1"],
                   "verify": {"cmd": "true", "expect": "0"}, "status": "todo"}],
    }


def test_save_emits_canonical_order(tmp_path: Path):
    d = tmp_path / "p"
    d.mkdir()
    (d / "p.json").write_text(json.dumps(_pack()))
    doc, path = specpack.load_specpack(d)
    doc["created"] = "2026-10-09"
    specpack.save(doc, path)
    keys = list(json.loads(path.read_text()).keys())
    assert keys == ["id", "name", "description", "date", "status", "metadata", "spec", "design", "tasks", "format", "revision"], keys


def test_save_writes_header_groups(tmp_path: Path):
    d = tmp_path / "p"
    d.mkdir()
    (d / "p.json").write_text(json.dumps(_pack()))
    doc, path = specpack.load_specpack(d)
    specpack.save(doc, path)
    on_disk = json.loads(path.read_text())
    assert on_disk["id"] == "lay"
    assert on_disk["description"] == "Layout"
    assert on_disk["date"]["updated"]  # machine-stamped (D-3)
    assert on_disk["status"]["lifecycle"] == "active"
    assert on_disk["status"]["deliverable"] == "drafted"
    assert on_disk["metadata"]["research"]["ref"] == "r.md"  # artifacts generalized (D-5)
    assert on_disk["metadata"]["research"]["sha256"] == "a" * 64
    assert on_disk["design"]["decisions"]  # plan renamed


def test_dual_read_roundtrip(tmp_path: Path):
    """Old layout loads to the internal model; saving emits the new layout."""
    d = tmp_path / "p"
    d.mkdir()
    (d / "p.json").write_text(json.dumps(_pack()))
    doc, _ = specpack.load_specpack(d)
    assert doc["plan"]["decisions"] and doc["artifacts"]["research"]["file"] == "r.md"
    assert doc["status"] == "active"


def test_new_layout_loads_through_normalizer(tmp_path: Path):
    d = tmp_path / "p"
    d.mkdir()
    (d / "p.json").write_text(json.dumps(_pack()))
    # emit a new-layout file, then reload through the normalizer
    internal, _ = specpack.load_specpack(d)
    specpack.save(internal, d / "p.json")
    again, _ = specpack.load_specpack(d)
    assert again["plan"]["decisions"]
    assert again["artifacts"]["research"]["file"] == "r.md"
    assert again["deliverable"] == "drafted"


def test_deliverable_checksum_through_status_group(tmp_path: Path):
    d = tmp_path / "p"
    d.mkdir()
    internal, _ = specpack.load_specpack(d) if (d / "p.json").exists() else ({}, None)
    (d / "p.json").write_text(json.dumps(_pack()))
    doc, _ = specpack.load_specpack(d)
    specpack.save(doc, d / "p.json")
    on_disk = json.loads((d / "p.json").read_text())
    on_disk["status"]["deliverable"] = "in_review"  # a hand-edited lie
    (d / "p.json").write_text(json.dumps(on_disk))
    with pytest.raises(LoomError, match="deliverable stage mismatch"):
        specpack.load_specpack(d)


def test_frozen_old_file_bytes_untouched(tmp_path: Path):
    """AC-2: reading an old-layout file never rewrites it."""
    d = tmp_path / "p"
    d.mkdir()
    raw = json.dumps(_pack(), indent=2, sort_keys=True) + "\n"
    (d / "p.json").write_text(raw)
    before = (d / "p.json").read_bytes()
    specpack.load_specpack(d)
    assert (d / "p.json").read_bytes() == before


def test_metadata_accepts_generic_links(tmp_path: Path, capsys):
    """FR-5: jira/confluence-style entries register and load."""
    d = tmp_path / "p"
    d.mkdir()
    (d / "p.json").write_text(json.dumps(_pack()))
    doc, _ = specpack.load_specpack(d)
    doc["artifacts"]["jira"] = {"file": "https://x.atlassian.net/browse/PROJ-1", "type": "link", "description": "tracking"}
    specpack.save(doc, d / "p.json")
    on_disk = json.loads((d / "p.json").read_text())
    assert on_disk["metadata"]["jira"]["ref"].startswith("https://")
    again, _ = specpack.load_specpack(d)
    assert again["artifacts"]["jira"]["file"].startswith("https://")


def test_schema_accepts_both_layouts(tmp_path: Path):
    """Old flat files and new canonical files both validate."""
    d = tmp_path / "p"
    d.mkdir()
    (d / "p.json").write_text(json.dumps(_pack()))
    doc, path = specpack.load_specpack(d)
    assert specpack.validate(doc, path) == []  # internal (old-shape) validates as oldRoot
    specpack.save(doc, path)
    raw = json.loads(path.read_text())
    assert specpack.validate(raw, path) == []  # emitted file validates as newRoot


def test_schema_accepts_generic_metadata_links():
    doc = _pack()
    doc["artifacts"]["jira"] = {"file": "https://x/browse/PROJ-1", "type": "link"}
    assert specpack.validate(doc) == []
