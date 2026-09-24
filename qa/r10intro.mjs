import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
const l=p.locator('#v8-intro [data-l="en"]');if(await l.count())await l.click({timeout:60000});
for(const t of [2500,3000,3500]){await p.waitForTimeout(t);await p.screenshot({path:`/tmp/promo/intro-${t}.png`});}
console.log('errs',errs);await b.close();
