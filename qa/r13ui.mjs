// R13: project limits, sponsor card + draggable window, guidance tip, settings wipe. node qa/r13ui.mjs
import {chromium} from '@playwright/test';
import {newRun,makeOffer,markPeak} from '../src/engine.js';
import {sponsorOffer} from '../src/v12-core.js';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
async function boot(run,tag,fn){run.life.v9=Object.assign(run.life.v9||{},{story:{seen:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],picks:{}},maxTier:3});const c=await b.newContext({viewport:{width:1280,height:720}});
 await c.addInitScript(seed=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('upshift-save-v3',JSON.stringify(seed));sessionStorage.setItem('seeded','1');}},{version:3,run,meta:{music:false,sound:false,low:true,motion:false,lang:'en',r9coachDone:true,r9coach:4,runsDone:1,runCount:2,tutorial31:true}});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
 await p.locator('[data-action="onboard-play"]').waitFor({timeout:90000});await p.waitForTimeout(400);await p.locator('[data-action="onboard-play"]').click({force:true});await p.waitForTimeout(2500);
 await fn(p);console.log(tag,'errors',errs);await c.close();}
const r1=newRun();r1.cash=1500000;markPeak(r1);r1.page=12;r1.offer=makeOffer(r1,{project:true});
await boot(r1,'project',async p=>{await p.screenshot({path:'/tmp/shots/r13-project.png'});console.log('limits',await p.locator('.r13-limits').innerText().catch(()=>'none'));console.log('tip',await p.locator('#r13-tip').innerText().catch(()=>'none'));});
const r2=newRun();r2.cash=900000;markPeak(r2);r2.page=15;r2.offer=sponsorOffer(r2);
await boot(r2,'sponsor',async p=>{await p.screenshot({path:'/tmp/shots/r13-sp1.png'});await p.locator('#r13-tip button').click().catch(()=>{});await p.locator('[data-action="v12-sponsor"][data-value="yes"]').click({force:true});await p.waitForTimeout(1500);for(let i=0;i<3;i++){if(await p.locator('#modal:not([hidden]) [data-action="close"]').count()){await p.locator('#modal [data-action="close"]').first().click({force:true}).catch(()=>{});await p.waitForTimeout(600);}else await p.keyboard.press('Escape');}
 console.log('modal',await p.evaluate(()=>document.getElementById('modal')?.dataset.kind+' hidden='+document.getElementById('modal')?.hidden));
 const bar=p.locator('.r13-sp-bar');const bb=await bar.boundingBox();console.log('win',bb);await p.mouse.move(bb.x+60,bb.y+10);await p.mouse.down();await p.mouse.move(bb.x+500,bb.y+200,{steps:6});await p.mouse.up();await p.waitForTimeout(600);console.log('win2',await bar.boundingBox());
 await p.screenshot({path:'/tmp/shots/r13-sp2.png'});
 const snap=async()=>p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('upshift-save-v3'));return {cash:d.run.cash,deal:d.run.life.v9?.sponsorDeal};});console.log('state',JSON.stringify(await snap()));
 await p.locator('.r13-sp-x').click();await p.waitForTimeout(800);console.log('after close',await p.locator('#r13-sp').count(),JSON.stringify(await snap()));
 // wipe
 await p.locator('[data-action="settings"]').first().click({force:true}).catch(()=>{});await p.waitForTimeout(800);
 const w=p.locator('[data-action="r13-wipe"]');console.log('wipe btn',await w.count());
 if(await w.count()){await w.click();await p.waitForTimeout(500);await p.screenshot({path:'/tmp/shots/r13-wipe.png'});await p.locator('[data-action="confirm"]').click();await p.waitForTimeout(6000);console.log('after wipe',await p.evaluate(()=>localStorage.getItem('upshift-save-v3')?.slice(0,200)));}
});
await b.close();
