import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
const net=[];p.on('response',r=>{if(/api|auth/i.test(r.url())&&r.request().method()!=='GET')net.push(r.status()+' '+r.url());});
await p.goto('https://developer.playgama.com/auth',{timeout:60000}); await p.waitForTimeout(6000);
await p.locator('button:has-text("Dismiss")').first().click({timeout:3000}).catch(()=>{});
await p.fill('input[placeholder="Enter your email"]','3298336285@qq.com');
await p.locator('button:has-text("Sign Up")').first().click();
await p.waitForTimeout(4000);
const pw=p.locator('input[type=password]:visible');
console.log('pw visible',await pw.count());
if(await pw.count()){await pw.first().fill(process.env.PW);await p.locator('button:has-text("Sign Up"):visible').last().click();await p.waitForTimeout(8000);}
console.log(p.url());console.log(net.join('\n'));
console.log((await p.innerText('body')).slice(0,800));
await p.screenshot({path:'/tmp/reg.jpg',type:'jpeg',quality:55});
await b.close();
