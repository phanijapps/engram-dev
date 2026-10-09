"""Interview events: the portable seam (spec-web T-3; FR-6, DES-1, D-12).

This module never imports specpack. The event vocabulary is the contract
the page emits and any adapter consumes (crit.md's file-protocol lesson).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

EVENT_FORMAT = "specweb-events/0.1"
EVENT_KINDS = ("answer", "unknown", "choice", "approve")
_SCOPED = {"answer", "unknown", "choice"}  # kinds that name a question


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def event(kind: str, by: str, q: str | None = None, *, text: str | None = None, option: str | None = None) -> dict:
    """Build one valid event, stamped now. Raises ValueError on bad shape."""
    if kind not in EVENT_KINDS:
        raise ValueError(f"unknown event kind: {kind!r} (expected one of {EVENT_KINDS})")
    if not str(by).startswith("human:"):
        raise ValueError(f"events carry human claims: by={by!r} must start human:")
    ev: dict = {"kind": kind, "by": by, "at": _now()}
    if kind in _SCOPED:
        if not q:
            raise ValueError(f"{kind} events name a question: pass q")
        ev["q"] = q
    elif q is not None:
        raise ValueError(f"{kind} events are pack-scoped: do not pass q")
    if text is not None:
        ev["text"] = text
    if option is not None:
        if kind != "choice":
            raise ValueError("only choice events carry option")
        ev["option"] = option
    return ev


def validate_event(ev: dict) -> None:
    """Re-check an event's shape (read side of the contract)."""
    if not isinstance(ev, dict) or ev.get("kind") not in EVENT_KINDS:
        raise ValueError(f"not an event: {ev!r}")
    if not str(ev.get("by", "")).startswith("human:"):
        raise ValueError(f"events carry human claims: by={ev.get('by')!r}")
    if "at" not in ev:
        raise ValueError("events are stamped: at is required")
    if ev["kind"] in _SCOPED and not ev.get("q"):
        raise ValueError(f"{ev['kind']} events name a question")
    if ev["kind"] not in _SCOPED and ev.get("q") is not None:
        raise ValueError(f"{ev['kind']} events are pack-scoped")


def header() -> dict:
    return {"format": EVENT_FORMAT}


def events_path(pack_dir: Path) -> Path:
    """D-12: the event file lives beside the spec, append-only JSON Lines."""
    return Path(pack_dir) / "interview.jsonl"


def write_event(path: Path, ev: dict) -> None:
    """Append one event; write the format header first if the file is new."""
    validate_event(ev)
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    new = not path.exists()
    with open(path, "a", encoding="utf-8") as f:
        if new:
            f.write(json.dumps(header()) + "\n")
        f.write(json.dumps(ev) + "\n")


def read_events(path: Path) -> list[dict]:
    """Replay: header first (format checked), then events (each validated)."""
    path = Path(path)
    if not path.exists():
        return []
    out: list[dict] = []
    with open(path, encoding="utf-8") as f:
        for i, line in enumerate(f):
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if i == 0 or (not out and obj.get("format")):
                if obj.get("format") != EVENT_FORMAT:
                    raise ValueError(f"{path}: bad event format header: {obj.get('format')!r}")
                continue
            validate_event(obj)
            out.append(obj)
    return out
