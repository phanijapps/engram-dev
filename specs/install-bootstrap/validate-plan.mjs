import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadPackWithMeta, planDigest } from '../../treadle/packages/core/dist/src/index.js';
const dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(dir, '../..');
const require = createRequire(join(root, 'treadle/package.json'));
const Ajv = require('ajv/dist/2020.js').default;
const schema = JSON.parse(readFileSync(join(root, 'wiki/assets/contracts/specpack-owner-workflow.schema.json'), 'utf8'));
const raw = JSON.parse(readFileSync(join(dir, 'install-bootstrap.json'), 'utf8'));
const ajv = new Ajv({ strict: false, allErrors: true });
ajv.addFormat('date-time', (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute, second, zoneHour, zoneMinute] = match;
  const leap = Number(year) % 4 === 0 && (Number(year) % 100 !== 0 || Number(year) % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 &&
    Number(day) <= days[Number(month) - 1] && Number(hour) <= 23 &&
    Number(minute) <= 59 && Number(second) <= 59 &&
    (zoneHour === undefined || (Number(zoneHour) <= 23 && Number(zoneMinute) <= 59));
});
const validator = ajv.compile(schema);
const loaded = loadPackWithMeta(dir);
if (!loaded.ok) throw Error(JSON.stringify(loaded));
const { doc, path } = loaded.value;
const artifacts = Object.values(doc.artifacts).map((artifact) => ({ file: artifact.file,
  matches: createHash('sha256').update(readFileSync(join(dir, artifact.file))).digest('hex') === artifact.sha256 }));
const seen = new Set();
const todo = [...doc.tasks];
while (todo.length) {
  const next = todo.findIndex((task) => task.needs.every((id) => seen.has(id)));
  if (next < 0) throw Error('Invalid task DAG');
  seen.add(todo.splice(next, 1)[0].id);
}
const commands = [];
let logs = '';
for (const args of [['do', 'check', dir], ['do', 'status', dir], ['do', 'where', root, '--json']]) {
  const result = spawnSync('wukong', args, { cwd: root, encoding: 'utf8' });
  commands.push({ command: 'wukong', args, exit: result.status });
  logs += `${JSON.stringify({ command: 'wukong', args, exit: result.status })}\n${result.stdout}${result.stderr}\n`;
}
const result = { at: new Date().toISOString(), revision: doc.revision,
  schema: validator(raw), errors: validator.errors, artifacts,
  dag_order: [...seen], structural_entry: doc.tasks.filter((task) => !task.needs.length).map((task) => task.id),
  plan_digest: planDigest(doc, path), commands, decisions: doc.plan.decisions.map((decision) => ({ id: decision.id, status: decision.status })),
  owner_acts: doc.workflow.acts.length, source_implementation: 'not started' };
writeFileSync(join(dir, 'checks/plan-validation.json'), JSON.stringify(result, null, 2) + '\n');
writeFileSync(join(dir, 'checks/plan-validation.log'), logs);
if (!result.schema || artifacts.some((artifact) => !artifact.matches) || commands.some((command) => command.exit !== 0) || !result.plan_digest.ok) {
  throw Error(JSON.stringify(result));
}
console.log('Schema, artifacts, DAG, alignment and discovery pass. Decisions proposed; no owner Start.');
