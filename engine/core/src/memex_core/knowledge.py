"""Knowledge plane ops: create and deterministically refresh the repo wiki.

``wiki_init`` scaffolds an OKF bundle at ``<repo>/wiki/`` (OKF 0.2; the kit
validator reports a version mismatch only at info level until kit U1 lands).
``wiki_update`` runs the kit's tree-sitter indexer — compact, managed
sections, tests excluded by default — and stamps ``.okf/last-index.json``
so ``resolve`` can report freshness without a daemon.
"""

from __future__ import annotations

import json
from dataclasses import asdict, is_dataclass
from datetime import UTC, datetime
from pathlib import Path

from memex_core.resolve import (
    LAST_INDEX_STAMP,
    OKF_STATE_DIRNAME,
    WIKI_DIRNAME,
    repo_root_of,
)

OKF_VERSION = "0.2"


class KnowledgeError(ValueError):
    """Raised for invalid knowledge-plane requests (missing repo/wiki)."""


def _bundle_root(repo_root: Path) -> Path:
    return repo_root / WIKI_DIRNAME


def wiki_init(cwd: Path, *, name: str | None = None) -> dict[str, object]:
    """Create ``<repo>/wiki/`` as an OKF bundle; refuse if one exists."""
    root = repo_root_of(Path(cwd))
    if root is None:
        raise KnowledgeError("not a git repository; a project wiki needs a repo root")
    bundle = _bundle_root(root)
    if (bundle / "index.md").exists():
        raise KnowledgeError(f"wiki already exists at {bundle}")
    from okf_kit.core.templates import init_bundle

    index_path = init_bundle(bundle, okf_version=OKF_VERSION, name=name or root.name)
    (bundle / OKF_STATE_DIRNAME).mkdir(parents=True, exist_ok=True)
    return {
        "bundle_root": str(bundle),
        "index": str(index_path),
        "okf_version": OKF_VERSION,
        "state_dir": str(bundle / OKF_STATE_DIRNAME),
    }


def _counts_as_dict(result: object) -> dict[str, object]:
    if is_dataclass(result):
        return {k: v for k, v in asdict(result).items() if isinstance(v, (int, str, bool))}
    if isinstance(result, dict):
        return {k: v for k, v in result.items() if isinstance(v, (int, str, bool))}
    return {}


def wiki_update(
    cwd: Path,
    *,
    update: bool = True,
    profile: str = "compact",
    include_tests: bool = False,
    include: list[str] | None = None,
    exclude: list[str] | None = None,
) -> dict[str, object]:
    """Index the repo's source into the wiki and stamp freshness."""
    root = repo_root_of(Path(cwd))
    if root is None:
        raise KnowledgeError("not a git repository; a project wiki needs a repo root")
    bundle = _bundle_root(root)
    if not (bundle / "index.md").is_file():
        raise KnowledgeError(f"no wiki at {bundle}; run wiki init first")
    from okf_kit.code.indexer import index_codebase
    from okf_kit.core.index import regenerate_indexes

    result = index_codebase(
        root,
        bundle,
        update=update,
        profile=profile,
        include_tests=include_tests,
        include=include,
        exclude=exclude,
    )
    # §8 progressive disclosure: every directory containing concepts gets an
    # index; root preserves its okf_version. Reserved files — excluded from
    # concept counts and the stamp contract (design D5).
    index_files = regenerate_indexes(bundle)
    # §8 progressive disclosure: every directory containing concepts gets an
    # index; root preserves its okf_version. Reserved files — excluded from
    # concept counts and the stamp contract (design D5).
    counts = _counts_as_dict(result)
    index_files = regenerate_indexes(bundle)
    stamp = {
        "repo_root": str(root),
        "repo_head": _head(root),
        "indexed_at": datetime.now(UTC).isoformat(),
        **counts,
    }
    state_dir = bundle / OKF_STATE_DIRNAME
    state_dir.mkdir(parents=True, exist_ok=True)
    (state_dir / LAST_INDEX_STAMP).write_text(
        json.dumps(stamp, indent=2, sort_keys=True), encoding="utf-8"
    )
    return {
        "bundle_root": str(bundle),
        "counts": counts,
        "indexes": len(index_files),
        "stamp": stamp,
    }


def _head(root: Path) -> str:
    import subprocess

    try:
        completed = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=root,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (OSError, subprocess.SubprocessError):
        return ""
    return completed.stdout.strip()
