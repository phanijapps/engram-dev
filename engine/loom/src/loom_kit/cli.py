"""The loom CLI. The machine owns the loop; the worker works inside it."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import __version__
from . import machine
from .spine import (
    LoomError,
    SPINE_NAME,
    load,
    new_spine,
    semantic_errors,
    validate_schema,
    _now,
)
from .templates import PLAN_TMPL, REVIEW_TMPL, SPEC_TMPL


def _evidence(pairs: list[tuple[str, int]], level: str = "attested") -> list[dict]:
    return [
        {
            "command": c,
            "exit_code": x,
            "evidence_level": level,
        }
        for c, x in pairs
    ]


def cmd_init(args) -> int:
    d = Path(args.directory)
    if (d / SPINE_NAME).exists():
        raise LoomError(f"{d / SPINE_NAME} already exists")
    d.mkdir(parents=True, exist_ok=True)
    doc = new_spine(args.spine_id or d.resolve().name, args.profile, args.by)
    (d / SPINE_NAME).write_text(json.dumps(doc, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    for name, tmpl in (("spec.md", SPEC_TMPL), ("plan.md", PLAN_TMPL), ("review.md", REVIEW_TMPL)):
        p = d / name
        if not p.exists():
            p.write_text(tmpl.format(slug=doc["spine_id"]), encoding="utf-8")
    print(f"initialized {d / SPINE_NAME} (profile {doc['profile']}) with spec.md plan.md review.md")
    return 0


def cmd_add(args) -> int:
    doc, path = load(args.directory)
    artifact_refs = []
    if args.artifact:
        role, _, section = args.artifact.partition("#")
        artifact_refs.append({"artifact": role, **({"section": section} if section else {})})
    machine.add_node(
        doc,
        node_id=args.id,
        kind=args.kind,
        title=args.title,
        text=args.text,
        created_by=args.by,
        details=args.details,
        requires=args.requires or [],
        artifact_refs=artifact_refs,
    )
    from .spine import save

    save(doc, path)
    print(f"added {args.kind} {args.id}" + (f" requires {','.join(args.requires)}" if args.requires else ""))
    return 0


def cmd_validate(args) -> int:
    doc, path = load(args.directory)
    errs = validate_schema(doc) + semantic_errors(doc)
    if errs:
        print("INVALID")
        for e in errs:
            print(" -", e)
        return 1
    print(f"valid: {doc['spine_id']} revision {doc['revision']}, {len(doc['nodes'])} nodes")
    return 0


def cmd_next(args) -> int:
    doc, path = load(args.directory)
    out = machine.next_task(doc)
    from .spine import save

    save(doc, path)
    if args.json:
        print(json.dumps(out, indent=2, sort_keys=True))
        return 0 if out["status"] in ("task", "DONE") else 2
    if out["status"] != "task":
        print(out["status"] + (f" — {out.get('reason', '')}" if out.get("reason") else ""))
        if out["status"] == "BLOCKED":
            for t in out["tasks"]:
                print(f"  blocked: {t}")
        return 0 if out["status"] == "DONE" else 2
    print(f"TASK {out['task']}  context {out['context_id']}")
    chain = out["requires_chain"]
    if chain:
        print(f"  prerequisites (satisfied): {', '.join(chain)}")
    for n in out["nodes"]:
        print(f"\n[{n['kind']}] {n['node_id']} — {n['title']}")
        print("  " + n["body"]["text"].replace("\n", "\n  "))
        for ar in n["artifact_refs"]:
            role = ar["artifact"]
            sec = f"#{ar['section']}" if ar.get("section") else ""
            print(f"  artifact: {out['artifacts'][role]['path']}{sec}")
    print("\nverify with a real command, then: loom record --task", out["task"], "--result pass --cmd '<command>' --exit 0")
    return 0


def cmd_record(args) -> int:
    doc, path = load(args.directory)
    if args.result in ("pass", "fail") and not args.cmd:
        raise LoomError("pass/fail needs at least one --cmd (evidence or it did not happen)")
    pairs = list(zip(args.cmd, args.exit)) if args.result in ("pass", "fail") else []
    if args.result in ("pass", "fail") and len(args.cmd) != len(args.exit):
        raise LoomError("each --cmd needs an --exit")
    out = machine.record(
        doc,
        task_id=args.task,
        result=args.result,
        commands=_evidence(pairs, args.evidence_level),
        expected_revision=args.expected_revision,
        worker=args.by,
        notes=args.notes,
    )
    from .spine import save

    save(doc, path)
    print(json.dumps(out, indent=2, sort_keys=True))
    if "escalation" in out:
        print("ESCALATED:", out["escalation"]["reason"], "| upstream:", ", ".join(out["escalation"]["upstream"]))
    return 0


def cmd_status(args) -> int:
    doc, _ = load(args.directory)
    from collections import Counter

    counts = Counter(t["state"] for t in doc["runtime"]["task_states"])
    print(f"spine: {doc['spine_id']}  revision {doc['revision']}  profile {doc['profile']}")
    print(f"tasks: {dict(sorted(counts.items())) or '{}'}")
    for t in doc["runtime"]["task_states"]:
        mark = ""
        if t["state"] == "BLOCKED" and t.get("escalation"):
            mark = f"  <- escalate upstream: {', '.join(t['escalation']['upstream'])}"
        print(f"  {t['task_id']:30} {t['state']}{mark}")
    return 0


def cmd_selftest(args) -> int:
    """Embedded end-to-end assertions. No network, no files."""
    import tempfile

    from .spine import load, save

    with tempfile.TemporaryDirectory() as td:
        d = Path(td) / "demo"
        doc = new_spine("demo", "generic", "selftest")
        d.mkdir()
        save(doc, d / SPINE_NAME)
        doc, path = load(d)
        machine.add_node(doc, "t1", "TASK", "First", "does the first thing", "selftest")
        machine.add_node(doc, "t2", "TASK", "Second", "needs t1", "selftest", requires=["t1"])
        machine.add_node(doc, "t3", "TASK", "Third", "independent", "selftest")
        save(doc, path)
        # next picks t1 (node_id order among ready)
        doc, _ = load(d)
        out = machine.next_task(doc)
        assert out["status"] == "task" and out["task"] == "t1", out
        rev = doc["revision"]
        # fence: stale revision refused
        try:
            machine.record(doc, "t1", "pass", [{"command": "x", "exit_code": 0, "evidence_level": "attested"}], rev - 1, "st")
            raise SystemExit("selftest: fence failed to refuse stale writer")
        except LoomError:
            pass
        # M_run = M: pass without zero-exit command refused
        try:
            machine.record(doc, "t1", "pass", [{"command": "x", "exit_code": 1, "evidence_level": "attested"}], rev, "st")
            raise SystemExit("selftest: pass-without-evidence accepted")
        except LoomError:
            pass
        machine.record(doc, "t1", "pass", [{"command": "x", "exit_code": 0, "evidence_level": "attested"}], doc["revision"], "st")
        assert doc["runtime"]["task_states"][0]["state"] == "SUCCEEDED"
        # t2 becomes eligible after t1; node-id order picks t2 before t3
        out = machine.next_task(doc)
        assert out["status"] == "task" and out["task"] == "t2", out
        # stall valve: two consecutive fails block with the upstream chain named
        machine.record(doc, "t2", "fail", [{"command": "z", "exit_code": 2, "evidence_level": "attested"}], doc["revision"], "st")
        out = machine.next_task(doc)
        assert out["task"] == "t2"  # retry allowed before the stall limit
        out = machine.record(doc, "t2", "fail", [{"command": "z", "exit_code": 2, "evidence_level": "attested"}], doc["revision"], "st")
        assert out["state"] == "BLOCKED" and out["escalation"]["upstream"] == ["t2", "t1"], out
        # independent work continues while t2 is blocked
        out = machine.next_task(doc)
        assert out["status"] == "task" and out["task"] == "t3", out
        machine.record(doc, "t3", "pass", [{"command": "y", "exit_code": 0, "evidence_level": "attested"}], doc["revision"], "st")
        out = machine.next_task(doc)
        assert out["status"] == "BLOCKED" and out["tasks"] == ["t2"], out
        # human valve: unblock then pass
        machine.record(doc, "t2", "unblock", [], doc["revision"], "human")
        out = machine.next_task(doc)
        assert out["task"] == "t2"
        machine.record(doc, "t2", "pass", [{"command": "w", "exit_code": 0, "evidence_level": "attested"}], doc["revision"], "st")
        out = machine.next_task(doc)
        assert out["status"] == "DONE", out
        # acyclic requires refused
        try:
            doc2 = new_spine("cyc", "generic", "selftest")
            machine.add_node(doc2, "a", "TASK", "A", "a", "selftest", requires=["b"])
            raise SystemExit("selftest: dangling requires accepted")
        except LoomError:
            pass
    print("selftest: all assertions passed")
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="loom", description="loom — the loop engine: okf knows, loom does")
    p.add_argument("--version", action="version", version=f"loom {__version__}")
    sub = p.add_subparsers(dest="cmd", required=True)

    def d(dir_help="initiative directory (contains sdd.json)"):
        sp.add_argument("directory", help=dir_help)

    sp = sub.add_parser("init", help="scaffold an initiative (sdd.json + spec.md + plan.md + review.md)")
    sp.add_argument("directory")
    sp.add_argument("--spine-id")
    sp.add_argument("--profile", default="generic", choices=["generic", "pi", "claude", "codex"])
    sp.add_argument("--by", default="human:owner")
    sp.set_defaults(fn=cmd_init)

    sp = sub.add_parser("add", help="add a node (TASK gets a runtime state)")
    d()
    sp.add_argument("--id", required=True)
    sp.add_argument("--kind", default="TASK")
    sp.add_argument("--title", required=True)
    sp.add_argument("--text", required=True, help="one-line body text (the what)")
    sp.add_argument("--details", help="optional longer body")
    sp.add_argument("--requires", nargs="*", default=[])
    sp.add_argument("--artifact", help='artifact role and optional section: spec#"## Goal"')
    sp.add_argument("--by", default="human:owner")
    sp.set_defaults(fn=cmd_add)

    sp = sub.add_parser("validate", help="schema + invariants")
    d()
    sp.set_defaults(fn=cmd_validate)

    sp = sub.add_parser("next", help="hand out the next ready task with its frozen context")
    d()
    sp.add_argument("--json", action="store_true", dest="json")
    sp.set_defaults(fn=cmd_next)

    sp = sub.add_parser("record", help="record an attempt (pass|fail|unblock|cancel) with evidence")
    d()
    sp.add_argument("--task", required=True)
    sp.add_argument("--result", required=True, choices=["pass", "fail", "unblock", "cancel"])
    sp.add_argument("--cmd", action="append", default=[], help="the verification command (repeatable)")
    sp.add_argument("--exit", action="append", type=int, default=[], help="exit code of the preceding --cmd")
    sp.add_argument("--evidence-level", default="attested", choices=["attested", "captured"])
    sp.add_argument("--expected-revision", type=int, required=True, help="fence: the revision you read")
    sp.add_argument("--notes")
    sp.add_argument("--by", default="agent")
    sp.set_defaults(fn=cmd_record)

    sp = sub.add_parser("status", help="one screen: states, escalations")
    d()
    sp.set_defaults(fn=cmd_status)

    sp = sub.add_parser("selftest", help="embedded end-to-end assertions")
    sp.set_defaults(fn=cmd_selftest)

    args = p.parse_args(argv)
    try:
        return args.fn(args)
    except LoomError as e:
        print(f"REFUSED: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
