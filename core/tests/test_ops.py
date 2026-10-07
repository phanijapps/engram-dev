"""Federated search, compile-with-manifest, findings ledger, record + status."""

from __future__ import annotations

from pathlib import Path

from conftest import write_concept

from memex_core.compile_context import compile_context
from memex_core.findings import (
    FindingsError,
    list_findings,
    propose_finding,
    resolve_finding,
)
from memex_core.knowledge import wiki_update
from memex_core.record import record_note
from memex_core.search import federated_search
from memex_core.status import combined_status


def _seed(repo: Path, store: Path, wiki: Path) -> None:
    record_note(
        "Deploys happen on Fridays",
        "The team deploys to production on Fridays only.",
        type_="preference",
        data_dir=store,
    )
    write_concept(
        wiki,
        "domain/deploy-policy",
        type_="Rule",
        title="Deploy policy",
        body="Production deploys happen on Fridays only.",
    )


def test_federated_search_interleaves_origins(repo: Path, store: Path, wiki: Path) -> None:
    _seed(repo, store, wiki)
    hits = federated_search("deploy Fridays", cwd=repo, data_dir=store)
    origins = [h.origin for h in hits]
    assert "memory" in origins and "wiki" in origins
    assert len(hits) >= 2
    ranks = [h.rank for h in hits]
    assert ranks == list(range(1, len(hits) + 1))


def test_federated_search_source_filter(repo: Path, store: Path, wiki: Path) -> None:
    _seed(repo, store, wiki)
    only_wiki = federated_search("deploy Fridays", cwd=repo, data_dir=store, source="wiki")
    assert only_wiki and all(h.origin == "wiki" for h in only_wiki)


def test_compile_manifest_and_budget(repo: Path, store: Path, wiki: Path) -> None:
    _seed(repo, store, wiki)
    compiled = compile_context(["When do deploys happen?"], cwd=repo, data_dir=store)
    assert compiled.manifest.status == "ok"
    assert compiled.manifest.included
    assert "memory" in compiled.context or "wiki" in compiled.context
    assert compiled.manifest.tokens <= compiled.manifest.budget


def test_compile_insufficient_budget_is_explicit(repo: Path, store: Path, wiki: Path) -> None:
    _seed(repo, store, wiki)
    compiled = compile_context(
        ["When do deploys happen?", "What is the release process?"],
        cwd=repo,
        data_dir=store,
        budget=8,
    )
    assert compiled.manifest.status == "CONTEXT_INSUFFICIENT"
    assert compiled.context == ""


def test_compile_deterministic(repo: Path, store: Path, wiki: Path) -> None:
    _seed(repo, store, wiki)
    first = compile_context(["deploy policy"], cwd=repo, data_dir=store)
    second = compile_context(["deploy policy"], cwd=repo, data_dir=store)
    assert first.context == second.context
    assert first.manifest.included == second.manifest.included


def test_findings_lifecycle_and_dedupe(repo: Path, wiki: Path) -> None:
    first = propose_finding(
        "src/payments.py", "wiki/domain/refund-rule.md", "golden-path", cwd=repo
    )
    assert first["status"] == "pending"
    again = propose_finding(
        "src/payments.py", "wiki/domain/refund-rule.md", "golden-path", cwd=repo
    )
    assert again["deduped"] is True and again["id"] == first["id"]

    accepted = resolve_finding(first["id"], decision="accepted", cwd=repo)  # type: ignore[arg-type]
    assert accepted["status"] == "accepted"

    declined = propose_finding(
        "src/legacy.py", "wiki/domain/legacy.md", "golden-path", cwd=repo
    )
    resolve_finding(declined["id"], decision="declined", cwd=repo)  # type: ignore[arg-type]
    refused = propose_finding(
        "src/legacy.py", "wiki/domain/legacy.md", "golden-path", cwd=repo
    )
    assert refused["refused"] is True
    assert refused["status"] == "declined"

    assert [f["status"] for f in list_findings(status="pending", cwd=repo)] == []
    assert len(list_findings(cwd=repo)) == 2


def test_findings_resolve_rejects_terminal(repo: Path, wiki: Path) -> None:
    finding = propose_finding("a.md", "b.md", "constraint", cwd=repo)
    resolve_finding(finding["id"], decision="accepted", cwd=repo)  # type: ignore[arg-type]
    try:
        resolve_finding(finding["id"], decision="declined", cwd=repo)  # type: ignore[arg-type]
        raise AssertionError("expected FindingsError")
    except FindingsError:
        pass


def test_record_note_and_combined_status(repo: Path, store: Path, wiki: Path) -> None:
    _seed(repo, store, wiki)
    wiki_update(repo)
    status = combined_status(repo, data_dir=store)
    assert status["memory"]["index_total"] >= 1
    assert status["wiki"]["present"] is True
    assert status["wiki"]["freshness"] == "fresh"
    assert status["wiki"]["concept_count"] >= 2


def test_record_note_project_scope_requires_identity(repo: Path, store: Path) -> None:
    try:
        record_note("No identity", "body", scope="project", data_dir=store)
        raise AssertionError("expected ValueError")
    except ValueError as exc:
        assert "project_id" in str(exc)
