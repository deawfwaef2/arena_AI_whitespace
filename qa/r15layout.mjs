// R15 layout probe: node qa/r15layout.mjs W H [phone] [tag]
import {chromium,devices} from '@playwright/test';
const W=+process.argv[2],H=+process.argv[3],phone=process.argv[4]==='phone',tag=process.argv[5]||`${W}x${H}`;
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext(phone?{viewport:{width:W,height:H},screen:{width:W,height:H},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:devices['iPhone 13'].userAgent}:{viewport:{width:W,height:H}});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8080/',{timeout:120000});await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:120000});await p.waitForTimeout(1200);
console.log(tag,await p.evaluate(()=>[document.documentElement.dataset.vscale,window.__vscale,innerWidth,innerHeight,document.documentElement.dataset.mq]));
const gate=p.locator('#r15-gate');if(await gate.count()){phone?await gate.tap():await gate.click();await p.waitForTimeout(600);}
await p.screenshot({path:`qa/r15-${tag}-menu.png`,timeout:60000});
const play=p.locator('[data-action="onboard-play"]');if(await play.count())await play.first().click({force:true});await p.waitForTimeout(3000);
await p.waitForTimeout(2500);await p.screenshot({path:`qa/r15-${tag}-story.png`,timeout:60000});
for(let i=0;i<4;i++){await p.evaluate(()=>document.querySelector('[data-action="v9-story"]')?.click());await p.waitForTimeout(500);}
await p.waitForTimeout(1500);await p.screenshot({path:`qa/r15-${tag}-game.png`,timeout:60000});
const got=p.getByText(/Got it|知道了/);for(let i=0;i<3;i++){if(await got.count()){await got.first().click({force:true}).catch(()=>{});await p.waitForTimeout(400);}}
const tap=p.locator('[data-action="v9-tap"]').first();for(let i=0;i<3;i++){await tap.click({timeout:8000}).catch(e=>errs.push('tap '+e.message.split('\n')[0]));await p.waitForTimeout(250);}
console.log('work',await p.evaluate(()=>document.querySelector('.v9-work-bar span')?.textContent));
await p.screenshot({path:`qa/r15-${tag}-game2.png`,timeout:60000});
console.log(errs.join('\n'));await b.close();
