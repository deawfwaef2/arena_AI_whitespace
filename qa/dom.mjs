import {chromium} from '@playwright/test';
import {newRun,markPeak} from '../src/engine.js';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:1280,height:800}});
const run=newRun();run.cash=+(process.argv[2]||100)*100;markPeak(run);
await c.addInitScript(seed=>localStorage.setItem('upshift-save-v3',JSON.stringify(seed)),{version:3,run,meta:{music:false,sound:false,low:true}});
const p=await c.newPage();await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.locator('[data-action="onboard-play"]').click();await p.waitForTimeout(2000);
console.log(await p.evaluate(()=>[...document.getElementById('game-dock').children].map(e=>e.tagName+'.'+e.className+' ['+[...e.children].map(x=>x.className||x.tagName).join(',')+']').join('\n')));
await b.close();
