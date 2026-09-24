import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const c=await b.newContext({viewport:{width:1280,height:720}});
await c.addInitScript(m=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('upshift-save-v3',JSON.stringify({version:3,meta:m}));sessionStorage.setItem('seeded','1');}},{music:false,sound:false,low:true,motion:false});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
const leaks=new Set();const cjk=async tag=>{const t=await p.evaluate(()=>document.body.innerText);(t.match(/[\u4e00-\u9fff][^\n]{0,40}/g)||[]).forEach(x=>leaks.add(tag+': '+x));};
await p.locator('[data-action="onboard-tour"]').waitFor({timeout:90000});await p.locator('[data-action="onboard-tour"]').click({force:true});
for(let i=0;i<3;i++){await p.waitForTimeout(600);await cjk('tour'+i);await p.screenshot({path:`/tmp/shots/tour${i}.png`});await p.locator('[data-action="onboard-next"]').click({force:true}).catch(()=>{});}
await p.waitForTimeout(2000);
const r=p.locator('[data-action="restart"], [data-action="new-run"]');console.log('restart btns',await r.count());
if(await r.count()){await r.first().click({force:true});await p.waitForTimeout(1500);await cjk('confirm');await p.screenshot({path:'/tmp/shots/confirm.png'});
 const ok=p.locator('.confirm-yes, [data-confirm="yes"], button:has-text("Restart"), button:has-text("Confirm")');console.log('ok',await ok.count());}
console.log('errors',errs);console.log([...leaks].join('\n'));await b.close();
