"""Specpack 0.3 schema tests: context block, steps, env, format enum (T-1 / FR-1, AC-1)."""

from __future__ import annotations

import copy
import json
from pathlib import Path

from loom_kit import specpack

REPO = Path(__file__).resolve().parents[3]
EXAMPLE = REPO / "docs" / "specs" / "spec-graph" / "example-add-todo.specpack.json"
THIS_PACK = REPO / "docs" / "specs" / "specpack-context" / "specpack.json"

GOOD_SHA = "a" * 64


def _pack03() -> dict:
    """A minimal 0.3 pack exercising every new field once."""
    return {
        "format": "specpack/0.3",
        "name": "ctx-fixture",
        "title": "Context fixture",
        "spec": {
            "why": "Fixture: prove the 0.3 additions validate.",
            "requirements": [
                {"id": "FR-1", "text": "Fixture requirement.", "priority": "P1"}
            ],
            "constraints": [],
        },
        "plan": {
            "approach": "fixture",
            "decisions": [
                {
                    "id": "D-1",
                    "decision": "fixture decision",
                    "because": "fixture because",
                    "status": "proposed",
                }
            ],
        },
        "tasks": [
            {
                "id": "T-1",
                "title": "Fixture task",
                "detail": "Exercise every context field.",
                "satisfies": ["FR-1"],
                "verify": {
                    "cmd": "true",
                    "expect": "exit 0",
                    "steps": [
                        {"run": "true", "expect_exit": 0, "expect_contains": ""},
                        {"run": "echo ok"},
                    ],
                },
                "status": "todo",
                "context": {
                    "touch": [
                        {"path": "engine/loom/src/loom_kit/specpack.py", "sha256": GOOD_SHA, "why": "in scope"},
                        {"path": "engine/loom/src/loom_kit/cli.py"},
                    ],
                    "read": [
                        {"path": "engine/loom/pyproject.toml", "why": "toolchain facts"}
                    ],
                    "wiki": ["systems/loom-engine.md"],
                    "links": [
                        {"url": "https://example.org/pattern", "why": "the pattern DES follows"},
                        {"url": "docs/runbooks/deploy.md", "why": "deploy order", "sha256": GOOD_SHA, "retrieved_at": "2026-10-08T00:00:00Z"},
                    ],
                    "notes": ["Tribal knowledge lives here, plain text."],
                    "commands": [
                        {"cmd": "uv run pytest -q", "expect_exit": 0},
                        {"cmd": "uv run loom selftest"},
                    ],
                },
            }
        ],
        "env": {"build": "uv sync", "test": "uv run pytest -q", "lint": "", "toolchain": "Python 3.12"},
    }


def test_03_pack_with_full_context_validates():
    assert specpack.validate(_pack03()) == []


def test_02_example_pack_still_validates_under_dual_schema():
    doc = json.loads(EXAMPLE.read_text())
    assert doc["format"] == "specpack/0.2"
    assert specpack.validate(doc) == []


def test_this_initiative_pack_still_validates():
    """The spec riding on 0.2 must survive the 0.3 schema (CON-1)."""
    doc = json.loads(THIS_PACK.read_text())
    assert specpack.validate(doc) == []


def test_format_enum_rejects_unknown_version():
    doc = _pack03()
    doc["format"] = "specpack/0.4"
    errs = specpack.validate(doc)
    assert any("format" in e for e in errs), errs


def test_02_const_no_longer_enforced():
    """0.2 packs were const-locked; the enum must accept the old tag."""
    doc = _pack03()
    doc["format"] = "specpack/0.2"
    assert specpack.validate(doc) == []


def test_touch_digest_must_be_64_hex():
    doc = _pack03()
    doc["tasks"][0]["context"]["touch"][0]["sha256"] = "not-a-digest"
    errs = specpack.validate(doc)
    assert any("sha256" in e for e in errs), errs


def test_context_rejects_unknown_members():
    doc = _pack03()
    doc["tasks"][0]["context"]["monospace"] = True
    errs = specpack.validate(doc)
    assert any("monospace" in e for e in errs), errs


def test_optional_everywhere_02_shape_is_valid_03():
    """Additive only: strip every new field and the pack must still validate."""
    doc = _pack03()
    t = doc["tasks"][0]
    t.pop("context")
    t["verify"].pop("steps")
    doc.pop("env")
    assert specpack.validate(doc) == []


def test_deep_copy_independent():
    """Fixture isolation guard: mutating one pack must not leak into another."""
    a = _pack03()
    b = copy.deepcopy(a)
    b["tasks"][0]["context"]["notes"].append("extra")
    assert a["tasks"][0]["context"]["notes"] == ["Tribal knowledge lives here, plain text."]
