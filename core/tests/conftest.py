"""Shared fixtures: isolated repo, store, and wiki — never the real ~/.memex."""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest


def _git(cwd: Path, *args: str) -> None:
    subprocess.run(
        ["git", *args],
        cwd=cwd,
        capture_output=True,
        text=True,
        timeout=10,
        check=True,
    )


@pytest.fixture
def repo(tmp_path: Path) -> Path:
    """A git repo with one commit and one Python source file."""
    root = tmp_path / "repo"
    root.mkdir()
    _git(root, "init", "-q", "-b", "main")
    _git(root, "config", "user.email", "test@example.com")
    _git(root, "config", "user.name", "test")
    (root / "greet.py").write_text(
        'def greet(name: str) -> str:\n    """Return a greeting."""\n    return f"hello {name}"\n',
        encoding="utf-8",
    )
    _git(root, "add", "-A")
    _git(root, "commit", "-q", "-m", "init")
    return root


@pytest.fixture
def store(tmp_path: Path) -> Path:
    """An isolated memory store directory (never ~/.memex)."""
    data_dir = tmp_path / "memex-data"
    data_dir.mkdir()
    return data_dir


@pytest.fixture
def wiki(repo: Path) -> Path:
    """A wiki bundle initialized via the core op."""
    from memex_core.knowledge import wiki_init

    report = wiki_init(repo)
    return Path(report["bundle_root"])


def write_concept(bundle: Path, cid: str, *, type_: str, title: str, body: str) -> Path:
    path = bundle / f"{cid}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        f"---\ntype: {type_}\ntitle: {title}\ndescription: {title}\n---\n\n# {title}\n\n{body}\n",
        encoding="utf-8",
    )
    return path
