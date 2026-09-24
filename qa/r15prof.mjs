// CPU profile of boot (CPU x4, no network throttle): node qa/r15prof.mjs
import {chromium,devices} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:devices['iPhone 13'].userAgent});
const p=await c.newPage();const cdp=await c.newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.start');
const t0=Date.now();await p.goto('http://127.0.0.1:8080/?n='+Date.now(),{waitUntil:'commit'});
await p.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:300000,polling:100});const ready=Date.now()-t0;
const {profile}=await cdp.send('Profiler.stop');
const self=new Map();const byId=new Map(profile.nodes.map(n=>[n.id,n]));const dt=profile.timeDeltas;let tot=0;
profile.samples.forEach((id,i)=>{const n=byId.get(id);const k=n.callFrame.functionName+' @'+n.callFrame.lineNumber+':'+n.callFrame.columnNumber;self.set(k,(self.get(k)||0)+dt[i]);tot+=dt[i];});
console.log('ready',ready,'ms; sampled',Math.round(tot/1000),'ms');
[...self].sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,v])=>console.log(Math.round(v/1000),'ms',k.slice(0,120)));
// user timing
console.log(await p.evaluate(()=>performance.getEntriesByType('paint').map(e=>e.name+':'+Math.round(e.startTime))));
console.log(await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {resp:Math.round(n.responseEnd),dom:Math.round(n.domInteractive),dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd)};}));
await b.close();
