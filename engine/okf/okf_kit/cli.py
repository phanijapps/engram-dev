"""The ``okf`` CLI — init / new / validate / search / read / index / code.

A thin presentation layer over :mod:`okf_kit.core`. Exit codes: ``0`` success,
``1`` conformance errors, ``2`` usage / not-found / IO errors.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from okf_kit.core import context as context_mod
from okf_kit.core.context import ConceptNotFound
from okf_kit.core.index import regenerate_indexes
from okf_kit.core.search import build_index, search
from okf_kit.core.templates import TEMPLATE_TYPES, create_concept, init_bundle
from okf_kit.core.validate import Report, validate_bundle


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return exc.code if isinstance(exc.code, int) else 2
    try:
        return _dispatch(args)
    except ConceptNotFound as exc:
        print(f"error: concept not found: {exc.cid}", file=sys.stderr)
        if exc.suggestions:
            print(f"       did you mean: {', '.join(exc.suggestions[:5])}", file=sys.stderr)
        return 2
    except (ValueError, FileExistsError, OSError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="okf", description="Open Knowledge Format (OKF v0.1) CLI."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_init = sub.add_parser("init", help="Scaffold a new OKF bundle.")
    p_init.add_argument("dir", help="Directory to create the bundle in.")
    p_init.add_argument("--okf-version", default="0.1")
    p_init.add_argument(
        "--name", help="Bundle display name (root index heading; defaults to the directory name)."
    )

    p_new = sub.add_parser(
        "new", help="Create a concept from a type template."
    )
    p_new.add_argument("bundle", help="Bundle root directory.")
    p_new.add_argument(
        "type",
        help=f"Concept type (built-ins: {', '.join(TEMPLATE_TYPES)}; or any custom value).",
    )
    p_new.add_argument("path", help="Concept id (e.g. tables/users).")
    p_new.add_argument("--title")
    p_new.add_argument("--desc")
    p_new.add_argument("--tag", action="append", default=[])

    p_val = sub.add_parser("validate", help="Validate OKF v0.1 conformance (SPEC §9).")
    p_val.add_argument("bundle")
    p_val.add_argument("--json", action="store_true", help="Emit a JSON report.")

    p_search = sub.add_parser("search", help="Full-text search across the bundle.")
    p_search.add_argument("bundle")
    p_search.add_argument("query")
    p_search.add_argument("--type", action="append", default=[])
    p_search.add_argument("--tag", action="append", default=[])
    p_search.add_argument("--limit", type=int, default=20)
    p_search.add_argument("--json", action="store_true")

    p_read = sub.add_parser(
        "read", help="Read a concept; use --depth for progressive context (neighborhood)."
    )
    p_read.add_argument("bundle")
    p_read.add_argument("concept_id")
    p_read.add_argument("--depth", type=int, default=0)
    p_read.add_argument("--token-budget", type=int, default=8000)

    p_index = sub.add_parser("index", help="index.md management.")
    idx_sub = p_index.add_subparsers(dest="index_command", required=True)
    p_regen = idx_sub.add_parser("regen", help="Regenerate per-directory index.md files.")
    p_regen.add_argument("bundle")

    p_findings = sub.add_parser("findings", help="Normative proposal ledger for a bundle.")
    findings_sub = p_findings.add_subparsers(dest="findings_command", required=True)
    p_f_propose = findings_sub.add_parser("propose", help="Add a finding (deduped per source/destination/kind; declined keys are refused).")
    p_f_propose.add_argument("bundle")
    p_f_propose.add_argument("--source", required=True)
    p_f_propose.add_argument("--destination", required=True)
    p_f_propose.add_argument("--kind", required=True)
    p_f_propose.add_argument("--rationale", default="")
    p_f_list = findings_sub.add_parser("list", help="List findings, optionally filtered by status.")
    p_f_list.add_argument("bundle")
    p_f_list.add_argument("--status", choices=["pending", "accepted", "declined"])
    p_f_resolve = findings_sub.add_parser("resolve", help="Accept or decline a pending finding (terminal).")
    p_f_resolve.add_argument("bundle")
    p_f_resolve.add_argument("finding_id")
    p_f_resolve.add_argument("--decision", required=True, choices=["accepted", "declined"])

    p_code = sub.add_parser("code", help="Codebase indexing into OKF concepts.")
    code_sub = p_code.add_subparsers(dest="code_command", required=True)
    p_code_index = code_sub.add_parser(
        "index",
        help=(
            "Index source code into compact OKF CodeSummary and CodeModule concepts "
            "(requires okf-kit[treesitter])."
        ),
        description=(
            "Index source code into compact OKF CodeSummary entry points and "
            "CodeModule concepts for summary-first search and depth-1 impact "
            "analysis. Default scope skips tests, vendor/build/generated/static "
            "noise unless included explicitly. Supported languages require "
            "okf-kit[treesitter]."
        ),
    )
    p_code_index.add_argument("workspace", help="Source repository or workspace root to index.")
    p_code_index.add_argument(
        "bundle",
        help="OKF bundle root to write CodeSummary and CodeModule concepts.",
    )
    p_code_index.add_argument(
        "--language",
        action="append",
        help=(
            "Source language to index; repeat for multiple languages. "
            "Default: all supported languages. Supported: python, javascript, typescript, java, "
            "scala, rust, go, kotlin, perl, csharp, php, html."
        ),
    )
    p_code_index.add_argument(
        "--update",
        action="store_true",
        default=True,
        help=(
            "Accepted for compatibility; generated code concepts refresh by default "
            "while preserving narrative notes."
        ),
    )
    p_code_index.add_argument(
        "--profile",
        choices=("compact", "full"),
        default="compact",
        help="Generated concept detail profile. Default: compact.",
    )
    p_code_index.add_argument(
        "--include-tests",
        action="store_true",
        help="Include test files in the generated code concepts.",
    )
    p_code_index.add_argument(
        "--include",
        action="append",
        default=[],
        help="Workspace-relative glob to include; repeat for multiple patterns.",
    )
    p_code_index.add_argument(
        "--exclude",
        action="append",
        default=[],
        help="Workspace-relative glob to exclude; repeat for multiple patterns.",
    )
    p_code_index.add_argument(
        "--repo",
        dest="repos",
        action="append",
        default=[],
        help="Discovered repository id or workspace-relative repository path to index.",
    )

    return parser


def _dispatch(args: argparse.Namespace) -> int:
    if args.command == "init":
        return _cmd_init(args)
    if args.command == "new":
        return _cmd_new(args)
    if args.command == "validate":
        return _cmd_validate(args)
    if args.command == "search":
        return _cmd_search(args)
    if args.command == "read":
        return _cmd_read(args)
    if args.command == "index":
        return _cmd_index_regen(args)
    if args.command == "code":
        return _cmd_code(args)
    if args.command == "findings":
        return _cmd_findings(args)
    return 2  # unreachable: argparse requires a subcommand


def _cmd_init(args: argparse.Namespace) -> int:
    path = init_bundle(Path(args.dir), okf_version=args.okf_version, name=args.name)
    print(f"initialized bundle: {path}")
    return 0


def _cmd_new(args: argparse.Namespace) -> int:
    path = create_concept(
        Path(args.bundle),
        args.path,
        args.type,
        title=args.title,
        description=args.desc,
        tags=args.tag or None,
    )
    print(f"created concept: {path}")
    return 0


def _cmd_validate(args: argparse.Namespace) -> int:
    report = validate_bundle(Path(args.bundle))
    if args.json:
        print(json.dumps(report.to_dict(), indent=2, default=str))
    else:
        _print_report(report)
    return 0 if report.conformant else 1


def _cmd_search(args: argparse.Namespace) -> int:
    index = build_index(Path(args.bundle))
    hits = search(
        index,
        args.query,
        type=args.type or None,
        tag=args.tag or None,
        limit=args.limit,
    )
    if args.json:
        print(json.dumps([_hit_dict(h) for h in hits], indent=2))
    else:
        _print_hits(hits)
    return 0


def _cmd_read(args: argparse.Namespace) -> int:
    text = context_mod.read_concept(
        Path(args.bundle),
        args.concept_id,
        depth=args.depth,
        token_budget=args.token_budget,
    )
    print(text)
    return 0


def _cmd_index_regen(args: argparse.Namespace) -> int:
    written = regenerate_indexes(Path(args.bundle))
    print(f"regenerated {len(written)} index.md file(s)")
    return 0


def _cmd_findings(args: argparse.Namespace) -> int:
    import json

    from okf_kit.core.findings import list_findings, propose_finding, resolve_finding

    bundle = Path(args.bundle)
    if args.findings_command == "propose":
        result = propose_finding(
            args.source,
            args.destination,
            args.kind,
            rationale=args.rationale,
            bundle=bundle,
        )
        print(json.dumps(result, indent=2))
        return 0
    if args.findings_command == "resolve":
        try:
            result = resolve_finding(args.finding_id, decision=args.decision, bundle=bundle)
        except Exception as exc:  # noqa: BLE001 — CLI boundary
            print(f"error: {exc}")
            return 1
        print(json.dumps(result, indent=2))
        return 0
    if args.findings_command == "list":
        for finding in list_findings(status=args.status, bundle=bundle):
            print(
                f"{finding['id']}\t[{finding['status']}]\t{finding['source']} -> "
                f"{finding['destination']} ({finding['kind']})"
            )
    return 0


def _cmd_code(args: argparse.Namespace) -> int:
    if args.code_command == "index":
        return _cmd_code_index(args)
    return 2


def _cmd_code_index(args: argparse.Namespace) -> int:
    from okf_kit.code.indexer import index_codebase
    from okf_kit.core.stamp import write_freshness_stamp

    result = index_codebase(
        Path(args.workspace),
        Path(args.bundle),
        languages=args.language,
        update=args.update,
        profile=args.profile,
        include_tests=args.include_tests,
        include=args.include,
        exclude=args.exclude,
        repos=args.repos,
    )
    stamp_path = write_freshness_stamp(
        Path(args.bundle),
        Path(args.workspace),
        written=result.written,
        updated=result.updated,
        skipped=result.skipped,
    )
    print(
        "indexed code: "
        f"wrote {result.written}, updated {result.updated}, skipped {result.skipped}"
    )
    print(f"freshness stamp: {stamp_path}")
    return 0


def _print_report(report: Report) -> None:
    status = "conformant" if report.conformant else "NOT conformant"
    print(
        f"{status}: {len(report.errors)} error(s), "
        f"{len(report.warnings)} warning(s), {len(report.info)} info"
    )
    for finding in report.errors + report.warnings + report.info:
        loc = finding.cid or (finding.path.name if finding.path else "")
        suffix = f" ({loc})" if loc else ""
        print(f"  [{finding.severity}] {finding.code}: {finding.message}{suffix}")


def _print_hits(hits: list[Any]) -> None:
    if not hits:
        print("no results")
        return
    for hit in hits:
        snippet = hit.snippet.replace("\n", " ")
        print(f"{hit.cid}\t[{hit.type}]\t{hit.title}\t{snippet}")


def _hit_dict(hit: Any) -> dict[str, Any]:
    return {
        "cid": hit.cid,
        "title": hit.title,
        "type": hit.type,
        "snippet": hit.snippet,
        "score": hit.score,
    }


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
