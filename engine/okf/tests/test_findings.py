"""Contract tests for the findings ledger (ported from the former control plane)."""

from __future__ import annotations

from pathlib import Path

import pytest

from okf_kit.core.findings import (
    FindingsError,
    findings_path,
    list_findings,
    propose_finding,
    resolve_finding,
)


def test_findings_path_lives_in_bundle_state_dir(tmp_path: Path):
    assert findings_path(tmp_path / "wiki") == tmp_path / "wiki" / ".okf" / "findings.toml"


def test_propose_is_deduped_per_source_destination_kind(tmp_path: Path):
    bundle = tmp_path / "wiki"
    first = propose_finding("a.md", "wiki/x.md", "golden-path", rationale="r1", bundle=bundle)
    second = propose_finding("a.md", "wiki/x.md", "golden-path", rationale="r2", bundle=bundle)
    assert first["deduped"] is False and first["status"] == "pending"
    assert second["deduped"] is True
    # different kind at same destination = different key
    third = propose_finding("a.md", "wiki/x.md", "constraint", bundle=bundle)
    assert third["deduped"] is False


def test_declined_keys_refuse_new_proposals(tmp_path: Path):
    bundle = tmp_path / "wiki"
    finding = propose_finding("s.md", "wiki/y.md", "golden-path", bundle=bundle)
    resolve_finding(finding["id"], decision="declined", bundle=bundle)
    again = propose_finding("s.md", "wiki/y.md", "golden-path", rationale="new evidence", bundle=bundle)
    assert again["refused"] is True
    assert again["status"] == "declined"


def test_resolve_is_terminal_and_validated(tmp_path: Path):
    bundle = tmp_path / "wiki"
    finding = propose_finding("s.md", "wiki/z.md", "golden-path", bundle=bundle)
    resolved = resolve_finding(finding["id"], decision="accepted", bundle=bundle)
    assert resolved["status"] == "accepted" and resolved["resolved_at"]
    with pytest.raises(FindingsError):
        resolve_finding(finding["id"], decision="declined", bundle=bundle)
    with pytest.raises(FindingsError):
        resolve_finding("nope-0000", decision="accepted", bundle=bundle)
    with pytest.raises(FindingsError):
        resolve_finding(finding["id"], decision="maybe", bundle=bundle)


def test_list_filters_by_status(tmp_path: Path):
    bundle = tmp_path / "wiki"
    propose_finding("s.md", "wiki/a.md", "golden-path", bundle=bundle)
    f2 = propose_finding("s.md", "wiki/b.md", "constraint", bundle=bundle)
    resolve_finding(f2["id"], decision="accepted", bundle=bundle)
    assert len(list_findings(bundle=bundle)) == 2
    pending = list_findings(status="pending", bundle=bundle)
    accepted = list_findings(status="accepted", bundle=bundle)
    assert [f["kind"] for f in pending] == ["golden-path"]
    assert [f["kind"] for f in accepted] == ["constraint"]
    with pytest.raises(FindingsError):
        list_findings(status="bogus", bundle=bundle)
