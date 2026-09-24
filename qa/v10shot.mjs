// v10 visual check: node qa/v10shot.mjs name...   (needs http.server on 8080)
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const errors=[];const missing=new Set();const only=process.argv.slice(2);
export async function shot(name,{cash=100,energy=200,width=1280,height=800,mobile=false,lang='zh',seed,after,storyDone=true}={}){
 if(only.length&&!only.includes(name))return;if(process.env.SHOT_LANG)lang=process.env.SHOT_LANG;
 const c=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
 const run=newRun();run.cash=cash*100;run.life.energy=energy;if(storyDone){run.life.v9=run.life.v9||{};}
 if(seed)seed(run);markPeak(run);
 if(storyDone){const v=run.life.v9||(run.life.v9={});v.story={seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{t0:'night',t1:'calm',t2:'proud'}};}
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true,lang,introLang:true}});
 const p=await c.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>errors.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error')errors.push(name+' console: '+m.text().slice(0,200));});
 try{await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
  const l=p.locator(`#v8-intro [data-l="${lang}"]`);if(await l.count())await l.click({timeout:60000});const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(900);
  await p.locator('[data-action="onboard-play"]').click({timeout:20000});await p.waitForTimeout(2200);
  if(after)await after(p);
  const miss=await p.evaluate(()=>[...(globalThis.__i18nMissing||[])]);for(const m of miss)missing.add(name+'\t'+m);
 }catch(e){errors.push(name+' STEP: '+e.message.split('\n')[0]);}
 try{await p.screenshot({path:'qa/v10-'+name+'.png',timeout:60000});}catch(e){errors.push(name+' SHOT: '+e.message.split('\n')[0]);}
 await c.close();console.log('shot',name);
}
const clickA=async(p,a,v)=>{await p.evaluate(([a,v])=>{const b=[...document.querySelectorAll(`[data-action="${a}"]`+(v!=null?`[data-value="${v}"]`:''))].find(b=>b.offsetParent!==null);b?.click();},[a,v]);await p.waitForTimeout(900);};
await shot('story',{cash:600,storyDone:false,seed:r=>{r.life.v9={story:{seen:[0],picks:{t0:'heir'}}};}});
await shot('hospital',{cash:80000,seed:r=>{r.estate&&(r.estate.health=1);r.offer={id:'h1',type:'v9-place',place:'hospital',opts:['clinic','specialist','ward','checkup'],settled:false,city:'taipei',rarity:'rare'};}});
await shot('medical',{cash:80000,seed:r=>{r.estate&&(r.estate.health=1);r.offer={id:'h1',type:'v9-place',place:'hospital',opts:['clinic','specialist','ward','checkup'],settled:false,city:'taipei',rarity:'rare'};},after:async p=>{await clickA(p,'v9-place-go','1');await p.waitForTimeout(6000);}});
await shot('partners',{cash:8000000,energy:60,seed:r=>{r.life.v9={partners:{grandma:{bond:2,met:1,last:1},doctor:{bond:0,met:1,last:1}},lux:['goldwatch','handbag','champagne'],luxSeen:[],story:{seen:[],picks:{}}};r.offer={id:'p1',type:'v9-partner',partner:'trader',fee:640000,settled:false,city:'taipei',rarity:'epic'};}});
await shot('en',{cash:3000,lang:'en'});
await shot('rest',{cash:4000,energy:0,after:async p=>{await clickA(p,'next');await p.waitForTimeout(1500);}});
await shot('deal',{cash:5000,after:async p=>{for(let i=0;i<3;i++){await clickA(p,'next');}}});
await shot('rich',{cash:50000000,after:async p=>{for(let i=0;i<3;i++){await clickA(p,'next');}}});
await shot('richmenu',{cash:50000000,after:async p=>{await clickA(p,'menu');}});
(await import('fs')).writeFileSync('qa/v10-missing.txt',[...missing].join('\n'));
console.log('ERRORS',JSON.stringify(errors,null,1));await browser.close();
