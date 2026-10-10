#!/usr/bin/env python3
"""The golden corpus generator (red-forman D14): the ONLY writer of expected.*

Everything is generated from the python engines with FIXED clocks — no wall
time, no environment. Run from the repo root:

    uv run python treadle/conformance/generators/gen_corpus.py

Then `git diff treadle/packages/conformance/corpus` must be empty on a clean
run (CI enforces it via pnpm corpus:check). Changing a golden is a contract
change: regenerate deliberately, review the diff, commit with intent.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO / "engine/loom/src"))
sys.path.insert(0, str(REPO / "engine/okf"))

from loom_kit import specpack  # noqa: E402
from loom_kit import events as ev  # noqa: E402
from loom_kit.spine import LoomError  # noqa: E402
from okf_kit.core.search import build_index, search as py_search  # noqa: E402
from okf_kit.core.parse import parse_concept  # noqa: E402
from okf_kit.core.links import iter_concept_files, build_adjacency, build_backlinks, broken_links  # noqa: E402
from okf_kit.core.validate import validate_bundle  # noqa: E402
from okf_kit.core.context import read_concept  # noqa: E402

FIXED = "2026-10-10T12:00:00Z"

# total determinism: the engine's wall clock is pinned for the whole run —
# every stamp (save's updated, evidence rows, handouts) becomes reproducible
specpack._now = lambda: FIXED
ROOT = REPO / "treadle/packages/conformance/corpus"


import datetime as _dt  # noqa: E402


def _norm(v):
    """Compare-layer policy: date-ish values pin as ISO dates on BOTH sides —
    python str(datetime) formatting is itself drift-prone and pins nothing."""
    if isinstance(v, _dt.datetime):
        return v.date().isoformat()
    if isinstance(v, _dt.date):
        return v.isoformat()
    return str(v)


def J(obj, indent=2) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=indent, sort_keys=True, default=_norm) + "\n"


def emit_bytes(doc) -> str:
    return json.dumps(specpack._emit(doc), ensure_ascii=False, indent=2) + "\n"


def born_doc() -> dict:
    return {
        "format": "specpack/0.3", "name": "p", "revision": 1,
        "title": "The born fixture",
        "spec": {
            "why": "w", "requirements": [], "out_of_scope": [],
            "clarifications": [
                {"id": "Q-1", "question": "pick one", "status": "open", "owner": "human:owner",
                 "kind": "choice", "options": ["a", "b"], "default": "a"},
                {"id": "Q-2", "question": "say something", "status": "open", "owner": "human:owner"},
            ],
        },
        "plan": {"decisions": [
            {"id": "D-1", "decision": "d", "because": "b", "status": "accepted", "accepted_by": "human:owner"}
        ]},
        "tasks": [{"id": "T-1", "title": "one", "detail": "d", "satisfies": [], "implements": [],
                   "honors": [], "accepts": [], "status": "todo", "phase": "core",
                   "verify": {"cmd": "true", "expect": "0"}}],
    }


def write_input(case: Path, doc: dict, extra=None) -> None:
    inp = case / "input"
    shutil.rmtree(case, ignore_errors=True)
    inp.mkdir(parents=True)
    specpack.save(doc, inp / "p.json")
    if extra:
        extra(inp)


# ── L1 ────────────────────────────────────────────────────────────────────
def gen_l1() -> None:
    for slug in ("specpack-context", "spec-web", "status-vocabulary"):
        case = ROOT / "L1-canonical" / slug
        (case / "input").mkdir(parents=True, exist_ok=True)
        shutil.rmtree(case / "input")
        (case / "input").mkdir(parents=True)
        for f in (REPO / "docs/specs" / slug).iterdir():
            if f.suffix in (".json", ".md"):
                shutil.copy(f, case / "input" / f.name)
        doc, _ = specpack.load_specpack(REPO / "docs/specs" / slug)
        (case / "expected.emit.json").write_text(emit_bytes(doc))
        errs, cov = specpack.alignment(doc)
        (case / "expected.check.json").write_text(J({"violations": errs, "coverage": cov}))

    def stage_case(name, mutate):
        doc = born_doc()
        mutate(doc)
        case = ROOT / "L1-canonical" / name
        write_input(case, doc)
        doc2, _ = specpack.load_specpack(case / "input")
        (case / "expected.emit.json").write_text(emit_bytes(doc2))
        errs, cov = specpack.alignment(doc2)
        (case / "expected.check.json").write_text(J({"violations": errs, "coverage": cov}))

    def open_q(doc):
        doc["spec"]["clarifications"].append(
            {"id": "Q-9", "question": "q", "status": "open", "owner": "human:owner"})

    def doing(doc):
        doc["tasks"][0]["status"] = "doing"

    def blocked(doc):
        specpack.record(doc, "T-1", "fail", [{"command": "false", "exit_code": 1}], 1, "agent:w", )
        specpack.record(doc, "T-1", "fail", [{"command": "false", "exit_code": 1}], 2, "agent:w")

    def awaiting(doc):
        doc["spec"]["clarifications"] = []

    def in_review(doc):
        specpack.record(doc, "T-1", "pass", [{"command": "true", "exit_code": 0}], 1, "agent:w")

    def all_done_pass(doc):
        in_review(doc)
        doc.setdefault("review", {})["verdicts"] = [{"on": "PACK", "verdict": "PASS", "by": "agent:r"}]

    stage_case("stage-planning", open_q)
    stage_case("stage-in-progress", doing)
    stage_case("stage-blocked", blocked)
    stage_case("stage-awaiting-owner", awaiting)
    stage_case("stage-in-review", in_review)
    stage_case("stage-all-done-pass", all_done_pass)


# ── L2 ────────────────────────────────────────────────────────────────────
def gen_l2() -> None:
    def refusal_case(name, op, code, pre=None):
        case = ROOT / "L2-refusals" / name
        doc = born_doc()
        if pre:
            pre(doc)
        write_input(case, doc)
        (case / "op.json").write_text(json.dumps(op, indent=2) + "\n")
        d2, _ = specpack.load_specpack(case / "input")
        a = op["args"]
        try:
            if op["op"] == "answer":
                specpack.answer_question(d2, a["q"], a["by"], text=a["text"])
            if op["op"] == "unknown":
                specpack.answer_question(d2, a["q"], a["by"], unknown=True)
            if op["op"] == "approve":
                specpack.approve_spec(d2, a["by"])
            if op["op"] == "record":
                specpack.record(d2, a["task"], a["result"],
                                [{"command": c["command"], "exit_code": c["exit"]} for c in a.get("commands", [])],
                                a.get("expected_revision", 1), a.get("by", "agent:worker"))
            if op["op"] == "close":
                specpack.close(d2, a["by"], at=a.get("at"))
            raise SystemExit(f"{name}: expected refusal, got success")
        except LoomError as e:
            (case / "expected.err").write_text(J({"code": code, "message": str(e)}))

    def resolve_q1(doc):
        specpack.answer_question(doc, "Q-1", "human:owner", text="a", at=FIXED)

    def unknown_q2(doc):
        specpack.answer_question(doc, "Q-2", "human:owner", unknown=True, at=FIXED)

    def done_task(doc):
        resolve_q1(doc)
        specpack.answer_question(doc, "Q-2", "human:owner", text="x", at=FIXED)
        specpack.approve_spec(doc, "human:owner", at=FIXED)
        specpack.record(doc, "T-1", "pass", [{"command": "true", "exit_code": 0}], 1, "agent:worker")

    refusal_case("choice-out-of-options",
                 {"op": "answer", "args": {"q": "Q-1", "text": "banana", "by": "human:owner"}}, "not_one_of_the_options")
    refusal_case("answer-after-resolved",
                 {"op": "answer", "args": {"q": "Q-1", "text": "b", "by": "human:owner"}}, "already_resolved", resolve_q1)
    refusal_case("no-such-question",
                 {"op": "answer", "args": {"q": "Q-9", "text": "x", "by": "human:owner"}}, "no_such_question")
    refusal_case("empty-text",
                 {"op": "answer", "args": {"q": "Q-2", "text": "", "by": "human:owner"}}, "answer_text_empty")
    refusal_case("agent-claim",
                 {"op": "answer", "args": {"q": "Q-2", "text": "x", "by": "agent:pi"}}, "human_claim_required")
    refusal_case("double-unknown",
                 {"op": "unknown", "args": {"q": "Q-2", "by": "human:owner"}}, "already_recorded_unknown", unknown_q2)
    refusal_case("approve-with-open-questions",
                 {"op": "approve", "args": {"by": "human:owner"}}, "open_questions_block_approval")
    refusal_case("record-on-done",
                 {"op": "record", "args": {"task": "T-1", "result": "pass", "commands": [{"command": "true", "exit": 0}],
                                           "expected_revision": 2, "by": "agent:worker"}}, "already_done", done_task)
    refusal_case("record-pass-nonzero-exit",
                 {"op": "record", "args": {"task": "T-1", "result": "pass", "commands": [{"command": "false", "exit": 1}],
                                           "expected_revision": 1, "by": "agent:worker"}}, "pass_needs_zero_exits")
    refusal_case("record-stale-writer",
                 {"op": "record", "args": {"task": "T-1", "result": "pass", "commands": [{"command": "true", "exit": 0}],
                                           "expected_revision": 7, "by": "agent:worker"}}, "stale_writer")
    refusal_case("record-no-such-task",
                 {"op": "record", "args": {"task": "T-9", "result": "pass", "commands": [{"command": "true", "exit": 0}],
                                           "expected_revision": 1, "by": "agent:worker"}}, "no_such_task")
    refusal_case("close-with-gaps", {"op": "close", "args": {"by": "human:owner", "at": FIXED}}, "cannot_close")
    refusal_case("close-agent-claim", {"op": "close", "args": {"by": "agent:pi", "at": FIXED}}, "human_claim_required")


# ── L3 ────────────────────────────────────────────────────────────────────
def gen_l3() -> None:
    def seq(name, events, input_doc=None, precondition=None, pack_path=None, extra=None):
        case = ROOT / "L3-events" / name
        doc = input_doc if input_doc else born_doc()
        if precondition:
            precondition(doc)
        write_input(case, doc, extra)
        (case / "events.jsonl").write_text("".join(json.dumps(e, ensure_ascii=False) + "\n" for e in events))
        with tempfile.TemporaryDirectory() as td:
            work = Path(td) / "w"
            shutil.copytree(case / "input", work)
            d2, _ = specpack.load_specpack(work)
            for e in events:
                try:
                    if e["kind"] in ("answer", "choice", "unknown"):
                        specpack.answer_question(d2, e["q"], "human:owner", text=e.get("text"),
                                                 unknown=e["kind"] == "unknown", at=FIXED)
                    elif e["kind"] == "approve":
                        specpack.approve_spec(d2, "human:owner", at=FIXED)
                    elif e["kind"] == "record":
                        specpack.record(d2, e["task"], e["result"],
                                        [{"command": c["command"], "exit_code": c["exit"]} for c in e.get("commands", [])],
                                        e.get("expected_revision", d2.get("revision", 1)), e.get("by", "agent:worker"))
                    elif e["kind"] == "close":
                        specpack.close(d2, "human:owner", at=FIXED)
                    elif e["kind"] == "next":
                        out = specpack.next_task(d2, Path(pack_path()) if pack_path else None)
                        (case / "expected.handout.json").write_text(J(out))
                except LoomError as e2:
                    (case / "expected.err").write_text(J({"code": "mid_sequence_refusal", "message": str(e2)}))
                    return
            specpack.save(d2, work / "p.json")
            (case / "expected.state.json").write_text((work / "p.json").read_text())

    def ready_doc():
        doc = born_doc()
        specpack.answer_question(doc, "Q-1", "human:owner", text="a", at=FIXED)
        specpack.answer_question(doc, "Q-2", "human:owner", text="x", at=FIXED)
        specpack.approve_spec(doc, "human:owner", at=FIXED)
        doc.setdefault("review", {})["verdicts"] = [{"on": "PACK", "verdict": "PASS", "by": "agent:red-forman"}]
        return doc

    def pre_approved(doc):
        specpack.answer_question(doc, "Q-1", "human:owner", text="a", at=FIXED)
        specpack.answer_question(doc, "Q-2", "human:owner", text="x", at=FIXED)
        specpack.approve_spec(doc, "human:owner", at=FIXED)

    def doing_doc():
        doc = born_doc()
        doc["tasks"][0]["status"] = "doing"
        doc["revision"] = 2
        return doc

    def all_done_doc():
        doc = born_doc()
        specpack.record(doc, "T-1", "pass", [{"command": "true", "exit_code": 0}], 1, "agent:worker")
        doc.setdefault("review", {})["verdicts"] = [{"on": "PACK", "verdict": "PASS", "by": "agent:r"}]
        specpack.answer_question(doc, "Q-1", "human:owner", text="a", at=FIXED)
        specpack.answer_question(doc, "Q-2", "human:owner", text="x", at=FIXED)
        specpack.approve_spec(doc, "human:owner", at=FIXED)
        return doc

    def blocked_doc():
        doc = born_doc()
        specpack.record(doc, "T-1", "fail", [{"command": "false", "exit_code": 1}], 1, "agent:worker")
        specpack.record(doc, "T-1", "fail", [{"command": "false", "exit_code": 1}], 2, "agent:worker")
        return doc

    def notes_fixture(inp):
        (inp / "notes.md").write_text("# pinned truth\n")

    PIN_PATH = lambda: str(ROOT / "L3-events/next-pins-touch/input/p.json")  # noqa: E731
    DRIFT_PATH = lambda: str(ROOT / "L3-events/next-drift-refuses/input/p.json")  # noqa: E731

    def touch_doc(rel, pinned=None):
        def make():
            doc = born_doc()
            entry = {"path": rel}
            if pinned:
                entry["sha256"] = pinned
            doc["tasks"][0]["context"] = {"touch": [entry]}
            return doc
        return make

    # the touch path is repo-relative (git-root resolution is the contract);
    # the fixture file is committed beside the case and never regenerated
    seq("next-pins-touch", [{"kind": "next"}], touch_doc(
        "treadle/packages/conformance/corpus/L3-events/next-pins-touch/input/notes.md")(),
        pack_path=PIN_PATH, extra=notes_fixture)
    seq("next-drift-refuses", [{"kind": "next"}], touch_doc(
        "treadle/packages/conformance/corpus/L3-events/next-drift-refuses/input/notes.md",
        pinned="0" * 64)(),
        pack_path=DRIFT_PATH, extra=notes_fixture)

    seq("happy-full-ceremony", [
        {"kind": "choice", "q": "Q-1", "option": "b", "text": "b", "by": "human:owner"},
        {"kind": "answer", "q": "Q-2", "text": "because I said so", "by": "human:owner"},
        {"kind": "approve", "by": "human:owner"},
    ])
    seq("honest-unknown-then-answer", [
        {"kind": "unknown", "q": "Q-2", "by": "human:owner"},
        {"kind": "answer", "q": "Q-2", "text": "now I know", "by": "human:owner"},
        {"kind": "answer", "q": "Q-1", "text": "a", "by": "human:owner"},
    ])
    seq("approve-before-answers", [{"kind": "approve", "by": "human:owner"}])
    seq("double-approve", [{"kind": "approve", "by": "human:owner"}], precondition=pre_approved)
    seq("record-pass-then-close", [
        {"kind": "record", "task": "T-1", "result": "pass", "commands": [{"command": "true", "exit": 0}],
         "expected_revision": 1, "by": "agent:worker"},
        {"kind": "close", "by": "human:owner"},
    ], ready_doc())
    seq("fail-twice-blocks-then-unblock", [
        {"kind": "record", "task": "T-1", "result": "fail", "commands": [{"command": "false", "exit": 1}],
         "expected_revision": 1, "by": "agent:worker"},
        {"kind": "record", "task": "T-1", "result": "fail", "commands": [{"command": "false", "exit": 1}],
         "expected_revision": 2, "by": "agent:worker"},
        {"kind": "record", "task": "T-1", "result": "unblock", "expected_revision": 3, "by": "human:owner"},
    ])
    seq("next-hands-out-t1", [{"kind": "next"}])
    seq("next-resumes-doing", [{"kind": "next"}], doing_doc())
    seq("next-after-all-done", [{"kind": "next"}], all_done_doc())
    seq("next-reports-blocked", [{"kind": "next"}], blocked_doc())

    # journal case
    case = ROOT / "L3-events/read-events-journal"
    inp = case / "input"
    inp.mkdir(parents=True, exist_ok=True)
    shutil.rmtree(inp)
    inp.mkdir(parents=True)
    specpack.save(born_doc(), inp / "p.json")
    (inp / "interview.jsonl").write_text(
        json.dumps({"format": "specweb-events/0.1"}) + "\n" +
        json.dumps({"kind": "choice", "by": "human:owner", "at": FIXED, "q": "Q-1", "text": "b", "option": "b"}) + "\n" +
        json.dumps({"kind": "approve", "by": "human:owner", "at": FIXED}) + "\n")
    (case / "events.jsonl").write_text(json.dumps({"kind": "read-events"}) + "\n")
    (case / "expected.events.json").write_text(J(ev.read_events(inp / "interview.jsonl")))


# ── K1 ────────────────────────────────────────────────────────────────────
def mini_bundle(d: Path) -> None:
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.md").write_text("---\ntitle: The wiki\n---\nbundle root, reserved\n")
    (d / "systems").mkdir(exist_ok=True)
    (d / "systems/loom.md").write_text(
        "---\ntitle: The loom engine\ntype: system\ntags: [engine, loop]\ndescription: The loop that does the work.\n---\n"
        "The loom hands out one frozen task at a time. Evidence only; the machine owns the loop. "
        "Answers land through admission with human claims.\n\n"
        "See [the knowledge engine](okf.md) and [trust rules](/domain/trust-rules.md). "
        "A [ghost](ghost.md) link is broken on purpose.\n")
    (d / "systems/okf.md").write_text(
        "---\ntitle: The knowledge engine\ntype: system\ntags: [engine, knowledge]\ndescription: Anchored knowledge.\n---\n"
        "Every page anchors to path:line. Freshness stamps say when the wiki is stale. "
        "Findings go through the ledger; humans accept.\n")
    (d / "domain").mkdir(exist_ok=True)
    (d / "domain/trust-rules.md").write_text(
        "---\ntitle: Trust rules\ntype: pattern\ntags: [policy]\ndescription: Deterministic anchors, agent proposals, human acceptance.\n---\n"
        "Deterministic tools find and anchor. Agents propose; humans accept. Evidence or it did not happen.\n")
    (d / "domain/broken.md").write_text(
        "---\n- just\n- a list\n---\nThis block is invalid frontmatter and the validator will say so.\n")
    (d / "plain.md").write_text("A page with no frontmatter. It is still indexed by body words like loom.\n")
    (d / "legacy.md").write_text(
        "---\ntitle: Legacy page\ntype: note\ntimestamp: 2026-01-01\nstatus: maybe\n---\nOld shape kept for the validator's warnings.\n")
    (d / "dupkeys.md").write_text("---\ntitle: First\ntype: system\ntype: last-wins\n---\nDuplicate keys take the last value.\n")
    (d / "cronly.md").write_bytes(
        b"---\rtitle: CR endings\rtype: note\r---\rpython splitlines treats lone CR as line ends.\r")


def k1_goldens(case: Path, queries) -> None:
    inp = case / "input"
    idx = build_index(inp)
    (case / "expected.index.json").write_text(J(idx.to_dict()))
    out = []
    for q in queries:
        hits = py_search(idx, q["q"], type=q.get("type"), tag=q.get("tag"))
        out.append({"query": q, "hits": [
            {"cid": h.cid, "title": h.title, "type": h.type, "snippet": h.snippet, "score": h.score} for h in hits]})
    (case / "expected.search.json").write_text(J(out))
    concepts = [parse_concept(md, inp) for md in iter_concept_files(inp)]
    (case / "expected.concepts.json").write_text(J([
        {"cid": c.cid, "reserved": c.reserved, "frontmatter_present": c.frontmatter_present,
         "frontmatter_error": c.frontmatter_error, "frontmatter": c.frontmatter,
         "body_startswith": c.body[:40]} for c in concepts]))
    adj = build_adjacency(inp, concepts)
    (case / "expected.links.json").write_text(J({
        "adjacency": adj, "backlinks": build_backlinks(adj),
        "broken": {c.cid: broken_links(inp, c) for c in concepts if c.reserved is None and broken_links(inp, c)}}))
    rep = validate_bundle(inp)
    (case / "expected.validate.json").write_text(J({
        "conformant": rep.conformant,
        "errors": [{"severity": f.severity, "code": f.code, "message": f.message, "cid": f.cid} for f in rep.errors],
        "warnings": [{"severity": f.severity, "code": f.code, "message": f.message, "cid": f.cid} for f in rep.warnings],
        "info": [{"severity": f.severity, "code": f.code, "message": f.message, "cid": f.cid} for f in rep.info]}))
    if (inp / "systems/loom.md").is_file():
        (case / "expected.read.json").write_text(J({
            "seed_depth0": read_concept(inp, "systems/loom"),
            "seed_depth1": read_concept(inp, "systems/loom", depth=1)}))


def gen_k1() -> None:
    case = ROOT / "K1-bundle/mini-bundle"
    shutil.rmtree(ROOT / "K1-bundle", ignore_errors=True)
    mini_bundle(case / "input")
    k1_goldens(case, [
        {"q": "loom"}, {"q": "the loom engine"}, {"q": "knowledge"}, {"q": "anchor"},
        {"q": "engine", "tag": ["knowledge"]}, {"q": "trust", "type": ["pattern"]},
        {"q": ""}, {"q": "endings"}, {"q": "last-wins"},
    ])

    # the 0.2-declared bundle: the entire advisory block fires
    case = ROOT / "K1-bundle/okf02-advisory"
    d = case / "input"
    d.mkdir(parents=True)
    (d / "index.md").write_text('---\nokf_version: "0.2"\n---\nroot\n')
    (d / "legacy.md").write_text(
        "---\ntitle: Legacy\ntype: note\ntimestamp: 2026-01-01\nstatus: maybe\n"
        "generated: {at: x}\nverified: {by: ''}\nsources: [{id: s}]\nstale_after: 2026-09-23T00:00:00Z\n---\n"
        "# Citations\n\nlegacy shapes on purpose\n")
    (d / "good.md").write_text(
        "---\ntitle: Good\ntype: note\nstatus: stable\n"
        "generated: {by: agent:r}\nverified: [{by: human:owner}]\n"
        "sources: [{id: s1, resource: docs/x.md}]\nstale_after: \"2027-01-01T00:00:00Z\"\n---\nclean 0.2 page\n")
    k1_goldens(case, [{"q": "legacy"}, {"q": "clean"}])


if __name__ == "__main__":
    gen_l1()
    gen_l2()
    gen_l3()
    gen_k1()
    cases = sum(1 for _ in ROOT.rglob("expected.*"))
    print(f"corpus regenerated: {cases} golden files under {ROOT}")
