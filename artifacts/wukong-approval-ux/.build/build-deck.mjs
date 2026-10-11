import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {slides,style} from './content.mjs';
const workspaceDir=path.resolve('artifacts/wukong-approval-ux');
const SKILL_DIR='/home/videogamer/.codex/plugins/cache/openai-primary-runtime/presentations/26.1009.11318/skills/presentations';
const RUNTIME_PYTHON='/home/videogamer/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const font='Liberation Sans';
const presentation=Presentation.create({slideSize:{width:1920,height:1080}});
const HIG=[
 'https://developer.apple.com/design/human-interface-guidelines',
 'https://developer.apple.com/design/human-interface-guidelines/buttons?changes=l_8',
 'https://developer.apple.com/design/human-interface-guidelines/color?changes=_5_2',
 'https://developer.apple.com/design/human-interface-guidelines/dark-mode',
];
function text(slide,txt,x,y,w,h,size=24,color='#1d1d1f',bold=false){
 const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 s.text=txt.replace(/^[1-4]\. /,'');s.text.insets=0;s.text.style={typeface:font,fontSize:size,color,bold};return s;
}
await fs.mkdir(path.join(workspaceDir,'.build','renders'),{recursive:true});
for(const [i,item] of slides.entries()){
 const slide=presentation.slides.add();slide.background.fill='#f5f5f7';
 text(slide,`${String(i+1).padStart(2,'0')}  ${item.title}`,54,38,1805,66,48,'#1d1d1f',true);
 text(slide,'READ THE ANNOTATIONS FIRST',56,125,440,28,18,'#515158',true);
 const notes=[['What the user sees',item.see],['Primary action',item.act],['Why it reduces friction',item.why],['Feedback and interaction',item.feedback]];
 let y=181;
 for(const [label,body] of notes){text(slide,label,56,y,420,30,23,'#004fa9',true);text(slide,body,56,y+39,408,133,23,'#1d1d1f');y+=190;}
 const imageFile=path.join(workspaceDir,'.build','captures',`${String(i+1).padStart(2,'0')}-${item.id}.jpg`);
 const bytes=await fs.readFile(imageFile);
 slide.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/jpeg',alt:`Annotated frontend concept of existing ${item.tab} state: ${item.title}. Illustrative content.`,fit:'contain',position:{left:503,top:166,width:1360,height:775}});
 text(slide,'SCREEN CONCEPT    1 Context    2 Content    3 Action    4 Navigation',507,125,1360,28,18,'#515158',true);
 text(slide,item.boundary,507,960,1340,76,23,'#515158');
 text(slide,'Quiet Workspace · frontend proposal · illustrative states',56,1038,1120,25,16,'#515158');
 text(slide,`${i+1} / ${slides.length}`,1800,1038,70,25,16,'#515158');
 slide.speakerNotes.text=`${item.title}\n\n${style}\n\n${notes.map(([k,v])=>k+': '+v).join('\n\n')}\n\nBoundary: ${item.boundary}\n\nDetailed behavior: Keep all existing eligibility and authority checks. Presentation is a frontend-only proposal, not shipped behavior. Do not create or mutate endpoints, fields, models, task records or owner receipts. Rearrangement, typography, status copy, native disclosures, focus and existing control placement are the only proposed changes. Existing action handlers keep their payloads and server checks. Resolve, Submit feedback, spec approval, decision acceptance, Start and Finish remain distinct acts. Preserve keyboard navigation and visible focus. Targets should remain at least 44 CSS pixels for primary actions. Use status words alongside color. Prefer short opacity changes of about 120 milliseconds, disable animation under reduced motion and restore focus on success or cancellation. Never silently submit on selection or optimistically advance an owner gate. The existing theme control keeps its preference. In dark appearance use dark neutral surfaces and readable light text, with the same hierarchy and contrast target. The deck renders the light appearance only. Any displayed counts and example wording are illustrative, not a report of the live completed pack.\n\nRepository sources at revision 2d22941c84a1362f5572e461753e29813386aadd: ${item.sources.map(s=>s.startsWith('wiki/')?s:'treadle/packages/web/src/'+s).join(', ')}\n\nDesign references: ${HIG.join('\n')}\nApple HIG informs hierarchy, descriptive actions, action feedback and status color with written labels. The exact palette, spacing and presentation layout are this proposal's design choices, not an Apple specification.`;
 const png=await presentation.export({slide,format:'png',scale:1});
 await fs.writeFile(path.join(workspaceDir,'.build','renders',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
 console.log('Rendered',i+1,item.id);
}
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL_DIR,'container_tools/artifact_tool_utils.mjs')).href);
const candidatePath=path.join(workspaceDir,'.build','candidate.pptx');
await(await PresentationFile.exportPptx(presentation)).save(candidatePath);
const finalPath=path.join(workspaceDir,'output','Wukong-Approval-UX-Reviewed.pptx');
const result=await finalizePresentation({workspaceDir,candidatePath,finalPath,pythonExecutable:RUNTIME_PYTHON,integrityValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','18288000,10287000','--validate-bullet-geometry','--validate-heading-fit'],requiredNativeTableOwnerSlides:[],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:path.join(workspaceDir,'.build','validation-reviewed.json'),explicitTotalSlideCount:slides.length});
console.log(JSON.stringify(result));
await fs.writeFile(path.join(workspaceDir,'.build','manifest.json'),JSON.stringify({slides:slides.map((s,i)=>({number:i+1,...s})),style,revision:'2d22941c84a1362f5572e461753e29813386aadd',scope:'Design artifact only. No application source or live state changed.',finalPath},null,2)+'\n');
