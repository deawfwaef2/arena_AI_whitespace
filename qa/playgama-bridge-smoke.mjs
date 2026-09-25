import { chromium } from '@playwright/test';
const b = await chromium.launch({args:['--use-gl=swiftshader','--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport:{width:1280,height:720}});
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text());});
await p.goto('http://127.0.0.1:8123/index.html',{timeout:90000});
await p.waitForFunction(()=>window.bridge&&window.bridge.isInitialized!==undefined,null,{timeout:60000}).catch(()=>{});
await p.waitForTimeout(15000);
const info = await p.evaluate(()=>({bridge:!!window.bridge,platformId:window.bridge?.platform?.id,init:window.bridge?.isInitialized,lang:window.bridge?.platform?.language,storage:window.bridge?.storage?.defaultType,inter:window.bridge?.advertisement?.isInterstitialSupported,rew:window.bridge?.advertisement?.isRewardedSupported,ls:Object.keys(localStorage)}));
console.log(JSON.stringify(info));
await p.screenshot({path:'/tmp/pg1.jpg',type:'jpeg',quality:60});
// click through: start button
for (const sel of ['text=/start game/i','text=/play/i','button:has-text("Start")']) { const el=p.locator(sel).first(); if(await el.count()){ await el.click({timeout:5000}).catch(()=>{}); break; } }
await p.waitForTimeout(12000);
await p.screenshot({path:'/tmp/pg2.jpg',type:'jpeg',quality:60});
await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
await p.waitForTimeout(4000);
const st = await p.evaluate(async()=>{const d=await window.bridge.storage.get(['upshift-save-v3']);return {len:(d?.[0]||'').length, ls:Object.keys(localStorage)};});
console.log('storage after', JSON.stringify(st));
await p.reload({timeout:90000}); await p.waitForTimeout(15000);
const st2 = await p.evaluate(async()=>{const d=await window.bridge.storage.get(['upshift-save-v3']);return (d?.[0]||'').length;});
console.log('after reload len',st2);
console.log(errs.slice(0,15).join('\n'));
await b.close();
