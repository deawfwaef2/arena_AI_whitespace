// R13 trailer capture: REAL game, scripted input, virtual clock → smooth frames on slow GPUs.
// node qa/capture-r13.mjs [seg...]  (http.server 8080) → /tmp/frames/<seg>/0000.jpg (15 fps game time) + <seg>.json (tap/camera hints)
import {chromium} from '@playwright/test';
import {newRun,makeOffer,markPeak} from '../src/engine.js';
import fs from 'node:fs';
const STEP=66;
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-dev-shm-usage']});
const only=process.argv.slice(2);
const FX=`(()=>{const st=document.createElement('style');st.textContent='.rec-tap{position:fixed;z-index:99999;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;border:6px solid #ffd54a;background:rgba(255,213,74,.35);pointer-events:none;animation:rt .4s ease-out forwards}@keyframes rt{from{transform:scale(.4);opacity:1}to{transform:scale(1.6);opacity:0}}#r9-coach,#r12-spot,#r13-tip,#r13-spot,.r12-ad,#r13-sp{display:none!important}';document.head.append(st);addEventListener('pointerdown',e=>{const d=document.createElement('div');d.className='rec-tap';d.style.left=e.clientX+'px';d.style.top=e.clientY+'px';document.body.append(d);setTimeout(()=>d.remove(),450);},true);
 const g=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=a=>{if(window.__rig&&a instanceof Uint32Array&&a.length===1){a[0]=window.__rig==='win'?1000:4294960000;return a;}return g(a);};})()`;
async function seg(name,{cash=100,city='taipei',secs=5,seed,act}){
 if(only.length&&!only.includes(name))return;
 const dir='/tmp/frames/'+name;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
 const c=await b.newContext({viewport:{width:1280,height:720}});
 const run=newRun();run.cash=Math.round(cash*100);run.life.city=city;run.life.v9={story:{seen:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],picks:{t0:'night'}},maxTier:10};if(seed)seed(run);markPeak(run);
 await c.addInitScript(seed=>{localStorage.setItem('upshift-save-v3',JSON.stringify(seed));},{version:3,run,meta:{music:false,sound:false,low:true,motion:true,lang:'en',r9coachDone:true,r9coach:4,runsDone:1,runCount:2,tutorial31:true,r13seen:{project:1,'v9-work':1,rest:1,'v12-city':1}}});
 const p=await c.newPage();p.on('pageerror',e=>console.log(name,'PE',e.message));
 await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
 await p.locator('[data-action="onboard-play"]').first().waitFor({timeout:90000});await p.waitForTimeout(500);await p.locator('[data-action="onboard-play"]').first().click({force:true});
 await p.waitForTimeout(2500);await p.evaluate(FX);
 await p.clock.install();const cdp=await c.newCDPSession(p);
 const n=Math.round(secs*1000/STEP);const t0=Date.now();const hints=[];
 const box=async sel=>p.evaluate(s=>{const el=[...document.querySelectorAll(s)].find(e=>{const r=e.getBoundingClientRect();return r.width>4&&!e.disabled&&r.bottom>0&&r.top<innerHeight;});if(!el)return null;const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,l:r.left,w:r.width};},sel);
 for(let i=0;i<n;i++){
  const h=await act(i,p,box)||{};hints.push(h);
  await p.clock.fastForward(STEP-17);await p.clock.runFor(17);
  const shot=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:90,optimizeForSpeed:true});fs.writeFileSync(`${dir}/${String(i).padStart(4,'0')}.jpg`,Buffer.from(shot.data,'base64'));
  if(i%20===0)console.log(name,i,'/',n,((Date.now()-t0)/(i+1)|0)+'ms/f');
 }
 fs.writeFileSync(`/tmp/frames/${name}.json`,JSON.stringify(hints));await c.close();console.log('done',name,n);}
const click=async(p,b)=>{if(b){await p.mouse.click(b.x,b.y);return {tap:[b.x,b.y]};}};
const modalBtn='#modal-card [data-action]:not([data-action="close"])';
// 1) tap tap tap → paid → coins fly to the top-left counter
await seg('tap',{cash:100,secs:6.5,act:async(i,p,box)=>{
 const m=await box(modalBtn);if(m&&i%8===0)return click(p,m);
 const t=await box('[data-action="v9-tap"]');if(t)return click(p,t);
 if(i%6===0)return click(p,await box('#game-dock [data-action="next"]'));}});
// 2) level up: cross the $3,000 line → unlock celebration + class promotion
await seg('level',{cash:2960,secs:6,act:async(i,p,box)=>{
 const m=await box(modalBtn);if(m){return i%22===0?click(p,m):{};}
 const t=await box('[data-action="v9-tap"]');if(t)return click(p,t);
 if(i%8===0)return click(p,await box('#game-dock [data-action="next"]'));}});
// 3) invest: drag the stake slider up, press INVEST, big win
const invest=(from,to,rig)=>async(i,p,box)=>{
 const m=await box(modalBtn);if(m&&i>60&&i%20===0)return click(p,m);
 if(i===4){const r=await box('#stake-range');if(r){p.__r=r;await p.mouse.move(r.l+r.w*from,r.y);await p.mouse.down();return {tap:[r.l+r.w*from,r.y],hold:1};}}
 if(i>4&&i<=22&&p.__r){const k=(i-4)/18,e=k<.5?2*k*k:1-(-2*k+2)**2/2;const x=p.__r.l+p.__r.w*(from+(to-from)*e);await p.mouse.move(x,p.__r.y);if(i===22)await p.mouse.up();return {drag:[x,p.__r.y]};}
 if(i===28){await p.evaluate(r=>window.__rig=r,rig);const g=await box('#v7-go, [data-action="invest"]');const h=await click(p,g);return {...h,invest:1};}
 if(i===34)await p.evaluate(()=>window.__rig=null);};
await seg('invest',{cash:6000,city:'tokyo',secs:6,seed:r=>{r.page=14;r.offer=makeOffer(r,{project:true});},act:invest(.02,.92,'win')});
await seg('bigwin',{cash:240000,city:'vegas',secs:5,seed:r=>{r.page=30;r.offer=makeOffer(r,{project:true});},act:invest(.1,1,'win')});
// 4) ALL IN … and lose everything
await seg('allin',{cash:9500000,city:'monaco',secs:7,seed:r=>{r.page=60;r.offer=makeOffer(r,{project:true});r.offer.maxStake=Math.max(r.offer.maxStake||0,r.cash);},act:invest(.15,1,'lose')});
await b.close();
