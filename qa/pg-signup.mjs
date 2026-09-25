import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
await p.goto(process.argv[2],{timeout:60000,waitUntil:'domcontentloaded'}); await p.waitForTimeout(8000);
console.log(p.url());
console.log((await p.evaluate(()=>[...document.querySelectorAll('input,button,a')].map(e=>`${e.tagName} ${e.type||''} name=${e.name||''} ph=${e.placeholder||''} txt=${(e.innerText||'').trim().slice(0,40)} href=${e.getAttribute('href')||''}`).filter(x=>!/href=\/?#?$/.test(x)||x.startsWith('INPUT')||x.startsWith('BUTTON')).slice(0,60).join('\n'))));
await p.screenshot({path:'/tmp/su.jpg',type:'jpeg',quality:55});
await b.close();
