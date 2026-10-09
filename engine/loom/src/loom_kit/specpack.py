"""Specpack support: loom speaking specpack/0.2 natively.

Pure functions over the json. Determinism rules: every reported list is
sorted; slices are canonical renders with sha256 digests; the only clock
in the system lives inside evidence rows the caller supplies.
"""

from __future__ import annotations

import hashlib
import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator

from .spine import LoomError
from .spine import save as _spine_save

SCHEMA_PATH = Path(__file__).resolve().parent / "schemas" / "specpack.schema.json"
STALL_LIMIT = 2
KNOWN_FORMATS = ("specpack/0.2", "specpack/0.3")

# The canonical reading order (D-1 of spec-layout): the writer emits exactly
# this; nothing else in the ecosystem reads member order (RFC 8259).
CANONICAL_ORDER = (
    "id", "name", "description", "date", "status", "metadata",
    "spec", "design", "tasks", "review", "env", "format", "revision",
)

_LAYOUT_LOCK = threading.Lock()

# The status vocabulary — one source of truth (FR-2 of status-vocabulary).
# The vendored schema enums must equal these tuples; a guard test enforces it.
PACK_ACTIVE, PACK_COMPLETE = "active", "complete"
PACK_STATUSES = (PACK_ACTIVE, PACK_COMPLETE)
TASK_STATUSES = ("todo", "doing", "done", "blocked")
DECISION_STATUSES = ("proposed", "accepted", "rejected")
QUESTION_STATUSES = ("open", "resolved")
VERDICTS = ("PASS", "IMPROVE", "REPLAN")
# Reported (transient) statuses of `loom next` — never stored in a pack.
HANDOUT_STATUSES = ("task", "DONE", "BLOCKED", "WAITING", "needs_rebase", "needs_closure", "COMPLETE")
DELIVERABLE_STAGES = (
    "drafted", "planning", "in_progress", "blocked",
    "awaiting_owner", "in_review", "delivered",
)


def derive_deliverable(doc: dict) -> str:
    """The stage of the overall deliverable (D-5). A total deterministic
    function of task states, decision states, question states, and review.
    First match wins; never hand-set; verified like a checksum.
    """
    tasks = doc.get("tasks") or []
    statuses = [t.get("status") for t in tasks]
    if doc.get("status") == PACK_COMPLETE:
        return "delivered"
    if "doing" not in statuses and "blocked" in statuses:
        return "blocked"
    if tasks and all(st == "done" for st in statuses):
        gaps = closure_gaps(doc)
        if gaps["pending_decisions"] or gaps["open_questions"]:
            return "awaiting_owner"
        if not gaps["review_pass"]:
            return "in_review"
        return "in_progress"  # all done, review passed, not yet closed
    if "doing" in statuses or "done" in statuses:
        return "in_progress"  # work underway or partially delivered; done-with-remaining included
    openq = [q for q in doc["spec"].get("clarifications", []) if q.get("status") == "open"]
    if openq and "done" not in statuses and "doing" not in statuses:
        return "planning"
    return "drafted"


def _normalize(doc: dict) -> dict:
    """Dual-read (D-2 of spec-layout): old flat layouts normalize to the
    canonical internal model. In place. The on-disk file never changes here.
    """
    if "design" in doc:  # new layout
        doc["plan"] = doc.pop("design")
        doc["title"] = doc.pop("description", doc.get("title", ""))
        md = doc.pop("metadata", None)
        if isinstance(md, dict):
            arts = {}
            for k, v in md.items():
                if isinstance(v, dict):
                    e = {"file": v.get("ref", "")}
                    if v.get("type") is not None:
                        e["type"] = v["type"]
                    if v.get("description") is not None:
                        e["description"] = v["description"]
                    if v.get("sha256"):
                        e["sha256"] = v["sha256"]
                    arts[k] = e
            doc["artifacts"] = arts
        date = doc.pop("date", None)
        if isinstance(date, dict):
            if date.get("created"):
                doc["created"] = date["created"]
            if date.get("updated"):
                doc["updated"] = date["updated"]
            closed = date.get("closed")
            if isinstance(closed, dict):
                if closed.get("at"):
                    doc["closed_at"] = closed["at"]
                if closed.get("by"):
                    doc["closed_by"] = closed["by"]
        st = doc.pop("status", None)
        if isinstance(st, dict):
            if st.get("lifecycle"):
                doc["status"] = st["lifecycle"]
            if st.get("deliverable") is not None:
                doc["deliverable"] = st["deliverable"]
    return doc


def _emit(doc: dict) -> dict:
    """Build the on-disk dict in the canonical reading order (D-1)."""
    out: dict = {}
    out["id"] = doc.get("id", doc.get("name"))
    out["name"] = doc["name"]
    out["description"] = doc.get("title", "")
    date = {}
    if doc.get("created"):
        date["created"] = doc["created"]
    if doc.get("updated"):
        date["updated"] = doc["updated"]
    if doc.get("closed_at"):
        date["closed"] = {"at": doc["closed_at"], **({"by": doc["closed_by"]} if doc.get("closed_by") else {})}
    if date:
        out["date"] = date
    st = {}
    if doc.get("status"):
        st["lifecycle"] = doc["status"]
    if doc.get("deliverable"):
        st["deliverable"] = doc["deliverable"]
    if st:
        out["status"] = st
    if doc.get("artifacts"):
        md = {}
        for k, v in doc["artifacts"].items():
            e = {"ref": v.get("file", "")}
            if v.get("type") is not None:
                e["type"] = v["type"]
            if v.get("description") is not None:
                e["description"] = v["description"]
            if v.get("sha256"):
                e["sha256"] = v["sha256"]
            md[k] = e
        out["metadata"] = md
    out["spec"] = doc["spec"]
    out["design"] = doc["plan"]
    out["tasks"] = doc["tasks"]
    if doc.get("review"):
        out["review"] = doc["review"]
    if doc.get("env"):
        out["env"] = doc["env"]
    out["format"] = doc["format"]
    out["revision"] = doc.get("revision", 1)
    return {k: out[k] for k in CANONICAL_ORDER if k in out}


def save(doc: dict, path) -> None:
    """Derive the stage, stamp date.updated, write in canonical order.

    Atomic write with the same crash discipline as the spine: temp file in
    the same directory, then os.replace. The internal model keeps its
    historical field names; the FILE carries the contract (D-1, D-5).
    """
    doc["deliverable"] = derive_deliverable(doc)
    doc["updated"] = _now()
    emitted = _emit(doc)
    with _LAYOUT_LOCK:
        tmp = path.with_name(path.name + ".tmp")
        try:
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(emitted, f, indent=2, sort_keys=False, ensure_ascii=False)
                f.write("\n")
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, path)
        finally:
            if tmp.exists():
                tmp.unlink()


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _digest(obj: object) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def _vschema() -> dict:
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


def spec_path(directory: str | Path) -> Path:
    """The spec json: <dirname>.json by convention, specpack.json second,
    and never a silent guess when several json files compete."""
    d = Path(directory)
    for name in (d.resolve().name + ".json", "specpack.json"):
        preferred = d / name
        if preferred.exists():
            return preferred
    found = sorted(d.glob("*.json"))
    if len(found) == 1:
        return found[0]
    if not found:
        raise LoomError(f"{d}: no spec json found (looked for {d.resolve().name}.json)")
    names = ", ".join(f.name for f in found)
    raise LoomError(f"{d}: several json files and none is {d.resolve().name}.json or specpack.json ({names}); name the spec explicitly")


def load_specpack(directory: str | Path) -> tuple[dict, Path]:
    directory = Path(directory)
    if (directory / "sdd.json").exists():
        raise LoomError(f"{directory}: sdd.json present — legacy spine takes precedence; specpack support is for specpack initiatives")
    path = spec_path(directory)
    with open(path, encoding="utf-8") as f:
        try:
            doc = json.load(f)
        except json.JSONDecodeError as e:
            raise LoomError(f"{path}: invalid JSON: {e}") from e
    _normalize(doc)
    for section in ("spec", "plan", "tasks"):
        if section not in doc or not isinstance(doc[section], dict if section != "tasks" else list):
            raise LoomError(f"{path}: not a spec: {section} missing or malformed")
    if "requirements" not in doc["spec"]:
        raise LoomError(f"{path}: not a spec: spec.requirements missing")
    if doc.get("format", "") not in KNOWN_FORMATS:
        raise LoomError(
            f"{path}: unsupported format {doc.get('format')!r} "
            f"(this loom speaks: {', '.join(KNOWN_FORMATS)})"
        )
    if "status" not in doc:
        doc["status"] = PACK_ACTIVE  # explicit from the first machine touch (FR-1)
    if "deliverable" in doc and doc["deliverable"] != derive_deliverable(doc):
        raise LoomError(
            f"{path}: deliverable stage mismatch — stored {doc['deliverable']!r}, "
            f"derived {derive_deliverable(doc)!r}; the field is machine-derived, "
            "never hand-set (D-5)"
        )
    validate(doc, path)
    return doc, path


def validate(doc: dict, path: Path | None = None) -> list[str]:
    where = f"{path}: " if path else ""
    v = Draft202012Validator(_vschema())
    errs = [f"{where}{list(e.path)}: {e.message}" for e in sorted(v.iter_errors(doc), key=lambda e: list(e.path))]
    return errs


def _families(doc: dict) -> dict[str, set[str]]:
    if not isinstance(doc, dict) or "spec" not in doc or "plan" not in doc or "tasks" not in doc:
        raise LoomError("not a spec: missing spec, plan, or tasks sections")
    fams: dict[str, set[str]] = {}
    for key, fam in (("stories", "US"), ("requirements", "FR"), ("constraints", "CON"), ("clarifications", "Q")):
        fams[fam] = {x["id"] for x in doc["spec"].get(key, [])}
    fams["AC"] = {s["id"] for r in doc["spec"]["requirements"] for s in r.get("scenarios", [])}
    fams["AC"] |= {a["id"] for st in doc["spec"].get("stories", []) for a in st.get("acceptance", [])}
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
    raw.extend(a["id"] for st in doc["spec"].get("stories", []) for a in st.get("acceptance", []))
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
    # A7 accepted decisions need a human in their history
    for d in doc["plan"].get("decisions", []):
        if d.get("status") == "accepted" and not str(d.get("accepted_by", "")).startswith("human:"):
            errs.append(f"A7 {d['id']} accepted without human acceptance (accepted_by missing or not human:)")
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
    served = set()
    for r in doc["spec"]["requirements"]:
        served.update(r.get("serves") or [])
    story_ids = {s_["id"] for s_ in doc["spec"].get("stories", [])}
    story_acs = {a["id"] for st in doc["spec"].get("stories", []) for a in st.get("acceptance", [])}
    coverage["AC"] = {
        a: who for a, who in coverage["AC"].items() if a not in story_acs
    }
    coverage["US"] = {
        a["id"]: sorted(t["id"] for t in doc["tasks"] if a["id"] in t.get("accepts", []))
        for st in doc["spec"].get("stories", [])
        for a in st.get("acceptance", [])
    }
    coverage["story_drift"] = {
        "requirements_without_stories": sorted(
            r["id"] for r in doc["spec"]["requirements"] if not (r.get("serves") or [])
        ),
        "stories_unserved": sorted(story_ids - served),
    }
    active = [t for t in doc["tasks"] if t.get("status") in ("todo", "doing")]
    coverage["context"] = {
        "missing_detail": sorted(t["id"] for t in active if not t.get("detail")),
        "missing_touch": sorted(t["id"] for t in active if not (t.get("context") or {}).get("touch")),
        "long_notes": sorted(
            t["id"]
            for t in active
            if any(len(n) > 280 for n in (t.get("context") or {}).get("notes") or [])
        ),
        "env_absent": not doc.get("env"),
        "open_questions": (
            sorted(q["id"] for q in doc["spec"].get("clarifications", []) if q.get("status") == "open")
            if active
            else []
        ),
    }
    return errs, coverage


def closure_gaps(doc: dict) -> dict:
    """What stands between this pack and its final state (DES-7)."""
    pending = sorted(d["id"] for d in doc["plan"].get("decisions", []) if d.get("status") == "proposed")
    openq = sorted(q["id"] for q in doc["spec"].get("clarifications", []) if q.get("status") == "open")
    review_pass = any(
        v.get("verdict") == "PASS" and v.get("on") == "PACK"
        for v in (doc.get("review") or {}).get("verdicts") or []
    )
    return {"pending_decisions": pending, "open_questions": openq, "review_pass": review_pass}


def answer_question(doc: dict, question_id: str, by: str, *, text: str | None = None, unknown: bool = False, at: str | None = None) -> dict:
    """Land a question's answer (FR-3): the admission path questions never
    had. A human claim is required; the honest unknown keeps blocking."""
    _assert_mutable(doc)
    if not str(by).startswith("human:"):
        raise LoomError("an answer needs a human claim: pass --by human:<owner> (A7 shape check)")
    q = next((c for c in doc["spec"].get("clarifications", []) if c["id"] == question_id), None)
    if q is None:
        raise LoomError(f"{question_id}: no such question")
    if q.get("status") == "resolved":
        raise LoomError(f"{question_id}: already resolved ({q.get('resolved_by') or q.get('answer', 'answered')})")
    stamp = at or _now()
    if unknown:
        q["answer"] = "(unknown)"
        q["unknown"] = True
        # status stays open: the honest unknown still gates closure
    else:
        if not (text or "").strip():
            raise LoomError("answer text is empty: pass --text or --unknown")
        q["answer"] = text.strip()
        q["status"] = "resolved"
    q["answered_by"] = by
    q["answered_at"] = stamp
    return q


def _decision(doc: dict, decision_id: str) -> dict:
    for d in doc["plan"].get("decisions", []):
        if d["id"] == decision_id:
            return d
    raise LoomError(f"{decision_id}: no such decision")


def _assert_mutable(doc: dict) -> None:
    if doc.get("status") == PACK_COMPLETE:
        raise LoomError("pack is complete: the record is frozen; open a new initiative instead")


def accept_decision(doc: dict, decision_id: str, by: str) -> dict:
    """Record owner acceptance of a decision (FR-8). Resolves its questions."""
    _assert_mutable(doc)
    if not str(by).startswith("human:"):
        raise LoomError("acceptance needs a human claim: pass --by human:<owner> (A7 shape check)")
    d = _decision(doc, decision_id)
    if d.get("status") == "accepted":
        raise LoomError(f"{decision_id}: already accepted by {d.get('accepted_by')}")
    if d.get("status") == "rejected":
        raise LoomError(f"{decision_id}: rejected; a rejected decision is history")
    d["status"] = "accepted"
    d["accepted_by"] = by
    resolved = []
    for q in doc["spec"].get("clarifications", []):
        resolves_it = q.get("resolved_by") == decision_id or q["id"] in d.get("resolves", [])
        if resolves_it and q.get("status") == "open":
            q["status"] = "resolved"
            q["answer"] = f"Accepted as {decision_id} by {by}"
            resolved.append(q["id"])
    doc["revision"] = doc.get("revision", 1) + 1
    return {"decision": decision_id, "status": "accepted", "accepted_by": by, "resolved_questions": sorted(resolved)}


def reject_decision(doc: dict, decision_id: str, by: str, because: str) -> dict:
    """Record owner rejection of a decision (FR-8). Questions stay open."""
    _assert_mutable(doc)
    if not str(by).startswith("human:"):
        raise LoomError("rejection needs a human claim: pass --by human:<owner>")
    d = _decision(doc, decision_id)
    if d.get("status") != "proposed":
        raise LoomError(f"{decision_id}: already {d.get('status')}")
    d["status"] = "rejected"
    d["rejected_because"] = because
    doc["revision"] = doc.get("revision", 1) + 1
    return {"decision": decision_id, "status": "rejected", "rejected_because": because}


def close(doc: dict, by: str, at: str | None = None) -> dict:
    """Transition the pack to its final state (FR-9). Refuses naming every gap.

    Preconditions: every task done with evidence, no proposed decision, no
    open question, and a PASS verdict on PACK in review.verdicts.
    """
    _assert_mutable(doc)
    if not str(by).startswith("human:"):
        raise LoomError("closing needs a human claim: pass --by human:<owner>")
    problems = []
    undone = sorted(t["id"] for t in doc["tasks"] if t["status"] != "done")
    if undone:
        problems.append(f"tasks not done: {', '.join(undone)}")
    unevidenced = sorted(t["id"] for t in doc["tasks"] if t["status"] == "done" and not t.get("evidence"))
    if unevidenced:
        problems.append(f"done without evidence: {', '.join(unevidenced)}")
    gaps = closure_gaps(doc)
    if gaps["pending_decisions"]:
        problems.append(f"decisions proposed: {', '.join(gaps['pending_decisions'])}")
    if gaps["open_questions"]:
        problems.append(f"questions open: {', '.join(gaps['open_questions'])}")
    if not gaps["review_pass"]:
        problems.append("no PASS verdict on PACK (review.verdicts)")
    if problems:
        raise LoomError("cannot close: " + "; ".join(problems))
    doc["status"] = PACK_COMPLETE
    doc["closed_by"] = by
    if at:
        doc["closed_at"] = at
    doc["revision"] = doc.get("revision", 1) + 1
    return {"name": doc["name"], "status": PACK_COMPLETE, "closed_by": by, "revision": doc["revision"]}


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


def _git_root(start: Path) -> Path:
    """The repository root containing the pack; the pack parent when outside git."""
    for p in (start, *start.parents):
        if (p / ".git").exists():
            return p
    return start.parent if start.is_file() else start


def _resolve_path(root: Path, rel: str) -> Path | None:
    """Join a context path onto its root; None when the path escapes the root."""
    q = Path(rel)
    if q.is_absolute() or ".." in q.parts:
        return None
    return root / q


def _pin_or_verify(doc: dict, task_id: str, pack_path: Path) -> list[dict]:
    """Pin-or-verify touch digests (DES-3). Mutates doc only when pinning.

    Rules: a file with no pinned digest gets pinned at first sighting; a file
    pinned then changed or missing is drift; a file absent at first sighting
    stays unpinned until it exists (resume-safe: the task's own creation is
    not drift). Returns the drift list; empty means the handout may proceed.
    """
    t = _task(doc, task_id)
    touch = (t.get("context") or {}).get("touch") or []
    if not touch:
        return []
    root = _git_root(pack_path)
    drift = []
    for e in touch:
        f = _resolve_path(root, e["path"])
        if f is None:
            drift.append({"path": e["path"], "why": "invalid-path"})
            continue
        pinned = e.get("sha256")
        if not f.is_file():
            if pinned:
                drift.append({"path": e["path"], "why": "missing", "pinned": pinned})
            continue
        current = hashlib.sha256(f.read_bytes()).hexdigest()
        if not pinned:
            e["sha256"] = current
        elif pinned != current:
            drift.append({"path": e["path"], "why": "changed", "pinned": pinned, "current": current})
    return drift


def _verify_refs(doc: dict, task_id: str, pack_path: Path) -> list[dict]:
    """Verify artifact and link digests at handout (DES-4).

    Artifacts verify against the pack file's directory (0.2 rule). Links with
    a digest verify only when they are local paths; a remote URL cannot be
    verified by the machine and passes through (reported by coverage, T-6).
    """
    drift = []
    for key, a in sorted((doc.get("artifacts") or {}).items()):
        pin = a.get("sha256")
        if not pin:
            continue
        f = pack_path.parent / a["file"]
        if not f.is_file():
            continue  # incomplete pack, not drift: FR-4 refuses on mismatch only
        cur = hashlib.sha256(f.read_bytes()).hexdigest()
        if cur != pin:
            drift.append({"path": a["file"], "why": "artifact-digest", "pinned": pin, "current": cur})
    t = _task(doc, task_id)
    for e in (t.get("context") or {}).get("links") or []:
        pin = e.get("sha256")
        if not pin or "://" in e["url"]:
            continue
        f = _resolve_path(_git_root(pack_path), e["url"])
        if f is None:
            drift.append({"path": e["url"], "why": "invalid-path"})
            continue
        if not f.is_file():
            continue  # missing reference is not a mismatch; coverage reports it (T-6)
        cur = hashlib.sha256(f.read_bytes()).hexdigest()
        if cur != pin:
            drift.append({"path": e["url"], "why": "link-digest", "pinned": pin, "current": cur})
    return drift


def rebase(doc: dict, task_id: str, pack_path: Path, approved_by: str) -> dict:
    """Re-pin touch, local-link, and artifact digests to current truth (D-7).

    The re-pin is a proposal the owner approved at the drift: approved_by must
    claim a human (A7-style shape check; git and review carry the truth).
    Git history of the pack is the provenance record. Remote URLs are never
    fetched; their digests are left untouched.
    """
    _assert_mutable(doc)
    if not str(approved_by).startswith("human:"):
        raise LoomError(
            "rebase needs owner approval: pass --approved-by human:<owner> "
            "(the agent shows the drift and the remedies; the owner approves)"
        )
    root = _git_root(pack_path)
    repinned, dropped = [], []

    def _repin(entry: dict, base: Path) -> None:
        f = _resolve_path(base, entry["path"] if "path" in entry else entry["file"])
        if f is not None and f.is_file():
            entry["sha256"] = hashlib.sha256(f.read_bytes()).hexdigest()
            repinned.append(f"{entry.get('path') or entry['file']}")
        elif "sha256" in entry:
            entry.pop("sha256")
            dropped.append(f"{entry.get('path') or entry['file']}")

    t = _task(doc, task_id)
    for e in (t.get("context") or {}).get("touch") or []:
        _repin(e, root)
    for e in (t.get("context") or {}).get("links") or []:
        if "sha256" in e and "://" not in e["url"]:
            _repin({**e, "path": e["url"]}, root)
    for a in (doc.get("artifacts") or {}).values():
        if "sha256" in a:
            _repin(a, pack_path.parent)
    doc["revision"] = doc.get("revision", 1) + 1
    return {"task": task_id, "repinned": sorted(repinned), "dropped": sorted(dropped)}


def next_task(doc: dict, pack_path: Path | None = None) -> dict:
    """Resume doing-without-evidence, then ready todo; id order. Deterministic.

    With pack_path, touch digests are pinned at first handout and verified at
    every handout; drift refuses the handout (status needs_rebase, no state
    change, no revision bump). A complete pack reports COMPLETE: frozen.
    """
    if doc.get("status") == PACK_COMPLETE:
        return {"status": "COMPLETE", "closed_by": doc.get("closed_by")}
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
            gaps = closure_gaps(doc)
            if gaps["pending_decisions"] or gaps["open_questions"]:
                return {"status": "needs_closure", "revision": doc.get("revision", 1), **gaps}
            return {"status": "DONE"}
        return {"status": "WAITING", "reason": "no ready task"}
    if pack_path is not None:
        drift = _pin_or_verify(doc, pick["id"], pack_path) + _verify_refs(doc, pick["id"], pack_path)
        if drift:
            return {
                "status": "needs_rebase",
                "task": pick["id"],
                "revision": doc.get("revision", 1),
                "drift": sorted(drift, key=lambda d: (d["path"], d["why"])),
            }
    pick["status"] = "doing"
    doc["revision"] = doc.get("revision", 1) + 1
    sl = slice_for(doc, pick["id"])
    return {"status": "task", "task": pick["id"], **sl}


def _task_body(t: dict) -> dict:
    """The fields a fresh session needs from a task, full bodies not one-liners."""
    fields = (
        "id", "title", "detail", "phase", "needs", "produces", "verify",
        "status", "evidence", "assignee", "parallel", "context",
    )
    return {k: t[k] for k in fields if k in t}


def _node_body(doc: dict, id_: str, via: dict) -> dict | None:
    """Full body for a non-task node, family-tagged; via marks design-served targets."""
    spec, plan = doc["spec"], doc["plan"]
    for s in spec.get("stories", []):
        if s["id"] == id_:
            return {"family": "US", **s}
        for a in s.get("acceptance", []):
            if a["id"] == id_:
                return {"family": "AC", **a}
    for r in spec["requirements"]:
        if r["id"] == id_:
            extra = {"via": via[id_]} if id_ in via else {}
            return {"family": "FR", **extra, **r}
        for s in r.get("scenarios", []):
            if s["id"] == id_:
                return {"family": "AC", **s}
    for c in spec.get("constraints", []):
        if c["id"] == id_:
            extra = {"via": via[id_]} if id_ in via else {}
            return {"family": "CON", **extra, **c}
    for q in spec.get("clarifications", []):
        if q["id"] == id_:
            return {"family": "Q", **q}
    for d in plan.get("decisions", []):
        if d["id"] == id_:
            return {"family": "D", **d}
    for d in plan.get("designs", []):
        if d["id"] == id_:
            return {"family": "DES", **d}
    return None


def slice_for(doc: dict, task_id: str) -> dict:
    """The frozen handout: full node bodies, not flattened one-liners.

    Closure: the task, its flow and trace links, and the same from prerequisite
    tasks. Designs in the closure expand one hop through `addresses` (targets
    gain a `via` marker naming the smallest design id serving them). Every
    accepted decision rides along. A plan prelude (approach, stack, env) leads.
    """
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
    via = {}
    for d in sorted(doc["plan"].get("designs", []), key=lambda d: d["id"]):
        if d["id"] not in keep:
            continue
        for a in d.get("addresses", []):
            keep.add(a)
            via.setdefault(a, d["id"])
    for r in doc["spec"]["requirements"]:
        if r["id"] in keep:
            for us in r.get("serves", []):
                keep.add(us)  # the worker sees the story being served (intent altitude)
    for d in doc["plan"].get("decisions", []):
        if d.get("status") == "accepted":
            keep.add(d["id"])
    items = []
    for k in sorted(keep):
        tt = next((x for x in doc["tasks"] if x["id"] == k), None)
        if tt:
            items.append({"family": "TASK", **_task_body(tt)})
            continue
        b = _node_body(doc, k, via)
        items.append(b if b is not None else {"id": k, "family": "REF"})
    prelude = {}
    for key in ("approach", "stack"):
        if doc["plan"].get(key):
            prelude[key] = doc["plan"][key]
    if doc.get("env"):
        prelude["env"] = doc["env"]
    omitted = sorted(x["id"] for x in doc["tasks"] if x["id"] not in keep)
    body = {"task": task_id, "items": items, "omitted_tasks": omitted, "prelude": prelude}
    return {"items": items, "omitted_tasks": omitted, "prelude": prelude, "slice_digest": _digest(body)}


def record(doc: dict, task_id: str, result: str, commands: list[dict], expected_revision: int, by: str, notes: str | None = None) -> dict:
    _assert_mutable(doc)
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
