// Production artifact regression. BASE_URL=file:///.../index.html tests the extracted ZIP.
// BROWSER_OUT=/tmp/r17-shots PLAYWRIGHT_BROWSERS_PATH=... node qa/r17-windows.mjs [desktop|phone|large|reduced|offline]
import {chromium,devices} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const mode=process.argv[2]||'desktop',phone=mode==='phone',large=mode==='large',reduced=mode==='reduced';
const cycles=process.env.QUICK?1:12,races=process.env.QUICK?1:15;
const out=process.env.BROWSER_OUT||'/tmp/r17-shots';await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const opts={viewport:large?{width:1920,height:1080}:phone?{width:844,height:390}:{width:1280,height:800}};
if(phone)Object.assign(opts,{screen:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});
const c=await b.newContext(opts);const errors=[],log=[];
if(mode==='offline')await c.route(/^https?:/,r=>r.abort());
await c.addInitScript(({reduced})=>{if(!localStorage.getItem('upshift-save-v3'))localStorage.setItem('upshift-save-v3',JSON.stringify({version:3,meta:{music:false,sound:false,low:true,motion:!reduced,lang:'en',langSet:true}}));},{reduced});
const p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
const record=(name,data=true)=>{log.push({name,data});console.log(mode,name,JSON.stringify(data));};
const state=()=>p.evaluate(()=>{const el=document.querySelector('#modal-card'),r=el.getBoundingClientRect(),s=getComputedStyle(el),m=document.querySelector('#modal');return {x:r.x,y:r.y,w:r.width,h:r.height,opacity:+s.opacity,display:s.display,hidden:m.hidden,kind:m.dataset.kind,inert:document.querySelector('#game').inert,vw:innerWidth,vh:innerHeight,scale:window.__vscale||1};});
async function visible(kind){await p.waitForFunction(kind=>{const m=document.querySelector('#modal'),e=document.querySelector('#modal-card');return !m.hidden&&(!kind||m.dataset.kind===kind)&&+getComputedStyle(e).opacity===1;},kind);const s=await state();assert.equal(s.inert,true);assert.ok(s.x+s.w>40&&s.y+s.h>40&&s.x<s.vw-40&&s.y<s.vh-40,JSON.stringify(s));return s;}
async function closed(){await p.waitForFunction(()=>document.querySelector('#modal').hidden&&!document.querySelector('#game').inert);assert.equal(await p.evaluate(()=>document.querySelector('#modal-card').getAnimations().length),0);}
const action=async(a,root='#modal-card')=>{const el=p.locator(`${root} [data-action="${a}"]:visible`).first();await el.click();};
async function menu(){await action('menu','#game');await visible('menu');}
async function close(){await action('close');await closed();}
try{
 await p.goto(process.env.BASE_URL||'http://127.0.0.1:8080/',{timeout:120000});await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:120000});
 await p.screenshot({path:`${out}/${mode}-start.png`});
 await p.locator('[data-action="onboard-play"]').first().click();
 await visible('v9-story');
 await p.keyboard.press('Escape');await p.mouse.click(2,2);assert.equal((await state()).kind,'v9-story');assert.equal((await state()).hidden,false);record('story refuses Escape and backdrop');
 await p.locator('.v9-s-tile').first().click();await closed();
 await menu();await p.screenshot({path:`${out}/${mode}-menu.png`});
 await p.mouse.click(2,2);await visible('menu');record('backdrop cannot accidentally close menu');
 await close();
 // Keep UI/event-loop code untouched; throttle only expensive software WebGL
 // during stress loops. Real 3D is restored before the final visual captures.
 await p.evaluate(()=>{const r=window.__r14world.renderer,draw=r.render.bind(r);window.__r17restore=()=>{r.render=draw;};let last=0;r.render=(...a)=>{const now=performance.now();if(now-last>500){last=now;draw(...a);}};});
 for(let i=0;i<cycles;i++){
  await menu();const a=['history','settings','music','help'][i%4];
  await action(a);await visible(a==='help'?'life-guide':a);await close();
 }
 record(`${cycles} real menu → page → close cycles`);
 await menu();await action('settings');await visible('settings');
 // Settings repaint used to overlap in-flight open/close animations.
 const motion=p.locator('#modal-card [data-action="motion"]');
 if(await motion.count()){await motion.click();await visible('settings');await p.locator('#modal-card [data-action="motion"]').click();await visible('settings');record('motion off/on while dialog open');}
 await close();
 // Race probe: dispatch to REAL existing controls in successive event-loop turns
 // before the old 330ms close timeout would have expired.
 for(let i=0;i<races;i++){
  await menu();
  await p.evaluate(()=>document.querySelector('#modal-card [data-action="close"]').click());
  await p.evaluate(()=>[...document.querySelectorAll('#game [data-action="menu"]')].find(e=>e.offsetParent).click());
  await visible('menu');await p.waitForTimeout(360);await visible('menu');await close();
 }
 record(`${races} close/reopen races stay visible past old timer`);
 await menu();await p.waitForTimeout(400);
 // Tiny pointer jitter is a click, not a drag.
 let h=await p.locator('#modal-card .v7-handle').boundingBox(),before=await state();
 await p.mouse.move(h.x+30,h.y+15);await p.mouse.down();await p.mouse.move(h.x+32,h.y+17);await p.mouse.up();
 let after=await state();assert.ok(Math.abs(after.x-before.x)<2&&Math.abs(after.y-before.y)<2,JSON.stringify({before,after}));record('2px jitter never relocates window');
 // Use physical mouse coordinates; app converts them into its virtual canvas.
 for(const [x,y] of [[-400,-400],[2500,1800],[10,200]]){
  h=await p.locator('#modal-card .v7-handle').boundingBox();await p.mouse.move(h.x+35,h.y+15);await p.mouse.down();await p.mouse.move(x,y,{steps:5});await p.mouse.up();
  const s=await visible('menu');assert.ok(s.x>=-1&&s.y>=-1&&s.x+s.w<=s.vw+1&&s.y+s.h<=s.vh+1,JSON.stringify(s));
 }
 record('drag to all edges remains fully on screen',await state());
 // Interrupted drags must release capture and may not move the next dialog.
 h=await p.locator('#modal-card .v7-handle').boundingBox();await p.mouse.move(h.x+35,h.y+15);await p.mouse.down();await p.mouse.move(h.x+55,h.y+25);
 await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await p.mouse.up();assert.equal(await p.locator('.dragging').count(),0);record('blur releases drag');
 if(phone){
  const session=await c.newCDPSession(p);h=await p.locator('#modal-card .v7-handle').boundingBox();
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:h.x+35,y:h.y+15}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:800,y:350}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const ts=await visible('menu');assert.ok(ts.x>=-1&&ts.y>=-1&&ts.x+ts.w<=ts.vw+1&&ts.y+ts.h<=ts.vh+1,JSON.stringify(ts));
  record('real touch drag stays in bounds',ts);
 }
 await p.evaluate(()=>window.__r17restore?.());
 await p.screenshot({path:`${out}/${mode}-drag.png`});await close();await menu();
 assert.equal(await p.locator('#modal-card[data-moved]').count(),0);record('reopen resets position');
 // Resize after moving: no old inline pixel position may strand the window.
 h=await p.locator('#modal-card .v7-handle').boundingBox();await p.mouse.move(h.x+35,h.y+15);await p.mouse.down();await p.mouse.move(h.x+70,h.y+30);await p.mouse.up();
 await p.setViewportSize(phone?{width:900,height:412}:{width:1180,height:740});await p.waitForTimeout(450);await visible('menu');
 await p.waitForFunction(()=>!document.querySelector('#modal-card[data-moved]'));record('resize resets dragged layout',await state());
 await p.setViewportSize(opts.viewport);await p.waitForTimeout(450);
 await close();await p.screenshot({path:`${out}/${mode}-game.png`});
 if(mode==='offline'){
  await menu();await action('music');await visible('music');await action('music-toggle');
  await p.waitForFunction(()=>window.__r14music.status().playing,null,{timeout:20000});record('offline MP3 playback',await p.evaluate(()=>window.__r14music.status()));await close();
 }
 assert.deepEqual(errors,[]);record('page errors',errors);record('final',await state());
 await fs.writeFile(`${out}/${mode}.json`,JSON.stringify({mode,log,errors},null,2));
}finally{await b.close();}
