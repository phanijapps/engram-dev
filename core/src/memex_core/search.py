"""Federated search: memory (engine) and wiki (kit), origin-tagged.

Neither engine's index absorbs the other's rows — federation merges hit
lists beside them. Scores are not comparable across engines, so results
interleave round-robin by each engine's own rank (memory hit 1, wiki hit 1,
memory hit 2, …): fair, deterministic, and budget-friendly.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from memex.infrastructure.config import MemexConfig
from memex_core.resolve import WIKI_DIRNAME, repo_root_of

DEFAULT_TOP_K = 8


@dataclass(slots=True)
class CoreHit:
    """One federated hit; ``origin`` discriminates the plane."""

    origin: str  # "memory" | "wiki"
    id: str
    title: str
    path: str
    snippet: str
    score: float
    rank: int


def _memory_hits(
    query: str, *, data_dir: Path, top_k: int, scope: str, project_id: str | None
) -> list[CoreHit]:
    from memex import Memex

    memex = Memex(MemexConfig(data_dir=data_dir))
    try:
        result = memex.recall(query, top_k=top_k, scope=scope, project_id=project_id)
    finally:
        memex.close()
    hits: list[CoreHit] = []
    for hit in result.hits:
        hits.append(
            CoreHit(
                origin="memory",
                id=hit.slug,
                title=hit.title,
                path=str(hit.file_path),
                snippet=str(hit.snippet),
                score=float(hit.score),
                rank=int(hit.rank),
            )
        )
    return hits


def _wiki_hits(query: str, *, bundle_root: Path, top_k: int) -> list[CoreHit]:
    from okf_kit.core.search import build_index, search

    index = build_index(bundle_root)
    hits: list[CoreHit] = []
    for position, hit in enumerate(search(index, query, limit=top_k), start=1):
        hits.append(
            CoreHit(
                origin="wiki",
                id=str(hit.cid),
                title=str(hit.title),
                path=str(bundle_root / f"{hit.cid}.md"),
                snippet=str(hit.snippet),
                score=float(hit.score),
                rank=position,
            )
        )
    return hits


def _interleave(groups: list[list[CoreHit]]) -> list[CoreHit]:
    merged: list[CoreHit] = []
    rank = 0
    for position in range(max((len(g) for g in groups), default=0)):
        for group in groups:
            if position < len(group):
                rank += 1
                hit = group[position]
                merged.append(
                    CoreHit(
                        origin=hit.origin,
                        id=hit.id,
                        title=hit.title,
                        path=hit.path,
                        snippet=hit.snippet,
                        score=hit.score,
                        rank=rank,
                    )
                )
    return merged


def federated_search(
    query: str,
    *,
    cwd: Path,
    data_dir: Path | None = None,
    source: str = "both",
    top_k: int = DEFAULT_TOP_K,
    scope: str = "global",
    project_id: str | None = None,
) -> list[CoreHit]:
    """Search memory and/or the repo wiki; interleaved, origin-tagged hits."""
    if source not in {"memory", "wiki", "both"}:
        raise ValueError("source must be one of memory, wiki, both")
    groups: list[list[CoreHit]] = []
    if source in {"memory", "both"}:
        effective_data_dir = data_dir or MemexConfig().data_dir
        groups.append(
            _memory_hits(query, data_dir=effective_data_dir, top_k=top_k, scope=scope, project_id=project_id)
        )
    if source in {"wiki", "both"}:
        root = repo_root_of(Path(cwd))
        bundle_root = root / WIKI_DIRNAME if root else None
        if bundle_root is not None and (bundle_root / "index.md").is_file():
            groups.append(_wiki_hits(query, bundle_root=bundle_root, top_k=top_k))
    return _interleave(groups)
