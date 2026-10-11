/* Browser code never receives the control credential or an enrollment action. */
let selected;
const status = document.getElementById('status');
async function load(path) {
  const response = await fetch(path);
  if (!response.ok) throw Error((await response.json()).error || 'Could not load project');
  return response;
}
function showError(error) {
  status.textContent = error.message;
  status.className = 'error';
}
async function concepts(query = '') {
  const path = `/projects/${selected.id}/wiki`;
  const rows = await (
    await load(query ? `${path}/search?q=${encodeURIComponent(query)}` : path)
  ).json();
  document.getElementById('concepts').replaceChildren(
    ...rows.map((row) => {
      const button = document.createElement('button');
      button.textContent = row.title || row.cid;
      button.onclick = async () => {
        try {
          const md = await (await load(`${path}/read?cid=${encodeURIComponent(row.cid)}`)).text();
          document.getElementById('preview').srcdoc =
            '<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:"><style>body{font:16px/1.5 system-ui;padding:20px;color:#222}pre{white-space:pre-wrap}</style>' +
            marked.parse(md.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, ''));
          status.textContent = `Opened ${row.title || row.cid}`;
        } catch (e) {
          showError(e);
        }
      };
      return button;
    }),
  );
  status.textContent = `${rows.length} concepts in ${selected.label}`;
}
document.getElementById('search').onsubmit = async (event) => {
  event.preventDefault();
  try {
    await concepts(document.getElementById('query').value);
  } catch (e) {
    showError(e);
  }
};
(async () => {
  try {
    const rows = await (await load('/projects')).json();
    status.textContent = rows.length
      ? `${rows.length} enrolled projects`
      : 'Connect a project with treadle project connect <workspace>, or install its harness.';
    for (const row of rows) {
      const card = document.createElement('article');
      card.className = 'card';
      const title = document.createElement('h2');
      title.textContent = row.label;
      const root = document.createElement('p');
      root.className = 'path';
      root.textContent = row.workspace;
      card.append(title, root);
      if (!row.available) {
        const error = document.createElement('p');
        error.textContent = row.error || 'Project unavailable. Reconnect its current location.';
        card.append(error);
      } else {
        if (row.specsAvailable) {
          const link = document.createElement('a');
          link.href = `/projects/${row.id}/library/`;
          link.textContent = 'Open specs';
          card.append(link);
        } else {
          const p = document.createElement('p');
          p.textContent = 'No specs yet. Ask your agent to create an owner-gated spec.';
          card.append(p);
        }
        if (row.wikiAvailable) {
          const button = document.createElement('button');
          button.textContent = 'Explore knowledge';
          button.onclick = async () => {
            selected = row;
            document.getElementById('knowledge').hidden = false;
            document.getElementById('wiki-title').textContent = `${row.label} knowledge`;
            document.getElementById('query').value = '';
            try {
              await concepts();
              document.getElementById('query').focus();
            } catch (e) {
              showError(e);
            }
          };
          card.append(button);
        }
      }
      document.getElementById('projects').append(card);
    }
  } catch (e) {
    showError(e);
  }
})();
