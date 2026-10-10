import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {savePack,type PackDoc} from '../../treadle/packages/core/src/specpack/index.ts';
import {startLibrary} from '../../treadle/packages/web/src/servers.ts';
const root=mkdtempSync(join(tmpdir(),'owner-render-'));const dir=join(root,'p');mkdirSync(dir);
const doc:PackDoc={name:'p',title:'Owner workflow',format:'specpack/0.4',revision:1,status:'active',spec:{why:'Keep owner approval clear',requirements:[],clarifications:[]},plan:{decisions:[{id:'D-1',decision:'Require owner permission before implementation',status:'accepted',accepted_by:'human:owner'}]},artifacts:{},tasks:[{id:'T-1',title:'Implement the agreed plan',detail:'Execute one task at a time. Record its check before continuing.',status:'todo',verify:{cmd:'true',expect:'exit 0'},context:{touch:[]},requires_decisions:['D-1']}],workflow:{policy:'owner-gated/1',plan:1,phase_questions:{spec:[]},acts:[],pending_audit:[]}};
for(const id of ['brief','spec','design','plan']){writeFileSync(join(dir,id+'.md'),'# Owner workflow\n\nReview the requirement, brief, spec and task plan.\n\n'+Array.from({length:14},(_,i)=>`## Review point ${i+1}\n\nThe owner accepts design decisions before starting implementation. Task checks and independent review precede final completion.\n`).join('\n'));doc.artifacts![id]={file:id+'.md'};}
savePack(doc,join(dir,'p.json'),{at:new Date().toISOString()});
const lib=await startLibrary(root,{port:0});console.log(lib.url);console.log(root);
