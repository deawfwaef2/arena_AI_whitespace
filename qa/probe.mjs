import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const [w,h,mob,cash,...pts]=process.argv.slice(2);
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:+w,height:+h},hasTouch:mob==='1',isMobile:mob==='1'});
const run=newRun();run.cash=+cash*100;markPeak(run);
await c.addInitScript(seed=>localStorage.setItem('upshift-save-v3',JSON.stringify(seed)),{version:3,run,meta:{music:false,sound:false,low:true}});
const p=await c.newPage();await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.locator('[data-action="onboard-play"]').click();await p.waitForTimeout(2000);
for(const pt of pts){const [x,y]=pt.split(',').map(Number);console.log(pt,await p.evaluate(([x,y])=>document.elementsFromPoint(x,y).slice(0,6).map(e=>e.tagName+'#'+e.id+'.'+String(e.className).slice(0,40)).join(' | '),[x,y]));}
await b.close();
