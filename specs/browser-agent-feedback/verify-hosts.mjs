/** Evidence admission only: never manufactures UI or native-host witnesses. */
import {readFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';import {resolve,dirname} from 'node:path';
const home=dirname(fileURLToPath(import.meta.url)),root=resolve(home,'../..');
const read=(path)=>JSON.parse(readFileSync(resolve(home,path),'utf8'));
const requireValue=(ok,message)=>{if(!ok)throw Error(message);};
const hash=(path)=>createHash('sha256').update(readFileSync(path)).digest('hex');
function ui(){
 const evidence=read('checks/ui-witness.json'),captures=read('checks/rendered-captures.json');
 requireValue(evidence.format==='feedback-ui-witness/1'&&evidence.inspection.state==='completed'&&evidence.inspection.verdict==='pass','Rendered inspection must be completed and pass');
 requireValue(evidence.observed_at&&evidence.review&&evidence.review.by&&evidence.review.file,'Missing observed independent rendered review');
 requireValue(existsSync(resolve(home,evidence.review.file)),'Review evidence is missing');
 for(const [file,digest]of Object.entries(evidence.sources))requireValue(hash(resolve(root,file))===digest,`UI source changed after witness: ${file}`);
 for(const width of [600,601,901])for(const height of [600,900]){
  const rest=captures.captures.find(c=>c['viewport-width']===width&&c['viewport-height']===height&&c['scroll-position']===0);
  requireValue(rest,'Missing at-rest capture');
  requireValue(rest['page-scrollable']==='no'||captures.captures.some(c=>c['viewport-width']===width&&c['viewport-height']===height&&c['scroll-position']>0),'Missing attained scroll capture');
 }
 for(const c of captures.captures){requireValue(c.route&&!/[?#]/.test(c.route)&&['yes','no'].includes(c['page-scrollable']),'Malformed capture identity');requireValue(existsSync(resolve(home,c.file)),'Capture image missing');requireValue(!c.horizontalOverflow,'Rendered horizontal overflow');}
 requireValue(captures.keyboard.submitted&&captures.keyboard.focus.active==='feedback-comment','Keyboard loop missing');
 requireValue(captures.targets.every(t=>t.width>=24&&t.height>=24),'Undersized interactive target');
 requireValue(!captures.errors.length&&evidence.html.exit===0&&evidence.a11y.violations===0,'UI checks failed');
 console.log('UI witness: completed/pass; structural HTML, accessibility subset, keyboard, targets and rendered channels verified');
}
ui();
if(!process.argv.includes('--ui-only'))throw Error('Native Claude/Codex/Pi human feedback witnesses are not recorded yet; T-6 remains pending');
