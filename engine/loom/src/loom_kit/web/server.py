"""The harness adapter (spec-web T-5; FR-7, DES-2, D-13).

A localhost-only server that serves the page, receives events, and
routes every one through machine admission (specpack), writing the
durable event file. The waiting CLI blocks like an interrupt (D-13):
Ctrl-C escapes; every admission is already saved.

The adapter contract (DES-3) this implements:
  GET  /spec   → the spec, canonical layout (the page renders it)
  POST /event  → {kind, q?, text?, option?, by} → admission or refusal
"""

from __future__ import annotations

import json
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .. import events, specpack
from ..spine import LoomError

_WEB = Path(__file__).parent


class _Denied(Exception):
    """Admission refused: carries the message back to the page."""


def _admit(pack_dir: Path, body: dict, lock: threading.Lock) -> dict:
    """One event through machine admission. The only write path (CON-3)."""
    kind = body.get("kind")
    by = body.get("by", "")
    try:
        ev = events.event(kind, by, body.get("q"), text=body.get("text"), option=body.get("option"))
    except ValueError as e:
        raise _Denied(str(e))
    with lock:
        doc, path = specpack.load_specpack(pack_dir)
        try:
            if kind in ("answer", "unknown", "choice"):
                specpack.answer_question(doc, ev["q"], by, text=ev.get("text"), unknown=(kind == "unknown"))
            elif kind == "approve":
                specpack.approve_spec(doc, by)
        except LoomError as e:
            raise _Denied(str(e))
        doc["revision"] = doc.get("revision", 1) + 1
        specpack.save(doc, path)
        events.write_event(events.events_path(pack_dir), ev)
    return {"ok": True, "revision": doc["revision"]}


def interview_complete(pack_dir: Path) -> bool:
    """The wait condition: the approval act is recorded."""
    doc, _ = specpack.load_specpack(pack_dir)
    return bool(doc.get("approved_at"))


class _Handler(BaseHTTPRequestHandler):
    pack_dir: Path = None  # type: ignore[assignment]
    lock: threading.Lock = None  # type: ignore[assignment]
    owner: str = "human:owner"

    def log_message(self, *a):  # quiet: no stderr chatter
        pass

    def _send(self, code: int, body: bytes, ctype: str):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/":
            html = (_WEB / "page.html").read_text(encoding="utf-8")
            inject = f'<script>window.INTERVIEW_CONFIG = {{by: "{self.owner}"}};</script>\n</head>'
            self._send(200, html.replace("</head>", inject, 1).encode(), "text/html; charset=utf-8")
        elif self.path == "/page.js":
            self._send(200, (_WEB / "page.js").read_text(encoding="utf-8").encode(), "application/javascript")
        elif self.path == "/spec":
            doc, _ = specpack.load_specpack(self.pack_dir)
            self._send(200, (json.dumps(specpack._emit(doc), ensure_ascii=False) + "\n").encode(), "application/json")
        else:
            self._send(404, b"not found", "text/plain")

    def do_POST(self):
        if self.path != "/event":
            self._send(404, b"not found", "text/plain")
            return
        try:
            n = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(n) or b"{}")
            out = _admit(self.pack_dir, body, self.lock)
            self._send(200, (json.dumps(out) + "\n").encode(), "application/json")
        except _Denied as e:
            self._send(400, (json.dumps({"ok": False, "error": str(e)}) + "\n").encode(), "application/json")
        except Exception as e:  # malformed body, disk trouble
            self._send(500, (json.dumps({"ok": False, "error": str(e)}) + "\n").encode(), "application/json")


class InterviewServer:
    """Owns the socket; bound to 127.0.0.1 only (CON-5)."""

    def __init__(self, pack_dir: Path, port: int = 0, owner: str = "human:owner"):
        self.pack_dir = Path(pack_dir)
        self.lock = threading.Lock()
        handler = type("Bound", (_Handler,), {"pack_dir": self.pack_dir, "lock": self.lock, "owner": owner})
        self.httpd = ThreadingHTTPServer(("127.0.0.1", port), handler)

    @property
    def url(self) -> str:
        return f"http://127.0.0.1:{self.httpd.server_port}/"

    def start(self) -> "InterviewServer":
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        return self

    def shutdown(self) -> None:
        self.httpd.shutdown()
        self.httpd.server_close()


def run(pack_dir: Path, *, port: int = 0, owner: str = "human:owner", open_browser: bool = True) -> int:
    """The interrupt (D-13): serve, open, block until approved or Ctrl-C."""
    srv = InterviewServer(pack_dir, port=port, owner=owner).start()
    url = srv.url
    print(f"interview: {url}  (localhost only, no auth — v1 disclosure, CON-5)")
    if open_browser:
        webbrowser.open(url)
    try:
        import time
        while not interview_complete(pack_dir):
            time.sleep(0.4)
        print("interview complete: the approval act is recorded; the loop resumes")
        return 0
    except KeyboardInterrupt:
        print("\nescaped: everything admitted so far is saved; rerun to continue")
        return 130
    finally:
        srv.shutdown()
