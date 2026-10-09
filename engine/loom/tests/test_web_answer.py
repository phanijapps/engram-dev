"""spec-library T-5: acting in place (FR-12, DES-7, Q-1, D-4)."""

from __future__ import annotations

import json
from pathlib import Path
import urllib.request

from loom_kit.web.library import LibraryServer

JS = (Path(__file__).resolve().parents[1] / "src" / "loom_kit" / "web" / "library.js").read_text()


def _post(url: str, body: dict):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def _pack(d: Path, name: str = "p"):
    (d / name).mkdir()
    (d / name / f"{name}.json").write_text(json.dumps({
        "format": "specpack/0.3", "name": name, "title": "T",
        "spec": {"why": "w", "requirements": [],
                 "clarifications": [{"id": "Q-1", "question": "q?", "status": "open", "owner": "human:owner",
                                     "kind": "choice", "options": ["a", "b"], "default": "a"}]},
        "plan": {"decisions": []}, "tasks": []}))


def test_answer_and_approve_through_the_library(tmp_path: Path):
    """Q-1: the full ceremony from the standing surface."""
    d = tmp_path / "specs"
    d.mkdir()
    _pack(d)
    srv = LibraryServer(d).start()
    try:
        code, out = _post(srv.url + "event/p", {"kind": "choice", "q": "Q-1", "option": "b", "text": "b"})
        assert code == 200 and out["ok"] is True
        code, out = _post(srv.url + "event/p", {"kind": "approve"})
        assert code == 200 and out["ok"] is True
        with urllib.request.urlopen(srv.url + "spec/p") as r:
            doc = json.loads(r.read())
        q = doc["spec"]["clarifications"][0]
        assert q["answer"] == "b" and q["answered_by"] == "human:owner"
        assert doc["date"]["approved"]["by"] == "human:owner"
    finally:
        srv.shutdown()


def test_refusals_are_400_json(tmp_path: Path):
    d = tmp_path / "specs"
    d.mkdir()
    _pack(d)
    srv = LibraryServer(d).start()
    try:
        code, out = _post(srv.url + "event/p", {"kind": "choice", "q": "Q-1", "option": "banana", "text": "banana"})
        assert code == 400 and out["ok"] is False and "options" in out["error"]
        code, out = _post(srv.url + "event/p", {"kind": "answer", "q": "Q-9", "text": "x"})
        assert code == 400
        code, out = _post(srv.url + "event/ghost", {"kind": "approve"})
        assert code == 404
    finally:
        srv.shutdown()


def test_page_wires_the_acts():
    """The UI offers options only (the machine guards choice), the honest
    unknown, and the double-click approve."""
    assert "data-choice" in JS and "data-unk" in JS and 'kind: "unknown"' in JS
    assert "data-opt" in JS and "picked" in JS  # default preselected (AC-13 pattern)
    assert "do-approve" in JS and "dataset.armed" in JS
    assert "/event/" in JS


def test_stateless_after_every_act():
    """D-6: re-fetch, never a cache."""
    assert "loadAll()" in JS
