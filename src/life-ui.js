import {getProject} from './catalog.js';
import {MAX_ENERGY,CITY_DATA,ITEMS,CLASSES,MECHANISMS,getCity,owns,classIndex,initLife,markLife,eligible,stakeBounds,buyUtility,beginRest,payRest,tickRest,restActivity,rewardRest,finishRest,routes,startTravel,arrive,dailyRate,offlineIncome,globalRank} from './life-core.js';
import {netWorth,makeOffer,markPeak} from './engine.js';
const $=id=>document.getElementById(id);

const cash=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n/100);
const short=n=>document.documentElement.lang!=='zh-CN'?(n>=1e14?'$'+(n/1e14).toFixed(2)+'T':n>=1e11?'$'+(n/1e11).toFixed(2)+'B':n>=1e8?'$'+(n/1e8).toFixed(2)+'M':cash(n)):n>=1e10?'$'+(n/1e10).toFixed(2)+'亿':n>=1e6?'$'+(n/1e6).toFixed(1)+'万':cash(n);
const time=n=>`${Math.floor(Math.max(0,Math.ceil(n/1000))/60).toString().padStart(2,'0')}:${(Math.max(0,Math.ceil(n/1000))%60).toString().padStart(2,'0')}`;
const paths={globe:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2c-6 6-6 14 0 20 6-6 6-14 0-20Z',radio:'M5 8h14v12H5zM8 5l10-3M8 12h8M8 16h3m5 0h0',layers:'m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5',hex:'m12 2 9 5v10l-9 5-9-5V7ZM12 7v10M7 9.5l10 5M7 14.5l10-5',bank:'m2 8 10-6 10 6ZM3 21h18M5 10v8m7-8v8m7-8v8',car:'m4 8 2-4h12l2 4v10H4ZM4 10h16M7 14h1m8 0h1M6 18v3m12-3v3',music:'M9 18V5l11-2v13M9 9l11-2M9 18c0 4-7 4-7 0s7-4 7 0Zm11-2c0 4-7 4-7 0s7-4 7 0Z',growth:'M3 21V3M3 21h18M7 16l5-5 4 2 5-8m-5 0h5v5',gem:'m2 8 5-5h10l5 5-10 14ZM2 8h20M7 3l5 19 5-19',plane:'m2 13 8-3V4c0-3 4-3 4 0v6l8 3v3l-8-2v5l3 2H7l3-2v-5l-8 2Z',train:'M5 3h14v15H5ZM5 10h14M8 18l-3 4m11-4 3 4M8 14h0m8 0h0',energy:'m13 2-9 12h7l-1 8L21 9h-8Z',arrow:'M5 12h14m-5-5 5 5-5 5',lock:'M6 10h12v11H6ZM8 10V6a4 4 0 0 1 8 0v4',check:'m4 12 5 5L20 6',moon:'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z'};
export function glyph(id){return `<svg class="life-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[id]||paths.gem}"/></svg>`;}
const action=(id,label,value='',disabled=false,cls='')=>`<button class="life-button ${cls}" data-action="life-${id}" data-value="${value}" ${disabled?'disabled':''}>${label}</button>`;
const note=text=>`<p class="life-note">${text}</p>`;
const CELEBS=[
 [['J. K. 罗琳','从手稿开始的创作者'],['查理·卓别林','聚光灯之前的起点']],
 [['沃伦·巴菲特','少年时期的第一笔投资'],['奥普拉·温弗瑞','地方电台的职业起步']],
 [['村上春树','经营爵士酒吧的写作岁月'],['藤子·F·不二雄','小工作室里的连载日常']],
 [['宫崎骏','把作品变成长期事业'],['乔治·卢卡斯','独立制作人的创作道路']],
 [['蕾哈娜','从舞台延伸到商业品牌'],['迈克尔·乔丹','运动之外的品牌生涯']],
 [['比尔·盖茨','技术、企业与慈善'],['沃伦·巴菲特','长期主义的投资故事']]
];
function portrait(seed){const colors=['#7a6256','#84755b','#454a50','#787466'];let cells='';const bits=['000111110000','001111111000','001222221000','001232321000','000222220000','000022200000','000144410000','001144411000','011144411100','011144411100'];for(let y=0;y<bits.length;y++)for(let x=0;x<bits[y].length;x++){const k=Number(bits[y][x]);if(k)cells+=`<rect x="${x*4}" y="${y*4}" width="4" height="4" fill="${k===1?colors[seed%4]:k===2?'#d8b795':k===3?'#303e38':'#9bb1a0'}"/>`;}return `<svg viewBox="0 0 48 44" aria-hidden="true" shape-rendering="crispEdges"><path fill="#e8e4d7" d="M0 0h48v44H0z"/>${cells}</svg>`;}
export class LifeUI{
 constructor(ctx){
  this.c=ctx;this.baseCashIcon=document.querySelector('.cash-coin')?.innerHTML||'';this.selected='tokyo';this.clockSecond=-1;this.restViewKey='';this.lastRest=null;this.lastTier=-1;this.lastCity='';this.atlasLeft=0;
  $('game').insertAdjacentHTML('beforeend',`<div id="life-backdrop" class="life-backdrop" hidden></div><div id="life-rest-caption" class="life-rest-caption" hidden></div><div id="rest-scene-tools" class="rest-scene-tools" hidden></div><div id="life-rank" class="life-rank"></div><div id="life-radio" class="life-radio" hidden></div><button id="life-hex" class="life-hex" data-action="life-mechanisms" hidden aria-label="查看机制解锁图"></button><button id="life-map-pull" class="life-map-pull" data-action="life-map" hidden aria-label="向上拉出旅行地图"><i></i><span>探索世界</span><b>⌃</b></button>`);
  document.querySelector('.route-hud').insertAdjacentHTML('afterend',`<div class="energy-hud" id="energy-hud"><span>${glyph('energy')}<b id="energy-value">200</b><small>/ 200</small></span><div class="energy-track"><i id="energy-fill"></i></div><small id="energy-hint">前进 −5</small></div>`);
  this.loaded();
 }
 get s(){return this.c.run();}
 loaded(){this.income=null;initLife(this.s);const income=offlineIncome(this.s);markPeak(this.s);if(income){this.income=income;setTimeout(()=>this.c.toast(`离线收益已入账 ${cash(income.delta)} · 日利率 ${(income.rate*100).toFixed(1)}%`),1000);}this.lastCity='';this.lastTier=-1;this.restViewKey='';}
 persist(){markPeak(this.s);this.c.save();this.c.refresh();}
 renderHud(){
  const s=this.s;if(!s.life)initLife(s);markLife(s);const l=s.life,cl=classIndex(s),city=getCity(s),game=$('game');
  const symbol=document.querySelector('.cash-coin');if(symbol&&symbol.dataset.generated!==(owns(s,'ui')&&l.modern?'yes':'no')){symbol.dataset.generated=owns(s,'ui')&&l.modern?'yes':'no';symbol.innerHTML=owns(s,'ui')&&l.modern?glyph('gem'):this.baseCashIcon;}
  game.dataset.lifeClass=cl;game.dataset.modern=owns(s,'ui')&&l.modern?'yes':'no';game.classList.toggle('life-beginner',l.currentWorth<50000);game.classList.toggle('has-map',owns(s,'passport'));game.classList.toggle('is-resting',!!l.rest);game.classList.toggle('is-transit',!!l.travel);game.style.setProperty('--city-accent',city.color);
  $('energy-value').textContent=l.energy;$('energy-fill').style.width=(l.energy/MAX_ENERGY*100)+'%';$('energy-hud').classList.toggle('empty',l.energy===0);$('energy-hint').textContent=l.rest?'假期中':l.energy===0?'下阶段必须休息':'前进 −5';
  const rank=globalRank(s,netWorth(s));$('life-rank').innerHTML=`<span>模拟全球财富排名</span><strong>超过 ${rank.percent.toFixed(rank.percent>99?4:1)}% 的人</strong><small># ${rank.rank.toLocaleString()} / 82 亿 · 非真实统计</small>`;$('life-rank').hidden=l.currentWorth<50000||!!l.rest||!!l.travel;
  $('life-map-pull').hidden=!owns(s,'passport')||!!l.rest||!!l.travel;$('life-map-pull').querySelector('span').textContent=`${city.name} / 探索世界`;
  const radio=$('life-radio');radio.hidden=!owns(s,'radio')||!!l.rest||!!l.travel;
  if(!radio.hidden){const messages=[`${city.name} · ${city.tag}`,s.offer.event?`${s.offer.event}：${city.eventDesc}`:'市场平稳 · 概率与回报在投资前固定显示',`体力 ${l.energy} / 200 · 投资消耗 3，前进消耗 5`,owns(s,'deposit')?`离线账户 · 日利率 ${(dailyRate(s)*100).toFixed(1)}% · 上限 7 天`:'每一笔投入都有风险，未投入的现金在普通项目中不受影响'];radio.innerHTML=`${glyph('radio')}<span>${messages[Math.floor(Date.now()/9000)%messages.length]}</span>`;}
  const hex=$('life-hex');hex.hidden=!owns(s,'hex')||!!l.rest||!!l.travel;const n=MECHANISMS.filter(m=>m.always||(m.item?owns(s,m.item):l.currentWorth>=m.at*100)).length;hex.innerHTML=`${glyph('hex')}<b>${n}<small> / ${MECHANISMS.length}</small></b><span>机制图谱</span>`;
  if(this.lastCity!==city.id||this.lastTier!==cl){this.c.world.setEnvironment?.(city.id,cl);this.lastCity=city.id;this.lastTier=cl;}
  const back=$('life-backdrop'),caption=$('life-rest-caption'),tools=$('rest-scene-tools');
  const inGame=this.c.started?.()!==false;this.c.world.setRest(inGame?l.rest:null);back.hidden=!l.travel||!inGame;caption.hidden=!l.rest&&!l.travel||!inGame;tools.hidden=!l.rest||!inGame;
  if(l.rest&&inGame){const c=CLASSES[l.rest.class];caption.innerHTML=`<span>假期 / ${c.name}</span><h2>${l.rest.lastActivity||'这一刻，留给自己。'}</h2><p>${c.line}</p>`;const camera=l.rest.camera||0;tools.innerHTML=[['人物近景',0],['生活全景',1],['侧面特写',2]].map(([name,id])=>action('camera',name,id,false,camera===id?'selected':'')).join('');}
  else if(l.travel&&inGame){const to=CITY_DATA.find(x=>x.id===l.travel.to);back.style.backgroundImage=`linear-gradient(180deg,#31463e10,#31463e30),url('${this.c.world.cityPreview(to.id)}')`;caption.innerHTML=`<span>正在前往</span><h2>下一站，${to.name}。</h2><p>每一次出发，都有新的可能。</p>`;}

 }
 promptRest(){
  const s=this.s;if(s.life.rest||s.life.travel)return;
  this.c.confirm('体力已耗尽 · 是否进入休整？',`当前体力已归零（0 / ${s.life.energyCap}）。继续前行需要进入生活休整以恢复体力。\n休整期将结算阶层维护账单并进行健康抽签审查。\n是否现在确认进入休整？`,()=>{
   beginRest(s);this.c.save();this.c.refresh();this.c.renderDock();
  });
 }
 beforeNext(){
  const s=this.s;if(s.life.rest||s.life.travel){this.c.renderDock();return false;}
  if(s.offer.pendingStake){this.c.toast('资金正在交割，完成后才能继续。');return false;}
  if(s.life.energy<=0){this.promptRest();return false;}return true;
 }
 beforeInvest(){if(this.s.offer.pendingStake)return true;if(!this.beforeNext())return false;return true;}
 interceptDock(){
  const s=this.s;if(s.life.rest){this.renderRest();return true;}if(s.life.travel){this.renderTransit();return true;}
  if(s.offer.pendingStake){this.renderDelivery();return true;}
  if(s.offer.type==='shop'&&s.offer.utilities?.length){this.renderShop();return true;}return false;
 }
 afterDock(){
  if(this.c.visiting?.())return;
  const s=this.s,o=s.offer;if(o.type!=='project'||o.pendingStake||s.life.rest||s.life.travel)return;
  const b=stakeBounds(s),d=$('game-dock');if(o.localName)d.querySelector('h1').textContent=o.localName;
  const subject=getProject(o.project);
  const label=o.grade==='elite'?'顶级项目':o.grade==='advanced'?'高级项目':'街头项目';
  const terms=`${subject?.subject==='people'?'人物合作 · ':''}${label} · ${cash(b.min)} 起 · ${o.maxStake>=900000000000000?'不设玩法上限':`上限 ${cash(o.maxStake||50000)}`}`;
  const rules=o.complex==='dual'&&o.stages?.length===2?`两轮均通过才成功：${o.stages[0]}% × ${o.stages[1]}% = ${o.p}%。任一失败损失投入。`:o.complex==='delivery'?'投资后锁定资金 20 秒，到期揭晓；等待期间不可跳站或旅行。':'';
  d.querySelector('h1').insertAdjacentHTML('afterend',`<div class="project-terms">${terms}${rules?`<small>${rules}</small>`:''}${o.event?`<small class="local-event">${o.event} · ${getCity(s).eventDesc}</small>`:''}</div>`);
  if($('stake-input')){$('stake-input').min=b.min/100;$('stake-input').max=b.max/100;}
  if(!o.settled&&s.cash<b.min){const button=$('primary-action');if(button){button.disabled=true;button.textContent=`资金不足 · 至少 ${cash(b.min)}`;}}
  if(owns(s,'car'))d.insertAdjacentHTML('beforeend',`<button class="filter-toggle" data-action="life-filter">${glyph('car')} 低级项目过滤 <b>${s.life.filter?'ON':'OFF'}</b></button>`);
 }
 renderShop(){
  const s=this.s,d=$('game-dock');d.dataset.kind='shop';const ids=s.offer.utilities||[];
  d.innerHTML=`<div class="life-eyebrow">${getCity(s).en} / ROADSIDE FINDS</div><h1>这一站，升级生活。</h1><p class="offer-sub">沿途限定 · 离开后商品重新随机</p><div class="utility-list">${ids.map(id=>{const i=ITEMS.find(x=>x.id===id),own=owns(s,id);return `<article><div class="utility-symbol">${glyph(i.icon)}</div><div><h3>${i.name}${i.city?'<em>当地限定</em>':''}</h3><p>${i.desc}</p></div>${action('buy',own?'✓ 已拥有':short(i.price*100),id,own||s.cash<=i.price*100,'compact')}</article>`;}).join('')}</div><details class="clothing-fold"><summary>本店服装 / 原有外观商品</summary>${s.offer.items.map(id=>{const o=this.c.outfit(id);return `<div class="clothing-line"><span>${o.name.zh}</span><button class="life-button compact" data-action="buy-outfit-id" data-value="${id}">${s.outfits.includes(id)?'穿上':cash(o.price*100)}</button></div>`;}).join('')}</details><button class="primary" data-action="next">继续前行 ${glyph('arrow')}</button>`;
  this.c.fit();
 }
 renderRest(){
  const r=this.s.life.rest;if(!r)return;const c=CLASSES[r.class],d=$('game-dock');tickRest(this.s);d.dataset.kind='rest';
  const bill=r.maintenance+r.tax,instant=r.activities.find(a=>a.instant),regular=r.activities.filter(a=>!a.instant);
  const duration=n=>`${Math.floor(n/60)}分${n%60?`${n%60}秒`:''}`;
  const tile=a=>`<article class="rest-action-card"><button class="rest-model-button" data-action="life-preview" data-value="${a.id}" aria-label="预览${a.name}姿势，不扣款"><img src="${this.c.world.restPreview(a.pose,r.class)}" alt="${a.name}的 3D 人物姿势"/><span>预览姿势</span></button><div class="rest-action-info"><h3>${a.name}</h3><p>减少 ${duration(a.seconds)}</p>${action('activity',a.used?'已体验':`支付 ${cash(a.price)}`,a.id,a.used||this.s.cash<=a.price||r.remaining<=0)}</div></article>`;
  d.innerHTML=`<div class="rest-panel-head"><span>${c.name} · 假期</span><h1>${r.paid?'慢下来，也是一种前进。':'先安顿好，再好好休息。'}</h1></div><div class="rest-progress-head"><span id="rest-status">${r.paid?'正在恢复':'缴费后开始恢复'}</span><strong id="rest-clock">${time(r.remaining)}</strong></div><div class="rest-track" role="progressbar" aria-label="休息恢复进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="rest-fill"></i></div>
  ${!r.paid?`<div class="rest-bill"><span>基本维护费 <b>${cash(r.maintenance)}</b></span><span>模拟税费 <b>${cash(r.tax)}</b></span><span>本次休息 <b>10 分钟 → 200 体力</b></span></div>${action('pay',`支付 ${cash(bill)} · 开始休息`,'',this.s.cash<=bill,'primary')}${this.s.cash<=bill?action('aid','余额不足 · 申请公共救助（15 分钟）'):''}<details class="rest-details"><summary>费用与救助说明</summary>${note('阶层在进入假期时锁定。价格按地区与随机偏移生成，均为虚拟美元。救助会保留 $0.01，不产生债务。')}</details>`:
  `<div id="rest-ready" ${r.remaining>0?'hidden':''}>${action('finish','领取 200 体力，继续出发 →','','','primary')}</div><div id="rest-options" ${r.remaining<=0?'hidden':''}>
  ${instant?`<div class="instant-offer"><div><span>不想等待？最快现在就好。</span><strong>${instant.name}</strong></div>${action('instant',`立即完成休息 · ${cash(instant.price)}`,instant.id,this.s.cash<=instant.price||r.remaining<=0,'instant-button')}<p>完整清空剩余计时 · 点击后再次确认</p></div>`:''}
  <h2 class="rest-section-title">换个方式，放松一下。</h2><div class="rest-activities">${regular.slice(0,2).map(tile).join('')}</div><details class="rest-more"><summary>更多活动 · 另外 ${Math.max(0,regular.length-2)} 种选择</summary><div class="rest-activities">${regular.slice(2).map(tile).join('')}</div></details>
  <div class="rest-ad-line">${action('ad',`观看广告 · 减少 2 分钟（${r.ads}/3）`,'',r.ads>=3||r.remaining<=0||this.adBusy||!this.c.platform.canReward())}<p>${this.c.platform.canReward()?'广告完成后才发放奖励。':'当前无广告供应，仍可等待或选择活动。'}</p></div></div>`}
  <details class="rest-details"><summary>人物故事画框</summary><div class="peer-frame" id="rest-peer"></div></details>`;
  this.paintRest();this.paintPeer();this.c.fit();
 }
 paintRest(){const r=this.s.life.rest;if(!r||!$('rest-clock'))return;const pct=r.paid?(1-r.remaining/r.duration)*100:0;$('rest-clock').textContent=time(r.remaining);$('rest-fill').style.width=pct+'%';$('rest-fill').parentElement.setAttribute('aria-valuenow',Math.round(pct));if($('rest-status'))$('rest-status').textContent=!r.paid?'缴费后开始恢复':r.remaining<=0?'休息完成 · 200 体力等你领取':'离线也会继续恢复';if($('rest-ready'))$('rest-ready').hidden=r.remaining>0;if($('rest-options'))$('rest-options').hidden=r.remaining<=0;}
 paintPeer(){const r=this.s.life.rest,el=$('rest-peer');if(!r||!el)return;const idx=Math.floor(Date.now()/8500)%2,[name,desc]=CELEBS[r.class][idx];el.innerHTML=`<div class="pixel-portrait">${portrait(r.class+idx)}</div><div><span>人生阶段联想 / ${idx+1} OF 2</span><strong>${name}</strong><p>${desc}</p><small>按游戏阶层选取故事 · 非本人当前净资产 · 非本人肖像</small></div>`;}
 renderDelivery(){const o=this.s.offer,d=$('game-dock');d.dataset.kind='delivery';d.innerHTML=`<div class="life-eyebrow">SINGAPORE / SETTLEMENT</div><h1>资金正在交割。</h1><div class="delivery-animation">${glyph('train')}<i></i>${glyph('bank')}</div><div class="fixed-stake"><span>已锁定投入</span><strong>${cash(o.pendingStake)}</strong></div><p class="small-rule">等待 20 秒后揭晓。成功率 ${o.p}%，成功返还 ×${o.up}；失败损失锁定投入。刷新不会重抽结果。</p><strong class="delivery-clock" id="delivery-clock">${time(o.readyAt-Date.now())}</strong><button class="primary" data-action="life-settle" ${Date.now()<o.readyAt?'disabled':''}>揭晓交割结果 ${glyph('arrow')}</button>`;this.c.fit();}
 renderTransit(){const t=this.s.life.travel,to=CITY_DATA.find(c=>c.id===t.to),from=CITY_DATA.find(c=>c.id===t.from),d=$('game-dock');d.dataset.kind='transit';d.innerHTML=`<div class="life-eyebrow">ON THE WAY / ${to.en}</div><h1>${from.name} → ${to.name}</h1><div class="transit-route"><span>${from.en}</span><div><i id="travel-dot">${glyph(t.mode==='ground'?'train':'plane')}</i></div><span>${to.en}</span></div><div class="rest-progress-head"><span>路费已付 ${cash(t.cost)}</span><strong id="travel-clock">${time(t.arriveAt-Date.now())}</strong></div><div class="rest-track"><i id="travel-fill"></i></div>${note('路程参考地理距离；交通时间为游戏压缩，非真实时刻表。旅程离线继续，抵达后恢复操作。')}${action('arrive','抵达 · 开始探索 '+glyph('arrow'),'',Date.now()<t.arriveAt,'primary')}`;this.c.fit();}
 openAtlas(){
  const s=this.s;if(!owns(s,'passport'))return;if(s.life.rest||s.life.travel||s.offer.pendingStake){this.c.toast('完成当前阶段后才能打开旅行地图。');return;}
  const from=getCity(s),selected=CITY_DATA.find(c=>c.id===this.selected)||CITY_DATA[1];
  const cards=CITY_DATA.map((city,index)=>{const locked=s.life.currentWorth<city.min*100;return `<button class="city-card ${selected.id===city.id?'selected':''} ${locked?'locked':''}" data-action="life-city" data-value="${city.id}" aria-pressed="${selected.id===city.id}"><img src="${this.c.world.cityPreview(city.id)}" alt="${city.name}的游戏 3D 模型预览"/><span class="city-code">${String(index+1).padStart(2,'0')} / ${city.en}</span><div><strong>${city.name}</strong><small>${city.tag}</small><em>${city.id===from.id?'● 你在这里':locked?`财富门槛 ${short(city.min*100)}`:'可以前往'}</em></div></button>`;}).join('');
  const blocked=selected.id===from.id||s.life.currentWorth<selected.min*100||!!s.activeChallenge;
  const body=`<div class="atlas-panel"><div class="atlas-top"><div><span class="life-eyebrow">THE WORLD IS YOUR NEXT CHAPTER</span><h2 id="modal-title">下一站，去哪里？</h2></div><button class="atlas-close" data-action="close" aria-label="收起地图">⌄</button></div><div class="atlas-scroll" id="atlas-scroll">${cards}</div><div class="atlas-detail"><div class="atlas-copy"><span class="life-eyebrow">${selected.en} · ${Math.abs(selected.coords[0]).toFixed(2)}°N / ${Math.abs(selected.coords[1]).toFixed(2)}°${selected.coords[1]>0?'E':'W'}</span><h3>${selected.name} <small>${selected.country}</small></h3><p>${selected.desc}</p><div class="atlas-event">${glyph('radio')}<span>${selected.event}<small>${selected.eventDesc}</small></span></div>${ITEMS.filter(i=>i.city===selected.id).map(i=>`<small class="local-special">限定发现 / ${i.name} · 随机商店出售</small>`).join('')}</div><div class="transport-options"><span class="life-eyebrow">CHOOSE YOUR WAY / 交通方式</span>${routes(s,selected).map(r=>action('travel',`${glyph(r.icon)}<span>${r.name}<small>${time(r.seconds*1000)} · 消耗 10 体力</small></span><b>${cash(r.cost)}</b>`,`${selected.id}:${r.id}`,blocked||s.cash<=r.cost||s.life.energy<=0,'transport')).join('')}${note(s.activeChallenge?'限时挑战进行中，暂时不能跨城。':s.life.energy<=0?'体力耗尽，请先完成假期。':'游戏内美元 · 时间压缩 · 未购商品不会自动解锁')}</div></div></div>`;
  const previous=$('atlas-scroll')?.scrollLeft??this.atlasLeft;this.c.open('atlas','','',body,{wide:true,custom:true});if($('atlas-scroll')){$('atlas-scroll').scrollLeft=previous;$('atlas-scroll').addEventListener('scroll',()=>this.atlasLeft=$('atlas-scroll').scrollLeft,{passive:true});}
 }
 openMechanisms(){
  const s=this.s;
  const w=worth(s);
  const milestoneCards=UNLOCK_MILESTONES.map((m,index)=>{
    const unlocked=w>=m.at*100;
    return `<article class="milestone-card ${unlocked?'unlocked':'locked'}"><div class="milestone-card-top"><span class="milestone-badge">${unlocked?'✓ 已生效':'🔒 未解锁'}</span><span class="milestone-threshold">门槛 ${short(m.at*100)}</span></div><h3>${safe(m.title)}</h3><p>${safe(m.desc)}</p></article>`;
  }).join('');
  this.c.open('mechanisms','机制演进图谱','白手起家到巅峰资本家的解锁路线',`<div class="milestone-roadmap">${milestoneCards}</div><p class="life-note">机制根据当前总身家即时激活；阶层跃升后沿途将涌现更多专属奇遇与秘密拍卖！</p>`,{wide:true});
 }
 menuExtras(){
  const s=this.s;return `<section class="life-menu"><div class="life-eyebrow">LIFE / 生活系统</div><p>体力 ${s.life.energy} / 200 · ${getCity(s).name} · ${CLASSES[classIndex(s)].name}</p><div class="life-menu-actions">${owns(s,'passport')?action('map','旅行地图'):''}${owns(s,'hex')?action('mechanisms','机制图谱'):''}${owns(s,'car')?action('filter',`项目过滤：${s.life.filter?'开启':'关闭'}`):''}${owns(s,'ui')?action('theme',`界面：${s.life.modern?'Atelier':'基础'}`):''}${owns(s,'music')?action('soundscape',`配乐：${{auto:'自适应',city:'按城市',class:'按阶层'}[s.life.soundscape]}`):''}${owns(s,'deposit')?action('interest',`离线日利率 ${(dailyRate(s)*100).toFixed(1)}%`):''}${action('guide','体力与生活规则')}</div></section>`;
 }
 guide(){this.c.open('life-guide','慢一点，走得更远。','UPSHIFT / 生活与财富',`<div class="life-guide"><h3>体力与假期</h3><p>前进 −5、投资 −3、购买 −2、跨城 −10。只前进约 40 站耗尽；耗尽后的下一阶段固定休假。维护费和模拟税费缴纳后，开始 10 分钟恢复。每阶层有 6 项普通活动与 1 项立即完成套餐；普通活动会缩短计时，立即套餐会清空全部剩余时间。每次假期最多 3 次广告奖励，每次减 2 分钟。没有广告供应时仍可免费等待。</p><h3>从简单开始</h3><p>初始只有现金、普通投资、体力与休息。财富提高后遇到更多商品、地图、挑战和高阶项目。高级机制需要在随机商店用游戏币购买。地图、广播、界面、机制图、计息账户、轿车和配乐都不免费解锁。</p><h3>项目规则</h3><p>街头项目最高 $500；高级项目 $1,000–$100,000；顶级项目 $100,000 起、不设玩法上限（系统安全上限 9 万亿美元）。东京、纽约有双重审核；新加坡有延迟交割；拉斯维加斯更容易遇到高风险合约。普通失败只损失投入；全仓风险合约会再次确认。</p><h3>数据与价格</h3><p>所有金额为虚拟美元，无真实充值兑现。交通按经纬度距离压缩；消费是现实量级参考，不是实时价格。全球财富排名为 82 亿人口的合成模型，并非真实调查。名人卡片只作人生阶段联想，不声称其净资产等于玩家。离线利息以离开时现金为基数、简单计息，最多 7 天。修改设备时钟或存档仍可能作弊，客户端不具备服务端验真。</p></div>`);}
 tick(){
  const second=Math.floor(Date.now()/1000);if(this.c.started?.()===false)return;if(second===this.clockSecond)return;this.clockSecond=second;const s=this.s;if(!s.life)return;
  if(s.life.rest){tickRest(s);this.paintRest();if(second%8===0)this.paintPeer();}
  if(s.life.travel){const t=s.life.travel,pct=Math.min(100,Math.max(0,(Date.now()-t.startedAt)/t.duration*100));if($('travel-clock'))$('travel-clock').textContent=time(t.arriveAt-Date.now());if($('travel-fill'))$('travel-fill').style.width=pct+'%';if($('travel-dot'))$('travel-dot').style.left=pct+'%';const b=document.querySelector('[data-action="life-arrive"]');if(b)b.disabled=Date.now()<t.arriveAt;}
  if(s.offer.pendingStake){if($('delivery-clock'))$('delivery-clock').textContent=time(s.offer.readyAt-Date.now());const b=document.querySelector('[data-action="life-settle"]');if(b)b.disabled=Date.now()<s.offer.readyAt;}
  if(second%9===0)this.renderHud();if(second%5===0&&(s.life.rest||s.life.travel||s.offer.pendingStake))this.c.save();
 }
 musicId(fallback){if(!owns(this.s,'music'))return owns(this.s,'passport')?getCity(this.s).music:fallback;const s=this.s;if(s.life.soundscape==='class'||s.life.soundscape==='auto'&&(s.life.rest||classIndex(s)>=4))return 'class'+(s.life.rest?.class??classIndex(s));return getCity(s).music;}
 async handle(a,v){
  if(a==='buy-outfit-id'){this.c.buyOutfit(v);return true;}if(!a.startsWith('life-'))return false;
  const s=this.s;if(s.ended)return true;
  try{
   switch(a.slice(5)){
    case 'map':this.openAtlas();break;
    case 'city':this.selected=v;this.openAtlas();break;
    case 'mechanisms':this.openMechanisms();break;
    case 'guide':this.guide();break;
    case 'prompt-rest':this.promptRest();break;
    case 'buy':{if(!this.beforeNext())break;const i=buyUtility(s,v);this.persist();this.c.renderDock();this.c.toast(`已购买 ${i.name} · ${i.desc}`);break;}
    case 'filter':if(owns(s,'car')){s.life.filter=!s.life.filter;this.persist();this.c.renderDock();this.c.toast(s.life.filter?'过滤开启：自动跨过低级项目，每站仍消耗体力。':'过滤已关闭。');}break;
    case 'theme':if(owns(s,'ui')){s.life.modern=!s.life.modern;this.persist();this.c.toast(s.life.modern?'已启用 Atelier 现代界面。':'已切回原有基础界面。');}break;
    case 'soundscape':if(owns(s,'music')){const modes=['auto','city','class'];s.life.soundscape=modes[(modes.indexOf(s.life.soundscape)+1)%3];this.persist();this.c.toast('音乐管家已切换为：'+{auto:'自适应',city:'按城市',class:'按阶层'}[s.life.soundscape]);}break;
    case 'interest':this.c.open('interest','让时间，产生一点回响。','计息账户 / 虚拟收益',`<div class="interest-hero">${glyph('bank')}<strong>${(dailyRate(s)*100).toFixed(1)}%<small>/ DAY</small></strong></div><p>当前现金 ${cash(s.cash)}。按此余额，离线 1 天可获得约 ${cash(Math.floor(s.cash*dailyRate(s)))}。</p><p>每次重新打开游戏按离线时长结算，最长累计 7 天。收益只计算现金，不计算建筑、服装或商品价值，不复利。少于 1 分钟不结算。</p>${this.income?`<div class="panel-notice">最近一次离线收益：+${cash(this.income.delta)}</div>`:''}`);break;
    case 'pay':{const before=s.cash;payRest(s);this.c.cash?.(s.cash-before,document.getElementById('game-dock'));this.persist();this.renderRest();break;}
    case 'aid':{const before=s.cash;payRest(s,true);this.c.cash?.(s.cash-before,document.getElementById('game-dock'));this.persist();this.renderRest();break;}
    case 'activity':{const a=restActivity(s,Number(v));this.persist();this.renderRest();this.c.toast(`${a.name} · 已减少 ${Math.floor(a.seconds/60)} 分钟${a.seconds%60?`${a.seconds%60} 秒`:''}`);break;}
    case 'instant':{const r=s.life.rest,a=r?.activities.find(x=>x.id===Number(v));if(!r?.paid||!a?.instant||r.remaining<=0)break;this.c.confirm('立即完成本次休息？',`支付 ${cash(a.price)} 游戏币购买「${a.name}」，剩余休息计时立即归零。不会使用真钱。`,()=>{try{if(this.s!==s||s.life.rest!==r)throw Error('当前假期已变更。');restActivity(s,a.id);this.persist();this.renderRest();this.c.toast('休息已立即完成。领取 '+s.life.energyCap+' 体力就能继续出发。');}catch(e){this.c.toast(e.message);}});break;}
    case 'preview':{const r=s.life.rest,a=r?.activities.find(x=>x.id===Number(v));if(a){r.pose=a.pose;r.lastActivity='预览：'+a.name;this.c.world.setRest(r);this.renderHud();this.c.save();}break;}
    case 'camera':if(s.life.rest){s.life.rest.camera=Math.max(0,Math.min(2,Number(v)||0));this.c.world.setRest(s.life.rest);this.renderHud();this.c.save();}break;
    case 'ad':{const r=s.life.rest;if(!r?.paid||r.ads>=3||r.remaining<=0||this.adBusy)break;this.adBusy=true;this.renderRest();const id=r.id,runId=s.id;let ok=false;try{ok=await this.c.platform.rewarded();}finally{this.adBusy=false;}if(s.id===runId&&this.s===s){if(ok&&rewardRest(s,id)){this.persist();this.c.toast('广告奖励到账：休息减少 2 分钟。');}else this.c.toast('广告未完成或暂不可用，未发放奖励。');this.c.refresh();this.renderRest();}break;}
    case 'finish':finishRest(s);s.page++;s.offer=makeOffer(s);s.lastResult=null;this.c.save();this.c.close();this.c.world.setOffer(s.offer);this.c.refresh();this.c.renderDock();this.c.toast('体力已恢复到 '+s.life.energyCap+'，新的机会正在等你。');break;
    case 'travel':{const [city,mode]=v.split(':');startTravel(s,city,mode);this.c.save();this.c.close();this.c.refresh();this.renderTransit();break;}
    case 'arrive':{const city=arrive(s);s.page++;s.offer=makeOffer(s);s.lastResult=null;this.c.save();this.c.world.setOffer(s.offer);this.c.refresh();this.c.renderDock();this.c.toast(`欢迎来到${city.name}。${city.tag}`);break;}
    case 'settle':await this.c.invest();break;
    case 'dev-rest':if(this.c.devEnabled()){beginRest(s);s.unranked=true;this.c.close();this.persist();this.renderRest();}break;
    case 'dev-ready':if(this.c.devEnabled()){s.unranked=true;if(s.life.rest){s.life.rest.paid=true;s.life.rest.remaining=0;s.life.rest.lastTick=Date.now();}if(s.life.travel)s.life.travel.arriveAt=Date.now();this.c.close();this.persist();this.c.renderDock();}break;
    case 'dev-goods':if(this.c.devEnabled()){s.unranked=true;s.life.items=ITEMS.map(i=>i.id);s.life.currentWorth=Math.max(s.life.currentWorth,2e9);this.c.close();this.persist();this.c.renderDock();}break;
   }
  }catch(error){this.c.toast(error.message||'当前操作不可用。');}
  return true;
 }
}
