# Search OKF knowledge before SDLC work

The owner requests Copilot hooks, agents, and skills in this workspace's `.github` directory.
The owner also requests a new knowledge-search skill, SDLC integration, evaluation, and a pull request.

The existing Copilot installation completed through the authoritative manifest.
Its configuration is `.github/hooks/wukong.json`; its shared payloads remain in `.harness/hooks`.
The installed `red-forman` definition and 11 supported skills match their canonical sources.
Both installed command callbacks exited 0 in local execution.
Evidence: `artifacts/copilot-workspace-install/verification.json` and `install.log`.
This does not establish a real Copilot session or cloud-agent activation.

The new slice supplies `search-kb`: a read-only consumer of OKF knowledge.
It returns evidence, conflicts, and gaps for the current SDLC step.
It preserves the existing search engine, wiki, task authority, and owner gates.

Implementation and evaluation follow separate owner acceptance and Start actions for this exact plan.
A PR follows successful checks and independent review.
