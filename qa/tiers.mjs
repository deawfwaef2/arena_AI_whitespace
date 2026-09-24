// node qa/tiers.mjs [lang] : one screenshot per wealth tier -> qa/tier-N.png
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const lang=process.argv[2]||'en';const cashes=(process.env.CASH||'100,3000,20000,200000,5000000,500000000').split(',').map(Number);
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [i,cash] of cashes.entries()){
 const c=await b.newContext({viewport:{width:1280,height:800}});
 const run=newRun();run.cash=cash*100;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{}}};markPeak(run);
 await c.addInitScript(s=>localStorage.setItem('upshift-save-v3',JSON.stringify(s)),{version:3,run,meta:{lang,introLang:true,low:true,music:false,sound:false,motion:true}});
 const p=await c.newPage();p.setDefaultTimeout(60000);p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
 const l=p.locator(`#v8-intro [data-l="${lang}"]`);if(await l.count())await l.click();const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(800);
 await p.locator('[data-action="onboard-play"]').click();await p.waitForTimeout(2500);
 if(process.env.AFTER)await p.evaluate(process.env.AFTER);await p.waitForTimeout(1200);
 await p.screenshot({path:`qa/tier-${i}.png`});await c.close();console.log('tier',i);
}
await b.close();
