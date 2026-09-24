import {runsDone} from './intro.js';
import {studioMarkup,applyLayout,LAYOUTS} from './redesign.js';
const STEPS=[
 {number:'01',title:'看清风险，再投一笔。',body:'先看成功率与回报，选择投入金额，再点「投资」。普通项目失败，只损失这次投入。',example:'例如投入 $25，返还 ×1.80：成功拿回 $45；失败损失 $25。',icon:'↗'},
 {number:'02',title:'点击或右滑，遇见下一站。',body:'你有 200 点体力，可升级到 400。前进消耗 5，投资消耗 3。体力越少，天色越晚；用完就去休息。',example:'只前进约 40 站会耗尽体力。假期可慢慢恢复，也可花游戏币立即恢复。',icon:'→'},
 {number:'03',title:'钱变多，世界也会变大。',body:'随着金钱增加，更多机制会解锁。地图、自动过滤、利息和进阶界面，都能在沿途商店逐步买到。',example:'起步不用记住所有规则。先做好眼前的一次选择。',icon:'✦'}
];
export class Onboarding{
 constructor(ctx){this.c=ctx;this.preview={screen:'street',wealth:'poor',device:ctx.meta().device||'desktop'};this.active=false;this.step=0;this.mode='start';this.element=document.createElement('section');this.element.id='start-screen';this.element.className='start-screen';this.element.setAttribute('role','dialog');this.element.setAttribute('aria-modal','true');this.element.setAttribute('aria-labelledby','start-title');document.getElementById('app').append(this.element);
  document.addEventListener('keydown',e=>{if(!this.active)return;if(e.key==='Tab'){const buttons=[...this.element.querySelectorAll('button:not(:disabled)')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0]?.focus();}}if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(this.mode==='tutorial')this.finish();}if(e.key==='Enter'&&!e.target.closest('button')){e.preventDefault();e.stopImmediatePropagation();this.element.querySelector('.start-primary')?.click();}if(['ArrowRight','`'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();}},true);
 }
 show(){document.body.dataset.device='desktop';this.active=true;this.mode='start';this.element.hidden=false;this.c.block(true);document.getElementById('game').inert=true;document.getElementById('game').classList.add('at-start');this.c.world.setRest(null);this.c.world.setTitle(true);this.render();}
 tutorial(){this.active=true;this.mode='tutorial';this.step=0;this.element.hidden=false;this.c.block(true);document.getElementById('game').inert=true;document.getElementById('game').classList.add('at-start');this.c.world.setRest(null);this.c.world.setTitle(true);this.render();}
 render(){
  if(this.mode==='start'){
   const m=this.c.meta();this.element.innerHTML=(runsDone(m)>=7?studioMarkup(m,this.c.run(),this.preview):r12Menu(m,this.c.run()))+r12Ad(m);this.fillAd();}

  else{const s=STEPS[this.step];this.element.innerHTML=`<div class="tutorial-copy"><div class="tutorial-top"><span>快速上手</span><strong>${s.number} / 03</strong></div><div class="tutorial-progress">${STEPS.map((_,i)=>`<i class="${i<=this.step?'done':''}"></i>`).join('')}</div><div class="tutorial-icon">${s.icon}</div><h1 id="start-title">${s.title}</h1><p class="tutorial-body">${s.body}</p><div class="tutorial-example">${s.example}</div><button class="start-primary" data-action="onboard-next">${this.step===2?'明白了，出发！':'下一步'} <span>→</span></button><div class="tutorial-bottom">${this.step>0?'<button data-action="onboard-back">上一步</button>':'<span></span>'}<button data-action="onboard-skip">跳过教程</button></div></div><div class="start-world-label"><i></i>你始终是这段旅程的主角。</div>`;}
  if(this.mode==='tutorial')requestAnimationFrame(()=>this.element.querySelector('.start-primary')?.focus());
 }
 fillAd(){const el=document.getElementById('r12-menu-banner');const p=this.c.platform;if(!el||!p?.banner)return;p.banner('r12-menu-banner',320,100).then(ok=>{if(!ok&&el.isConnected)el.dataset.fallback='1';}).catch(()=>{});}
 finish(){this.c.platform?.clearBanner?.('r12-menu-banner');applyLayout(this.c.meta());this.c.meta().tutorial31=true;this.active=false;this.element.hidden=true;document.getElementById('game').inert=false;document.getElementById('game').classList.remove('at-start');this.c.world.setTitle(false);this.c.block(false);this.c.save();this.c.enter();}
 handle(a,v){
 if(a==='studio-toggle-device'){this.c.meta().device=this.c.meta().device==='phone'?'desktop':'phone';this.preview.device=this.c.meta().device;applyLayout(this.c.meta());this.c.save();this.c.world.resize();return true;}
 if(a.startsWith('studio-')){if(!this.active)return true;
  if(a==='studio-layout'&&LAYOUTS.some(x=>x.id===v))this.c.meta().layout=v;
  if(a==='studio-screen'&&['street','map','rest','assets'].includes(v))this.preview.screen=v;
  if(a==='studio-wealth'&&['poor','rich'].includes(v))this.preview.wealth=v;
  if(a==='studio-device'&&['desktop','phone'].includes(v)){this.preview.device=v;this.c.meta().device=v;}
  this.c.save();const scroll=this.element.scrollTop;this.render();this.element.scrollTop=scroll;
  this.element.querySelector(`[data-action="${a}"][data-value="${v}"]`)?.focus({preventScroll:true});return true;
 }
 if(!a.startsWith('onboard-'))return false;this.c.unlock();switch(a){case 'onboard-legacy':this.element.hidden=true;this.c.legacyOpen();break;case 'onboard-legacy-back':this.c.close();this.show();break;case 'onboard-perk':this.c.legacyBuy(v);break;case 'onboard-skin':this.c.legacySkin(v);break;case 'onboard-theme':this.c.meta().theme=v;document.documentElement.dataset.theme=v;document.body.dataset.theme=v;this.c.save();this.render();break;case 'onboard-play':this.finish();break;case 'onboard-tour':this.c.close();this.tutorial();break;case 'onboard-next':if(this.step<2){this.step++;this.render();}else this.finish();break;case 'onboard-back':this.step=Math.max(0,this.step-1);this.render();break;case 'onboard-skip':this.finish();break;case 'onboard-home':this.c.close();this.show();break;}return true;}
}

// R12 — new centred main menu (runs 0-6) + a static ad slot shared by every menu.
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function r12Menu(meta,run){const zh=meta.lang==='zh',T=(a,b)=>zh?b:a,c=runsDone(meta),goal=c<3?3:7;
 const words=['$100','HUSTLE','INVEST','TRAVEL','TOKYO','LAS VEGAS','MONACO','$1,000,000,000','WORK','RISK','LUCK','TAIPEI','NEW YORK','SINGAPORE'];
 const row=k=>{const w=words.slice(k*3).concat(words.slice(0,k*3));const t=w.join('  ·  ');return `<div class="r12-drift-row" style="--k:${k}"><span>${t}  ·  ${t}  ·  </span></div>`;};
 const notice=c<3?T('Complete 3 runs to unlock a new opening animation!','完成 3 局，解锁全新开场动画！'):T('Complete 7 runs to unlock a new main menu and a new opening!','完成 7 局，解锁全新主菜单和全新开场！');
 const cont=run.page>1&&!run.ended;
 return `<div class="r12-menu" style="--bg:url('${window.UPSHIFT_ART?.['menu-bg']||''}')"><div class="r12-bg"></div><div class="r12-drift" aria-hidden="true">${[0,1,2,3].map(row).join('')}</div><div class="r12-coins" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--i:${i};--x:${(i*37)%100}%"></i>`).join('')}</div>
 <div class="r12-center"><h2 id="start-title" class="r12-sr">Broke to Billionaire</h2>
  <button class="r12-start" data-action="onboard-play" autofocus><b>${cont?T('CONTINUE','继续'):T('START','开始游戏')}</b><small>${cont?T('Stop ','第 ')+run.page+T('',' 站'):'$100 → $1,000,000,000'}</small></button>
  <button class="r12-help" data-action="onboard-tour">${T('How to play','怎么玩')}</button>
  <div class="r12-notice"><span>🎬</span><p>${notice}</p><div class="r12-prog"><i style="width:${Math.min(100,c/goal*100)}%"></i></div><b>${Math.min(c,goal)}/${goal}</b></div>
 </div></div>`;}
function r12Ad(meta){const zh=meta.lang==='zh',T=(a,b)=>zh?b:a;const art=window.UPSHIFT_ART||{};
 return `<aside class="r12-ad"><span class="r12-ad-tag">${T('AD','广告')}</span><div id="r12-menu-banner" class="r12-ad-slot" style="width:320px;height:100px"><div class="r12-house" style="background-image:url('${art.monaco||art.tokyo||''}')"><b>${T('MONACO IS WAITING','摩纳哥在等你')}</b><small>${T('Six cities · one $100 bill','六座城市 · 一张百元钞')}</small></div></div></aside>`;}
