"""findings: the authority ledger for normative wiki proposals.

Minimal shape of the kit U3 contract: a TOML ledger at
``<repo>/wiki/.okf/findings.toml`` with the two rules that matter —

- dedupe by ``(source, destination, kind)``: re-proposing an existing
  finding is idempotent (returns the existing one);
- a **declined** finding is never re-proposed at that key.

Every agent- or model-authored change to normative wiki content routes
through ``propose_finding``; nothing lands ``stable`` without an accepted
finding or binding evidence.
"""

from __future__ import annotations

import hashlib
import json
import tomllib
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path

from memex_core.resolve import OKF_STATE_DIRNAME, WIKI_DIRNAME, repo_root_of

FINDINGS_FILENAME = "findings.toml"


class FindingsError(ValueError):
    """Invalid ledger request (missing repo, unknown finding, bad state)."""


@dataclass(slots=True)
class Finding:
    id: str
    source: str
    destination: str
    kind: str
    status: str  # pending | accepted | declined
    rationale: str
    proposed_at: str
    resolved_at: str | None = None


def findings_path(cwd: Path) -> Path:
    root = repo_root_of(Path(cwd))
    if root is None:
        raise FindingsError("not a git repository")
    return root / WIKI_DIRNAME / OKF_STATE_DIRNAME / FINDINGS_FILENAME


def _now() -> str:
    return datetime.now(UTC).isoformat()


def _finding_id(source: str, destination: str, kind: str) -> str:
    digest = hashlib.sha1(f"{source}|{destination}|{kind}".encode("utf-8")).hexdigest()[:8]
    return f"{kind}-{digest}"


def _load(ledger: Path) -> list[Finding]:
    if not ledger.is_file():
        return []
    with ledger.open("rb") as handle:
        data = tomllib.load(handle)
    return [
        Finding(
            id=str(entry["id"]),
            source=str(entry["source"]),
            destination=str(entry["destination"]),
            kind=str(entry["kind"]),
            status=str(entry["status"]),
            rationale=str(entry.get("rationale", "")),
            proposed_at=str(entry.get("proposed_at", "")),
            resolved_at=str(entry["resolved_at"]) if entry.get("resolved_at") else None,
        )
        for entry in data.get("findings", [])
        if isinstance(entry, dict) and "id" in entry
    ]


def _dump(findings: list[Finding], ledger: Path) -> None:
    def q(value: str) -> str:
        return json.dumps(value)  # JSON string escaping is TOML basic-string safe

    lines: list[str] = ["# memex-core findings ledger (managed)", ""]
    for f in findings:
        lines.append("[[findings]]")
        lines.append(f"id = {q(f.id)}")
        lines.append(f"source = {q(f.source)}")
        lines.append(f"destination = {q(f.destination)}")
        lines.append(f"kind = {q(f.kind)}")
        lines.append(f"status = {q(f.status)}")
        lines.append(f"rationale = {q(f.rationale)}")
        lines.append(f"proposed_at = {q(f.proposed_at)}")
        resolved = f.resolved_at if f.resolved_at is not None else ""
        lines.append(f"resolved_at = {q(resolved)}")
        lines.append("")
    ledger.parent.mkdir(parents=True, exist_ok=True)
    ledger.write_text("\n".join(lines), encoding="utf-8")


def propose_finding(
    source: str,
    destination: str,
    kind: str,
    *,
    rationale: str = "",
    cwd: Path,
) -> dict[str, object]:
    """Add a finding; idempotent per dedupe key; declined keys stay declined."""
    ledger = findings_path(Path(cwd))
    findings = _load(ledger)
    existing = next(
        (f for f in findings if (f.source, f.destination, f.kind) == (source, destination, kind)),
        None,
    )
    if existing is not None:
        return {**asdict(existing), "deduped": True, "refused": existing.status == "declined"}
    finding = Finding(
        id=_finding_id(source, destination, kind),
        source=source,
        destination=destination,
        kind=kind,
        status="pending",
        rationale=rationale,
        proposed_at=_now(),
    )
    findings.append(finding)
    findings.sort(key=lambda f: (f.kind, f.id))
    _dump(findings, ledger)
    return {**asdict(finding), "deduped": False, "refused": False}


def resolve_finding(finding_id: str, *, decision: str, cwd: Path) -> dict[str, object]:
    """Accept or decline a pending finding; terminal states are immutable."""
    if decision not in {"accepted", "declined"}:
        raise FindingsError("decision must be accepted or declined")
    ledger = findings_path(Path(cwd))
    findings = _load(ledger)
    for finding in findings:
        if finding.id == finding_id:
            if finding.status != "pending":
                raise FindingsError(f"finding {finding_id} is already {finding.status}")
            finding.status = decision
            finding.resolved_at = _now()
            _dump(findings, ledger)
            return asdict(finding)
    raise FindingsError(f"no finding with id {finding_id}")


def list_findings(*, status: str | None = None, cwd: Path) -> list[dict[str, object]]:
    """All findings, optionally filtered by status, oldest first."""
    if status is not None and status not in {"pending", "accepted", "declined"}:
        raise FindingsError("status must be pending, accepted, or declined")
    ledger = findings_path(Path(cwd))
    findings = _load(ledger)
    return [asdict(f) for f in findings if status is None or f.status == status]
