// v7 visual check: node qa/v7shot.mjs [names]   (needs http.server on 8080)
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const errors=[];const only=process.argv.slice(2);
async function shot(name,{cash=100,energy=200,width=1280,height=800,mobile=false,v7,after,rest,delay}={}){
 if(only.length&&!only.includes(name))return;
 const c=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
 const run=newRun();run.cash=cash*100;run.life.energy=energy;if(v7)run.life.v7=v7;if(delay&&run.offer.type==='project'){run.offer.v7delay=delay;run.offer.v7seen=1;}markPeak(run);
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true}});
 const p=await c.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>errors.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error')errors.push(name+' console: '+m.text().slice(0,200));});
 try{await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
  await p.locator('[data-action="onboard-play"]').click({timeout:20000});await p.waitForTimeout(2200);
  if(after)await after(p);
 }catch(e){errors.push(name+' STEP: '+e.message.split('\n')[0]);}
 try{await p.screenshot({path:'qa/v7-'+name+'.png',timeout:60000});}catch(e){errors.push(name+' SHOT: '+e.message.split('\n')[0]);}
 await c.close();console.log('shot',name);
}
const clickA=async(p,a)=>{await p.evaluate(a=>{const b=[...document.querySelectorAll(`button[data-action="${a}"]`)].find(b=>b.offsetParent!==null);b?.click();},a);await p.waitForTimeout(1000);};
export {clickA};
const toRest=async p=>{await clickA(p,'life-prompt-rest');await clickA(p,'life-confirm-start-rest');for(const a of ['life-event-choice','life-event-ack','life-pay'])await clickA(p,a);await p.waitForTimeout(1200);};
await shot('poor',{});
await shot('r1',{cash:800,v7:{toggles:{headphones:true}}});
await shot('r2',{cash:30000,v7:{season:2,weather:'rain',toggles:{radio:true}}});
await shot('r3',{cash:300000,v7:{season:0,weather:'clear',toggles:{radio:true,painting:true}}});
await shot('r4',{cash:3000000,v7:{season:3,weather:'snow',toggles:{radio:true}}});
await shot('r5',{cash:30000000,v7:{season:1,weather:'clear',toggles:{radio:true,jet:true}}});
await shot('phone',{cash:3000,width:844,height:390,mobile:true});
await shot('phone-portrait',{cash:3000,width:390,height:844,mobile:true});
await shot('rest',{cash:3000,energy:0,after:toRest});
await shot('tip',{cash:3000,after:async p=>{await p.hover('.v7-mech[data-mech="bill"]');await p.waitForTimeout(400);}});
await shot('delayed',{cash:30000,delay:'long'});
await shot('signed',{cash:30000,delay:'short',after:async p=>{await clickA(p,'v7-delay-invest');await p.waitForTimeout(800);}});
await shot('game',{cash:3000,energy:0,after:async p=>{await toRest(p);await clickA(p,'v7-game');await p.waitForTimeout(3000);}});
await shot('game-rich',{cash:3000000,energy:0,after:async p=>{await toRest(p);await clickA(p,'v7-game');await p.waitForTimeout(1500);await p.evaluate(()=>document.querySelectorAll('.v7-g-card')[0]?.click());await p.waitForTimeout(300);}});
await shot('cross',{cash:3000,after:async p=>{await p.evaluate(()=>{});for(let i=0;i<3;i++){await clickA(p,'next');await p.waitForTimeout(1800);}await p.waitForTimeout(800);}});
console.log('ERRORS',JSON.stringify(errors,null,1));await browser.close();
