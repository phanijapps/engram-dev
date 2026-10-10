/* The spec library page (spec-library T-3..T-6; DES-3..DES-7).
   Consumes GETs and emits events at the seam — nothing else. */

var S = { specs: [], legacy: [], sel: null, spec: null, tab: 'overview', docs: [] };
const $ = (id) => document.getElementById(id);

/* ── DES-5: the words layer (Q-3) ─────────────────────────────────── */
const WORDS = {
  awaiting_owner: 'Waiting on you',
  planning: 'Being shaped',
  in_progress: 'In progress',
  blocked: 'Stuck — needs attention',
  in_review: 'In review',
  delivered: 'Done',
  drafted: 'Just started',
};
const TASK_WORDS = { todo: 'Not started', doing: 'In progress', done: 'Done', blocked: 'Stuck' };
const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );
function stageWord(st) {
  return WORDS[st] || st;
}
const stageChip = (st, extra = '') =>
  `<span class="chip ${st === 'awaiting_owner' ? 'you' : st === 'delivered' ? 'go' : st === 'blocked' ? 'stuck' : ''}" title="${esc(st)}">${esc(stageWord(st))}${extra}</span>`;

function plainDate(iso) {
  if (!iso) return '';
  const t = Date.parse(iso.includes('T') ? iso : iso + 'T12:00:00Z');
  if (isNaN(t)) return esc(iso);
  const days = Math.round((Date.now() - t) / 86400000);
  const word =
    days <= 0
      ? 'today'
      : days === 1
        ? 'yesterday'
        : days < 30
          ? `${days} days ago`
          : `on ${new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  return `<span title="${esc(iso)}">${esc(word)}</span>`;
}

/* ── DES-3: the pane (Q-2: needs you first) ───────────────────────── */
function groupOf(p) {
  if (p.stage === 'awaiting_owner' || p.open_questions > 0) return 'you';
  if (p.stage === 'delivered') return 'done';
  return 'moving';
}
const GROUPS = [
  ['you', 'Waiting on you', 'awaiting_owner + open questions'],
  ['moving', 'Moving', 'planning · in_progress · in_review · blocked'],
  ['done', 'Done', 'delivered'],
];

function matches(p, q) {
  if (!q) return true;
  return (p.name + ' ' + p.title).toLowerCase().includes(q);
}

function paintPane() {
  const q = ($('search').value || '').trim().toLowerCase();
  const html = GROUPS.map(([key, label, hint]) => {
    const items = S.specs
      .filter((p) => groupOf(p) === key && matches(p, q))
      .sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
    if (!items.length) return '';
    return (
      `<div class="group"><h2 title="${esc(hint)}">${esc(label)} <span class="n">${items.length}</span></h2>` +
      items
        .map(
          (
            p,
          ) => `<div class="card ${S.sel === p.name ? 'sel' : ''}" data-name="${esc(p.name)}" tabindex="0" role="button">
        <div class="t">${esc(p.title)}</div>
        <div class="m">${stageChip(p.stage)} <span title="revision">${p.revision}×</span>
        ${p.open_questions ? `<span class="chip you" title="open questions">${p.open_questions} to answer</span>` : ''}</div>
      </div>`,
        )
        .join('') +
      `</div>`
    );
  }).join('');
  const legacy = q
    ? ''
    : S.legacy.length
      ? `<div class="group"><h2 title="older initiatives, read-only">History <span class="n">${S.legacy.length}</span></h2>` +
        S.legacy
          .map(
            (
              l,
            ) => `<div class="card ${S.sel === 'legacy:' + l.name ? 'sel' : ''}" data-legacy="${esc(l.name)}" tabindex="0" role="button">
        <div class="t">${esc(l.title)}</div><div class="m"><span class="chip">read-only</span></div></div>`,
          )
          .join('') +
        `</div>`
      : '';
  $('pane').innerHTML = html + legacy || `<div class="empty">No spec matches.</div>`;
  const you = S.specs.filter((p) => groupOf(p) === 'you').length;
  $('counts').textContent = `${S.specs.length} specs · ${you} waiting on you`;
  $('pane')
    .querySelectorAll('[data-name]')
    .forEach((el) => {
      el.onclick = () => (location.hash = '#/' + el.dataset.name);
      el.onkeydown = (e) => {
        if (e.key === 'Enter') location.hash = '#/' + el.dataset.name;
      };
    });
  $('pane')
    .querySelectorAll('[data-legacy]')
    .forEach((el) => {
      el.onclick = () => (location.hash = '#/legacy/' + el.dataset.legacy);
      el.onkeydown = (e) => {
        if (e.key === 'Enter') location.hash = '#/legacy/' + el.dataset.legacy;
      };
    });
}

/* ── DES-4: traceability — every ID a jump-link (FR-9) ───────────── */
const IDRE = /\b(US|AC|FR|CON|Q|D|DES|T)-\d+[A-Za-z0-9-]*\b/g;
function idl(text) {
  return esc(text).replace(IDRE, (m) => `<span class="idl" data-jump="${m}">${m}</span>`);
}
function idlHtml(html) {
  /* wrap IDs in rendered markdown — text nodes only, never inside tags */
  return html.replace(
    />([^<]+)</g,
    (m, txt) =>
      '>' + txt.replace(IDRE, (id) => `<span class="idl" data-jump="${id}">${id}</span>`) + '<',
  );
}
let pendingJump = null;
const FAMILIES = {
  T: 'tasks',
  DES: 'design',
  D: 'design',
  US: 'spec',
  AC: 'spec',
  FR: 'spec',
  CON: 'spec',
  Q: 'spec',
};
function tabFor(id) {
  return FAMILIES[id.split('-')[0]] || null;
}

function jump(id, second = false) {
  const el = document.getElementById('card-' + id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1600);
    return;
  }
  const tab = tabFor(id);
  if (tab && S.tab !== tab && !second) {
    /* cross-tab: route, then land after render */
    pendingJump = id;
    location.hash = '#/' + S.sel + '/' + tab;
    return;
  }
  toast(`${id}: not in this spec`);
}

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.cssText =
    'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:8px 16px;color:var(--dim);z-index:9';
  clearTimeout(t._h);
  t._h = setTimeout(() => (t.textContent = ''), 2200);
}

/* ── DES-6: the journey strip (Q-5) ──────────────────────────────── */
const PATH = ['drafted', 'planning', 'in_progress', 'in_review', 'delivered'];
function posOf(stage) {
  return Math.max(0, PATH.indexOf(stage));
}
function posFor(stage, spec) {
  const p = posOf(stage);
  if (p > 0 || (stage !== 'blocked' && stage !== 'awaiting_owner')) return p;
  /* flags are not nodes: infer the furthest reached stage from the record */
  const ts = (spec && spec.tasks) || [];
  if (ts.some((t) => t.status === 'done')) return 2;
  if (ts.some((t) => t.status === 'doing' || t.status === 'blocked')) return 2;
  const has =
    (spec && spec.spec && spec.spec.clarifications) ||
    (spec && spec.design && spec.design.decisions);
  if (ts.length || has) return 1;
  return 0;
}
function journey(stage, spec) {
  const now = posFor(stage, spec);
  const nodes = PATH.map(
    (st, i) =>
      `<div class="jnode ${i < now ? 'lit' : ''} ${i === now ? 'now' : ''}" title="${esc(st)}"><div class="jdot"></div><span>${esc(stageWord(st))}</span></div>`,
  );
  const bars = PATH.slice(1).map((_, i) => `<div class="jbar ${i < now ? 'lit' : ''}"></div>`);
  const strip = nodes[0] + bars.map((b, i) => b + nodes[i + 1]).join('');
  const flag =
    stage === 'awaiting_owner'
      ? `<span class="jflag you" title="awaiting_owner">⚑ Waiting on you</span>`
      : stage === 'blocked'
        ? `<span class="jflag stuck" title="blocked">⚑ Stuck</span>`
        : '';
  return `<div class="journey" style="display:flex;align-items:flex-start">${strip}${flag}</div>`;
}

/* ── the tabs (DES-4, Q-8 friendly empties) ──────────────────────── */
function coveredBy(fr) {
  const ts = (S.spec.tasks || []).filter((t) => (t.satisfies || []).includes(fr));
  return ts.length
    ? `<span class="m">covered by ${ts.map((t) => `<span class="idl" data-jump="${t.id}">${t.id}</span>`).join(', ')}</span>`
    : `<span class="m" style="color:var(--stuck)">not covered yet</span>`;
}

function tabOverview() {
  const d = S.spec;
  const dates = ['created', 'updated', 'approved', 'closed']
    .map((k) => {
      const v = (d.date || {})[k];
      return v
        ? typeof v === 'object'
          ? `<div>${k}: ${plainDate(v.at)} by ${esc(v.by)}</div>`
          : `<div>${k}: ${plainDate(v)}</div>`
        : '';
    })
    .join('');
  const docs = S.docs
    .map(
      (doc) => `<details class="doc" ${doc.file === 'brief.md' ? 'open' : ''}>
    <summary style="cursor:pointer;color:var(--rev)">${esc(doc.file)}</summary>
    <div class="md" data-doc="${esc(doc.file)}"></div></details>`,
    )
    .join('');
  const leg = S.sel && S.sel.startsWith('legacy:');
  return `${leg ? '' : journey(d.status?.deliverable || 'drafted', d)}
    <div class="item"><h4>${esc(d.description || d.title || d.name)}</h4>
      <div class="meta">${stageChip(d.status?.deliverable)} <span title="revision">changed ${d.revision}×</span> ${(d.date || {}).approved ? `<span class="chip go" title="${esc(d.date.approved.at)}">approved by ${esc(d.date.approved.by)}</span>` : ''}</div>
      <div class="meta" style="margin-top:6px">${dates}</div></div>
    ${docs || `<div class="empty">No documents yet.</div>`}
    ${leg ? '' : `<div id="approve-host" style="margin:8px 0"></div>`}`;
}

function tabSpec() {
  const s = S.spec.spec || {};
  const stories = (s.stories || [])
    .map(
      (us) => `<div class="item" id="card-${us.id}"><h4>${idl(us.id + ' — ' + us.title)}</h4>
    <div class="meta"><span>as ${esc(us.as)}</span><span>want: ${esc(us.want)}</span><span>so: ${esc(us.so)}</span></div>
    ${(us.acceptance || []).map((a) => `<div class="meta" id="card-${a.id}" style="margin-top:6px"><b>${idl(a.id)}</b>: given ${idl(a.given)} · when ${idl(a.when)} · then ${idl(a.then)}</div>`).join('')}
  </div>`,
    )
    .join('');
  const reqs = (s.requirements || [])
    .map(
      (
        r,
      ) => `<div class="item" id="card-${r.id}"><h4>${idl(r.id)} <span class="chip">${esc(r.priority || '')}</span></h4>
    <div>${idl(r.text)}</div><div class="meta">${coveredBy(r.id)} · serves ${idl((r.serves || []).join(', '))}</div></div>`,
    )
    .join('');
  const cons = (s.constraints || [])
    .map(
      (c) =>
        `<div class="item" id="card-${c.id}"><h4>${idl(c.id)}</h4><div>${idl(c.text)}</div></div>`,
    )
    .join('');
  const qs = (s.clarifications || [])
    .map((q) => {
      if (q.status === 'open') return qCard(q);
      return `<div class="item" id="card-${q.id}"><h4>${idl(q.id)}</h4><div>${esc(q.question)}</div>
      <div class="meta"><b>${q.unknown ? 'honestly unknown' : esc(q.answer)}</b> — ${esc(q.answered_by || '')} ${plainDate(q.answered_at || '')}</div></div>`;
    })
    .join('');
  return `<h3>Stories</h3>${stories || `<div class="empty">Not written yet.</div>`}
    <h3>Requirements</h3>${reqs || `<div class="empty">Not written yet.</div>`}
    ${cons ? `<h3>Constraints</h3>` + cons : ''}
    <h3>Questions</h3>${qs || `<div class="empty">Nothing was asked.</div>`}`;
}

function tabDesign() {
  const g = S.spec.design || {};
  const cards = (g.designs || [])
    .map(
      (
        x,
      ) => `<div class="item" id="card-${x.id}"><h4>${idl(x.id + ' — ' + x.title)} <span class="chip">${esc(x.kind)}</span></h4><div>${idl(x.detail || '')}</div>
    <div class="meta">${(x.addresses || []).map(idl).join(' · ')}</div></div>`,
    )
    .join('');
  const decs = (g.decisions || [])
    .map(
      (
        d,
      ) => `<div class="item" id="card-${d.id}"><h4>${idl(d.id)} <span class="chip ${d.status === 'accepted' ? 'go' : d.status === 'declined' ? 'stuck' : ''}">${esc(d.status)}</span></h4>
    <div>${idl(d.decision)}</div><div class="meta">because ${idl(d.because || '')}${d.accepted_by ? ' · accepted by ' + esc(d.accepted_by) : ''}</div></div>`,
    )
    .join('');
  return `<h3>Approach</h3><div class="item">${idl(g.approach || '')}</div>
    <h3>Parts</h3>${cards || `<div class="empty">Not written yet.</div>`}
    <h3>Decisions</h3>${decs || `<div class="empty">Not written yet.</div>`}`;
}

function tabTasks() {
  const ts = (S.spec.tasks || [])
    .map(
      (t) => `<div class="item" id="card-${t.id}">
    <h4>${idl(t.id + ' — ' + t.title)} <span class="chip ${t.status === 'done' ? 'go' : t.status === 'blocked' ? 'stuck' : ''}">${esc(TASK_WORDS[t.status] || t.status)}</span></h4>
    <div>${idl(t.detail || '')}</div>
    <div class="meta">check: <code>${esc((t.verify || {}).cmd || '')}</code> → ${esc((t.verify || {}).expect || '')}</div>
    <div class="meta">satisfies ${idl((t.satisfies || []).join(', '))} · implements ${idl((t.implements || []).join(', '))} · honors ${idl((t.honors || []).join(', '))}</div>
    ${(t.evidence || []).map((e) => `<div class="evi">exit ${e.exit} · ${esc(e.at)} · ${esc(e.by)}<br><code>${esc(e.cmd)}</code></div>`).join('')}
  </div>`,
    )
    .join('');
  return ts || `<div class="empty">Not written yet.</div>`;
}

function tabReview() {
  const vs = ((S.spec.review || {}).verdicts || [])
    .map(
      (
        v,
      ) => `<div class="item"><h4>${idl(v.on)} — <span class="chip ${v.verdict === 'PASS' ? 'go' : ''}">${esc(v.verdict)}</span></h4>
    <div class="meta">${esc(v.by)} ${plainDate(v.at || '')}</div>
    ${(v.findings || []).map((f) => `<div class="meta" style="margin-top:4px"><span class="sev ${f.severity === 'BLOCKER' ? 'b' : f.severity === 'DEFECT' ? 'd' : 's'}">${esc(f.severity)}</span> ${idl(f.note)}${f.fix ? `<br>fix: ${idl(f.fix)}` : ''}</div>`).join('')}
  </div>`,
    )
    .join('');
  return vs || `<div class="empty">No review yet — the reviewer comes at the end.</div>`;
}

const TABS = [
  ['overview', 'Overview'],
  ['spec', 'Spec'],
  ['design', 'Design'],
  ['tasks', 'Tasks'],
  ['review', 'Review'],
];
function paintTabs() {
  const mk = (id, label) =>
    `<button class="tab" role="tab" aria-selected="${S.tab === id}" data-tab="${id}">${label}</button>`;
  $('detail').innerHTML =
    `<div class="tabs">${TABS.map(([i, l]) => mk(i, l)).join('')}</div><div id="tabbody"></div>`;
  const body =
    { overview: tabOverview, spec: tabSpec, design: tabDesign, tasks: tabTasks, review: tabReview }[
      S.tab
    ] || tabOverview;
  $('tabbody').innerHTML = body();
  document.querySelectorAll('[data-tab]').forEach(
    (b) =>
      (b.onclick = () => {
        location.hash = '#/' + S.sel + '/' + b.dataset.tab;
      }),
  );
  document
    .querySelectorAll('[data-jump]')
    .forEach((el) => (el.onclick = () => jump(el.dataset.jump)));
  renderDocs();
  paintActs();
}

/* ── markdown docs (D-1) ─────────────────────────────────────────── */
async function renderDocs() {
  document.querySelectorAll('[data-doc]').forEach(async (el) => {
    const name = S.sel.startsWith('legacy:') ? S.sel.slice(7) : S.sel;
    const file = el.dataset.doc;
    try {
      const r = await fetch(`/artifact/${encodeURIComponent(name)}/${encodeURIComponent(file)}`);
      if (!r.ok) {
        el.innerHTML = `<div class="empty">Could not load ${esc(file)}.</div>`;
        return;
      }
      const md = await r.text();
      el.innerHTML = idlHtml(marked.parse(md));
      el.querySelectorAll('[data-jump]').forEach((x) => (x.onclick = () => jump(x.dataset.jump)));
    } catch (e) {
      el.innerHTML = `<div class="empty">${esc(String(e))}</div>`;
    }
  });
}

/* ── DES-7: the acts (Q-1: look + answer + approve) ──────────────── */
var picked = {};
function qCard(q) {
  const mine = S.spec.spec.clarifications.find((x) => x.id === q.id) || {};
  if (mine.status !== 'open') return ''; /* re-rendered away after landing */
  const opts = (q.options || [])
    .map(
      (o, i) =>
        `<button class="btn opt" data-opt="${esc(o)}" aria-pressed="${picked[q.id] === o || (!picked[q.id] && q.default === o)}">${i + 1}. ${esc(o)}</button>`,
    )
    .join('');
  return `<div class="item qcard" id="card-${q.id}"><h4>${idl(q.id)} <span class="chip you">waiting on you</span></h4>
    <div>${esc(q.question)}</div>
    ${
      q.kind === 'choice' && q.options
        ? `<div class="opts">${opts}</div>
      <button class="btn primary" data-choice="${q.id}">Answer</button><div class="err" id="act-${q.id}"></div>`
        : `<textarea id="ta-${q.id}" placeholder="your answer…"></textarea>
         <div style="margin-top:6px"><button class="btn primary" data-send="${q.id}">Answer</button>
         <button class="btn warn" data-unk="${q.id}">I don't know</button></div><div class="err" id="act-${q.id}"></div>`
    }
  </div>`;
}

async function emit(name, body) {
  const r = await fetch('/event/' + encodeURIComponent(name), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const out = await r.json().catch(() => ({ ok: false, error: 'no JSON' }));
  if (!r.ok || out.ok === false) throw new Error(out.error || 'POST /event ' + r.status);
  return out;
}

function paintActs() {
  if (!S.spec || S.sel.startsWith('legacy:')) return;
  const qs = ((S.spec.spec || {}).clarifications || []).filter((q) => q.status === 'open');
  document.querySelectorAll('[data-opt]').forEach(
    (b) =>
      (b.onclick = () => {
        const q = b.closest('.qcard').id.slice(5);
        picked[q] = b.dataset.opt;
        paintTabs();
      }),
  );
  document.querySelectorAll('[data-send]').forEach(
    (b) =>
      (b.onclick = async () => {
        const q = b.dataset.send,
          text = ($('ta-' + q) || {}).value || '';
        await act(q, { kind: 'answer', q, text });
      }),
  );
  document.querySelectorAll('[data-unk]').forEach(
    (b) =>
      (b.onclick = async () => {
        await act(b.dataset.unk, { kind: 'unknown', q: b.dataset.unk });
      }),
  );
  document.querySelectorAll('[data-choice]').forEach(
    (b) =>
      (b.onclick = async () => {
        const q = b.dataset.choice,
          option = picked[q] || (S.spec.spec.clarifications.find((x) => x.id === q) || {}).default;
        await act(q, { kind: 'choice', q, option, text: option }); /* the seam carries both */
      }),
  );
  /* approve: legal when nothing is open and it never landed (DES-7) */
  const approved = ((S.spec.date || {}).approved || {}).at;
  const legal = !qs.length && !approved && S.spec.status?.lifecycle !== 'complete';
  const host = document.getElementById('approve-host');
  if (host)
    host.innerHTML = legal
      ? `<button class="btn go" id="do-approve">✓ Approve this spec</button><span class="err" id="approve-err"></span>`
      : '';
  const btn = document.getElementById('do-approve');
  if (btn)
    btn.onclick = async () => {
      if (!btn.dataset.armed) {
        btn.dataset.armed = '1';
        btn.textContent = 'Click again to approve — it lands with your name';
        return;
      }
      try {
        await emit(S.sel, { kind: 'approve' });
        await loadAll();
      } catch (e) {
        $('approve-err').textContent = String(e.message || e);
      }
    };
}

async function act(q, body) {
  const sink = document.getElementById('act-' + q);
  try {
    await emit(S.sel, body);
    delete picked[q];
    await loadAll();
  } catch (e) {
    if (sink) sink.textContent = String(e.message || e);
  }
}

/* ── the router (D-3) + boot ─────────────────────────────────────── */
let lastSel = null;
function route() {
  const parts = location.hash.replace(/^#\//, '').split('/').filter(Boolean);
  if (S.sel && S.sel !== lastSel) picked = {}; /* S-11: Q-ids collide across packs */
  if (parts[0] === 'legacy') {
    S.sel = 'legacy:' + (parts[1] || '');
    S.tab = 'overview';
  } else if (parts[0]) {
    S.sel = parts[0];
    S.tab = TABS.some(([t]) => t === parts[1]) ? parts[1] : 'overview';
  } else S.sel = null;
  const onlyTab = S.sel === lastSel && S.spec; /* S-12: a tab switch never refetches */
  paintPane();
  if (onlyTab) paintTabs();
  else paintDetail();
  lastSel = S.sel;
  if (pendingJump) {
    const id = pendingJump;
    pendingJump = null;
    requestAnimationFrame(() => jump(id, true));
  }
}

async function loadSpec(name) {
  const r = await fetch('/spec/' + encodeURIComponent(name));
  if (!r.ok) throw new Error('no spec named ' + name);
  S.spec = await r.json();
}

async function paintDetail() {
  if (!S.sel) {
    $('detail').innerHTML =
      `<div class="empty">Choose a spec on the left.<br><br>What waits on you sits on top.</div>`;
    return;
  }
  try {
    if (S.sel.startsWith('legacy:')) {
      const l = S.legacy.find((x) => x.name === S.sel.slice(7)) || {
        name: S.sel.slice(7),
        files: [],
      };
      S.docs = (l.files || []).map((f) => ({ file: f }));
      S.spec = {
        name: l.name,
        description: l.title || l.name,
        status: {},
        spec: {},
        design: {},
        tasks: [],
        date: {},
      };
    } else {
      await loadSpec(S.sel);
      /* Q-7: every .md in the folder — carried from the pane state (S-12: no refetch) */
      const files = (S.specs.find((p) => p.name === S.sel) || {}).docs || [];
      S.docs = files.map((f) => ({ file: f }));
    }
    paintTabs();
  } catch (e) {
    $('detail').innerHTML = `<div class="empty">${esc(String(e))}</div>`;
  }
}

async function loadAll() {
  const r = await fetch('/specs');
  const out = await r.json();
  S.specs = out.specs || [];
  S.legacy = out.legacy || [];
  paintPane();
  if (S.sel && !S.sel.startsWith('legacy:')) {
    await paintDetail();
  }
}

window.addEventListener('hashchange', route);
$('search').addEventListener('input', paintPane);
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === '/') {
    e.preventDefault();
    $('search').focus();
  }
  const t = TABS.findIndex(([id]) => id === S.tab);
  if (e.key === 'ArrowRight' && t < TABS.length - 1 && S.sel)
    location.hash = '#/' + S.sel + '/' + TABS[t + 1][0];
  if (e.key === 'ArrowLeft' && t > 0 && S.sel) location.hash = '#/' + S.sel + '/' + TABS[t - 1][0];
});

(async function boot() {
  try {
    await loadAll();
    route();
  } catch (e) {
    $('detail').innerHTML = `<div class="empty">${esc(String(e))}</div>`;
  }
})();

/* ── the theme toggle (FR-2): the shared key, one preference ── */
(function () {
  var b = document.getElementById('themeToggle');
  if (!b) return;
  b.onclick = function () {
    var cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = cur;
    try {
      localStorage.setItem('theme', cur);
    } catch (e) {
      /* storage refused: session-only */
    }
  };
})();
