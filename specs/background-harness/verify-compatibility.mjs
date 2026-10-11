import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const report = [];
for (const host of ['codex', 'claude', 'pi']) {
  const r = spawnSync(host, ['--version'], { encoding: 'utf8', timeout: 15000 });
  report.push({ host, platform: process.platform, command: `${host} --version`, exit: r.status, version: r.stdout?.trim(), error: r.error?.message ?? null });
}
const contract = readFileSync(new URL('compatibility.md', import.meta.url), 'utf8');
if (!contract.includes('SessionStart') || !contract.includes('ctx.cwd') || !contract.includes('trust')) throw Error('Missing adapter contract');
writeFileSync(new URL('compatibility-evidence.json', import.meta.url), JSON.stringify({ at: new Date().toISOString(), scope: 'Published contracts and local executable versions only; real-host adapter and native OS witnesses pending T-12', observations: report }, null, 2) + '\n');
console.log('Contract checked:', fileURLToPath(new URL('compatibility.md', import.meta.url)));
console.log(JSON.stringify(report));
if (report.some(r => r.exit !== 0)) process.exitCode = 1;
