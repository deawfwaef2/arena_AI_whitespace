// R12: first-play English sweep: spotlight, CJK leak check, screenshots. node qa/r12play.mjs
import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const c=await b.newContext({viewport:{width:1280,height:720}});
await c.addInitScript(m=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('upshift-save-v3',JSON.stringify({version:3,meta:m}));sessionStorage.setItem('seeded','1');}},{music:false,sound:false,low:true,motion:false});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
await p.locator('[data-action="onboard-play"]').waitFor({timeout:90000});await p.waitForTimeout(400);
await p.locator('[data-action="onboard-play"]').click({force:true});
const leaks=new Set();const cjk=async tag=>{const t=await p.evaluate(()=>document.body.innerText);(t.match(/[\u4e00-\u9fff][^\n]{0,30}/g)||[]).forEach(x=>leaks.add(tag+': '+x));};
await p.waitForTimeout(3500);await p.screenshot({path:'/tmp/shots/play0.png'});await cjk('start');
for(let i=0;i<40;i++){const t=p.locator('[data-action="v9-tap"]');if(await t.count()&&await t.first().isVisible()){await t.first().click({force:true}).catch(()=>{});}else{const n=p.locator('[data-action="next"]');if(await n.count()&&await n.first().isVisible())await n.first().click({force:true}).catch(()=>{});}await p.waitForTimeout(250);if(i%10==9)await cjk('loop'+i);}
await p.screenshot({path:'/tmp/shots/play1.png'});
for(const a of ['menu','settings','help']){const bt=p.locator(`[data-action="${a}"]`);if(await bt.count()){await bt.first().click({force:true}).catch(()=>{});await p.waitForTimeout(800);await cjk(a);await p.screenshot({path:`/tmp/shots/m-${a}.png`});await p.keyboard.press('Escape');await p.waitForTimeout(400);}}
console.log('errors',errs);console.log([...leaks].join('\n'));await b.close();
