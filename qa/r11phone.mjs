// R11 phone layout check: node qa/r11phone.mjs  -> qa/r11-phone-*.png
import {chromium,devices} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const only=process.argv.slice(2);const errs=[];
async function shot(name,dev,{cash=270,lang='zh',after}={}){if(only.length&&!only.includes(name))return;
 const c=await b.newContext(typeof dev==='string'?{...devices[dev]}:dev);
 const run=newRun();run.cash=cash*100;run.life.energy=160;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{t0:'night'}},maxTier:10};markPeak(run);
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true,lang,introLang:true,r9coachDone:true}});
 const p=await c.newPage();p.on('pageerror',e=>errs.push(name+': '+e.message));
 await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
 const l=p.locator(`#v8-intro [data-l="${lang}"]`);if(await l.count())await l.click({timeout:60000});
 const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(900);
 await p.locator('[data-action="onboard-play"]').click({timeout:60000});await p.waitForTimeout(2500);
 if(after)await after(p);
 await p.screenshot({path:'qa/r11-phone-'+name+'.png'});await c.close();console.log('shot',name);}
await shot('iphone13','iPhone 13 landscape');
await shot('pixel','Pixel 7 landscape');
await shot('se',{viewport:{width:667,height:375},deviceScaleFactor:2,isMobile:true,hasTouch:true});
await shot('desk',{viewport:{width:1327,height:719}});
console.log('ERR',errs);await b.close();
