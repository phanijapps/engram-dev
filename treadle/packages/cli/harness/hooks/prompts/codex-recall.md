# Project context

When this host supports trusted lifecycle hooks, they reconnect this workspace and supply current context at startup/resume and before a prompt. Enable the integration, review the current hook definition and reload the host.

If hooks are unavailable or untrusted, run the installed harness CLI:

    <harness CLI> project connect <workspace>
    <harness CLI> context --workspace <workspace>

Native plugins are unavailable in the current IDE extension. Project hook configuration depends on the host version; use the commands above when it does not run. Runtime, host activation and project enrollment are separate states.

If more than one spec is open, ask which to continue. Context candidates are not admitted tasks. Read the core gate and handout. New specs use `do init <packDir> --owner-gated`; owner answers, decisions, Start and Finish remain separate human actions.
