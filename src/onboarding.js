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
   const m=this.c.meta();this.element.innerHTML=(runsDone(m)>=7?studioMarkup(m,this.c.run(),this.preview):r12Menu(m,this.c.run()))+r12Ad(m);this.fillAd();if(runsDone(m)<7)bindZ(this.element,m,()=>this.finish(),m.motion!==false);}

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
const ZSTAGES=[
 {r:['Survival','生存'],m:'$100',t:['Coins rattling in an empty pocket.','空口袋里叮当作响的几枚硬币。']},
 {r:['Worker','工薪'],m:'$2,400',t:['Clock in. First real paycheck.','打卡上班，第一份工资。']},
 {r:['Middle class','中产'],m:'$86,000',t:['A small flat. A real sofa.','一间小公寓，一张真沙发。']},
 {r:['Affluent','富裕'],m:'$1.2M',t:['Tailored suits. Quiet money.','定制西装，安静的钱。']},
 {r:['Magnate','大人物'],m:'$48M',t:['The city returns your calls.','整座城市开始回你电话。']},
 {r:['???','???'],m:'$???,???,???',t:['Classified.','机密。']},
 {r:['???','???'],m:'$?,???,???,???',t:['Only a few ever get here.','只有极少数人到过这里。']}];
// R13 menu (runs 0-6): drag the coin along a "Z / 2" track from $100 to ??? — the UI turns from poor to rich on the way; reaching the end starts the game.
function r12Menu(meta,run){const zh=meta.lang==='zh',T=(a,b)=>zh?b:a,c=runsDone(meta),goal=c<3?3:7;
 const words=['$100','HUSTLE','INVEST','TRAVEL','TOKYO','LAS VEGAS','MONACO','$1,000,000,000','WORK','RISK','LUCK','TAIPEI','NEW YORK','SINGAPORE'];
 const row=k=>{const w=words.slice(k*3).concat(words.slice(0,k*3));const t=w.join('  ·  ');return `<div class="r12-drift-row" style="--k:${k}"><span>${t}  ·  ${t}  ·  </span></div>`;};
 const notice=c<3?T('Complete 3 runs to unlock a new opening animation!','完成 3 局，解锁全新开场动画！'):T('Complete 7 runs to unlock a new main menu and a new opening!','完成 7 局，解锁全新主菜单和全新开场！');
 const cont=run.page>1&&!run.ended;const P=p=>zh?p[1]:p[0];
 const marks=ZSTAGES.map((x,i)=>`<g class="zm ${i>=5?'lock':''}" data-i="${i}"><circle r="9"/><text dy="-16">${i>=5?'?':i+1}</text></g>`).join('');
 return `<div class="r12-menu r13-z" data-stage="0" style="--bg:url('${window.UPSHIFT_ART?.['menu-bg']||''}')"><div class="r12-bg"></div><div class="r12-drift" aria-hidden="true">${[0,1,2,3].map(row).join('')}</div><div class="r12-coins" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--i:${i};--x:${(i*37)%100}%"></i>`).join('')}</div>
 <h2 id="start-title" class="r13-title">BROKE TO BILLIONAIRE<small>THE $100 START</small></h2>
 <div class="r13-zwrap">
  <div class="r13-zhead"><b>${cont?T('DRAG TO CONTINUE','拖到终点继续'):T('DRAG TO START','拖到终点开始')}</b><span>${cont?T('Stop ','第 ')+run.page+T('',' 站'):T('from $100 to ???','从 $100 到 ???')}</span></div>
  <div class="r13-zbox"><svg viewBox="0 0 600 300" class="r13-zsvg" aria-hidden="true"><defs><linearGradient id="r13zg" x1="0" x2="1"><stop offset="0" stop-color="#8a7556"/><stop offset=".45" stop-color="#6fa4d8"/><stop offset=".7" stop-color="#e8c35a"/><stop offset="1" stop-color="#fff3c4"/></linearGradient></defs>
   <path class="zt-bg" d="M50 60 H550 L50 240 H550"/><path class="zt-fill" id="r13-zfill" d="M50 60 H550 L50 240 H550"/><g id="r13-zmarks">${marks}</g>
   <g class="zend"><circle cx="550" cy="240" r="24"/><text x="550" y="247">?</text></g></svg>
   <button class="r13-zknob" id="r13-zknob" type="button" aria-label="${T('Drag along the track to start','沿轨道拖动开始游戏')}"><span>$</span></button>
   <div class="r13-zhint" id="r13-zhint">${T('Drag the coin','拖动硬币')} ➜</div></div>
  <div class="r13-zstage" id="r13-zstage"><small>${T('CLASS','阶层')}</small><b id="r13-zrank">${P(ZSTAGES[0].r)}</b><span id="r13-zmoney">$100</span><p id="r13-zline">${P(ZSTAGES[0].t)}</p><div class="r13-zbar"><i id="r13-zpct"></i></div></div>
 </div>
 <div class="r13-zfoot"><button class="r12-help" data-action="onboard-tour">${T('How to play','怎么玩')}</button><button class="r13-quick" data-action="onboard-play">${T('or tap to play ›','或直接开始 ›')}</button></div>
 <div class="r12-notice r13-notice"><span>🎬</span><p>${notice}</p><div class="r12-prog"><i style="width:${Math.min(100,c/goal*100)}%"></i></div><b>${Math.min(c,goal)}/${goal}</b></div>
 </div>`;}
function bindZ(root,meta,done,motion){const box=root.querySelector('.r13-zbox');if(!box)return;const svg=box.querySelector('svg'),path=svg.querySelector('.zt-bg'),fill=svg.querySelector('#r13-zfill'),knob=box.querySelector('#r13-zknob'),menu=root.querySelector('.r13-z');
 const zh=meta.lang==='zh',P=p=>zh?p[1]:p[0];const L=path.getTotalLength();const N=240;const pts=Array.from({length:N+1},(_,i)=>path.getPointAtLength(L*i/N));
 fill.style.strokeDasharray=L;fill.style.strokeDashoffset=L;
 svg.querySelectorAll('.zm').forEach((g,i)=>{const p=path.getPointAtLength(L*i/(ZSTAGES.length-1)*.94);g.setAttribute('transform',`translate(${p.x},${p.y})`);});
 let prog=0,stage=-1,dragging=false,ended=false;
 const toPx=pt=>{const r=svg.getBoundingClientRect(),b=box.getBoundingClientRect();return {x:r.left-b.left+pt.x/600*r.width,y:r.top-b.top+pt.y/300*r.height};};
 const paint=()=>{const pt=path.getPointAtLength(L*prog),q=toPx(pt);knob.style.transform=`translate(${q.x}px,${q.y}px) translate(-50%,-50%)`;fill.style.strokeDashoffset=L*(1-prog);
  const si=Math.min(ZSTAGES.length-1,Math.floor(prog/.94*(ZSTAGES.length-1)+.0001));root.querySelector('#r13-zpct').style.width=Math.round(prog*100)+'%';
  if(si!==stage){stage=si;menu.dataset.stage=si;const x=ZSTAGES[si];root.querySelector('#r13-zrank').textContent=P(x.r);root.querySelector('#r13-zmoney').textContent=x.m;const ln=root.querySelector('#r13-zline');ln.textContent=P(x.t);const st=root.querySelector('#r13-zstage');st.classList.remove('pop');void st.offsetWidth;st.classList.add('pop');svg.querySelectorAll('.zm').forEach((g,k)=>g.classList.toggle('on',k<=si));try{navigator.vibrate?.(12);}catch{}}};
 const nearest=(cx,cy)=>{const r=svg.getBoundingClientRect();const x=(cx-r.left)/r.width*600,y=(cy-r.top)/r.height*300;let best=-1,bd=1e9;const lo=Math.max(0,Math.floor((prog-.12)*N)),hi=Math.min(N,Math.ceil((prog+.12)*N));for(let i=lo;i<=hi;i++){const d=(pts[i].x-x)**2+(pts[i].y-y)**2;if(d<bd){bd=d;best=i;}}return best/N;};
 const move=e=>{if(!dragging||ended)return;e.preventDefault();prog=Math.max(prog-.2,nearest(e.clientX,e.clientY));paint();if(prog>=.985)finish();};
 const finish=()=>{if(ended)return;ended=true;dragging=false;prog=1;paint();menu.classList.add('r13-zdone');setTimeout(done,motion?650:0);};
 knob.addEventListener('pointerdown',e=>{e.preventDefault();dragging=true;knob.setPointerCapture?.(e.pointerId);box.classList.add('dragging');root.querySelector('#r13-zhint')?.remove();});
 knob.addEventListener('pointermove',move);box.addEventListener('pointermove',move);
 const up=()=>{if(!dragging)return;dragging=false;box.classList.remove('dragging');};knob.addEventListener('pointerup',up);knob.addEventListener('pointercancel',up);window.addEventListener('pointerup',up);
 box.addEventListener('pointerdown',e=>{if(e.target===knob||knob.contains(e.target))return;const n=nearest(e.clientX,e.clientY);if(Math.abs(n-prog)<.06){dragging=true;box.classList.add('dragging');}});
 knob.addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();prog=Math.min(1,prog+(e.key==='Enter'||e.key===' '?1:.08));paint();if(prog>=.985)finish();}else if(['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();prog=Math.max(0,prog-.08);paint();}});
 new ResizeObserver(()=>paint()).observe(box);paint();}
function r12Ad(meta){const zh=meta.lang==='zh',T=(a,b)=>zh?b:a;const art=window.UPSHIFT_ART||{};
 return `<aside class="r12-ad"><span class="r12-ad-tag">${T('AD','广告')}</span><div id="r12-menu-banner" class="r12-ad-slot" style="width:320px;height:100px"><div class="r12-house" style="background-image:url('${art.monaco||art.tokyo||''}')"><b>${T('MONACO IS WAITING','摩纳哥在等你')}</b><small>${T('Six cities · one $100 bill','六座城市 · 一张百元钞')}</small></div></div></aside>`;}
