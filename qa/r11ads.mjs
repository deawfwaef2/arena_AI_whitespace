// R11 ad nodes visual check: node qa/r11ads.mjs  (http.server 8080)
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
import * as X from '../src/v12-core.js';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const errs=[];const only=process.argv.slice(2);
async function shot(name,{cash=900,lang='en',seed,after,q='?adtest=1'}={}){if(only.length&&!only.includes(name))return;
 const c=await b.newContext({viewport:{width:1327,height:719}});
 const run=newRun();run.cash=cash*100;run.life.energy=150;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{t0:'night'}},maxTier:10};if(seed)seed(run);markPeak(run);
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true,lang,introLang:true,r9coachDone:true}});
 const p=await c.newPage();p.on('pageerror',e=>errs.push(name+': '+e.message));
 try{await p.goto('http://127.0.0.1:8080/'+q,{waitUntil:'load',timeout:120000});
 const l=p.locator(`#v8-intro [data-l="${lang}"]`);if(await l.count())await l.click({timeout:60000});
 const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(900);
 await p.locator('[data-action="onboard-play"]').waitFor({timeout:60000});await p.waitForTimeout(800);await p.locator('[data-action="onboard-play"]').click({timeout:60000,force:true});await p.waitForTimeout(2500);
 if(after)await after(p);}catch(e){errs.push(name+' STEP '+e.message.split('\n')[0]);}
 await p.screenshot({path:'qa/r11-'+name+'.png'});await c.close();console.log('shot',name);}
const R=()=>0.3;
await shot('stroll',{seed:r=>{r.offer=X.strollOffer(r,R);}});
await shot('strollzh',{lang:'zh',seed:r=>{r.offer=X.strollOffer(r,()=>.8);}});
await shot('promo',{seed:r=>{r.offer=X.promoOffer(r,R);}});
await shot('promoad',{seed:r=>{r.offer=X.promoOffer(r,R);},after:async p=>{p.on('console',m=>console.log('CONSOLE',m.text()));await p.click('[data-action="v12-promo"][data-value="watch"]');await p.waitForTimeout(1200);console.log('demo-ad?',await p.evaluate(()=>!!document.getElementById('demo-ad')));}});
await shot('promodone',{seed:r=>{r.offer=X.promoOffer(r,R);},after:async p=>{await p.click('[data-action="v12-promo"][data-value="watch"]');await p.waitForTimeout(4200);}});
await shot('promopay',{lang:'zh',seed:r=>{r.offer=X.promoOffer(r,R);},after:async p=>{await p.click('[data-action="v12-promo"][data-value="pay"]');await p.waitForTimeout(800);}});
console.log('ERR',errs);await b.close();
