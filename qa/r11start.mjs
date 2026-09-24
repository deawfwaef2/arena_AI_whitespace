import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
for(const [w,h,lang] of [[1327,719,'zh'],[1327,719,'en']]){const c=await b.newContext({viewport:{width:w,height:h}});
const run=newRun();run.cash=90000;markPeak(run);
await c.addInitScript(([l,run])=>{localStorage.setItem('upshift-save-v3',JSON.stringify({version:3,run,meta:{layout:'street',lang:l,introLang:true,music:false,sound:false,low:true}}));},[lang,run]);
const p=await c.newPage();await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});const sk=p.locator('.v8i-skip');if(await sk.count())await sk.click();await p.waitForTimeout(1500);
const info=await p.evaluate(()=>{const r=e=>{const q=document.querySelector(e);if(!q)return null;const b=q.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]};return {btn:r('[data-action="onboard-play"]'),foot:r('.start-footer')};});console.log(lang,JSON.stringify(info));
await p.screenshot({path:`qa/r11-start-${lang}.png`});await c.close();}
await b.close();
