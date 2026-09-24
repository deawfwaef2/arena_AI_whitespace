// R16b: volume sliders in Settings; SFX bus back to full, ambience quieter. node qa/r16vol.mjs
import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:120000});await p.waitForTimeout(1500);
if(await p.locator('#r15-gate').count())await p.click('#r15-gate').catch(()=>{});await p.waitForTimeout(900);
const play=p.locator('[data-action="onboard-play"]');if(await play.count())await play.first().click({force:true}).catch(()=>{});await p.waitForTimeout(4000);
for(let i=0;i<4;i++){await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());await p.waitForTimeout(500);}
await p.waitForTimeout(2000);
const g=()=>p.evaluate(()=>{const s=window.__r15sound;return {master:s.master?.gain.value.toFixed(3),ui:s.uiBus?.gain.value.toFixed(3),amb:s.ambBus?.gain.value.toFixed(3),sfxVol:s.sfxVol,ambVol:s.ambVol}});
console.log('in game',JSON.stringify(await g()));
await p.evaluate(()=>{const b=document.createElement('button');b.dataset.action='settings';document.body.appendChild(b);b.click();b.remove();});await p.waitForTimeout(2500);
console.log('sliders',await p.locator('#music-volume,#sfx-volume,#amb-volume').count());
await p.screenshot({path:'qa/r16-settings.png',timeout:60000});
await p.evaluate(()=>{const s=document.getElementById('sfx-volume');s.value=40;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}));const a=document.getElementById('amb-volume');a.value=80;a.dispatchEvent(new Event('input',{bubbles:true}));a.dispatchEvent(new Event('change',{bubbles:true}));});
await p.waitForTimeout(1500);console.log('after slide',JSON.stringify(await g()),await p.locator('#sfx-volume-value').textContent());
const saved=await p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.includes('upshift'));return k?JSON.parse(localStorage[k]).meta:null});console.log('saved',saved?.sfxVolume,saved?.ambVolume);
console.log('errors',errs.join(' | ')||'none');await b.close();
