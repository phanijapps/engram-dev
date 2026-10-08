"""Bundle status — one honest answer to "can I trust the wiki right now?".

Combines the three signals an agent needs before trusting a bundle:
presence + declared version, freshness (stamp vs git HEAD), and health
(validation + pending findings). Read-only; never mutates anything.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from okf_kit.core.findings import findings_path
from okf_kit.core.stamp import STAMP_DIRNAME, STAMP_FILENAME, _git_head


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


def _concept_count(bundle: Path) -> int:
    return sum(
        1
        for md in bundle.rglob("*.md")
        if md.name not in {"index.md", "log.md"} and ".okf" not in md.parts
    )


def _pending_findings(bundle: Path) -> int:
    ledger = findings_path(bundle)
    if not ledger.is_file():
        return 0
    try:
        import tomllib

        with ledger.open("rb") as handle:
            data = tomllib.load(handle)
        return sum(
            1
            for entry in data.get("findings", [])
            if isinstance(entry, dict) and entry.get("status") == "pending"
        )
    except Exception:
        return -1  # unreadable ledger is itself a health signal


def bundle_status(bundle: Path, repo_root: Path | None = None) -> dict[str, object]:
    """Compute the status dict for an OKF bundle (read-only)."""
    bundle = Path(bundle)
    repo_root = Path(repo_root) if repo_root else Path.cwd()

    index = bundle / "index.md"
    present = index.is_file()
    okf_version: str | None = None
    if present:
        from okf_kit.core.parse import parse_concept

        pre = parse_concept(index, bundle)
        if pre.frontmatter_present:
            okf_version = pre.frontmatter.get("okf_version")

    stamp_path = bundle / STAMP_DIRNAME / STAMP_FILENAME
    stamp_head: str | None = None
    indexed_at: str | None = None
    last_counts: dict[str, int] = {}
    if stamp_path.is_file():
        try:
            data = json.loads(stamp_path.read_text())
            stamp_head = str(data.get("repo_head")) if data.get("repo_head") else None
            indexed_at = data.get("indexed_at")
            last_counts = {
                k: int(data[k])
                for k in ("written", "updated", "skipped")
                if isinstance(data.get(k), int)
            }
        except (json.JSONDecodeError, OSError):
            stamp_head = None

    head = _git_head(repo_root)
    if not present:
        freshness = "absent"
    elif stamp_head is None or head is None:
        freshness = "unknown"
    else:
        freshness = "fresh" if stamp_head == head else "stale"

    from okf_kit.core.validate import validate_bundle

    report = validate_bundle(bundle) if present else None

    return {
        "bundle": str(bundle),
        "present": present,
        "okf_version": okf_version,
        "freshness": freshness,
        "stamp_head": stamp_head,
        "head": head,
        "indexed_at": indexed_at,
        "last_index": last_counts,
        "concept_count": _concept_count(bundle) if present else 0,
        "pending_findings": _pending_findings(bundle) if present else 0,
        "validate": {
            "conformant": report.conformant if report else None,
            "errors": len(report.errors) if report else 0,
            "warnings": len(report.warnings) if report else 0,
        },
    }
