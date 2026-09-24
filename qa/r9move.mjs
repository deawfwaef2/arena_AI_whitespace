// Round 9: NPCs must stay in the world while the hero travels. node qa/r9move.mjs
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const c=await browser.newContext({viewport:{width:1280,height:800}});
const run=newRun();run.cash=900000;run.life.energy=200;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{t0:'night'}},maxTier:10};markPeak(run);
await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true,lang:'en',introLang:true}});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8080/');await p.click('#v8-intro [data-l="en"]');await p.waitForTimeout(300);if(await p.locator('.v8i-skip').count())await p.click('.v8i-skip');
await p.waitForTimeout(700);await p.locator('[data-action="onboard-play"]').click();await p.waitForTimeout(2500);
for(let k=0;k<3;k++){const b=p.locator('.v9-modal button, #modal-card [data-action="close"], #modal-card [data-action="confirm"]').first();if(await b.count()&&await b.isVisible().catch(()=>false))await b.click().catch(()=>{});await p.waitForTimeout(400);}
await p.screenshot({path:'qa/r9-move-0.png'});
await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-action="next"]')].find(b=>b.offsetParent);b?.click();});
for(let i=1;i<=3;i++){await p.waitForTimeout(260);await p.screenshot({path:'qa/r9-move-'+i+'.png'});}
await p.waitForTimeout(1500);await p.screenshot({path:'qa/r9-move-4.png'});
console.log('errs',errs);await browser.close();
