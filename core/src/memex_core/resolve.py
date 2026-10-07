"""resolve: project identity + wiki presence + memory store, one call.

The dark-knight's first move: before any agent asks a question, the control
plane states what it is looking at — which project (engine's git-derived
identity), whether the repo carries an OKF wiki bundle at ``<repo>/wiki/``
(the convention; no registry), whether that wiki is fresh, and where the
memory store lives.
"""

from __future__ import annotations

import json
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

from memex.infrastructure.workspace_context import project_context

_GIT = shutil.which("git") or "/usr/bin/git"

WIKI_DIRNAME = "wiki"
OKF_STATE_DIRNAME = ".okf"
LAST_INDEX_STAMP = "last-index.json"


@dataclass(slots=True)
class WikiState:
    """What resolve knows about the repo's OKF bundle."""

    present: bool
    bundle_root: str | None
    okf_version: str | None
    concept_count: int
    freshness: str  # fresh | stale | unknown | absent
    pending_findings: int
    last_index: dict[str, object] | None = field(default=None)


@dataclass(slots=True)
class ResolveReport:
    project_id: str | None
    label: str | None
    locator: str | None
    repo_root: str | None
    repo_head: str | None
    wiki: WikiState
    memory_data_dir: str


def _git_output(cwd: Path, *args: str) -> str:
    try:
        completed = subprocess.run(
            [_GIT, *args], cwd=cwd, capture_output=True, text=True, timeout=5, check=True
        )
    except (OSError, subprocess.SubprocessError):
        return ""
    return completed.stdout.strip()


def repo_root_of(cwd: Path) -> Path | None:
    root = _git_output(Path(cwd), "rev-parse", "--show-toplevel")
    return Path(root) if root else None


def _read_okf_version(bundle_root: Path) -> str | None:
    index = bundle_root / "index.md"
    if not index.is_file():
        return None
    from okf_kit.core.parse import split_frontmatter

    result = split_frontmatter(index.read_text(encoding="utf-8"))
    version = result.data.get("okf_version")
    return str(version) if version is not None else None


def _count_concepts(bundle_root: Path) -> int:
    return sum(
        1
        for md in bundle_root.rglob("*.md")
        if md.name not in {"index.md", "log.md"} and ".okf" not in md.parts
    )


def _pending_findings(bundle_root: Path) -> int:
    ledger = bundle_root / OKF_STATE_DIRNAME / "findings.toml"
    if not ledger.is_file():
        return 0
    import tomllib

    with ledger.open("rb") as handle:
        data = tomllib.load(handle)
    return sum(
        1 for entry in data.get("findings", []) if entry.get("status") == "pending"
    )


def _wiki_state(root: Path | None, head: str | None) -> WikiState:
    if root is None:
        return WikiState(False, None, None, 0, "absent", 0)
    bundle_root = root / WIKI_DIRNAME
    if not bundle_root.is_dir():
        return WikiState(False, None, None, 0, "absent", 0)
    stamp_path = bundle_root / OKF_STATE_DIRNAME / LAST_INDEX_STAMP
    last_index: dict[str, object] | None = None
    freshness = "unknown"
    if stamp_path.is_file():
        try:
            last_index = json.loads(stamp_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            last_index = None
        if isinstance(last_index, dict) and head:
            stamp_head = str(last_index.get("repo_head") or "")
            freshness = "fresh" if stamp_head == head else "stale"
    return WikiState(
        present=True,
        bundle_root=str(bundle_root),
        okf_version=_read_okf_version(bundle_root),
        concept_count=_count_concepts(bundle_root),
        freshness=freshness,
        pending_findings=_pending_findings(bundle_root),
        last_index=last_index,
    )


def resolve(cwd: Path, *, data_dir: Path | None = None) -> ResolveReport:
    """Identity, wiki state, and memory location for the workspace at ``cwd``."""
    cwd = Path(cwd)
    context = project_context(cwd)
    root = repo_root_of(cwd)
    head = _git_output(cwd, "rev-parse", "HEAD") or None
    from memex.infrastructure.config import MemexConfig

    effective_data_dir = data_dir or MemexConfig().data_dir
    return ResolveReport(
        project_id=context.project_id if context else None,
        label=context.label if context else None,
        locator=context.locator if context else None,
        repo_root=str(root) if root else None,
        repo_head=head,
        wiki=_wiki_state(root, head),
        memory_data_dir=str(effective_data_dir),
    )
