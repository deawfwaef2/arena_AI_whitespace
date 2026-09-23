import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {newRun,markPeak} from '../src/engine.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const results=[];const errors=[];
const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1});
await context.addInitScript(()=>{const seed=sessionStorage.getItem('qa-next-run');if(seed){localStorage.setItem('upshift-save-v3',seed);sessionStorage.removeItem('qa-next-run');}if(!localStorage.getItem('upshift-save-v3'))localStorage.setItem('upshift-save-v3',JSON.stringify({meta:{music:false,sound:false,low:true,motion:true,tutorial31:true}}));});
const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
const click=async(a,v)=>{const s=`[data-action="${a}"]${v===undefined?'':`[data-value="${v}"]`}:visible`;const scoped=page.locator('#modal:not([hidden]) '+s);await (await scoped.count()?scoped:page.locator(s)).first().click();};
const save=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('upshift-save-v3')));
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});console.log('PASS',name)}catch(e){results.push({name,status:'FAIL',error:e.message});console.log('FAIL',name,e.message)}}
async function bounds(label,modal=false){await page.waitForTimeout(180);const r=await page.evaluate(modal=>{const rect=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,w:b.width,h:b.height}};const a=rect(document.getElementById('app'));let es=modal?['modal-card']:['world','game-dock','game-navigation','cash-value','energy-hud'];return {app:a,els:Object.fromEntries(es.map(id=>[id,rect(document.getElementById(id))])),scroll:[document.documentElement.scrollWidth,innerWidth]};},modal);for(const [id,b] of Object.entries(r.els)){assert.ok(b.w>20&&b.h>20,`${label} ${id} nonzero`);assert.ok(b.x>=r.app.x-1&&b.y>=r.app.y-1&&b.right<=r.app.right+1&&b.bottom<=r.app.bottom+1,`${label} ${id} outside frame ${JSON.stringify(r)}`)}if(!modal){const cash=r.els['cash-value'],energy=r.els['energy-hud'];assert.equal(cash.x<energy.right-1&&cash.right>energy.x+1&&cash.y<energy.bottom-1&&cash.bottom>energy.y+1,false,`${label} cash/energy overlap`);const a=r.els.world,b=r.els['game-dock'];assert.equal(a.x<b.right-1&&a.right>b.x+1&&a.y<b.bottom-1&&a.bottom>b.y+1,false,`${label} world/dock overlap`)}assert.ok(r.scroll[0]<=r.scroll[1]+1,`${label} page horizontal overflow`);}
async function seed({cash=100,energy=200,layout='journal',device='desktop'}={}){const run=newRun();run.cash=Math.round(cash*100);run.life.energy=energy;markPeak(run);await page.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});await page.evaluate(({run,layout,device})=>sessionStorage.setItem('qa-next-run',JSON.stringify({version:3,run,meta:{layout,device,music:false,sound:false,low:true,motion:true,tutorial31:true,legacy:{points:0,lifetime:0,unlocks:[],skin:'default'}}})),{run,layout,device});await page.reload({waitUntil:'load',timeout:120000});await page.locator('[data-action="onboard-play"]').waitFor();}
await check('24 preview combinations do not modify actual wealth',async()=>{
 await seed();const before=(await save()).run;
 for(const l of ['journal','theater','console']){
  await click('studio-layout',l);
  for(const wealth of ['poor','rich']){await click('studio-wealth',wealth);for(const screen of ['street','map','rest','assets']){await click('studio-screen',screen);assert.equal(await page.locator('.demo-frame').getAttribute('data-screen'),screen);assert.ok((await page.locator('.demo-panel').innerText()).length>15);}}
 }
 assert.equal((await save()).run.cash,before.cash);assert.equal((await save()).run.id,before.id);
 await click('studio-layout','journal');await click('studio-wealth','poor');await click('studio-screen','street');await page.waitForFunction(()=>getComputedStyle(document.querySelector('.demo-frame')).opacity==='1');await page.screenshot({path:'qa/ui-studio.png',animations:'disabled'});
});
for(const layout of ['journal','theater','console'])await check(layout+' desktop, map, assets and simulated phone remain inside frame',async()=>{
 await seed({layout});await click('studio-layout',layout);await click('studio-device','desktop');await click('onboard-play');await page.locator('#start-screen').waitFor({state:'hidden'});await bounds(layout+' desktop');await page.screenshot({path:`qa/ui-${layout}-desktop.png`});
 await click('life-map');await page.locator('.world-atlas').waitFor();await bounds(layout+' desktop map',true);assert.equal(await page.locator('.map-city-list button').count(),6);await click('life-city','tokyo');assert.match(await page.locator('.map-copy').innerText(),/东京/);await click('close');
 await click('life-status');await page.locator('#modal').waitFor({state:'visible'});await bounds(layout+' assets',true);await click('close');
 await click('studio-toggle-device');await page.waitForFunction(()=>document.getElementById('app').dataset.compact==='true');await bounds(layout+' phone simulator');assert.ok(await page.locator('#app').evaluate(e=>e.clientWidth)<=390);await page.screenshot({path:`qa/ui-${layout}-phone.png`});
 await click('life-map');await page.locator('.world-atlas').waitFor();await bounds(layout+' phone map',true);await click('close');
 await click('onboard-home');await page.locator('#start-screen').waitFor({state:'visible'});
});
await check('320px and 390px small phones / 844px landscape / tablet',async()=>{
 await seed({layout:'journal'});await click('studio-layout','journal');await click('studio-device','desktop');await click('onboard-play');
 for(const [w,h] of [[320,568],[390,844],[844,390],[1024,768]]){await page.setViewportSize({width:w,height:h});await bounds(`${w}x${h}`);await click('life-map');await page.locator('.world-atlas').waitFor();await bounds(`${w}x${h} map`,true);await click('close');}
 await page.setViewportSize({width:1280,height:900});
});
await check('rich layout is structurally different and existing game wealth stays intact',async()=>{
 await seed({cash:3200000,layout:'console'});await click('onboard-play');await page.waitForFunction(()=>document.getElementById('app').dataset.wealth==='rich');assert.equal(await page.locator('#wealth-service').isVisible(),true);await bounds('rich console');await page.screenshot({path:'qa/ui-rich-desktop.png'});
 await click('life-status');await bounds('rich asset dialog',true);await page.screenshot({path:'qa/ui-rich-assets.png'});await click('close');
 assert.equal((await save()).run.cash,320000000);
});
await check('zero-energy rest: confirm → health → bill → offline timer → reclaim → next stop',async()=>{
 await seed({cash:100,energy:0,layout:'theater',device:'phone'});await click('onboard-play');
 await click('life-prompt-rest');await page.locator('.confirm-rest-dialog').waitFor();assert.match(await page.locator('.confirm-rest-dialog').innerText(),/0 \/ 200/);await bounds('rest confirm',true);await page.screenshot({path:'qa/ui-rest-confirm.png'});
 await click('life-confirm-start-rest');await page.locator('.event-dialog.health').waitFor();assert.ok((await save()).run.life.rest);
 await click('life-event-choice');await page.locator('.event-dialog.resolved').waitFor();await click('life-event-ack');
 await page.locator('[data-action="life-pay"]:visible').waitFor();await click('life-pay');await page.waitForFunction(()=>JSON.parse(localStorage.getItem('upshift-save-v3')).run.life.rest.paid);await bounds('paid rest');await page.screenshot({path:'qa/ui-rest-phone.png'});
 const r=(await save()).run;assert.ok(r.cash<10000&&r.cash>0);assert.ok(r.life.rest.remaining>0);assert.equal(r.life.energy,0);assert.equal(await page.locator('[data-action="life-finish"]').isVisible(),false);
 await page.clock.setSystemTime(new Date(Date.now()+610000));
 await page.reload({waitUntil:'load',timeout:120000});await click('onboard-play');await page.locator('[data-action="life-finish"]:visible').waitFor();await click('life-finish');await page.waitForFunction(()=>!JSON.parse(localStorage.getItem('upshift-save-v3')).run.life.rest);const after=(await save()).run;assert.equal(after.life.energy,200);assert.ok(after.page>r.page);
 await click('next');await page.waitForFunction(()=>!document.getElementById('game').classList.contains('travelling'));assert.equal((await save()).run.life.energy,195);
});
await check('settings backup export + rejected invalid import preserve save',async()=>{
 await click('menu');await click('settings');await page.locator('#backup-file').waitFor({state:'attached'});
 const downloading=page.waitForEvent('download');await click('backup-export');const dl=await downloading;const file=await dl.path();const data=JSON.parse(await fs.readFile(file,'utf8'));assert.equal(data.run.id,(await save()).run.id);assert.ok(!JSON.stringify(data).includes('ghp_'));
 const old=(await save()).run.cash;await page.locator('#backup-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"hello":"world"}')});await page.waitForTimeout(200);assert.equal((await save()).run.cash,old);assert.match(await page.locator('#toast-stack').innerText(),/未导入/);
 await page.locator('#backup-file').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.locator('[data-action="confirm"]:visible').waitFor();await click('confirm');await page.waitForTimeout(400);assert.equal((await save()).run.id,data.run.id);assert.equal((await save()).run.unranked,true);
});
await check('large text toggles, keyboard close and no JS page errors',async()=>{
 await click('menu');await click('settings');await click('readability');assert.equal(await page.locator('#app').getAttribute('data-large-text'),'true');await page.keyboard.press('Escape');await page.locator('#modal').waitFor({state:'hidden'});assert.deepEqual(errors,[]);
});
await context.close();
await check('downloaded standalone HTML starts offline and makes no network requests',async()=>{
 const c=await browser.newContext({viewport:{width:1024,height:768},offline:true});await c.addInitScript(()=>localStorage.setItem('upshift-save-v3',JSON.stringify({meta:{low:true,music:false,sound:false}})));
 const p=await c.newPage(),ext=[],err=[];p.on('request',r=>{if(/^https?:/.test(r.url()))ext.push(r.url())});p.on('pageerror',e=>err.push(e.message));await p.goto('file:///home/user/game-project/index.html',{waitUntil:'load',timeout:120000});await p.locator('[data-action="onboard-play"]').click();await p.locator('#start-screen').waitFor({state:'hidden'});assert.equal(await p.locator('#game-dock').isVisible(),true);await p.locator('[data-action="invest"]').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('upshift-save-v3')).run.offer.settled);assert.deepEqual(ext,[]);assert.deepEqual(err,[]);await c.close();
});
await browser.close();await fs.writeFile('qa/redesign-results.json',JSON.stringify({date:new Date().toISOString(),results,pageErrors:errors},null,2));console.log(JSON.stringify(results));if(results.some(x=>x.status==='FAIL'))process.exitCode=1;
