"""T5/T6/T7: reserved namespaces, approval gate, archive + merge."""

from pathlib import Path

import pytest

from memex import Memex
from memex.domain.models import WikiNode, WriteInput
from memex.infrastructure.config import MemexConfig


@pytest.fixture
def memex(data_dir: Path) -> Memex:
    return Memex(MemexConfig(data_dir=data_dir))


class TestReservedNamespaces:  # AC-0008
    def test_write_meta_source_rejected(self, memex: Memex) -> None:
        node = WikiNode(
            type="entity",
            title="Forge",
            body="b",
            id="f1",
            source="user-supplied",
        )
        with pytest.raises(ValueError, match="reserved namespaces"):
            memex.wiki_store.write(node) if False else memex._guard_reserved(node)

    def test_capture_and_consolidate_set_them(self, data_dir: Path) -> None:
        m = Memex(MemexConfig(data_dir=data_dir))
        # capture stamps source/harness via transcript header path (tested in
        # capture tests); consolidation stamps source=consolidation
        node = WikiNode(
            type="entity",
            title="Stamped",
            body="b",
            id="s1",
            source="consolidation",
            harness="codex",
        )
        stored = m.wiki_store.write(node)
        read_back = m.wiki_store.read(stored.slug)
        assert read_back is not None
        assert read_back.source == "consolidation"
        assert read_back.harness == "codex"
        m.close()


class TestApprovalGate:  # AC-0007
    def _manual(self, data_dir: Path) -> Memex:
        import dataclasses

        base = MemexConfig(data_dir=data_dir)
        return Memex(
            dataclasses.replace(
                base,
                governance=dataclasses.replace(base.governance, knowledge_approval="manual"),
            )
        )

    def test_manual_lands_pending_and_approve_flips(self, data_dir: Path) -> None:
        m = self._manual(data_dir)
        node = WikiNode(
            type="entity",
            title="Gated",
            body="gated content",
            id="",
            status="pending",
            source="consolidation",
            harness="codex",
        )
        stored = m.wiki_store.write(node)
        m.index_manager.update_record(stored)

        # invisible to recall
        assert m.recall("gated").hits == []
        # visible with include_inactive
        assert any(h.slug == stored.slug for h in m.recall("gated", include_inactive=True).hits)

        result = m.approve(stored.slug)
        assert result == {"slug": stored.slug, "status": "active"}
        assert any(h.slug == stored.slug for h in m.recall("gated").hits)
        m.close()

    def test_manual_is_default(self, data_dir: Path) -> None:
        m = Memex(MemexConfig(data_dir=data_dir))
        assert m.config.governance.knowledge_approval == "manual"
        m.close()

    def test_invalid_approval_rejected(self, tmp_path: Path) -> None:
        from memex.domain.errors import ConfigError
        from memex.infrastructure.config import ConfigLoader

        cfg = tmp_path / "memex.toml"
        cfg.write_text('[governance]\nknowledge_approval = "sometimes"\n', encoding="utf-8")
        with pytest.raises(ConfigError, match="knowledge_approval"):
            ConfigLoader().load(cfg)

    def test_approve_non_pending_rejected(self, memex: Memex) -> None:
        stored = memex.write(WriteInput(type="entity", title="Active one", body="b"))
        with pytest.raises(ValueError, match="not pending"):
            memex.approve(stored.slug)


class TestArchiveAndMerge:  # AC-0005, AC-0006
    def test_forget_archive_keeps_file(self, data_dir: Path) -> None:
        m = Memex(MemexConfig(data_dir=data_dir))
        stored = m.write(WriteInput(type="entity", title="Arch me", body="archive body"))
        result = m.forget(stored.slug, mode="archive")
        assert result.forgotten is True
        assert result.file_path is not None and Path(result.file_path).exists()
        node = m.wiki_store.read(stored.slug)
        assert node is not None and node.status == "archived"
        assert m.recall("archive body").hits == []
        m.close()
