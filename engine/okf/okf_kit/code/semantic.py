"""Semantic rule candidates — tree-sitter finds rule-shaped code.

Wave S stage 1 (deterministic): the scanner makes NO semantic claims. It
locates code *shapes* that usually encode knowledge — enforced guards,
assertions, permission/requirement calls, state enums, schema validators —
and reports exact locations plus a content hash. Deciding *what kind* of
knowledge each candidate carries is the gardener's job (agent authoring);
normative results flow through the findings ledger before they bind.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from okf_kit.code.treesitter import runtime

_CALL_POLICY_RE = re.compile(r"permission|authorize|require|ensure", re.IGNORECASE)
_DEF_POLICY_RE = re.compile(r"^(validate_|check_|ensure_)")
_DECORATOR_POLICY_RE = re.compile(r"validator|validates", re.IGNORECASE)
_ENUM_BASES = ("Enum", "IntEnum", "StrEnum", "Flag", "IntFlag")
_SKIP_DIRS = {".venv", "node_modules", "__pycache__", ".git", ".okf", "fixtures"}

_KIND_RAISE = "raise-guard"
_KIND_ASSERT = "assertion"
_KIND_PERMISSION = "permission-check"
_KIND_ENUM = "state-enum"
_KIND_VALIDATOR = "schema-validator"
_KIND_DEPRECATION = "deprecation"
_KIND_CONSTANT = "module-constant"
_KIND_TODO = "todo-marker"
_TODO_RE = re.compile(r"#\s*(?:[^\n]*\b)?(TODO|FIXME|HACK)\b")
_CONST_NAME_RE = re.compile(r"^[A-Z][A-Z0-9_]*$")


@dataclass(slots=True)
class RuleCandidate:
    """One located rule-shaped fragment. No semantics claimed here."""

    kind: str
    path: str  # workspace-relative posix path
    start_line: int
    end_line: int
    symbol: str | None  # enclosing class/function chain, outermost first
    snippet: str  # first source line of the fragment, trimmed
    source_hash: str  # sha256 of the whole source file (change detection)


def _snippet(node: Any, source_bytes: bytes) -> str:
    first = runtime.node_text(node, source_bytes).splitlines()
    line = first[0].strip() if first else ""
    return (line[:117] + "…") if len(line) > 118 else line


def _call_name(node: Any, source_bytes: bytes) -> str | None:
    fn = runtime.child_by_field_name(node, "function")
    if fn is None:
        return None
    name = runtime.node_text(fn, source_bytes)
    leaf = name.rsplit(".", 1)[-1].split("(")[0].strip()
    return leaf or None


def _enclosing(chain: list[str]) -> str | None:
    return ".".join(chain) if chain else None


def _walk(node: Any, source_bytes: bytes, chain: list[str], out: list[RuleCandidate],
          rel_path: str, file_hash: str) -> None:
    kind = runtime.node_kind(node)

    if kind == "class_definition":
        name_node = runtime.child_by_field_name(node, "name")
        name = runtime.node_text(name_node, source_bytes) if name_node is not None else None
        bases = runtime.child_by_field_name(node, "superclasses")
        base_text = runtime.node_text(bases, source_bytes) if bases is not None else ""
        if any(base in base_text for base in _ENUM_BASES):
            out.append(RuleCandidate(
                kind=_KIND_ENUM,
                path=rel_path,
                start_line=runtime.start_line(node),
                end_line=runtime.end_line(node),
                symbol=_enclosing(chain),
                snippet=_snippet(node, source_bytes),
                source_hash=file_hash,
            ))
        if name:
            chain.append(name)
        for child in runtime.children(node):
            _walk(child, source_bytes, chain, out, rel_path, file_hash)
        if name:
            chain.pop()
        return

    if kind == "decorated_definition":
        deco_text = " ".join(
            runtime.node_text(c, source_bytes)
            for c in runtime.children(node)
            if runtime.node_kind(c) == "decorator"
        )
        for child in runtime.children(node):
            if runtime.node_kind(child) in ("function_definition", "class_definition") and _DECORATOR_POLICY_RE.search(deco_text):
                name_node = runtime.child_by_field_name(child, "name")
                name = runtime.node_text(name_node, source_bytes) if name_node is not None else None
                if name is not None:
                    out.append(RuleCandidate(
                        kind=_KIND_VALIDATOR,
                        path=rel_path,
                        start_line=runtime.start_line(child),
                        end_line=runtime.end_line(child),
                        symbol=_enclosing(chain),
                        snippet=_snippet(child, source_bytes),
                        source_hash=file_hash,
                    ))
            _walk(child, source_bytes, chain, out, rel_path, file_hash)
        return

    if kind == "function_definition":
        name_node = runtime.child_by_field_name(node, "name")
        name = runtime.node_text(name_node, source_bytes) if name_node is not None else None
        # decorator policy handled by the decorated_definition branch above
        if name and _DEF_POLICY_RE.match(name):
            out.append(RuleCandidate(
                kind=_KIND_VALIDATOR,
                path=rel_path,
                start_line=runtime.start_line(node),
                end_line=runtime.end_line(node),
                symbol=_enclosing(chain),
                snippet=_snippet(node, source_bytes),
                source_hash=file_hash,
            ))
        if name:
            chain.append(name)
        for child in runtime.children(node):
            _walk(child, source_bytes, chain, out, rel_path, file_hash)
        if name:
            chain.pop()
        return

    if kind == "raise_statement":
        out.append(RuleCandidate(
            kind=_KIND_RAISE, path=rel_path,
            start_line=runtime.start_line(node), end_line=runtime.end_line(node),
            symbol=_enclosing(chain), snippet=_snippet(node, source_bytes),
            source_hash=file_hash,
        ))
        return

    if kind == "assert_statement":
        out.append(RuleCandidate(
            kind=_KIND_ASSERT, path=rel_path,
            start_line=runtime.start_line(node), end_line=runtime.end_line(node),
            symbol=_enclosing(chain), snippet=_snippet(node, source_bytes),
            source_hash=file_hash,
        ))
        return

    if kind == "assignment" and not chain:
        # module-level assignment to an ALL_CAPS name = a policy knob
        targets = runtime.child_by_field_name(node, "left")
        target_text = runtime.node_text(targets, source_bytes) if targets is not None else ""
        if _CONST_NAME_RE.match(target_text.strip()):
            out.append(RuleCandidate(
                kind=_KIND_CONSTANT, path=rel_path,
                start_line=runtime.start_line(node), end_line=runtime.end_line(node),
                symbol=None, snippet=_snippet(node, source_bytes),
                source_hash=file_hash,
            ))
        return

    if kind == "call":
        cname = _call_name(node, source_bytes)
        if cname and _CALL_POLICY_RE.search(cname):
            out.append(RuleCandidate(
                kind=_KIND_PERMISSION, path=rel_path,
                start_line=runtime.start_line(node), end_line=runtime.end_line(node),
                symbol=_enclosing(chain), snippet=_snippet(node, source_bytes),
                source_hash=file_hash,
            ))
        if cname == "warn" and "DeprecationWarning" in runtime.node_text(node, source_bytes):
            out.append(RuleCandidate(
                kind=_KIND_DEPRECATION, path=rel_path,
                start_line=runtime.start_line(node), end_line=runtime.end_line(node),
                symbol=_enclosing(chain), snippet=_snippet(node, source_bytes),
                source_hash=file_hash,
            ))
        return

    for child in runtime.children(node):
        _walk(child, source_bytes, chain, out, rel_path, file_hash)


def find_candidates_in_source(rel_path: str, source: str) -> list[RuleCandidate]:
    """All candidates in one python source string (unit-testable)."""
    source_bytes = source.encode("utf-8")
    tree = runtime.parse_source("python", source)
    out: list[RuleCandidate] = []
    file_hash = hashlib.sha256(source_bytes).hexdigest()
    _walk(runtime.root_node(tree), source_bytes, [], out, rel_path, file_hash)
    # comment markers are line-level, not syntax nodes
    for lineno, line in enumerate(source.splitlines(), start=1):
        m = _TODO_RE.search(line)
        if m:
            out.append(RuleCandidate(
                kind=_KIND_TODO, path=rel_path,
                start_line=lineno, end_line=lineno,
                symbol=None, snippet=line.strip()[:118],
                source_hash=file_hash,
            ))
    return out


def find_candidates(
    workspace: Path,
    *,
    include_tests: bool = False,
) -> list[RuleCandidate]:
    """Scan a workspace's python sources for rule-shaped candidates."""
    workspace = Path(workspace)
    out: list[RuleCandidate] = []
    for path in sorted(workspace.rglob("*.py")):
        rel = path.relative_to(workspace).as_posix()
        parts = set(path.parts)
        if parts & _SKIP_DIRS:
            continue
        if not include_tests and any(part in {"tests", "test"} for part in path.parts):
            continue
        source = path.read_text(encoding="utf-8")
        out.extend(find_candidates_in_source(rel, source))
    return out


def candidates_to_dict(candidates: list[RuleCandidate]) -> list[dict[str, object]]:
    return [asdict(c) for c in candidates]


def write_candidates_manifest(workspace: Path, bundle: Path) -> Path:
    """Write ``<bundle>/.okf/candidates.json`` and return its path."""
    import json
    from datetime import UTC, datetime

    candidates = find_candidates(workspace)
    manifest = {
        "generated_at": datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "workspace": str(Path(workspace).resolve()),
        "count": len(candidates),
        "candidates": candidates_to_dict(candidates),
    }
    state_dir = Path(bundle) / ".okf"
    state_dir.mkdir(parents=True, exist_ok=True)
    path = state_dir / "candidates.json"
    path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return path
