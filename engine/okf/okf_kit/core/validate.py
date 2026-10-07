"""OKF conformance validation (SPEC §9; REQ-BM-04, REQ-API-01..04).

Walks a bundle, classifies every ``.md`` into errors / warnings / info, and
returns a :class:`Report`. The validator is the *only* judge — the parser is
permissive and never raises; this module turns parse diagnostics into
conformance findings.

Severity policy:
- **errors** (block conformance): missing/unparseable frontmatter, empty
  ``type``, malformed reserved files.
- **warnings**: missing recommended fields (``title``/``description``), broken
  internal links, 0.2 semantic drift (legacy keys/blocks, bad lifecycle
  shapes — advisory per §11).
- **info**: extension frontmatter keys, nested ``index.md`` carrying
  frontmatter (a forward-compat sub-bundle marker — NOT an error), missing or
  mismatched ``okf_version``, empty bundles.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from okf_kit.core.links import broken_links, cid_segments_valid, iter_concept_files
from okf_kit.core.parse import parse_concept

_KNOWN_FRONTMATTER_KEYS = frozenset(
    {
        # 0.1
        "type", "title", "description", "resource", "tags", "timestamp", "okf_version",
        # 0.2 (SPEC §5, §13.1)
        "status", "generated", "verified", "sources", "stale_after",
    }
)
_LEGACY_KEYS_0_2 = frozenset({"timestamp"})
_STATUS_VALUES = frozenset({"draft", "stable", "deprecated"})
# Warn only on the human-facing recommended fields; resource/tags are
# intentionally optional (often legitimately absent) and stay silent.
_RECOMMENDED_WARN_FIELDS = ("title", "description")
_SUPPORTED_OKF_VERSIONS = ("0.1", "0.2")


@dataclass
class Finding:
    severity: str  # 'error' | 'warning' | 'info'
    code: str
    message: str
    cid: str | None = None
    path: Path | None = None


@dataclass
class Report:
    errors: list[Finding] = field(default_factory=list)
    warnings: list[Finding] = field(default_factory=list)
    info: list[Finding] = field(default_factory=list)

    @property
    def conformant(self) -> bool:
        return not self.errors

    def to_dict(self) -> dict[str, Any]:
        return {
            "conformant": self.conformant,
            "errors": [vars(f) for f in self.errors],
            "warnings": [vars(f) for f in self.warnings],
            "info": [vars(f) for f in self.info],
        }


def validate_bundle(root: Path) -> Report:
    """Validate every ``.md`` under ``root`` against OKF v0.1 conformance."""
    root = Path(root).resolve()
    report = Report()
    concept_count = 0
    root_okf_version: str | None = None
    root_index_seen = False

    # Pre-scan: concepts must be checked against the bundle's declared
    # version regardless of file iteration order.
    root_index_path = root / "index.md"
    if root_index_path.is_file():
        pre = parse_concept(root_index_path, root)
        if pre.frontmatter_present:
            root_okf_version = pre.frontmatter.get("okf_version")

    for md in iter_concept_files(root):
        concept = parse_concept(md, root)
        rel = md.relative_to(root).as_posix()

        if concept.reserved == "index":
            if rel == "index.md":
                root_index_seen = True
                root_okf_version = concept.frontmatter.get("okf_version")
                for key in concept.frontmatter:
                    if key != "okf_version":
                        report.info.append(
                            Finding("info", "index-extra-key",
                                    f"root index.md has unexpected frontmatter key '{key}'",
                                    None, md)
                        )
            elif concept.frontmatter:
                # Forward-compat: a nested index.md carrying frontmatter is the
                # likely sub-bundle marker — info, not error (design §14).
                report.info.append(
                    Finding("info", "nested-index-frontmatter",
                            "nested index.md carries frontmatter (possible sub-bundle marker)",
                            concept.cid, md)
                )
            if concept.frontmatter_error:
                report.errors.append(
                    Finding("error", "frontmatter-invalid", concept.frontmatter_error,
                            concept.cid, md)
                )
            continue

        if concept.reserved == "log":
            if concept.frontmatter_error:
                report.errors.append(
                    Finding("error", "frontmatter-invalid", concept.frontmatter_error,
                            concept.cid, md)
                )
            elif concept.frontmatter:
                report.info.append(
                    Finding("info", "log-frontmatter", "log.md carries frontmatter",
                            concept.cid, md)
                )
            continue

        concept_count += 1
        _check_concept(report, concept, root_okf_version)

    if concept_count == 0:
        report.info.append(Finding("info", "empty-bundle", "bundle has no concept files"))

    _check_okf_version(report, root, root_index_seen, root_okf_version)
    return report


def _check_concept(report: Report, concept: Any, okf_version: str | None = None) -> None:
    if concept.frontmatter_error:
        report.errors.append(
            Finding("error", "frontmatter-invalid", concept.frontmatter_error,
                    concept.cid, concept.path)
        )
        return
    if not concept.frontmatter_present:
        report.errors.append(
            Finding("error", "frontmatter-missing", "missing frontmatter block",
                    concept.cid, concept.path)
        )
        return

    if not cid_segments_valid(concept.cid):
        report.warnings.append(
            Finding(
                "warning",
                "invalid-cid",
                f"concept id '{concept.cid}' violates the kit segment rules "
                "(unaddressable by read_concept / search-graph)",
                concept.cid,
                concept.path,
            )
        )

    type_value = concept.frontmatter.get("type")
    if not isinstance(type_value, str) or not type_value.strip():
        report.errors.append(
            Finding("error", "type-empty", "frontmatter missing non-empty 'type'",
                    concept.cid, concept.path)
        )

    for name in _RECOMMENDED_WARN_FIELDS:
        value = concept.frontmatter.get(name)
        if value in (None, ""):
            report.warnings.append(
                Finding("warning", f"missing-{name}",
                        f"missing recommended field '{name}'", concept.cid, concept.path)
            )

    for key in concept.frontmatter:
        if key not in _KNOWN_FRONTMATTER_KEYS:
            report.info.append(
                Finding("info", "extension-key", f"extension frontmatter key '{key}'",
                        concept.cid, concept.path)
            )

    if okf_version == "0.2":
        _check_concept_0_2(report, concept)

    for target in broken_links(concept.root, concept):
        report.warnings.append(
            Finding("warning", "broken-link", f"broken internal link '{target}'",
                    concept.cid, concept.path)
        )


def _check_concept_0_2(report: Report, concept: Any) -> None:
    """OKF 0.2 semantics (SPEC §5, §13.1) — advisory warnings, not errors:
    consumers MUST NOT reject (§11); the validator's job is to surface drift."""
    fm = concept.frontmatter

    if "timestamp" in fm:
        report.warnings.append(
            Finding("warning", "legacy-timestamp",
                    "'timestamp' is superseded by 'generated: {by, at}' (§13.1)",
                    concept.cid, concept.path)
        )
    if re.search(r"^#\s+Citations\b", concept.body, re.MULTILINE):
        report.warnings.append(
            Finding("warning", "legacy-citations",
                    "body '# Citations' is superseded by frontmatter 'sources' (§13.1)",
                    concept.cid, concept.path)
        )

    status = fm.get("status")
    if status is not None and status not in _STATUS_VALUES:
        report.warnings.append(
            Finding("warning", "invalid-status",
                    f"'status' must be draft | stable | deprecated, got '{status}' (§5.4)",
                    concept.cid, concept.path)
        )

    generated = fm.get("generated")
    if generated is not None:
        ok = isinstance(generated, dict) and isinstance(generated.get("by"), str) and bool(generated.get("by"))
        if not ok:
            report.warnings.append(
                Finding("warning", "invalid-generated",
                        "'generated' must be a mapping with non-empty 'by' (§5.2)",
                        concept.cid, concept.path)
            )

    verified = fm.get("verified")
    if verified is not None:
        events = verified if isinstance(verified, list) else [verified]
        ok = all(isinstance(e, dict) and isinstance(e.get("by"), str) and bool(e.get("by")) for e in events)
        if not ok:
            report.warnings.append(
                Finding("warning", "invalid-verified",
                        "'verified' must be (a list of) mappings with non-empty 'by' (§5.2)",
                        concept.cid, concept.path)
            )

    sources = fm.get("sources")
    if sources is not None:
        ok = isinstance(sources, list) and all(
            isinstance(s, dict) and isinstance(s.get("id"), str) and isinstance(s.get("resource"), str)
            for s in sources
        )
        if not ok:
            report.warnings.append(
                Finding("warning", "invalid-sources",
                        "'sources' must be a list of mappings with 'id' and 'resource' (§5.1)",
                        concept.cid, concept.path)
            )

    if "stale_after" in fm and not isinstance(fm.get("stale_after"), str):
        report.warnings.append(
            Finding("warning", "invalid-stale-after",
                    "'stale_after' must be an absolute ISO-8601 instant (§5.5)",
                    concept.cid, concept.path)
        )


def _check_okf_version(
    report: Report, root: Path, root_index_seen: bool, version: str | None
) -> None:
    if not root_index_seen or version is None:
        report.info.append(
            Finding("info", "okf-version-missing",
                    "root index.md missing okf_version", None, root / "index.md")
        )
    elif version not in _SUPPORTED_OKF_VERSIONS:
        report.info.append(
            Finding("info", "okf-version-mismatch",
                    f"okf_version '{version}' (supported: {'/'.join(_SUPPORTED_OKF_VERSIONS)})",
                    None, root / "index.md")
        )
