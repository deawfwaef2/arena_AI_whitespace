// R13 fast start: late art arrives → HUD/frame/menu poster get their images. Also old (7+) menu.
import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
for(const rd of [0,8]){const c=await b.newContext({viewport:{width:1280,height:720}});
 await c.addInitScript(m=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('upshift-save-v3',JSON.stringify({version:3,meta:m}));sessionStorage.setItem('seeded','1');}},{music:false,sound:false,low:true,motion:false,runsDone:rd,runCount:rd+1,r9coachDone:true});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
 if(rd>=7){await p.locator('.v8i-skip').click({timeout:90000});}
 await p.locator('[data-action="onboard-play"]').waitFor({timeout:90000});await p.waitForTimeout(800);
 console.log(rd,'house bg has data:',await p.evaluate(()=>(document.querySelector('.r12-house')?.style.backgroundImage||'').slice(0,30)));
 await p.screenshot({path:`/tmp/shots/art-menu-${rd}.png`});
 await p.locator('[data-action="onboard-play"]').first().click({force:true});await p.waitForTimeout(3000);
 console.log(rd,'frame',await p.evaluate(()=>{const f=document.getElementById('v9-frame');return f?getComputedStyle(f).getPropertyValue('--frame').slice(0,40)+'|'+(f.style.cssText.slice(0,80)):'none';}),'errors',errs);
 await p.screenshot({path:`/tmp/shots/art-game-${rd}.png`});await c.close();}
await b.close();
