/** Real host witness contract. Missing or unrun combinations refuse completion. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { loadPackWithMeta } from '../../treadle/packages/core/dist/src/index.js';

const dir = fileURLToPath(new URL('.', import.meta.url));
const loaded = loadPackWithMeta(dir);
assert(loaded.ok, loaded.message);
const task = loaded.value.doc.tasks.find((t) => t.id === process.argv[2]);
assert(task, 'Provide a canonical backlog task id, T-1 through T-4');
for (const surface of task.surfaces) {
  for (const platform of task.platforms) {
    const file = join(dir, 'evidence', surface, `${platform}.json`);
    const result = JSON.parse(readFileSync(file, 'utf8'));
    assert.equal(result.format, 'host-journey/1');
    assert.equal(result.surface, surface);
    assert.equal(result.platform, platform);
    assert.equal(result.kind, 'real-host');
    assert(typeof result.hostVersion === 'string' && result.hostVersion.trim());
    assert(Number.isFinite(Date.parse(result.at)));
    for (const check of task.checks) {
      const row = result.checks?.find((r) => r.name === check);
      assert(row, `Missing ${check}: ${file}`);
      assert(typeof row.command === 'string' && row.command.trim());
      assert.equal(row.exit, 0);
      assert(typeof row.observation === 'string' && row.observation.trim());
      if (check === 'human activation/trust') {
        assert(/^human:\S+$/.test(row.by), 'Real host trust needs a human claim');
        assert(typeof row.evidence === 'string' && row.evidence.trim());
      }
    }
  }
}
console.log(`${task.id}: PASS — all required actual host journeys supplied`);
