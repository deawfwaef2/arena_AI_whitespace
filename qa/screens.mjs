import {chromium} from '@playwright/test';
import {newRun} from '../src/engine.js';
import {beginRest,payRest} from '../src/life-core.js';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
for(const [name,w,h,rich,rest] of [['desktop-poor',1440,900,false,false],['phone-poor',390,844,false,false],['phone-rich',390,844,true,false],['desktop-rest',1440,900,true,true],['phone-rest',390,844,true,true]]){
 const context=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:w<600,hasTouch:w<600});
 const run=newRun();if(rich){run.cash=3000000000;run.peak=run.cash;run.life.currentWorth=run.cash;run.life.seenWorth=run.cash;}if(rest){beginRest(run,()=>.99);run.estate.queue.forEach(e=>e.ack=true);payRest(run);run.life.rest.remaining=180000;}
 await context.addInitScript(({run})=>{localStorage.setItem('upshift-save-v3',JSON.stringify({version:3,run,meta:{lang:'zh',music:false,sound:false,motion:true,tutorial31:true}}));localStorage.setItem('last100-ui',JSON.stringify({scale:1,text:16}));},{run});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8081/',{waitUntil:'load',timeout:120000});await page.locator('[data-action="onboard-play"]').waitFor({timeout:30000});await page.locator('[data-action="onboard-play"]').click();await page.waitForTimeout(1500);
 await page.screenshot({path:`qa/${name}.png`});
 const layout=await page.evaluate(()=>{const ids=['world','game-dock','city-panorama','energy-hud','capital-summary','world-news','menu-button','project-context'];return ids.map(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect();return {id,hidden:e.hidden,display:getComputedStyle(e).display,x:r.x,y:r.y,w:r.width,h:r.height};});});
 console.log(name,JSON.stringify({errors,layout,loading:await page.locator('#loading').count()}));await context.close();
}
await browser.close();
