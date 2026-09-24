// Phone probe: node qa/r14phone.mjs [w h] — emulates a landscape phone, times loading, screenshots.
import {chromium,devices} from '@playwright/test';
const W=+process.argv[2]||844,H=+process.argv[3]||390;
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:W,height:H},screen:{width:W,height:H},isMobile:false,hasTouch:true,deviceScaleFactor:2,userAgent:devices['iPhone 13'].userAgent});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text().slice(0,160));});
const t0=Date.now();await p.goto('http://127.0.0.1:8080/'+(process.env.Q||''),{waitUntil:'domcontentloaded',timeout:120000});
await p.waitForFunction(()=>{const l=document.getElementById('loading');return !l||l.hidden||getComputedStyle(l).display==='none'||getComputedStyle(l).opacity==='0';},null,{timeout:120000}).catch(e=>errs.push('loading never hidden'));
console.log('loading gone after',Date.now()-t0,'ms; vdesk',await p.evaluate(()=>[window.__vdesk,innerWidth,innerHeight,document.querySelector('meta[name=viewport]').content]));
await p.waitForTimeout(2500);await p.screenshot({path:'qa/r14-nomv-menu.png',timeout:60000});
const play=p.locator('[data-action="onboard-play"]');if(await play.count()){await play.first().click({timeout:20000}).catch(e=>errs.push('play '+e.message.split('\n')[0]));}
await p.waitForTimeout(3500);await p.screenshot({path:'qa/r14-nomv-game.png',timeout:60000});
console.log(errs.join('\n'));await b.close();
