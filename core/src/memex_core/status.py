"""status: one readout across both planes."""

from __future__ import annotations

from pathlib import Path

from memex.infrastructure.config import MemexConfig
from memex_core.resolve import WIKI_DIRNAME, repo_root_of


def combined_status(cwd: Path, *, data_dir: Path | None = None) -> dict[str, object]:
    """Memory health (engine) + wiki conformance and freshness (kit)."""
    effective_data_dir = data_dir or MemexConfig().data_dir
    status: dict[str, object] = {"memory_data_dir": str(effective_data_dir)}

    if effective_data_dir.is_dir():
        from memex import Memex

        memex = Memex(MemexConfig(data_dir=effective_data_dir))
        try:
            status["memory"] = memex.status()
        finally:
            memex.close()
    else:
        status["memory"] = {"store": "absent"}

    root = repo_root_of(Path(cwd))
    bundle_root = root / WIKI_DIRNAME if root else None
    if bundle_root is None or not (bundle_root / "index.md").is_file():
        status["wiki"] = {"present": False}
        return status

    from okf_kit.core.validate import validate_bundle

    report = validate_bundle(bundle_root)
    wiki: dict[str, object] = {
        "present": True,
        "bundle_root": str(bundle_root),
        "errors": len(report.errors),
        "warnings": len(report.warnings),
        "infos": len(report.info),
    }
    from memex_core.resolve import resolve

    resolved = resolve(Path(cwd), data_dir=effective_data_dir)
    wiki["freshness"] = resolved.wiki.freshness
    wiki["concept_count"] = resolved.wiki.concept_count
    wiki["pending_findings"] = resolved.wiki.pending_findings
    status["wiki"] = wiki
    return status
