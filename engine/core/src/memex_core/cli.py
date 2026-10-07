"""memex-core CLI: the 8 control-plane ops over one command."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import is_dataclass
from pathlib import Path
from typing import Any

from memex_core import __version__


def _jsonable(value: Any) -> Any:
    if is_dataclass(value) and not isinstance(value, type):
        return _from_dataclass(value)
    if isinstance(value, dict):
        return {k: _jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_jsonable(v) for v in value]
    if isinstance(value, Path):
        return str(value)
    return value


def _from_dataclass(value: Any) -> Any:
    import dataclasses

    return {k: _jsonable(v) for k, v in dataclasses.asdict(value).items()}


def _emit(payload: Any) -> None:
    print(json.dumps(_jsonable(payload), indent=2, sort_keys=False))


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="memex-core",
        description="One-engine control plane over memory (engine) and knowledge (kit)",
    )
    parser.add_argument("--version", action="version", version=__version__)
    parser.add_argument("--cwd", type=Path, default=None, help="Workspace dir (default: cwd)")
    parser.add_argument("--data-dir", type=Path, default=None, help="Memory store dir (default: ~/.memex)")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("resolve", help="Project identity, wiki state, memory location")

    wiki = sub.add_parser("wiki", help="Knowledge plane lifecycle")
    wiki_sub = wiki.add_subparsers(dest="wiki_command", required=True)
    wiki_init = wiki_sub.add_parser("init", help="Create <repo>/wiki as an OKF bundle")
    wiki_init.add_argument("--name", default=None)
    wiki_update = wiki_sub.add_parser("update", help="Index source into the wiki (deterministic)")
    wiki_update.add_argument("--profile", choices=["compact", "full"], default="compact")
    wiki_update.add_argument("--include-tests", action="store_true")
    wiki_update.add_argument("--include", action="append", default=None)
    wiki_update.add_argument("--exclude", action="append", default=None)

    search = sub.add_parser("search", help="Federated search over memory + wiki")
    search.add_argument("query")
    search.add_argument("--source", choices=["memory", "wiki", "both"], default="both")
    search.add_argument("--top-k", type=int, default=8)
    search.add_argument("--scope", choices=["global", "project"], default="global")

    compile_cmd = sub.add_parser("compile", help="Budgeted context + manifest for questions")
    compile_cmd.add_argument("questions", nargs="+")
    compile_cmd.add_argument("--budget", type=int, default=4096)
    compile_cmd.add_argument("--source", choices=["memory", "wiki", "both"], default="both")
    compile_cmd.add_argument("--top-k", type=int, default=8)

    record = sub.add_parser("record", help="Write a durable memory note")
    record.add_argument("--title", required=True)
    record.add_argument("--body", required=True)
    record.add_argument("--type", dest="type_", default="entity")
    record.add_argument("--scope", choices=["global", "project"], default="global")
    record.add_argument("--tag", action="append", default=None)
    record.add_argument("--description", default=None)

    findings = sub.add_parser("findings", help="Normative proposal ledger")
    findings_sub = findings.add_subparsers(dest="findings_command", required=True)
    findings_list = findings_sub.add_parser("list")
    findings_list.add_argument("--status", choices=["pending", "accepted", "declined"], default=None)
    findings_propose = findings_sub.add_parser("propose")
    findings_propose.add_argument("--source", required=True)
    findings_propose.add_argument("--destination", required=True)
    findings_propose.add_argument("--kind", required=True)
    findings_propose.add_argument("--rationale", default="")
    findings_resolve = findings_sub.add_parser("resolve")
    findings_resolve.add_argument("id")
    findings_resolve.add_argument("--decision", choices=["accepted", "declined"], required=True)

    sub.add_parser("status", help="Combined memory + wiki health")

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)
    cwd = (args.cwd or Path.cwd()).expanduser().resolve()

    try:
        if args.command == "resolve":
            from memex_core.resolve import resolve

            _emit(resolve(cwd, data_dir=args.data_dir))
        elif args.command == "wiki":
            from memex_core.knowledge import wiki_init, wiki_update

            if args.wiki_command == "init":
                _emit(wiki_init(cwd, name=args.name))
            else:
                _emit(
                    wiki_update(
                        cwd,
                        profile=args.profile,
                        include_tests=args.include_tests,
                        include=args.include,
                        exclude=args.exclude,
                    )
                )
        elif args.command == "search":
            from memex.infrastructure.workspace_context import project_context

            from memex_core.search import federated_search

            project_id = None
            if args.scope == "project":
                context = project_context(cwd)
                project_id = context.project_id if context else None
            _emit(
                federated_search(
                    args.query,
                    cwd=cwd,
                    data_dir=args.data_dir,
                    source=args.source,
                    top_k=args.top_k,
                    scope=args.scope,
                    project_id=project_id,
                )
            )
        elif args.command == "compile":
            from memex_core.compile_context import compile_context

            compiled = compile_context(
                args.questions,
                cwd=cwd,
                data_dir=args.data_dir,
                budget=args.budget,
                source=args.source,
                top_k=args.top_k,
            )
            _emit(compiled)
        elif args.command == "record":
            from memex.infrastructure.workspace_context import project_context

            from memex_core.record import record_note

            project_id = project_label = None
            if args.scope == "project":
                context = project_context(cwd)
                if context is None:
                    print("memex-core: could not derive project identity", file=sys.stderr)
                    return 1
                project_id, project_label = context.project_id, context.label
            _emit(
                record_note(
                    args.title,
                    args.body,
                    type_=args.type_,
                    scope=args.scope,
                    project_id=project_id,
                    project_label=project_label,
                    tags=args.tag,
                    description=args.description,
                    data_dir=args.data_dir,
                )
            )
        elif args.command == "findings":
            from memex_core.findings import list_findings, propose_finding, resolve_finding

            if args.findings_command == "list":
                _emit(list_findings(status=args.status, cwd=cwd))
            elif args.findings_command == "propose":
                _emit(
                    propose_finding(
                        args.source,
                        args.destination,
                        args.kind,
                        rationale=args.rationale,
                        cwd=cwd,
                    )
                )
            else:
                _emit(resolve_finding(args.id, decision=args.decision, cwd=cwd))
        elif args.command == "status":
            from memex_core.status import combined_status

            _emit(combined_status(cwd, data_dir=args.data_dir))
        return 0
    except ValueError as exc:
        print(f"memex-core: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
