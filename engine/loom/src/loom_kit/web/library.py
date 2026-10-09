"""The library server (spec-library T-1/T-2; DES-1, DES-2).

A localhost-only standing surface over a specs directory: every pack
listed (legacy folders fail soft), every spec readable, every .md
artifact served as markdown, and the two owner acts (answer, approve)
admitted through the same machine rules as the interview room.

The adapter contract this implements (DES-2):
  GET  /                    → the library page
  GET  /app.js              → the page's script
  GET  /marked.min.js       → the vendored markdown renderer
  GET  /specs               → the list: packs + legacy folders
  GET  /spec/<name>         → one pack, canonical layout
  GET  /artifact/<n>/<file> → a .md file from that spec's folder
  POST /event/<name>        → admission or 400-JSON refusal
"""

from __future__ import annotations

import json
import re
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .. import events, specpack
from ..spine import LoomError
from .server import _admit, _Denied

_WEB = Path(__file__).parent

_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
_FILE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*\.md$")


def list_specs(root: Path) -> dict:
    """Every folder under root: packs through the loader, the rest as legacy.

    Fail-soft per folder (D-5): a folder that will not load is legacy,
    never a crash of the list.
    """
    packs, legacy = [], []
    if not root.is_dir():
        return {"specs": packs, "legacy": legacy, "root": str(root)}
    for d in sorted(root.iterdir()):
        if not d.is_dir():
            continue
        try:
            doc, _ = specpack.load_specpack(d)
        except LoomError:
            legacy.append({"name": d.name, "title": d.name.replace("-", " "),
                           "files": sorted(p.name for p in d.glob("*.md"))})
            continue
        qs = doc.get("spec", {}).get("clarifications", [])
        packs.append({
            "name": doc.get("name", d.name),
            "title": doc.get("description", d.name).split(".")[0][:100],
            "stage": doc.get("deliverable", "drafted"),
            "revision": doc.get("revision", 1),
            "lifecycle": doc.get("status", "active"),
            "open_questions": sum(1 for q in qs if q.get("status") == "open"),
            "approved": bool(doc.get("approved_at")),
            "updated": (doc.get("date") or {}).get("updated") or (doc.get("date") or {}).get("created") or "",
            "docs": sorted(x.name for x in d.glob("*.md")),
        })
    return {"specs": packs, "legacy": legacy, "root": str(root)}


class _Handler(BaseHTTPRequestHandler):
    root: Path = None  # type: ignore[assignment]
    lock: threading.Lock = None  # type: ignore[assignment]
    owner: str = "human:owner"

    def log_message(self, *a):  # quiet
        pass

    def _send(self, code: int, body: bytes, ctype: str):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, code: int, obj: dict):
        self._send(code, (json.dumps(obj) + "\n").encode(), "application/json")

    def _pack_dir(self, name: str) -> Path | None:
        if not _NAME.match(name or ""):
            return None
        d = self.root / name
        return d if d.is_dir() else None

    def do_GET(self):
        try:
            if self.path == "/":
                self._send(200, (_WEB / "library.html").read_bytes(), "text/html; charset=utf-8")
            elif self.path == "/app.js":
                self._send(200, (_WEB / "library.js").read_bytes(), "text/javascript; charset=utf-8")
            elif self.path == "/marked.min.js":
                self._send(200, (_WEB / "marked.min.js").read_bytes(), "text/javascript; charset=utf-8")
            elif self.path == "/specs":
                with self.lock:
                    self._json(200, list_specs(self.root))
            elif self.path.startswith("/spec/"):
                name = self.path[len("/spec/"):]
                d = self._pack_dir(name)
                if d is None:
                    self._json(404, {"ok": False, "error": f"no spec named {name!r}"})
                    return
                try:
                    doc, _ = specpack.load_specpack(d)
                except LoomError as e:
                    self._json(400, {"ok": False, "error": f"the pack refused to load: {e}"})
                    return
                self._send(200, (json.dumps(specpack._emit(doc), ensure_ascii=False) + "\n").encode(), "application/json")
            elif self.path.startswith("/artifact/"):
                rest = self.path[len("/artifact/"):]
                name, _, file = rest.partition("/")
                d = self._pack_dir(name)
                if d is None or not _FILE.match(file or ""):
                    self._json(404, {"ok": False, "error": "no such document"})
                    return
                f = d / file
                if not f.is_file():  # includes traversal: resolved inside d only
                    self._json(404, {"ok": False, "error": "no such document"})
                    return
                self._send(200, f.read_bytes(), "text/markdown; charset=utf-8")
            else:
                self._json(404, {"ok": False, "error": "not found"})
        except Exception as e:  # last resort: honest JSON, not a traceback
            self._json(500, {"ok": False, "error": f"internal: {e}"})

    def do_POST(self):
        if not self.path.startswith("/event/"):
            self._json(404, {"ok": False, "error": "not found"})
            return
        name = self.path[len("/event/"):]
        d = self._pack_dir(name)
        if d is None:
            self._json(404, {"ok": False, "error": f"no spec named {name!r}"})
            return
        try:
            n = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(n) or b"{}")
        except ValueError:
            self._json(400, {"ok": False, "error": "the body is not JSON"})
            return
        body.setdefault("by", self.owner)
        try:
            out = _admit(d, body, self.lock)
        except _Denied as e:
            self._json(400, {"ok": False, "error": str(e)})
            return
        self._json(200, out)


class LibraryServer:
    """Test-friendly handle: start(), url, shutdown()."""

    def __init__(self, root: Path, port: int = 8788, owner: str = "human:owner"):
        self.root = Path(root)
        self.port = port
        self.owner = owner
        self.lock = threading.Lock()

    def start(self) -> "LibraryServer":
        h = _Handler
        h.root, h.lock, h.owner = self.root, self.lock, self.owner
        self._httpd = ThreadingHTTPServer(("127.0.0.1", self.port), h)
        self.port = self._httpd.server_address[1]
        self._t = threading.Thread(target=self._httpd.serve_forever, daemon=True)
        self._t.start()
        return self

    @property
    def url(self) -> str:
        return f"http://127.0.0.1:{self.port}/"

    def shutdown(self):
        self._httpd.shutdown()
        self._httpd.server_close()


def run(root: Path, port: int = 8788, owner: str = "human:owner", open_browser: bool = True) -> int:
    srv = LibraryServer(root, port=port, owner=owner).start()
    print(f"library: {srv.url}  (localhost only, no auth — v1 disclosure)")
    print(f"library: serving {root} — Ctrl-C stops")
    try:
        if open_browser:
            webbrowser.open(srv.url)
        while True:
            threading.Event().wait(3600)
    except KeyboardInterrupt:
        print("\nlibrary: stopped; every admission is already saved")
    finally:
        srv.shutdown()
    return 0
