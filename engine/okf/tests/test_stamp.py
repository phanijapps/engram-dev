"""Tests for the freshness stamp (wiki trust contract, okf-only T2)."""

from __future__ import annotations

import json

from okf_kit.core.stamp import STAMP_DIRNAME, STAMP_FILENAME, write_freshness_stamp


def test_write_freshness_stamp_roundtrip(tmp_path):
    bundle = tmp_path / "wiki"
    bundle.mkdir()

    path = write_freshness_stamp(bundle, tmp_path, written=1, updated=2, skipped=3)

    assert path == bundle / STAMP_DIRNAME / STAMP_FILENAME
    data = json.loads(path.read_text())
    assert data["repo_head"] == "unknown"  # tmp_path is not a git repo
    assert data["repo_root"] == str(tmp_path)
    assert data["written"] == 1
    assert data["updated"] == 2
    assert data["skipped"] == 3
    assert data["indexed_at"].endswith("Z")


def test_write_freshness_stamp_reports_git_head_when_available(tmp_path):
    import subprocess

    bundle = tmp_path / "wiki"
    bundle.mkdir()
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "--allow-empty", "-qm", "init"], cwd=tmp_path, check=True)

    path = write_freshness_stamp(bundle, tmp_path, written=0, updated=0, skipped=0)

    data = json.loads(path.read_text())
    head = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=tmp_path, capture_output=True, text=True, check=True
    ).stdout.strip()
    assert data["repo_head"] == head
