import {LifeUI as JourneyUI} from './journey-ui.js';
import {glyph} from './life-ui.js';
import {escape as safe,icon} from './ui.js';
import {CLASSES,getCity,owns,beginRest,finishRest,restActivity,UNLOCK_MILESTONES,nextUnlock,activateNoble} from './life-core.js';
import {makeOffer,markPeak} from './engine.js';
import {getAuctionLot,getNobleItem,getDecoration,AUCTION_LOTS,NOBLE_ITEMS,DECORATIONS} from './catalog.js';
import {worth,lateTier,TIERS_LATE,FACTIONS,ensureEstate,reconcile,billQuote,restDue,pendingEvent,eventView,resolveEvent,acknowledgeEvent,securityOdds,hireGuards,activeGuards,healthRisk,medicalOptions,buyMedical,regions,currentRegion,enterRegion,luxuries,consumeLuxury,PERKS,initLegacy,buyPerk,collectLegacy,buyDecoration} from './endgame-core.js';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n/100);
const short=n=>n>=1e10?'$'+(n/1e10).toFixed(2)+'亿':n>=1e6?'$'+(n/1e6).toFixed(1)+'万':money(n);
const clock=n=>{const total=Math.max(0,Math.ceil(n/1000));return Math.floor(total/60).toString().padStart(2,'0')+':'+(total%60).toString().padStart(2,'0');};
const btn=(id,text,v='',disabled=false,cls='')=>`<button class="life-button ${cls}" data-action="life-${id}" data-value="${v}" ${disabled?'disabled':''}>${text}</button>`;

export class LifeUI extends JourneyUI{
 constructor(c){super(c);this.contextExpanded=false;this.eventBusy=false;this.nextLateTick=0;this.eventOpened='';this.c.meta().wealthTextures??=true;for(const name of ['luxury','ivory'])document.documentElement.style.setProperty('--'+name+'-material',`url('${window.UPSHIFT_ART?.[name+'-texture']||''}')`);initLegacy(this.c.meta());
  $('menu-button').classList.add('global-menu');$('game').append($('menu-button'));
  $('energy-hud').insertAdjacentHTML('afterend',`<button id="capital-summary" class="capital-summary" data-action="life-status" hidden></button>`);
  this.settings.scale=Math.max(.75,Math.min(1.25,this.settings.scale));this.applyUI();
 }
 get e(){return this.s.estate||ensureEstate(this.s);}
 hasPendingDeath(){return this.s.ended&&!!pendingEvent(this.s)?.resolved;}
 renderHud(){super.renderHud();if(!$('capital-summary'))return;const s=this.s,e=this.e,t=reconcile(s),inGame=this.c.started?.()!==false,g=$('game'),m=this.c.meta();g.dataset.capitalTier=t;g.dataset.wealthTextures=m.wealthTextures?'on':'off';g.dataset.legacySkin=m.legacy?.skin||'default';g.dataset.poverty=t===0?'yes':'no';g.dataset.decoration=s.equippedDecoration||'';document.body.dataset.legacySkin=m.legacy?.skin||'default';
  $('city-panorama').hidden=!inGame||t===0||!!s.life.travel;
  $('class-ticker').hidden=!inGame||t<3||!!s.life.travel;
  $('life-map-pull').hidden=!inGame||t===0||!!s.life.rest||!!s.life.travel;
  $('ui-tools').hidden=true;$('rest-scene-tools').hidden=true;$('life-rest-caption').hidden=true;$('life-hex').hidden=true;
  const cv=$('cash-value');cv.style.fontSize=(innerWidth<900?(cv.textContent.length>8?19:25):(cv.textContent.length>8?23:29))+'px';
  const summary=$('capital-summary');summary.hidden=!inGame||t<2||!!s.life.travel;
  if(!summary.hidden){const locked=s.life.rest&&!s.life.rest.paid,q=locked?{total:restDue(s.life.rest)}:billQuote(s);summary.innerHTML=`<span>${TIERS_LATE[t].name} · 总身家 ${short(worth(s))}</span><b>${locked?'本次账单':'下次休息'} ${short(q.total)} <i>ⓘ</i></b>`;summary.title='查看总身家、预计账单、健康和当前机制';}
  if(t<2){const h=$('energy-hint');if(h)h.textContent=s.life.rest?'假期恢复中':h.textContent.split('·')[0].trim()+' · 下休 '+short(billQuote(s).total);}
  if(s.life.rest)this.paintNews();
  this.paintContext();
  this.renderMilestoneProgress();
  this.renderMedalsTray();
 }
 renderMilestoneProgress(){
  let bar=$('milestone-progress-bar');
  if(!bar){
   const topHud=$('game').querySelector('.portrait-hud');
   if(topHud){
    topHud.insertAdjacentHTML('afterbegin',`<button id="milestone-progress-bar" class="milestone-progress-bar" data-action="life-mechanisms" aria-label="机制解锁进度"></button>`);
    bar=$('milestone-progress-bar');
   }
  }
  if(!bar)return;
  const s=this.s,w=worth(s),next=nextUnlock(s);
  if(next){
   const nextTitle=next.title||next.name||'新机制';
   const pct=Math.max(5,Math.min(100,((w/100)/next.at)*100));
   bar.innerHTML=`<div class="milestone-bar-inner"><span class="milestone-icon">🔓</span><span class="milestone-title">下一机制: ${safe(nextTitle)}</span><span class="milestone-target">${money(next.at*100,true)}</span><div class="milestone-track"><i style="width:${pct.toFixed(0)}%"></i></div></div>`;
   bar.title=`当前身家 ${money(w)} / 解锁门槛 ${money(next.at*100)}。点击查看完整机制蓝图`;
  }else{
   bar.innerHTML=`<div class="milestone-bar-inner maxed"><span class="milestone-icon">👑</span><span class="milestone-title">全机制已激活 · 巅峰资本家</span></div>`;
   bar.title='所有核心机制均已解锁！点击查看图谱';
  }
 }
 renderMedalsTray(){
  let tray=$('auction-medals-tray');
  if(!tray){
   const hud=$('game').querySelector('.portrait-hud');
   if(hud){
    hud.insertAdjacentHTML('beforeend',`<div id="auction-medals-tray" class="auction-medals-tray" hidden></div>`);
    tray=$('auction-medals-tray');
   }
  }
  if(!tray)return;
  const medals=this.s.estate?.auctionMedals||[];
  tray.hidden=!medals.length;
  if(medals.length){
   tray.innerHTML=medals.map(id=>{
    const lot=getAuctionLot(id);
    const lotName=lot?.name?.pair?.[1]||lot?.name||'孤品勋章';
    const lp=lot?.points||lot?.lv||0;
    return `<button class="auction-medal-btn" data-action="life-show-medals" data-value="${id}" title="${lotName} (+${lp} LP · 维护费 ${money((lot?.upkeep||0)*100)}/次)">${lot?.medal||'🎖️'}</button>`;
   }).join('');
  }
 }
 paintContext(){super.paintContext();const el=$('project-context');if(!el||el.hidden)return;const detail=el.querySelector('p');if(detail){detail.id='culture-detail';detail.hidden=!this.contextExpanded;}const h=el.querySelector('h2');if(h){const name=h.textContent;h.innerHTML=`<span>${safe(name)}</span><button data-action="life-culture" aria-label="${this.contextExpanded?'收起':'展开'}当地项目说明" aria-expanded="${this.contextExpanded}" aria-controls="culture-detail">${this.contextExpanded?'−':'i'}</button>`;}el.classList.toggle('expanded',this.contextExpanded);}
 paintNews(){super.paintNews();const el=$('world-news');if(!el||el.hidden)return;el.classList.add('compact-news');el.querySelector('.news-kicker').textContent='世界新闻 · 游戏事件';if(!el.querySelector('button'))el.insertAdjacentHTML('beforeend',btn('news','查看新闻 →'));}
 interceptDock(){if(this.s.offer.type==='world-event'&&!this.s.life.rest&&!this.s.life.travel){this.renderStreetEvent();return true;}return super.interceptDock();}
 afterDock(){
  super.afterDock();
  if(this.s.life.energy<=0 && !this.s.life.rest && !this.s.life.travel && this.s.offer.type!=='interlude'){
   const dock=$('game-dock');
   if(dock && !dock.querySelector('.dock-energy-alert')){
    dock.insertAdjacentHTML('afterbegin',`<div class="dock-energy-alert"><span>⚠️ 体力已耗尽 (0/${this.s.life.energyCap}) · 无法前行</span><button class="life-button compact highlight" data-action="life-prompt-rest">申请休整 🛏️</button></div>`);
   }
  }
 }
 renderStreetEvent(){const ev=this.s.estate.queue.find(x=>x.id===this.s.offer.eventId),d=$('game-dock');d.dataset.kind='world-event';d.innerHTML=`<span class="life-eyebrow">CITY ENCOUNTER / 街头会面</span><h1>${ev?safe(eventView(this.s,ev).title):'会面已结束。'}</h1><p class="small-rule">${ev?.ack?'这段插曲已记录。继续探索下一条街。':'用几个选择回应这段插曲，不需要打开复杂管理面板。'}</p>${ev?.ack?'<button class="primary" data-action="next">继续前行 →</button>':btn('open-event','回应这次会面 →','',false,'primary')}`;this.paintContext();this.c.fit();}
 beforeNext(){if(pendingEvent(this.s)){this.openEvent();return false;}this.contextExpanded=false;return super.beforeNext();}
 openEvent(){const ev=pendingEvent(this.s);if(!ev||this.c.started?.()===false||this.c.busy?.())return;const modal=this.c.modal?.();if(modal&&modal!=='world-event')return;const v=eventView(this.s,ev),result=ev.result;this.eventOpened=ev.id;
  const tag=ev.kind==='health'?'♥':ev.kind==='security'?'◇':ev.kind==='luxury'?'✦':ev.kind==='tax'?'§':ev.kind==='scandal'?'!':FACTIONS.find(f=>f.id===ev.faction)?.symbol||'↗';
  this.c.open('world-event','','',`<div class="event-dialog ${ev.kind} ${ev.resolved?'resolved':''}"><div class="event-dialog-top"><span>${safe(v.tag)}</span><small>${getCity(this.s).name}</small></div><div class="event-dialog-symbol">${tag}</div><h2 id="modal-title">${safe(v.title)}</h2><p>${safe(v.body)}</p>${ev.kind==='health'?`<div class="health-slots">${Array.from({length:this.e.maxHealth},(_,i)=>`<span class="${i<this.e.health?'alive':'spent'}">♥</span>`).join('')}<small>衰退 ${ev.risk}%</small></div>`:''}${ev.resolved?`${result?.delta?`<div class="event-cash ${result.delta<0?'loss':''}">${result.delta>0?'+':'−'}${money(Math.abs(result.delta))}</div>`:''}<button class="primary" data-action="life-event-ack" data-value="${ev.id}">${this.s.ended?'进入人生结算':'记下了，继续 →'}</button>`:`<div class="dialog-choices">${v.choices.map(o=>`<button data-action="life-event-choice" data-value="${ev.id}:${o.id}" ${o.cost>0&&o.cost>=this.s.cash?'disabled':''}><div><strong>${safe(o.label)}</strong><b>${o.cost?money(o.cost):'不预付'}</b></div><span>${safe(o.detail)}</span>${o.penalty?`<small>后果可能扣除 ${money(o.penalty)}</small>`:''}</button>`).join('')}</div><div class="event-dialog-foot">现金 ${money(this.s.cash)} · 每个选择只结算一次</div>`}</div>`,{custom:true,noClose:true});
 }
 renderRest(){const s=this.s,r=s.life.rest;if(!r)return;const d=$('game-dock'),c=CLASSES[r.class],pending=pendingEvent(s),due=restDue(r),q=r.bill||billQuote(s);d.dataset.kind='rest';const activities=r.activities.filter(x=>!x.instant),instant=r.activities.find(x=>x.instant);
  const tile=a=>`<article class="rest-choice"><span>${({drink:'☕',read:'▤',stretch:'↟',massage:'✦',lounge:'☀',sleep:'☾',toast:'♧'})[a.pose]}</span><div><strong>${safe(a.name)}</strong><small>减少 ${Math.floor(a.seconds/60)} 分 ${a.seconds%60} 秒</small></div>${btn('activity',a.used?'已体验':short(a.price),a.id,a.used||s.cash<=a.price||r.remaining<=0||!!pending)}</article>`;
  d.innerHTML=`<div class="rest-compact-title"><span>休息 / ${c.name}</span><button data-action="life-status" aria-label="查看完整身家与账单">ⓘ</button></div><h1>${r.paid?'让身体跟上你的野心。':'先付账单，再谈人生。'}</h1><div class="rest-worth"><span>当前总身家 <b>${short(worth(s))}</b></span><span>可用现金 <b>${short(s.cash)}</b></span></div><div class="rest-progress-head"><span id="rest-status">${r.paid?'正在恢复':'账单未支付'}</span><strong id="rest-clock">${clock(r.remaining)}</strong></div><div class="rest-track" role="progressbar" aria-label="休息进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="rest-fill"></i></div>
  ${!r.paid?`<div class="bill-lines"><span>生活维护 <b>${short(r.maintenance)}</b></span><span>地区税费 <b>${short(r.tax)}</b></span><span>安保 / 管理 / 减免 <b>${r.extra<0?'−':''}${short(Math.abs(r.extra||0))}</b></span><strong>本次合计 <b>${short(due)}</b></strong></div><p class="bill-footnote">税基为入休时总身家 ${short(q.worth)}；资产不重复计算，税单入休后锁定。现金不足即结束本局，不再自动救助。</p>${pending?btn('open-event','先处理休息事件 →','',false,'primary'):btn('pay',s.cash<=due?'无法支付 · 结算本局':`支付 ${short(due)} · 开始恢复`,'',false,'primary')}`:`<div id="rest-ready" ${r.remaining>0?'hidden':''}>${btn('finish',`领取 ${s.life.energyCap} 体力，继续出发 →`,'',!!pending,'primary')}</div><div id="rest-options" ${r.remaining<=0?'hidden':''}>${activities.slice(0,2).map(tile).join('')}<div class="rest-bottom-buttons">${btn('rest-all','更多休息活动')}${lateTier(s)>=3?btn('medical','医疗 / 延寿'):''}</div>${instant?btn('instant',`立即恢复 · ${short(instant.price)}`,instant.id,s.cash<=instant.price||!!pending,'instant-button'):''}</div>`}
  <div class="rest-view-buttons">${[0,1,2].map((i)=>btn('camera',['人物','全景','侧面'][i],i,false,r.camera===i?'selected':'')).join('')}</div>`;
  this.paintRest();this.paintNews();this.c.fit();
 }
 paintRest(){const r=this.s.life.rest;if(!r||!$('rest-clock'))return;$('rest-clock').textContent=clock(r.remaining);const pct=r.paid?(1-r.remaining/r.duration)*100:0;$('rest-fill').style.width=pct+'%';$('rest-fill').parentElement.setAttribute('aria-valuenow',Math.round(pct));$('rest-status').textContent=!r.paid?'账单未支付':r.remaining<=0?'恢复完成':'离线也会继续恢复';if($('rest-ready'))$('rest-ready').hidden=r.remaining>0;if($('rest-options'))$('rest-options').hidden=r.remaining<=0;}
 openRestAll(){const r=this.s.life.rest;if(!r?.paid)return;this.c.open('rest-activities','休息，换一种方式。','活动消耗游戏币，缩短剩余计时。',`<div class="rest-all-grid">${r.activities.filter(a=>!a.instant).map(a=>`<article><h3>${safe(a.name)}</h3><p>减少 ${Math.floor(a.seconds/60)} 分 ${a.seconds%60} 秒</p>${btn('rest-do',a.used?'已体验':money(a.price),a.id,a.used||r.remaining<=0||this.s.cash<=a.price)}</article>`).join('')}</div>`);}
 openStatus(){
  const s=this.s,t=lateTier(s),q=s.life.rest?(s.life.rest.bill||billQuote(s)):billQuote(s),pending=s.offer.pendingStake||0,asset=worth(s)-s.cash-pending,e=this.e;
  const medals=e.auctionMedals||[];
  const nobles=(s.life.items||[]).filter(id=>id.startsWith('noble-'));

  const medalsHtml=medals.length?`
   <h3>已斩获绝版拍卖勋章 (${medals.length})</h3>
   <div class="status-medals-grid">
    ${medals.map(id=>{
      const lot=getAuctionLot(id);
      const lotName=lot?.name?.pair?.[1]||lot?.name||'孤品勋章';
      const lp=lot?.points||lot?.lv||0;
      return `<div class="status-medal-item"><span class="status-medal-icon">${lot?.medal||'🎖️'}</span><div><strong>${safe(lotName)}</strong><small>+${lp} LP · 每期保养费 ${money((lot?.upkeep||0)*100)}</small></div></div>`;
    }).join('')}
   </div>
  `:'';

  const noblesHtml=nobles.length?`
   <h3>持有的贵族特许令 (${nobles.length})</h3>
   <div class="noble-items-grid">
    ${nobles.map(id=>{const item=getNobleItem(id);return `<div class="noble-item-card"><span class="noble-icon">📜</span><div><strong>${safe(item?.name)}</strong><small>${safe(item?.desc)}</small></div><button class="small-button highlight" data-action="life-activate-noble" data-value="${id}">${s.life.nobleSummon===item?.target?'生效中':'立即使用'}</button></div>`;}).join('')}
   </div>
  `:'';

  this.c.open('life-status','看清自己，还剩下什么。',`${TIERS_LATE[t].name} / 所有金额都是游戏币`, `
   <div class="capital-ledger">
    <div><span>可用现金</span><b>${money(s.cash)}</b></div>
    <div><span>资产、服装与已购商品</span><b>${money(asset)}</b></div>
    <div><span>待交割本金（仅计一次）</span><b>${money(pending)}</b></div>
    <div class="total"><span>当前总身家</span><b>${money(worth(s))}</b></div>
   </div>
   <h3>${s.life.rest?'已锁定的本次账单':'下次休息预估'}</h3>
   <div class="capital-ledger">
    <div><span>生活维护</span><b>${money(q.maintenance)}</b></div>
    <div><span>地区税 · ${(q.rate*100).toFixed(2)}%</span><b>${money(s.life.rest?.tax??q.tax)}</b></div>
    <div><span>保镖工资</span><b>${money(q.guards)}</b></div>
    <div><span>管理费用</span><b>${money(q.management)}</b></div>
    <div><span>转世减免</span><b>−${money(q.credit)}</b></div>
    <div class="total"><span>合计</span><b>${money(s.life.rest?restDue(s.life.rest):q.total)}</b></div>
   </div>
   ${medalsHtml}
   ${noblesHtml}
   <h3>健康 ${'♥'.repeat(e.health)}${'♡'.repeat(e.maxHealth-e.health)}</h3>
   <p>已经休息 ${e.age} 次。下一次衰退概率 ${healthRisk(s,true)}%；每次休息 +1 个百分点，抽中减少 1 格，归零死亡。</p>
   <h3>当前可用机制</h3>
   <p>${[['基础投资与休息',0],['城市通行与商品',1],['社群交往',2],['安保 / 地区税 / 康复',3],['财务风波 / 多派系',4],['当地奢侈消费 / 延寿',5],['工业特区',6],['主权特区',7],['细胞更新',8],['云端区域',9],['极限财富压力',10]].map(([name,at])=>`<span class="mechanism-token ${t>=at?'active':''}">${t>=at?'✓':'🔒'} ${name}</span>`).join('')}</p>
   <p>机制按当前总身家而非历史最高身家启停。跌回低身家后高级功能暂时停用；回升后恢复。</p>
  `);
 }
 promptRest(){
  const s=this.s;if(s.life.rest){this.c.close();this.c.renderDock();return;}if(s.life.travel){this.c.toast('请先抵达目的地，再安排休息。');return;}if(s.ended)return;if(s.offer.pendingStake){this.c.toast('请先完成项目交割，再安排休息。');return;}
  const quote=billQuote(s);
  const curCap=s.life.energyCap;
  this.c.open('confirm-rest','休息前，先看清账单','',`
   <div class="confirm-rest-dialog">
    <div class="confirm-rest-header">
     <div class="confirm-rest-badge">🛏️</div>
     <div class="confirm-rest-title-wrap">
      <h3 id="modal-title">当前体力 ${s.life.energy} / ${curCap}</h3>
      <p>${s.life.energy<=0?'体力已经耗尽，需要休整后继续前行。':'可以提前休整，但仍须支付账单并经历体检。'}</p>
     </div>
    </div>
    <div class="confirm-rest-quote">
     <div class="quote-title">📋 本期预计休整账单明细</div>
     <div class="quote-row"><span>基础生活与住所维护</span><b>${money(quote.baseMaintenance)}</b></div>
     ${quote.outfitUpkeep>0?`<div class="quote-row"><span>高级服装与外表保养</span><b>${money(quote.outfitUpkeep)}</b></div>`:''}
     ${quote.decoUpkeep>0?`<div class="quote-row"><span>金边UI装饰每期保养</span><b>${money(quote.decoUpkeep)}</b></div>`:''}
     ${quote.guards>0?`<div class="quote-row"><span>随行安保团队工资</span><b>${money(quote.guards)}</b></div>`:''}
     ${quote.auctionUpkeep>0?`<div class="quote-row"><span>绝版拍卖孤品托管费</span><b>${money(quote.auctionUpkeep)}</b></div>`:''}
     ${quote.tax>0?`<div class="quote-row"><span>所在城市与区域税款</span><b>${money(quote.tax)}</b></div>`:''}
     <div class="quote-row total"><span>预计账单合计</span><strong>${money(quote.total)}</strong></div>
    </div>
    <div class="confirm-rest-warning">
     <strong>⚠️ 休息须知：</strong>
     <span>进入休整时锁定账单，处理事件后由你确认支付，同时进行身体周期健康审查（当前衰退概率 ${healthRisk(s,true)}%）；必须结清账单方可满血出发。</span>
    </div>
    <div class="dialog-actions action-row">
     <button class="life-button pass-btn" data-action="close">稍后再说</button>
     <button class="life-button primary highlight-btn" data-action="life-confirm-start-rest">确认进入休整 ➔</button>
    </div>
   </div>
  `,{custom:true});
 }
 openMedalsModal(){
  const e=this.s.estate||{},medals=e.auctionMedals||[],missed=e.missedAuctions||[];
  const list=AUCTION_LOTS.map(lot=>{
   const isOwned=medals.includes(lot.id);
   const isMissed=missed.includes(lot.id);
   const lotName=lot.name?.pair?.[1]||lot.name;
   const lotDesc=lot.desc?.pair?.[1]||lot.desc;
   const lp=lot.points||lot.lv||0;
   return `<article class="medal-showcase-tile ${isOwned?'owned':isMissed?'missed':'locked'}">
     <span class="medal-hero-icon">${lot.medal}</span>
     <div class="medal-meta">
       <h3>${safe(lotName)}</h3>
       <p>${safe(lotDesc)}</p>
       <div class="medal-props">
         <span class="lv-badge">+${lp} LP 转世点</span>
         <span class="upkeep-badge">每期保养 ${money(lot.upkeep)}</span>
       </div>
       <div class="medal-state-tag">
         ${isOwned?'<span class="tag-owned">✓ 已永久斩获 · 荣誉点亮</span>':isMissed?'<span class="tag-missed">✕ 本局已擦肩而过 · 永不复现</span>':`<span class="tag-locked">🔒 街头拍卖稀品 · 估价 ${money(lot.price)}</span>`}
       </div>
     </div>
   </article>`;
  }).join('');
  const totalLP=medals.reduce((sum,id)=>{
    const lot=getAuctionLot(id);
    return sum+(lot?.points||lot?.lv||0);
  },0);
  this.c.open('medals-showcase','资本家荣誉勋章陈列墙 · THE IMPERIAL TREASURY',`已斩获 ${medals.length} / ${AUCTION_LOTS.length} 件世界孤品 · 永久转世点 +${totalLP} LP`,
   `<div class="medals-showcase-grid">${list}</div><p class="life-note">每件绝版孤品在街头举牌后永久转化为转世点（LP）并装点荣誉陈列墙；若放弃举牌，该藏品本局永不再现。所有勋章在每次休整结算时收取保养费。</p>`,{wide:true});
 }
 openMechanismsModal(){
  const s=this.s,w=worth(s);
  const list=UNLOCK_MILESTONES.map(m=>{
   const unlocked=w>=m.at*100;
   return `<article class="blueprint-item ${unlocked?'unlocked':'locked'}">
     <div class="bp-icon">${m.icon||'🗝️'}</div>
     <div class="bp-info">
       <div class="bp-top">
         <strong>${safe(m.title)}</strong>
         <span class="bp-at">${money(m.at*100)}</span>
       </div>
       <p>${safe(m.desc)}</p>
     </div>
     <span class="bp-status">${unlocked?'✓ 已激活':'🔒 未达成'}</span>
   </article>`;
  }).join('');
  this.c.open('mechanisms-blueprint','财富机制与进化蓝图','随着你的总身家突破不同阶梯，将永久解锁全新游戏玩法与系统',`
    <div class="blueprint-list">${list}</div>
    <p class="life-note">身家包括手头现金、固定资产、定制服饰与在途资金。达到对应身家时自动激活新系统并触发庆祝弹窗。</p>
  `,{wide:true});
 }
 openDecorationsModal(){
  const s=this.s,w=worth(s),owned=s.decorations||[],curEquipped=s.equippedDecoration||'';
  const list=DECORATIONS.map(d=>{
   const isOwned=owned.includes(d.id);
   const canAfford=s.cash>d.price*100;
   const canUnlock=w>=d.at*100;
   const isEquipped=curEquipped===d.id;
   return `<article class="deco-showcase-tile ${isOwned?'owned':canUnlock?'available':'locked'} ${isEquipped?'equipped':''}">
     <span class="deco-icon">${d.icon||'✨'}</span>
     <div class="deco-meta">
       <div class="deco-header-row">
         <h3>${safe(d.name?.zh||d.name)}</h3>
         <span class="deco-tag">${isEquipped?'佩戴中':isOwned?'已收藏':canUnlock?'可购买':'未解锁'}</span>
       </div>
       <p>${safe(d.desc?.zh||d.desc)}</p>
       <div class="deco-props">
         <span class="lv-badge">+${d.lvPoints} LP 转世点</span>
         <span class="upkeep-badge">${d.upkeep?`保养费 ${money(d.upkeep*100)}/期`:'无持续维护费'}</span>
       </div>
       <div class="deco-action-bar">
         ${isEquipped?`<button class="life-button small-button equipped-btn" disabled>✓ 佩戴中</button>`:isOwned?`<button class="life-button small-button highlight" data-action="life-equip-deco" data-value="${d.id}">佩戴镶边</button>`:canUnlock?`<button class="life-button small-button primary" data-action="life-buy-deco" data-value="${d.id}" ${canAfford?'':'disabled'}>${canAfford?`购买 ${money(d.price*100)}`:'现金不足'}</button>`:`<span class="tag-locked">🔒 身家达到 ${money(d.at*100)} 解锁</span>`}
       </div>
     </div>
   </article>`;
  }).join('');
  this.c.open('decorations-modal','UI 金边装潢与卡片边框','定制你的主操作卡片与面板边框，购置后永久点亮并附赠稀缺转世点 (LP)',`
   <div class="decorations-grid">${list}</div>
   <p class="life-note">购买金边装饰即刻奖励少量转世点（0.02 ~ 5.0 LP），并在每次休整时计入微量维护保养费；佩戴后将在主操作卡片呈现专属材质光晕！</p>
  `,{wide:true});
 }
 openThemesModal(){
  const cur=this.c.meta().theme||'minimalist';
  const themes=[
   {id:'minimalist',name:'极简冷灰 (Minimalist)',desc:'干净克制的高对比度界面，去粗取精，极致纯粹。',dot:'#38bdf8'},
   {id:'imperial',name:'帝国鎏金 (Imperial Gold)',desc:'巴洛克黄金双线镶边，奢华金箔纹理，尽显巨鳄排面。',dot:'#d4af37'},
   {id:'cyber',name:'赛博霓虹 (Cyber Neon)',desc:'深邃暗夜黑底搭配高压电光青与荧光粉，高科技投机感。',dot:'#00f3ff'},
   {id:'swiss',name:'瑞士现代 (Swiss Clean)',desc:'复古羊皮纸与典雅版画风格，温润内敛的欧陆世家质感。',dot:'#8c7355'}
  ];
  const list=themes.map(t=>`
   <article class="theme-select-card ${cur===t.id?'selected':''}" data-action="life-theme-switch" data-value="${t.id}">
    <span class="theme-select-dot" style="background:${t.dot}"></span>
    <div class="theme-select-info">
     <strong>${t.name}</strong>
     <p>${t.desc}</p>
    </div>
    <button class="small-button ${cur===t.id?'selected':''}">${cur===t.id?'当前使用':'切换使用'}</button>
   </article>
  `).join('');
  this.c.open('theme-picker','视觉主题与界面风格','实时切换不同的排版、字体、边框材质与色彩表现',`
   <div class="theme-picker-grid">${list}</div>
   <p class="life-note">主题设置即时生效并永久自动保存；不会改变任何游戏数值或胜率。</p>
  `);
 }
 openSecurity(){const s=this.s,e=this.e,o=securityOdds(s);this.c.open('security','有钱以后，安全也有账单。','谨慎降低遇险率，强硬提高反抗率但更容易被盯上。',`<div class="security-summary"><b>休息抢劫触发约 ${o.robbery.toFixed(0)}%</b><span>基础躲避 ${o.dodge.toFixed(0)}% · 绕路额外 +15%，上限 97%</span></div><div class="security-levels">${[0,1,2,3].map(level=>{const cost=level>e.guards?[0,100000,1000000,10000000][level]-[0,100000,1000000,10000000][e.guards]:0;return btn('guards',`<strong>${['不雇佣','随行护卫','专业小队','私人安保团'][level]}</strong><span>${e.guards===level?'已选':cost?'聘用差价 '+money(cost):'调整不退费用'} · 基础每次休息 ${money([0,35000,350000,3500000][level])}</span>`,`${level}:${e.stance}`,lateTier(s)<3||!!s.life.rest||s.life.travel||s.cash<=cost,e.guards===level?'selected':'');}).join('')}</div><h3>你的意志</h3><div class="stance-choices">${[['cautious','低调绕行','抢劫触发 −6%，躲避 +8%；工资 ×1.4'],['balanced','正常随行','标准概率与工资'],['assertive','公开威慑','抢劫触发 +5%，反抗 +14%；更引人注意']].map(([id,name,desc])=>btn('guards',`<strong>${name}</strong><span>${desc}</span>`,e.guards+':'+id,lateTier(s)<3||!!s.life.rest||!!s.life.travel,e.stance===id?'selected':'')).join('')}</div><p>跌回 $100,000 总身家以下，安保暂时停用且不收工资。所有概率都是游戏规则，不是真实安全建议。</p>`);}
 openFactions(){const t=lateTier(this.s);this.c.open('factions','财富让你被更多人看见。','关系不是永久资产，会随每次选择变化。',`<div class="faction-list">${FACTIONS.map(f=>`<article class="${t<f.at?'locked':''}"><b>${f.symbol}</b><div><h3>${f.name}</h3><p>${t<f.at?'尚未达到当前财富门槛':this.e.relations[f.id]<=-35?'敌对：可能触发惩罚':this.e.relations[f.id]>=35?'友好：可能触发馈赠':'观望：支持与拒绝都会留下记录'}</p><div class="relation-line"><i style="left:${(this.e.relations[f.id]+100)/2}%"></i></div></div><strong>${this.e.relations[f.id]>0?'+':''}${this.e.relations[f.id]}</strong></article>`).join('')}</div><p>派系会在街道和休息事件中提出请求。地下帮派严重敌对可能暗杀；议政署敌对会带来冻结与罚款，不是每个派系都使用相同惩罚。</p>`);}
 openRegions(){this.c.open('regions',getCity(this.s).name+'，还有更高的一层。','更高门槛、更高税率，也有当地专属项目。',`<div class="region-grid">${regions(this.s.life.city).map((z,i)=>`<article><span>0${i+1} / ${i?'WEALTH DISTRICT':'THE STREET'}</span><h3>${z.name}</h3><p>${z.at?'总身家门槛 '+short(z.at*100):'没有财富门槛'}<br>区域税率系数 ×${z.tax} · 项目风险 +${z.risk}</p>${btn('region',this.e.region===z.id?'当前所在':worth(this.s)<z.at*100?'尚未开放':'进入该区域',z.id,worth(this.s)<z.at*100||this.e.region===z.id)}</article>`).join('')}</div><p>当前：${currentRegion(this.s).name}。跌破区域门槛会自动回到普通街区。高空 / 轨道区域是虚构后期地点，不代表现实设施。</p>`);}
 openMedical(){this.c.open('medical','时间，开始变得很贵。',`健康 ${this.e.health}/${this.e.maxHealth} · 下一次衰退概率 ${healthRisk(this.s,true)}%`, `<div class="medical-list">${medicalOptions(this.s).map(o=>`<article><h3>${o.name}</h3><p>${o.desc}</p><span>门槛 ${short(o.min*100)} · 本次 ${short(o.cost)}</span>${btn('medical-buy','购买疗程',o.id,worth(this.s)<o.min*100||this.s.cash<=o.cost||o.id==='care'&&this.e.health>=this.e.maxHealth||!!pendingEvent(this.s))}</article>`).join('')}</div><p>累计购买会让下一次医疗更贵。不能在事件结果锁定后临时改写抽签；延寿不等于永生，也不能复活已死亡角色。</p>`);}
 openLuxury(){this.c.open('luxury',getCity(this.s).name+'的昂贵回忆。','不生息、不变现，只留下奢侈点。',`<div class="luxury-list">${luxuries(this.s).map(i=>`<article><span>EXCLUSIVE / ${getCity(this.s).name}</span><h3>${i.name}</h3><p>${short(i.price)} → <b>${i.points} 奢侈点</b></p><small>当前总身家门槛 ${short(i.at*100)}</small>${btn('luxury-buy',this.e.luxuries.includes(i.id)?'本局已消费':'消费并留下回忆',i.id,!i.available||this.s.cash<=i.price||!!this.s.life.rest||!!this.s.life.travel)}</article>`).join('')}</div><p>本局待结算：${this.e.luxuryEarned} 点。人生结束后进入转世账户，每个项目本局只消费一次。</p>`);}
 openLegacy(title=false){this.legacyFromTitle=title;const l=initLegacy(this.c.meta()),action=title?'onboard-':'life-';this.c.open('legacy','','',`<div class="legacy-panel"><div class="legacy-top"><span>AFTERLIFE ATELIER / 转世事务所</span><button data-action="${title?'onboard-legacy-back':'close'}" aria-label="返回">×</button></div><h2 id="modal-title">钱带不走，习惯可以。</h2><p>可用奢侈点 <strong>${l.points}</strong> · 累计 ${l.lifetime} · 当前人生待结算 ${this.e.luxuryEarned}</p><div class="legacy-grid">${PERKS.map(p=>{const owned=l.unlocks.includes(p.id);return `<article><span>${p.type} / ${p.cost} LP</span><h3>${p.name}</h3><p>${p.desc}</p><button class="life-button" data-action="${action}${owned&&p.type==='皮肤'?'skin':'perk'}" data-value="${p.id}" ${owned&&p.type!=='皮肤'||!owned&&l.points<p.cost?'disabled':''}>${owned?(p.type==='皮肤'?(l.skin===p.id?'正在使用':'使用皮肤'):'已解锁 · 下局生效'):'解锁 · '+p.cost+' 点'}</button></article>`;}).join('')}</div><button class="life-button" data-action="${action}skin" data-value="default">使用默认皮肤</button><p>机制只在新一局生效；皮肤立即生效。没有真实充值，客户端存档并非防作弊联网账户。</p></div>`,{custom:true,noClose:title,wide:true});}
 purchasePerk(id){try{buyPerk(this.c.meta(),id);this.c.save();this.openLegacy(this.legacyFromTitle);}catch(e){this.c.toast(e.message);}}
 chooseSkin(id){const l=initLegacy(this.c.meta());if(id!=='default'&&(!l.unlocks.includes(id)||PERKS.find(p=>p.id===id)?.type!=='皮肤'))return;l.skin=id;this.c.save();this.renderHud();this.openLegacy(this.legacyFromTitle);}
 guide(){this.c.open('life-guide','财富越高，人生越不轻松。','Last $100: Swipe to Rich / 保留 3.1 操作',`<div class="life-guide"><h3>体力与城市</h3><p>初始 200 体力，可分四次升级至 400。前进 −5、投资 −3、购买 −2、旅行 −10。昼夜随体力变化；耗尽后休息，完成后回满。六座城市各有 16 个当地项目，其中四个需要较高身家；每十步实际绕过街角，并转动镜头。城市配乐来自独立授权录音且离线内置。</p><h3>当前身家，决定生活难度</h3><p>身家＝现金＋持有资产、服装和商品的购入价＋尚未交割的本金；不是最高纪录，也不重复计算已扣的费用。机制按当前身家启停，变穷会退回简单界面。已经购买的高级服务暂时停用，重新富裕后恢复。奢侈消费不计入资产。</p><h3>强制账单</h3><p>平时显示下次休息预估，菜单可以展开明细。入休时锁定维护、地区税、保镖工资和管理费用；事件可能另行扣款或奖励。先完成事件，再交账单。现金无法覆盖账单并保留一美分，即结束本局；没有公共救助。已缴费后免费等待十分钟，或选择付费活动缩短时间。高层地区税率更高，拒税会损害议政署关系。</p><h3>健康与简单选择</h3><p>初始健康 5 格、衰退概率 0%。每次休息概率增加 1 个百分点，第一次为 1%；抽中只减少一格，归零死亡。体检和危险事件在触发时锁定抽签，刷新不会重抽。高财富可购买康复与延寿。财务风波分三次简单选项：完成合规有奖励，中途拒绝有巨额罚款。</p><h3>派系与安保</h3><p>达到门槛后出现社群、科技、工业、议政署、地下帮派和资本公会。捐赠、合作、拒绝都会影响关系；好友可能回馈，敌对者可能冻结财产或报复。保镖和你选择的安保姿态影响劫案与躲避；地下暗杀失败会死亡，不是普通投资亏损。</p><h3>只消费，不生息</h3><p>地区奢侈品只消耗游戏币、奖励奢侈点，没有现金收益；本局结束或主动重开后，点数一次性转入转世事务所。机制解锁在下局生效，皮肤可以立即换。每次死亡都会保存到本机人生排行榜，不是联网全球榜。</p><h3>稀有街区与投资</h3><p>地区邀请是进入或离开的选择，不是投资。进入后直到体力耗尽，只做当地工作：稳妥工作 −8 体力拿固定报酬；大胆尝试 −12，65% 获得 2.3 倍，否则 0.35 倍基础报酬。普通投资失败只损失投入；东京与纽约有双重审核，新加坡有延迟交割。街头项目最高 $500，高级项目 $1,000–$100,000，顶级项目 $100,000 起。系统金额安全上限 9 万亿美元，路线无最终站。</p><h3>可读性与保存</h3><p>主菜单「界面与文字」调整面板 75%–125%、文字 14–22px；财富材质也可在主菜单关闭。世界地图直接点击，不需要拖拉。手机面板内容可上下滚动，场景独立占位。电脑和手机分别存档，同一浏览器地址下自动保存；清除浏览器数据会清除进度。所有事件、健康概率和税制均为虚构游戏规则，无充值、兑现或医疗投资建议。</p></div>`);}
 menuExtras(){const t=lateTier(this.s),curTheme=this.c.meta().theme||'minimalist',themeNames={minimalist:'极简黑白',imperial:'帝国鎏金',cyber:'赛博霓虹',swiss:'瑞士现代'};return super.menuExtras()+`<section class="capital-menu"><div class="life-eyebrow">LIFE HAS CONSEQUENCES / 人生的后半程</div><div class="capital-menu-grid">${btn('status','身家与下期账单')}${btn('mechanisms','财富机制蓝图')}${btn('theme-picker','重新选择界面布局')}${btn('decorations','金边UI装饰与美化 (+LP)')}${btn('legacy','转世事务所 · '+(this.c.meta().legacy?.points||0)+' LP')}${t>=2?btn('factions','派系关系'):''}${t>=3?btn('security','雇佣保镖 / 安保姿态')+btn('medical','健康 / 昂贵延寿'):''}${t>=4?btn('regions','城市深层区域'):''}${t>=5?btn('luxury','地区奢侈消费'):''}${btn('textures','财富配色与贴图：'+(this.c.meta().wealthTextures?'开启':'关闭'))}</div><p>功能按当前总身家启停。最贫穷阶段没有额外常驻面板；必要的健康与账单只在休息弹窗出现。</p></section>`;}
 tick(){super.tick();if(this.c.started?.()===false)return;const now=performance.now();if(now<this.nextLateTick)return;this.nextLateTick=now+300;if(pendingEvent(this.s)&&!this.c.modal?.()&&!this.c.busy?.()&&(!this.s.ended||pendingEvent(this.s)?.resolved))this.openEvent();}
 async handle(a,v){
  const actions=['culture','open-event','event-choice','event-ack','status','security','guards','factions','regions','region','medical','medical-buy','luxury','luxury-buy','legacy','perk','skin','textures','rest-all','rest-do','news','activate-noble','show-medals','mechanisms','theme-picker','theme-switch','decorations','buy-deco','equip-deco','prompt-rest','confirm-start-rest'];
  if(!a.startsWith('life-')||!actions.includes(a.slice(5)))return super.handle(a,v);
  try{switch(a.slice(5)){
   case 'culture':this.contextExpanded=!this.contextExpanded;this.paintContext();break;
   case 'open-event':this.openEvent();break;
   case 'event-choice':{if(this.eventBusy)break;this.eventBusy=true;try{const [id,choice]=v.split(':');document.querySelectorAll('.dialog-choices button').forEach(b=>b.disabled=true);if(pendingEvent(this.s)?.kind==='health'){document.querySelector('.event-dialog')?.classList.add('drawing');await new Promise(r=>setTimeout(r,this.c.motion?.()===false?0:650));}resolveEvent(this.s,id,choice);markPeak(this.s);this.c.save();this.c.refresh();this.openEvent();}finally{this.eventBusy=false;}break;}
   case 'event-ack':acknowledgeEvent(this.s,v);this.c.save();this.c.close();if(this.s.ended)this.c.onDeath();else{this.c.refresh();this.c.renderDock();if(pendingEvent(this.s))this.openEvent();}break;
   case 'status':this.openStatus();break;case 'security':this.openSecurity();break;case 'factions':this.openFactions();break;case 'regions':this.openRegions();break;case 'medical':this.openMedical();break;case 'luxury':this.openLuxury();break;
   case 'guards':{const [level,stance]=v.split(':');hireGuards(this.s,Number(level),stance);this.persist();this.openSecurity();break;}
   case 'region':{const z=enterRegion(this.s,v);this.c.close();this.s.offer=makeOffer(this.s);this.s.lastResult=null;this.c.world.setOffer(this.s.offer);this.persist();this.c.renderDock();this.c.toast('进入 '+z.name+'；下一次账单已按该区重算。');break;}
   case 'medical-buy':{const o=medicalOptions(this.s).find(x=>x.id===v);this.c.confirm('购买 '+o.name+'？',`立即消费 ${money(o.cost)} 游戏币。${o.desc}`,()=>{try{buyMedical(this.s,v);this.persist();this.c.renderDock();this.openMedical();}catch(e){this.c.toast(e.message);}});break;}
   case 'luxury-buy':{const o=luxuries(this.s).find(x=>x.id===v);this.c.confirm('这笔钱不会再回来。',`消费 ${money(o.price)} 获得 ${o.points} 奢侈点，不增加资产与现金收益。`,()=>{try{consumeLuxury(this.s,v);this.persist();this.c.renderDock();this.openLuxury();}catch(e){this.c.toast(e.message);}});break;}
   case 'legacy':this.openLegacy(false);break;case 'perk':this.purchasePerk(v);break;case 'skin':this.chooseSkin(v);break;
   case 'textures':this.c.meta().wealthTextures=!this.c.meta().wealthTextures;this.c.save();this.renderHud();document.querySelectorAll('[data-action="life-textures"]').forEach(b=>b.textContent='财富配色与贴图：'+(this.c.meta().wealthTextures?'开启':'关闭'));this.c.toast('财富贴图与配色已'+(this.c.meta().wealthTextures?'开启':'关闭')+'，布局不会改变。');break;
   case 'rest-all':this.openRestAll();break;case 'rest-do':restActivity(this.s,Number(v));this.persist();this.renderRest();this.openRestAll();break;
   case 'news':{const el=$('world-news');this.c.open('news','世界的另一面。','这些是会影响下一轮项目的虚构游戏新闻。',`<h3>${safe(el.querySelector('h3')?.textContent||'市场平稳')}</h3><p>${safe(el.querySelector('p')?.textContent||'')}</p>`);break;}
   case 'activate-noble':{const item=activateNoble(this.s,v);this.persist();this.openStatus();this.c.toast(`📜 贵族特权令已生效！下一站已强制指定为：${item?.name?.pair?.[1]||item?.name||'指定地点'}`);break;}
   case 'show-medals':this.openMedalsModal();break;
   case 'mechanisms':this.openMechanismsModal();break;
   case 'theme-picker':this.openThemesModal();break;
   case 'theme-switch':{
    this.c.meta().theme=v;
    document.documentElement.dataset.theme=v;
    document.body.dataset.theme=v;
    $('game').dataset.theme=v;
    this.c.save();
    this.c.close();
    this.renderHud();
    this.c.toast('已切换至主题：'+({minimalist:'极简冷灰',imperial:'帝国鎏金',cyber:'赛博霓虹',swiss:'瑞士现代'}[v]||v));
    break;
   }
   case 'decorations':this.openDecorationsModal();break;
   case 'buy-deco':{
    try{
      const d=buyDecoration(this.s,v);
      const g=document.getElementById('game');
      if(g)g.dataset.decoration=this.s.equippedDecoration;
      this.c.save();
      this.c.refresh();
      this.c.toast(`已购入【${d.name?.zh||d.name}】！UI装饰已佩戴，附赠 +${d.lvPoints} LP！`);
      this.openDecorationsModal();
    }catch(err){
      this.c.toast(err.message||'购买失败');
    }
    break;
   }
   case 'equip-deco':{
    this.s.equippedDecoration=v;
    const g=document.getElementById('game');
    if(g)g.dataset.decoration=v;
    this.c.save();
    this.c.refresh();
    this.c.toast('已佩戴该UI装饰边框！');
    this.openDecorationsModal();
    break;
   }
   case 'prompt-rest':this.promptRest();break;
   case 'confirm-start-rest':{
    if(this.s.life.rest||this.s.life.travel||this.s.ended)break;
    beginRest(this.s);
    this.c.close();
    this.c.save();
    this.c.refresh();
    this.c.renderDock();
    this.c.toast('已确认进入休整，休整完成后将回满体力。');
    break;
   }
  }}catch(e){this.c.toast(e.message||'此操作当前不可用。');}
  return true;
 }
}
