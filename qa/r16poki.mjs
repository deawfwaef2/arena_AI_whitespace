// R16: Poki "Request access" form. node qa/r16poki.mjs [submit]
import {chromium} from '@playwright/test';
const submit=process.argv[2]==='submit';
const b=await chromium.launch({args:['--no-sandbox']});const p=await (await b.newContext({viewport:{width:1280,height:900},userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'})).newPage();
await p.goto('https://developers.poki.com/guide/share',{timeout:60000});await p.waitForTimeout(5000);
const fill={name:'Eric Smith',email:'3298336285@qq.com',studioName:'Deawfwaef Games',country:'China',gameLinks:'https://deawfwaef2.github.io/arena_AI_whitespace/ (Broke to Billionaire: The $100 Start, HTML5, Poki SDK already integrated)',genres:'Simulation, Casual, Idle / Clicker, Strategy',engines:'Custom HTML5 / JavaScript (WebGL, no engine)'};
for(const [id,v] of Object.entries(fill))await p.fill('#'+id,v);
const pick={studioType:['Indie Studio'],platforms:['Web'],goals:['Releasing new titles','Using our developer tools']};
for(const id of ['studioType','platforms','goals']){await p.click('#'+id);await p.waitForTimeout(800);
 const wrap=p.locator('#'+id).locator('xpath=..');const labels=wrap.locator('label');const texts=await labels.allInnerTexts();console.log(id,JSON.stringify(texts));
 for(const [i,t] of texts.entries())if(pick[id].some(k=>t.toLowerCase().includes(k.toLowerCase())))await labels.nth(i).click();
 await p.click('#'+id,{force:true});await p.waitForTimeout(500);console.log(id,'->',await p.locator('#'+id).innerText());}
await p.screenshot({path:'/tmp/poki-filled.png',fullPage:true});
if(submit){await p.locator('button[type=submit]',{hasText:'Submit'}).click();await p.waitForTimeout(6000);console.log('after submit:',(await p.locator('main').innerText()).slice(0,600));await p.screenshot({path:'/tmp/poki-after.png',fullPage:true});}
await b.close();
