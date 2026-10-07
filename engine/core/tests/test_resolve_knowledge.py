"""resolve + knowledge ops: identity, wiki init/update, freshness."""

from __future__ import annotations

from pathlib import Path

from conftest import write_concept

from memex_core.knowledge import wiki_init, wiki_update
from memex_core.resolve import resolve


def test_resolve_without_wiki_reports_absent(repo: Path, store: Path) -> None:
    report = resolve(repo, data_dir=store)
    assert report.repo_root == str(repo)
    assert report.repo_head
    assert report.wiki.present is False
    assert report.wiki.freshness == "absent"
    assert report.memory_data_dir == str(store)


def test_resolve_with_fresh_wiki(repo: Path, store: Path, wiki: Path) -> None:
    wiki_update(repo)
    report = resolve(repo, data_dir=store)
    assert report.wiki.present is True
    assert report.wiki.okf_version == "0.2"
    assert report.wiki.freshness == "fresh"
    assert report.wiki.concept_count >= 1  # at least the indexed module


def test_resolve_flags_stale_after_new_commit(repo: Path, store: Path, wiki: Path) -> None:
    import subprocess

    wiki_update(repo)
    (repo / "notes.txt").write_text("change", encoding="utf-8")
    subprocess.run(
        ["git", "add", "-A"], cwd=repo, capture_output=True, check=True, timeout=10
    )
    subprocess.run(
        ["git", "commit", "-q", "-m", "change"],
        cwd=repo,
        capture_output=True,
        check=True,
        timeout=10,
    )
    report = resolve(repo, data_dir=store)
    assert report.wiki.freshness == "stale"


def test_wiki_init_refuses_existing(repo: Path) -> None:
    wiki_init(repo)
    try:
        wiki_init(repo)
        raise AssertionError("expected KnowledgeError")
    except ValueError as exc:
        assert "already exists" in str(exc)


def test_wiki_update_indexes_source(repo: Path, wiki: Path) -> None:
    result = wiki_update(repo)
    counts = result["counts"]
    assert isinstance(counts, dict)
    assert counts.get("written", counts.get("modules", 0)) >= 1
    stamp = Path(result["stamp"]["repo_root"]) / "wiki" / ".okf" / "last-index.json"
    assert stamp.is_file()


def test_wiki_update_counts_hand_written_concepts(repo: Path, wiki: Path) -> None:
    write_concept(wiki, "domain/greeting-rule", type_="Rule", title="Greeting rule", body="Always greet warmly.")
    wiki_update(repo)
    report = resolve(repo)
    assert report.wiki.concept_count >= 2
