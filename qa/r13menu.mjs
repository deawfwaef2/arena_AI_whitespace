// R13: new player → straight to drag menu; drag coin along Z track; stage changes; reaching end starts the game.
import {chromium} from '@playwright/test';
const vw=+(process.argv[2]||1280),vh=+(process.argv[3]||720);
const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const c=await b.newContext({viewport:{width:vw,height:vh}});
await c.addInitScript(()=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('upshift-save-v3',JSON.stringify({version:3,meta:{music:false,sound:false,low:true,motion:true}}));sessionStorage.setItem('seeded','1');}});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t0=Date.now();await p.goto('http://127.0.0.1:8080/',{waitUntil:'load',timeout:120000});
await p.locator('#r13-zknob').waitFor({timeout:90000});console.log('menu visible after',Date.now()-t0,'ms; intro present:',await p.locator('#v8-intro').count());
await p.waitForTimeout(800);await p.screenshot({path:`/tmp/shots/z0-${vw}.png`});
const svg=await p.locator('.r13-zsvg').boundingBox();const P=(x,y)=>[svg.x+x/600*svg.width,svg.y+y/300*svg.height];
const k=await p.locator('#r13-zknob').boundingBox();await p.mouse.move(k.x+k.width/2,k.y+k.height/2);await p.mouse.down();
const path=[];for(let i=0;i<=20;i++)path.push(P(50+500*i/20,60));for(let i=1;i<=20;i++)path.push(P(550-500*i/20,60+180*i/20));for(let i=1;i<=20;i++)path.push(P(50+500*i/20,240));
let n=0;for(const [x,y] of path){await p.mouse.move(x,y);n++;if(n===15)await p.screenshot({path:`/tmp/shots/z1-${vw}.png`});if(n===35)await p.screenshot({path:`/tmp/shots/z2-${vw}.png`});if(n===58)await p.screenshot({path:`/tmp/shots/z3-${vw}.png`});}
await p.mouse.up();await p.waitForTimeout(2500);
console.log('started',await p.evaluate(()=>document.getElementById('start-screen')?.hidden),'errors',errs);await b.close();
