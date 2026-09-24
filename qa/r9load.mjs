// Round 9: load-time check (file:// and http) incl. phone emulation. node qa/r9load.mjs
import {chromium,devices} from '@playwright/test';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
for(const [label,url,dev] of [['file-desktop','file://'+process.cwd()+'/index.html',{viewport:{width:1280,height:800}}],['http-phone','http://127.0.0.1:8080/',{...devices['iPhone 13 landscape']}]]){
 const c=await browser.newContext(dev);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
 const t0=Date.now();await p.goto(url,{waitUntil:'load',timeout:120000});const tl=Date.now()-t0;
 await p.waitForSelector('#v8-intro [data-l="en"]',{timeout:60000});const ti=Date.now()-t0;
 await p.click('#v8-intro [data-l="en"]');await p.waitForTimeout(400);const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();
 await p.waitForTimeout(800);await p.locator('[data-action="onboard-play"]').click({timeout:20000});await p.waitForTimeout(3000);
 const st=await p.evaluate(()=>({loading:!!document.getElementById('loading'),audioKeys:Object.keys(window.UPSHIFT_AUDIO||{}),scripts:[...document.scripts].map(s=>s.src).filter(Boolean)}));
 await p.screenshot({path:'qa/r9-load-'+label+'.png'});
 console.log(label,{loadMs:tl,introMs:ti,...st,errs});await c.close();
}
await browser.close();
