// Settings language + story-at-start check
import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:120000});await p.waitForTimeout(1500);
const play=p.locator('[data-action="onboard-play"]');console.log('play buttons',await play.count());
if(await play.count())await play.first().click({force:true});await p.waitForTimeout(4000);
await p.screenshot({path:'qa/r14-start.png',timeout:60000});
console.log('modal',await p.evaluate(()=>document.getElementById('modal')?.dataset.kind||document.querySelector('.modal:not([hidden])')?.className));
await p.evaluate(()=>{const b=document.querySelector('[data-action="close"],[data-action="v9-story-next"]');});
for(let i=0;i<4;i++){await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());await p.waitForTimeout(900);}const g=p.getByText('Got it');if(await g.count())await g.first().click();await p.waitForTimeout(500);
for(let i=0;i<3;i++){const g2=p.getByText('Got it');if(await g2.count())await g2.first().click().catch(()=>{});await p.waitForTimeout(400);}
console.log('settings btns',await p.evaluate(()=>[...document.querySelectorAll('[data-action]')].filter(b=>/setting/i.test(b.dataset.action)).map(b=>b.dataset.action+':'+!!b.offsetParent)));
await p.evaluate(()=>{[...document.querySelectorAll('[data-mech="settings"]')].find(b=>b.offsetParent)?.click();});await p.waitForTimeout(1200);
await p.waitForTimeout(1500);console.log('btn',await p.evaluate(()=>{const b=document.querySelector('.r14-lang button');const s=b&&getComputedStyle(b);return s&&[s.backgroundImage.slice(0,60),s.backgroundColor,s.color,b.className];}));await p.screenshot({path:'qa/r14-settings.png',timeout:60000});
await p.evaluate(()=>document.querySelector('[data-action="set-lang"][data-value="zh"]')?.click());await p.waitForTimeout(1500);
await p.screenshot({path:'qa/r14-settings-zh.png',timeout:60000});
console.log(errs);await b.close();
