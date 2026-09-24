// v12 UI layer: shops (grid, no scrolling), roadside sponsor billboards (CrazyGames rewarded ads),
// city signature deals with visible min/max stake, descriptive hospital, class up/down popups,
// choose-your-stake partner deals, mystery partner, hidden combo feedback for money changes.
import {escape as safe} from './ui.js';
import * as C from './v9-core.js';
import * as X from './v12-core.js';
import {TIERS_LATE} from './endgame-core.js';

const $=id=>document.getElementById(id);
const ART=k=>window.UPSHIFT_ART?.['ic-'+k]||'';
const img=(k,cls='v9-ic')=>`<img class="${cls}" src="${ART(k)}" alt="" draggable="false">`;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

export class V12{
 constructor(c){this.c=c;this.combo={n:0,sign:0,at:0};
  document.addEventListener('input',e=>{const r=e.target.closest?.('.v12-stake');if(!r)return;const o=this.s.offer;if(o.type!=='v12-city'||o.settled)return;o.stake=Math.round(Number(r.value));this.paintStake();});
 }
 get s(){return this.c.run();}
 get zh(){return this.c.meta().lang!=='en';}
 T(zh,en){return this.zh?zh:en;}
 P(pair){return Array.isArray(pair)?(this.zh?pair[0]:pair[1]):pair;}
 money(c){return this.c.money(c);}
 tick(){globalThis.__adsOK=!!this.c.platform?.canReward?.();}

 /* ---------- dock rendering hook (called by V9.interceptDock) ---------- */
 dock(o){if(o.type==='v12-shop')return this.dockShop(o);if(o.type==='v12-ad')return this.dockAd(o);if(o.type==='v12-city')return this.dockCity(o);
  if(o.type==='v9-place'&&o.place==='hospital'&&!o.settled)return this.dockHospital(o);return null;}

 /* ---------- shop: category-sorted grid, fits without scrolling ---------- */
 dockShop(o){const K=X.SHOP_KINDS[o.kind]||X.SHOP_KINDS.kiosk,s=this.s,big=K.size==='b';
  const tiles=o.goods.map((it,i)=>{const g=X.GOODS.find(x=>x.id===it.id);if(!g)return '';const cat=X.SHOP_CATS[g.cat];const dis=it.sold||s.cash<=it.price;
   return `<button class="v12-good ${it.sold?'sold':''}" style="--cat:${cat.color}" data-action="v12-buy" data-value="${i}" ${dis?'disabled':''}><span class="v12-g-cat">${safe(this.P([cat.zh,cat.en]))}</span>${img(g.icon,'v12-g-img')}<b class="v12-g-name">${safe(this.P([g.zh,g.en]))}</b><small class="v12-g-eff">${safe(this.P(g.d))}</small><span class="v12-g-price">${it.sold?this.T('已售出','SOLD'):this.money(it.price)}</span></button>`;}).join('');
  return `<div class="v12-shop ${big?'big':'small'} k-${o.kind}"><div class="v12-shop-head">${img(K.icon,'v12-shop-ic')}<div><span class="v9-tag">${img('basket','v9-ic sm')}${big?this.T('大商店','Big store'):this.T('小商店','Small shop')} · ${this.T('每次进货都不同','fresh stock every visit')}</span><h1>${safe(this.P([K.zh,K.en]))}</h1><p class="v12-flavor">${safe(this.P(K.flavor))}</p></div><span class="v12-wallet">${img('basket','v9-ic sm')}${this.money(s.cash)}</span></div><div class="v12-goods n${o.goods.length}">${tiles}</div><button class="v9-leave" data-action="next">${img('compass','v9-ic')}<b>${this.T('离开商店','Leave the shop')}</b></button></div>`;}

 /* ---------- sponsor billboard: rewarded ad as a street location ---------- */
 dockAd(o){const sp=X.SPONSORS.find(x=>x.id===o.sponsor)||X.SPONSORS[0],r=X.adReward(this.s);
  if(o.settled){const res=o.result||{};return `<div class="v12-ad done"><div class="v12-bill">${img(sp.icon,'v12-bill-img')}<div class="v12-bill-t"><span class="v12-sponsored">SPONSORED</span><h1>${this.T('推广费到手！','Promo fee received!')}</h1><p class="v12-ad-rw"><b>+${this.money(res.cash||0)}</b><b>${img('bolt','v9-ic sm')}+${res.energy||0}</b></p></div></div>${`<button class="v9-next" data-action="next">${img('compass','v9-ic sm')}<span>${this.T('下一站','Next stop')}</span></button>`}</div>`;}
  return `<div class="v12-ad"><div class="v12-bill"><div class="v12-bill-lights"></div>${img(sp.icon,'v12-bill-img')}<div class="v12-bill-t"><span class="v12-sponsored">SPONSORED · ${this.T('路边广告位','roadside ad spot')}</span><h1>${safe(this.P([sp.zh,sp.en]))}</h1><p class="v12-ad-line">${safe(this.P(sp.line))}</p><p class="v12-ad-rw"><b>+${this.money(r.cash)}</b><b>${img('bolt','v9-ic sm')}+${r.energy}</b></p></div></div>
   <div class="v9-choice-row"><button class="v9-choice" data-action="next">${img('compass')}<b>${this.T('路过','Walk past')}</b></button><button class="v9-choice gold v12-watch" data-action="v12-ad-watch" ${this.adBusy?'disabled':''}>${img('story')}<b>${this.adBusy?this.T('广告播放中…','Ad playing…'):this.T('看广告领奖励','Watch ad for reward')}</b></button></div><p class="v9-small">${this.T('完整看完广告才发放奖励；不扣体力，不扣钱。','Reward only after the full ad; costs no energy, no money.')}</p></div>`;}

 /* ---------- city signature deal ---------- */
 dockCity(o){const S=X.CITY_STYLE[o.city],d=X.CITY_DEALS[o.city]?.find(x=>x.id===o.deal);if(!S||!d)return `<p>…</p>${`<button class="v9-next" data-action="next">${img('compass','v9-ic sm')}<span>${this.T('下一站','Next stop')}</span></button>`}`;const s=this.s;
  const tag=`<span class="v12-city-tag">${img('compass2','v9-ic sm')}${safe(this.P([S.zh,S.en]))}</span>`;
  if(o.settled){const r=o.result;return `<div class="v12-city c-${o.city} ${r.won?'win':'lose'}">${tag}<div class="v12-city-main">${img(d.icon,'v12-city-img')}<div><h2>${safe(this.P([d.zh,d.en]))}</h2><h1 class="v12-res">${r.won?'+':'−'}${this.money(Math.abs(r.delta))}</h1><p class="v9-small">${r.won?this.T(`成功 · ×${r.up}`,`Success · ×${r.up}`):this.T('失败','Failed')}${X.CITY_STYLE[o.city].half&&!r.won?this.T(' · 港口保险：只亏一半',' · port insurance: only half lost'):''}${r.lv?` · +${r.lv} LV`:''}</p></div></div><button class="v9-next" data-action="next">${img('compass','v9-ic sm')}<span>${this.T('下一站','Next stop')}</span></button></div>`;}
  const lowE=s.life.energy<3;const maxOk=Math.max(o.min,Math.min(o.max,s.cash-1));
  return `<div class="v12-city c-${o.city}">${tag}<div class="v12-city-main">${img(d.icon,'v12-city-img')}<div><h1>${safe(this.P([d.zh,d.en]))}</h1><p class="v12-rule">${img('medal','v9-ic sm')}${safe(this.P(S.rule))}</p></div><span class="v9-bo-ring v12-ring" style="--p:${o.p}"><em>${o.p}%</em></span></div>
   <div class="v12-range"><div><small>${this.T('下限','MIN')}</small><b>${this.money(o.min)}</b></div><div class="v12-range-bar"><i></i></div><div><small>${this.T('上限','MAX')}</small><b>${this.money(o.max)}</b></div></div>
   <div class="v12-stakebox"><input class="v12-stake" type="range" min="${o.min}" max="${maxOk}" step="${Math.max(1,Math.round((maxOk-o.min)/100))}" value="${clamp(o.stake,o.min,maxOk)}" aria-label="stake"><div class="v12-stake-read"><span>${this.T('投入','Stake')} <b id="v12-stake-v"></b></span><span class="w">${this.T('赢','Win')} <b id="v12-stake-w"></b></span><span class="l">${this.T('输','Lose')} <b id="v12-stake-l"></b></span></div></div>
   <div class="v9-choice-row"><button class="v9-choice" data-action="next">${img('compass')}<b>${this.T('不投','Pass')}</b></button><button class="v9-choice gold" data-action="v12-city-play" ${lowE||s.cash<=o.min?'disabled':''}>${img('invest')}<b>${this.T('投资','Invest')} · ${img('bolt','v9-ic sm')}3</b></button></div></div>`;}
 paintStake(){const o=this.s.offer;if(o.type!=='v12-city'||o.settled)return;const S=X.CITY_STYLE[o.city]||{};const st=o.stake;let up=o.up;if(S.lever)up=+(o.up+.6*((st-o.min)/Math.max(1,o.max-o.min))).toFixed(2);
  const set=(id,t)=>{const e=$(id);if(e)e.textContent=t;};set('v12-stake-v',this.money(st));set('v12-stake-w','+'+this.money(Math.floor(st*up)-st)+' (×'+up+')');set('v12-stake-l','−'+this.money(S.half?Math.floor(st/2):st));
  const bar=document.querySelector('.v12-range-bar i');if(bar)bar.style.width=clamp((st-o.min)/Math.max(1,o.max-o.min)*100,0,100)+'%';}

 /* ---------- hospital: descriptive reception + price doubling ---------- */
 dockHospital(o){const s=this.s,v=C.st(s),H=X.HOSPITAL_TEXT[this.zh?'zh':'en'],uses=v.hospUses||0,mult=X.hospMult(s);const opts=C.PLACE_OPTS.hospital.filter(x=>o.opts.includes(x.id));
  const hearts=Array.from({length:s.estate.maxHealth},(_,i)=>`<i class="${i<s.estate.health?'on':''}">${img('heart','v9-ic')}</i>`).join('');
  const tiles=opts.map(d=>{const q=C.quoteOpt(s,d);const full=d.heal&&s.estate.health>=s.estate.maxHealth;const dis=(q.cost&&q.cost>=s.cash)||full;const pct=d.heal?q.healP:d.risk?100-d.risk:null;const det=X.HOSP_DETAIL[d.id];
   return `<button class="v12-hosp-opt" data-action="v9-place-go" data-value="${C.PLACE_OPTS.hospital.indexOf(d)}" ${dis?'disabled':''}>${img(d.icon,'v12-ho-ic')}<span class="v12-ho-t"><b>${safe(this.P([d.zh,d.en]))}</b><small>${safe(det?this.P([det.zh,det.en]):this.P(d.desc))}</small></span><span class="v12-ho-s">${pct!=null?`<em class="v12-ho-p">${pct}%</em>`:''}<b>${q.cost?'−'+this.money(q.cost):q.gain?'+'+this.money(q.gain):''}</b>${full?`<small>${this.T('健康已满','Health full')}</small>`:''}</span></button>`;}).join('');
  return `<div class="v12-hosp"><div class="v12-hosp-top">${img('hospital','v12-hosp-img')}<div class="v12-hosp-txt"><span class="v9-tag">${img('compass','v9-ic sm')}${this.T('特殊地点 · 医院','Special place · Hospital')}</span><h1>${this.T('圣心综合医院','Sacred Heart General')}</h1><div class="v9-hearts">${hearts}</div></div><div class="v12-visit"><small>${this.T('就诊次数','Visits')}</small><b>${uses}</b><small>${this.T('价格','Prices')} ×${mult}</small></div></div>
   <div class="v12-hosp-story"><p>${safe(H.smell)}</p><p>${safe(H.desk)}</p><p class="doc">${safe(H.doctor[Math.min(2,uses)])}</p><p class="warn">${img('seal','v9-ic sm')}${safe(H.wall)}</p></div>
   <div class="v12-hosp-opts">${tiles}</div><button class="v9-leave" data-action="next">${img('compass','v9-ic')}<b>${this.T('离开医院','Leave the hospital')}</b></button></div>`;}

 /* ---------- partner deal extras: choose-your-stake + mystery box ---------- */
 optCard(d,i){const s=this.s;if(d.mystery){const st=Math.floor(s.cash*.08);return `<button class="v9-opt v12-myst" data-action="v12-mystery" data-value="${i}" ${st<1||st>=s.cash?'disabled':''}>${img(d.icon)}<span class="o-t"><b>${safe(this.P([d.zh,d.en]))}</b><small>${this.T('押上 8% 现金，结果完全未知','Stake 8% of cash; the outcome is a total mystery')}</small></span><span class="o-s"><span class="o-l">−${this.money(st)}</span><span class="o-p">?</span></span></button>`;}
  if(d.choose){return `<div class="v12-choose"><div class="v12-ch-t">${img(d.icon)}<b>${safe(this.P([d.zh,d.en]))}</b><span class="o-p">${d.p}% · ×${d.up}</span></div><div class="v12-ch-row">${d.choose.map((p,k)=>{const st=Math.floor(s.cash*p);return `<button class="v12-ch" data-action="v12-pchoose" data-value="${i}:${k}" ${st<1||st>=s.cash?'disabled':''}><small>${Math.round(p*100)}%</small><b>${this.money(st)}</b><em>+${this.money(Math.floor(st*d.up)-st)}</em></button>`;}).join('')}</div></div>`;}
  return null;}

 /* ---------- actions ---------- */
 handle(a,v){if(!a.startsWith('v12-'))return false;this._handle(a,v);return true;}
 async _handle(a,v){const s=this.s,o=s.offer;
  try{switch(a){
   case 'v12-buy':{const r=X.buyGood(s,Number(v));this.c.cash(-r.spent,$('game-dock'));const g=X.GOODS.find(x=>x.id===r.good);let msg=this.P([g.zh,g.en]);if(r.energy)msg+=this.T(` · 体力 +${r.energy}`,` · +${r.energy} energy`);if(r.lv)msg+=` · +${r.lv} LV`;if(r.intel)msg+=this.T(` · ${r.intel} 次 +6%`,` · ${r.intel}× +6% odds`);if(r.riskCut)msg+=this.T(` · 衰退 −${r.riskCut}%`,` · decline −${r.riskCut}%`);if(r.win!=null)msg+=r.win?this.T(` · 中奖 ${this.money(r.win)}！`,` · won ${this.money(r.win)}!`):this.T(' · 没中',' · no win');if(r.win)this.c.cash(r.win,$('game-dock'));this.c.toast(msg);this.c.effects?.tone?.(r.win||r.lv?'rare':'tap',2);this.c.save();this.c.refresh();this.c.renderDock();break;}
   case 'v12-ad-watch':{if(o.type!=='v12-ad'||o.settled||this.adBusy)break;this.adBusy=true;this.c.renderDock();let ok=false;try{ok=await this.c.platform.rewarded();}finally{this.adBusy=false;}if(this.s!==s||s.offer!==o)break;if(ok){const r=X.claimAd(s);this.c.cash(r.cash,$('game-dock'));this.c.effects?.tone?.('rare',3);this.c.save();}else this.c.toast(this.T('广告未完成，未发放奖励。','Ad not completed — no reward.'));this.c.refresh();this.c.renderDock();break;}
   case 'v12-city-play':{if(o.type!=='v12-city'||o.settled)break;const r=X.playCity(s,clamp(o.stake,o.min,Math.min(o.max,s.cash-1)));this.c.cash(r.delta,$('game-dock'));this.c.effects?.tone?.(r.won?'win':'loss',r.won?3:2);if(!r.won){$('game-dock').classList.add('shake');setTimeout(()=>$('game-dock').classList.remove('shake'),380);}this.c.save();this.c.refresh();this.c.renderDock();break;}
   case 'v12-pchoose':{if(o.type!=='v9-pdeal'||o.settled)break;const [i,k]=String(v).split(':').map(Number);const p=C.getPartner(o.partner),d=p?.deals[i];if(!d?.choose)break;if(s.life.energy<3){this.c.toast(this.T('体力不够','Not enough energy'));break;}s.life.energy-=3;const r=X.chooseDeal(s,d,d.choose[k]);this.bond(p,r.won);o.settled=true;o.result={won:r.won,delta:r.delta};this.c.cash(r.delta,$('game-dock'));this.c.effects?.tone?.(r.won?'win':'loss',3);this.c.save();this.c.refresh();this.c.renderDock();break;}
   case 'v12-mystery':{if(o.type!=='v9-pdeal'||o.settled)break;const p=C.getPartner(o.partner);if(s.life.energy<3){this.c.toast(this.T('体力不够','Not enough energy'));break;}s.life.energy-=3;const r=X.openMystery(s);this.bond(p,r.won);o.settled=true;o.result={won:r.won,delta:r.delta,lv:r.lv};this.c.cash(r.delta,$('game-dock'));this.c.save();this.c.refresh();this.c.renderDock();
    this.c.open('v12-mystery','','',`<div class="v9-pop v12-mystpop ${r.won?'good':'bad'}"><div class="v12-box ${r.won?'open':'empty'}">${img('box','v9-big')}</div><h2 id="modal-title">${safe(this.P([r.text.zh,r.text.en]))}</h2><p class="v12-myst-num ${r.won?'win':'lose'}">${r.delta>=0?'+':'−'}${this.money(Math.abs(r.delta))}${r.lv?` · +${r.lv} LV`:''}</p><button class="v9-choice gold wide" data-action="close">${img('check')}<b>${this.T('收下','Take it')}</b></button></div>`,{custom:true});break;}
   default:return false;}
  }catch(err){this.c.toast(err.message==='cash'?this.T('现金不足','Not enough cash'):err.message==='range'?this.T('投入超出上下限','Stake outside min/max'):err.message==='energy'?this.T('体力不够','Not enough energy'):err.message==='sold'?this.T('已售出','Sold out'):err.message);}
  return true;}
 bond(p,won){const rel=C.st(this.s).partners[p.id]||(C.st(this.s).partners[p.id]={bond:0});rel.last=this.s.page;if(won&&rel.bond<3)rel.bond++;}

 /* ---------- class change popups (must click) ---------- */
 showPromote(q){const I=X.classIntro(q.to,this.zh?'zh':'en');const next=TIERS_LATE[q.to+1];
  this.c.open('v12-promote','','',`<div class="v9-pop v12-class up r${Math.min(5,q.to)}"><div class="v12-rays"></div><div class="v12-class-badge">${img(I.icon,'v12-class-img')}</div><small class="v12-class-k">${this.T('阶级晋升','CLASS PROMOTION')}</small><h2 id="modal-title">${safe(I.name)}</h2><p class="v12-class-tag">${safe(I.tag)}</p><p class="v12-class-body">${safe(I.body)}</p><p class="v12-class-unlock">${img('check','v9-ic sm')}${safe(I.unlock)}</p>${next?`<p class="v9-small">${this.T('下一阶级门槛','Next class at')} ${this.money(next.at*100)}</p>`:''}<button class="v9-choice gold wide" data-action="close">${img('trophy')}<b>${this.T('走进新生活','Step into the new life')}</b></button></div>`,{custom:true});
  this.c.effects?.tone?.('rare',5);if(this.c.motion())this.c.effects?.burst?.(innerWidth/2,innerHeight/2,36,'#f0cf73');}
 fallHTML(q){const F=X.CLASS_FALL[this.zh?'zh':'en'];const I=X.classIntro(q.to,this.zh?'zh':'en'),Fr=X.classIntro(q.from,this.zh?'zh':'en');
  return `<div class="v12-fall-story"><p class="v12-class-tag">${safe(F[1])}</p><p class="v12-class-body">${safe(F[2])}</p><p class="v12-fall-to">${img(Fr.icon,'v9-ic')}<s>${safe(Fr.name)}</s> → ${img(I.icon,'v9-ic')}<b>${safe(I.name)}</b> — ${safe(I.tag)}</p></div>`;}

 /* ---------- hidden combo feedback: consecutive gains/losses escalate effects, never shown as UI ---------- */
 feedback(delta,el){if(!delta||!this.c.motion?.())return;const now=Date.now(),sign=Math.sign(delta),cb=this.combo;
  if(sign===cb.sign&&now-cb.at<9000)cb.n++;else{cb.n=1;cb.sign=sign;}cb.at=now;
  const L=Math.max(1,C.liquid(this.s));const rel=Math.abs(delta)/L;const mag=clamp(Math.log10(Math.abs(delta)/100+1),0,12);
  const power=clamp(Math.round(mag/2+rel*6+(cb.n-1)*1.2),1,8);
  const g=$('game');if(!g)return;g.dataset.v12fx=(sign>0?'gain':'loss')+Math.min(4,Math.ceil(power/2));clearTimeout(this.fxT);this.fxT=setTimeout(()=>{delete g.dataset.v12fx;},650+power*90);
  const r=(el||g).getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/3;
  if(sign>0){this.c.effects?.burst?.(x,y,Math.min(60,8+power*6),power>5?'#ffd76a':'#f0cf73');if(power>=4)this.c.effects?.burst?.(innerWidth/2,innerHeight*.35,power*5,'#fff3c4');}
  else{g.animate?.([{transform:'translate(0,0)'},{transform:`translate(${-2-power}px,${1+power/2}px)`},{transform:`translate(${2+power}px,-1px)`},{transform:'translate(0,0)'}],{duration:260+power*30});}
  if(power<4)return;const pop=document.createElement('b');pop.className='v12-pop '+(sign>0?'gain':'loss')+' p'+Math.min(8,power);pop.textContent=(sign>0?'+':'−')+this.money(Math.abs(delta));pop.style.left='50%';pop.style.top='38%';document.body.append(pop);setTimeout(()=>pop.remove(),1500);}
}
