// Deterministic gameplay capture for trailers (real game, autoplayed, virtual clock → smooth frames even on slow GPUs).
// node qa/capture-frames.mjs [segment...]   (http.server on 8080)  → /tmp/frames/<seg>/0000.jpg ... at 15 fps game-time
import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
import * as X from '../src/v12-core.js';
import fs from 'node:fs';
const STEP=66; // ms of game time per captured frame
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage',...(process.env.FLAGS?process.env.FLAGS.split(' '):[])]});
const only=process.argv.slice(2);
const TAP_FX=`(()=>{const st=document.createElement('style');st.textContent='.rec-tap{position:fixed;z-index:99999;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;border:5px solid #ffd54a;background:rgba(255,213,74,.35);pointer-events:none;animation:rt .45s ease-out forwards}@keyframes rt{from{transform:scale(.4);opacity:1}to{transform:scale(1.5);opacity:0}}.r9-coach,.v9-coach{display:none!important}';document.head.append(st);addEventListener('pointerdown',e=>{const d=document.createElement('div');d.className='rec-tap';d.style.left=e.clientX+'px';d.style.top=e.clientY+'px';document.body.append(d);setTimeout(()=>d.remove(),500);},true);})()`;
async function seg(name,{cash=100,energy=200,city='taipei',seed,secs=6,every=6,tapEvery=2,prefer=[],q='?adtest=1',before}={}){
 if(only.length&&!only.includes(name))return;
 const dir='/tmp/frames/'+name;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
 const c=await b.newContext({viewport:{width:1280,height:720}});
 const run=newRun();run.cash=cash*100;run.life.energy=energy;run.life.city=city;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10],picks:{t0:'night'}},maxTier:10};if(seed)seed(run);markPeak(run);
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{layout:'street',music:false,sound:false,low:true,motion:true,lang:'en',introLang:true,r9coachDone:true,coachDone:true}});
 const p=await c.newPage();p.on('pageerror',e=>console.log(name,'PE',e.message));
 await p.goto('http://127.0.0.1:8080/'+q,{waitUntil:'load',timeout:120000});
 const l=p.locator('#v8-intro [data-l="en"]');if(await l.count())await l.click({timeout:60000});
 const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();
 await p.locator('[data-action="onboard-play"]').waitFor({timeout:90000});await p.waitForTimeout(600);await p.locator('[data-action="onboard-play"]').click({timeout:60000,force:true});
 await p.waitForTimeout(2500);await p.evaluate(TAP_FX);
 if(before)await before(p);
 await p.clock.install();const cdp=await c.newCDPSession(p);await cdp.send('Animation.enable');await cdp.send('Animation.setPlaybackRate',{playbackRate:.05});
 const n=Math.round(secs*1000/STEP);let wait=0;const t0=Date.now();
 for(let i=0;i<n;i++){
  if(wait<=0){
   const box=await p.evaluate(pref=>{const vis=el=>{if(!el||el.disabled)return false;const r=el.getBoundingClientRect();return r.width>4&&r.height>4&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).opacity!=='0';};
    const q=s=>[...document.querySelectorAll(s)].filter(vis);
    const modal=q('#modal-card [data-action]').filter(b=>!/close|quit/.test(b.dataset.action));
    let el=modal.find(b=>/gold|primary|pay|claim/.test(b.className+' '+b.dataset.action))||modal[modal.length-1];
    if(!el)for(const s of pref){el=q(s)[0];if(el)break;}
    if(!el)el=q('[data-action="v9-tap"]')[0]||q('[data-action="invest"]')[0]||q('#game-dock [data-action="next"]')[0]||q('[data-action="next"]')[0];
    if(!el)return null;const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,a:el.dataset.action};},prefer);
   if(box){await p.mouse.click(box.x,box.y);}
   wait=box?.a==='v9-tap'?tapEvery:every;
  }
  wait--;
  const tC=Date.now();await p.clock.fastForward(STEP-17);await p.clock.runFor(17);if(process.env.BENCH)console.log('clock ms',Date.now()-tC);
  const tA=Date.now();const shot=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:88,optimizeForSpeed:true});fs.writeFileSync(`${dir}/${String(i).padStart(4,'0')}.jpg`,Buffer.from(shot.data,'base64'));if(process.env.BENCH)console.log('shot ms',Date.now()-tA);
  if(i%30===0)console.log(name,i,'/',n,((Date.now()-t0)/(i+1)|0)+'ms/f');
 }
 await c.close();console.log('done',name,n);}
const R=()=>0.3;
await seg('poor',{cash:100,secs:+(process.env.SECS||6.5),every:8});
await seg('invest',{cash:6000,city:'tokyo',secs:7,every:9,prefer:['[data-action="invest"]']});
await seg('promo',{cash:900,secs:4,every:14,seed:r=>{r.offer=X.promoOffer(r,R);},prefer:['[data-action="v12-promo"][data-value="pay"]']});
await seg('vegas',{cash:400000,city:'vegas',secs:4.5,every:10,seed:r=>{r.offer={id:'c1',type:'v9-place',place:'casino',opts:['roulette','slots','poker'],settled:false,city:'vegas',rarity:'rare'};},prefer:['[data-action="v9-place-go"]']});
await seg('rich',{cash:2000000000,city:'monaco',secs:5.5,every:9,prefer:['[data-action="invest"]']});
await b.close();
