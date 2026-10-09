"""spec-library T-2: the list endpoint (FR-1, FR-11, DES-2, D-5)."""

from __future__ import annotations

import json
from pathlib import Path
import urllib.request

from loom_kit.web.library import LibraryServer, list_specs


def _get(url: str):
    try:
        with urllib.request.urlopen(url) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def _pack(d: Path, name: str, open_q: int = 0):
    (d / name).mkdir()
    qs = [{"id": f"Q-{i}", "question": "q", "status": "open", "owner": "human:owner"} for i in range(open_q)]
    (d / name / f"{name}.json").write_text(json.dumps({
        "format": "specpack/0.3", "name": name, "title": f"The {name} spec",
        "spec": {"why": "w", "requirements": [], "clarifications": qs},
        "plan": {"decisions": []}, "tasks": []}))


def test_list_specs_fail_soft(tmp_path: Path):
    d = tmp_path / "specs"
    d.mkdir()
    _pack(d, "alpha", open_q=2)
    _pack(d, "beta")
    (d / "legacy1").mkdir()
    (d / "legacy1" / "plan.md").write_text("old shape")
    (d / "broken").mkdir()
    (d / "broken" / "broken.json").write_text("{ not json")
    out = list_specs(d)
    names = [p["name"] for p in out["specs"]]
    assert names == ["alpha", "beta"]
    alpha = out["specs"][0]
    assert alpha["open_questions"] == 2 and alpha["stage"] in ("drafted", "planning", "awaiting_owner")
    by_name = {l["name"]: l for l in out["legacy"]}
    assert "legacy1" in by_name and "broken" in by_name
    assert by_name["legacy1"]["files"] == ["plan.md"]


def test_endpoint_serves_the_list(tmp_path: Path):
    d = tmp_path / "specs"
    d.mkdir()
    _pack(d, "alpha")
    srv = LibraryServer(d).start()
    try:
        code, body = _get(srv.url + "specs")
        out = json.loads(body)
        assert code == 200 and out["specs"][0]["name"] == "alpha"
        code, body = _get(srv.url + "spec/alpha")
        assert code == 200 and json.loads(body)["name"] == "alpha"
        code, body = _get(srv.url + "spec/missing")
        assert code == 404
    finally:
        srv.shutdown()


def test_real_docs_specs_loads(tmp_path: Path):
    """The actual repo root: five frozen packs + this wave, legacy listed."""
    root = Path(__file__).resolve().parents[3] / "docs" / "specs"
    out = list_specs(root)
    names = {p["name"] for p in out["specs"]}
    assert {"spec-web", "spec-library"} <= names
    assert any(l["name"] == "spec-graph" for l in out["legacy"])
