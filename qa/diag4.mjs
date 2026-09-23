import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const c=await browser.newContext({viewport:{width:390,height:844}});
const run=newRun();run.cash=200000000;run.life.energy=200;markPeak(run);
await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true}});
const p=await c.newPage();p.setDefaultTimeout(15000);
await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
await p.locator('[data-action="onboard-play"]').click();
await p.locator('#start-screen').waitFor({state:'hidden'});
await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{
 const r=document.getElementById('hud-rail');
 const rb=r.getBoundingClientRect();
 return 'rail '+JSON.stringify([rb.x,rb.y,rb.width,rb.height])+'\n'+
  [...r.children].map(e=>{const b=e.getBoundingClientRect();const cs=getComputedStyle(e);return `${e.id} [${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.width)}x${Math.round(b.height)}] pos=${cs.position} order=${cs.order} zoom=${cs.zoom}`;}).join('\n')+
  '\ndock '+JSON.stringify(Object.values(document.getElementById('game-dock').getBoundingClientRect().toJSON()).slice(0,4).map(Math.round));
}));
await browser.close();
