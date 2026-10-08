"""loom — the loop engine of the SDD harness.

okf knows; loom does. The spine (sdd.json) is the machine authority:
nodes, relations, task states, attempts, evidence. Only the machine
moves states; the model works inside it.
"""

__version__ = "0.1.0"
SCHEMA_VERSION = "0.1.0"
PROFILES = ("generic", "pi", "claude", "codex")
NODE_KINDS = (
    "SOURCE", "GOAL", "METRIC", "REQUIREMENT", "ACCEPTANCE", "CONSTRAINT",
    "QUESTION", "ASSUMPTION", "DECISION", "DESIGN", "TASK", "VERIFICATION",
    "EXTENSION",
)
RELATION_KINDS = (
    "derived_from", "addresses", "implements", "requires", "checks",
    "resolves", "supersedes", "conflicts_with", "extension",
)
EPISTEMIC = ("DECLARED", "OBSERVED", "INFERRED", "UNKNOWN", "CONFLICTING")
EPISTEMIC_RELATION = ("DECLARED", "OBSERVED", "INFERRED", "CONFLICTING")
TASK_STATES = (
    "PENDING", "READY", "RUNNING", "VERIFYING", "SUCCEEDED", "FAILED",
    "BLOCKED", "CANCELLED",
)
TERMINAL = ("SUCCEEDED", "CANCELLED")
