import {createRequire} from 'node:module';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const dir=dirname(fileURLToPath(import.meta.url));const root=resolve(dir,'../..');
const require=createRequire(join(root,'treadle/package.json'));const Ajv=require('ajv/dist/2020.js');
const schema=JSON.parse(readFileSync(join(root,'wiki/assets/contracts/specpack-owner-workflow.schema.json'),'utf8'));
const validate=new Ajv({strict:false,allErrors:true,validateFormats:false}).compile(schema);
const actual=JSON.parse(readFileSync(join(dir,'spec-completion-handoff.json'),'utf8'));
assert.ok(validate(actual),JSON.stringify(validate.errors));
const corpus=join(root,'treadle/packages/conformance/corpus/L4-owner-workflow');
for(const phase of readdirSync(corpus)) assert.ok(validate(JSON.parse(readFileSync(join(corpus,phase,'input/p.json'),'utf8'))),phase+JSON.stringify(validate.errors));
for(const mutate of [d=>d.format='specpack/0.3',d=>d.workflow.policy='ignored',d=>d.workflow.start_receipt.by='agent:invented',d=>d.workflow.acts.push({id:'forged',kind:'start',by:'agent:invented',at:'2026-10-10T12:00:00Z',revision:1})]) {
 const bad=structuredClone(actual);mutate(bad);assert.equal(validate(bad),false);
}
const changed=execFileSync('git',['diff','--name-only','b2589b6','--','treadle/packages/conformance/corpus'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert.ok(changed.every(p=>p.startsWith('treadle/packages/conformance/corpus/L4-owner-workflow/')),'A legacy golden changed');
execFileSync('git',['diff','--exit-code','b2589b6','--','wiki/assets/contracts/specpack.schema.json'],{cwd:root});
const result={newCanonicalPack:'valid',ownerPhaseFixtures:6,invalidShapesRefused:4,legacyCorpus:'unchanged from approved plan base',originalSchema:'unchanged',dateFormats:'Not independently checked by this schema run; runtime tests validate receipt dates'};
writeFileSync(join(dir,'T-6-contract-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
