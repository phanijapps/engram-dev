"""spec-library T-1: the markdown pipeline (FR-4, DES-2, D-1)."""

from __future__ import annotations

import json
from pathlib import Path
import urllib.request

from loom_kit.web.library import LibraryServer

WEB = Path(__file__).resolve().parents[1] / "src" / "loom_kit" / "web"


def _get(url: str):
    try:
        with urllib.request.urlopen(url) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def _pack(d: Path, name: str = "p"):
    (d / name).mkdir()
    (d / name / f"{name}.json").write_text(json.dumps({
        "format": "specpack/0.3", "name": name, "title": "T",
        "spec": {"why": "w", "requirements": [], "clarifications": []},
        "plan": {"decisions": []}, "tasks": []}))
    (d / name / "brief.md").write_text("# Brief\n\n| a | b |\n|---|---|\n| 1 | 2 |\n")


def test_marked_is_vendored():
    """D-1: the renderer ships in-tree — no CDN at runtime (CON-2)."""
    src = (WEB / "marked.min.js").read_text()
    assert len(src) > 20000
    assert "marked" in src


def test_artifact_serves_markdown(tmp_path: Path):
    d = tmp_path / "specs"
    d.mkdir()
    _pack(d)
    (d / "p" / "research.md").write_text("## Research\n\nsome *words*")
    srv = LibraryServer(d).start()
    try:
        code, body = _get(srv.url + "artifact/p/brief.md")
        assert code == 200 and b"| a | b |" in body
        code, body = _get(srv.url + "artifact/p/research.md")
        assert code == 200 and b"*words*" in body
    finally:
        srv.shutdown()


def test_artifact_guards_the_path(tmp_path: Path):
    """FR-11 posture: only .md, only inside the spec's folder."""
    d = tmp_path / "specs"
    d.mkdir()
    _pack(d)
    (d / "p" / "notes.txt").write_text("no")
    secret = tmp_path / "outside.md"
    secret.write_text("secret")
    srv = LibraryServer(d).start()
    try:
        for bad in ("artifact/p/notes.txt",            # not markdown
                    "artifact/p/missing.md",           # absent
                    "artifact/p/..%2Foutside.md",      # traversal, encoded
                    "artifact/nope/brief.md"):         # unknown spec
            code, _ = _get(srv.url + bad)
            assert code == 404, bad
    finally:
        srv.shutdown()
