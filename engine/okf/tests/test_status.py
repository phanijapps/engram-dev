"""Tests for the bundle status command (Q5-R)."""

from __future__ import annotations

from okf_kit.core.status import bundle_status


def test_status_absent_bundle(tmp_path):
    s = bundle_status(tmp_path / "wiki", repo_root=tmp_path)
    assert s["present"] is False
    assert s["freshness"] == "absent"
    assert s["concept_count"] == 0


def test_status_fresh_bundle(tmp_path):
    import json
    import subprocess

    subprocess.run(["git", "init", "-q"], cwd=tmp_path, check=True)
    subprocess.run(
        ["git", "-c", "user.email=t@t", "-c", "user.name=t", "commit", "--allow-empty", "-qm", "init"],
        cwd=tmp_path, check=True,
    )
    bundle = tmp_path / "wiki"
    (bundle / ".okf").mkdir(parents=True)
    (bundle / "index.md").write_text("---\nokf_version: '0.2'\n---\n# b\n")
    (bundle / "code").mkdir()
    (bundle / "code" / "a.md").write_text("---\ntype: X\ntitle: a\n---\nbody\n")
    head = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=tmp_path, capture_output=True, text=True, check=True
    ).stdout.strip()
    (bundle / ".okf" / "last-index.json").write_text(
        json.dumps({"repo_head": head, "indexed_at": "2026-10-07T00:00:00Z"})
    )

    s = bundle_status(bundle, repo_root=tmp_path)
    assert s["present"] is True
    assert s["freshness"] == "fresh"
    assert s["okf_version"] == "0.2"
    assert s["concept_count"] == 1
    assert s["pending_findings"] == 0


def test_status_stale_when_head_moved(tmp_path):
    import json
    import subprocess

    subprocess.run(["git", "init", "-q"], cwd=tmp_path, check=True)
    subprocess.run(
        ["git", "-c", "user.email=t@t", "-c", "user.name=t", "commit", "--allow-empty", "-qm", "init"],
        cwd=tmp_path, check=True,
    )
    bundle = tmp_path / "wiki"
    (bundle / ".okf").mkdir(parents=True)
    (bundle / "index.md").write_text("---\nokf_version: '0.2'\n---\n# b\n")
    (bundle / ".okf" / "last-index.json").write_text(
        json.dumps({"repo_head": "0" * 40, "indexed_at": "2026-10-07T00:00:00Z"})
    )

    s = bundle_status(bundle, repo_root=tmp_path)
    assert s["freshness"] == "stale"
