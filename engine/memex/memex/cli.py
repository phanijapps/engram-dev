"""Command-line interface for all memex operations (spec §7 Utility 10)."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections.abc import Sequence
from pathlib import Path

from memex import Memex, __version__
from memex.application.compiler import build_injection
from memex.application.dto import to_jsonable
from memex.application.verify import verify as run_verify
from memex.domain.errors import MemexError
from memex.domain.models import (
    ConsolidateInput,
    IngestTranscriptInput,
    TaskRecallInput,
    TurnStreamEntry,
    WriteInput,
)
from memex.domain.operations import summary
from memex.infrastructure.config import ConfigLoader
from memex.infrastructure.harness.transcripts import (
    HARNESSES,
    parse_transcript,
    read_transcript_turns,
    suggest_session_id,
)
from memex.infrastructure.workspace_context import project_context, session_query

_SESSION_ID_CHARS = re.compile(r"[^A-Za-z0-9._-]+")


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="memex", description="Filesystem wiki memory harness")
    parser.add_argument("--version", action="version", version=f"memex {__version__}")
    parser.add_argument("--data-dir", type=Path, default=None, help="Override the data directory")
    sub = parser.add_subparsers(dest="command", required=True)

    write = sub.add_parser("write", help=summary("memex_write"))
    write.add_argument(
        "--type",
        required=True,
        help="Built-in, enabled catalogue, or declared type (see memex types list)",
    )
    write.add_argument("--title", required=True)
    write.add_argument("--body", required=True)
    write.add_argument(
        "--description",
        default=None,
        help="Optional one-sentence description (single line, <=512 UTF-8 bytes)",
    )
    write.add_argument("--tags", default="", help="Comma-separated tags")
    write.add_argument("--importance", type=float, default=0.5)
    write.add_argument(
        "--link",
        action="append",
        default=[],
        metavar="TARGET[:REL]",
        help="Typed OKF link; repeatable. REL defaults to 'relates-to'",
    )
    write.add_argument("--resource", default=None, help="Canonical URI of the underlying asset")
    write.add_argument("--parent", default=None, help="Slug of the hierarchical parent page")
    write.add_argument("--supersedes", default="", help="Comma-separated slugs this page replaces")
    write.add_argument("--implements", default="", help="Comma-separated slugs this page realizes")
    write.add_argument("--depends-on", default="", help="Comma-separated slugs this page needs")
    write.add_argument("--session-id", default=None)
    write.add_argument("--stale-after", default=None)
    write.add_argument("--valid-from", default=None)
    write.add_argument("--valid-until", default=None)
    write.add_argument("--scope", choices=["global", "project"], default="global")
    write.add_argument("--project-id", default=None)
    write.add_argument("--project-label", default=None)

    recall = sub.add_parser("recall", help=summary("memex_recall"))
    recall.add_argument("query")
    recall.add_argument(
        "--question",
        action="append",
        default=None,
        help="Project task question (repeat up to three times)",
    )
    recall.add_argument("--top-k", type=int, default=None)
    recall.add_argument("--type", default=None)
    recall.add_argument("--tag", action="append", default=None)
    recall.add_argument("--include-expired", action="store_true")
    recall.add_argument("--include-inactive", action="store_true")
    recall.add_argument("--max-tokens", type=int, default=None)
    recall.add_argument("--scope", choices=["global", "project"], default=None)
    recall.add_argument("--project-id", default=None)
    recall.add_argument(
        "--engine",
        choices=["fts5", "navigation"],
        default="fts5",
        help="fts5 searches the index; navigation ranks generated index.md rows",
    )

    consolidate = sub.add_parser("consolidate", help=summary("memex_consolidate"))
    consolidate.add_argument("--mode", choices=["full", "dry-run"], default="full")
    consolidate.add_argument("--max-episodes", type=int, default=10)

    forget = sub.add_parser("forget", help=summary("memex_forget"))
    forget.add_argument("slug")
    forget.add_argument("--mode", choices=["hard", "soft", "decay", "archive"], default="hard")
    forget.add_argument("--valid-until", default=None)

    ingest = sub.add_parser("ingest-transcript", help=summary("memex_ingest_transcript"))
    ingest.add_argument("--session-id", required=True)
    ingest.add_argument("--turns-file", type=Path, required=True)
    ingest.add_argument("--overwrite", action="store_true")

    clear_transcripts = sub.add_parser("clear-transcripts", help=summary("memex_clear_transcripts"))
    clear_transcripts.add_argument("--confirm", action="store_true")

    rebuild = sub.add_parser("rebuild-index", help="Rebuild the secondary index from the wiki")
    rebuild.add_argument("--force", action="store_true")

    backup = sub.add_parser("backup", help="Archive wiki, transcripts, and index")
    backup.add_argument("--output", type=Path, required=True)
    backup.add_argument("--no-mem-db", action="store_true")

    restore = sub.add_parser("restore", help="Restore from an archive")
    restore.add_argument("--input", type=Path, required=True)

    approve_cmd = sub.add_parser("approve", help="Approve a pending page (flip status to active)")
    approve_cmd.add_argument("slug")

    types_cmd = sub.add_parser("types", help="Declare and inspect project concept types")
    types_sub = types_cmd.add_subparsers(dest="types_command", required=True)
    for name, doc in (
        ("list", "List built-in, catalogue, custom, and draft types"),
        ("add", "Declare a custom type"),
        ("enable", "Enable a catalogue type"),
        ("remove", "Withdraw a type (archives its pages with --force)"),
        ("suggest", "Tags that recur but are not yet types"),
    ):
        sp = types_sub.add_parser(name, help=doc)
        if name in {"add", "enable", "remove"}:
            sp.add_argument("name")
        if name == "add":
            sp.add_argument("--description", default="")
        if name == "remove":
            sp.add_argument("--force", action="store_true")
        if name == "suggest":
            sp.add_argument("--min-pages", type=int, default=3)
        sp.add_argument("--scope", choices=["project"], default="project")
        sp.add_argument("--project-id", default=None)
        sp.add_argument("--project-label", default=None)

    sub.add_parser("sessions", help="List captured sessions with harness token usage")

    sub.add_parser("info", help="Show data directory and index statistics")

    sub.add_parser("status", help="Memory health: freshness, captures, pending, zero-yield")

    verify_cmd = sub.add_parser(
        "verify", help="Deterministic gate: memory health and activity evidence"
    )
    verify_cmd.add_argument("--since", default=None, help="ISO8601 cutoff for activity evidence")
    verify_cmd.add_argument("--require-recall", action="store_true")
    verify_cmd.add_argument("--require-write", action="store_true")

    return parser


def _csv(value: str) -> list[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


def _load_turns(path: Path) -> list[TurnStreamEntry]:
    """Turns from a JSONL file; session-header lines are skipped."""
    turns: list[TurnStreamEntry] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path.name}:{line_number}: {exc}") from exc
        if not isinstance(entry, dict) or "role" not in entry:
            continue
        try:
            turns.append(TurnStreamEntry.from_dict(entry))
        except ValueError as exc:
            raise ValueError(f"{path.name}:{line_number}: {exc}") from exc
    return turns


def _make_memex(args: argparse.Namespace) -> Memex:
    data_dir = args.data_dir.expanduser() if args.data_dir is not None else None
    return Memex(ConfigLoader().load(data_dir=data_dir))


def _emit(payload: object) -> None:
    print(json.dumps(to_jsonable(payload), indent=2))


def _run(args: argparse.Namespace) -> int:
    memex = _make_memex(args)
    try:
        if args.command == "write":
            project_id, project_label, project_locator = _project_arguments(args)
            node = memex.write(
                WriteInput(
                    type=args.type,
                    title=args.title,
                    body=args.body,
                    description=args.description or "",
                    tags=_csv(args.tags),
                    importance=args.importance,
                    resource=args.resource,
                    links=list(args.link),
                    parent=args.parent,
                    supersedes=_csv(args.supersedes),
                    implements=_csv(args.implements),
                    depends_on=_csv(args.depends_on),
                    session_id=args.session_id,
                    stale_after=args.stale_after,
                    valid_from=args.valid_from,
                    valid_until=args.valid_until,
                    scope=args.scope,
                    project_id=project_id,
                    project_label=project_label,
                    project_locator=project_locator,
                )
            )
            _emit({"slug": node.slug, "file_path": node.file_path})
        elif args.command == "recall":
            if args.question is not None:
                if args.scope == "global" or args.include_expired or args.include_inactive:
                    raise ValueError("task recall requires active project scope")
                args.scope = "project"
                project_id, _, _ = _project_arguments(args)
                if project_id is None:
                    raise ValueError("project identity could not be derived")
                _emit(
                    memex.recall_task(
                        TaskRecallInput(
                            goal=args.query,
                            questions=args.question,
                            project_id=project_id,
                            max_hits=min(args.top_k, 36) if args.top_k is not None else 36,
                            max_tokens=args.max_tokens if args.max_tokens is not None else 4096,
                            node_type=args.type,
                            tags=args.tag,
                        )
                    )
                )
            else:
                project_id, _, _ = _project_arguments(args)
                _emit(
                    memex.recall(
                        args.query,
                        top_k=args.top_k,
                        node_type=args.type,
                        tags=args.tag,
                        include_expired=args.include_expired,
                        include_inactive=args.include_inactive,
                        max_tokens=args.max_tokens,
                        scope=args.scope or "global",
                        project_id=project_id,
                        engine=args.engine,
                    )
                )
        elif args.command == "consolidate":
            _emit(
                memex.consolidate(ConsolidateInput(mode=args.mode, max_episodes=args.max_episodes))
            )
        elif args.command == "forget":
            _emit(memex.forget(args.slug, mode=args.mode, valid_until=args.valid_until))
        elif args.command == "ingest-transcript":
            _emit(
                memex.ingest_transcript(
                    IngestTranscriptInput(
                        session_id=args.session_id, turns=_load_turns(args.turns_file)
                    ),
                    overwrite=args.overwrite,
                )
            )
        elif args.command == "clear-transcripts":
            _emit({"cleared": memex.clear_transcripts(confirm=args.confirm)})
        elif args.command == "rebuild-index":
            _emit(memex.rebuild_index(force=args.force))
        elif args.command == "backup":
            _emit(memex.backup(args.output, include_mem_db=not args.no_mem_db))
        elif args.command == "restore":
            _emit(memex.restore(args.input))
        elif args.command == "approve":
            _emit(memex.approve(args.slug))
        elif args.command == "types":
            project_id, _label, locator = _project_arguments(args)
            if project_id is None:
                raise ValueError("project identity could not be derived")
            if args.types_command == "list":
                _emit(
                    memex.types.list(
                        scope="project", project_id=project_id, project_locator=locator
                    )
                )
            elif args.types_command == "add":
                _emit(
                    memex.types.add(
                        args.name,
                        project_id=project_id,
                        description=args.description,
                        project_locator=locator,
                    )
                )
            elif args.types_command == "enable":
                _emit(memex.types.enable(args.name, project_id=project_id, project_locator=locator))
            elif args.types_command == "remove":
                _emit(
                    memex.types.remove(
                        args.name, project_id=project_id, force=args.force, project_locator=locator
                    )
                )
            elif args.types_command == "suggest":
                _emit(
                    [
                        {"tag": tag, "pages": count}
                        for tag, count in memex.types.suggest(
                            project_id=project_id, min_pages=args.min_pages, project_locator=locator
                        )
                    ]
                )
        elif args.command == "verify":
            report = run_verify(
                memex,
                since=args.since,
                require_recall=args.require_recall,
                require_write=args.require_write,
            )
            _emit(report)
            return 0 if report.ok else 1
        elif args.command == "status":
            _emit(memex.status())
        elif args.command == "sessions":
            _emit(to_jsonable(memex.list_sessions()))
        elif args.command == "info":
            _emit(_info(memex))
        return 0
    finally:
        memex.close()


def _info(memex: Memex) -> dict[str, object]:
    counts = {
        node_type: len(memex.wiki_store.list(node_type))
        for node_type in ("entity", "preference", "procedure", "summary", "episode")
    }
    return {
        "version": __version__,
        "data_dir": str(memex.data_dir),
        "wiki_file_counts": counts,
        "index_total": memex.index_manager.count(),
        "schema_version": memex.index_manager.get_meta("schema_version"),
        "last_index_rebuild": memex.index_manager.get_meta("last_index_rebuild"),
        "llm_provider": memex.config.llm.provider,
    }


def _project_arguments(args: argparse.Namespace) -> tuple[str | None, str | None, str | None]:
    """Resolve project scope without exposing a remote URL or local path."""
    if getattr(args, "scope", "global") != "project":
        return None, None, None
    context = project_context(Path.cwd())
    if args.project_id:
        # An explicit id still deserves a display name: fall back to the
        # derived context label so the dashboard never shows the bare
        # "Project" placeholder for CLI writes (MCP writes already derive).
        return args.project_id, getattr(args, "project_label", None) or context.label, None
    return (
        context.project_id,
        getattr(args, "project_label", None) or context.label,
        context.locator,
    )


def main(argv: Sequence[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)
    try:
        return _run(args)
    except (MemexError, ValueError, TypeError, FileNotFoundError, FileExistsError) as exc:
        print(f"memex: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
