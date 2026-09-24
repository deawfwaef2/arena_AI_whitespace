// R16c: rest phase must not offer the cheap "instant recovery" skip. node qa/r16rest.mjs
import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:120000});await p.waitForTimeout(1500);
if(await p.locator('#r15-gate').count())await p.click('#r15-gate').catch(()=>{});await p.waitForTimeout(900);
const play=p.locator('[data-action="onboard-play"]');if(await play.count())await play.first().click({force:true}).catch(()=>{});await p.waitForTimeout(4000);
for(let i=0;i<4;i++){await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());await p.waitForTimeout(500);}
await p.waitForTimeout(1500);
const click=async a=>{const ok=await p.evaluate(a=>{const e=[...document.querySelectorAll(`[data-action="${a}"]`)].find(x=>x.offsetParent);if(e){e.click();return true}return false},a);console.log('click',a,ok);await p.waitForTimeout(2500);};
await click('life-prompt-rest');await click('life-confirm-start-rest');
// pay the bill if needed
for(let k=0;k<3;k++){await click('life-open-event');await p.evaluate(()=>{const e=[...document.querySelectorAll('#modal-card button[data-action]')].find(x=>x.offsetParent&&!x.disabled&&x.dataset.action!=='close');console.log('evt',e?.dataset.action);e?.click();});await p.waitForTimeout(2000);await p.evaluate(()=>document.querySelector('#modal-card [data-action=close]')?.click());await p.waitForTimeout(800);}
await click('life-pay');
const btns=await p.evaluate(()=>[...document.querySelectorAll('#game-dock [data-action], #v7-windows [data-action]')].filter(e=>e.offsetParent).map(e=>e.dataset.action+':'+e.innerText.replace(/\s+/g,' ').slice(0,40)));
console.log('rest buttons',JSON.stringify(btns));
console.log('instant present:',await p.locator('[data-action="life-instant"],.instant-button,.instant-offer').count());
await p.screenshot({path:'qa/r16-rest.png',timeout:60000});console.log('errors',errs.join(' | ')||'none');await b.close();
