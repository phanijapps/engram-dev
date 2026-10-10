# harness hooks

Hooks are plain Node JavaScript files. One file, one concern. No
dependencies, no build step. They run with the user's node.

The contract (harness/0.1):

- A hook reads its input from argv (a single JSON string) and prints
  its decision to stdout as JSON. Exit 0 = pass; exit 3 = refuse
  (the surface receives the refusal); any other exit = error.
- A hook never writes outside a path it was given. A hook never
  guesses: missing input is an error, not a pass.
- Wiring is per surface and lives in `harness.json`: pi loads the
  file as an extension, Claude Code invokes it through a settings
  matcher, Codex invokes it through config notify, Copilot has no
  hook mechanism (null — printed honestly in every plan).

The first payload lands with the surface adapters (T-3).
