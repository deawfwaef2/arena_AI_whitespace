// R16: GameDistribution developer registration attempt.
import {chromium} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--disable-blink-features=AutomationControlled']});
const ctx=await b.newContext({viewport:{width:1280,height:900},locale:'en-US',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'});
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>undefined}));
const p=await ctx.newPage();
await p.goto('https://gamedistribution.com/developers/partnership/',{timeout:60000});await p.waitForTimeout(5000);
await p.click('#onetrust-accept-btn-handler').catch(()=>{});await p.waitForTimeout(800);
const form=p.locator('form').filter({has:p.locator('#firstName')}).first();
await form.locator('#firstName').fill('Eric');await form.locator('#lastName').fill('Smith');await form.locator('#email').fill('3298336285@qq.com');
await form.locator('#company').fill('Deawfwaef Games');await form.locator('#website').fill('deawfwaef2.github.io/arena_AI_whitespace');
await form.locator('button[id^=headlessui-listbox-button]').click();await p.waitForTimeout(600);
await p.keyboard.type('China',{delay:80});await p.waitForTimeout(500);
const opt=p.locator('[role=option]',{hasText:/^\s*China\s*$/}).first();if(await opt.count())await opt.click();else console.log('no China option');
console.log('country:',await form.locator('button[id^=headlessui-listbox-button]').innerText());
for(const n of ['terms','termsAzc']){const el=form.locator(`input[name=${n}]`);await el.evaluate(e=>{const l=e.closest('label')||document.querySelector(`label[for="${e.id}"]`);(l||e).click();});console.log(n,await el.isChecked());}
const fr=p.frameLocator('iframe[src*="recaptcha/api2/anchor"]').first();await fr.locator('#recaptcha-anchor').click();await p.waitForTimeout(5000);
const checked=await fr.locator('#recaptcha-anchor').getAttribute('aria-checked');console.log('recaptcha checked:',checked);
await form.screenshot({path:'/tmp/gd-filled.png'});await p.screenshot({path:'/tmp/gd-page.png'});
if(checked==='true'){await form.locator('button[type=submit]',{hasText:'Registration'}).click();await p.waitForTimeout(8000);await p.screenshot({path:'/tmp/gd-after.png'});console.log('submitted; url',p.url());console.log((await p.locator('body').innerText()).slice(0,500));}
await b.close();
