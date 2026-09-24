// English QA: node qa/en.mjs  (needs http.server on 8080). Reports leftover Chinese.
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const leftovers=new Map();const errors=[];
async function grab(p,tag){const r=await p.evaluate(()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const v=n.nodeValue;if(/[\u3400-\u9fff]/.test(v)){const e=n.parentElement;if(e&&e.closest('script,style'))continue;const vis=e&&e.getClientRects().length>0;out.push((vis?'V ':'h ')+v.trim().slice(0,120));}}for(const e of document.querySelectorAll('[title],[aria-label],[placeholder]'))for(const a of ['title','aria-label','placeholder']){const v=e.getAttribute(a);if(v&&/[\u3400-\u9fff]/.test(v))out.push('A '+v.slice(0,120));}return out;});for(const s of r){if(!leftovers.has(s))leftovers.set(s,tag);}}
async function session(tag,{cash,fresh=false,seed,steps=[]}){
 const c=await browser.newContext({viewport:{width:1280,height:800}});
 if(!fresh){const run=newRun();run.cash=cash*100;if(seed)seed(run);markPeak(run);const v=run.life.v9||(run.life.v9={});v.story={seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{t0:'night'}};
  await c.addInitScript(s=>{localStorage.setItem('upshift-save-v3',JSON.stringify(s));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true,lang:'en',introLang:true}});}
 const p=await c.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>errors.push(tag+': '+e.message));
 try{await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
  const l=p.locator('#v8-intro [data-l="en"]');if(await l.count())await l.click({timeout:60000});await p.waitForTimeout(600);await grab(p,tag+'-intro');
  if(fresh)await p.screenshot({path:`qa/en-${tag}-intro.png`,timeout:60000});
  const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(900);await grab(p,tag+'-menu');
  if(fresh)await p.screenshot({path:`qa/en-${tag}-menu.png`,timeout:60000});
  await p.locator('[data-action="onboard-play"]').click({timeout:20000});await p.waitForTimeout(2500);await grab(p,tag+'-game');
  await p.screenshot({path:`qa/en-${tag}.png`,timeout:60000});
  for(const [a,v] of steps){await p.evaluate(([a,v])=>{const b=[...document.querySelectorAll(`[data-action="${a}"]`+(v!=null?`[data-value="${v}"]`:''))].find(b=>b.offsetParent!==null)||document.querySelector(`[data-action="${a}"]`);b?.click();},[a,v]);await p.waitForTimeout(1100);await grab(p,tag+'-'+a);await p.screenshot({path:`qa/en-${tag}-${a}.png`,timeout:60000});await p.keyboard.press('Escape');await p.waitForTimeout(300);}
  const miss=await p.evaluate(()=>[...(globalThis.__i18nMissing||[])]);for(const m of miss)if(!leftovers.has('M '+m))leftovers.set('M '+m,tag);
 }catch(e){errors.push(tag+' STEP: '+e.message.split('\n')[0]);}
 await c.close();console.log('done',tag);
}
await session('fresh',{fresh:true});
await session('poor',{cash:100,steps:[['menu'],['settings'],['help']]});
await session('mid',{cash:6000,steps:[['map'],['history'],['collection'],['wardrobe']]});
await session('rich',{cash:9000000,steps:[['menu'],['leaderboard'],['music']]});
await browser.close();
import fs from 'fs';
const lines=[...leftovers].map(([s,t])=>t+'\t'+s);fs.writeFileSync('qa/en-leftovers.txt',lines.join('\n'));
console.log('leftover lines',lines.length);console.log(errors.join('\n'));
