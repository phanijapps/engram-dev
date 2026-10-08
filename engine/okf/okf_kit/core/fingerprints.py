"""Fingerprints — per-file content hashes for anchor staleness (wave U2).

`okf fingerprints update` records the sha256 of every scanned source into
``<bundle>/.okf/fingerprints.json``. `okf anchors` then compares each
concept's ``sources[].resource`` against the fingerprint: a changed hash
means the page's anchors were written against older code → NEEDS_REVIEW.
Read-only: the engine reports; the gardener re-verifies and re-anchors.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
from datetime import UTC, datetime
from pathlib import Path

FINGERPRINTS_FILENAME = "fingerprints.json"


def _sha256(path: Path) -> str | None:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        return None


def _git_head(repo_root: Path) -> str | None:
    try:
        out = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=True,
        )
    except (OSError, subprocess.CalledProcessError):
        return None
    return out.stdout.strip() or None


def compute_fingerprints(workspace: Path, *, include_tests: bool = False) -> dict[str, str]:
    """Map workspace-relative python paths → sha256 (same scope as candidates)."""
    from okf_kit.code.semantic import _SKIP_DIRS  # shared scope rules

    workspace = Path(workspace)
    fingerprints: dict[str, str] = {}
    for path in sorted(workspace.rglob("*.py")):
        rel = path.relative_to(workspace).as_posix()
        parts = set(path.parts)
        if parts & _SKIP_DIRS:
            continue
        if not include_tests and any(part in {"tests", "test"} for part in path.parts):
            continue
        digest = _sha256(path)
        if digest:
            fingerprints[rel] = digest
    return fingerprints


def write_fingerprints(workspace: Path, bundle: Path) -> Path:
    """Write ``<bundle>/.okf/fingerprints.json`` and return its path."""
    workspace = Path(workspace)
    state_dir = bundle / ".okf"
    state_dir.mkdir(parents=True, exist_ok=True)
    stamp = {
        "generated_at": datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "workspace": str(workspace.resolve()),
        "head": _git_head(workspace),
        "fingerprints": compute_fingerprints(workspace),
    }
    path = state_dir / FINGERPRINTS_FILENAME
    path.write_text(json.dumps(stamp, indent=2) + "\n", encoding="utf-8")
    return path


def read_fingerprints(bundle: Path) -> dict[str, str]:
    path = Path(bundle) / ".okf" / FINGERPRINTS_FILENAME
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError:
        return {}
    fp = data.get("fingerprints")
    return {str(k): str(v) for k, v in fp.items()} if isinstance(fp, dict) else {}


def anchor_review(bundle: Path, repo_root: Path) -> list[dict[str, object]]:
    """Verdict per concept-source anchor: current / changed / untracked / missing-file."""
    from okf_kit.core.parse import parse_concept

    repo_root = Path(repo_root).resolve()
    fingerprints = read_fingerprints(bundle)
    review: list[dict[str, object]] = []
    for md in sorted(bundle.rglob("*.md")):
        if md.name in {"index.md", "log.md"} or ".okf" in md.parts:
            continue
        concept = parse_concept(md, bundle)
        sources = concept.frontmatter.get("sources")
        if not isinstance(sources, list):
            continue
        cid = md.relative_to(bundle).as_posix().removesuffix(".md")
        for entry in sources:
            if not isinstance(entry, dict):
                continue
            resource = entry.get("resource")
            if not isinstance(resource, str) or not resource:
                continue
            target = repo_root / resource
            target_resolved = target.resolve()
            if target_resolved.is_relative_to(bundle.resolve()):
                # wiki-internal anchor: integrity is the bundle's own
                # broken-link check, not code fingerprints
                review.append({
                    "page": cid,
                    "resource": resource,
                    "verdict": "wiki-internal",
                    "stored": None,
                    "current": None,
                })
                continue
            current = _sha256(target)
            stored = fingerprints.get(resource)
            if current is None:
                verdict = "missing-file"
            elif stored is None:
                verdict = "untracked"
            elif stored != current:
                verdict = "changed"
            else:
                verdict = "current"
            review.append({
                "page": cid,
                "resource": resource,
                "verdict": verdict,
                "stored": stored,
                "current": current,
            })
    return review
