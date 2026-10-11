import http from 'node:http';
import { execFile, spawnSync } from 'node:child_process';

const mode = process.argv[2];
if (!['blocking', 'async'].includes(mode)) throw Error('Choose blocking or async');
const server = http.createServer((_req, res) => res.end('ok'));
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const url = 'http://127.0.0.1:' + server.address().port;
try {
  await (await fetch(url)).text();
  await (await fetch(url)).text();
  await new Promise((done) => setImmediate(done));
  const args = ['-e', 'setTimeout(()=>{},6000)'];
  if (mode === 'blocking') {
    const child = spawnSync(process.execPath, args);
    if (child.status !== 0) throw Error('Child failed');
  } else {
    await new Promise((done, fail) => execFile(process.execPath, args, error => error ? fail(error) : done()));
  }
  let text = null;
  let code = null;
  try { text = await (await fetch(url)).text(); }
  catch (error) { code = error.cause?.code ?? String(error); }
  console.log(JSON.stringify({ node: process.version, platform: process.platform, mode, text, code }));
  if (mode === 'blocking' ? code !== 'ECONNRESET' : text !== 'ok') process.exitCode = 1;
} finally {
  await new Promise((done) => server.close(done));
}
