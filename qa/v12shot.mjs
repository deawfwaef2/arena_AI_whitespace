// v12 visual check: node qa/v12shot.mjs [names]  (needs http.server on 8080)
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
import * as X from '../src/v12-core.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const errors=[];const only=process.argv.slice(2);const lang0=process.env.SHOT_LANG||'zh';
async function shot(name,{cash=100,energy=200,seed,after,lang=lang0,q=''}={}){
 if(only.length&&!only.includes(name))return;
 const c=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
 const run=newRun();run.cash=cash*100;run.life.energy=energy;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{t0:'night'}},maxTier:10};if(seed)seed(run);markPeak(run);
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true,lang,introLang:true}});
 const p=await c.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>errors.push(name+': '+e.message));
 try{await p.goto('http://127.0.0.1:8080/'+q,{waitUntil:'load',timeout:120000});
  const l=p.locator(`#v8-intro [data-l="${lang}"]`);if(await l.count())await l.click({timeout:60000});const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(900);
  await p.locator('[data-action="onboard-play"]').click({timeout:20000});await p.waitForTimeout(2200);
  if(after)await after(p);
 }catch(e){errors.push(name+' STEP: '+e.message.split('\n')[0]);}
 try{await p.screenshot({path:'qa/v12-'+name+'.png',timeout:60000});}catch(e){errors.push(name+' SHOT: '+e.message.split('\n')[0]);}
 await c.close();console.log('shot',name);
}
const clickA=async(p,a,v)=>{await p.evaluate(([a,v])=>{const b=[...document.querySelectorAll(`[data-action="${a}"]`+(v!=null?`[data-value="${v}"]`:''))].find(b=>b.offsetParent!==null);b?.click();},[a,v]);await p.waitForTimeout(1200);};
const R=()=>0.3;
await shot('shop',{cash:800,seed:r=>{r.offer=X.shopOffer(r,R,'kiosk');}});
await shot('dept',{cash:5000000,seed:r=>{r.offer=X.shopOffer(r,R,'dept');}});
await shot('ad',{cash:5000,q:'?adtest=1',seed:r=>{r.offer=X.adOffer(r,R);}});
await shot('city',{cash:40000,seed:r=>{r.life.city='vegas';r.offer=X.cityOffer(r,R);}});
await shot('citytk',{cash:9000000,seed:r=>{r.life.city='tokyo';r.offer=X.cityOffer(r,R);}});
await shot('hospital',{cash:80000,seed:r=>{r.estate&&(r.estate.health=1);r.life.v9.hospUses=2;r.offer={id:'h1',type:'v9-place',place:'hospital',opts:['clinic','specialist','ward','checkup'],settled:false,city:'taipei',rarity:'rare'};}});
await shot('promote',{cash:480,seed:r=>{r.offer={id:'w',type:'v9-work',job:'can',need:18,taps:17,pay:3000,settled:false,city:'taipei',rarity:'common'};},after:async p=>{const el=p.locator('[data-action="v9-tap"]');const b=await el.boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2);await p.waitForTimeout(2500);}});
await shot('pchoose',{cash:3000000,seed:r=>{r.life.v9.partners={chef:{bond:1,met:1,last:1}};r.offer={id:'pd',type:'v9-pdeal',partner:'chef',settled:false,city:'taipei',rarity:'epic'};}});
console.log('ERRORS',JSON.stringify(errors,null,1));await browser.close();
