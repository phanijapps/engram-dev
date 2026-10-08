# Review — red-foreman #1 (maiden voyage)

- **Reviewer:** red-foreman (fresh-context subagent, `.pi/agents/red-foreman.md`)
- **Scope:** the L0 validator/schema claim in the L0 task description + committed diff 4f6ccc5
- **Verdict:** FIX BEFORE COMMIT → **all findings fixed** (see ledger)

## Findings → fix ledger

| # | Sev | Finding (evidence) | Fix | Commit |
|---|---|---|---|---|
| 1 | BLOCKER | MiniValidator silently no-ops on `additionalProperties` as schema; `{"artifacts": {"spec": {}}}` validated clean (proven by execution) | fail-closed validator: unsupported keywords now ERROR; `additionalProperties` implemented in both forms; `re.match`→`re.search` for patternProperties | this commit |
| 2 | DEFECT | wheel ships without the schema → installed loom can't load any spine | schema moved into the package: `src/loom_kit/schemas/`; path test added | this commit |
| 3 | DEFECT | `save()` truncates the machine authority before writing (non-atomic) | temp file + fsync + `os.replace`, tmp unlinked on failure; crash test added | this commit |
| 4 | SMELL | zero negative validator tests | 9-case table-driven negative test asserting exact errors | this commit |
| 5 | SMELL | `assert` as the unsupported-$ref guard (vanishes under -O) | replaced with explicit `raise ValueError`; subsumed by fail-closed guard | this commit |
| 6 | SMELL | `patternProperties` matched with unanchored-semantics mismatch (`re.match` vs JSON Schema search) | `re.search` | this commit |

Residual (accepted, pathed): the `Timestamp` pattern `Z$` accepts
`bananaZ` — dies with MiniValidator at the Phase-4 gate, where real
python-jsonschema + format checking takes over
(`schema-brainstorm.md`, R6).
