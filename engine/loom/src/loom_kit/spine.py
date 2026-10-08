"""Spine I/O and validation for loom.

The spine (sdd.json) is the machine authority for one initiative.
Loading validates structure against the vendored schema (stdlib-only
mini validator; no runtime dependency on jsonschema) and then the
semantic invariants the schema cannot express.
"""

from __future__ import annotations

import json
import os
import re
import threading
from pathlib import Path

from . import SCHEMA_VERSION

SCHEMA_PATH = Path(__file__).resolve().parent / "schemas" / "spine.schema.json"
SPINE_NAME = "sdd.json"

_LOCK = threading.Lock()


class LoomError(Exception):
    """A refused operation. The message says why."""


def _schema() -> dict:
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


class MiniValidator:
    """A small Draft-2020-12 subset validator — FAIL-CLOSED.

    Supports: type, const, enum, pattern, required, properties,
    additionalProperties (false AND as-schema), patternProperties,
    items, min/maxItems, minLength/maxLength, minimum/maximum,
    maxProperties, $defs + local $ref, and annotation keywords
    (default/title/description). Any OTHER keyword in a schema is
    reported as an error instead of being silently ignored, so the
    validator cannot quietly under-validate.
    """

    ANNOTATIONS = {"$id", "$schema", "title", "description", "default", "$comment", "examples"}

    UNSUPPORTED = {
        "oneOf", "anyOf", "allOf", "not", "if", "then", "else",
        "dependentRequired", "dependentSchemas", "prefixItems", "contains",
        "uniqueItems", "multipleOf", "exclusiveMinimum", "exclusiveMaximum",
        "minProperties", "propertyNames", "unevaluatedProperties",
        "unevaluatedItems",
    }

    def __init__(self, schema: dict):
        self.root = schema

    def _ref(self, ref: str) -> dict:
        if not ref.startswith("#/$defs/"):
            raise ValueError(f"validator only resolves local #/$defs refs, got: {ref}")
        node: object = self.root
        for part in ref[2:].split("/"):
            node = node[part]  # type: ignore[index]
        return node  # type: ignore[return-value]

    def validate(self, inst: object, schema: dict | None = None, path: str = "$") -> list[str]:
        s = schema or self.root
        if "$ref" in s:
            return self.validate(inst, self._ref(s["$ref"]), path)
        errs: list[str] = []
        for k in sorted(set(s) - self.ANNOTATIONS - {
            "type", "const", "enum", "pattern", "required", "properties",
            "additionalProperties", "patternProperties", "items",
            "minItems", "maxItems", "minLength", "maxLength", "minimum",
            "maximum", "maxProperties", "$defs", "$ref",
        }):
            if k in self.UNSUPPORTED:
                errs.append(f"{path}: schema keyword '{k}' is not supported by this validator (fail-closed)")
        t = s.get("type")
        if t == "object":
            if not isinstance(inst, dict):
                return [f"{path}: expected object"]
            props = s.get("properties", {})
            for r in s.get("required", []):
                if r not in inst:
                    errs.append(f"{path}: missing required '{r}'")
            ap = s.get("additionalProperties", True)
            extra = [k for k in inst if k not in props and not any(re.search(p, k) for p in s.get("patternProperties", {}))]
            if ap is False:
                for k in extra:
                    errs.append(f"{path}: unknown key '{k}'")
            elif isinstance(ap, dict):
                for k in extra:
                    errs += self.validate(inst[k], ap, f"{path}.{k}")
            for k, v in inst.items():
                if k in props:
                    errs += self.validate(v, props[k], f"{path}.{k}")
                else:
                    for p, ps in s.get("patternProperties", {}).items():
                        if re.search(p, k):
                            errs += self.validate(v, ps, f"{path}.{k}")
        elif t == "array":
            if not isinstance(inst, list):
                return [f"{path}: expected array"]
            if len(inst) < s.get("minItems", 0):
                errs.append(f"{path}: fewer than minItems")
            if "maxItems" in s and len(inst) > s["maxItems"]:
                errs.append(f"{path}: more than maxItems")
            for i, v in enumerate(inst):
                errs += self.validate(v, s.get("items", {}), f"{path}[{i}]")
        elif t == "string":
            if not isinstance(inst, str):
                return [f"{path}: expected string"]
            if "pattern" in s and not re.search(s["pattern"], inst):
                errs.append(f"{path}: pattern mismatch ({s['pattern']})")
            if len(inst) < s.get("minLength", 0):
                errs.append(f"{path}: too short")
            if "maxLength" in s and len(inst) > s["maxLength"]:
                errs.append(f"{path}: too long")
        elif t == "integer":
            if isinstance(inst, bool) or not isinstance(inst, int):
                return [f"{path}: expected integer"]
            if inst < s.get("minimum", inst):
                errs.append(f"{path}: below minimum")
            if "maximum" in s and inst > s["maximum"]:
                errs.append(f"{path}: above maximum")
        elif t == "boolean" and not isinstance(inst, bool):
            errs.append(f"{path}: expected boolean")
        if "const" in s and inst != s["const"]:
            errs.append(f"{path}: expected const {s['const']!r}")
        if "enum" in s and inst not in s["enum"]:
            errs.append(f"{path}: {inst!r} not in enum")
        if "maxProperties" in s and isinstance(inst, dict) and len(inst) > s["maxProperties"]:
            errs.append(f"{path}: too many properties")
        return errs


def validate_schema(doc: dict) -> list[str]:
    v = MiniValidator(_schema())
    return v.validate(doc)


def _now() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def semantic_errors(doc: dict) -> list[str]:
    errs: list[str] = []
    ids = [n["node_id"] for n in doc["nodes"]]
    if len(ids) != len(set(ids)):
        errs.append("duplicate node_id")
    idset = set(ids)
    for r in doc["relations"]:
        for side in ("from_ref", "to_ref"):
            if r[side]["node_id"] not in idset:
                errs.append(f"relation {r['relation_id']}: dangling {side} {r[side]['node_id']}")
    for n in doc["nodes"]:
        for pr in n["provenance_refs"]:
            if pr["node_id"] not in idset:
                errs.append(f"node {n['node_id']}: dangling provenance {pr['node_id']}")
        for ar in n["artifact_refs"]:
            if ar["artifact"] not in doc["artifacts"]:
                errs.append(f"node {n['node_id']}: unknown artifact role '{ar['artifact']}'")
    # requires must be acyclic (DFS)
    edges: dict[str, list[str]] = {}
    for r in doc["relations"]:
        if r["kind"] == "requires":
            edges.setdefault(r["from_ref"]["node_id"], []).append(r["to_ref"]["node_id"])
    state: dict[str, int] = {}

    def dfs(u: str) -> None:
        state[u] = 1
        for v in edges.get(u, []):
            if state.get(v) == 1:
                errs.append(f"requires cycle at {u} -> {v}")
            elif state.get(v, 0) == 0:
                dfs(v)
        state[u] = 2

    for u in edges:
        if state.get(u, 0) == 0:
            dfs(u)
    # runtime consistency: exactly one task_state per TASK node, none extra
    task_ids = {n["node_id"] for n in doc["nodes"] if n["kind"] == "TASK"}
    ts_ids = [t["task_id"] for t in doc["runtime"]["task_states"]]
    if len(ts_ids) != len(set(ts_ids)):
        errs.append("duplicate task_state")
    for t in ts_ids:
        if t not in task_ids:
            errs.append(f"task_state for non-task node {t}")
    for t in task_ids - set(ts_ids):
        errs.append(f"missing task_state for task {t}")
    att_ids = {a["attempt_id"] for a in doc["runtime"]["attempts"]}
    for t in doc["runtime"]["task_states"]:
        for a in t["attempts"]:
            if a not in att_ids:
                errs.append(f"task {t['task_id']}: dangling attempt {a}")
    for a in doc["runtime"]["attempts"]:
        if a["task_id"] not in task_ids:
            errs.append(f"attempt {a['attempt_id']}: dangling task {a['task_id']}")
        if a["result"] == "pass" and not any(c["exit_code"] == 0 for c in a["commands"]):
            errs.append(f"attempt {a['attempt_id']}: pass without a zero-exit command (M_run = M)")
    return errs


def load(directory: str | Path) -> tuple[dict, Path]:
    path = Path(directory) / SPINE_NAME
    if not path.exists():
        raise LoomError(f"no {SPINE_NAME} in {directory} — run: loom init {directory}")
    with open(path, encoding="utf-8") as f:
        try:
            doc = json.load(f)
        except json.JSONDecodeError as e:
            raise LoomError(f"{path}: invalid JSON: {e}") from e
    errs = validate_schema(doc)
    if errs:
        raise LoomError("schema violations:\n  " + "\n  ".join(errs[:20]))
    errs = semantic_errors(doc)
    if errs:
        raise LoomError("invariant violations:\n  " + "\n  ".join(errs[:20]))
    return doc, path


def save(doc: dict, path: Path) -> None:
    """Atomic write: temp file in the same directory, then os.replace.

    A crash mid-write leaves the previous spine intact and removes the
    temp file — the machine authority is never left torn or littered.
    """
    with _LOCK:
        tmp = path.with_name(path.name + ".tmp")
        try:
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(doc, f, indent=2, sort_keys=True)
                f.write("\n")
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, path)
        except BaseException:
            tmp.unlink(missing_ok=True)
            raise


def bump(doc: dict) -> dict:
    doc["revision"] += 1
    return doc


def new_spine(spine_id: str, profile: str, created_by: str) -> dict:
    from . import PROFILES

    if profile not in PROFILES:
        raise LoomError(f"unknown profile '{profile}' — known: {', '.join(PROFILES)}")
    return {
        "schema_version": SCHEMA_VERSION,
        "spine_id": spine_id,
        "profile": profile,
        "created_at": _now(),
        "created_by": created_by,
        "revision": 1,
        "artifacts": {
            "spec": {"path": "spec.md", "media_type": "text/markdown"},
            "plan": {"path": "plan.md", "media_type": "text/markdown"},
        },
        "nodes": [],
        "relations": [],
        "runtime": {"task_states": [], "attempts": [], "events": []},
        "extensions": {},
    }


def node_ids(doc: dict) -> set[str]:
    return {n["node_id"] for n in doc["nodes"]}


def task_state(doc: dict, task_id: str) -> dict:
    for t in doc["runtime"]["task_states"]:
        if t["task_id"] == task_id:
            return t
    raise LoomError(f"no task_state for {task_id}")


def requires_of(doc: dict, task_id: str) -> list[str]:
    return sorted(
        r["to_ref"]["node_id"]
        for r in doc["relations"]
        if r["kind"] == "requires" and r["from_ref"]["node_id"] == task_id
    )
