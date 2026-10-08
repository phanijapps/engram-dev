"""The deterministic state machine. Only this module moves states.

Trust rules encoded here:
- M_run = M: a pass claim without a recorded zero-exit command is refused;
  a command that cannot run is FAIL, never PASS.
- Severed backflow: every mutation is fenced by expected_revision; a stale
  writer is refused, so the worker can never rewrite its own verdicts.
- The stall valve: two consecutive failed attempts block the task and name
  the upstream chain — the failure's cause may live upstream of the failure
  site (SpecAgent's root-cause rule).
- Piecemeal growth: `next` hands out exactly one task with a frozen,
  digested context; specs grow one slice at a time.
"""

from __future__ import annotations

import hashlib
import json

from . import TERMINAL
from .spine import LoomError, bump, node_ids, requires_of, save, task_state, _now

STALL_LIMIT = 2


def _digest(obj: object) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def _prereq_states(doc: dict, task_id: str) -> dict[str, str]:
    states = {t["task_id"]: t["state"] for t in doc["runtime"]["task_states"]}
    return {p: states.get(p, "PENDING") for p in requires_of(doc, task_id)}


def _satisfied(doc: dict, task_id: str) -> bool:
    return all(s == "SUCCEEDED" for s in _prereq_states(doc, task_id).values())


def _upstream_chain(doc: dict, task_id: str) -> list[str]:
    """The failure chain: the task plus its transitive requires, deterministic order."""
    seen: list[str] = []

    def walk(u: str) -> None:
        if u in seen:
            return
        seen.append(u)
        for p in requires_of(doc, u):
            walk(p)

    walk(task_id)
    return seen


def add_node(
    doc: dict,
    node_id: str,
    kind: str,
    title: str,
    text: str,
    created_by: str,
    details: str | None = None,
    requires: list[str] | None = None,
    artifact_refs: list[dict] | None = None,
    epistemic_state: str = "DECLARED",
) -> dict:
    from . import EPISTEMIC, NODE_KINDS, RELATION_KINDS

    if kind not in NODE_KINDS:
        raise LoomError(f"unknown node kind '{kind}'")
    if epistemic_state not in EPISTEMIC:
        raise LoomError(f"unknown epistemic state '{epistemic_state}'")
    if node_ids(doc) and node_id in node_ids(doc):
        raise LoomError(f"node '{node_id}' already exists")
    ts = _now()
    node = {
        "node_id": node_id,
        "kind": kind,
        "title": title,
        "body": {"text": text, **({"details": details} if details else {})},
        "epistemic_state": epistemic_state,
        "provenance_refs": [],
        "artifact_refs": artifact_refs or [],
        "extensions": {},
        "revision": 1,
        "created_at": ts,
        "created_by": created_by,
    }
    doc["nodes"].append(node)
    if requires:
        unknown = [r for r in requires if r not in node_ids(doc)]
        if unknown:
            raise LoomError(f"unknown requires targets: {', '.join(unknown)}")
        for i, target in enumerate(requires):
            doc["relations"].append(
                {
                    "relation_id": f"rel-{node_id}-req-{i}-{target}",
                    "kind": "requires",
                    "from_ref": {"node_id": node_id, "revision": 1},
                    "to_ref": {"node_id": target, "revision": 1},
                    "epistemic_state": "DECLARED",
                    "extensions": {},
                    "revision": 1,
                    "created_at": ts,
                    "created_by": created_by,
                }
            )
    if kind == "TASK":
        doc["runtime"]["task_states"].append(
            {
                "task_id": node_id,
                "state": "PENDING",
                "state_version": 1,
                "attempts": [],
                "extensions": {},
            }
        )
    doc["runtime"]["events"].append({"at": ts, "kind": "node.added", "detail": f"{kind} {node_id}"})
    return bump(doc)


def _relation_kinds_ok(doc: dict) -> None:
    from . import RELATION_KINDS

    for r in doc["relations"]:
        if r["kind"] not in RELATION_KINDS:
            raise LoomError(f"unknown relation kind {r['kind']}")


def promote(doc: dict, by: str = "loom") -> int:
    """PENDING -> READY for every task whose AND-prerequisites all SUCCEEDED."""
    moved = 0
    for t in doc["runtime"]["task_states"]:
        if t["state"] == "PENDING" and _satisfied(doc, t["task_id"]):
            t["state"] = "READY"
            t["state_version"] += 1
            moved += 1
    if moved:
        doc["runtime"]["events"].append({"at": _now(), "kind": "tasks.promoted", "detail": str(moved)})
    return moved


def compile_context(doc: dict, task_id: str) -> dict:
    """The frozen context: task + transitive prerequisite bodies + artifacts."""
    chain = _upstream_chain(doc, task_id)
    nodes = sorted(
        (
            {
                "node_id": n["node_id"],
                "kind": n["kind"],
                "title": n["title"],
                "body": n["body"],
                "artifact_refs": n["artifact_refs"],
            }
            for n in doc["nodes"]
            if n["node_id"] in chain
        ),
        key=lambda n: n["node_id"],
    )
    ctx = {
        "task": task_id,
        "requires_chain": [x for x in chain if x != task_id],
        "nodes": nodes,
        "artifacts": doc["artifacts"],
        "wiki_hint": "retrieve verified patterns from the okf wiki (loom L2: automated)",
    }
    full = _digest(ctx)
    ctx_out = {
        "context_id": hashlib.sha256(full.encode()).hexdigest()[:12],
        "digest": full,
        "context": ctx,
    }
    return ctx_out


def next_task(doc: dict) -> dict:
    """Promote, then hand out the first takeable task in node_id order.

    Takeable: READY, FAILED (retry before the stall limit), or RUNNING
    with zero attempts (crash recovery — the context digest is already
    pinned, so the resumed worker sees the same frozen context).

    Returns {"status": "task", ...context} | {"status": "DONE"} |
    {"status": "BLOCKED", ...} | {"status": "WAITING", ...}.
    """
    promote(doc)
    ready = sorted(
        (
            t
            for t in doc["runtime"]["task_states"]
            if (
                t["state"] in ("READY", "FAILED")
                or (t["state"] == "RUNNING" and not t["attempts"])
            )
            and t["task_id"] in node_ids(doc)
        ),
        key=lambda t: t["task_id"],
    )
    blocked = [t for t in doc["runtime"]["task_states"] if t["state"] == "BLOCKED"]
    if not ready:
        if blocked:
            return {
                "status": "BLOCKED",
                "tasks": [b["task_id"] for b in blocked],
                "reason": "all remaining tasks are blocked; human decision needed (loom record --result unblock)",
            }
        if all(t["state"] in TERMINAL for t in doc["runtime"]["task_states"]):
            return {"status": "DONE"}
        return {"status": "WAITING", "reason": "tasks exist but none are ready"}
    t = ready[0]
    t["state"] = "RUNNING"
    t["state_version"] += 1
    ctx = compile_context(doc, t["task_id"])
    t["context"] = {"context_id": ctx["context_id"], "digest": ctx["digest"]}
    doc["runtime"]["events"].append(
        {"at": _now(), "kind": "task.running", "detail": f"{t['task_id']} ctx={ctx['context_id']}"}
    )
    bump(doc)
    # flat output: task identity + the frozen context's fields side by side
    return {
        "status": "task",
        "task": t["task_id"],
        "attempt_floor": len(t["attempts"]),
        **ctx["context"],
        "context_id": ctx["context_id"],
        "digest": ctx["digest"],
    }


def record(
    doc: dict,
    task_id: str,
    result: str,
    commands: list[dict],
    expected_revision: int,
    worker: str,
    notes: str | None = None,
) -> dict:
    """Record an attempt. result: pass | fail | unblock | cancel."""
    if doc["revision"] != expected_revision:
        raise LoomError(
            f"stale writer: spine is at revision {doc['revision']}, caller expected {expected_revision}"
        )
    t = task_state(doc, task_id)
    ts = _now()

    if result == "unblock":
        if t["state"] != "BLOCKED":
            raise LoomError(f"{task_id}: unblock requires BLOCKED, found {t['state']}")
        t["state"] = "READY"
        t["state_version"] += 1
        t.pop("escalation", None)  # remove cleanly; a null value would fail the schema on reload
        doc["runtime"]["events"].append({"at": ts, "kind": "task.unblocked", "detail": task_id})
        bump(doc)
        return {"task": task_id, "state": "READY"}

    if result == "cancel":
        if t["state"] in TERMINAL:
            raise LoomError(f"{task_id}: already terminal ({t['state']})")
        t["state"] = "CANCELLED"
        t["state_version"] += 1
        doc["runtime"]["events"].append({"at": ts, "kind": "task.cancelled", "detail": task_id})
        bump(doc)
        return {"task": task_id, "state": "CANCELLED"}

    if result not in ("pass", "fail"):
        raise LoomError(f"unknown result '{result}'")
    if t["state"] not in ("RUNNING", "VERIFYING", "READY", "FAILED"):
        raise LoomError(f"{task_id}: cannot record from state {t['state']}")
    if result == "pass" and not any(c["exit_code"] == 0 for c in commands):
        raise LoomError(
            "M_run = M: a pass needs at least one executed command with exit code 0; "
            "a check that cannot run is FAIL, never PASS"
        )
    attempt = {
        "attempt_id": f"att-{task_id}-{len(t['attempts']) + 1}",
        "task_id": task_id,
        "started_at": ts,
        "finished_at": ts,
        "worker": worker,
        "commands": commands,
        "result": result,
        **({"notes": notes} if notes else {}),
    }
    doc["runtime"]["attempts"].append(attempt)
    t["attempts"].append(attempt["attempt_id"])
    t["state"] = "SUCCEEDED" if result == "pass" else "FAILED"
    t["state_version"] += 1
    streak = _fail_streak(doc, task_id)
    detail = f"{task_id} {result} ({len(commands)} command(s))"
    if result == "fail" and streak >= STALL_LIMIT:
        chain = _upstream_chain(doc, task_id)
        t["state"] = "BLOCKED"
        t["escalation"] = {
            "upstream": chain,
            "reason": f"{streak} consecutive failed attempts; the cause may live upstream",
            "at": ts,
        }
        detail += " -> BLOCKED, escalation recorded"
    doc["runtime"]["events"].append({"at": ts, "kind": "task.recorded", "detail": detail})
    bump(doc)
    return {
        "task": task_id,
        "state": t["state"],
        "fail_streak": streak,
        **({"escalation": t["escalation"]} if "escalation" in t and t.get("escalation") else {}),
    }


def _fail_streak(doc: dict, task_id: str) -> int:
    t = task_state(doc, task_id)
    streak = 0
    for aid in reversed(t["attempts"]):
        att = next(a for a in doc["runtime"]["attempts"] if a["attempt_id"] == aid)
        if att["result"] == "fail":
            streak += 1
        else:
            break
    return streak


def persist(doc: dict, path) -> None:
    save(doc, path)
