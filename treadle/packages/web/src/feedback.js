/* Browser presentation only. Authority and snapshot creation remain in core/CLI. */
(function () {
  const drafts = new Map();
  let mounted = null;
  const el = (tag, text, attrs = {}) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };
  const button = (text, action) => {
    const b = el('button', text, { type: 'button', class: 'btn' });
    b.onclick = action;
    return b;
  };
  function label(root, text, input) {
    const l = el('label', text);
    l.append(input);
    root.append(l);
    return input;
  }
  window.renderFeedback = function (host, slug, spec, api) {
    if (mounted) mounted.cancelled = true;
    const view = {
      cancelled: false,
      generation: 0,
      state: null,
      session: null,
      round: null,
      target: null,
      side: 'after',
      busy: false,
      page: 0,
      anchor: null,
      pending: null,
    };
    mounted = view;
    host.replaceChildren();
    const heading = el('h2', 'Feedback'),
      notice = el(
        'p',
        'Review comments guide revisions. Approval, Start and Finish remain separate owner actions.',
      );
    const status = el('p', 'Loading feedback…', {
      role: 'status',
      'aria-live': 'polite',
      id: 'feedback-status',
    });
    const error = el('p', '', { role: 'alert', tabindex: '-1', id: 'feedback-error' });
    error.hidden = true;
    const refresh = button('Refresh feedback', () => load());
    refresh.id = 'feedback-refresh';
    const content = el('div', undefined, { class: 'feedback-content' });
    const header = el('div', undefined, { class: 'feedback-header' });
    header.append(heading, refresh);
    host.append(header, notice, status, error, content);
    if (
      !window.LIBRARY_CONFIG?.base ||
      spec.format !== 'specpack/0.4' ||
      spec.workflow?.policy !== 'owner-gated/1'
    ) {
      status.textContent =
        'Feedback requires an owner-gated spec in the connected shared application. Ask your agent to open the shared project library. Legacy adoption is a separate owner action.';
      refresh.disabled = true;
      return;
    }
    const live = () => !view.cancelled && host.isConnected;
    const path = '/feedback/' + encodeURIComponent(slug) + '/';
    const draftKey = () =>
      window.LIBRARY_CONFIG.base +
      '/' +
      slug +
      '/' +
      view.session?.id +
      '/' +
      view.round?.id +
      '/' +
      view.target?.id +
      '/' +
      view.side;
    const draft = () => {
      const key = draftKey();
      if (!drafts.has(key)) {
        let saved = null;
        try {
          saved = JSON.parse(sessionStorage.getItem('feedback-draft:' + key));
        } catch {
          /* unavailable storage */
        }
        drafts.set(
          key,
          saved && typeof saved.body === 'string' ? saved : { body: '', anchor: null },
        );
      }
      return drafts.get(key);
    };
    const save = (body, anchor) => {
      const key = draftKey(),
        value = { body, anchor };
      drafts.set(key, value);
      try {
        sessionStorage.setItem('feedback-draft:' + key, JSON.stringify(value));
      } catch {
        /* retain in memory */
      }
    };
    async function request(kind, payload) {
      const response = await api(
        path + kind,
        payload
          ? {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          : {},
      );
      const value = await response.json();
      if (!response.ok)
        throw Object.assign(Error(value.error || 'Feedback is unavailable'), {
          code: value.code,
          status: response.status,
        });
      return value;
    }
    function showError(e) {
      if (!live()) return;
      error.hidden = false;
      error.textContent =
        (e.code === 'conflict'
          ? 'Feedback changed or is locked. Refresh before retrying. '
          : 'Feedback unavailable. Retry after recovery. ') +
        e.message +
        ' Your local draft is retained.';
      status.textContent = 'Action not completed. Your local draft is retained.';
      error.focus();
    }
    async function mutate(kind, fields) {
      if (view.busy || view.state.closed) return false;
      view.busy = true;
      content.setAttribute('aria-busy', 'true');
      const controls = [...host.querySelectorAll('button, input, textarea, select')];
      const previousDisabled = controls.map((node) => node.disabled);
      controls.forEach((node) => {
        node.disabled = true;
      });
      status.textContent =
        {
          comment: 'Saving draft…',
          submit: 'Submitting feedback…',
          resolve: 'Resolving thread…',
          reattach: 'Saving reattachment…',
        }[kind] || 'Saving…';
      const body = { session: view.session.id, by: 'human:owner', ...fields };
      const identity = JSON.stringify({ kind, body });
      const payload =
        view.pending?.identity === identity
          ? view.pending.payload
          : { ...body, expected_revision: view.state.revision, operation_id: crypto.randomUUID() };
      view.pending = { identity, payload };
      try {
        await request(kind, payload);
        view.pending = null;
        error.hidden = true;
        return true;
      } catch (e) {
        showError(e);
        return false;
      } finally {
        view.busy = false;
        content.removeAttribute('aria-busy');
        controls.forEach((node, index) => {
          node.disabled = previousDisabled[index];
        });
      }
    }
    async function load(message) {
      if (!live() || view.busy) return;
      const focus = document.activeElement?.id;
      host.setAttribute('aria-busy', 'true');
      try {
        const state = await request('state');
        if (!live()) return;
        view.state = state;
        if (view.pending) view.pending.payload.expected_revision = state.revision;
        const requested = new URLSearchParams(location.hash.split('?')[1] || '').get('session');
        const previous = view.session?.id;
        view.session =
          state.sessions.find((s) => s.id === (previous || requested)) || state.sessions.at(-1);
        if (requested && !state.sessions.some((s) => s.id === requested))
          throw Error('The requested session is unavailable');
        view.round =
          view.session?.rounds.find((r) => r.id === view.round?.id) || view.session?.rounds.at(-1);
        view.target =
          view.round?.targets.find((t) => t.id === view.target?.id) || view.round?.targets[0];
        error.hidden = true;
        await paint();
        if (message) status.textContent = message;
        if (focus) host.querySelector('#' + CSS.escape(focus))?.focus();
      } catch (e) {
        showError(e);
      } finally {
        host.removeAttribute('aria-busy');
      }
    }
    function select(root, title, values, current, change, id) {
      const s = el('select', undefined, { id });
      for (const [value, text] of values) {
        const o = el('option', text, { value });
        s.append(o);
      }
      s.value = current;
      s.onchange = () => change(s.value);
      return label(root, title, s);
    }
    function selectedAnchor() {
      const t = view.target,
        r = view.round;
      if (!t) return { round: r.id };
      const content = t[view.side];
      if (!content) return { round: r.id, target: t.id };
      return {
        round: r.id,
        target: t.id,
        side: view.side,
        sha256: content.sha256,
        ...(view.anchor || {}),
      };
    }
    async function paint() {
      if (!live()) return;
      const generation = ++view.generation;
      content.replaceChildren();
      const session = view.session,
        round = view.round;
      if (!session) {
        status.textContent =
          'No review session yet. Ask your agent to open selected documents or code changes for review.';
        return;
      }
      const threads = view.state.threads.filter((t) => t.session === session.id),
        unresolved = threads.filter((t) => !t.resolved);
      status.textContent = view.state.closed
        ? 'Closed spec — feedback history is read-only.'
        : `${session.selection.mode} review · ${unresolved.length} unresolved · ${unresolved.filter((t) => t.stale).length} stale · ${session.drafts.length} drafts · ${session.cursor} submitted batches`;
      const owner = document.getElementById('owner-panel');
      if (owner) {
        owner.querySelector('.feedback-owner-count')?.remove();
        owner.append(
          el(
            'p',
            `${unresolved.length} unresolved feedback threads. Feedback does not change approval permissions.`,
            { class: 'feedback-owner-count' },
          ),
        );
      }
      content.append(
        el(
          'p',
          'Selected targets: ' +
            [
              ...session.selection.paths,
              ...session.selection.artifacts.map((a) => 'artifact:' + a),
            ].join(', '),
          { class: 'feedback-scope' },
        ),
      );
      const controls = el('div', undefined, { class: 'feedback-controls' });
      content.append(controls);
      select(
        controls,
        'Review session',
        view.state.sessions.map((s) => [s.id, s.selection.mode + ' · ' + s.id.slice(0, 8)]),
        session.id,
        (id) => {
          view.session = view.state.sessions.find((s) => s.id === id);
          view.round = view.session.rounds.at(-1);
          view.target = view.round.targets[0];
          view.anchor = null;
          view.page = 0;
          paint();
        },
        'feedback-session',
      );
      select(
        controls,
        'Round',
        session.rounds.map((r) => [
          r.id,
          'Round ' + r.sequence + (r.sealed ? ' · submitted' : ' · open'),
        ]),
        round.id,
        (id) => {
          view.round = session.rounds.find((r) => r.id === id);
          view.target = view.round.targets[0];
          view.anchor = null;
          view.page = 0;
          paint();
        },
        'feedback-round',
      );
      select(
        controls,
        'File',
        round.targets.map((t) => [t.id, (t.old_path ? t.old_path + ' → ' : '') + t.path]),
        view.target?.id,
        (id) => {
          view.target = round.targets.find((t) => t.id === id);
          view.anchor = null;
          view.page = 0;
          paint();
        },
        'feedback-target',
      );
      const writable = !view.state.closed && !round.sealed && round.id === session.rounds.at(-1).id;
      const workspace = el('div', undefined, { class: 'feedback-workspace' });
      const sourcePane = el('section', undefined, {
        class: 'feedback-source-pane',
        'aria-label': 'Selected source',
      });
      const discussion = el('section', undefined, {
        class: 'feedback-discussion',
        'aria-label': 'Comments and threads',
      });
      workspace.append(sourcePane, discussion);
      content.append(workspace);
      const sources = el('div', undefined, { class: 'feedback-sources' });
      sourcePane.append(sources);
      const range = el('div', undefined, { class: 'feedback-controls' });
      const rangeDetails = el('details', undefined, { class: 'feedback-range' });
      if (draft().anchor?.start)
        view.anchor = { start: draft().anchor.start, end: draft().anchor.end };
      const start = label(
        range,
        'First line (optional)',
        el('input', undefined, { type: 'number', min: '1', id: 'feedback-start' }),
      );
      const end = label(
        range,
        'Last line (optional)',
        el('input', undefined, { type: 'number', min: '1', id: 'feedback-end' }),
      );
      if (view.anchor) {
        start.value = view.anchor.start || '';
        end.value = view.anchor.end || '';
      }
      const side = select(
        range,
        'Comment side',
        ['before', 'after']
          .filter((s) => view.target?.[s])
          .map((s) => [s, s === 'before' ? 'Before' : 'After']),
        view.side,
        (value) => {
          view.side = value;
          view.anchor = null;
          paint();
        },
        'feedback-side',
      );
      if (!view.target?.[view.side]) {
        view.side = view.target?.after ? 'after' : 'before';
        side.value = view.side;
      }
      function syncSelection() {
        host.querySelectorAll('.feedback-line').forEach((node) => {
          const n = Number(node.dataset.line);
          node.setAttribute(
            'aria-pressed',
            String(
              node.dataset.side === view.side &&
                n >= (view.anchor?.start || Infinity) &&
                n <= (view.anchor?.end || -1),
            ),
          );
        });
      }
      function readRange() {
        view.anchor =
          start.value || end.value
            ? { start: Number(start.value), end: Number(end.value || start.value) }
            : null;
        save(draft().body, selectedAnchor());
        syncSelection();
      }
      start.oninput = end.oninput = readRange;
      const target = view.target;
      const texts = {};
      for (const name of ['before', 'after']) {
        const section = el('section', undefined, {
          class: 'feedback-source',
          'aria-label': name + ' source',
        });
        sources.append(section);
        section.append(el('h4', name === 'before' ? 'Before' : 'After'));
        if (!target?.[name]) {
          section.append(
            el(
              'p',
              name === 'before'
                ? 'No previous content (addition or first document round).'
                : 'Deleted — no after content.',
            ),
          );
          continue;
        }
        try {
          const query = new URLSearchParams({
            session: session.id,
            round: round.id,
            target: target.id,
            side: name,
          });
          const response = await api(path + 'snapshot?' + query);
          if (!response.ok) throw Error('Stored snapshot is unavailable');
          const text = await response.text();
          if (!live() || generation !== view.generation) return;
          texts[name] = text;
          const lines = text.split('\n');
          if (text.endsWith('\n')) lines.pop();
          if (!lines.length) lines.push('');
          const first = view.page * 100,
            last = Math.min(lines.length, first + 100);
          section.append(
            el('p', `Lines ${Math.min(first + 1, lines.length)}–${last} of ${lines.length}`),
          );
          const list = el('div', undefined, { class: 'feedback-lines' });
          section.append(list);
          for (let i = first; i < last; i++) {
            const line = button('', () => {
              view.side = name;
              side.value = name;
              const n = i + 1,
                from = view.anchor?.start;
              view.anchor = from
                ? { start: Math.min(from, n), end: Math.max(from, n) }
                : { start: n, end: n };
              start.value = view.anchor.start;
              end.value = view.anchor.end;
              save(draft().body, selectedAnchor());
              rangeDetails.open = true;
              syncSelection();
              host.querySelector('#feedback-comment')?.focus();
            });
            line.className = 'feedback-line';
            line.dataset.side = name;
            line.dataset.line = String(i + 1);
            line.disabled = !writable;
            line.setAttribute(
              'aria-pressed',
              String(
                view.side === name &&
                  i + 1 >= (view.anchor?.start || Infinity) &&
                  i + 1 <= (view.anchor?.end || -1),
              ),
            );
            line.setAttribute('aria-label', `Comment on ${name} line ${i + 1} ${lines[i]}`);
            line.append(
              el('span', String(i + 1) + ' ', { class: 'feedback-number', 'aria-hidden': 'true' }),
              el('code', lines[i]),
            );
            list.append(line);
          }
          if (/\.md$/i.test(target.path)) {
            const details = el('details'),
              summary = el('summary', 'Markdown preview');
            details.append(summary);
            const frame = el('iframe', undefined, {
              title: name + ' Markdown preview',
              sandbox: '',
              class: 'feedback-preview',
            });
            frame.srcdoc =
              `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><style>body{font:16px/1.6 system-ui;overflow-wrap:anywhere}pre{white-space:pre-wrap}img{max-width:100%}</style>` +
              (window.marked ? window.marked.parse(text) : 'Preview unavailable');
            details.append(frame);
            section.append(details);
          }
        } catch (e) {
          section.append(el('p', 'Snapshot unavailable: ' + e.message));
          showError(e);
        }
      }
      if (!live() || generation !== view.generation) return;
      const pages = Math.max(
        1,
        ...Object.values(texts).map((text) =>
          Math.ceil(Math.max(1, text.split('\n').length) / 100),
        ),
      );
      const paging = el('div', undefined, { class: 'feedback-controls' });
      const previous = button('Previous lines', () => {
          view.page--;
          paint();
        }),
        next = button('Next lines', () => {
          view.page++;
          paint();
        });
      previous.disabled = view.page === 0;
      next.disabled = view.page >= pages - 1;
      paging.append(previous, el('span', `Page ${view.page + 1} of ${pages}`), next);
      sourcePane.append(paging);
      if (view.anchor) rangeDetails.open = true;
      rangeDetails.append(el('summary', 'Anchor and comment side'), range);
      discussion.append(rangeDetails);
      const form = el('form', undefined, { class: 'feedback-composer' }),
        body = label(
          form,
          'Comment',
          el('textarea', undefined, { id: 'feedback-comment', rows: '4', maxlength: '8192' }),
        );
      body.value = draft().body;
      body.disabled = !writable;
      start.disabled = end.disabled = side.disabled = !writable;
      if (draft().anchor && !view.anchor)
        view.anchor = draft().anchor.start
          ? { start: draft().anchor.start, end: draft().anchor.end }
          : null;
      body.oninput = () => {
        save(body.value, selectedAnchor());
        view.pending = null;
        updateActions();
      };
      const add = el('button', 'Save draft comment', {
        type: 'submit',
        class: 'btn',
        id: 'feedback-add',
      });
      add.disabled = !writable;
      form.append(add);
      form.onsubmit = async (e) => {
        e.preventDefault();
        readRange();
        const anchor = selectedAnchor();
        if (!body.value.trim()) {
          showError(Error('Write a comment before saving'));
          return;
        }
        if (await mutate('comment', { body: body.value, anchor })) {
          save('', null);
          view.anchor = null;
          await load('Draft saved. Submit feedback to send it to your agent.');
        }
      };
      const submit = button('Submit feedback', async () => {
        if (body.value.trim()) {
          showError(Error('Save your local comment as a draft before submitting'));
          return;
        }
        if (await mutate('submit', { round: round.id }))
          await load(
            'Feedback submitted. Your active agent can read it; an idle agent needs a prompt to resume.',
          );
      });
      submit.id = 'feedback-submit';
      function updateActions() {
        const local = !!body.value.trim();
        add.disabled = !writable || !local;
        submit.disabled = !writable || local;
        add.classList.toggle('primary', local);
        submit.classList.toggle('primary', !local);
      }
      updateActions();
      const actions = el('div', undefined, { class: 'feedback-submit-area' });
      discussion.append(form, actions);
      actions.append(
        submit,
        el(
          'p',
          writable
            ? 'An empty submission means no changes requested. It grants no approval permission.'
            : view.state.closed
              ? 'Closed history is read-only.'
              : 'This round is sealed. Ask your agent to publish a new round to add feedback.',
        ),
      );
      if (!session.cursor)
        actions.append(
          el(
            'p',
            'Waiting for your first submission. Your agent receives saved drafts only after Submit feedback.',
          ),
        );
      else
        actions.append(
          el(
            'p',
            'Submitted feedback is retained. If your agent is idle, prompt it to read this session.',
          ),
        );
      const history = el('section', undefined, { 'aria-label': 'Feedback threads' });
      history.append(el('h3', 'Threads'));
      discussion.append(history);
      if (!threads.length) history.append(el('p', 'No comments yet.'));
      for (const thread of threads) {
        const card = el('article', undefined, { class: 'feedback-thread' });
        history.append(card);
        card.append(
          el(
            'h5',
            (thread.resolved ? 'Resolved' : 'Unresolved') + (thread.stale ? ' · stale anchor' : ''),
          ),
        );
        card.append(el('p', thread.body), el('p', 'By ' + thread.by));
        const anchor = thread.original;
        const original = session.rounds.find((r) => r.id === anchor.round);
        card.append(
          el(
            'p',
            `Original: round ${original?.sequence || '?'} · ${anchor.side || 'round'}${anchor.start ? ' · lines ' + anchor.start + '–' + anchor.end : ''}`,
          ),
        );
        if (anchor.quote) card.append(el('blockquote', anchor.quote));
        const originalDetails = el('details', undefined, { class: 'feedback-original' });
        originalDetails.append(el('summary', 'Original anchor and history'));
        card.append(originalDetails);
        originalDetails.append(
          button('View original anchor', () => {
            view.round = original;
            view.target =
              original.targets.find((t) => t.id === anchor.target) || original.targets[0];
            view.side = anchor.side || 'after';
            view.page = Math.floor(((anchor.start || 1) - 1) / 100);
            view.anchor = null;
            paint();
          }),
        );
        for (const reply of thread.replies)
          card.append(el('p', 'Agent response · ' + reply.by + ': ' + reply.body));
        for (const event of thread.events)
          originalDetails.append(el('p', event.kind + ' · ' + event.by));
        const resolve = button('Resolve', async () => {
          if (await mutate('resolve', { thread: thread.id }))
            await load('Thread resolved. Submitted batches remain recorded.');
        });
        resolve.disabled = view.state.closed || thread.resolved;
        card.append(resolve);
        if (thread.stale && !thread.resolved) {
          const reattach = button('Reattach to selected anchor', async () => {
            readRange();
            if (await mutate('reattach', { thread: thread.id, anchor: selectedAnchor() }))
              await load('Reattachment saved as a draft. Submit feedback to send the new anchor.');
          });
          reattach.disabled = !writable;
          card.append(
            reattach,
            el(
              'p',
              'Select the latest open round and the new anchor, then reattach and Submit. If no new round is available, ask your agent to refresh it.',
            ),
          );
        }
      }
      const records = el('details', undefined, { class: 'feedback-records' });
      records.append(el('summary', 'Saved drafts and submitted batches'));
      discussion.append(records);
      for (const item of session.drafts) records.append(el('p', 'Draft · ' + item.body));
      for (const batch of view.state.batches.filter((b) => b.session === session.id))
        records.append(
          el('p', `Submitted batch ${batch.cursor} · ${batch.items.length} items · ${batch.by}`),
        );
    }
    load();
  };
})();
