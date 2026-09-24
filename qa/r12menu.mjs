// R12: intro variants + menus by completed runs. node qa/r12menu.mjs (http.server 8080) → /tmp/shots
import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
async function boot(tag,meta,shots){const c=await b.newContext({viewport:{width:1280,height:720}});
 await c.addInitScript(m=>{if(!sessionStorage.getItem('seeded')){if(m)localStorage.setItem('upshift-save-v3',JSON.stringify({version:3,meta:m}));sessionStorage.setItem('seeded','1');}},meta);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
 await p.locator('#v8-intro').waitFor({timeout:90000});
 for(const [ms,name,act] of shots){await p.waitForTimeout(ms);if(act)await act(p);await p.screenshot({path:`/tmp/shots/${tag}-${name}.png`});}
 const cjk=await p.evaluate(()=>{const t=document.body.innerText;return (t.match(/[\u4e00-\u9fff]+/g)||[]).slice(0,20);});
 console.log(tag,'errors',errs,'cjk',cjk);await c.close();}
const base={music:false,sound:false,low:true,motion:true};
await boot('fresh',null,[[1200,'load1'],[1800,'load2'],[1500,'load3'],[4000,'menu']]);
await boot('mid',{...base,runsDone:4,runCount:5},[[800,'tap'],[200,'story',p=>p.mouse.click(640,360)],[1500,'story2'],[5000,'menu']]);
await boot('vet',{...base,runsDone:8,runCount:9},[[1500,'logo'],[0,'menu',async p=>{await p.locator('.v8i-skip').click();await p.waitForTimeout(2500);}]]);
await b.close();
