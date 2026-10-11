import {createRequire} from 'node:module';import {writeFileSync,mkdirSync} from 'node:fs';
const require=createRequire('/home/videogamer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');const {chromium}=require('playwright');
const url=process.argv[2], output=new URL('./rendered/',import.meta.url);mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const captures=[],errors=[],network=[];
try{
 for(const width of [600,601,901,375,1280])for(const height of [600,900]){
  const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>network.push(new URL(r.url()).origin));
  await page.goto(url);await page.locator('#feedback-comment').waitFor();await page.waitForFunction(()=>!document.querySelector('#feedback-host').hasAttribute('aria-busy'));
  const base={route:new URL(url).origin+new URL(url).pathname,'viewport-width':await page.evaluate(()=>innerWidth),'viewport-height':height,'page-scrollable':await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight)?'yes':'no'};
  for(const state of ['rest','scrolled']){
   if(state==='scrolled' && base['page-scrollable']==='yes')await page.evaluate(()=>scrollTo(0,Math.min(500,document.documentElement.scrollHeight-innerHeight)));
   const file=`${width}-${height}-${state}.png`;await page.screenshot({path:new URL(file,output).pathname});captures.push({...base,file:'checks/rendered/'+file,'scroll-position':await page.evaluate(()=>scrollY),horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  }
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:901,height:900}});await page.goto(url);await page.locator('#feedback-comment').waitFor();
 await page.getByRole('button',{name:/Comment on after line 3 /}).focus();await page.keyboard.press('Enter');
 const focus=await page.evaluate(()=>({active:document.activeElement.id,outline:getComputedStyle(document.activeElement).outline,offset:getComputedStyle(document.activeElement).outlineOffset}));
 await page.locator('#feedback-comment').fill('Keyboard review fixture');await page.getByRole('button',{name:'Save draft comment'}).focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('#feedback-status').textContent.includes('Draft saved'));
 await page.locator('#feedback-submit').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('#feedback-status').textContent.includes('Feedback submitted'));
 const targets=await page.locator('#feedback-host button,#feedback-host input,#feedback-host textarea,#feedback-host select').evaluateAll(nodes=>nodes.filter(n=>!n.disabled).map(n=>{const r=n.getBoundingClientRect();return{name:n.textContent||n.getAttribute('aria-label')||n.id,width:r.width,height:r.height};}));
 writeFileSync(new URL('./rendered-captures.json',import.meta.url),JSON.stringify({observed_at:new Date().toISOString(),browser:await browser.version(),basis:'declared-breakpoints',breakpoints:[601,901],minimum:'none-declared',captures,keyboard:{focus,submitted:true},targets,errors,network:[...new Set(network)],fixture:'synthetic UI verification; no native human witness'},null,2)+'\n');console.log(JSON.stringify({captures:captures.length,keyboardSubmitted:true,errors,overflow:captures.filter(c=>c.horizontalOverflow).map(c=>c.file)}));
}finally{await browser.close();}
