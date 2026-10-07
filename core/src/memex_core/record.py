"""record: durable notes through the engine write path (governance intact)."""

from __future__ import annotations

from pathlib import Path

from memex.domain.models import WriteInput
from memex.infrastructure.config import MemexConfig


def record_note(
    title: str,
    body: str,
    *,
    type_: str = "entity",
    scope: str = "global",
    project_id: str | None = None,
    project_label: str | None = None,
    tags: list[str] | None = None,
    description: str | None = None,
    data_dir: Path | None = None,
) -> dict[str, object]:
    """Write one memory page via the engine facade (scrub, budgets, index)."""
    if scope not in {"global", "project"}:
        raise ValueError("scope must be global or project")
    if scope == "project" and not project_id:
        raise ValueError("project scope requires project_id (resolve provides it)")
    from memex import Memex

    effective_data_dir = data_dir or MemexConfig().data_dir
    memex = Memex(MemexConfig(data_dir=effective_data_dir))
    try:
        node = memex.write(
            WriteInput(
                type=type_,
                title=title,
                body=body,
                tags=tags or [],
                description=description or "",
                scope=scope,
                project_id=project_id if scope == "project" else None,
                project_label=project_label if scope == "project" else None,
            )
        )
    finally:
        memex.close()
    return {"slug": node.slug, "file_path": str(node.file_path), "type": node.type}
