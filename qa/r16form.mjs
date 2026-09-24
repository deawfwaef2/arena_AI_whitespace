// R16: inspect a portal form. node qa/r16form.mjs <url> <shot>
import {chromium} from '@playwright/test';
const [url,shot]=process.argv.slice(2);
const b=await chromium.launch({args:['--no-sandbox']});const p=await (await b.newContext({viewport:{width:1280,height:900},userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'})).newPage();
await p.goto(url,{timeout:60000,waitUntil:'domcontentloaded'});await p.waitForTimeout(6000);
const f=await p.evaluate(()=>[...document.querySelectorAll('input,select,textarea,button,iframe')].map(e=>({t:e.tagName,type:e.type,name:e.name,id:e.id,ph:e.placeholder,lab:(e.labels?.[0]?.innerText||e.getAttribute('aria-label')||e.innerText||e.src||'').slice(0,80),opts:e.tagName==='SELECT'?[...e.options].slice(0,40).map(o=>o.text).join('|'):undefined})));
console.log(JSON.stringify(f,null,0));await p.screenshot({path:shot,fullPage:true,timeout:60000});await b.close();
