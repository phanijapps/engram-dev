---
kind: brief
slug: browser-agent-feedback
title: Review artifacts and send feedback to coding agents
status: draft
created: 2026-10-11
repo_head: 98086783d996c563072e6f147045177c23d66310
wiki_freshness: fresh
source_state: dirty hook repairs preserved; pinned source bytes in authoring/source-pins.json
---

# Brief

Let an owner inspect plans, documentation and code diffs in Wukong, submit precise comments, and inspect the agent's next revision.
The first release lives in the existing local Wukong web app and supports Claude, Codex and Pi through a shared CLI protocol.

The agent opens a scoped review round and waits for submitted feedback. The owner comments on a file, line range, or whole round.
The agent receives the batch, checks its source revision and SDD authority, makes permitted changes, and replies.
The owner inspects a new snapshot and resolves the comments. Every round remains available.

The canonical specpack continues to own requirements, decisions, tasks, verification evidence and completion.
Feedback does not grant permission to implement, resolve a design decision, supply independent PACK review, or finish a spec.

Success means one witnessed loop for a document and a code diff through each named host, plus recovery, stale-source and cross-project checks.
A dormant host is not silently started or controlled by the browser. A waiting CLI command resumes when a batch arrives.
An idle host can read pending feedback on its next prompt or by explicit CLI invocation; this is not immediate wake-up.

Out of scope: browser chat, arbitrary tool execution, remote access, session/transcript/token capture, Crit installation, live-app review and hosted PR synchronization.
