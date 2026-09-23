// v7 functional flow: node qa/v7flow.mjs
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],log=(...a)=>console.log(...a);
const c=await b.newContext({viewport:{width:1280,height:800}});
const run=newRun();run.cash=3000000;markPeak(run);if(run.offer.type==='project'){run.offer.v7delay='short';run.offer.v7seen=1;}
await c.addInitScript(seed=>{if(!localStorage.getItem('upshift-save-v3'))localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{music:false,sound:false,low:true}});
const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.locator('#v8-intro [data-l="zh"]').click({timeout:60000});await p.locator('.v8i-skip').click();await p.waitForTimeout(900);await p.locator('[data-action="onboard-play"]').click();await p.waitForTimeout(2000);
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('upshift-save-v3')).run);
const A=async(a,v)=>{await p.evaluate(([a,v])=>{const b=[...document.querySelectorAll(`button[data-action="${a}"]${v!=null?`[data-value="${v}"]`:''}`)].find(b=>b.offsetParent!==null&&!b.disabled);if(!b)throw Error('no button '+a);b.click();},[a,v]);await p.waitForTimeout(900);};
// slider (replaces knob)
const r=await p.locator('#stake-range').boundingBox();await p.mouse.click(r.x+r.width*.6,r.y+r.height/2);await p.waitForTimeout(300);
log('slider value',await p.inputValue('#stake-input'),'go label',await p.textContent('#v7-go-amt'),'odds above go',await p.evaluate(()=>document.querySelector('.v8-odds').getBoundingClientRect().bottom<=document.getElementById('v7-go').getBoundingClientRect().top+40));
log('status strip',await p.textContent('#v8-status'));log('goals',await p.textContent('#v8-goals'));
const before=(await S()).cash;await A('v7-delay-invest');let s=await S();
log('signed contracts',s.life.v7.delayed.length,'cash drop',(before-s.cash)/100,'windows',await p.locator('.v7-contract').count());
// worth includes locked money
log('worth label',await p.textContent('#v7-money-sub'));
await p.waitForTimeout(800);await p.screenshot({path:'qa/flow-signed.png'});log('contract box',JSON.stringify(await p.evaluate(()=>{const e=document.querySelector('.v7-contract');if(!e)return null;const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height,getComputedStyle(e).display,getComputedStyle(e).opacity,getComputedStyle(document.getElementById('v7-windows')).zIndex]})),'dock opacity',await p.evaluate(()=>getComputedStyle(document.getElementById('game-dock')).opacity));log('dock html',(await p.evaluate(()=>document.getElementById('game-dock').innerText)).slice(0,300));
// rest -> mini-game -> finish -> season changes + contract matures
await A('next');await p.waitForTimeout(1500);
await p.evaluate(()=>{});s=await S();
await A('life-prompt-rest');await A('life-confirm-start-rest');for(const a of ['life-event-choice','life-event-ack','life-pay']){try{await A(a);}catch{}}
s=await S();const rem0=s.life.rest?.remaining;log('rest paid',s.life.rest?.paid,'remaining',rem0);
await A('v7-game');await p.waitForTimeout(500);
// play timing game: hit 3 times
for(let i=0;i<3;i++){try{await p.click('#v7-g-hit',{timeout:2000});}catch{}await p.waitForTimeout(300);}
await p.waitForTimeout(1200);s=await S();log('after game remaining',s.life.rest.remaining,'played',JSON.stringify(s.life.v7.mg));
await A('v7-game-quit');
// skip with 30%
const c0=s.cash;await A('v7-skip-rest');await A('confirm');s=await S();log('skip cost',(c0-s.cash)/100,'expected',Math.floor(c0*.3)/100,'remaining',s.life.rest?.remaining);
await A('life-finish').catch(e=>log('finish err',e.message));await p.waitForTimeout(1500);s=await S();
log('season',s.life.v7.season,'weather',s.life.v7.weather,'contract left',s.life.v7.delayed[0]?.left,'banner',await p.locator('#v7-season-banner').isVisible());
const c1=s.cash;await A('v7-cash',s.life.v7.delayed[0].id);await p.waitForTimeout(800);s=await S();log('cashed', s.life.v7.delayed.length===0,'delta',(s.cash-c1)/100);
// toggle
await A('v7-toggle','headphones');s=await S();log('toggle headphones (default on → off)',s.life.v7.toggles.headphones,await p.evaluate(()=>document.getElementById('app').dataset.fxBeat));
// crossroads
await p.evaluate(()=>{});
for(let i=0;i<8&&!(await p.locator('#v7-cross').count());i++){await A('next').catch(()=>{});await p.waitForTimeout(1500);}
log('crossroads shown',await p.locator('#v7-cross').count());if(await p.locator('#v7-cross').count()){await A('v7-district',1);s=await S();log('district',JSON.stringify(s.life.v7.district));}
// reclaim: drop cash
await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('upshift-save-v3'));});
log('ERRORS',errors);await b.close();
