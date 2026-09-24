// R12: restart/reincarnation must reset shop/hospital repeat counters. node qa/r12reset.mjs (http.server 8080)
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const c=await b.newContext({viewport:{width:1280,height:720}});
const run=newRun();run.cash=500000;run.life.v9={famBuys:{risk:5,energy:4},lvBuys:3,hospUses:6,story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{}},maxTier:10};run.estate={medicalUses:4};markPeak(run);
await c.addInitScript(seed=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('upshift-save-v3',JSON.stringify(seed));sessionStorage.setItem('seeded','1');}},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:false,lang:'en',introLang:true,r9coachDone:true,runCount:1}});
const p=await c.newPage();p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
const l=p.locator('#v8-intro [data-l="en"]');if(await l.count())await l.click({timeout:60000});
const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();
await p.locator('[data-action="onboard-play"]').waitFor({timeout:90000});await p.waitForTimeout(500);await p.locator('[data-action="onboard-play"]').click({force:true});await p.waitForTimeout(2500);
const dump=()=>p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('upshift-save-v3'));const v=d.run.life.v9||{};return {run:d.run.runNumber,cash:d.run.cash,fam:v.famBuys,lv:v.lvBuys,hosp:v.hospUses,med:d.run.estate?.medicalUses};});
console.log('before',await dump());
await p.evaluate(()=>[...document.querySelectorAll('[data-action="restart"]')].find(b=>b.offsetParent)?.click());await p.waitForTimeout(800);
await p.evaluate(()=>{const b=[...document.querySelectorAll('#modal-card button, .confirm button, [data-action="confirm-yes"]')].filter(b=>b.offsetParent);console.log(b.map(x=>x.dataset.action+':'+x.textContent).join('|'));const y=b.find(x=>/yes|confirm|ok/i.test(x.dataset.action||'')||/start over|restart|confirm|yes/i.test(x.textContent));y?.click();});
await p.waitForTimeout(9000);
for(let i=0;i<4;i++){await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&/skip|continue|new start|begin|play/i.test(b.textContent));b[0]?.click();});await p.waitForTimeout(1500);}
console.log('after',await dump());
await b.close();
