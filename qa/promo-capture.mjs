// Captures 1920x1080 frames for the promo trailers: node qa/promo-capture.mjs  (http.server on 8080)
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
import * as X from '../src/v12-core.js';
import fs from 'node:fs';
fs.mkdirSync('/tmp/promo',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const only=process.argv.slice(2);
async function shot(name,{cash=100,energy=200,city='taipei',seed,after,q='',wait=2500}={}){
 if(only.length&&!only.includes(name))return;
 const c=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1.5});
 const run=newRun();run.cash=cash*100;run.life.energy=energy;run.life.city=city;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{t0:'night'}},maxTier:10};if(seed)seed(run);markPeak(run);
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:!!process.env.LOW,motion:true,lang:'en',introLang:true,coachDone:true}});
 const p=await c.newPage();
 try{await p.goto('http://127.0.0.1:8080/'+q,{waitUntil:'load',timeout:120000});
  const l=p.locator('#v8-intro [data-l="en"]');if(await l.count())await l.click({timeout:60000});
  const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(900);
  await p.locator('[data-action="onboard-play"]').click({timeout:60000});await p.waitForTimeout(wait);
  await p.evaluate(()=>document.querySelectorAll('.r9-coach,[class*="coach"]').forEach(e=>{if(e.querySelector('button'))e.remove();}));
  if(after)await after(p);
 }catch(e){console.log(name,'ERR',e.message.split('\n')[0]);}
 await p.screenshot({path:`/tmp/promo/${name}.png`,timeout:120000});await c.close();console.log('shot',name);}
const R=()=>0.3;
await shot('poor',{cash:100});
await shot('invest',{cash:4000,city:'taipei'});
await shot('tokyo',{cash:40000,city:'tokyo'});
await shot('vegas',{cash:400000,city:'vegas',seed:r=>{r.offer={id:'c1',type:'v9-place',place:'casino',opts:['roulette','slots','poker'],settled:false,city:'vegas',rarity:'rare'};}});
await shot('hosp',{cash:60000,city:'singapore',seed:r=>{r.estate={health:1,maxHealth:3};r.offer={id:'h1',type:'v9-place',place:'hospital',opts:['clinic','specialist','checkup'],settled:false,city:'singapore',rarity:'rare'};}});
await shot('biotech',{cash:2000000,city:'newyork',seed:r=>{r.estate={health:2,maxHealth:3};r.offer={id:'p3',type:'v9-partner',partner:'biotech',fee:9000,settled:false,city:'newyork',rarity:'epic'};}});
await shot('dept',{cash:3000000,city:'newyork',seed:r=>{r.offer=X.shopOffer(r,R,'dept');}});
await shot('monaco',{cash:2000000000,city:'monaco'});
await shot('rest',{cash:5000,energy:0,q:'?adtest=1',after:async p=>{await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-mech="rest"]')].find(b=>b.offsetParent);b?.click();});await p.waitForTimeout(1500);for(let i=0;i<3;i++){await p.evaluate(()=>{const b=[...document.querySelectorAll('#modal-card [data-action]')].find(b=>b.offsetParent&&!/close/.test(b.dataset.action));b?.click();});await p.waitForTimeout(900);}await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-action="life-pay"]')].find(b=>b.offsetParent);b?.click();});await p.waitForTimeout(1500);for(let i=0;i<3;i++){await p.evaluate(()=>{const b=[...document.querySelectorAll('#modal-card [data-action]')].find(b=>b.offsetParent&&!/close/.test(b.dataset.action));b?.click();});await p.waitForTimeout(700);}await p.waitForTimeout(1200);}});
await browser.close();
