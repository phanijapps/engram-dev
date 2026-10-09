"""spec-library T-7 (review S-10): behavior tests — the page's functions
run under node with stubbed DOM globals. String presence proved nothing
(the T-4 precedent); these execute the real code."""

from __future__ import annotations

import json
from pathlib import Path
import shutil
import subprocess
import tempfile

import pytest

JS = (Path(__file__).resolve().parents[1] / "src" / "loom_kit" / "web" / "library.js").read_text()

HARNESS = r"""
const els = {};
const stubEl = (id) => (els[id] = els[id] || {
  id, innerHTML: "", textContent: "", value: "", style: {}, dataset: {},
  classList: { add() {}, remove() {} }, addEventListener() {}, appendChild() {},
  querySelectorAll: () => [], scrollIntoView() {}, focus() {}, onclick: null,
});
global.window = { addEventListener() {} };
global.location = { hash: "" };
let lastAppended = null;
global.document = {
  getElementById: (id) => els[id] || null,  /* reality: unknown ids are null */
  createElement: () => stubEl("created-" + Math.random()),
  addEventListener() {},
  body: { appendChild: (c) => (lastAppended = c) },
  querySelectorAll: () => [],
};
global.requestAnimationFrame = (f) => f();
for (const id of ["search", "pane", "detail", "counts", "foot"]) stubEl(id);  /* the boot's real elements */
global.fetch = async () => ({ ok: false, status: 404, json: async () => ({ specs: [], legacy: [] }), text: async () => "" });
global.marked = { parse: (x) => x };
const vm = require("vm");
vm.runInContext(%s, vm.createContext(global), { filename: "library.js" });

const out = [];
const check = (name, cond) => out.push((cond ? "PASS " : "FAIL ") + name);

/* markdown IDs wrapped in text nodes, never in tags/attrs */
const html = idlHtml('<p>see FR-1 and D-3 now</p><a href="FR-1">x</a>');
check("idlHtml wraps text IDs", html.includes('data-jump="FR-1"') && html.includes('data-jump="D-3"'));
check("idlHtml spares attributes", !html.includes('href="<span'));

/* cross-tab jump routes; same-tab miss toasts */
S.sel = "p"; S.tab = "spec"; S.spec = { spec: {} };
jump("T-9");
check("cross-tab jump routes to tasks", location.hash === "#/p/tasks");
S.tab = "tasks"; jump("T-9", true);
check("same-tab miss toasts", (lastAppended || {}).textContent.includes("not in this spec"));
S.tab = "spec"; jump("Q-1", true);
check("spec family stays on spec tab", location.hash === "#/p/tasks");

/* the flags sit at the furthest reached node, never node zero */
check("blocked with done work sits at in_progress", posFor("blocked", { tasks: [{ status: "done" }] }) === 2);
check("awaiting_owner with questions sits at shaping", posFor("awaiting_owner", { tasks: [], spec: { clarifications: [{}] } }) === 1);
check("newborn emptiness sits at zero", posFor("drafted", {}) === 0 && posFor("awaiting_owner", {}) === 0);

/* grouping and words */
check("you group", groupOf({ stage: "planning", open_questions: 2 }) === "you" && groupOf({ stage: "awaiting_owner", open_questions: 0 }) === "you");
check("done group", groupOf({ stage: "delivered", open_questions: 0 }) === "done");
check("moving group", groupOf({ stage: "in_review", open_questions: 0 }) === "moving");
for (const st of ["awaiting_owner", "planning", "in_progress", "blocked", "in_review", "delivered", "drafted"])
  check("stageWord " + st, stageWord(st) === st ? false : true);

/* picked clears when the selection changes */
picked = { "Q-1": "old" }; S.sel = "a"; S.specs = [];
location.hash = "#/b/spec"; route();
check("picked resets across specs", JSON.stringify(picked) === "{}");
console.log(out.join("\n"));
"""


def test_page_behavior():
    node = shutil.which("node")
    if not node:
        pytest.skip("node unavailable — behavior tests need it")
    with tempfile.TemporaryDirectory() as td:
        h = Path(td) / "harness.js"
        h.write_text("const SRC = " + json.dumps(JS) + ";\n" + HARNESS % "SRC")
        r = subprocess.run([node, str(h)], capture_output=True, text=True, timeout=30)
        lines = [l for l in r.stdout.splitlines() if l.startswith(("PASS", "FAIL"))]
        fails = [l for l in lines if l.startswith("FAIL")]
        assert r.returncode == 0, r.stderr
        assert len(lines) >= 15 and not fails, "\n".join(fails or lines)
