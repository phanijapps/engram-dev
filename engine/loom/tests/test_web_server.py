"""The harness adapter end-to-end (spec-web T-5; FR-7; AC-7, AC-9, AC-8)."""

from __future__ import annotations

import json
import urllib.request
from pathlib import Path

from loom_kit import events
from loom_kit.web.server import InterviewServer, interview_complete


def _pack():
    return {
        "format": "specpack/0.3", "name": "srv", "title": "Server",
        "spec": {"why": "w", "requirements": [{"id": "FR-1", "text": "r", "priority": "P1"}], "clarifications": [
            {"id": "Q-1", "question": "Which shape?", "status": "open", "owner": "human:owner",
             "kind": "choice", "options": ["jsonl", "array"], "default": "jsonl"},
            {"id": "Q-2", "question": "Free text?", "status": "open", "owner": "human:owner"},
        ]},
        "plan": {"decisions": []},
        "tasks": [{"id": "T-1", "title": "t", "detail": "d", "satisfies": ["FR-1"], "verify": {"cmd": "true", "expect": "0"}, "status": "todo"}],
    }


def _srv(tmp_path: Path):
    from loom_kit import specpack
    d = tmp_path / "p"
    d.mkdir(exist_ok=True)
    (d / "p.json").write_text(json.dumps(_pack()))
    doc, path = specpack.load_specpack(d)  # born through the machine, like every real pack
    specpack.save(doc, path)
    srv = InterviewServer(d).start()
    return d, srv


def _get(url: str):
    with urllib.request.urlopen(url) as r:
        return r.status, r.read()


def _post(url: str, body: dict):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def _ondisk(d: Path):
    return json.loads((d / "p.json").read_text())


def test_serves_page_with_owner_seam(tmp_path: Path):
    _, srv = _srv(tmp_path)
    try:
        code, body = _get(srv.url)
        assert code == 200
        text = body.decode()
        assert "INTERVIEW_CONFIG" in text and "human:owner" in text
        assert "loom" not in text.lower()  # the page binds to events only
        code, js = _get(srv.url + "page.js")
        assert code == 200 and b"SECTIONS" in js
    finally:
        srv.shutdown()


def test_spec_endpoint_emits_canonical_layout(tmp_path: Path):
    _, srv = _srv(tmp_path)
    try:
        code, body = _get(srv.url + "spec")
        doc = json.loads(body)
        assert code == 200
        from loom_kit import specpack
        keys = list(doc.keys())
        canon = [k for k in specpack.CANONICAL_ORDER if k in keys]  # empty groups may skip
        assert keys == canon, keys
        assert doc["date"]["updated"]  # born through save
        assert doc["status"]["lifecycle"] == "active"
    finally:
        srv.shutdown()


def test_answer_flows_through_admission_and_event_file(tmp_path: Path):
    """AC-7 + AC-8: machine admission, at/by stamped, durable event file."""
    d, srv = _srv(tmp_path)
    try:
        code, out = _post(srv.url + "event", {"kind": "choice", "q": "Q-1", "option": "jsonl", "text": "jsonl", "by": "human:owner"})
        assert code == 200 and out["ok"]
        on = _ondisk(d)
        q1 = [c for c in on["spec"]["clarifications"] if c["id"] == "Q-1"][0]
        assert q1["status"] == "resolved" and q1["answered_by"] == "human:owner"
        evs = events.read_events(d / "interview.jsonl")
        assert evs[0]["kind"] == "choice" and evs[0]["q"] == "Q-1" and evs[0]["at"]
    finally:
        srv.shutdown()


def test_unknown_records_honestly(tmp_path: Path):
    d, srv = _srv(tmp_path)
    try:
        code, _ = _post(srv.url + "event", {"kind": "unknown", "q": "Q-2", "by": "human:owner"})
        assert code == 200
        on = _ondisk(d)
        q2 = [c for c in on["spec"]["clarifications"] if c["id"] == "Q-2"][0]
        assert q2["status"] == "open" and q2["unknown"] is True
    finally:
        srv.shutdown()


def test_bad_claims_and_shapes_refused(tmp_path: Path):
    d, srv = _srv(tmp_path)
    try:
        code, out = _post(srv.url + "event", {"kind": "answer", "q": "Q-1", "text": "x", "by": "agent:pi"})
        assert code == 400 and not out["ok"]
        code, out = _post(srv.url + "event", {"kind": "approve", "by": "human:owner"})
        assert code == 400 and "open questions remain" in out["error"]
        code, out = _post(srv.url + "event", {"kind": "wat", "by": "human:owner"})
        assert code == 400
    finally:
        srv.shutdown()


def test_full_ceremony_to_approval_and_completion(tmp_path: Path):
    """AC-9: answer everything, approve, the wait condition trips."""
    d, srv = _srv(tmp_path)
    try:
        assert not interview_complete(d)
        _post(srv.url + "event", {"kind": "choice", "q": "Q-1", "option": "jsonl", "text": "jsonl", "by": "human:owner"})
        _post(srv.url + "event", {"kind": "answer", "q": "Q-2", "text": "free form answer", "by": "human:owner"})
        code, _ = _post(srv.url + "event", {"kind": "approve", "by": "human:owner"})
        assert code == 200
        on = _ondisk(d)
        assert on["date"]["approved"]["by"] == "human:owner"
        assert on["status"]["deliverable"] == "drafted"  # derived, never hand-set
        assert interview_complete(d)
        evs = events.read_events(d / "interview.jsonl")
        assert [e["kind"] for e in evs] == ["choice", "answer", "approve"]
    finally:
        srv.shutdown()


def test_localhost_bind_only(tmp_path: Path):
    """CON-5: the socket binds 127.0.0.1, never 0.0.0.0."""
    _, srv = _srv(tmp_path)
    try:
        assert srv.httpd.server_address[0] == "127.0.0.1"
    finally:
        srv.shutdown()
