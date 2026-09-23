import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
for(const [w,h,cash] of [[1280,820,100],[390,844,100],[1280,820,2000000],[390,844,2000000]]){
const c=await browser.newContext({viewport:{width:w,height:h}});
const run=newRun();run.cash=cash*100;run.life.energy=200;markPeak(run);
await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true}});
const p=await c.newPage();p.setDefaultTimeout(15000);
await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
await p.locator('[data-action="onboard-play"]').click();
await p.locator('#start-screen').waitFor({state:'hidden'});
await p.waitForTimeout(1800);
const r=await p.evaluate(()=>['cash-value','street-identity','energy-ribbon','next-tier-chip','game-navigation','milestone-progress-bar','city-panorama','street-sign','wealth-badges','game-dock','wallet-bill'].map(id=>{const e=document.getElementById(id)||document.querySelector('.'+id);if(!e)return id+' MISSING';const b=e.getBoundingClientRect();return `${id} [${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.width)}x${Math.round(b.height)}]${e.hidden||b.width<2?' HIDDEN':''}`;}));
console.log('=== '+w+'x'+h+' cash='+cash);console.log(r.join('\n'));
await c.close();
}
await browser.close();
