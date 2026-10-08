"""Specpack support: loom speaking specpack/0.2 natively.

Pure functions over the json. Determinism rules: every reported list is
sorted; slices are canonical renders with sha256 digests; the only clock
in the system lives inside evidence rows the caller supplies.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator

from .spine import LoomError, save

SCHEMA_PATH = Path(__file__).resolve().parent / "schemas" / "specpack.schema.json"
STATES = ("todo", "doing", "done", "blocked")
STALL_LIMIT = 2


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _digest(obj: object) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def _vschema() -> dict:
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


def load_specpack(directory: str | Path) -> tuple[dict, Path]:
    directory = Path(directory)
    if (directory / "sdd.json").exists():
        raise LoomError(f"{directory}: sdd.json present — legacy spine takes precedence; specpack support is for specpack initiatives")
    candidates = sorted(directory.glob("*.json"))
    if not candidates:
        raise LoomError(f"{directory}: no specpack json found")
    path = candidates[0]
    with open(path, encoding="utf-8") as f:
        try:
            doc = json.load(f)
        except json.JSONDecodeError as e:
            raise LoomError(f"{path}: invalid JSON: {e}") from e
    if doc.get("format", "").startswith("specpack/") is False:
        raise LoomError(f"{path}: not a specpack (format={doc.get('format')!r})")
    validate(doc, path)
    return doc, path


def validate(doc: dict, path: Path | None = None) -> list[str]:
    where = f"{path}: " if path else ""
    v = Draft202012Validator(_vschema())
    errs = [f"{where}{list(e.path)}: {e.message}" for e in sorted(v.iter_errors(doc), key=lambda e: list(e.path))]
    return errs


def _families(doc: dict) -> dict[str, set[str]]:
    fams: dict[str, set[str]] = {}
    for key, fam in (("stories", "US"), ("requirements", "FR"), ("constraints", "CON"), ("clarifications", "Q")):
        fams[fam] = {x["id"] for x in doc["spec"].get(key, [])}
    fams["AC"] = {s["id"] for r in doc["spec"]["requirements"] for s in r.get("scenarios", [])}
    fams["D"] = {d["id"] for d in doc["plan"].get("decisions", [])}
    fams["DES"] = {d["id"] for d in doc["plan"].get("designs", [])}
    fams["DG"] = {g["id"] for g in doc["plan"].get("diagrams", [])}
    fams["T"] = {t["id"] for t in doc["tasks"]}
    return fams


def alignment(doc: dict) -> tuple[list[str], dict]:
    """A1–A4 violations (sorted) + A5 coverage report (sorted). Deterministic."""
    errs: list[str] = []
    fams = _families(doc)
    # A1 ids unique across families (within-family dupes collapse in the sets,
    # so also count raw declarations)
    raw: list[str] = []
    for key, fam in (("stories", "US"), ("requirements", "FR"), ("constraints", "CON"), ("clarifications", "Q")):
        raw.extend(x["id"] for x in doc["spec"].get(key, []))
    for r in doc["spec"]["requirements"]:
        raw.extend(s["id"] for s in r.get("scenarios", []))
    raw.extend(d["id"] for d in doc["plan"].get("decisions", []))
    raw.extend(d["id"] for d in doc["plan"].get("designs", []))
    raw.extend(g["id"] for g in doc["plan"].get("diagrams", []))
    raw.extend(t["id"] for t in doc["tasks"])
    if len(raw) != len(set(raw)):
        dupes = sorted({x for x in raw if raw.count(x) > 1})
        errs.append(f"A1 duplicate ids: {', '.join(dupes)}")
    # A2 references resolve
    des_addr = {d["id"]: set(d.get("addresses", [])) for d in doc["plan"].get("designs", [])}
    for t in doc["tasks"]:
        for n in t.get("needs", []):
            if n not in fams["T"]:
                errs.append(f"A2 {t['id']}.needs dangling: {n}")
        for x in t.get("implements", []):
            if x not in fams["DES"]:
                errs.append(f"A2 {t['id']}.implements dangling: {x}")
        for x in t.get("satisfies", []):
            if x not in fams["FR"]:
                errs.append(f"A2 {t['id']}.satisfies dangling: {x}")
        for x in t.get("accepts", []):
            if x not in fams["AC"]:
                errs.append(f"A2 {t['id']}.accepts dangling: {x}")
        for x in t.get("honors", []):
            if x not in fams["CON"]:
                errs.append(f"A2 {t['id']}.honors dangling: {x}")
    for d in doc["plan"].get("designs", []):
        for a in d.get("addresses", []):
            if a not in fams["FR"] | fams["CON"]:
                errs.append(f"A2 {d['id']}.addresses dangling: {a}")
    for q in doc["spec"].get("clarifications", []):
        rb = q.get("resolved_by")
        if rb and rb not in fams["D"]:
            errs.append(f"A2 {q['id']}.resolved_by dangling: {rb}")
    for dd in doc["plan"].get("decisions", []):
        for q in dd.get("resolves", []):
            if q not in fams["Q"]:
                errs.append(f"A2 {dd['id']}.resolves dangling: {q}")
    # A3 needs acyclic
    deps = {t["id"]: t.get("needs", []) for t in doc["tasks"]}
    state: dict[str, int] = {}

    def dfs(u: str) -> None:
        state[u] = 1
        for v in deps.get(u, []):
            if state.get(v) == 1:
                errs.append(f"A3 needs cycle: {u} -> {v}")
            elif state.get(v, 0) == 0:
                dfs(v)
        state[u] = 2

    for u in sorted(deps):
        if state.get(u, 0) == 0:
            dfs(u)
    # A4 every task reaches >=1 FR
    for t in doc["tasks"]:
        via = any(fams["FR"] & des_addr.get(x, set()) for x in t.get("implements", []))
        if not (t.get("satisfies") or via):
            errs.append(f"A4 {t['id']} does not align to any requirement")
    errs.sort()
    # A5 coverage (reported, never blocking)
    reached_fr: dict[str, set[str]] = {}
    for t in doc["tasks"]:
        for f in t.get("satisfies", []):
            reached_fr.setdefault(f, set()).add(t["id"])
        for d in t.get("implements", []):
            for f in des_addr.get(d, set()):
                reached_fr.setdefault(f, set()).add(f"{t['id']} (via {d})")
    coverage = {
        "FR": {
            f: sorted(reached_fr.get(f, set()))
            for f in sorted(fams["FR"])
        },
        "AC": {
            a: sorted({t["id"] for t in doc["tasks"] if a in t.get("accepts", [])})
            for a in sorted(fams["AC"])
        },
        "DES": {
            d: sorted({t["id"] for t in doc["tasks"] if d in t.get("implements", [])})
            for d in sorted(fams["DES"])
        },
    }
    return errs, coverage


def _fail_streak(doc: dict, task_id: str) -> int:
    t = _task(doc, task_id)
    streak = 0
    for e in reversed(t.get("evidence", [])):
        if e["exit"] == 0:
            break
        streak += 1
    return streak


def _task(doc: dict, task_id: str) -> dict:
    for t in doc["tasks"]:
        if t["id"] == task_id:
            return t
    raise LoomError(f"no task {task_id}")


def next_task(doc: dict) -> dict:
    """Resume doing-without-evidence, then ready todo; id order. Deterministic."""
    tasks = doc["tasks"]
    done = {t["id"] for t in tasks if t["status"] == "done"}
    pick = None
    for t in sorted(tasks, key=lambda x: x["id"]):
        # doing = an outstanding handout (record always leaves doing), so any
        # doing task is a resume — evidence rows are history from earlier takes
        if t["status"] == "doing":
            pick = t
            break
    if pick is None:
        blocked = {t["id"] for t in tasks if t["status"] == "blocked"}
        for t in sorted(tasks, key=lambda x: x["id"]):
            if t["status"] == "todo" and all(n in done for n in t.get("needs", [])):
                pick = t
                break
    if pick is None:
        if any(t["status"] == "blocked" for t in tasks):
            return {"status": "BLOCKED", "tasks": sorted(t["id"] for t in tasks if t["status"] == "blocked")}
        if all(t["status"] == "done" for t in tasks):
            return {"status": "DONE"}
        return {"status": "WAITING", "reason": "no ready task"}
    pick["status"] = "doing"
    doc["revision"] = doc.get("revision", 1) + 1
    sl = slice_for(doc, pick["id"])
    return {"status": "task", "task": pick["id"], **sl}


def slice_for(doc: dict, task_id: str) -> dict:
    t = _task(doc, task_id)
    keep = {task_id}
    stack = list(t.get("needs", [])) + list(t.get("satisfies", [])) + list(t.get("implements", [])) + list(t.get("accepts", [])) + list(t.get("honors", []))
    while stack:
        x = stack.pop()
        if x in keep:
            continue
        keep.add(x)
        if x in {tt["id"] for tt in doc["tasks"]}:
            # prerequisite tasks contribute their own flow AND trace links:
            # integrating with T-2 means reading what T-2 satisfies and honors
            pt = _task(doc, x)
            stack.extend(pt.get("needs", []))
            stack.extend(pt.get("satisfies", []))
            stack.extend(pt.get("implements", []))
            stack.extend(pt.get("honors", []))
    items = []
    for k in sorted(keep):
        tt = next((x for x in doc["tasks"] if x["id"] == k), None)
        if tt:
            items.append({"id": k, "kind": "TASK", "title": tt["title"], "status": tt["status"], "verify": tt["verify"]})
            continue
        b = _lookup(doc, k)
        if b:
            items.append({"id": k, "kind": b[0], **b[1]})
        else:
            items.append({"id": k, "kind": "REF"})
    omitted = sorted(x["id"] for x in doc["tasks"] if x["id"] not in keep)
    body = {"task": task_id, "items": items, "omitted_tasks": omitted}
    return {"items": items, "omitted_tasks": omitted, "slice_digest": _digest(body)}


def _lookup(doc: dict, id_: str) -> tuple[str, dict] | None:
    for s in doc["spec"].get("stories", []):
        if s["id"] == id_:
            return "US", {"text": f"{s['as']} wants {s['want']} — so that {s['so']}"}
    for r in doc["spec"]["requirements"]:
        if r["id"] == id_:
            return "FR", {"text": r["text"]}
        for s in r.get("scenarios", []):
            if s["id"] == id_:
                return "AC", {"text": f"Given {s['given']} / When {s['when']} / Then {s['then']}"}
    for c in doc["spec"].get("constraints", []):
        if c["id"] == id_:
            return "CON", {"text": c["text"]}
    for q in doc["spec"].get("clarifications", []):
        if q["id"] == id_:
            return "Q", {"text": q["question"]}
    for d in doc["plan"].get("decisions", []):
        if d["id"] == id_:
            return "D", {"text": f"{d['decision']} — because {d['because']}"}
    for d in doc["plan"].get("designs", []):
        if d["id"] == id_:
            return "DES", {"text": f"{d['title']}: {d.get('detail', '')}"}
    return None


def record(doc: dict, task_id: str, result: str, commands: list[dict], expected_revision: int, by: str, notes: str | None = None) -> dict:
    if doc.get("revision", 1) != expected_revision:
        raise LoomError(f"stale writer: file is at revision {doc.get('revision', 1)}, caller expected {expected_revision}")
    t = _task(doc, task_id)
    ts = _now()
    if result == "unblock":
        if t["status"] != "blocked":
            raise LoomError(f"{task_id}: unblock requires blocked, found {t['status']}")
        t["status"] = "todo"
        doc["revision"] = doc.get("revision", 1) + 1
        return {"task": task_id, "status": "todo"}
    if result == "cancel":
        raise LoomError("specpack tasks are not cancelled; mark out of scope in the spec or remove the task")
    if result not in ("pass", "fail"):
        raise LoomError(f"unknown result '{result}'")
    if t["status"] not in ("doing", "todo"):
        if t["status"] == "done":
            raise LoomError(f"{task_id}: already done")
        raise LoomError(f"{task_id}: cannot record from {t['status']}")
    if result == "pass" and (
        not commands or any(int(c.get("exit_code", c.get("exit"))) != 0 for c in commands)
    ):
        raise LoomError("M_run = M: a pass needs at least one executed command and every command must exit 0 — a failed step makes the attempt a fail")
    row = {
        "cmd": "; ".join(c["command"] for c in commands),
        "exit": next((c.get("exit_code", c.get("exit")) for c in commands), 1),
        "at": ts,
        "by": by,
        **({"notes": notes} if notes else {}),
    }
    if len(commands) > 1:
        row["exit"] = max(int(c.get("exit_code", c.get("exit"))) for c in commands)
        row["cmd"] = " && ".join(f"{c['command']} [exit {c.get('exit_code', c.get('exit'))}]" for c in commands)
    t.setdefault("evidence", []).append(row)
    if result == "pass":
        t["status"] = "done"
    else:
        streak = _fail_streak(doc, task_id)
        t["status"] = "blocked" if streak >= STALL_LIMIT else "todo"
    doc["revision"] = doc.get("revision", 1) + 1
    return {"task": task_id, "status": t["status"], "fail_streak": _fail_streak(doc, task_id)}
