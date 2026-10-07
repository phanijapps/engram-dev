"""memex-core: the one-engine seed spanning memory (engine/) and knowledge (kit/)."""

from __future__ import annotations

__version__ = "0.1.0"

from memex_core.compile_context import Compiled, compile_context
from memex_core.findings import (
    findings_path,
    list_findings,
    propose_finding,
    resolve_finding,
)
from memex_core.knowledge import wiki_init, wiki_update
from memex_core.record import record_note
from memex_core.resolve import ResolveReport, resolve
from memex_core.search import CoreHit, federated_search
from memex_core.status import combined_status

__all__ = [
    "Compiled",
    "CoreHit",
    "ResolveReport",
    "__version__",
    "combined_status",
    "compile_context",
    "federated_search",
    "findings_path",
    "list_findings",
    "propose_finding",
    "record_note",
    "resolve",
    "resolve_finding",
    "wiki_init",
    "wiki_update",
]
