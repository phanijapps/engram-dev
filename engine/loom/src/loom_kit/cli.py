"""The loom CLI. The machine owns the loop; the worker works inside it."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import __version__
from . import machine, specpack
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


def _mode(directory: str) -> str:
    """sdd.json ⇒ legacy spine; otherwise the dirname-matching specpack json."""
    d = Path(directory)
    if (d / "sdd.json").exists():
        return "legacy"
    return "specpack"


def _specpack_path(directory: str) -> Path:
    return specpack.spec_path(directory)


def cmd_check(args) -> int:
    """specpack: schema + alignment report; reads through the normalizer."""
    doc, path = specpack.load_specpack(args.directory)
    errs = specpack.validate(doc, path)
    aerrs, cov = specpack.alignment(doc)
    if errs:
        print("SCHEMA INVALID:")
        for e in errs:
            print("  -", e)
        return 1
    print(f"spec: {doc['name']} ({doc['format']}) revision {doc.get('revision', 1)}")
    for e in aerrs:
        print("VIOLATION:", e)
    for fam in ("FR", "AC", "DES", "US"):
        for id_, who in cov[fam].items():
            mark = f"covered by {', '.join(who)}" if who else "GAP"
            print(f"  {fam} {id_:12} {mark}")
    ctx = cov.get("context") or {}
    for label, key in (
        ("detail missing", "missing_detail"),
        ("touch missing", "missing_touch"),
        ("long notes", "long_notes"),
        ("open questions", "open_questions"),
    ):
        if ctx.get(key):
            ids = ", ".join(ctx[key])
            print(f"  context: {label}: {ids}")
    drift = cov.get("story_drift") or {}
    if drift.get("requirements_without_stories"):
        ids = ", ".join(drift["requirements_without_stories"])
        print(f"  story drift: requirements serving no story: {ids}")
    if drift.get("stories_unserved"):
        ids = ", ".join(drift["stories_unserved"])
        print(f"  story drift: stories served by no requirement: {ids}")
    if ctx.get("env_absent"):
        print("  context: env block absent")
    gaps = sum(1 for fam in ("FR", "AC", "DES", "US") for who in cov[fam].values() if not who)
    print(f"alignment: {len(aerrs)} violation(s), {gaps} gap(s) — gaps are reported, never guessed")
    return 1 if aerrs else 0


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
    if _mode(args.directory) == "specpack":
        return _next_specpack(args)
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
    if _mode(args.directory) == "specpack":
        return _record_specpack(args)
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


def cmd_accept(args) -> int:
    """Record owner acceptance of a decision; resolves its questions (FR-8)."""
    doc, path = specpack.load_specpack(args.directory)
    if doc.get("revision", 1) != args.expected_revision:
        print(f"REFUSED: stale writer — file is at revision {doc.get('revision', 1)}, caller expected {args.expected_revision}")
        return 1
    out = specpack.accept_decision(doc, args.decision, args.by)
    specpack.save(doc, path)
    line = f"accepted {out['decision']} by {out['accepted_by']}"
    if out["resolved_questions"]:
        line += f"; resolved {', '.join(out['resolved_questions'])}"
    print(line)
    return 0


def cmd_close(args) -> int:
    """Transition the pack to its final state; refuses naming every gap (FR-9)."""
    doc, path = specpack.load_specpack(args.directory)
    if doc.get("revision", 1) != args.expected_revision:
        print(f"REFUSED: stale writer — file is at revision {doc.get('revision', 1)}, caller expected {args.expected_revision}")
        return 1
    if args.at:
        from datetime import datetime

        try:
            datetime.fromisoformat(args.at.replace("Z", "+00:00"))
        except ValueError:
            print("REFUSED: --at must be ISO-8601 (for example 2026-10-08T16:00:00Z)")
            return 1
    out = specpack.close(doc, args.by, at=args.at)
    specpack.save(doc, path)
    print(f"closed {out['name']} by {out['closed_by']} at revision {out['revision']}: the record is frozen")
    return 0


def cmd_answer(args) -> int:
    """specpack: land a question's answer (or honest unknown) with a human claim."""
    doc, path = specpack.load_specpack(args.directory)
    if doc.get("revision", 1) != args.expected_revision:
        print(f"REFUSED: stale writer — file is at revision {doc.get('revision', 1)}, caller expected {args.expected_revision}")
        return 1
    q = specpack.answer_question(doc, args.q, args.by, text=args.text, unknown=args.unknown, at=args.at)
    doc["revision"] = doc.get("revision", 1) + 1
    specpack.save(doc, path)
    print(f"answered {q['id']} by {args.by}" + (" (unknown — still open, still gating)" if q.get("unknown") else ""))
    return 0


def cmd_approve(args) -> int:
    """specpack: the approval act — one normative owner acceptance of the spec."""
    doc, path = specpack.load_specpack(args.directory)
    if doc.get("revision", 1) != args.expected_revision:
        print(f"REFUSED: stale writer — file is at revision {doc.get('revision', 1)}, caller expected {args.expected_revision}")
        return 1
    out = specpack.approve_spec(doc, args.by, at=args.at)
    doc["revision"] = doc.get("revision", 1) + 1
    specpack.save(doc, path)
    print(f"approved {out['name']} by {out['approved_by']} at {out['approved_at']}")
    return 0


def cmd_reject(args) -> int:
    """Record owner rejection of a decision; the questions stay open (FR-8)."""
    doc, path = specpack.load_specpack(args.directory)
    if doc.get("revision", 1) != args.expected_revision:
        print(f"REFUSED: stale writer — file is at revision {doc.get('revision', 1)}, caller expected {args.expected_revision}")
        return 1
    out = specpack.reject_decision(doc, args.decision, args.by, args.because)
    specpack.save(doc, path)
    print(f"rejected {out['decision']}: {out['rejected_because']}")
    return 0


def cmd_rebase(args) -> int:
    """specpack-only: re-pin a task's touch digests to current truth (D-7)."""
    doc, path = specpack.load_specpack(args.directory)
    if doc.get("revision", 1) != args.expected_revision:
        print(f"REFUSED: stale writer — file is at revision {doc.get('revision', 1)}, caller expected {args.expected_revision}")
        return 1
    out = specpack.rebase(doc, args.task, path, approved_by=args.approved_by)
    specpack.save(doc, path)
    if args.json:
        print(json.dumps(out, indent=2, sort_keys=True))
    else:
        print(f"rebased {out['task']}: repinned {', '.join(out['repinned']) or '-'}; dropped {', '.join(out['dropped']) or '-'}")
    return 0


def cmd_status(args) -> int:
    if _mode(args.directory) == "specpack":
        return _status_specpack(args)
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


def _next_specpack(args) -> int:
    doc, path = specpack.load_specpack(args.directory)
    out = specpack.next_task(doc, path)
    # pin only when no drift and never for a frozen pack: a complete pack's
    # bytes stay untouched (D-2 of status-vocabulary)
    if out["status"] not in ("needs_rebase", "COMPLETE"):
        specpack.save(doc, path)
    out["deliverable"] = doc.get("deliverable") or specpack.derive_deliverable(doc)
    if args.json:
        print(json.dumps(out, indent=2, sort_keys=True))
        return 0 if out["status"] in ("task", "DONE", "COMPLETE") else 2
    n = {}
    for t in doc["tasks"]:
        n[t.get("status")] = n.get(t.get("status"), 0) + 1
    print(f"deliverable: {out['deliverable']} ({n.get('done', 0)} done, {n.get('doing', 0)} doing, {n.get('todo', 0)} todo, {n.get('blocked', 0)} blocked)")
    if out["status"] == "COMPLETE":
        print(f"COMPLETE — closed by {out.get('closed_by', '?')}; the record is frozen")
        return 0
    if out["status"] != "task":
        print(out["status"] + (f" — {out.get('reason', '')}" if out.get("reason") else ""))
        if out["status"] == "BLOCKED":
            for t in out["tasks"]:
                print("  blocked:", t)
        if out["status"] == "needs_closure":
            rev = out.get("revision", doc.get("revision", 1))
            for did in out.get("pending_decisions", []):
                print(f"  decision {did} needs an owner verdict: loom accept {args.directory} --decision {did} --by human:<owner> --expected-revision {rev}")
                print(f"    or reject it: loom reject {args.directory} --decision {did} --because <why> --by human:<owner> --expected-revision {rev}")
            for qid in out.get("open_questions", []):
                print(f"  question {qid} is open: resolve it (accept the decision that resolves it, or amend the spec)")
            return 2
        if out["status"] == "needs_rebase":
            print(
                f"  task {out['task']} drifted; show the owner the drift and remedies, then: "
                f"loom rebase {args.directory} --task {out['task']} "
                f"--expected-revision {out['revision']} --approved-by human:<owner>"
            )
            for d in out["drift"]:
                print(f"  drift: {d['path']} ({d['why']})")
        return 0 if out["status"] == "DONE" else 2
    print(f"TASK {out['task']}  slice {out['slice_digest'][:12]}")
    pre = out.get("prelude") or {}
    if pre.get("approach"):
        print(f"  approach: {pre['approach']}")
    if pre.get("stack"):
        print(f"  stack: {json.dumps(pre['stack'], sort_keys=True)}")
    if pre.get("env"):
        print(f"  env: {json.dumps(pre['env'], sort_keys=True)}")
    for i in out["items"]:
        if i.get("family") == "AC":
            label = f"Given {i.get('given', '')} / When {i.get('when', '')} / Then {i.get('then', '')}"
        elif i.get("family") == "US":
            label = f"{i.get('as', '')} wants {i.get('want', '')}"
        else:
            label = i.get("title") or i.get("decision") or i.get("text") or i.get("question") or ""
        via = f" (via {i['via']})" if i.get("via") else ""
        print(f"  [{i['family']}] {i['id']}{via} {esc_local(label)}")
    me = next((i for i in out["items"] if i.get("family") == "TASK" and i["id"] == out["task"]), None)
    if me:
        for n, s in enumerate((me.get("verify") or {}).get("steps") or [], 1):
            line = f"  step {n}: {s['run']}"
            if "expect_exit" in s:
                line += f"  [exit {s['expect_exit']}]"
            if s.get("expect_contains"):
                line += f"  contains {s['expect_contains']!r}"
            print(line)
        ctx = me.get("context") or {}
        for e in ctx.get("touch") or []:
            print(f"  touch: {e['path']}" + (" (pinned)" if e.get("sha256") else ""))
        for e in ctx.get("read") or []:
            print(f"  read: {e['path']}")
        for w in ctx.get("wiki") or []:
            print(f"  wiki: {w}")
        for e in ctx.get("links") or []:
            print(f"  link: {e['url']}" + (" (pinned)" if e.get("sha256") else " (advisory)"))
        for nt in ctx.get("notes") or []:
            print(f"  note: {esc_local(nt)}")
        for c in ctx.get("commands") or []:
            print(f"  cmd: {c['cmd']}")
    print(f"  omitted tasks: {', '.join(out['omitted_tasks']) or '—'}")
    print(f"\nverify with the task's own command, then: loom record {args.directory} --task {out['task']} --result pass --cmd '<command>' --exit 0")
    return 0


def esc_local(s: str) -> str:
    return str(s).replace("\n", " ")


def _record_specpack(args) -> int:
    doc, path = specpack.load_specpack(args.directory)
    if args.result in ("pass", "fail") and not args.cmd:
        raise LoomError("pass/fail needs at least one --cmd (evidence or it did not happen)")
    if args.result in ("pass", "fail") and len(args.cmd) != len(args.exit):
        raise LoomError("each --cmd needs an --exit")
    commands = [{"command": c, "exit_code": x} for c, x in zip(args.cmd, args.exit)]
    out = specpack.record(
        doc,
        task_id=args.task,
        result=args.result,
        commands=commands,
        expected_revision=args.expected_revision,
        by=args.by,
        notes=args.notes,
    )
    specpack.save(doc, path)
    print(json.dumps(out, indent=2, sort_keys=True))
    return 0


def _status_specpack(args) -> int:
    doc, path = specpack.load_specpack(args.directory)
    errs = specpack.validate(doc, path)
    life = doc.get("status") or specpack.PACK_ACTIVE
    counts = {}
    for t in doc["tasks"]:
        counts[t.get("status")] = counts.get(t.get("status"), 0) + 1
    stage = doc.get("deliverable") or specpack.derive_deliverable(doc)
    n = counts
    print(f"deliverable: {stage} ({n.get('done', 0)} done, {n.get('doing', 0)} doing, {n.get('todo', 0)} todo, {n.get('blocked', 0)} blocked)")
    print(f"spec: {doc['name']} ({doc['format']}) revision {doc.get('revision', 1)} [{life}]" + ("  [SCHEMA INVALID]" if errs else ""))
    if life == specpack.PACK_COMPLETE:
        print(f"  closed by {doc.get('closed_by', '?')}; the record is frozen")
        return 0
    gaps = specpack.closure_gaps(doc)
    for did in gaps["pending_decisions"]:
        print(f"  decision {did} proposed: needs owner accept or reject")
    for qid in gaps["open_questions"]:
        print(f"  question {qid} open")
    for t in doc["tasks"]:
        streak = specpack._fail_streak(doc, t["id"]) if t["status"] in ("doing", "todo", "blocked") else 0
        mark = f"  <- {streak} consecutive fail(s)" if streak else ""
        print(f"  {t['id']:22} {t['status']}{mark}")
        if t["status"] == "blocked":
            print(f"    unblock: loom record {args.directory} --task {t['id']} --result unblock --expected-revision {doc.get('revision', 1)}")
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
        # --- specpack segment: the format loom speaks natively ---
        from loom_kit import specpack as sp
        mini = {
            "format": "specpack/0.2", "name": "mini", "title": "Mini",
            "spec": {"why": "w", "requirements": [{"id": "FR-1", "text": "x", "priority": "P1", "scenarios": []}]},
            "plan": {"decisions": [{"id": "D-1", "decision": "d", "because": "b", "status": "accepted", "accepted_by": "human:owner"}]},
            "tasks": [
                {"id": "T-1", "title": "one", "phase": "core", "status": "todo", "needs": [],
                 "implements": [], "satisfies": ["FR-1"], "accepts": [], "honors": [],
                 "verify": {"cmd": "true", "expect": "exit 0"}},
                {"id": "T-2", "title": "two", "phase": "core", "status": "todo", "needs": ["T-1"],
                 "implements": [], "satisfies": ["FR-1"], "accepts": [], "honors": [],
                 "verify": {"cmd": "true", "expect": "exit 0"}},
            ],
        }
        errs, cov = sp.alignment(mini)
        assert errs == [] and cov["FR"]["FR-1"], (errs, cov)
        assert sp.next_task(mini)["task"] == "T-1"
        sp.record(mini, "T-1", "pass", [{"command": "true", "exit_code": 0}], mini["revision"], "selftest")
        assert sp.next_task(mini)["task"] == "T-2"
        sp.record(mini, "T-2", "pass", [{"command": "true", "exit_code": 0}], mini["revision"], "selftest")
        assert sp.next_task(mini)["status"] == "DONE"
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

    sp = sub.add_parser("accept", help="record owner acceptance of a decision (resolves its questions)")
    sp.add_argument("directory", help="initiative directory (the spec json)")
    sp.add_argument("--decision", required=True)
    sp.add_argument("--by", required=True, help="who accepts; must be human:<owner>")
    sp.add_argument("--expected-revision", type=int, required=True, help="write fence: the revision you last saw")
    sp.set_defaults(fn=cmd_accept)
    sp = sub.add_parser("answer", help="specpack: land a question's answer (or honest unknown) with a human claim")
    sp.add_argument("directory", type=Path)
    sp.add_argument("--q", required=True, help="question id (Q-...)")
    sp.add_argument("--text", help="the answer text")
    sp.add_argument("--unknown", action="store_true", help="record an honest unknown; the question stays open")
    sp.add_argument("--by", required=True, help="who answers (human:<owner>)")
    sp.add_argument("--at", help="override the timestamp (caller clock)")
    sp.add_argument("--expected-revision", type=int, default=None)
    sp.set_defaults(fn=cmd_answer)
    sp = sub.add_parser("approve", help="specpack: the approval act — one normative owner acceptance of the spec (needs zero open questions)")
    sp.add_argument("directory", type=Path)
    sp.add_argument("--by", required=True, help="who approves (human:<owner>)")
    sp.add_argument("--at", help="override the timestamp (caller clock)")
    sp.add_argument("--expected-revision", type=int, default=None)
    sp.set_defaults(fn=cmd_approve)
    sp = sub.add_parser("reject", help="record owner rejection of a decision (questions stay open)")
    sp.add_argument("directory", help="initiative directory (the spec json)")
    sp.add_argument("--decision", required=True)
    sp.add_argument("--by", required=True, help="who rejects; must be human:<owner>")
    sp.add_argument("--because", required=True, help="why the decision was not taken")
    sp.add_argument("--expected-revision", type=int, required=True, help="write fence: the revision you last saw")
    sp.set_defaults(fn=cmd_reject)
    sp = sub.add_parser("close", help="freeze the spec as complete: all tasks done with evidence, decisions dispositioned, questions resolved, review PASS on PACK")
    sp.add_argument("directory", help="initiative directory (the spec json)")
    sp.add_argument("--by", required=True, help="who closes; must be human:<owner>")
    sp.add_argument("--at", help="optional owner-supplied close time (ISO-8601)")
    sp.add_argument("--expected-revision", type=int, required=True, help="write fence: the revision you last saw")
    sp.set_defaults(fn=cmd_close)
    sp = sub.add_parser("rebase", help="specpack: re-pin a task's touch digests to current truth (after needs_rebase)")
    sp.add_argument("directory", help="initiative directory (the spec json)")
    sp.add_argument("--task", required=True)
    sp.add_argument("--expected-revision", type=int, required=True, help="write fence: the revision you last saw")
    sp.add_argument("--approved-by", required=True, help="who approved this re-pin at the drift; must be human:<owner> (D-7)")
    sp.add_argument("--json", action="store_true")
    sp.set_defaults(fn=cmd_rebase)
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

    sp = sub.add_parser("check", help="specpack: schema + alignment report (A1-A6), canonical order")
    d()
    sp.set_defaults(fn=cmd_check)

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
