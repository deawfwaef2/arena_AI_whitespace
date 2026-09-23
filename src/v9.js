// v9 UI layer: card-deck strip, tap-to-earn work dock, fork (where next), partners, luxuries,
// special places, main story, identity-object frame, locked seals, reclaim popup, fatigue alert,
// LV points / leaderboard / skins, language-aware labels. Picture+text buttons, no emoji.
import {worth,TIERS_LATE} from './endgame-core.js';
import {escape as safe} from './ui.js';
import {getAsset} from './catalog.js';
import * as C from './v9-core.js';

const $=id=>document.getElementById(id);
const ART=k=>window.UPSHIFT_ART?.['ic-'+k]||'';
const img=(k,cls='v9-ic')=>`<img class="${cls}" src="${ART(k)}" alt="" draggable="false">`;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// big identity objects on the screen frame, by visual rank (0..5)
const FRAME=[['can','box','noodle','ticket'],['coffee','briefcase','steelwatch','carkey'],['coffee','steelwatch','carkey','briefcase'],['goldwatch','champagne','handbag','suit'],['yacht','cigar','goldwatch','champagne'],['jet','diamond','crown','goldkey']];
const FRAME_NAMES={can:['易拉罐','Soda can'],box:['纸箱','Cardboard'],noodle:['泡面','Cup noodles'],ticket:['车票','Bus ticket'],coffee:['咖啡','Coffee'],briefcase:['公文包','Briefcase'],steelwatch:['钢表','Steel watch'],carkey:['车钥匙','Car key'],goldwatch:['金表','Gold watch'],champagne:['香槟','Champagne'],handbag:['手袋','Handbag'],suit:['定制西装','Bespoke suit'],yacht:['游艇','Yacht'],cigar:['雪茄','Cigar'],jet:['私人飞机','Jet'],diamond:['钻石','Diamond'],crown:['王冠','Crown'],goldkey:['金钥匙','Golden key']};

export class V9{
 constructor(c){this.c=c;this.lastTier=null;this.nextTick=0;this.queue=[];
  const game=$('game');
  game.insertAdjacentHTML('beforeend',`<div id="v9-frame" aria-hidden="true"><i class="v9-edge t"></i><i class="v9-edge b"></i><i class="v9-edge l"></i><i class="v9-edge r"></i><span class="v9-corner tl"></span><span class="v9-corner tr"></span><span class="v9-corner bl"></span><span class="v9-corner br"></span><div class="v9-props"></div></div>
   <div id="v9-deck" hidden></div><div id="v9-lv" hidden></div><div id="v9-fatigue" hidden></div><div id="v9-vitrine" hidden></div>`);
  this.bindTap();
 }
 get s(){return this.c.run();}
 get zh(){return this.c.meta().lang!=='en';}
 T(zh,en){return this.zh?zh:en;}
 P(pair){return Array.isArray(pair)?(this.zh?pair[0]:pair[1]):pair;}
 money(c){return this.c.money(c);}

 /* ---------- per-render refresh ---------- */
 refresh(){try{this.paint();}catch(e){console.error('v9',e);}}
 paint(){const s=this.s;if(!s?.life)return;const v=C.st(s),started=this.c.started(),app=$('app'),t=C.liquidTier(s),rank=Math.min(5,t);
  app.dataset.v9='on';app.dataset.v9lang=this.zh?'zh':'en';app.dataset.v9tier=t;app.dataset.v9poor=C.liquid(s)<C.PROJECT_UNLOCK?'yes':'no';
  if(this.beautyRank!==rank){this.beautyRank=rank;this.c.world?.setBeauty?.(rank);}
  this.paintFrame(rank,started);this.paintDeck(v,started);this.paintLV(v,started);this.paintFatigue(started);this.paintVitrine(v,started);
  // rank change → story chapter / reclaim popup (only while playing)
  if(started&&!s.ended){if(this.lastTier!==null&&t<this.lastTier)this.queue.push({k:'reclaim',from:this.lastTier,to:t});
   if(t>v.maxTier){for(let i=v.maxTier+1;i<=t;i++)if(!v.story.seen.includes(i))this.queue.push({k:'story',t:i});v.maxTier=t;}
   if(!v.story.seen.includes(0)&&(s.page<=3))this.queue.push({k:'story',t:0});}
  const resting=!!s.life.rest;if(resting&&this.prevRest===false)this.onRestStart();this.prevRest=resting;
  this.lastTier=t;this.flush();}
 flush(){if(!this.queue.length||this.c.modal()||this.c.busy()||!this.c.started())return;const q=this.queue.shift();this.queue=this.queue.filter(x=>!(x.k===q.k&&x.t===q.t));if(q.k==='reclaim')this.showReclaim(q);else if(q.k==='story'){if(!C.st(this.s).story.seen.includes(q.t))this.showStory(q.t);}}
 tick(now){if(now<this.nextTick)return;this.nextTick=now+300;this.flush();}

 /* ---------- frame with identity objects ---------- */
 paintFrame(rank,started){const f=$('v9-frame');f.hidden=!started;f.dataset.rank=rank;const key=rank+(this.zh?'z':'e');if(f.dataset.key===key)return;f.dataset.key=key;
  f.querySelector('.v9-props').innerHTML=FRAME[rank].map((k,i)=>`<span class="v9-prop p${i}" title="${safe(this.P(FRAME_NAMES[k]))}">${img(k,'v9-prop-img')}</span>`).join('');}

 /* ---------- deck strip under the status bar ---------- */
 paintDeck(v,started){const el=$('v9-deck'),s=this.s;el.hidden=!started||!!s.life.rest||!!s.life.travel;if(el.hidden)return;const d=v.deck;const z=d?C.ZONES[d.zone]:null;const left=d?d.cards.length:0,total=d?.total||1;const m=C.mood(s);
  const key=[d?.id,left,this.zh,m.m,v.intel,s.offer.type].join();if(el.dataset.key===key)return;el.dataset.key=key;
  const cards=Array.from({length:Math.min(10,total)},(_,i)=>`<i class="${i<left?'on':'off'}"></i>`).join('');
  el.innerHTML=`<span class="v9-d-zone">${z?img(z.icon):''}<b>${z?this.P([z.zh,z.en]):'—'}</b></span><span class="v9-d-cards" title="${this.T('本区剩余卡牌','Cards left in this zone')}">${img('cards','v9-ic sm')}<span class="v9-d-pile">${cards}</span><b>${left}/${total}</b></span>${left===0?`<em class="v9-d-next">${this.T('下一站：选择方向','Next: choose a direction')}</em>`:''}${C.liquid(s)>=C.PROJECT_UNLOCK?`<span class="v9-d-mood ${m.m>0?'up':m.m<0?'down':''}" title="${this.T('本季市场情绪：影响所有项目成功率','Season market mood: shifts all project odds')}">${img('invest','v9-ic sm')}${this.P(m.label)} ${m.m>0?'+':''}${m.m}%</span>`:''}${v.intel?`<span class="v9-d-intel">${img('story','v9-ic sm')}${this.T('内幕','Intel')} ×${v.intel}</span>`:''}`;}

 /* ---------- LV points chip ---------- */
 paintLV(v,started){const el=$('v9-lv'),s=this.s;const lv=C.runLV(s,getAsset);el.hidden=!started||(lv===0&&C.liquid(s)<C.PROJECT_UNLOCK);if(el.hidden)return;const k=lv+(this.zh?'z':'e');if(el.dataset.k===k)return;const up=el.dataset.k&&parseInt(el.dataset.k)<lv;el.dataset.k=k;el.innerHTML=`${img('trophy')}<b>${lv}</b><small>LV</small>`;el.title=this.T('LV 胜利点：奢侈品、建筑、合伙人羁绊。通关后计入排行榜。','LV victory points: luxuries, estates, partner bonds. Counted on the leaderboard.');el.dataset.action='v9-lv';if(up&&this.c.motion())el.animate([{transform:'scale(1.4)',filter:'brightness(1.6)'},{transform:'scale(1)'}],{duration:600});}

 /* ---------- luxury vitrine (permanent window) ---------- */
 paintVitrine(v,started){const el=$('v9-vitrine');el.hidden=!started||!v.lux.length||!!this.s.life.rest;if(el.hidden)return;const k=v.lux.join()+this.zh;if(el.dataset.k===k)return;el.dataset.k=k;el.className='v7-draggable';
  el.innerHTML=`<div class="v7-handle"><span>${img('trophy','v9-ic sm')}${this.T('奢侈品陈列','Luxury vitrine')}</span><em>⠿</em></div><div class="v9-vit-row">${v.lux.map(id=>{const x=C.getLux(id);return `<span title="${safe(this.P([x.zh,x.en]))} · +${C.luxLV(this.s,x)} LV">${img(id)}</span>`;}).join('')}</div>`;}

 /* ---------- fatigue ---------- */
 paintFatigue(started){const s=this.s,el=$('v9-fatigue');const tired=started&&!s.life.rest&&!s.life.travel&&!s.ended&&s.life.energy<100;$('app').dataset.v9tired=tired?(s.life.energy<40?'hard':'yes'):'no';el.hidden=!tired;if(!tired){this.warned=false;return;}
  const risk=Math.round(100-s.life.energy);const k=risk+this.zh;if(el.dataset.k!==k){el.dataset.k=k;el.innerHTML=`${img('bolt')}<div><b>${this.T('疲惫','Exhausted')}</b><small>${this.T(`现在休息安全；硬撑到 0 再休息：额外 ${risk}% 概率健康 −1`,`Rest now to be safe. Push on and rest at 0: +${risk}% chance to lose a heart`)}</small></div><button data-action="life-prompt-rest">${img('heart','v9-ic sm')}${this.T('去休息','Rest')}</button>`;}
  if(!this.warned&&!this.c.modal()&&!this.c.busy()){this.warned=true;this.c.open('v9-tired','','',`<div class="v9-pop tired"><div class="v9-pop-art">${img('bolt','v9-big')}</div><h2 id="modal-title">${this.T('你累坏了','You are exhausted')}</h2><p>${this.T('体力低于 100。现在去休息最安全。继续硬撑的话，进入休息时会有额外概率失去 1 颗心——体力越接近 0，概率越接近 100%。',"Energy is below 100. Resting now is safest. If you keep pushing, entering rest adds a chance to lose 1 heart — the closer to 0, the closer to 100%.")}</p><div class="v9-risk-meter"><i style="width:${risk}%"></i><span>${this.T('额外风险','Extra risk')} ${risk}%</span></div><div class="v9-choice-row"><button class="v9-choice" data-action="close">${img('work')}<b>${this.T('再撑一会','Keep going')}</b></button><button class="v9-choice gold" data-action="v9-go-rest">${img('heart')}<b>${this.T('现在休息','Rest now')}</b></button></div></div>`,{custom:true});}}

 /* ---------- reclaim popup (must click) ---------- */
 showReclaim(q){const names=TIERS_LATE;const from=names[q.from],to=names[q.to];const lost=FRAME[Math.min(5,q.from)].filter(k=>!FRAME[Math.min(5,q.to)].includes(k));
  this.c.open('v9-reclaim','','',`<div class="v9-pop reclaim"><div class="v9-seal-band">${this.T('回收','RECLAIMED')}</div><h2 id="modal-title">${this.T('阶级回落','You slipped a class')}</h2><p class="v9-tier-fall"><b>${safe(this.zh?from.name:C.tierLabel({...this.s,cash:from.at*100,life:{...this.s.life,v7:{}},offer:{}},'en'))}</b><span>→</span><b>${safe(this.zh?to.name:C.tierLabel({...this.s,cash:to.at*100,life:{...this.s.life,v7:{}},offer:{}},'en'))}</b></p><div class="v9-lost">${lost.map(k=>`<span>${img(k)}<em>${safe(this.P(FRAME_NAMES[k]))}</em></span>`).join('')}</div><p class="v9-small">${this.T('钱包跌破门槛：界面、边框、装饰与高阶机制被收回。赚回来就会还给你。','Your wallet fell below the threshold: UI, frame, decorations and higher mechanisms are taken back. Earn it back to restore them.')}</p><button class="v9-choice gold wide" data-action="close">${img('check')}<b>${this.T('我会赢回来','I will win it back')}</b></button></div>`,{custom:true});
  this.c.effects?.tone?.('loss',4);}

 /* ---------- main story ---------- */
 showStory(t){const ch=C.STORY.find(x=>x.t===t);if(!ch)return;const v=C.st(this.s);
  const prev=Object.entries(v.story.picks).map(([k,val])=>{const c=C.STORY.find(x=>'t'+x.t===k);const pick=c?.choices.find(z=>z[0]===val);return pick?`<li>${safe(this.P(c.title))}：<i>${safe(this.zh?pick[1]:pick[2])}</i></li>`:'';}).join('');
  this.c.open('v9-story','','',`<div class="v9-pop story" data-t="${t}"><div class="v9-story-head">${img('story','v9-big')}<div><small>${this.T('主线 · 第','CHAPTER ')}${t+1}${this.T(' 章','')}</small><h2 id="modal-title">${safe(this.P(ch.title))}</h2></div></div><p class="v9-story-body">${safe(this.P(ch.body))}</p>${prev&&t>0?`<details class="v9-story-past"><summary>${this.T('你走过的路','Your path so far')}</summary><ul>${prev}</ul></details>`:''}<div class="v9-story-choices">${ch.choices.map(c=>`<button class="v9-choice story" data-action="v9-story" data-value="${t}:${c[0]}">${img(t===0?({night:'noodle',heir:'goldkey',coder:'briefcase',gambler:'cards'})[c[0]]:'story')}<span><b>${safe(this.zh?c[1]:c[2])}</b>${t===0&&C.ORIGINS[c[0]]?`<small>${safe(this.P([C.ORIGINS[c[0]].fx.zh,C.ORIGINS[c[0]].fx.en]))}</small>`:''}</span></button>`).join('')}</div></div>`,{custom:true});}
 pickStory(val){const [t,id]=String(val).split(':');const v=C.st(this.s);const n=Number(t);if(!v.story.seen.includes(n))v.story.seen.push(n);v.story.picks['t'+n]=id;this.c.save();this.c.close();this.c.effects?.tone?.('rare',2);this.c.toast(this.T('这段记忆，会跟着你。','This memory stays with you.'));this.c.refresh();this.c.renderDock();}

 /* ---------- dock renderers for v9 card types ---------- */
 interceptDock(){const s=this.s,o=s.offer;if(!s?.life||s.life.rest||s.life.travel||!C.V9_TYPES.includes(o.type))return false;const d=$('game-dock');d.dataset.kind=o.type;d.classList.remove('v8-wide');
  const fn={'v9-work':'dockWork','v9-fork':'dockFork','v9-partner':'dockPartner','v9-pdeal':'dockPDeal','v9-lux':'dockLux','v9-place':'dockPlace'}[o.type];d.innerHTML=`<div class="v9-dock ${o.type}">${this[fn](o)}</div>`;this.c.fit?.();return true;}
 nextBtn(label){return `<button class="v9-next" data-action="next">${img('compass','v9-ic sm')}<span>${label||this.T('下一站','Next stop')}</span></button>`;}
 dockWork(o){const j=C.JOBS.find(x=>x.id===o.job)||C.JOBS[0];const pct=clamp(o.taps/o.need,0,1),done=o.settled,s=this.s,poor=C.liquid(s)<C.PROJECT_UNLOCK;const lowE=s.life.energy<C.WORK_ENERGY;
  return `<div class="v9-work-art" data-action="${done||lowE?'':'v9-tap'}" role="button" aria-label="${this.T('点击干活','Tap to work')}">${img(j.id,'v9-work-img')}<div class="v9-work-ring" style="--p:${pct}"></div>${done?`<b class="v9-work-done">${img('check','v9-ic')}</b>`:`<b class="v9-work-tap">${this.T('点我！','TAP!')}</b>`}</div>
   <div class="v9-work-info"><span class="v9-tag">${img('work','v9-ic sm')}${this.T('打工','Work')}</span><h1>${safe(this.P([j.zh,j.en]))}</h1><div class="v9-work-bar"><i style="width:${pct*100}%"></i><span>${o.taps}/${o.need}</span></div><div class="v9-work-meta"><span>${img('bolt','v9-ic sm')}−${C.WORK_ENERGY}</span><span class="pay">${img('basket','v9-ic sm')}+${this.money(o.pay)}</span></div>${poor&&!done?`<p class="v9-hint">${this.T(`攒到 ${this.money(C.PROJECT_UNLOCK)} 解锁投资项目`,`Save ${this.money(C.PROJECT_UNLOCK)} to unlock investing`)}</p>`:''}${lowE&&!done?`<p class="v9-hint bad">${this.T('体力不够，先休息','Not enough energy — rest first')}</p>`:''}${done?this.nextBtn():`<button class="v9-skip" data-action="next">${this.T('不干了','Skip')}</button>`}</div>`;}
 dockFork(o){return `<div class="v9-fork-head"><span class="v9-tag">${img('compass','v9-ic sm')}${this.T('岔路','Crossroads')}</span><h1>${this.T('这条街走完了。下一段往哪走？','This street is done. Where next?')}</h1><p>${this.T('每个方向是一副新的牌。','Each direction is a new deck of cards.')}</p></div><div class="v9-fork-list">${o.choices.map(z=>{const Z=C.ZONES[z];return `<button class="v9-fork-card z-${z}" data-action="v9-zone" data-value="${z}">${img(Z.icon,'v9-fork-img')}<b>${this.P([Z.zh,Z.en])}</b><small>${safe(this.P(Z.desc))}</small></button>`;}).join('')}</div>`;}
 dockPartner(o){const p=C.getPartner(o.partner);if(o.settled)return `<div class="v9-partner-row">${img(p.img,'v9-portrait')}<div><span class="v9-tag gold">${img('handshake','v9-ic sm')}${this.T('新合伙人','New partner')}</span><h1>${safe(this.P([p.zh,p.en]))}</h1><p class="v9-quote">${this.T('「那就说定了。下次见面，我带好东西来。」','"Deal. Next time, I bring something good."')}</p>${this.nextBtn()}</div></div>`;
  const s=this.s,can=s.cash>o.fee;return `<div class="v9-partner-row">${img(p.img,'v9-portrait')}<div><span class="v9-tag gold">${img('handshake','v9-ic sm')}${this.T('偶遇 · 可能的合伙人','Chance meeting · potential partner')}</span><h1>${safe(this.P([p.zh,p.en]))}</h1><p class="v9-quote">「${safe(this.P(p.meet))}」</p><p class="v9-small">${this.T('建立关系后，他会不时在你前进时出现，带来特殊项目。','Once connected, they will pop up as you walk, bringing special deals.')}</p><div class="v9-choice-row"><button class="v9-choice" data-action="next">${img('compass')}<b>${this.T('婉拒','Decline')}</b></button><button class="v9-choice gold" data-action="v9-meet" ${can?'':'disabled'}>${img('handshake')}<b>${this.T('建立联系','Connect')}</b><small>−${this.money(o.fee)}</small></button></div></div></div>`;}
 dockPDeal(o){const p=C.getPartner(o.partner),v=C.st(this.s),rel=v.partners[p.id]||{bond:0};const line=p.lines[Math.min(2,rel.bond)];
  if(o.settled){const r=o.result||{};return `<div class="v9-partner-row">${img(p.img,'v9-portrait')}<div><span class="v9-tag gold">${img('handshake','v9-ic sm')}${safe(this.P([p.zh,p.en]))} · ${this.T('羁绊','Bond')} ${'◆'.repeat(Math.min(3,rel.bond))}${'◇'.repeat(Math.max(0,3-rel.bond))}</span><h1 class="${r.won?'win':'lose'}">${r.won?'+':'−'}${this.money(Math.abs(r.delta||0))}</h1><p class="v9-quote">「${safe(r.won?this.T('合作愉快。','A pleasure.'):this.T('这次运气不在我们这边。','Luck wasn\u2019t ours this time.'))}」</p>${r.lv?`<p class="v9-lvgain">${img('trophy','v9-ic sm')}+${r.lv} LV</p>`:''}${this.nextBtn()}</div></div>`;}
  return `<div class="v9-partner-row">${img(p.img,'v9-portrait')}<div><span class="v9-tag gold">${img('handshake','v9-ic sm')}${this.T('合伙人来找你了','Your partner shows up')} · ${this.T('羁绊','Bond')} ${'◆'.repeat(Math.min(3,rel.bond))}${'◇'.repeat(Math.max(0,3-rel.bond))}</span><h1>${safe(this.P([p.zh,p.en]))}</h1><p class="v9-quote">「${safe(this.P(line))}」</p><div class="v9-opt-list">${p.deals.map((d,i)=>this.optCard(d,'v9-pdeal-go',i)).join('')}</div><button class="v9-skip" data-action="next">${this.T('下次再说','Maybe later')}</button></div></div>`;}
 optCard(d,action,i){const q=C.quoteOpt(this.s,d);const dis=(q.stake&&q.stake>=this.s.cash+1)||(q.cost&&q.cost>=this.s.cash)||(d.heal&&this.s.estate.health>=this.s.estate.maxHealth)||(d.stakePct&&q.stake<1);
  const stats=d.stakePct?`<span class="o-p">${q.p}%</span><span class="o-w">+${this.money(q.win)}</span><span class="o-l">−${this.money(q.stake)}</span>`:q.cost?`<span class="o-l">−${this.money(q.cost)}</span>`:q.gain?`<span class="o-w">+${this.money(q.gain)}</span>`:'';
  return `<button class="v9-opt" data-action="${action}" data-value="${i}" ${dis?'disabled':''}>${img(d.icon)}<span class="o-t"><b>${safe(this.P([d.zh,d.en]))}</b>${d.desc?`<small>${safe(this.P(d.desc))}</small>`:''}</span><span class="o-s">${stats}</span></button>`;}
 dockLux(o){const x=C.getLux(o.lux),s=this.s,lv=C.luxLV(s,x);if(o.settled)return `<div class="v9-lux-row">${img(x.id,'v9-lux-img')}<div><span class="v9-tag lux">${img('trophy','v9-ic sm')}${o.bought?this.T('收入囊中','Acquired'):this.T('错过了','Passed')}</span><h1>${safe(this.P([x.zh,x.en]))}</h1>${o.bought?`<p class="v9-lvgain">${img('trophy','v9-ic sm')}+${lv} LV</p>`:`<p class="v9-small">${this.T('本局不会再遇到它了。','You won\u2019t see it again this run.')}</p>`}${this.nextBtn()}</div></div>`;
  return `<div class="v9-lux-row">${img(x.id,'v9-lux-img')}<div><span class="v9-tag lux">${img('trophy','v9-ic sm')}${this.T('奢侈品 · 本局仅此一次','Luxury · once per run')}</span><h1>${safe(this.P([x.zh,x.en]))}</h1><div class="v9-lux-stats"><span class="price">${this.money(x.price)}</span><span class="lv">${img('trophy','v9-ic sm')}+${lv} LV</span></div><p class="v9-small">${this.T('不产生收益，不计入身家——只换取永久的 LV 胜利点。','No income, not counted in net worth — only permanent LV victory points.')}</p><div class="v9-choice-row"><button class="v9-choice" data-action="next">${img('compass')}<b>${this.T('放弃','Pass')}</b></button><button class="v9-choice gold" data-action="v9-lux-buy" ${s.cash>x.price?'':'disabled'}>${img('handbag')}<b>${this.T('买下','Buy')}</b></button></div></div></div>`;}
 dockPlace(o){const Z=C.ZONES[o.place],opts=C.PLACE_OPTS[o.place].filter(x=>o.opts.includes(x.id));const s=this.s;
  if(o.settled){const r=o.result||{};return `<div class="v9-place-head">${img(Z.icon,'v9-place-img')}<div><span class="v9-tag">${this.P([Z.zh,Z.en])}</span><h1 class="${r.won===false||r.hurt?'lose':'win'}">${r.delta?(r.delta>0?'+':'−')+this.money(Math.abs(r.delta)):r.heal?this.T('健康 +1','+1 heart'):r.energy?this.T('体力 +','Energy +')+r.energy:this.T('完成','Done')}</h1>${r.hurt?`<p class="v9-hint bad">${img('heart','v9-ic sm')}${this.T('副作用：健康 −1','Side effect: −1 heart')}</p>`:''}${r.debt?`<p class="v9-hint bad">${this.T('下次休息需还款 ','Repay at next rest: ')}${this.money(r.debt)}</p>`:''}${this.nextBtn()}</div></div>`;}
  return `<div class="v9-place-head">${img(Z.icon,'v9-place-img')}<div><span class="v9-tag">${img('compass','v9-ic sm')}${this.T('特殊地点','Special place')}</span><h1>${this.P([Z.zh,Z.en])}</h1>${o.place==='hospital'?`<p class="v9-small">${this.T('健康','Health')} ${s.estate.health}/${s.estate.maxHealth}</p>`:''}</div></div><div class="v9-opt-list">${opts.map(d=>this.optCard(d,'v9-place-go',C.PLACE_OPTS[o.place].indexOf(d))).join('')}</div><button class="v9-skip" data-action="next">${this.T('离开','Leave')}</button>`;}

 /* ---------- tap mining ---------- */
 bindTap(){document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('[data-action="v9-tap"]');if(!el||!this.c.started()||this.c.modal())return;e.preventDefault();this.tap(el,e);},true);}
 tap(el,e){const s=this.s,o=s.offer;if(o.type!=='v9-work'||o.settled||s.life.energy<C.WORK_ENERGY)return;o.taps=Math.min(o.need,o.taps+1);const pct=o.taps/o.need;
  el.querySelector('.v9-work-ring')?.style.setProperty('--p',pct);const bar=$('game-dock').querySelector('.v9-work-bar');if(bar){bar.querySelector('i').style.width=pct*100+'%';bar.querySelector('span').textContent=o.taps+'/'+o.need;}
  if(this.c.motion()){el.querySelector('.v9-work-img')?.animate([{transform:'scale(.86) rotate(-6deg)'},{transform:'scale(1)'}],{duration:160});const f=document.createElement('b');f.className='v9-tapfx';f.textContent='+'+Math.max(1,Math.round(o.pay/o.need/100));const r=el.getBoundingClientRect();f.style.left=(e.clientX-r.left)+'px';f.style.top=(e.clientY-r.top)+'px';el.append(f);setTimeout(()=>f.remove(),700);}
  this.c.effects?.tone?.('tap');
  if(o.taps>=o.need){try{const pay=C.finishWork(s);this.c.cash(pay,el);this.c.effects?.tone?.('win',1);this.c.save();this.c.refresh();this.c.renderDock();}catch(err){this.c.toast(err.message);}}}

 /* ---------- actions ---------- */
 handle(a,v){if(!a.startsWith('v9-'))return false;const s=this.s,o=s.offer;
  try{switch(a){
   case 'v9-zone':{C.chooseZone(s,v);this.c.save();this.c.toast(this.T('转向：','Heading to: ')+this.P([C.ZONES[v].zh,C.ZONES[v].en]));this.c.effects?.tone?.('rare',2);this.c.next();break;}
   case 'v9-meet':{const fee=C.meetPartner(s);this.c.cash(-fee,$('game-dock'));this.c.save();this.c.refresh();this.c.renderDock();this.c.effects?.tone?.('rare',3);const p=C.getPartner(o.partner);this.c.toast(this.T('合伙人名片已收下：','Partner added: ')+this.P([p.zh,p.en]));break;}
   case 'v9-pdeal-go':{if(o.type!=='v9-pdeal'||o.settled)break;const p=C.getPartner(o.partner),d=p.deals[Number(v)];if(s.life.energy<3){this.c.toast(this.T('体力不够','Not enough energy'));break;}s.life.energy-=3;const r=C.resolveOpt(s,d);const rel=C.st(s).partners[p.id]||(C.st(s).partners[p.id]={bond:0});rel.last=s.page;if(r.won&&rel.bond<3)rel.bond++;o.settled=true;o.result=r;this.fx(r);break;}
   case 'v9-place-go':{if(o.type!=='v9-place'||o.settled)break;const d=C.PLACE_OPTS[o.place][Number(v)];if(!d)break;if(s.life.energy<2){this.c.toast(this.T('体力不够','Not enough energy'));break;}s.life.energy-=2;const r=C.resolveOpt(s,d);o.settled=true;o.result=r;if(s.estate.health<=0){this.c.save();this.c.refresh();this.c.death?.('健康耗尽');break;}this.fx(r);break;}
   case 'v9-lux-buy':{const lv=C.buyLux(s);this.c.cash(-C.getLux(o.lux).price,$('game-dock'));this.c.effects?.tone?.('rare',5);this.c.effects?.burst?.(innerWidth/2,innerHeight/2,20,'#f0cf73');this.c.save();this.c.refresh();this.c.renderDock();this.c.toast('+'+lv+' LV');break;}
   case 'v9-story':this.pickStory(v);break;
   case 'v9-go-rest':this.c.close();setTimeout(()=>document.querySelector('[data-action="life-prompt-rest"]')?.click(),50);break;
   case 'v9-lv':this.showLV();break;
   case 'v9-skin':{const m=this.c.meta();const sk=C.SKINS.find(x=>x.id===v);if(sk&&(m.v9best||0)>=sk.lv){m.v9skin=v;this.c.save();this.c.world?.setSkin?.(sk.color);this.showLV();}break;}
   default:return false;}
  }catch(err){this.c.toast(err.message==='cash'?this.T('现金不足','Not enough cash'):err.message==='full'?this.T('健康已满','Health is full'):err.message);}
  return true;}
 fx(r){if(r.delta)this.c.cash(r.delta,$('game-dock'));this.c.effects?.tone?.(r.won===false||r.hurt?'loss':'win',3);if(r.won===false)$('game-dock').classList.add('shake'),setTimeout(()=>$('game-dock').classList.remove('shake'),380);this.c.save();this.c.refresh();this.c.renderDock();}

 /* ---------- debt settles at rest ---------- */
 onRestStart(){const s=this.s,v=C.st(s);if(!v.debt)return;const pay=Math.min(v.debt,Math.max(0,s.cash-1));s.cash-=pay;v.debt-=pay;if(v.debt>0){s.estate.health=Math.max(0,s.estate.health-1);v.debt=0;this.c.toast(this.T('当铺收债不足：打手找上门，健康 −1','Pawn debt unpaid: collectors came. −1 heart'));}else this.c.toast(this.T('已还当铺借款 ','Pawn loan repaid ')+this.money(pay));}

 /* ---------- LV / leaderboard / skins ---------- */
 showLV(){const m=this.c.meta(),s=this.s,v=C.st(s),cur=C.runLV(s,getAsset);const best=m.v9best||0;const rows=(m.records||[]).filter(r=>Number.isFinite(r.lv)).sort((a,b)=>b.lv-a.lv).slice(0,10);
  this.c.open('v9-lvboard','','',`<div class="v9-pop lvboard"><div class="v9-story-head">${img('trophy','v9-big')}<div><small>LV · ${this.T('胜利点','Victory points')}</small><h2 id="modal-title">${this.T('本局','This run')} ${cur} LV</h2></div></div>
   <div class="v9-lv-grid"><div><h3>${this.T('来源','Sources')}</h3><p>${img('handbag','v9-ic sm')}${this.T('奢侈品','Luxuries')} ${v.lux.length}</p><p>${img('goldkey','v9-ic sm')}${this.T('建筑资产','Estates')} ${(s.assets||[]).length}</p><p>${img('handshake','v9-ic sm')}${this.T('满羁绊合伙人','Max-bond partners')} ${Object.values(v.partners).filter(p=>p.bond>=3).length}</p><p class="v9-small">${this.T('本局结束时再按最高身家追加 LV。','At run end, bonus LV is added for peak net worth.')}</p></div>
   <div><h3>${this.T('排行榜 · 单局最高 LV','Leaderboard · best single-run LV')}</h3><ol class="v9-board">${rows.length?rows.map(r=>`<li><b>${safe(r.name||'—')}</b><span>${r.lv} LV</span></li>`).join(''):`<li class="v9-small">${this.T('还没有完成的局。','No finished runs yet.')}</li>`}</ol></div></div>
   <h3>${this.T('角色皮肤','Skins')} <small>${this.T('历史最佳','Best')} ${best} LV</small></h3><div class="v9-skins">${C.SKINS.map(k=>`<button class="v9-skin ${m.v9skin===k.id?'on':''}" data-action="v9-skin" data-value="${k.id}" ${best>=k.lv?'':'disabled'}><i style="background:${k.color?'#'+k.color.toString(16).padStart(6,'0'):'#e9ece6'}"></i><b>${this.P([k.zh,k.en])}</b><small>${best>=k.lv?this.T('已解锁','Unlocked'):k.lv+' LV'}</small></button>`).join('')}</div>
   <button class="v9-choice wide" data-action="close">${img('check')}<b>${this.T('好的','OK')}</b></button></div>`,{custom:true});}
}
