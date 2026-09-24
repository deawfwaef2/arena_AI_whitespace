import fs from 'node:fs/promises';
import {build,transform} from 'esbuild';
const cfg=JSON.parse(await fs.readFile('config.json','utf8'));
const production=process.argv.includes('--production');
if(production)cfg.allowDeveloperMode=false;
const folder=production?'build/production':'build/development';
const audio={}; // Round 9: music is written as lazy script packs (music-pack/<id>.js), NOT inlined, so index.html loads fast on phones.
const musicIds=[];for(const score of JSON.parse(await fs.readFile('assets/music/CITY-CREDITS.json','utf8')))musicIds.push(score.id);
const art={};for(const city of ['taipei','tokyo','vegas','singapore','newyork','monaco','luxury-texture','ivory-texture','ui-taipei','ui-tokyo','ui-vegas','ui-singapore','ui-newyork','ui-monaco','logo','cg-poor','cg-rich','menu-bg'])art[city]='data:image/webp;base64,'+(await fs.readFile('assets/art/'+city+'.webp')).toString('base64');
for(const f of await fs.readdir('assets/art/ic'))if(f.endsWith('.webp'))art['ic-'+f.replace('.webp','')]='data:image/webp;base64,'+(await fs.readFile('assets/art/ic/'+f)).toString('base64');
for(const f of await fs.readdir('assets/art/mg'))if(f.endsWith('.webp'))art['mg-'+f.replace('.webp','')]='data:image/webp;base64,'+(await fs.readFile('assets/art/mg/'+f)).toString('base64');
const scores=JSON.parse(await fs.readFile('assets/music/ORIGINAL-SCORES.json','utf8'));for(const score of scores)musicIds.push(score.id);
musicIds.unshift('menu');
// R15: BGM ships as plain MP3 files streamed by <audio> (was base64 JS packs decoded by WebAudio — too heavy on phones).
await fs.mkdir('music-pack',{recursive:true});
for(const f of await fs.readdir('music-pack'))if(f.endsWith('.js')||f.endsWith('.mp3')&&!musicIds.includes(f.slice(0,-4)))await fs.rm('music-pack/'+f);
for(const id of musicIds){const src=await fs.readFile('assets/music/'+id+'.mp3');let old=null;try{old=await fs.readFile('music-pack/'+id+'.mp3');}catch{}if(!old||!old.equals(src))await fs.writeFile('music-pack/'+id+'.mp3',src);}
// R15: sound effects. UI clicks are inlined (assets/sfx/ui.json, imported by src/sound.js); tier beds + street one-shots are lazy packs.
{const uri=async f=>'data:audio/mpeg;base64,'+(await fs.readFile('assets/sfx/'+f)).toString('base64');const ui={};for(const f of await fs.readdir('assets/sfx'))if(f.startsWith('ui-')&&f.endsWith('.mp3'))ui[f.slice(3,-4)]=await uri(f);await fs.writeFile('assets/sfx/ui.json',JSON.stringify(ui));
 await fs.mkdir('sfx-pack',{recursive:true});const put=async(id,val)=>{const body='(window.UPSHIFT_SFX=window.UPSHIFT_SFX||{})['+JSON.stringify(id)+']='+JSON.stringify(val)+';';let old='';try{old=await fs.readFile('sfx-pack/'+id+'.js','utf8');}catch{}if(old!==body)await fs.writeFile('sfx-pack/'+id+'.js',body);};
 for(let i=0;i<6;i++)await put('bed'+i,await uri('bed'+i+'.mp3'));const shots={};for(const f of await fs.readdir('assets/sfx'))if(!f.startsWith('ui-')&&!f.startsWith('bed')&&f.endsWith('.mp3'))shots[f.slice(0,-4)]=await uri(f);await put('shots',shots);}
const licenses='RECORDED MUSIC\n'+await fs.readFile('assets/music/MUSIC-LICENSES.md','utf8')+'\nSOUND EFFECTS (CC0)\n'+JSON.parse(await fs.readFile('assets/sfx/SFX-CREDITS.json','utf8')).map(c=>`${c.id}: "${c.title}" by ${c.author} — ${c.license} — ${c.source}`).join('\n')+'\n'+'\nTHREE.JS\n'+await fs.readFile('assets/THREE-LICENSE.txt','utf8')+'\nSPACE GROTESK\n'+await fs.readFile('assets/SPACE-GROTESK-LICENSE.txt','utf8');
const result=await build({entryPoints:['src/app.js'],bundle:true,minify:true,format:'iife',target:['es2020'],write:false,charset:'utf8',legalComments:'eof'});
const js=result.outputFiles[0].text.replaceAll('</script','<\\/script');
const font=await fs.readFile('assets/space-grotesk.woff2'); // R13: lossless WOFF2 (was 137 KB TTF)
const format=font.subarray(0,4).toString()==='wOF2'?'woff2':font.subarray(0,4).toString()==='wOFF'?'woff':'truetype';
const css=(await fs.readFile('src/style.css','utf8'))+'\n'+(await fs.readFile('src/life.css','utf8'))+'\n'+(await fs.readFile('src/readable.css','utf8'))+'\n'+(await fs.readFile('src/journey.css','utf8'))+'\n'+(await fs.readFile('src/capital.css','utf8'))+'\n'+(await fs.readFile('src/redesign.css','utf8'))+'\n'+(await fs.readFile('src/bold.css','utf8'))+'\n'+(await fs.readFile('src/contrast.css','utf8'))+'\n'+(await fs.readFile('src/v7.css','utf8'))+'\n'+(await fs.readFile('src/v8.css','utf8'))+'\n'+(await fs.readFile('src/intro.css','utf8'))+'\n'+(await fs.readFile('src/v9.css','utf8'))+'\n'+(await fs.readFile('src/v12.css','utf8'))+'\n'+(await fs.readFile('src/r9.css','utf8'))+'\n'+(await fs.readFile('src/r11.css','utf8'))+'\n'+(await fs.readFile('src/r12.css','utf8'))+'\n'+(await fs.readFile('src/r13.css','utf8'))+'\n'+(await fs.readFile('src/r14.css','utf8'));
const cssMin0=(await transform(css,{loader:'css',minify:true,logLevel:'error'})).code;
// R14: while the phone virtual canvas is active (html[data-vscale]) width/height media queries must not fire,
// because the real viewport is tiny but the layout is a virtual desktop. Prefix every rule inside such @media blocks.
// R15: size media queries are evaluated against the VIRTUAL canvas while body-scaling is active (phone + desktop zoom).
// Each size condition gets an id qN; the original rule is kept for the unscaled page (html:not([data-vscale])) and a copy
// without @media is emitted behind html[data-mq~="qN"]. src/vscale-boot.js evaluates window.__MQ against VW/VH.
const MQ=[];
function guardMedia(src){let out='',i=0;while(i<src.length){const m=src.indexOf('@media',i);if(m<0){out+=src.slice(i);break;}out+=src.slice(i,m);const b=src.indexOf('{',m);const cond=src.slice(m,b);let d=1,k=b+1;while(k<src.length&&d){if(src[k]==='{')d++;else if(src[k]==='}')d--;k++;}const body=src.slice(b+1,k-1);
 if(/width|height|orientation/.test(cond)){const c=cond.replace('@media','').trim();let q=MQ.indexOf(c);if(q<0){MQ.push(c);q=MQ.length-1;}
  const pre=(prefix)=>body.replace(/(^|})([^{}@]+)\{/g,(all,p0,sel)=>p0+sel.split(',').map(x=>{x=x.trim();if(/^(from|to|\d+%)$/.test(x))return x;if(x.startsWith(':root'))return prefix+x.slice(5);if(/^html(?![-\w])/.test(x))return prefix+x.slice(4);return prefix+' '+x;}).join(',')+'{');
  out+=cond+'{'+pre('html:not([data-vscale])')+'}'+pre(`html[data-mq~="q${q}"]`);}else out+=cond+'{'+body+'}';i=k;}return out;}
// R14: viewport units follow the virtual canvas while scaled (--u-vh/--u-vw set by vscale-boot.js).
const vUnits=src=>src.replace(/(-?\d*\.?\d+)(d|s|l)?(vh|vw|vmin|vmax)\b/g,(all,n,pre,u)=>`calc(${n}*var(--u-${u},1${pre||''}${u}))`);
const cssMin=vUnits(guardMedia(cssMin0));
const vscaleBoot=(await transform(await fs.readFile('src/vscale-boot.js','utf8'),{loader:'js',minify:true,logLevel:'error'})).code; // R13: minified CSS for faster first load
const LATE=new Set(['taipei','ui-taipei','ic-frame0','ic-frame1','ic-frame2','ic-frame3','ic-frame4','ic-frame5','tokyo','vegas','singapore','newyork','monaco','ui-tokyo','ui-vegas','ui-singapore','ui-newyork','ui-monaco','cg-poor','cg-rich','logo','luxury-texture','ivory-texture']);// R15: NPC portraits (ic-p-*) and rest mini-game art (mg-*) are not needed for the first screen -> late pack.
// The five non-starting city panoramas go to a third file (art-cities.js) fetched after art-pack.js finished.
const CITIES2=new Set(['tokyo','vegas','singapore','newyork','monaco','ui-tokyo','ui-vegas','ui-singapore','ui-newyork','ui-monaco']);
const artEarly={},artLate={},artCities={};for(const [k,v] of Object.entries(art))(CITIES2.has(k)?artCities:LATE.has(k)||k.startsWith('ic-p-')||k.startsWith('mg-')?artLate:artEarly)[k]=v;
const citiesPack='/* R15: other city panoramas */Object.assign(window.UPSHIFT_ART=window.UPSHIFT_ART||{},'+JSON.stringify(artCities)+');window.dispatchEvent(new Event("upshift-art"));';
const citiesHash=(await import('node:crypto')).createHash('sha1').update(citiesPack).digest('hex').slice(0,10);await fs.writeFile('art-cities.js',citiesPack);
// R14 load speed: late art is a separate async file (art-pack.js) so the phone only downloads ~3 MB before the game starts.
const artPack='/* R14: late art, streamed after boot */Object.assign(window.UPSHIFT_ART=window.UPSHIFT_ART||{},'+JSON.stringify(artLate)+');window.dispatchEvent(new Event("upshift-art"));setTimeout(function(){var s=document.createElement("script");s.src="art-cities.js?v='+citiesHash+'";s.async=true;document.head.appendChild(s);},1500);';
const artHash=(await import('node:crypto')).createHash('sha1').update(artPack).digest('hex').slice(0,10);
await fs.writeFile('art-pack.js',artPack);
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"><style>html[data-vscale]{overflow:hidden;height:100%}html[data-vscale] body{position:fixed!important;left:0;top:0;width:var(--vw)!important;height:var(--vh)!important;min-height:0!important;transform:scale(var(--vs));transform-origin:0 0;overflow:hidden}</style><script>window.__MQ=${JSON.stringify(MQ)};${vscaleBoot}</script><meta name="theme-color" content="#b8d7e9"><meta name="description" content="Start with $100. Swipe through endless investment opportunities, discover rare 3D estates, and build your own story. A fictional, virtual-money game."><title>Broke to Billionaire: The $100 Start</title><style>@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:400 700;font-display:swap;src:url(data:font/${format};base64,${font.toString('base64')}) format('${format}')}\n${cssMin}</style></head><body><div id="app"></div><div class="loading-screen" id="loading"><div><strong>Broke to Billionaire</strong><small>Loading…</small><div class="loading-line"></div></div></div><script>/* Publisher configuration. Never place a server API key here. */\nwindow.UPSHIFT_CONFIG=${JSON.stringify(cfg)};window.UPSHIFT_AUDIO=${JSON.stringify(audio)};window.UPSHIFT_ART=${JSON.stringify(artEarly)};</script><script>${js}</script><script src="art-pack.js?v=${artHash}" async></script><!-- Third-party licenses\n${licenses.replaceAll('--','—')}\n--></body></html>`;
await fs.mkdir(folder,{recursive:true});await fs.writeFile(folder+'/index.html',html);await fs.writeFile(folder+'/LICENSES.txt',licenses);await fs.copyFile('assets/music/LICENSE-PROVENANCE.json',folder+'/MUSIC-SOURCES.json');
await fs.copyFile('assets/music/ORIGINAL-SCORES.json',folder+'/ORIGINAL-SCORES.json');
await fs.copyFile('assets/music/CITY-CREDITS.json',folder+'/CITY-MUSIC-CREDITS.json');
console.log(`Built ${folder}/index.html: ${(Buffer.byteLength(html)/1024).toFixed(1)} KB. Embedded font: ${format}. All game assets offline.`);
