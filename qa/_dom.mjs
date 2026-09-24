import {chromium,devices} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:844,height:390},screen:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});
const p=await c.newPage();
await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:120000});await p.waitForTimeout(1000);
await p.locator('#r15-gate').tap().catch(()=>{});await p.waitForTimeout(900);
const play=p.locator('[data-action="onboard-play"]');if(await play.count())await play.first().click({force:true});await p.waitForTimeout(3000);
console.log('STORY',await p.evaluate(()=>{const m=document.querySelector('#modal-card')||document.querySelector('.modal');const out=[];for(const el of document.querySelectorAll('#modal,#modal *')){const r=el.getBoundingClientRect();if(r.height>60&&el.children.length&&out.length<12)out.push(el.tagName+'.'+[...el.classList].join('.')+'#'+el.id+' '+[r.x,r.y,r.width,r.height].map(Math.round).join(','));}return out;}));
for(let i=0;i<4;i++){await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());await p.waitForTimeout(500);}
await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const pick=(x,y)=>{let e=document.elementFromPoint(x,y);const chain=[];while(e&&e!==document.body&&chain.length<7){const r=e.getBoundingClientRect();chain.push(e.tagName+'.'+[...e.classList].slice(0,3).join('.')+(e.id?'#'+e.id:'')+' ['+[r.x,r.y,r.width,r.height].map(Math.round)+']');e=e.parentElement;}return chain.join(' < ');};
return {money:pick(60,40),status:pick(600,15),thr:pick(1050,20),thrIcons:pick(1010,100),event:pick(1100,300),dock:pick(40,520)};}));
await b.close();
