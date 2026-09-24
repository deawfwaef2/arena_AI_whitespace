// Corner camera: screenshot view after each of 4 corners
import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:120000});await p.waitForTimeout(1500);
const play=p.locator('[data-action="onboard-play"]');if(await play.count())await play.first().click({force:true});await p.waitForTimeout(3000);
for(let i=0;i<4;i++){await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());await p.waitForTimeout(700);}
await p.evaluate(()=>document.querySelectorAll('.modal-backdrop,#modal').forEach(m=>{}));
for(let k=0;k<5;k++){
  if(k){await p.evaluate(()=>{const w=window.__r14world;w.turnCorner();});await p.waitForTimeout(1500);await p.screenshot({path:`qa/r14-corner-${k}-mid.png`,timeout:60000});await p.waitForTimeout(3500);}
  console.log(k,await p.evaluate(()=>[window.__r14world.viewTurns,window.__r14world.viewOff]));
  await p.screenshot({path:`qa/r14-corner-${k}.png`,timeout:60000});
}
console.log(errs);await b.close();
