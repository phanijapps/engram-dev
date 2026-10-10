# recall — where does work dangle?

Run this at the start of a session, or whenever the user says
"continue" and you are not sure which work they mean:

    <harness CLI> do where <workspace>

The command lists every open spec (stage, open questions, next ready
task, revision, last evidence) across live specs roots and git
worktrees. The archive is never listed; delivered work is not work in
flight.

## The rule this surface cannot enforce

On pi and Claude Code, a hard gate intercepts continue-shaped first
messages when more than one spec is open and asks which one. Codex has
no such hook — so the rule lives in YOU: if more than one spec is
open and the user says continue (or go on / resume / pick up), do not
choose. List the open specs and ask which one. Never guess.

One spec open → continue resolves to it. None open → say so.
