"""Tests for fingerprints + anchor staleness (wave U2)."""

from __future__ import annotations

from okf_kit.core.fingerprints import (
    anchor_review,
    compute_fingerprints,
    read_fingerprints,
    write_fingerprints,
)


def _seed(tmp_path):
    # repo: code file + a concept page anchored to it + fingerprints at scan time
    (tmp_path / "src").mkdir(parents=True)
    (tmp_path / "src" / "mod.py").write_text("VALUE = 1\n")
    bundle = tmp_path / "wiki"
    bundle.mkdir()
    (bundle / "index.md").write_text("---\nokf_version: '0.2'\n---\n# b\n")
    (bundle / "domain").mkdir()
    (bundle / "domain" / "rule.md").write_text(
        "---\n"
        "type: BusinessRule\n"
        "title: r\n"
        "sources: [{ id: src, resource: src/mod.py }]\n"
        "---\n"
        "# Rule\n"
    )
    write_fingerprints(tmp_path, bundle)
    return bundle, read_fingerprints(bundle)


def test_fingerprints_roundtrip_and_untracked(tmp_path):
    bundle, fps = _seed(tmp_path)
    assert fps == {"src/mod.py": fps["src/mod.py"]}
    # a page anchored to an existing file never scanned → untracked
    (tmp_path / "src" / "other.py").write_text("Y = 1\n")
    (bundle / "domain" / "other.md").write_text(
        "---\ntype: Pattern\ntitle: o\nsources: [{ id: s, resource: src/other.py }]\n---\n# P\n"
    )
    # a page anchored to a file that does not exist at all → missing-file
    (bundle / "domain" / "gone.md").write_text(
        "---\ntype: Pattern\ntitle: g\nsources: [{ id: s, resource: src/gone.py }]\n---\n# P\n"
    )
    entries = {e["resource"]: e["verdict"] for e in anchor_review(bundle, tmp_path)}
    assert entries["src/mod.py"] == "current"
    assert entries["src/other.py"] == "untracked"
    assert entries["src/gone.py"] == "missing-file"


def test_anchor_flags_changed_source_as_needs_review(tmp_path):
    bundle, _ = _seed(tmp_path)
    # the source changes after the page was anchored
    (tmp_path / "src" / "mod.py").write_text("VALUE = 2\n")
    entries = anchor_review(bundle, tmp_path)
    changed = [e for e in entries if e["verdict"] == "changed"]
    assert len(changed) == 1
    assert changed[0]["page"] == "domain/rule"
    assert changed[0]["stored"] != changed[0]["current"]


def test_missing_file_verdict(tmp_path):
    bundle, _ = _seed(tmp_path)
    (tmp_path / "src" / "mod.py").unlink()
    entries = anchor_review(bundle, tmp_path)
    assert entries[0]["verdict"] == "missing-file"


def test_compute_fingerprints_skips_tests(tmp_path):
    (tmp_path / "src").mkdir(parents=True)
    (tmp_path / "src" / "a.py").write_text("X = 1\n")
    (tmp_path / "tests").mkdir()
    (tmp_path / "tests" / "t.py").write_text("Y = 2\n")
    fps = compute_fingerprints(tmp_path)
    assert list(fps) == ["src/a.py"]


def test_wiki_internal_anchors_are_not_code_staleness(tmp_path):
    bundle, _ = _seed(tmp_path)
    (bundle / "domain" / "meta.md").write_text(
        "---\ntype: Policy\ntitle: m\nsources: [{ id: s, resource: wiki/decisions/okf-only-engine.md }]\n---\n# P\n"
    )
    entries = {e["resource"]: e["verdict"] for e in anchor_review(bundle, tmp_path)}
    assert entries["wiki/decisions/okf-only-engine.md"] == "wiki-internal"
