/* the interview page — binds to the event vocabulary only.
   GET /spec  → the spec (canonical layout, machine-derived status)
   POST /event {kind, q?, text?, option?, by} → admission server-side
   The page stamps nothing; the server stamps at admission. */
'use strict';

const SECTIONS = [
  'id',
  'name',
  'description',
  'date',
  'status',
  'metadata',
  'spec',
  'design',
  'tasks',
  'workflow',
  'review',
  'env',
  'format',
  'revision',
];
const KINDS = ['answer', 'unknown', 'choice', 'approve'];
const STAGES = [
  'drafted',
  'planning',
  'in_progress',
  'blocked',
  'awaiting_owner',
  'in_review',
  'delivered',
];

const BY = (window.INTERVIEW_CONFIG && window.INTERVIEW_CONFIG.by) || 'human:owner';
let S = null; // the spec, emitted layout
let i = 0,
  sel = 0,
  curQid = ''; // wizard cursor, selected option, question-change guard
let saving = false;
const localAnswers = new Map(); // retain typed answers when a write is refused

function selFor(q) {
  /* AC-13: the declared default is preselected */
  return Math.max(0, (q.options || []).indexOf(q.default));
}

/* ── data ── */
async function loadSpec() {
  const r = await fetch('/spec');
  if (!r.ok) throw new Error('GET /spec ' + r.status);
  S = await r.json();
}
async function emit(ev) {
  const r = await fetch('/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...ev, expected_revision: S.revision }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || 'POST /event ' + r.status);
  }
  await loadSpec();
  renderAll(); /* DEFECT 7 fix: dossier, header, ring stay current after every admission */
}

/* ── derived views ── */
const clar = () => (S.spec && S.spec.clarifications) || [];
const openQs = () => clar().filter((c) => c.status === 'open');
const approved = () => !!(S.date && S.date.approved);

/* ── header + ring ── */
function paintHeader() {
  document.getElementById('h-name').textContent = S.name || S.id;
  document.getElementById('h-desc').textContent = S.description || '';
  const life = document.getElementById('h-life');
  life.textContent = (S.status && S.status.lifecycle) || 'active';
  document.getElementById('h-rev').textContent = 'rev ' + (S.revision || 1);
}
function ringSVG(stage) {
  const idx = Math.max(0, STAGES.indexOf(stage));
  let segs = '';
  const cx = 24,
    cy = 24,
    r = 18;
  for (let s = 0; s < STAGES.length; s++) {
    const a0 = -90 + s * (360 / STAGES.length) + 4,
      a1 = -90 + (s + 1) * (360 / STAGES.length) - 4;
    const p = (a) => {
      const t = (a * Math.PI) / 180;
      return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
    };
    const [x0, y0] = p(a0),
      [x1, y1] = p(a1);
    segs += `<path d="M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}" stroke="${s <= idx ? 'var(--primary)' : 'var(--surface-4)'}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
  }
  return `<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">${segs}</svg>`;
}

/* ── the dossier: rendered strictly in canonical order ── */
function dossierHTML() {
  const esc = (s) =>
    String(s ?? '').replace(
      /[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );
  const part = {};
  part.id = '';
  part.name = '';
  part.description = '';
  part.date = () => {
    const d = S.date || {};
    const rows = [];
    if (d.created) rows.push(`created <b>${esc(d.created)}</b>`);
    if (d.updated) rows.push(`updated ${esc(d.updated)}`);
    if (d.approved)
      rows.push(`approved by <b>${esc(d.approved.by || '?')}</b> at ${esc(d.approved.at)}`);
    if (d.closed) rows.push(`closed by <b>${esc(d.closed.by || '?')}</b> at ${esc(d.closed.at)}`);
    return rows.length
      ? `<div class="card"><p class="note" style="margin:0">${rows.join(' · ')}</p></div>`
      : '';
  };
  part.status = () => {
    const st = S.status || {};
    const stage = st.deliverable || 'drafted';
    return `<div class="card"><div class="ring">${ringSVG(stage)}<div class="stage">${esc(stage)}<small>Current status</small></div></div></div>`;
  };
  part.metadata = () => {
    const md = S.metadata || {};
    const links = Object.entries(md)
      .map(
        ([k, v]) =>
          `<a href="#" title="sha256 ${esc(v.sha256 || 'unpinned')}" data-ref="${esc(v.ref)}">${esc(k)}: ${esc(v.ref)}</a>`,
      )
      .join('');
    return links
      ? `<div class="card"><div class="links">${links}</div><p class="note">external references (pinned where sha256 present)</p></div>`
      : '';
  };
  part.spec = () => {
    const sp = S.spec || {};
    let h = '';
    if (sp.why) h += `<h2>Why</h2><div class="card"><p style="margin:0">${esc(sp.why)}</p></div>`;
    if (sp.stories?.length) {
      h +=
        `<h2>Stories</h2>` +
        sp.stories
          .map(
            (
              us,
            ) => `<div class="card"><h3><span class="idchip">${esc(us.id)}</span>${esc(us.title || '')}</h3>
        <p class="note">as ${esc(us.as)} · want ${esc(us.want)} · so ${esc(us.so)}</p>
        ${(us.acceptance || []).map((a) => `<ul class="tight"><li><span class="idchip">${esc(a.id)}</span>${esc(a.given)} / ${esc(a.when)} / ${esc(a.then)}</li></ul>`).join('')}</div>`,
          )
          .join('');
    }
    if (sp.requirements?.length) {
      h +=
        `<h2>Requirements</h2>` +
        sp.requirements
          .map(
            (fr) =>
              `<div class="card"><h3><span class="idchip">${esc(fr.id)}</span>${esc(fr.priority || '')}</h3><p class="note" style="font-size:12.5px;color:var(--ink)">${esc(fr.text)}</p>${fr.serves ? `<p class="note">serves ${fr.serves.map(esc).join(', ')}</p>` : ''}</div>`,
          )
          .join('');
    }
    if (sp.constraints?.length) {
      h +=
        `<h2>Constraints</h2>` +
        sp.constraints
          .map(
            (cn) =>
              `<div class="card"><h3><span class="idchip">${esc(cn.id)}</span></h3><p class="note" style="font-size:12.5px;color:var(--ink)">${esc(cn.text)}</p></div>`,
          )
          .join('');
    }
    if (clar().length) {
      h +=
        `<h2>Questions</h2>` +
        clar()
          .map((q) => {
            const cls = q.status === 'resolved' ? 'st-res' : q.unknown ? 'st-unk' : 'st-open';
            const lbl = q.status === 'resolved' ? 'resolved' : q.unknown ? 'unknown' : 'open';
            return `<div class="card"><h3><span class="idchip">${esc(q.id)}</span><span class="st ${cls}">${lbl}</span></h3>
          <p class="note" style="font-size:12.5px;color:var(--ink)">${esc(q.question)}</p>
          ${q.answer ? `<p class="note">${q.status === 'resolved' ? 'answered' : 'recorded'}: ${esc(q.answer)}${q.answered_by ? ' — ' + esc(q.answered_by) : ''}</p>` : ''}</div>`;
          })
          .join('');
    }
    return h;
  };
  part.design = () => {
    const pl = S.design || {};
    let h = '';
    if (pl.decisions?.length) {
      h +=
        `<h2>Decisions</h2>` +
        pl.decisions
          .map((d) => {
            const cls =
              d.status === 'accepted' ? 'st-acc' : d.status === 'rejected' ? 'st-rej' : 'st-prop';
            return `<div class="card"><h3><span class="idchip">${esc(d.id)}</span><span class="st ${cls}">${esc(d.status)}</span></h3>
          <p class="note" style="font-size:12.5px;color:var(--ink)">${esc(d.decision)}</p><p class="note">${esc(d.because || '')}</p></div>`;
          })
          .join('');
    }
    if (pl.designs?.length) {
      h +=
        `<h2>Designs</h2>` +
        pl.designs
          .map(
            (d) =>
              `<div class="card"><h3><span class="idchip">${esc(d.id)}</span>${esc(d.title)}</h3><p class="note">${esc(d.detail)}</p></div>`,
          )
          .join('');
    }
    return h;
  };
  part.tasks = () =>
    S.tasks?.length
      ? `<h2>Tasks</h2>` +
        S.tasks
          .map((t) => {
            const cls =
              { todo: 'st-todo', doing: 'st-doing', done: 'st-done', blocked: 'st-blocked' }[
                t.status
              ] || 'st-todo';
            return `<div class="card"><h3><span class="idchip">${esc(t.id)}</span>${esc(t.title)} <span class="st ${cls}">${esc(t.status)}</span></h3></div>`;
          })
          .join('')
      : '';
  part.review = () => {
    const vs = (S.review && S.review.verdicts) || [];
    return vs.length
      ? `<h2>Review</h2>` +
          vs
            .map(
              (v) =>
                `<div class="card"><h3><span class="idchip">${esc(v.on)}</span><span class="st ${v.verdict === 'PASS' ? 'st-acc' : 'st-unk'}">${esc(v.verdict)}</span></h3></div>`,
            )
            .join('')
      : '';
  };
  part.env = () => '';
  part.format = '';
  part.revision = '';
  let html = '';
  for (const k of SECTIONS) {
    if (part[k]) html += part[k]();
  }
  /* rounds: what changed since the last visit (revision history, client memory) */
  const key = 'specweb:lastRev:' + (S.id || S.name);
  const last = +(localStorage.getItem(key) || 0);
  const cur = +(S.revision || 1);
  if (last && last < cur)
    html += `<div class="rounds">since your last visit: <b>revision ${last} → ${cur}</b></div>`;
  localStorage.setItem(key, String(cur));
  return html;
}

/* ── the interview ── */
function paintInterview(err) {
  const esc = (s) =>
    String(s ?? '').replace(
      /[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );
  const host = document.getElementById('qhost');
  const count = document.getElementById('qcount');
  if (approved()) {
    count.textContent = 'COMPLETE';
    host.innerHTML = `<div class="qcard approve-card">
      <div><span class="idchip">date.approved</span></div>
      <div class="qtext">The spec is approved.</div>
      <p class="note">by <b>${esc(S.date.approved.by)}</b> at ${esc(S.date.approved.at)}<br>the deliverable stage re-derived itself</p>
      <div class="summary">${clar()
        .map(
          (q) =>
            `<div class="row"><span class="idchip">${esc(q.id)}</span><span>${q.status === 'resolved' ? esc(q.answer) : '<i>unknown — recorded honestly</i>'}</span></div>`,
        )
        .join('')}</div>
    </div>`;
    return;
  }
  const qs = openQs();
  if (!qs.length) {
    count.textContent = 'READY';
    host.innerHTML = `<div class="qcard approve-card">
      <div class="qtext">All questions resolved.</div>
      <p class="note">one act remains: approve the spec as a whole.<br>recorded with a human claim and a timestamp.</p>
      <div class="qnav" style="justify-content:center"><button type="button" class="act b-approve" id="bApprove">approve this spec ⏎</button></div>
    </div>`;
    document.getElementById('bApprove').addEventListener('click', doApprove);
    return;
  }
  if (i >= qs.length) i = qs.length - 1;
  const q = qs[i];
  if (q.id !== curQid) {
    sel = selFor(q);
    curQid = q.id;
  }
  count.textContent = `QUESTION ${i + 1} OF ${qs.length}`;
  const opts =
    q.kind === 'choice' && q.options
      ? q.options
          .map(
            (
              o,
              n,
            ) => `<div class="opt ${n === sel ? 'sel' : ''}" data-n="${n}" tabindex="${n === sel ? '0' : '-1'}" role="radio" aria-checked="${n === sel}">
        <span class="dot"></span><span class="lbl">${esc(o)}</span><span class="key">${n + 1}</span></div>`,
          )
          .join('')
      : `<textarea id="open" aria-labelledby="current-question" placeholder="type your answer — Enter submits, Shift+Enter for a new line"></textarea>`;
  host.innerHTML = `<div class="qcard">
    <div><span class="idchip">${esc(q.id)}</span><span class="st ${q.unknown ? 'st-unk' : 'st-open'}">${q.unknown ? 'unknown' : 'open'}</span></div>
    <div class="qtext" id="current-question" role="heading" aria-level="2">${esc(q.question)}</div>
    <div class="blocks">owner: ${esc(q.owner || 'human:owner')}${q.unknown ? ' · answered unknown; still gating' : ''}</div>
    <div ${q.kind === 'choice' ? 'role="radiogroup" aria-labelledby="current-question"' : ''}>${opts}</div>
    ${q.unknown ? `<div class="ansline"><span class="st st-unk">unknown</span> <span class="note">recorded honestly — you may answer for real below</span></div>` : ''}
    ${err ? `<div class="err" role="alert">${esc(err)}</div>` : ''}
    <div class="qnav">
      <button type="button" class="act b-back" id="bBack">← back</button>
      <button type="button" class="act b-idk" id="bIdk">I don't know</button>
      <button type="button" class="act b-next" id="bSubmit">Submit answer</button>
    </div>
  </div>`;
  document.querySelectorAll('.opt').forEach((o) =>
    o.addEventListener('click', () => {
      if (saving) return;
      sel = +o.dataset.n;
      paintInterview();
      document.querySelector('.opt.sel')?.focus();
    }),
  );
  const ta = document.getElementById('open');
  if (ta) {
    ta.value = localAnswers.get(q.id) || '';
    ta.oninput = () => localAnswers.set(q.id, ta.value);
    ta.focus();
  }
  document.getElementById('bBack').disabled = i === 0;
  document.getElementById('bBack').addEventListener('click', () => {
    if (i > 0) {
      i--;
      sel = 0;
      paintInterview();
    }
  });
  document.getElementById('bSubmit').addEventListener('click', () => submit(ta ? ta.value : null));
  document.getElementById('bIdk').addEventListener('click', () => act('unknown', q));
}

function setSaving(on) {
  saving = on;
  document.getElementById('qhost').setAttribute('aria-busy', String(on));
  document.querySelectorAll('#qhost button, #qhost textarea').forEach((node) => {
    if (on) node.disabled = true;
  });
  document.getElementById('room-status').textContent = on ? 'Saving…' : '';
}
async function act(kind, q, extra) {
  if (saving) return;
  setSaving(true);
  try {
    const ev = { kind, by: BY, q: q.id };
    Object.assign(ev, extra || {});
    await emit(ev);
    localAnswers.delete(q.id);
    sel = 0;
    paintInterview();
  } catch (e) {
    paintInterview(e.message);
  } finally {
    setSaving(false);
  }
}
async function submit(typed) {
  const q = openQs()[i];
  if (!q) return;
  if (q.kind === 'choice') {
    const opt = q.options[sel];
    await act('choice', q, { option: opt, text: opt });
  } else {
    if (!(typed || '').trim()) {
      paintInterview("the answer is empty — type something or press I don't know");
      return;
    }
    await act('answer', q, { text: typed.trim() });
  }
}
async function doApprove() {
  if (saving) return;
  setSaving(true);
  try {
    await emit({ kind: 'approve', by: BY });
    paintInterview();
  } catch (e) {
    paintInterview(e.message);
  } finally {
    setSaving(false);
  }
}

/* ── keyboard: j/k move, 1-9 pick, Enter submit/approve ── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' || saving) return;
  const qs = openQs();
  const inTa = document.activeElement && document.activeElement.tagName === 'TEXTAREA';
  if (approved()) return;
  if (!qs.length && e.key === 'Enter') {
    doApprove();
    e.preventDefault();
    return;
  }
  if (!qs.length) return;
  /* Enter submits — from the textarea (Shift+Enter makes a newline) or anywhere */
  if (e.key === 'Enter') {
    if (inTa && e.shiftKey) return; // newline
    submit(inTa ? document.activeElement.value : null);
    e.preventDefault();
    return;
  }
  if (inTa) return; // typing: arrows and digits belong to the text
  const q = qs[Math.min(i, qs.length - 1)];
  if (
    (e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
    q?.kind === 'choice' &&
    document.activeElement?.classList.contains('opt')
  ) {
    sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + q.options.length) % q.options.length;
    paintInterview();
    document.querySelector('.opt.sel')?.focus();
    e.preventDefault();
  } else if (e.key === 'ArrowRight' || e.key === 'k') {
    if (i < qs.length - 1) {
      i++;
      paintInterview();
    }
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' || e.key === 'j') {
    if (i > 0) {
      i--;
      paintInterview();
    }
    e.preventDefault();
  } else if (/^[1-9]$/.test(e.key) && q && q.kind === 'choice') {
    const n = +e.key - 1;
    if (n < q.options.length) {
      sel = n;
      paintInterview();
    }
  }
});

/* ── boot ── */
function renderAll() {
  paintHeader();
  document.getElementById('dossier').innerHTML = dossierHTML();
  paintInterview();
}

(async function boot() {
  try {
    await loadSpec();
    renderAll();
  } catch (e) {
    const esc = (s) =>
      String(s ?? '').replace(
        /[&<>"]/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
      );
    document.getElementById('qhost').innerHTML =
      `<div class="qcard"><div class="err">${esc(String(e))}</div></div>`;
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
