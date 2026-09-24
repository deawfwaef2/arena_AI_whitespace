// node qa/move.mjs : screenshots mid-travel and mid-corner
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:1280,height:800}});
const run=newRun();run.cash=4000*100;run.life.steps=Number(process.env.STEPS||9);run.life.lastCorner=0;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{}}};markPeak(run);
await c.addInitScript(s=>localStorage.setItem('upshift-save-v3',JSON.stringify(s)),{version:3,run,meta:{lang:'en',introLang:true,low:true,music:false,sound:false,motion:true}});
const p=await c.newPage();p.setDefaultTimeout(60000);p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
const l=p.locator('#v8-intro [data-l="en"]');if(await l.count())await l.click();const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(800);
await p.locator('[data-action="onboard-play"]').click();await p.waitForTimeout(2500);
await p.screenshot({path:'qa/move-0.png'});
await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-action="next"]')].find(b=>b.offsetParent);b?.click();});
for(const [i,ms] of (process.env.FAST?[[1,150],[2,250],[3,250],[4,250],[5,600]]:[[1,350],[2,500],[3,900],[4,900],[5,1200]])){await p.waitForTimeout(ms);await p.screenshot({path:`qa/move-${i}.png`});}
await b.close();
