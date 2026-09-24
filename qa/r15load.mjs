// Throttled phone load timing: node qa/r14load.mjs  (4 Mbps, 60ms RTT, CPU x4)
import {chromium,devices} from '@playwright/test';
const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:devices['iPhone 13'].userAgent});
const p=await c.newPage();const cdp=await c.newCDPSession(p);
await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:60,downloadThroughput:(+process.env.BW||4e6)/8,uploadThroughput:1e6/8});
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
const t0=Date.now();p.goto('http://127.0.0.1:8080/?nocache='+Date.now(),{timeout:300000}).catch(()=>{});
await p.waitForSelector('#loading',{timeout:120000}).catch(()=>{});console.log('loading screen visible',Date.now()-t0);
await p.waitForFunction(()=>!document.getElementById('loading')&&window.UPSHIFT_ART,null,{timeout:300000,polling:200});console.log('game ready',Date.now()-t0);
await p.waitForFunction(()=>window.UPSHIFT_ART&&window.UPSHIFT_ART['cg-rich'],null,{timeout:300000,polling:500});console.log('late art',Date.now()-t0);
await b.close();
