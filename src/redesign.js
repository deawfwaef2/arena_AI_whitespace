import {getCity,classIndex,CLASSES} from './life-core.js';
import {worth,billQuote,TIERS_LATE,lateTier} from './endgame-core.js';
import {nextUnlock} from './life-core.js';
import {escape as safe} from './ui.js';
// Single in-world interface. Legacy layout preferences migrate without touching the run.
export const LAYOUTS=[{id:'street',name:'沉浸街头'}];
export function applyLayout(meta){meta.layout='street';const app=document.getElementById('app');app.dataset.layout='street';app.dataset.redesign='true';document.body.dataset.layout='street';document.body.dataset.device=meta.device==='phone'?'phone':'desktop';document.documentElement.style.setProperty('--ui-scale',1);}
export function studioMarkup(meta,run){const city=getCity(run);return `<div class="street-start" style="--start-art:url('${window.UPSHIFT_ART?.[city.id]||''}')"><div class="start-brand">BROKE TO BILLIONAIRE <span>THE $100 START</span></div><div class="start-copy"><div class="start-edition">从一条街，到一整个世界。</div><h1 id="start-title">身无长物。<br>前路<span>有光。</span></h1><p>口袋里的一百块，是故事的第一行。<br>街头投资、陌生人的目光，和慢慢为你打开的城市。</p><button class="start-primary" data-action="onboard-play">${run.page>1?'继续第 '+run.page+' 站':'开始游戏 · $100'} <span>↗</span></button><button class="start-help" data-action="onboard-tour">第一次来？看看怎么玩 →</button><small>完整离线 · 自动保存 · 纯虚拟游戏币</small></div><div class="start-location">01 / ${safe(city.en)}<b>${safe(city.name)}，下一条街见。</b></div><div class="start-footer">世界不需要一开始就很大。<span>STREET EDITION / 6.0</span></div></div>`;}
export function installRedesign(ctx){const app=document.getElementById('app'),game=document.getElementById('game');
 game.insertAdjacentHTML('beforeend',`<div id="street-identity" class="street-identity"></div><button id="wallet-bill" data-action="life-prompt-rest" aria-label="查看下次休息账单"></button><div id="energy-ribbon"><div><b>⚡ 行动力</b><span id="energy-ribbon-value"></span></div><div class="energy-ribbon-track"><i id="energy-ribbon-fill"></i></div></div><nav id="game-navigation" class="street-nav" aria-label="已解锁的街头功能"><button data-action="life-prompt-rest" title="休息与恢复">☾ <span>休息</span></button><button data-action="life-map">◎ <span>旅行</span></button><button data-action="life-status">▤ <span>身家</span></button><button data-action="menu" aria-label="暂停与存档设置">⚙ <span>设置</span></button></nav><div class="street-sign" id="street-sign"></div><button id="next-tier-chip" data-action="life-mechanisms" aria-label="下一级财富门槛"></button><div id="street-quips" aria-live="polite"></div>`);
 // One flow column owns every HUD chip, so nothing can overlap no matter how long the text gets.
 const rail=document.createElement('div');rail.id='hud-rail';game.append(rail);
 for(const id of ['wallet-bill','energy-ribbon','next-tier-chip','game-navigation'])rail.append(document.getElementById(id));
 const bottomRail=document.createElement('div');bottomRail.id='hud-rail-bottom';game.append(bottomRail);
 const compact=()=>{app.dataset.compact=String(app.clientWidth<760);game.dataset.compact=app.dataset.compact;ctx.world.resize();};new ResizeObserver(compact).observe(app);window.addEventListener('resize',compact);
 function refresh(){const s=ctx.run(),w=worth(s),city=getCity(s),cl=classIndex(s);app.dataset.wealth=w>=10000000?'rich':w>=50000?'growing':'poor';game.dataset.city=city.id;game.dataset.streetStage=w>=50000?'open':'humble';game.style.setProperty('--city-accent',city.color);document.getElementById('street-identity').textContent=`${TIERS_LATE[lateTier(s)].name}阶级 · ${city.name}`;
 const bottom=document.getElementById(app.dataset.compact==='true'?'hud-rail':'hud-rail-bottom');const pano=document.getElementById('city-panorama');if(pano&&pano.parentNode!==bottom)bottom.append(pano);const bar=document.getElementById('milestone-progress-bar');if(bar&&bar.parentNode!==bottom)bottom.append(bar);const q=s.life.rest?.bill||billQuote(s);const m=n=>'$'+(n/100).toLocaleString('en-US',{maximumFractionDigits:0,notation:n>=1e8?'compact':'standard'});document.getElementById('wallet-bill').innerHTML=`<span>${s.life.rest?.paid?'本期已结清':'下次休息'} <b>−${m(q.total)}</b></span><small>门槛 ${m(q.classFloor??TIERS_LATE[lateTier(s)].at*100)} · 保级现金 ${m(q.keepCash||0)}</small>`;document.getElementById('energy-ribbon-value').textContent=`${s.life.energy} / ${s.life.energyCap}`;document.getElementById('energy-ribbon-fill').style.width=(s.life.energy/s.life.energyCap*100)+'%';document.getElementById('energy-ribbon').classList.toggle('low',s.life.energy<30);game.style.setProperty('--district-art',`url('${window.UPSHIFT_ART?.['ui-'+city.id]||''}')`);
 const nav=document.getElementById('game-navigation');nav.querySelector('[data-action="life-map"]').hidden=w<50000;nav.querySelector('[data-action="life-status"]').hidden=w<50000;nav.querySelector('[data-action="life-prompt-rest"]').hidden=w<25000&&s.life.energy>30&&!s.life.rest;
 // Next wealth gate is shown right next to the money, not buried in a menu.
 const chip=document.getElementById('next-tier-chip'),next=nextUnlock(s),tierNow=lateTier(s),tierNext=TIERS_LATE[tierNow+1];
 const gate=next?{label:next.title,at:next.at*100,kind:'机制'}:tierNext?{label:tierNext.name+'阶级',at:tierNext.at*100,kind:'阶级'}:null;
 if(gate){const gap=Math.max(0,gate.at-w);chip.hidden=false;chip.innerHTML=`<span class="ntc-icon">${next?'🔓':'👑'}</span><span><small>下一级门槛 · ${gate.kind}</small><b>${m(gate.at)} → ${safe(gate.label)}</b><span class="ntc-gap">还差 ${m(gap)}</span></span>`;}
 else{chip.hidden=false;chip.innerHTML='<span class="ntc-icon">👑</span><span><small>全部门槛已达成</small><b>点击查看机制图谱</b></span>';}
 // Travel and challenge entries must read as opportunities, not tiny icons.
 const travel=nav.querySelector('[data-action="life-map"]');
 const hasChallenge=!!s.activeChallenge;
 travel.classList.toggle('nav-alert',!travel.hidden&&!hasChallenge);
 travel.innerHTML=travel.hidden?travel.innerHTML:`◎ <span>旅行去别的城市</span>${hasChallenge?'<i class="nav-dot">!</i>':''}`;
 document.getElementById('street-sign').innerHTML=`<span>${safe(city.en)} / ${String(s.page).padStart(3,'0')}</span><b>${safe(city.tag)}</b>`;
 }
 applyLayout(ctx.meta());compact();refresh();return {refresh,compact};}
