// Visual self-check. Run: python3 -m http.server 8080 --bind 127.0.0.1 &  then  node qa/shot.mjs [name...]
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
import {decorateOffer} from '../src/life-core.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const errors=[];
const only=process.argv.slice(2);
async function shot(name,opts={}){
 if(only.length&&!only.includes(name))return;
 const {cash=100,city='taipei',energy=200,companions=[],width=1280,height=820,offer,after}=opts;
 const c=await browser.newContext({viewport:{width,height}});
 const run=newRun();run.cash=cash*100;run.life.city=city;run.life.energy=energy;run.life.companions=companions;markPeak(run);
 if(offer)run.offer={id:'qa1',type:offer,city,rarity:'rare',settled:false};
 else if(city!=='taipei')run.offer=decorateOffer(run,run.offer,()=>.61);
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true}});
 const p=await c.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>errors.push(name+': '+e.message));
 try{
  await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
  await p.locator('[data-action="onboard-play"]').click();
  await p.locator('#start-screen').waitFor({state:'hidden'});
  await p.waitForTimeout(1600);
  if(after)await after(p);
 }catch(e){errors.push(name+' STEP: '+e.message.split('\n')[0]);}
 try{await p.screenshot({path:'qa/shot-'+name+'.png',timeout:60000,animations:'disabled'});}catch(e){errors.push(name+' SHOT: '+e.message.split('\n')[0]);}
 await c.close();
 console.log('shot',name);
}
const click=async(p,a,v)=>{const sel=`button[data-action="${a}"]${v===undefined?'':`[data-value="${v}"]`}:visible`;const m=p.locator('#modal:not([hidden]) '+sel);await (await m.count()?m:p.locator(sel)).first().click({force:true});await p.waitForTimeout(900);};
await shot('poor-desktop',{});
await shot('poor-phone',{width:390,height:844});
await shot('growing-desktop',{cash:2000});
await shot('rich-desktop',{cash:2000000});
await shot('rich-phone',{cash:2000000,width:390,height:844});
await shot('market',{cash:2000,offer:'talent-market',after:async p=>{await click(p,'street-market');}});
await shot('companion',{cash:2000,companions:['guide'],after:async p=>{const b=p.locator('[data-action="street-companion"]:visible').first();await b.waitFor();await b.click({force:true});await p.waitForTimeout(800);}});
await shot('companion-phone',{cash:2000,companions:['guide'],width:390,height:844,after:async p=>{const b=p.locator('[data-action="street-companion"]:visible').first();await b.waitFor();await b.click({force:true});await p.waitForTimeout(800);}});
await shot('rest',{cash:2000,energy:0,after:async p=>{await click(p,'life-prompt-rest');await click(p,'life-confirm-start-rest');await p.waitForTimeout(1200);}});
await shot('rest-phone',{cash:2000,energy:0,width:390,height:844,after:async p=>{await click(p,'life-prompt-rest');await click(p,'life-confirm-start-rest');await p.waitForTimeout(1200);}});
await shot('status',{cash:2000000,after:async p=>{await click(p,'life-status');}});
await shot('invest-result',{cash:2000,after:async p=>{await click(p,'invest');await p.waitForTimeout(1800);}});
console.log('ERRORS',errors);
await browser.close();
