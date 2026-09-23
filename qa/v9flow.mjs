import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>localStorage.clear());
await p.goto('http://127.0.0.1:8080/',{timeout:120000});
await p.locator('#v8-intro [data-l="zh"]').click({timeout:60000});await p.locator('.v8i-skip').click();await p.waitForTimeout(800);
await p.locator('[data-action="onboard-play"]').click();await p.waitForTimeout(2000);
await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());await p.waitForTimeout(600);
const cash=()=>p.evaluate(()=>document.querySelector('#v7-money strong')?.textContent);
console.log('start',await cash());
for(let job=0;job<14;job++){
 for(let i=0;i<40;i++){const art=p.locator('.v9-work-art[data-action="v9-tap"]');if(!await art.count())break;await art.dispatchEvent('pointerdown');await p.waitForTimeout(30);}
 await p.waitForTimeout(400);
 await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());
 await p.evaluate(()=>{const m=document.getElementById('modal');if(m&&!m.hidden){const b=m.querySelector('[data-action="close"],.primary,button.v8-ceremony-go,[data-action]:not([data-action="v9-go-rest"])');b?.click();}});await p.waitForTimeout(500);
 const kind=await p.evaluate(()=>document.getElementById('game-dock').dataset.kind);
 console.log('job',job,kind,await cash());
 if(kind==='v9-fork'){await p.screenshot({path:'qa/v9-fork.png'});await p.evaluate(()=>document.querySelector('[data-action="v9-zone"]').click());await p.waitForTimeout(800);continue;}
 await p.evaluate(()=>{const bs=[...document.querySelectorAll('#game-dock button[data-action]')].filter(b=>b.offsetParent&&!b.disabled);(bs.find(b=>b.dataset.action==='next')||bs[0])?.click();});await p.waitForTimeout(600);await p.evaluate(()=>{const bs=[...document.querySelectorAll('#game-dock button[data-action]')].filter(b=>b.offsetParent&&!b.disabled);bs.find(b=>b.dataset.action==='next')?.click();});await p.waitForTimeout(1500);
}
await p.screenshot({path:'qa/v9-work.png'});
console.log('ERR',errs);await b.close();
