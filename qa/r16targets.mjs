// R16: smoke-test each portal package. Unzip to /tmp/pkg/<t>, served at http://127.0.0.1:8092/<t>/. node qa/r16targets.mjs poki gamedistribution ...
import {chromium} from '@playwright/test';
const ts=process.argv.slice(2);
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
for(const t of ts){
 const c=await b.newContext({viewport:{width:1280,height:720}});const p=await c.newPage();const errs=[];const reqs=new Set();
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text().slice(0,140));});
 p.on('request',r=>{const u=new URL(r.url());if(u.hostname!=='127.0.0.1')reqs.add(u.hostname);});
 await p.goto(`http://127.0.0.1:8092/${t}/`,{timeout:120000});await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:120000});await p.waitForTimeout(6000);
 const st=()=>p.evaluate(()=>{const P=window.__platform;return {target:P.target,status:P.status,err:P.error||'',ads:!!P.ads,canReward:P.canReward(),music:window.__r14music.status().playing}});
 console.log(t,'loaded',JSON.stringify(await st()));
 if(await p.locator('#r15-gate').count())await p.click('#r15-gate').catch(()=>{});await p.waitForTimeout(1000);
 const play=p.locator('[data-action="onboard-play"]');if(await play.count())await play.first().click({force:true}).catch(()=>{});
 await p.waitForTimeout(4000);
 for(let i=0;i<4;i++){await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());await p.waitForTimeout(500);}
 await p.waitForTimeout(3000);
 const mid=await p.evaluate(()=>Promise.race([window.__platform.midgame().then(v=>'midgame '+v),new Promise(r=>setTimeout(()=>r('midgame pending>20s'),20000))]));
 console.log(t,'after play',JSON.stringify(await st()),mid,'prerolled',await p.evaluate(()=>!!window.__platform.prerolled));
 await p.screenshot({path:`qa/r16-${t}.png`,timeout:60000});
 console.log(t,'hosts',[...reqs].join(','));console.log(t,'errors',errs.slice(0,6).join(' | ')||'none');await c.close();
}
await b.close();
