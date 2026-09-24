// Round 10 visual check: node qa/r10shot.mjs [names]  (needs http.server on 8080)
import {chromium,devices} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
import * as X from '../src/v12-core.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const errors=[];const only=process.argv.slice(2);
async function shot(name,{cash=100,energy=200,seed,after,lang='en',phone=false}={}){
 if(only.length&&!only.includes(name))return;
 const c=await browser.newContext(phone?{...devices['iPhone 13 landscape']}:{viewport:{width:1280,height:800}});
 const run=newRun();run.cash=cash*100;run.life.energy=energy;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{t0:'night'}},maxTier:10};if(seed)seed(run);markPeak(run);
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true,lang,introLang:true,coachDone:true}});
 const p=await c.newPage();p.on('pageerror',e=>errors.push(name+': '+e.message));
 try{await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
  const l=p.locator(`#v8-intro [data-l="${lang}"]`);if(await l.count())await l.click({timeout:60000});
  const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(900);
  await p.locator('[data-action="onboard-play"]').click({timeout:20000});await p.waitForTimeout(2200);
  if(after)await after(p);
 }catch(e){errors.push(name+' STEP: '+e.message.split('\n')[0]);}
 await p.screenshot({path:'qa/r10-'+name+'.png'});await c.close();console.log('shot',name);}
const R=()=>0.3;
await shot('kiosk',{cash:800,seed:r=>{r.offer=X.shopOffer(r,R,'kiosk');}});
await shot('dept',{cash:3000000,seed:r=>{r.offer=X.shopOffer(r,R,'dept');}});
await shot('hosp',{cash:5000,seed:r=>{r.estate={health:2,maxHealth:3};r.offer={id:'h1',type:'v9-place',place:'hospital',opts:['clinic','specialist','checkup'],settled:false,city:'taipei',rarity:'rare'};}});
await shot('herbal',{cash:600,seed:r=>{r.offer={id:'p1',type:'v9-partner',partner:'herbalist',fee:9000,settled:false,city:'taipei',rarity:'epic'};}});
await shot('coachdeal',{cash:9000,seed:r=>{r.estate={health:2,maxHealth:3};r.life.v9.partners={coach:{bond:1,met:1,last:1}};r.offer={id:'p2',type:'v9-pdeal',partner:'coach',settled:false,city:'taipei',rarity:'epic'};}});
await shot('biotech',{cash:2000000000,seed:r=>{r.estate={health:2,maxHealth:3};r.offer={id:'p3',type:'v9-partner',partner:'biotech',fee:9000,settled:false,city:'taipei',rarity:'epic'};}});
console.log('ERRORS',JSON.stringify(errors,null,1));await browser.close();
