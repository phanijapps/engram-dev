"""Tests for prompt-from-stdin parsing, turn loading, and status/info dispatch."""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path

import pytest

from memex.cli import _load_turns


class _FakeStdin:
    def __init__(self, payload: str, *, tty: bool = False) -> None:
        self._stream = io.StringIO(payload)
        self._tty = tty

    def isatty(self) -> bool:
        return self._tty

    def read(self) -> str:
        return self._stream.read()


class TestLoadTurns:
    def test_valid_turns(self, tmp_path: Path) -> None:
        path = tmp_path / "t.jsonl"
        path.write_text(
            json.dumps({"role": "user", "content": "hi", "turn": 1})
            + "\n"
            + json.dumps({"role": "agent", "content": "hello", "turn": 2}),
            encoding="utf-8",
        )
        turns = _load_turns(path)
        assert len(turns) == 2

    def test_skips_session_headers_and_blank_lines(self, tmp_path: Path) -> None:
        path = tmp_path / "t.jsonl"
        path.write_text(
            "\n"
            + json.dumps({"session_meta": {"id": "s1"}})
            + "\n"
            + json.dumps({"role": "user", "content": "hi", "turn": 1}),
            encoding="utf-8",
        )
        turns = _load_turns(path)
        assert len(turns) == 1

    def test_invalid_json_raises_with_line_number(self, tmp_path: Path) -> None:
        path = tmp_path / "t.jsonl"
        path.write_text(
            '{"role": "user", "content": "hi", "turn": 1}\nnot json\n', encoding="utf-8"
        )
        with pytest.raises(ValueError, match=r"t.jsonl:2"):
            _load_turns(path)

    def test_invalid_turn_raises_with_line_number(self, tmp_path: Path) -> None:
        path = tmp_path / "t.jsonl"
        path.write_text('{"role": "bogus-role", "content": "x"}\n', encoding="utf-8")
        with pytest.raises(ValueError, match=r"t.jsonl:1"):
            _load_turns(path)


class TestStatusInfoDispatch:
    def test_status(self, monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
        from memex.cli import main

        monkeypatch.setenv("MEMEX_DATA_DIR", str(tmp_path))
        monkeypatch.setattr("sys.argv", ["memex", "status"])
        assert main() == 0

    def test_info(self, monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
        from memex.cli import main

        monkeypatch.setenv("MEMEX_DATA_DIR", str(tmp_path))
        monkeypatch.setattr("sys.argv", ["memex", "info"])
        assert main() == 0


class TestDispatchSmoke:

    def test_backup(self, monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
        from memex import cli

        out = tmp_path / "backup.zip"
        monkeypatch.setenv("MEMEX_DATA_DIR", str(tmp_path / "store"))
        monkeypatch.setattr("sys.argv", ["memex", "backup", "--output", str(out)])
        assert cli.main() == 0
        assert out.exists()

    def test_approve_unknown_slug_fails(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path: Path
    ) -> None:
        from memex import cli

        monkeypatch.setenv("MEMEX_DATA_DIR", str(tmp_path))
        monkeypatch.setattr("sys.argv", ["memex", "approve", "ghost"])
        assert cli.main() != 0
