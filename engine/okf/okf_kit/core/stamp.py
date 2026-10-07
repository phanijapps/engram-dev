"""Freshness stamp for managed code concepts (the wiki trust contract).

Written after each successful ``okf code index`` run. Consumers compare
``repo_head`` against the current git HEAD: equal means the generated
tree describes the code at HEAD (``fresh``); anything else — including a
dirty working tree's newer commits — means ``stale`` and the index should
be refreshed before its facts are trusted.
"""

from __future__ import annotations

import json
import subprocess
from datetime import UTC, datetime
from pathlib import Path

STAMP_DIRNAME = ".okf"
STAMP_FILENAME = "last-index.json"


def _git_head(repo_root: Path) -> str:
    """Best-effort HEAD sha; ``unknown`` outside a git repository."""
    try:
        out = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=True,
        )
    except (OSError, subprocess.CalledProcessError):
        return "unknown"
    return out.stdout.strip() or "unknown"


def write_freshness_stamp(
    bundle: Path,
    repo_root: Path,
    *,
    written: int,
    updated: int,
    skipped: int,
) -> Path:
    """Write ``<bundle>/.okf/last-index.json`` and return its path."""
    now = datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")
    stamp = {
        "repo_root": str(Path(repo_root).resolve()),
        "repo_head": _git_head(repo_root),
        "indexed_at": now,
        "written": int(written),
        "updated": int(updated),
        "skipped": int(skipped),
    }
    state_dir = bundle / STAMP_DIRNAME
    state_dir.mkdir(parents=True, exist_ok=True)
    path = state_dir / STAMP_FILENAME
    path.write_text(json.dumps(stamp, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path
