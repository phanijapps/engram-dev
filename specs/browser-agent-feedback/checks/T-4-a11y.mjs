import {createRequire} from 'node:module';import {writeFileSync} from 'node:fs';
const require=createRequire('/home/videogamer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:901,height:900}});await page.goto(process.argv[2]);await page.locator('#feedback-comment').waitFor();await page.addScriptTag({path:'/tmp/wukong-feedback-ui-tools/node_modules/axe-core/axe.min.js'});
const result=await page.evaluate(async()=>await axe.run(document.querySelector('#feedback-host'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
writeFileSync(new URL('./T-4-a11y-results.json',import.meta.url),JSON.stringify({observed_at:new Date().toISOString(),scope:'Feedback component; synthetic fixture',...result},null,2)+'\n');console.log(JSON.stringify({violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:result.incomplete.length}));if(result.violations.length)process.exitCode=1;
}finally{await browser.close();}
