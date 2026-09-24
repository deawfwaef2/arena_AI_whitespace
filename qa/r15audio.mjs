// R15 audio: gate → menu BGM → click SFX → in-game ambience. node qa/r15audio.mjs [mobile]
import {chromium,devices} from '@playwright/test';
const mobile=process.argv[2]==='mobile';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=user-gesture-required']});
const c=await b.newContext(mobile?{viewport:{width:844,height:390},screen:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:devices['iPhone 13'].userAgent}:{viewport:{width:1280,height:720}});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text().slice(0,160));});
await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:120000});await p.waitForTimeout(1500);
const st=()=>p.evaluate(()=>({m:window.__r14music.status(),s:window.__r15sound.status(),gate:!!document.getElementById('r15-gate')}));
console.log('before',JSON.stringify(await st()));
await p.screenshot({path:'qa/r15-gate'+(mobile?'-m':'')+'.png',timeout:60000});
if(mobile)await p.tap('#r15-gate').catch(e=>errs.push('gate '+e.message.split('\n')[0]));else await p.click('#r15-gate').catch(e=>errs.push('gate '+e.message.split('\n')[0]));
await p.waitForTimeout(2500);console.log('after gate',JSON.stringify(await st()));
const play=p.locator('[data-action="onboard-play"]');if(await play.count())await play.first().click({force:true});await p.waitForTimeout(3000);
for(let i=0;i<4;i++){await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());await p.waitForTimeout(600);}
await p.waitForTimeout(4000);console.log('in game',JSON.stringify(await st()));
console.log(errs.join('\n'));await b.close();
