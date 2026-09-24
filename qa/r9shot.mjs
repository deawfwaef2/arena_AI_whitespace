// Round 9 visual check: node qa/r9shot.mjs [names]   (needs http.server on 8080). SHOT_LANG=en|zh
import {chromium,devices} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
import * as X from '../src/v12-core.js';
import {createRegionalStory} from '../src/regional-stories.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const errors=[];const only=process.argv.slice(2);const lang0=process.env.SHOT_LANG||'en';const missing=new Set();
export async function shot(name,{cash=100,energy=200,seed,after,lang=lang0,q='',phone=false,seen=true,fresh=false}={}){
 if(only.length&&!only.includes(name))return;
 const c=await browser.newContext(phone?{...devices['iPhone 13 landscape']}:{viewport:{width:1280,height:800},deviceScaleFactor:1});
 const run=newRun();run.cash=cash*100;run.life.energy=energy;run.life.v9={story:{seen:seen?[0,1,2,3,4,5,6,7,8,9,10]:[],picks:seen?{t0:'night'}:{}},maxTier:seen?10:0};if(seed)seed(run);markPeak(run);
 if(!fresh)await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true,lang,introLang:true}});
 const p=await c.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>errors.push(name+': '+e.message));
 try{await p.goto('http://127.0.0.1:8080/'+q,{waitUntil:'load',timeout:120000});
  const l=p.locator(`#v8-intro [data-l="${lang}"]`);if(await l.count())await l.click({timeout:60000});
  if(!fresh){const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(900);
  await p.locator('[data-action="onboard-play"]').click({timeout:20000});await p.waitForTimeout(2200);}
  if(after)await after(p);
 }catch(e){errors.push(name+' STEP: '+e.message.split('\n')[0]);}
 try{await p.screenshot({path:'qa/r9-'+name+'.png',timeout:60000});}catch(e){errors.push(name+' SHOT: '+e.message.split('\n')[0]);}
 try{for(const m of await p.evaluate(()=>[...(globalThis.__i18nMissing||[])]))missing.add(m);}catch{}
 await c.close();console.log('shot',name);
}
const R=()=>0.3;
await shot('story',{cash:100,seen:false,after:async p=>{await p.waitForTimeout(6000);}});
await shot('storyzh',{cash:100,seen:false,lang:'zh',after:async p=>{await p.waitForTimeout(6000);}});
await shot('region',{cash:900,seed:r=>{r.page=5;r.offer=createRegionalStory(r,1,R);}});
await shot('shop',{cash:800,seed:r=>{r.offer=X.shopOffer(r,R,'kiosk');}});
await shot('rest',{cash:5000,energy:0,q:'?adtest=1',after:async p=>{await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-mech="rest"]')].find(b=>b.offsetParent);b?.click();});await p.waitForTimeout(1500);for(let i=0;i<3;i++){await p.evaluate(()=>{const b=[...document.querySelectorAll('#modal-card [data-action]')].find(b=>b.offsetParent&&!/close/.test(b.dataset.action));b?.click();});await p.waitForTimeout(900);}await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-action="life-pay"]')].find(b=>b.offsetParent);b?.click();});await p.waitForTimeout(1500);for(let i=0;i<3;i++){await p.evaluate(()=>{const b=[...document.querySelectorAll('#modal-card [data-action]')].find(b=>b.offsetParent&&!/close/.test(b.dataset.action));b?.click();});await p.waitForTimeout(700);}await p.waitForTimeout(1200);}});
await shot('ad',{cash:5000,q:'?adtest=1',seed:r=>{r.offer=X.adOffer(r,R);}});
await shot('intro',{fresh:true,after:async p=>{await p.waitForTimeout(6000);}});
await shot('phone',{cash:5000,phone:true});
console.log('ERRORS',JSON.stringify(errors,null,1));console.log('I18N-MISSING',JSON.stringify([...missing].slice(0,80),null,1));await browser.close();
