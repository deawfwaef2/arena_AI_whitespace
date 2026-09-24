// Round 13 layer: (136) first-time guidance for every new UI, (138) draggable billboard-partnership ad window
// with small % income on every paid rest.
import * as X from './v12-core.js';
import {st} from './v9-core.js';

const $=id=>document.getElementById(id);
const gameEl=()=>$('game')||document.body;

/* what each screen is for + what to press (en, zh) and where to point */
const DOCK_GUIDE={
 'v9-work':{t:['WORK','打工'],b:['Tap the round button again and again to fill the bar — you get paid when it is full. Costs a little energy.','连续点击圆形按钮把进度条点满就能拿到钱。会消耗少量体力。'],sel:'[data-action="v9-tap"]'},
 project:{t:['INVESTMENT','投资项目'],b:['Drag the slider to choose your stake — it must be between MIN and MAX shown on the card. Press INVEST. Win = your stake multiplies; lose = only the stake is gone.','拖动滑杆选择投入金额（必须在卡片上显示的「最低—最高」之间），再按投资。赢了翻倍，输了只亏投入的部分。'],sel:'#v7-go, [data-action="invest"]'},
 'v12-city':{t:['CITY DEAL','城市专属项目'],b:['A special deal of this city. Set the stake with the slider (min/max shown), then press the play button.','这座城市的专属项目。用滑杆设定投入（显示了上下限），再按开始按钮。'],sel:'[data-action="v12-city-play"]'},
 'v12-shop':{t:['SHOP','商店'],b:['Buy items: drinks and meals restore energy, others give bonuses. Prices rise with your wealth and each repeat buy. Tap an item to buy, or move on.','购买物品：饮料和餐食恢复体力，其他物品带来加成。价格随财富和重复购买上涨。点物品购买，或直接离开。']},
 shop:{t:['OUTFIT SHOP','服装店'],b:['Outfits change your look and some give bonuses. Buy one or skip.','服装改变外观，部分带加成。买一件或跳过。']},
 'v9-fork':{t:['CROSSROADS','岔路口'],b:['Pick ONE path. Each card leads to a different kind of opportunity.','选择一条路。每张卡通往不同类型的机会。'],sel:'.v9-choice, .v9-opt'},
 'v9-partner':{t:['NEW PARTNER','新伙伴'],b:['Recruit this partner once; later they appear with exclusive deals.','招募一次这个伙伴，之后他们会带着专属项目出现。'],sel:'.v9-choice, .v9-opt'},
 'v9-pdeal':{t:['PARTNER DEAL','伙伴项目'],b:['Your partner brings a deal. Choose how much to put in, or decline.','伙伴带来项目。选择投入多少，或婉拒。'],sel:'.v9-choice, .v9-opt'},
 'v9-lux':{t:['LUXURY','奢侈品'],b:['Status items. Buying them raises your class and unlocks richer events.','身份象征。购买会提升阶层，解锁更富有的事件。'],sel:'.v9-choice, .v9-opt'},
 'v9-place':{t:['SPECIAL PLACE','特殊地点'],b:['A place with its own rules. Read the options and pick one.','一个有特殊规则的地点。看清选项后选一个。'],sel:'.v9-choice, .v9-opt'},
 'v12-ad':{t:['ROADSIDE BILLBOARD','路边广告牌'],b:['Optional: watch a short ad for a reward, or just walk on. Never required.','可选：看一段短广告领取奖励，或直接走过。不强制。'],sel:'.v9-choice, .v9-opt'},
 'v13-stroll':{t:['STROLL','散步'],b:['A breather. Walk slowly for a little energy, or pay for a drink to recover more.','喘口气。慢慢走回一点体力，或花钱买饮料多回一些。'],sel:'.v9-choice'},
 'v13-promo':{t:['STREET PROMOTERS','街头推广'],b:['Promoters block the way. Watch their pitch for a gift, pay to pass, or push through (costs energy).','推广员挡路。看完推广拿礼物、付钱通过，或硬挤过去（耗体力）。'],sel:'.v9-opt'},
 'v14-sponsor':{t:['AD PARTNERSHIP','广告合作'],b:['A brand wants you to carry its billboard. Accept for a signing bonus + a small cut of your cash every rest. A draggable ad window appears; close it anytime.','品牌请你扛广告牌。接受可得签约金，并在每次休息时获得少量分成。会出现一个可拖动的广告窗口，随时可关。'],sel:'.v9-opt'},
 challenge:{t:['CHALLENGE','挑战'],b:['A timed goal. Accept to earn a big reward if you hit the target in time — or skip.','限时目标。接受后按时达成可得大奖，也可跳过。']},
 asset:{t:['ASSET','资产'],b:['Buy an asset: it keeps value and raises your net worth.','购买资产：保值并提高你的净资产。']},
 special:{t:['SPECIAL OPPORTUNITY','特殊机会'],b:['Rare deal with unusual odds. Check the numbers before you commit.','稀有项目，赔率特殊。投入前看清数字。']},
 'talent-market':{t:['TALENT MARKET','人才市场'],b:['Hire people who boost your business. Pick one or move on.','雇佣能提升生意的人。选一位或继续前进。']},
 'district-gate':{t:['DISTRICT GATE','街区入口'],b:['Enter a special district with its own rules until your energy runs out.','进入特殊街区，规则不同，持续到体力耗尽。']},
 'world-event':{t:['WORLD EVENT','世界事件'],b:['Something big happened. Read it and choose how to react.','发生了大事件。阅读后选择应对方式。']}};
const MODAL_GUIDE={
 atlas:['World map: travel to a new city. Each city has its own deals and costs.','世界地图：前往新城市。每座城市有自己的项目和花费。'],
 luxury:['Luxury store: status items raise your class.','奢侈品店：身份物品提升阶层。'],
 'rest-activities':['Rest: energy refills over time. Pay the bill, then wait, do activities or watch an optional ad to speed up.','休息：体力随时间恢复。先付账单，然后等待、做活动，或选择看广告加速。'],
 'confirm-rest':['Resting costs a bill. If you cannot pay it, the run ends — keep some cash!','休息要付账单，付不起本局就结束——记得留点现金！'],
 legacy:['Legacy: spend points earned from past lives on permanent perks for the next run.','传承：用前世获得的点数购买永久加成。'],
 wardrobe:['Wardrobe: change outfits you own.','衣柜：更换已拥有的服装。'],
 medical:['Hospital: restore health for a price. Prices rise each visit.','医院：花钱恢复健康，每次都会涨价。'],
 'v9-medical':['Pharmacy/hospital: buy energy or health. Prices rise each time.','药房/医院：购买体力或健康，每次涨价。'],
 regions:['Regions: harder areas with bigger rewards.','区域：更难但回报更大的地区。'],
 security:['Security: pay to lower the chance of being robbed.','安保：花钱降低被抢的概率。'],
 interest:['Interest: park cash to earn over time.','利息：存入现金随时间获得收益。'],
 news:['News: events that change the odds for a while.','新闻：暂时改变赔率的事件。'],
 'street-market':['Street market: trade items for cash or bonuses.','街头市场：用物品换现金或加成。'],
 menu:['Menu: settings, help, music and your stats.','菜单：设置、帮助、音乐与数据。'],
 'v9-lvboard':['Class board: shows your class and what the next one needs.','阶层榜：显示当前阶层及升级条件。']};

export class R13{
 constructor(c){this.c=c;this.lastOffer=null;this.lastModal=null;this.drag=null;this.last=0;globalThis.__r13=this;
  document.addEventListener('pointermove',e=>this.onMove(e));document.addEventListener('pointerup',()=>{if(this.drag){this.drag=null;this.c.save();}});}
 get s(){return this.c.run();}
 get zh(){return this.c.meta().lang==='zh';}
 T(en,zh){return this.zh?zh:en;}
 P(p){return this.zh?p[1]:p[0];}
 seen(){const m=this.c.meta();return m.r13seen||(m.r13seen={});}
 tick(now){if(now-this.last<300)return;this.last=now;try{this.syncSponsor();this.payTick();this.guide();this.modalGuide();}catch(e){console.warn(e);}}

 /* ---------- 136: first-time guidance ---------- */
 guide(){const s=this.s,o=s?.offer,tip=$('r13-tip');
  if(!s||!this.c.started()||s.ended||this.c.modal()||this.c.busy?.()){this.hideTip();return;}
  let key=null,g=null;
  if(s.life?.rest){key='rest';g={t:['REST','休息'],b:['Out of energy — you are resting. Energy refills over time; pay the bill first. You can do activities or watch an optional ad to finish sooner.','体力用完了，正在休息。体力会随时间恢复，先要付账单。可以做活动，或选择看广告更快结束。']};}
  else if(o&&!o.settled&&DOCK_GUIDE[o.type]){key=o.type;g=DOCK_GUIDE[o.type];}
  const r9=$('r9-coach');const r9on=r9&&!r9.hidden;
  if(tip&&!tip.hidden){if(tip.dataset.key!==key||tip.dataset.oid!==String(o?.id||'')){this.hideTip();}else{this.placeSpot(tip.dataset.sel);return;}}
  if(!key||this.seen()[key]||r9on)return;
  if(key==='v9-work'&&!this.c.meta().r9coachDone)return; // r9 coach already teaches the first work card
  this.showTip(key,g,o);}
 showTip(key,g,o){let el=$('r13-tip');if(!el){el=document.createElement('div');el.id='r13-tip';el.innerHTML='<small class="r13-tip-k"></small><b></b><p></p><button type="button"></button>';gameEl().append(el);el.querySelector('button').addEventListener('click',()=>this.hideTip());}
  this.seen()[key]=1;this.c.save();
  el.dataset.key=key;el.dataset.oid=String(o?.id||'');el.dataset.sel=g.sel||'';
  el.querySelector('.r13-tip-k').textContent=this.T('NEW · WHAT IS THIS?','新内容 · 这是什么？');el.querySelector('b').textContent=this.P(g.t);el.querySelector('p').textContent=this.P(g.b);el.querySelector('button').textContent=this.T('Got it ✓','知道了 ✓');
  el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in');this.placeSpot(el.dataset.sel);}
 hideTip(){const el=$('r13-tip');if(el)el.hidden=true;const sp=$('r13-spot');if(sp)sp.hidden=true;}
 placeSpot(sel){let sp=$('r13-spot');const dock=$('game-dock');const t=[...(dock?.querySelectorAll(sel||'.v9-choice:not(:disabled), .v9-opt:not(:disabled), #v7-go, .primary:not(:disabled), button:not(:disabled)')||[])].find(e=>e.offsetParent);
  if(!t){if(sp)sp.hidden=true;return;}
  if(!sp){sp=document.createElement('div');sp.id='r13-spot';sp.setAttribute('aria-hidden','true');sp.innerHTML='<i class="r12-spot-ring"></i><i class="r12-spot-ring b"></i><svg class="r12-spot-arrow" viewBox="0 0 48 60"><path d="M24 58 4 32h13V2h14v30h13z" fill="#ffd54a" stroke="#3a2600" stroke-width="3" stroke-linejoin="round"/></svg>';gameEl().append(sp);}
  const g=gameEl().getBoundingClientRect(),r=t.getBoundingClientRect();sp.style.cssText=`left:${r.left-g.left-6}px;top:${r.top-g.top-6}px;width:${r.width+12}px;height:${r.height+12}px`;sp.hidden=false;}
 modalGuide(){const type=this.c.modal();if(type===this.lastModal)return;this.lastModal=type;if(!type||!MODAL_GUIDE[type])return;const key='m:'+type;if(this.seen()[key])return;
  const card=$('modal-card');if(!card)return;this.seen()[key]=1;this.c.save();
  const rib=document.createElement('div');rib.className='r13-ribbon';rib.innerHTML=`<span>💡</span><p></p><button type="button" aria-label="close">×</button>`;rib.querySelector('p').textContent=this.P(MODAL_GUIDE[type]);rib.querySelector('button').onclick=()=>rib.remove();
  (card.querySelector('.modal-head')||card.firstElementChild)?.after?.(rib)||card.prepend(rib);}

 /* ---------- 138: billboard partnership window ---------- */
 syncSponsor(force){const s=this.s,d=s&&st(s).sponsorDeal,show=!!d&&this.c.started()&&!s.ended;let w=$('r13-sp');
  if(!show){if(w){w.remove();this.c.platform?.clearBanner?.('r13-sp-banner');}return;}
  const x=X.SPONSOR_DEALS.find(q=>q.id===d.deal)||X.SPONSOR_DEALS[0];
  if(!w){w=document.createElement('div');w.id='r13-sp';const art=window.UPSHIFT_ART||{};
   w.innerHTML=`<div class="r13-sp-bar" title="drag"><span class="r13-sp-grip">⠿</span><b></b><button type="button" class="r13-sp-x" aria-label="close">×</button></div><div class="r13-sp-body"><span class="r13-sp-ad">AD</span><div id="r13-sp-banner" style="width:320px;height:100px"><div class="r13-sp-house" style="background-image:url('${art.vegas||art.tokyo||''}')"><b></b><small></small></div></div></div><div class="r13-sp-foot"></div>`;
   gameEl().append(w);const pos=this.c.meta().r13win||{x:.02,y:.2};this.place(w,pos);
   w.querySelector('.r13-sp-bar').addEventListener('pointerdown',e=>{if(e.target.closest('.r13-sp-x'))return;e.preventDefault();const r=w.getBoundingClientRect();this.drag={dx:e.clientX-r.left,dy:e.clientY-r.top};w.setPointerCapture?.(e.pointerId);});
   w.querySelector('.r13-sp-x').addEventListener('click',()=>this.closeSponsor());
   const p=this.c.platform;if(p?.banner)p.banner('r13-sp-banner',320,100).catch(()=>{});force=true;}
  if(force||w.dataset.lang!==this.c.meta().lang||w.dataset.earn!==String(d.earned)){w.dataset.lang=this.c.meta().lang;w.dataset.earn=String(d.earned);
   w.querySelector('.r13-sp-bar b').textContent=this.T('Billboard · ','广告牌 · ')+this.P([x.en,x.zh]).replace(/["「」]/g,'');
   w.querySelector('.r13-sp-house b').textContent=this.P([x.en,x.zh]).replace(/["「」]/g,'');w.querySelector('.r13-sp-house small').textContent=this.T('Sponsored partner','赞助合作');
   w.querySelector('.r13-sp-foot').innerHTML=`<span>${this.T('Each rest','每次休息')} <b>+${this.c.money(X.sponsorPay(s))}</b></span><span>${this.T('Earned','已赚')} <b>${this.c.money(d.earned)}</b></span>`;}}
 place(w,pos){const g=gameEl().getBoundingClientRect();const W=w.offsetWidth||340,H=w.offsetHeight||170;const x=Math.max(0,Math.min(g.width-W,pos.x*g.width)),y=Math.max(0,Math.min(g.height-H,pos.y*g.height));w.style.left=x+'px';w.style.top=y+'px';}
 onMove(e){if(!this.drag)return;const w=$('r13-sp');if(!w){this.drag=null;return;}const g=gameEl().getBoundingClientRect();const pos={x:(e.clientX-this.drag.dx-g.left)/g.width,y:(e.clientY-this.drag.dy-g.top)/g.height};this.c.meta().r13win=pos;this.place(w,pos);}
 closeSponsor(){const s=this.s;const d=X.endSponsor(s);this.c.save();this.syncSponsor();if(d)this.c.toast(this.T(`Billboard returned. You earned ${this.c.money(d.earned)} in total.`,`广告牌已归还，本次合作共赚 ${this.c.money(d.earned)}。`));}
 payTick(){const s=this.s;if(!s||s.ended)return;const pay=X.sponsorTick(s);if(!pay)return;this.c.save();this.c.refresh?.();const w=$('r13-sp');if(w)this.c.cash?.(pay,w);this.c.toast(this.T(`Billboard income +${this.c.money(pay)}`,`广告牌分成 +${this.c.money(pay)}`));this.syncSponsor(true);}
}
