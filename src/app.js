import {ProsperityUI} from './prosperity.js';
import {V7} from './v7.js';
import {V9} from './v9.js';
import {finalLV,liquidTier,liquid,SKINS} from './v9-core.js';
import {runIntro} from './intro.js';
import {installI18n,syncLanguage} from './i18n.js';
import {CashFlow} from './cashflow.js';
import {StreetUI} from './street-ui.js';
import {installRedesign,applyLayout} from './redesign.js';
import {ensureEstate,initLegacy,applyLegacy,collectLegacy,endLife,worth,lateTier,TIERS_LATE,availableAuctionLot,bidAuctionLot,passAuctionLot,healthRisk,medicalOptions,buyMedical} from './endgame-core.js';
import {playObituary,obituaryArt,getSatiricalEpitaph} from './obituary.js';
import {Onboarding} from './onboarding.js';
import {LifeUI} from './capital-ui.js';
import {initLife,stakeBounds,owns,tickRest,UNLOCK_MILESTONES,nextUnlock,checkNewUnlocks,getCity} from './life-core.js';
import {ASSETS,OUTFITS,PROJECTS,RARITIES,TIERS,EFFECTS,SPECIALS,CHALLENGES,getAsset,getOutfit,getProject,getRarity,getSpecial,getChallenge,getAuctionLot,getNobleItem,AUCTION_LOTS,NOBLE_ITEMS} from './catalog.js';
import {newRun,validateRun,invest,next,purchaseAsset,purchaseOutfit,netWorth,assetValue,tier,prestige,bankrupt,markPeak,moneyInt,MAX_CENTS,DEFAULT_RATES,createBots,makeOffer,payout,quote,requiredStake,acceptChallenge,advanceTime,checkChallenge} from './engine.js';
import {Platform} from './platform.js';
import {World} from './world.js';
import {Effects} from './effects.js';
import {Music,MUSIC_CREDITS} from './music.js';
import {shell,icon,escape,assetIcon,outfitIcon} from './ui.js';

async function main(){
const $=id=>document.getElementById(id),safe=escape;
const CONFIG=window.UPSHIFT_CONFIG||{allowDeveloperMode:true,crazygames:{enabled:'auto'}};
const SAVE_KEY='upshift-save-v3';
let lifeUI,onboarding,designUI,streetUI,prosperityUI,v7,v9;let started=false;
$('app').innerHTML=shell;
const platform=new Platform(CONFIG);await platform.init();
const defaults={lang:'zh',theme:'minimalist',layout:'journal',device:'desktop',scale:1,sound:true,music:true,volume:.28,musicMode:'auto',motion:!matchMedia('(prefers-reduced-motion: reduce)').matches,low:false,name:'',records:[],bots:[],runCount:1};
function normalizeMeta(input={}){const m={...defaults,...input};m.lang=m.lang==='zh'?'zh':'en';m.name=String(m.name||'').slice(0,20);m.theme=['minimalist','imperial','cyber','swiss'].includes(m.theme)?m.theme:'minimalist';m.scale=Math.max(.75,Math.min(1.25,Number(m.scale)||1));m.records=Array.isArray(m.records)?m.records.filter(x=>x&&Number.isFinite(x.peak)).slice(0,25):[];m.bots=Array.isArray(m.bots)?m.bots.filter(x=>x&&x.simulated&&Number.isFinite(x.peak)).slice(0,100):[];m.volume=Math.max(0,Math.min(1,Number(m.volume)||0));m.musicMode=['auto','city','rush'].includes(m.musicMode)?m.musicMode:'auto';initLegacy(m);return m;}
let stored;try{stored=JSON.parse(platform.load(SAVE_KEY)||platform.load('upshift-save-v2')||'null');}catch{}
let meta=normalizeMeta(stored?.meta);if(!stored?.meta?.lang&&false&&platform.locale)meta.lang=String(platform.locale).startsWith('zh')?'zh':'en';
let run;try{run=stored?.run?validateRun(stored.run):newRun();}catch{run=newRun();}
if(!stored?.run)applyLegacy(run,meta);else ensureEstate(run);
let stake=Math.max(1,Math.floor(run.cash*.25)),stakeRatio=.25,selectedOutfit=0;
let busy=false,modalType=null,adPlaying=false,boardTab='local',returnFocus=null,confirmCallback=null,visit=null;
let lastClock=performance.now(),lastSave=lastClock,lastClockPaint='',pendingChallenge=[],lastWheel=0,swipe=null,discoveryTimer=null;
const dev={force:null,...DEFAULT_RATES,speed:1};
const L=(en,zh)=>meta.lang==='zh'?zh:en;installI18n(()=>meta.lang);
const text=o=>o?.[meta.lang]||o?.en||'';
const playerName=()=>platform.user?.username||meta.name||L('YOU','你');
function money(cents,compact=false){const n=(Number(cents)||0)/100;if(compact&&meta.lang==='zh'&&Math.abs(n)>=10000){const [d,u]=Math.abs(n)>=1e12?[1e12,'万亿']:Math.abs(n)>=1e8?[1e8,'亿']:[1e4,'万'];return(n<0?'−':'')+'$'+(Math.abs(n)/d).toFixed(2).replace(/\.?0+$/,'')+u;}if(compact&&Math.abs(n)>=1000000){const [d,s]=Math.abs(n)>=1e12?[1e12,'T']:Math.abs(n)>=1e9?[1e9,'B']:[1e6,'M'];return(n<0?'−':'')+'$'+(Math.abs(n)/d).toFixed(2).replace(/\.00$/,'')+s;}return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2}).format(n);}
const price=n=>money(n*100,true),signed=n=>(n>=0?'+':'−')+money(Math.abs(n),true),fmt=n=>new Intl.NumberFormat('en-US').format(n);
const time=ms=>`${String(Math.floor(Math.ceil(Math.max(0,ms)/1000)/60)).padStart(2,'0')}:${String(Math.ceil(Math.max(0,ms)/1000)%60).padStart(2,'0')}`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const effects=new Effects($('effects'));const music=new Music();
const cashFlow=new CashFlow();cashFlow.setMotion(()=>meta.motion);
const world=new World($('world'),{onError:()=>toast(L('3D could not load here. Game controls still work.','当前环境无法加载 3D，但游戏功能仍可使用。'))});
world.onHeroPosition=(x,y)=>{$('avatar-tag').style.visibility=y<document.querySelector('.portrait-hud').getBoundingClientRect().bottom+8?'hidden':'visible';$('avatar-tag').style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;};
world.setLanguage(meta.lang);world.setOffer(run.offer);
function toast(message){const d=document.createElement('div');d.className='toast';d.textContent=message;$('toast-stack').appendChild(d);setTimeout(()=>{d.classList.add('leaving');setTimeout(()=>d.remove(),350);},4800);while($('toast-stack').children.length>3)$('toast-stack').firstChild.remove();}
function record(){if(!run.ended){meta.records=meta.records.filter(x=>x.id!==run.id);return;}collectLegacy(run,meta);const death=run.estate?.death;const r={id:run.id,name:playerName(),peak:run.peak,finalWorth:death?.worth??worth(run),cause:death?.cause||'本局结束',rests:run.estate?.age||0,luxuryPoints:run.estate?.luxuryEarned||0,lv:finalLV(run,getAsset),ended:true,page:run.page,runNumber:run.runNumber,unranked:run.unranked,tier:prestige(run),counter:false,founder:false,at:death?.at||Date.now()};meta.records=[r,...meta.records.filter(x=>x.id!==run.id)].slice(0,25);meta.v9best=Math.max(meta.v9best||0,r.lv||0);}
function save(){if(run.life){run.life.lastSeen=Date.now();tickRest(run);}record();platform.save(SAVE_KEY,JSON.stringify({version:3,run,meta}));lastSave=performance.now();}
function finishStyle(){const es=run.assets.map(id=>getAsset(id)?.effect);return ['sovereign','cosmic','diamond','royal','gold','prism','neon','silver','glass','bronze'].find(x=>es.includes(x))||'none';}
function refreshStyle(){world.updateStyle(run);$('game').dataset.prestige=prestige(run);$('game').dataset.wealth=tier(run);$('game').dataset.finish=finishStyle();$('game').classList.toggle('ended',run.ended);}
function musicMode(){const id=meta.musicMode==='auto'?(run.activeChallenge||run.offer.type==='special'?'rush':'city'):meta.musicMode;music.setMode(lifeUI?.musicId(id)||id);}
function preferences(){$('app').dataset.largeText=String(!!meta.largeText);effects.sound=meta.sound;effects.motion=meta.motion;effects.low=meta.low;effects.muted=platform.muted||document.hidden||adPlaying;world.motion=meta.motion;world.quality(meta.low);music.enabled=meta.music;music.setVolume(meta.volume);music.setMuted(platform.muted||adPlaying);music.setHidden(document.hidden);musicMode();document.body.dataset.motion=meta.motion?'on':'off';document.body.dataset.theme=meta.theme||'minimalist';document.documentElement.dataset.theme=meta.theme||'minimalist';document.documentElement.style.setProperty('--ui-scale',meta.scale||1);}
function queueChallenge(event){if(event&&!pendingChallenge.some(x=>x.id===event.id)){pendingChallenge.push(event);save();renderHud();if(!busy)renderDock();}}
function clock(){const now=performance.now(),elapsed=now-lastClock;lastClock=now;if(started&&!modalType&&!visit&&!document.hidden&&!adPlaying&&!run.ended&&!run.life?.rest&&!run.life?.travel){const event=advanceTime(run,elapsed);if(event)queueChallenge(event);}return now;}
function pause(){lastClock=performance.now();world.paused=!started||!!modalType||adPlaying||run.ended||!!run.life?.rest||!!run.life?.travel;world.sceneSuspended=!!modalType||adPlaying||run.ended||!started;music.setDucked(!!modalType||!!visit||run.ended);platform.play(started&&!modalType&&!visit&&!run.ended&&!adPlaying&&!run.life?.rest&&!run.life?.travel);renderChallengeHud();}
function validAction(){if(!started)return false;clock();if(run.life?.rest||run.life?.travel){renderDock();return false;}if(run.ended){showGameOver();return false;}if(pendingChallenge.length&&!busy&&!modalType){showChallengeResult(pendingChallenge.shift());return false;}return true;}
function pulseClock(now){clock();lifeUI?.tick();streetUI?.tick(now);prosperityUI?.tick(now);v7?.tick(now);v9?.tick(now);renderChallengeHud();if(run.activeChallenge&&now-lastSave>1000)save();if(started&&!busy&&!modalType&&!adPlaying){if(run.ended&&!lifeUI?.hasPendingDeath())showGameOver();else if(pendingChallenge.length)showChallengeResult(pendingChallenge.shift());}requestAnimationFrame(pulseClock);}
function renderChallengeHud(){
 const halted=modalType||visit||run.life?.rest||run.life?.travel;const a=run.activeChallenge,h=$('challenge-hud');h.hidden=!a;$('game').classList.toggle('has-challenge',!!a);
 if(!a){lastClockPaint='';return;}
 const key=[a.id,Math.ceil(a.remainingMs/1000),a.progress,run.cash,assetValue(run),meta.lang,modalType,visit?.id,!!halted].join('/');if(key===lastClockPaint)return;lastClockPaint=key;
 const progress=a.metric==='streak'?a.progress/a.target:netWorth(run)/a.target;
 h.classList.toggle('urgent',a.remainingMs<=15000);h.style.setProperty('--progress',Math.max(0,Math.min(1,progress))*100+'%');
 h.innerHTML=`<div class="challenge-main">${icon(halted?'pause':'timer')}<strong class="challenge-clock">${halted?L('PAUSED','已暂停'):time(a.remainingMs)}</strong><span class="challenge-target">${a.metric==='streak'?`${a.progress} / 3 ${L('WINS','连胜')}`:L('TARGET ','目标 ')+money(a.target,true)}</span></div><div class="challenge-progress"><i></i></div><div class="challenge-sub"><span>${a.metric==='streak'?L('Bet at least ','每次至少 ')+money(a.minStake):L('Net worth ','总身家 ')+money(netWorth(run),true)}</span><span>+${money(a.reward,true)} / −${money(a.penalty,true)}</span></div>`;
}
function renderHud(){
 document.documentElement.lang=meta.lang==='zh'?'zh-CN':'en';
 $('cash-label').textContent=L('YOUR CASH','可用现金');$('cash-value').textContent=money(run.cash,true);$('cash-value').title=money(run.cash);$('cash-value').ariaLabel=L('Game cash ','游戏现金 ')+money(run.cash);
 $('page-label').textContent=L('STOP ','第 ')+String(run.page).padStart(3,'0')+L('',' 站');$('rank-button').querySelector('span').textContent=L('RANKS','排行');$('rank-button').ariaLabel=L('Leaderboard','排行榜');$('menu-button').ariaLabel=L('Menu and pause','菜单与暂停');
 $('music-button').innerHTML=icon(meta.music&&!platform.muted?'music':'mute');$('music-button').ariaLabel=L('Toggle recorded background music','切换背景音乐');$('music-button').title=L('City soundtrack · CC BY 4.0','城市配乐 · CC BY 4.0');
 $('avatar-name').textContent=playerName();$('tier-label').textContent=text(TIERS[tier(run)].name).toUpperCase();
 if($('quick-scale-btn')){
  const curScale=Math.round((Number(document.documentElement.style.getPropertyValue('--ui-scale'))||1)*100);
  $('quick-scale-btn').textContent=curScale+'%';
 }
 $('test-badge').hidden=!run.unranked;$('test-badge').textContent=L('TEST RUN · NO OFFICIAL SCORE','测试局 · 不提交正式分数');
 $('swipe-cue').querySelector('span').textContent=visit?L('ESTATE TOUR · SWIPE TO CONTINUE','资产参观 · 右滑继续'):L('SWIPE RIGHT TO WALK ON','向右滑动，继续前行');
 $('game').dataset.prestige=prestige(run);$('game').dataset.wealth=tier(run);$('game').dataset.finish=finishStyle();$('game').classList.toggle('ended',run.ended);const k=run.offer.type==='asset'?getAsset(run.offer.asset).model:run.offer.project;const biome=['ocean','marina','island','beach','resort'].includes(k)?'coast':['solar','greenhouse','vineyard','cottage'].includes(k)?'nature':['rocket','spaceport','cloud','lab'].includes(k)?'future':['manor','palace','castle'].includes(k)?'royal':'city';$('game').dataset.biome=biome;renderChallengeHud();lifeUI?.renderHud();designUI?.refresh();streetUI?.refresh();prosperityUI?.refresh();v7?.refresh();v9?.refresh();musicMode();
}
const RARITY_STARS={common:1,uncommon:2,rare:3,epic:4,legendary:5,mythic:6};
const CATEGORY_GLYPH={项目:'📋',街头:'🍜',餐饮:'🍜',科技:'💡',地产:'🏢',文化:'🎭',物流:'🚚',金融:'🏦',制造:'⚙️',旅游:'🧳',农业:'🌾',医疗:'🏥',时尚:'👗',娱乐:'🎬'};
// Rarity and category used to be a tiny pill; players asked for it to be unmissable.
function rarityBanner(rarityId,rarityName,categoryText,cityName){
 const stars=RARITY_STARS[rarityId]||1;
 const glyph=Object.keys(CATEGORY_GLYPH).find(k=>String(categoryText||'').includes(k));
 return `<div class="rarity-banner"><span class="rb-rarity"><span class="rb-star">${'★'.repeat(stars)}</span>${safe(rarityName)}</span>${categoryText?`<span class="rb-type">${glyph?CATEGORY_GLYPH[glyph]:'◈'} ${safe(categoryText)}</span>`:''}${cityName?`<span class="rb-city">${safe(cityName)}</span>`:''}</div>`;
}
function header(pill,title,type='info'){return `<div class="dock-header"><span class="kind-pill">${icon(type)}${safe(pill)}</span><button class="rules-button" data-action="rules">${icon('info')}${L('RULES','规则')}</button></div><h1>${safe(title)}</h1>`;}
function actions(label,action,{disabled=false,danger=false,gold=false,purple=false,solo=false}={}){return `<div class="action-row ${solo?'solo':''}">${solo?'':`<button class="pass-button" data-action="next" ${busy?'disabled':''}>${L('PASS','跳过')}${icon('arrow')}</button>`}<button class="primary ${danger?'danger':''} ${gold?'gold':''} ${purple?'purple':''}" id="primary-action" data-action="${action}" ${disabled||busy||run.ended?'disabled':''}>${label}${icon('arrow')}</button></div>`;}
function renderDock(){if(v9?.interceptDock())return;if(v7?.interceptDock())return;if(streetUI?.interceptDock())return;if(lifeUI?.interceptDock())return;renderDockBase();lifeUI?.afterDock();fitDock();}
function renderDockBase(){
 if(visit){renderTour();return;}
 const o=run.offer,d=$('game-dock');d.dataset.kind=o.type;
 if(o.type==='asset'){renderAsset();return;}if(o.type==='shop'){renderShop();return;}if(o.type==='challenge'){renderChallengeOffer();return;}if(o.type==='auction'){renderAuctionOffer();return;}if(o.type==='clinic'){renderClinicOffer();return;}
 const special=o.type==='special'?getSpecial(o.special):null,p=getProject(o.project),r=getRarity(o.rarity);
 if(special)stake=requiredStake(run);else{const limits=stakeBounds(run);stake=Math.max(1,Math.min(limits.max,Math.max(limits.min,stake)));}
 const result=run.lastResult,q=quote(run,stake),displayStake=o.settled&&result?result.stake:stake;
 d.style.setProperty('--rarity',special?.color||r.color);d.style.setProperty('--stake',(run.cash?stake/run.cash*100:0)+'%');
 const odds=good=>`<div class="odds-box ${good?'':'loss'} ${o.settled&&!busy?(result?.won===good?'selected':'unselected'):''}"><div class="chance-line"><strong>${good?o.p:Number((100-o.p).toFixed(2))}%</strong><span>${good?L('WIN','成功'):L('LOSE','失败')}</span>${icon(good?'up':'risk')}</div><div class="amount" id="${good?'win':'lose'}-amount">${good?signed(payout(displayStake,o.up)-displayStake):'−'+money(o.settled&&result?Math.abs(result.won?(special?.lossScope==='wallet'?result.cashAfterBet-result.profit:displayStake):result.profit):q.loss,true)}</div><div class="outcome-meta">${good?`${L('Return','返还')} ×${o.up.toFixed(2)}`:special?.lossScope==='wallet'?L('ALL CASH GONE','全部现金归零'):L('Entire stake lost','投入本金全部亏掉')}</div></div>`;
 d.dataset.rarity=o.rarity||'common';
 let inner=header(special?text(special.short):text(r.name),special?text(special.name):text(p.name),special?'fire':'coin')
  +rarityBanner(special?'legendary':o.rarity,special?'特殊合约':text(r.name),o.category||o.localName||'',getCity(run)?.name||'');
 if(busy){inner+=`<div class="resolving"><div class="rolling-coins"><i></i><i></i><i></i></div>${L('Your outcome is landing…','正在揭晓结果…')}</div>`+actions(L('REVEALING…','揭晓中…'),'invest',{disabled:true,solo:true});d.innerHTML=inner;fitDock();return;}
 inner+=`<div class="odds-grid">${odds(true)}${odds(false)}</div>`;
 if(o.settled&&result){inner+=`<div class="result-panel ${result.profit<0?'negative':''}"><div class="result-label">${icon(result.won?'sparkle':'risk')}${result.won?L('NICE MOVE!','漂亮！'):result.lossScope==='wallet'?L('WIPED OUT!','全仓清零！'):L('STAKE LOST','本次投入已亏损')}</div><div class="result-amount">${signed(result.profit)}</div><p class="result-explain">${L('Cash remaining: ','剩余现金：')}${money(run.cash,true)}</p></div>`+actions(L('NEXT STOP','前往下一站'),'next',{solo:true});}
 else if(special){inner+=`<div class="fixed-stake"><span>${L('Required stake','固定投入')} · ${Math.round(special.ratio*100)}%</span><strong>${money(stake,true)}</strong></div><div class="risk-strip ${special.lossScope==='wallet'?'danger':''}">${icon('risk')}<span>${special.lossScope==='wallet'?L('Lose this bet → ALL ','失败 → 全部 ')+money(run.cash,true)+L(' cash is gone. Bankruptcy.',' 现金清零，立即破产。'):L('Failure loses ','失败损失 ')+money(stake,true)+L('. Uninvested cash is safe.','，未投入的现金保留。')}</span></div>`+actions(L('TAKE THE DEAL','接受合约'),'invest',{danger:special.lossScope==='wallet',gold:special.id==='jackpot'});}
 else{
  inner+=`<div class="risk-strip ${stake===run.cash?'danger':''}" id="risk-strip">${icon('lock')}<span id="risk-line">${stake===run.cash?L('This is ALL your cash. Failure ends this run.','这是全部现金，失败将结束本局。'):L('Only your stake is at risk.','只承担本次投入的损失。')}</span></div><div class="stake-area"><div class="stake-top"><div class="stake-money"><span class="bet-label">${L('BET','投入')}</span><span>$</span><input id="stake-input" aria-label="${L('Investment amount in dollars','投资金额，美元')}" type="number" inputmode="decimal" min="0.01" max="${run.cash/100}" step="0.01" value="${(stake/100).toFixed(2)}"></div><div class="quick-stakes">${[25,50,100].map(n=>`<button data-action="stake" data-value="${n}" class="${Math.abs(n/100-stake/run.cash)<.005?'active':''}">${n===100?L('MAX','全部'):n+'%'}</button>`).join('')}</div></div><div class="slider-wrap" id="slider-wrap"><output id="slider-bubble" class="slider-bubble">${money(stake,true)}</output><input id="stake-range" class="stake-range" type="range" min="0" max="1000" step="1" value="${Math.round(stake/run.cash*1000)}" aria-label="${L('Drag to select investment','拖动选择投资金额')}" aria-valuetext="${money(stake)}"></div></div>`+actions(L('INVEST ','投资 ')+money(stake,true),'invest');
 }
 d.innerHTML=inner;fitDock();
}
function updateStake(cents,from='code'){
 if(busy||run.ended||run.offer.settled||run.offer.type!=='project')return;
 const button=$('primary-action');if(!Number.isFinite(cents)||cents<1){button.disabled=true;return;}
 const limits=stakeBounds(run);stake=Math.max(1,Math.min(limits.max,Math.max(limits.min,Math.floor(cents))));stakeRatio=stake/run.cash;
 $('game-dock').style.setProperty('--stake',stakeRatio*100+'%');
 if(from!=='input'||cents>limits.max||cents<limits.min)$('stake-input').value=(stake/100).toFixed(2);
 if(from!=='range')$('stake-range').value=Math.round(stakeRatio*1000);
 $('stake-range').setAttribute('aria-valuetext',money(stake));$('slider-bubble').textContent=money(stake,true);
 $('win-amount').textContent=signed(payout(stake,run.offer.up)-stake);$('lose-amount').textContent='−'+money(stake,true);
 button.disabled=run.cash<limits.min;button.innerHTML=L('INVEST ','投资 ')+money(stake,true)+icon('arrow');
 $('risk-strip').classList.toggle('danger',stake===run.cash);$('risk-line').textContent=stake===run.cash?L('This is ALL your cash. Failure ends this run.','这是全部现金，失败将结束本局。'):L('Uninvested cash stays safe: ','未投入的现金保留：')+money(run.cash-stake,true);
 document.querySelectorAll('[data-action="stake"]').forEach(b=>b.classList.toggle('active',Math.abs(Number(b.dataset.value)/100-stakeRatio)<.005));
}
function renderAsset(){const a=getAsset(run.offer.asset),own=run.assets.includes(a.id),done=run.offer.settled;const d=$('game-dock');d.style.setProperty('--rarity',a.color);d.innerHTML=header(L('RARE ESTATE','稀有资产'),text(a.name),'estate')+`<div class="asset-tagline">${assetIcon(a)}<div><span class="price-label">${L('Reference price · USD','美元参考标价')}</span><strong>${price(a.price)}</strong></div></div><div class="asset-feature">${icon('sparkle')}<span>${safe(text(EFFECTS[a.effect]))}</span></div><p class="small-rule">${L('Cosmetic only. No income or odds boost.','仅装饰，不产钱、不改变胜率。')}</p>${own?`<div class="owned-message">${icon('check')}${L('This address is yours.','这处资产属于你了。')}</div>`:run.cash<a.price*100?`<p class="small-rule">${L('Need ','还差 ')}${money(a.price*100-run.cash,true)} ${L('more cash.','现金。')}</p>`:''}`+actions(done?L('NEXT STOP','下一站'):L('BUY ','购买 ')+price(a.price),done?'next':'buy-asset',{disabled:!done&&(own||run.cash<a.price*100),gold:true,solo:done});fitDock();}
function renderShop(){const o=run.offer,items=o.items;selectedOutfit=Math.min(selectedOutfit,items.length-1);const selected=getOutfit(items[selectedOutfit]),owned=run.outfits.includes(selected.id);const d=$('game-dock');d.style.setProperty('--rarity','#d39fce');d.innerHTML=header(L('ROADSIDE POP-UP','路边限时商店'),L('Street / Style','街头换装站'),'bag')+`<p class="offer-sub">${L('Buy here, before you walk away. Looks only.','只在这一站出售。服装仅改变外观。')}</p><div class="shop-grid">${items.map((id,i)=>{const o=getOutfit(id),owned=run.outfits.includes(id);return `<button class="shop-item ${i===selectedOutfit?'selected':''}" data-action="shop-select" data-value="${i}" aria-pressed="${i===selectedOutfit}">${owned?'<span class="owned-check">✓</span>':''}${outfitIcon(o)}<span class="shop-name">${safe(text(o.name))}</span><strong>${owned?L('OWNED','已拥有'):price(o.price)}</strong></button>`;}).join('')}</div>`+actions(owned?L('WEAR THIS','穿上这件'):L('BUY ','购买 ')+price(selected.price),'buy-outfit',{disabled:!owned&&run.cash<selected.price*100});fitDock();}
function renderChallengeOffer(){const o=run.offer,c=getChallenge(o.challenge);const d=$('game-dock');d.style.setProperty('--rarity',c.color);const active=!!run.activeChallenge;d.innerHTML=header(text(c.short),text(c.name),'timer')+`<div class="contract-grid"><div class="contract-cell"><span>${icon('timer')}${L('TIME LIMIT','限时')}</span><strong>${time(o.durationMs)}</strong></div><div class="contract-cell"><span>${icon('up')}${o.metric==='wealth'?L('NET WORTH TARGET','目标总身家'):L('WIN STREAK','连续成功')}</span><strong>${o.metric==='wealth'?money(o.target,true):L('3 WINS','3 连胜')}</strong></div><div class="contract-cell reward"><span>${L('SUCCESS BONUS','成功奖励')}</span><strong>+${money(o.reward,true)}</strong></div><div class="contract-cell penalty"><span>${L('FAILURE PENALTY','失败扣除')}</span><strong>−${money(o.penalty,true)}</strong></div></div>${o.metric==='wealth'&&o.target>=100000000?`<p class="small-rule">${L('Exact target: ','精确目标：')}${money(o.target)}</p>`:''}${o.metric==='streak'?`<p class="small-rule">${L('Each qualifying bet must be at least ','每次有效投入至少 ')}${money(o.minStake,true)}${L('. A loss breaks the streak.','，失败会打断连胜。')}</p>`:''}<p class="small-rule">${L('Active play time. Menus / background pause the clock. Penalties can bankrupt you.','仅计算游玩时间；菜单和后台暂停计时。扣款可能导致破产。')}</p>${active?`<div class="owned-message">${icon('timer')}${run.offer.settled?L('Challenge live. Keep moving!','挑战进行中，继续前进！'):L('Finish your active challenge first.','请先完成当前挑战。')}</div>`:''}`+actions(o.settled?L('KEEP MOVING','继续前进'):L('START CHALLENGE','接受挑战'),o.settled?'next':'accept-challenge',{purple:true,disabled:active&&!o.settled,solo:o.settled});fitDock();}
function renderAuctionOffer(){
 const o=run.offer,lot=getAuctionLot(o.auction);
 const d=$('game-dock');d.style.setProperty('--rarity','#e5b034');
 const affordable=run.cash>lot.price;const done=o.settled;
 d.innerHTML=header(L('SECRET AUCTION','地下秘密拍卖行'),text(lot.name),'sparkle')+`
  <div class="auction-card-box">
   <div class="auction-headline"><span class="auction-medal-badge">${lot.medal}</span><div><h3>${safe(text(lot.name))}</h3><p>${safe(text(lot.desc))}</p></div></div>
   <div class="auction-metrics">
    <div class="metric-cell"><span>起拍估价</span><strong>${money(lot.price,true)}</strong></div>
    <div class="metric-cell gold"><span>转世点数</span><strong>+${lot.points} LP</strong></div>
    <div class="metric-cell danger"><span>休整维护费</span><strong>+${money(lot.upkeep,true)}</strong></div>
   </div>
   <p class="small-rule">${done?L('Won! Medal pinned to honors tray.','竞拍已斩获！专属勋章已陈列在荣誉栏。'):L('Exclusive lot per run. Winning awards permanent medals and lifetime LP. Pass means miss forever.','本局唯一绝版藏品。竞拍获胜将铸造永久荣誉勋章并奖励转世功德点；放弃则本局永远错过。')}</p>
   ${!affordable&&!done?`<p class="small-rule danger">${L('Need ','还需 ')}${money(lot.price-run.cash,true)}${L(' more cash.',' 现金。')}</p>`:''}
  </div>
 `+`<div class="action-row"><button class="pass-button" data-action="pass-auction" ${busy||done?'disabled':''}>${L('PASS','放弃举牌')}</button><button class="primary gold" data-action="${done?'next':'bid-auction'}" ${busy||(!done&&!affordable)?'disabled':''}>${done?L('NEXT STOP','下一站'):L('BID ','举牌 ')+money(lot.price,true)}${icon('arrow')}</button></div>`;
 fitDock();
}
function renderClinicOffer(){
 const d=$('game-dock'),e=run.estate||ensureEstate(run);d.style.setProperty('--rarity','#e55353');const done=run.offer.settled;
 d.innerHTML=header(L('ROYAL WELLNESS CLINIC','皇家抗衰理疗诊所'),'逆转机能 · 延寿疗法','sparkle')+`
  <div class="clinic-box">
   <div class="clinic-stats"><span>当前健康：${'♥'.repeat(e.health)}${'♡'.repeat(e.maxHealth-e.health)}</span><span>下期衰退风险：${healthRisk(run,true)}%</span></div>
   <p class="small-rule">皇家特许私人诊所，为资本家提供细胞级逆龄修复与衰退阻断。</p>
   <div class="clinic-options">${medicalOptions(run).map(o=>`<button class="small-button" data-action="clinic-buy" data-value="${o.id}" ${run.cash<o.cost||(o.id==='care'&&e.health>=e.maxHealth)?'disabled':''}>${safe(o.name)} · ${money(o.cost)}</button>`).join('')}</div>
  </div>
 `+actions(done?L('LEAVE CLINIC','离开诊所'):L('CONTINUE','继续前行'),'next',{solo:true});
 fitDock();
}
function bidAuction(){
 if(busy||modalType||run.offer.type!=='auction'||run.offer.settled)return;
 const lot=getAuctionLot(run.offer.auction);
 if(!lot||run.cash<=lot.price){toast(L('Not enough cash to bid on this lot.','现金不足，无法竞拍该藏品。'));return;}
 try{
  bidAuctionLot(run,lot.id);run.offer.settled=true;save();refreshStyle();renderHud();renderDock();effects.tone('buy');
  const r=focusRect();effects.burst(r.left+r.width*.45,r.top+r.height*.6,5,'#e5b034');world.celebrate();platform.celebrate();
  openModal('auction-win','','',`
   <div class="auction-win-view">
    <div class="win-medal-glow">${lot.medal}</div>
    <div class="modal-eyebrow">HAMMER DOWN / 竞拍成交</div>
    <h2 id="modal-title">${safe(text(lot.name))}</h2>
    <div class="large-delta">+${lot.points} LP</div>
    <p>恭喜阁下拍下此件旷世奇珍！<br>专属勋章已永久陈列于你的排面荣誉墙。<br>请注意：后续每个休整期需支付 <strong>${money(lot.upkeep,true)}</strong> 的专属保养费。</p>
    <button class="primary" data-action="close">${L('COLLECT & WALK ON','收藏珍宝，继续前行')}${icon('arrow')}</button>
   </div>
  `,{custom:true});
  // Buying a lot reduces wealth; do not replace the auction receipt with an unrelated unlock dialog.
 }catch(e){toast(e.message);}
}
function passAuction(){
 if(busy||modalType||run.offer.type!=='auction'||run.offer.settled)return;
 const lot=getAuctionLot(run.offer.auction);if(lot)passAuctionLot(run,lot.id);
 run.offer.settled=true;save();toast(L('Lot passed. It will not appear again this run.','已放弃举牌，该藏品本局不再出现。'));nextOffer();
}
function checkMilestoneCelebration(){
 if(modalType||busy||!started)return;
 const newly=checkNewUnlocks(run);
 if(newly.length){
  save();
  const bar=$('milestone-progress-bar');bar.classList.add('surge');setTimeout(()=>bar.classList.remove('surge'),2000);const m=newly[0];effects.tone('win',4);effects.burst(innerWidth/2,innerHeight*.4,6,'#ffd700');world.celebrate();platform.celebrate();
  openModal('milestone-celebrate','','',`
   <div class="milestone-celebrate-dialog unlock-theater">
    <div class="unlock-rays" aria-hidden="true"></div><div class="unlock-orbit" aria-hidden="true">✦　·　✧　·　✦</div>
    <div class="milestone-ribbon">你的世界，向外展开了一圈</div>
    <div class="milestone-symbol-badge">${icon(m.icon||'crown')}</div>
    <span class="unlock-word">UNLOCKED</span><h2 id="modal-title">${newly.length>1?'连锁解锁 ×'+newly.length:safe(m.title)}</h2>
    <div class="unlock-cards">${newly.map((x,i)=>`<article style="--unlock-delay:${350+i*100}ms"><span>${icon(x.icon||'sparkle')}</span><div><b>${safe(x.title)}</b><small>身家门槛 ${money(x.at*100,true)}</small><p>${safe(x.desc)}</p></div><strong>✓</strong></article>`).join('')}</div>
    <p class="unlock-footnote">新入口与购买资格已开放。需要购买的物品仍须付费，风险不会因升级而消失。</p>
    <button class="primary unlock-continue" data-action="close">收下这份新人生，继续 →</button>
   </div>
  `,{custom:true});
 }
}
let fitPending=false;
function fitDock(){const d=$('game-dock'),key=[run.offer?.id,d.dataset.kind,!!run.offer?.settled].join(':');if(d.dataset.paintKey!==key){d.dataset.paintKey=key;if(meta.motion)d.animate([{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});}if(fitPending)return;fitPending=true;requestAnimationFrame(()=>{fitPending=false;$('game').style.setProperty('--dock-height',$('game-dock').getBoundingClientRect().height+'px');world.resize();});}
new ResizeObserver(fitDock).observe($('game-dock'));
function sceneMessage(message){$('scene-toast').textContent=message;$('scene-toast').classList.add('show');setTimeout(()=>$('scene-toast').classList.remove('show'),2300);}
function focusRect(){const rect=$('world').getBoundingClientRect();if(innerWidth>innerHeight&&innerHeight<=650)return {left:rect.left,top:rect.top,width:rect.width,height:rect.height*.98};return {left:rect.left,top:rect.top,width:rect.width,height:Math.max(260,Math.min(rect.height*.76,$('game-dock').getBoundingClientRect().top-rect.top+40))};}
function discover(){clearTimeout(discoveryTimer);const o=run.offer;const special=o.type==='special'?getSpecial(o.special):null;const c=o.type==='challenge'?getChallenge(o.challenge):null;const rank=o.type==='asset'?getAsset(o.asset).tier:o.type==='shop'?2:o.type==='challenge'?3:RARITIES.findIndex(r=>r.id===o.rarity);if(rank>=3){const message=special?text(special.short):c?text(c.short):o.type==='asset'?L('A RARE ADDRESS!','发现稀有资产！'):text(getRarity(o.rarity).name).toUpperCase();$('discovery').innerHTML=icon(special?'fire':c?'timer':'diamond')+`<strong>${safe(message)}</strong><small>${special?L('Read the terms. This one plays differently.','这次规则不同，先看清风险。'):L('Something special just found you.','特别的机会，找到了你。')}</small>`;$('discovery').classList.add('show');effects.tone('rare');const r=focusRect();effects.burst(r.left+r.width*.52,r.top+r.height*.52,rank);discoveryTimer=setTimeout(()=>$('discovery').classList.remove('show'),1700);}else $('discovery').classList.remove('show');if(run.assets.some(id=>getAsset(id)?.effect==='confetti')){const r=focusRect();effects.burst(r.left+r.width*.45,r.top+r.height*.6,1);} }
async function nextOffer(overrides={}){
 if(busy||modalType||!validAction()||!lifeUI.beforeNext())return;busy=true;visit=null;selectedOutfit=0;const id=run.id;
 next(run,{...dev,...overrides});let skipped=0;while(owns(run,'car')&&run.life.filter&&run.offer.type==='project'&&run.offer.grade==='street'&&run.life.energy>0&&skipped<20){next(run,{...dev,...overrides});skipped++;}if(skipped)toast(`轿车过滤：跨过 ${skipped} 个低级项目，体力照常消耗。`);if(run.unranked&&overrides.testDurationMs&&run.offer.type==='challenge')run.offer.durationMs=overrides.testDurationMs;stake=Math.max(1,Math.floor(run.cash*stakeRatio));save();platform.context(run);$('game').classList.add('travelling');$('game-dock').querySelectorAll('button,input').forEach(e=>e.disabled=true);effects.tone('tap');musicMode();
 if((run.life.steps||0)>0&&Math.floor(run.life.steps/10)>(run.life.lastCorner||0)){sceneMessage('街角到了，转个弯。');while((run.life.lastCorner||0)<Math.floor(run.life.steps/10)){run.life.lastCorner=(run.life.lastCorner||0)+1;await world.turnCorner();}save();}await world.travel(run.offer,run.offer.type==='interlude'?1800:950);if(run.id!==id){busy=false;return;}busy=false;$('game').classList.remove('travelling');renderHud();renderDock();world.updateStyle(run);discover();if(run.ended&&!lifeUI?.hasPendingDeath())showGameOver();else if(pendingChallenge.length)showChallengeResult(pendingChallenge.shift());
}
async function doInvest(confirmed=false){
 if(busy||modalType||visit||!validAction()||run.offer.settled||!['project','special'].includes(run.offer.type)||!lifeUI.beforeInvest())return;
 const raw=run.offer.pendingStake|| (run.offer.type==='special'?requiredStake(run):Number($('stake-input')?.value)*100),amount=Math.round(raw);
 if(!Number.isFinite(amount)||amount<1||(!run.offer.pendingStake&&amount>run.cash)||Math.abs(raw-amount)>.00001){toast(L('Choose an amount between $0.01 and your cash balance.','请输入 $0.01 至现金余额之间的金额。'));return;}
 if(run.offer.type==='project'&&!run.offer.pendingStake){const limits=stakeBounds(run);if(amount<limits.min||amount>limits.max){toast(`本项目投入范围：${money(limits.min)} 至 ${money(limits.max)}`);return;}}
 const q=quote(run,amount);
 if(run.offer.type==='special'&&q.scope==='wallet'&&!confirmed){showCashRisk(q,()=>doInvest(true));return;}
 busy=true;const id=run.id,oldTier=tier(run),rank=RARITIES.findIndex(r=>r.id===run.offer.rarity);let result;try{result=invest(run,amount,{force:dev.force});}catch(error){busy=false;toast(error.message);return;}if(result.pending){busy=false;save();renderHud();renderDock();return;}if(result.challenge)pendingChallenge.push(result.challenge);save();renderDock();effects.tone('tap');
 await wait(meta.motion?Math.max(200,(run.offer.special==='flip'?1100:750)/dev.speed):90);
 if(run.id!==id){busy=false;return;}busy=false;renderHud();renderDock();refreshStyle();const rect=focusRect();
 effects.pop(signed(result.profit),result.won?L('NET PROFIT','净收益'):result.lossScope==='wallet'?L('ALL CASH LOST','全部现金清空'):L('THIS STAKE IS GONE','本次投入已全部亏掉'),rect,result.profit<0);
 cashFlow.play(result.profit,$('game-dock'));
 effects.tone(result.won?'win':'loss',rank);
 if(result.profit>0){world.celebrate();effects.burst(rect.left+rect.width*.46,rect.top+rect.height*.6,rank+1,getRarity(run.offer.rarity).color);checkMilestoneCelebration();}else{world.fail();$('game-dock').classList.add('shake');setTimeout(()=>$('game-dock').classList.remove('shake'),380);}
 $('announcement').textContent=L('Result ','结果 ')+signed(result.profit)+L('. Cash remaining ','。剩余现金 ')+money(run.cash);
 if(tier(run)>oldTier){sceneMessage(text(TIERS[tier(run)].name));platform.celebrate();}
 platform.submit(run).catch(()=>{});
 if(run.ended){pause();await wait(meta.motion?650:50);if(run.id===id&&run.ended)showGameOver();}else if(pendingChallenge.length){await wait(meta.motion?600:20);if(run.id===id&&!modalType)showChallengeResult(pendingChallenge.shift());}
}
function buyAsset(){if(busy||modalType||!validAction()||run.offer.type!=='asset'||!lifeUI.beforeNext())return;const a=getAsset(run.offer.asset);const apply=()=>{try{purchaseAsset(run,a.id);save();refreshStyle();renderHud();renderDock();effects.tone('buy');world.celebrate();const r=focusRect();effects.burst(r.left+r.width*.45,r.top+r.height*.6,4,a.color);checkMilestoneCelebration();if(run.ended&&!lifeUI?.hasPendingDeath())showGameOver();else sceneMessage(L('WELCOME HOME!','欢迎回家！'));}catch{toast(L('You cannot purchase this asset right now.','当前无法购买此资产。'));}};if(run.cash===a.price*100)confirmDialog(L('This purchase ends your run.','这次购买会结束本局。'),L('It leaves you with $0. You will lose this building and everything else to bankruptcy. Continue?','购买后现金归零，会立即破产并清空这座建筑及所有资产。仍然继续？'),apply);else apply();}
function buyOutfit(id){if(busy||!validAction())return;if(!run.outfits.includes(id)&&!lifeUI.beforeNext())return;const o=getOutfit(id);const apply=()=>{try{purchaseOutfit(run,id);save();refreshStyle();renderHud();renderDock();effects.tone('buy');if(run.ended){forceClose();showGameOver();}else if(modalType==='wardrobe')showWardrobe();else sceneMessage(L('NEW LOOK. SAME ODDS.','新外观，不改胜率。'));}catch{toast(L('Buy new outfits only at a roadside shop.','新服装只能在路边遇到的商店购买。'));}};if(!run.outfits.includes(id)&&run.cash===o.price*100)confirmDialog(L('Spend your last dollar?','要花光最后的现金吗？'),L('Zero cash means bankruptcy and all outfits are cleared.','现金归零就会破产，所有服装也会清空。'),apply);else apply();}
function startChallenge(){if(busy||modalType||!validAction()||!lifeUI.beforeNext())return;try{acceptChallenge(run);save();renderHud();renderDock();effects.tone('rare');sceneMessage(L('CLOCK IS TICKING. LET’S GO!','倒计时开始，出发！'));musicMode();}catch{toast(L('Finish the active challenge before accepting another.','请先完成当前挑战，再接受新挑战。'));}}

let modalSerial=0,modalClosing=false,modalCloseTimer=null;
function openModal(type,title,subtitle,body,{wide=false,noClose=false,custom=false}={}){
 if(busy)return;clearTimeout(modalCloseTimer);modalClosing=false;modalSerial++;$('modal').dataset.kind=type;clock();if(!modalType)returnFocus=document.activeElement;modalType=type;$('modal').hidden=false;$('game').inert=true;
 const card=$('modal-card');card.className='modal-card'+(type==='gameover'?' dead-card':'');card.style.maxWidth=wide?'870px':'';
 if(type==='menu')body+=`<div class="onboard-menu-actions"><button class="small-button" data-action="onboard-tour">重看快速教程</button><button class="small-button" data-action="onboard-home">返回开始界面</button></div>`;if(type==='developer')body+=`<div class="life-dev-tools"><button class="small-button" data-action="life-dev-rest">测试：进入假期</button><button class="small-button" data-action="life-dev-ready">测试：完成计时</button><button class="small-button" data-action="life-dev-goods">测试：获得全部机制商品</button></div>`;
 card.innerHTML=custom?body:`<div class="modal-head"><div><span class="modal-eyebrow">${L('Broke to Billionaire · PAUSED','Broke to Billionaire · 已暂停')}</span><h2 id="modal-title">${safe(title)}</h2><p>${safe(subtitle)}</p></div>${noClose?'':`<button class="modal-close" data-action="close" aria-label="${L('Close','关闭')}">${icon('close')}</button>`}</div>${body}`;
 if(type==='rules'&&run.offer.type==='project'){const o=run.offer;card.querySelector('.modal-head')?.insertAdjacentHTML('afterend',`<div class="panel-notice">项目下限 ${money(o.minStake||1)}；${o.maxStake>=MAX_CENTS?'不设玩法上限（系统上限 9 万亿美元）':'上限 '+money(o.maxStake||50000)}。${o.stages?'必须连续通过两轮审核：'+o.stages.join('% × ')+'%，综合 '+o.p+'%。':''}${o.delay?'投入后锁定 20 秒，刷新不会重抽结果。':''}</div>`);}
 card.getAnimations().forEach(a=>a.cancel());if(meta.motion)card.animate([{opacity:0,transform:type==='milestone-celebrate'?'translateY(50px) scale(.78)':'translateY(25px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:type==='milestone-celebrate'?850:400,easing:'cubic-bezier(.18,.85,.25,1)',fill:'backwards'});pause();requestAnimationFrame(()=>card.querySelector('button:not(:disabled),input,select')?.focus());
}
// Ceremony dialogs must be dismissed with their own button, never by a stray tap on the backdrop or Escape.
const CASUAL_MODALS=new Set(['atlas','factions','legacy','life-guide','life-status','mechanisms','mechanisms-blueprint','medals-showcase','regions','decorations-modal','theme-picker','ui-settings','street-manager','street-panorama','v9-lvboard','rules','music','history','challenge-details','life-menu','life-atlas','life-wardrobe','menu','settings','leaderboard','developer','v9-lv','atlas','map','records','help','collection','wardrobe','ledger','status']);
const DELIBERATE_ONLY=new Set(['milestone-celebrate','auction-win','challenge-result','rank-ceremony','v9-reclaim','v9-story']);
function nudgeModal(){const card=$('modal-card');card.classList.remove('modal-shake');void card.offsetWidth;if(meta.motion)card.classList.add('modal-shake');const cta=card.querySelector('.unlock-continue,.primary');if(cta&&!card.querySelector('.modal-locked-hint'))cta.insertAdjacentHTML('afterend','<p class="modal-locked-hint">请点上面的按钮确认，这一页不会被误触关掉。</p>');cta?.focus?.();}
function closeModal(force=false){if(adPlaying&&!force)return;if(!modalType&&!force)return;if((modalType==='gameover'||modalType==='world-event'||modalType==='legacy'&&!started)&&!force)return;const serial=modalSerial;const finish=()=>{if(serial!==modalSerial)return;modalClosing=false;modalType=null;confirmCallback=null;$('modal').hidden=true;$('game').inert=!started;pause();returnFocus?.focus?.();};if(force||!meta.motion){clearTimeout(modalCloseTimer);finish();return;}if(modalClosing)return;modalClosing=true;$('modal-card').animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(30px) scale(.95)'}],{duration:320,easing:'ease-in',fill:'forwards'});modalCloseTimer=setTimeout(finish,330);}

const forceClose=()=>closeModal(true);
function confirmDialog(title,message,callback){openModal('confirm',title,message,`<div class="button-row"><button class="small-button" data-action="close">${L('CANCEL','取消')}</button><button class="small-button danger" data-action="confirm">${L('YES, CONTINUE','确认继续')}</button></div>`);confirmCallback=callback;}
function showCashRisk(q,callback){openModal('risk-confirm',L('Your entire wallet is on the line.','这次押上的是全部现金。'),L('This is NOT an ordinary investment.','这不是普通投资规则。'),`<div class="confirm-risk">${L('You only put in ','你投入 ')}<strong>${money(q.stake,true)}</strong>${L(', but failure takes ALL of your ','，但失败会清空全部 ')}<strong>${money(run.cash,true)}</strong>${L(' cash, including the money you did not invest.',' 现金，包括没有投入的钱。')}</div><div class="danger-amount">${L('LOSE → $0','失败 → $0')}</div><p class="small-rule">${L('Bankruptcy removes every building and outfit. This run ends.','破产会清空所有建筑和服装，本局结束。')}</p><div class="button-row"><button class="small-button" data-action="close">${L('NO, GO BACK','返回')}</button><button class="small-button danger" data-action="confirm">${L('I ACCEPT THE RISK','确认承担全部风险')}</button></div>`);confirmCallback=callback;}
function showChallengeResult(e){
 if(!e)return;if(run.ended){showGameOver();return;}e.seen=true;const savedEvent=run.challengeLog.find(x=>x.id===e.id);if(savedEvent)savedEvent.seen=true;save();musicMode();renderHud();renderDock();
 const r=focusRect();effects.tone(e.won?'win':'loss',e.won?4:0);if(e.won){effects.burst(r.left+r.width*.45,r.top+r.height*.6,5,'#c6afff');world.celebrate();platform.celebrate();}else world.fail();
 platform.submit(run).catch(()=>{});
 openModal('challenge-result','','',`<div class="challenge-result ${e.won?'':'failed'}"><div class="success-symbol" style="${e.won?'':'background:#f9e4df;color:#b6746a;border-color:#e9c3b9'}">${icon(e.won?'rank':'timer')}</div><div class="modal-eyebrow">${safe(text(getChallenge(e.kind).name))}</div><h2 id="modal-title">${e.won?L('YOU BEAT THE CLOCK!','你赢下了对赌！'):L('TIME IS UP.','时间到。')}</h2><div class="large-delta">${signed(e.delta)}</div><p>${e.won?L('Bonus paid into your cash.','奖励已经计入现金余额。'):L('The agreed penalty has been deducted.','已扣除接受挑战时约定的惩罚金额。')}</p><p>${L('Cash now: ','当前现金：')}<strong>${money(run.cash,true)}</strong></p><button class="primary" data-action="close">${L('KEEP GOING','继续前进')}${icon('arrow')}</button></div>`,{custom:true});
}
function showChallengeDetails(){const a=run.activeChallenge;if(!a){toast(L('No active challenge. Find one on the road.','暂无进行中的挑战，沿途寻找吧。'));return;}openModal('challenge-details',text(getChallenge(a.kind).name),L('The clock is paused while this menu is open.','打开此菜单时，倒计时暂停。'),`<div class="contract-grid"><div class="contract-cell"><span>${L('TIME LEFT','剩余时间')}</span><strong>${time(a.remainingMs)}</strong></div><div class="contract-cell"><span>${L('TARGET','目标')}</span><strong>${a.metric==='wealth'?money(a.target,true):`${a.progress} / 3`}</strong></div><div class="contract-cell reward"><span>${L('SUCCESS','成功奖励')}</span><strong>+${money(a.reward,true)}</strong></div><div class="contract-cell penalty"><span>${L('FAILURE','失败惩罚')}</span><strong>−${money(a.penalty,true)}</strong></div></div>${a.metric==='wealth'?`<p class="small-rule">${L('Exact target: ','精确目标：')}${money(a.target)}<br>${L('Current net worth: ','当前总身家：')}${money(netWorth(run))}</p>`:''}<div class="panel-notice">${a.metric==='wealth'?L('Reach the target net worth before the clock reaches zero. Net worth is cash plus the purchase value of owned cosmetics. Shopping does not increase net worth.','倒计时归零前，让总身家达到目标。总身家为现金、已购资产与机制商品原价，以及尚未结算的锁定投入。购买本身不会凭空增加总身家。'):L('Land three winning rolls in a row. Each counted win must risk at least ','连续三次成功。每次计入的投入至少为 ')+money(a.minStake)+L('. Any lost roll resets the streak.','；任何一次失败都会打断连胜。')}</div><div class="panel-notice warning">${L('Only one challenge at a time. It cannot be cancelled after acceptance. A penalty cannot create debt, but can take your final dollar and cause bankruptcy.','同时只能进行一个挑战，接受后不能取消。失败扣款不会产生负债，但可能扣光现金导致破产。')}</div><button class="primary" data-action="close">${L('RESUME THE CHALLENGE','继续挑战')}${icon('arrow')}</button>`);}
function showMenu(){
 const tile=(action,i,title,sub)=>`<button class="menu-tile" data-action="${action}">${icon(i)}<span><strong>${title}</strong><small>${sub}</small></span></button>`;
 openModal('menu','给旅程留一点空白。','功能集中在这里，街头只留下重要选择。',`<div class="menu-grid">
 ${worth(run)>=50000?tile('collection','estate','我的资产','已拥有的建筑与 3D 参观')+tile('wardrobe','shirt','我的衣橱','穿戴已拥有的外观'):''}${tile('history','history','旅程记录','投资结果与本局经历')}${tile('leaderboard','rank','人生战绩','本机保存的历史人生')}${tile('music','music','音乐与声音','音量、配乐和音效')}${tile('settings','settings','显示与存档','可读性、画质、备份与恢复')}</div>
 ${worth(run)>=50000?`<details class="menu-advanced"><summary>成长与生活服务 <span>展开 →</span></summary>${lifeUI.menuExtras()}</details>`:'<p class="pause-note">成长与生活服务随财富逐步开放。眼下，先做好这一次投资。</p>'}
 <div class="menu-bottom"><button class="small-button" data-action="help">完整游戏规则</button><button class="small-button" data-action="restart">重新开始一局</button></div><button class="primary" style="width:100%;margin-top:20px" data-action="close">回到街头 →</button>`);
}
function showSettings(){
 const toggle=(a,label,on)=>`<div class="setting-row"><label>${label}</label><button class="toggle ${on?'on':''}" data-action="${a}" aria-label="${safe(label)}" aria-pressed="${on}"></button></div>`;
 openModal('settings','按你的方式游玩。','布局在「界面」里切换。这里负责舒适与安全。',`
 <label class="small-rule" for="player-name">排行榜昵称</label><div class="form-row"><input class="field-input" id="player-name" maxlength="20" value="${safe(meta.name)}" placeholder="你" ${platform.user?'disabled':''}><button class="small-button" data-action="save-name">保存</button></div>
 ${toggle('readability','大字阅读模式',!!meta.largeText)}${toggle('motion','界面动画与粒子效果',meta.motion)}${toggle('quality','低功耗画质',meta.low)}
 <div class="setting-row"><label>布局与设备</label><button class="small-button" data-action="onboard-home">打开界面工作室 →</button></div>
 <section class="backup-section"><h3>给进度留一份备份。</h3><p>同一浏览器、同一地址下自动保存。更换电脑、浏览器或下载文件位置前，先导出 JSON 存档。</p><div class="button-row"><button class="small-button" data-action="backup-export">导出存档 ↓</button><button class="small-button" data-action="backup-import">导入备份 ↑</button></div><input type="file" id="backup-file" accept=".json,application/json" hidden><p class="life-note">导入会替换当前进度，需再次确认。导入局标为测试局，不提交官方榜单。</p></section>
 <div class="panel-notice">存储方式：${safe(platform.storageMode)}。${platform.storageMode==='session'?'当前环境不支持持久保存，请及时导出备份。':'自动保存已开启。休息计时支持离线恢复。'}</div><button class="primary" style="width:100%" data-action="close">完成 ✓</button>`);
}
function showMusic(){openModal('music',L('A real soundtrack.','真正的游戏配乐。'),L('Six cities, six distinct licensed recordings, embedded for offline playback.','六座城市，六首网上取得的独立配乐。默认自动随城市切换；全部内置，无需联网播放。'),`<div class="setting-row"><label>${L('Background music','背景音乐')}</label><button class="toggle ${meta.music?'on':''}" data-action="music-toggle" aria-label="${L('Background music','背景音乐')}" aria-pressed="${meta.music}"></button></div><div class="setting-row"><label>${L('Sound effects','游戏音效')}</label><button class="toggle ${meta.sound?'on':''}" data-action="sound-toggle" aria-label="${L('Sound effects','游戏音效')}" aria-pressed="${meta.sound}"></button></div><label for="music-volume" class="small-rule">${L('Music volume','音乐音量')} <strong id="volume-value">${Math.round(meta.volume*100)}%</strong></label><input class="volume-slider" id="music-volume" type="range" min="0" max="100" value="${Math.round(meta.volume*100)}"><p class="small-rule">默认城市配乐自动切换；阶层配乐可在购买音乐管家后于生活菜单选择。</p><div id="music-state" class="panel-notice"></div>${MUSIC_CREDITS.map(c=>`<div class="music-credit"><strong>${safe(c.title)}</strong>${safe(c.artist)}<br>${safe(c.license)} · ${c.source.includes('incompetech')?'incompetech.com':c.source.startsWith('http')?'OpenGameArt':'原工程原创配乐'}${c.licenseURL?`<br><a href="${c.licenseURL}" target="_blank" rel="noopener">Creative Commons Attribution 4.0</a>`:''}</div>`).join('')}<p class="pause-note">${L('Source links, original license evidence, and credits are included in the download. Music starts after your first tap.','下载包包含来源、原始授权说明与署名。首次点击后开始播放音乐。')}</p>${platform.muted?`<div class="panel-notice warning">${L('The platform currently requires mute. Game switches cannot override it.','平台当前要求静音，游戏开关不能解除平台静音。')}</div>`:''}`);renderMusicStatus();}
function renderMusicStatus(){if(modalType!=='music'||!$('music-state'))return;const s=music.status();$('music-state').textContent=s.error?L('Audio could not load: ','音频加载失败：')+s.error:s.playing?L('Now playing: ','正在播放：')+(MUSIC_CREDITS.find(c=>c.id===s.mode)?.title||s.mode):!meta.music?L('Music is off.','音乐已关闭。'):platform.muted?L('Muted by the platform.','平台已静音。'):meta.volume===0?L('Music volume is 0%.','音乐音量为 0%。'):!s.unlocked?L('Tap or press a key to start the music.','点击或按键后开始播放。'):L('Loading the recorded track…','正在加载录制音乐…');}
function showWardrobe(){const list=OUTFITS.filter(o=>run.outfits.includes(o.id));openModal('wardrobe',L('Your wardrobe.','你的衣橱。'),L('Equip owned clothes here. Buy new ones only at random street shops.','这里只能穿戴已拥有的服装。新衣服需沿途遇到商店购买。'),`<div class="asset-grid">${list.map(o=>`<article class="asset-tile"><span class="tile-tag">${run.equipped===o.id?L('EQUIPPED','穿着中'):L('OWNED','已拥有')}</span>${outfitIcon(o)}<h3>${safe(text(o.name))}</h3><button class="small-button" data-action="equip" data-value="${o.id}" ${run.equipped===o.id?'disabled':''}>${L('WEAR THIS','穿上这件')}</button></article>`).join('')}</div><div class="panel-notice">${L('There is no permanent store. Pop-up shops appear randomly on your route. All clothing is cosmetic and disappears on bankruptcy.','没有常驻商店。换装店会随机出现在路上。服装只改变外观，破产时全部清空。')}</div>`);}
function showCollection(){const list=ASSETS.filter(a=>run.assets.includes(a.id));openModal('collection',L('Your addresses.','你的资产版图。'),L('Cosmetic prestige, not passive income.','只增加排面，不产生被动收入。'),list.length?`<div class="asset-grid">${list.map(a=>`<article class="asset-tile"><span class="tile-tag">${L('OWNED','已拥有')}</span>${assetIcon(a)}<h3>${safe(text(a.name))}</h3><span class="tile-price">${price(a.price)}</span><p>${safe(text(EFFECTS[a.effect]))}</p><button class="small-button" data-action="visit" data-value="${a.id}">${L('VISIT IN 3D','3D 参观')}</button></article>`).join('')}</div>`:`<div class="empty-state">${icon('estate')}<h3>${L('Your first address is out there.','第一处资产，就在路上。')}</h3><p>${L('Building offers appear randomly along the route, roughly 4% of stops after stop five. Keep walking. No permanent asset shop.','第 5 站起，沿途约有 4% 概率遇到建筑。继续探索吧，没有常驻资产商店。')}</p><button class="small-button" data-action="close">${L('BACK TO THE STREET','回到街头')}</button></div>`,{wide:list.length>3});}
function showLeaderboard(tab=boardTab){
 boardTab=tab;record();const tabs=`<div class="tabs"><button class="${tab==='local'?'active':''}" data-action="board-tab" data-value="local">${L('LOCAL RUNS','本机战绩')}</button><button class="${tab==='platform'?'active':''}" data-action="board-tab" data-value="platform">CrazyGames</button></div>`;
 let body='';if(tab==='local'){
  const rows=[...meta.records,...meta.bots].sort((a,b)=>b.peak-a.peak).slice(0,100);
  body=`${meta.bots.length?`<div class="panel-notice warning">${L('SIM players are developer-generated bots, not real online users.','SIM 玩家为开发者生成的虚拟数据，不是在线真人。')}</div>`:''}<div class="leader-head"><span>#</span><span>${L('PLAYER','玩家')}</span><span>${L('PEAK WEALTH','最高身家')}</span></div>${rows.map((r,i)=>`<div class="leader-row ${r.id===run.id?'self':''} prestige-${Number(r.tier)||0}"><span class="position">${i+1}</span><div><div class="leader-name">${safe(r.id===run.id?playerName():r.name)}<small>${r.simulated?'SIM':r.unranked?'TEST':r.id===run.id?L('YOU','你'):L('RUN ','局 ')+Number(r.runNumber||1)}</small>${r.founder?`<small>${L('FOUNDER','创始人')}</small>`:''}${r.tier>=3?icon('crown'):''}</div>${r.ended?`<span class="leader-extra">${safe(r.cause||'人生结束')} · ${Number(r.rests)||0} 次休息 · ${Number(r.luxuryPoints)||0} LP</span>`:''}${r.counter||r.tier>=4?`<span class="leader-extra">${fmt(r.page)} ${L('stops explored','站已探索')}</span>`:''}</div><strong>${money(r.peak,true)}</strong></div>`).join('')}<div class="panel-notice">${L('Peak net worth = cash + original purchase value of owned cosmetics. Buying an asset does not create wealth. This is saved local history, not a global online ranking.','按历史最高总身家排序。总身家＝现金＋资产、服装、商品的购入价＋待交割本金。这里只显示已结束的人生，是本机记录，不是全球在线排名。')}</div>`;
 }else{
  const configured=!!CONFIG.crazygames?.encryptionKey;
  body=`<div class="empty-state">${icon('rank')}<h3>${L('The official climb.','挑战官方排名。')}</h3><p>${L('Official ranks are shown by CrazyGames in its leaderboard drawer. This game submits clean-run scores using the documented encrypted API.','官方排名由 CrazyGames 排行榜侧栏展示。本游戏通过官方加密接口提交纯净局分数。')}</p></div><div class="panel-notice">${platform.sdk?L('SDK connected.','SDK 已连接。'):L('Open on CrazyGames to connect.','请在 CrazyGames 环境连接。')}<br>${configured?L('Encryption key configured.','加密密钥已配置。'):L('Publisher must enable the invited leaderboard and configure its key.','发布者需获得榜单开通资格并配置密钥。')}</div>${run.unranked?`<div class="panel-notice warning">${L('TEST run: debug changes or imports can never submit. Start a clean run.','TEST 测试局：调试修改和导入存档不能提交。请开启纯净新局。')}</div>`:''}<button class="primary" style="width:100%" data-action="submit-score" ${!platform.sdk||!configured||run.unranked?'disabled':''}>${L('SUBMIT ','提交 ')}${money(run.peak,true)}${icon('up')}</button>${platform.sdk&&!platform.user?`<button class="small-button" style="margin-top:12px" data-action="login">${L('Sign in with CrazyGames','登录 CrazyGames')}</button>`:''}`;
 }
 openModal('leaderboard',L('The climb.','财富天梯。'),L('Start small. Leave a story.','从小小本金，写下你的故事。'),tabs+body);
}
function showRules(){
 const o=run.offer;let body='';
 if(o.type==='special'){const c=getSpecial(o.special);body=`<div class="panel-notice ${c.lossScope==='wallet'?'danger':''}">${safe(text(c.desc))}</div><ul class="help-list"><li>${L('Required stake: ','固定投入：')}<strong>${Math.round(c.ratio*100)}%</strong> ${L('of current cash.','当前现金。')}</li><li><strong>${o.p}%</strong> ${L('win chance. Return: ','成功概率。返还：')}<strong>×${o.up.toFixed(2)}</strong> ${L('the stake, including principal.','投入本金，包含本金本身。')}</li><li>${c.lossScope==='wallet'?L('On failure, ALL cash is lost, including the uninvested cash. That ends the run and clears every asset.','失败时，全部现金清空，包括未投入部分。本局结束，所有资产清空。'):L('On failure, only this entire stake is lost. Uninvested cash remains.','失败时，只损失本次全部投入，未投入现金保留。')}</li></ul>`;}
 else if(o.type==='project'){body=`<div class="panel-notice">${L('A normal investment has exactly two outcomes. Success returns the shown multiplier; failure returns $0 on the stake.','普通投资恰好两个结果：成功按所示倍率返还；失败时，投入本金返还 $0。')}</div><ul class="help-list"><li>${L('Your uninvested money stays safe.','未投入的现金不会受影响。')}</li><li>${L('Example: stake $25 at ×1.80. Success returns $45 (profit $20). Failure loses the $25, not your entire wallet.','例如投入 $25，倍率 ×1.80：成功返还 $45，净赚 $20；失败损失 $25，而非整个钱包。')}</li><li>${L('If you invest your entire wallet and lose, cash hits $0 and the run ends.','如果投入了全部现金且失败，现金归零，本局结束。')}</li><li>${L('The displayed probability is the actual draw probability. Each offer can be played once.','显示概率即实际抽样概率。每个项目只能投资一次。')}</li></ul>`;}
 else if(o.type==='challenge'){body=`<div class="panel-notice">${L('Accepting starts the clock. Skipping uses 5 energy. Once accepted, the challenge cannot be cancelled.','接受后才开始计时。跳过消耗 5 体力，接受后不能取消。')}</div><ul class="help-list"><li>${L('The reward and penalty are fixed dollar amounts shown before you accept.','奖励与惩罚都是接受前已显示的固定金额。')}</li><li>${L('Menus, ads and hidden tabs pause the timer. Reload resumes the saved remaining time.','菜单、广告和后台暂停计时。刷新后继续已保存的剩余时间。')}</li><li>${L('A penalty is capped at your available cash. It can bankrupt you, but never creates debt.','扣款最多扣光可用现金，可能导致破产，但不会产生负债。')}</li><li>${L('Only one challenge may be active. Shopping does not grow net worth.','同时只能进行一个挑战。购买装饰不会增加总身家。')}</li></ul>`;}
 else body=`<div class="panel-notice">${L('New items can only be bought at their current roadside encounter. Owned items can be equipped or viewed from the menu. Buildings and outfits are cosmetic. Utility goods unlock the stated mechanisms. No resale.','新物品只能在当前路边邂逅中购买。已拥有物品可从菜单穿戴或参观。建筑和服装只提供外观；机制商品另有地图、利息、过滤等已显示功能。均不可转售。')}</div><p class="small-rule">${L('Asset prices are fixed fictional asking prices using real-world USD scales, not live valuations.','建筑为采用现实美元量级标价的虚构资产，不是实时估值。')}</p>`;
 openModal('rules',L('Know exactly what is at risk.','先看清楚，究竟赌什么。'),L('No hidden losses. No real money.','不隐藏损失规则，不涉及真钱。'),body+`<button class="primary" style="width:100%" data-action="close">${L('GOT IT','明白了')}${icon('check')}</button>`);
}
function showHelp(){openModal('help',L('Walk. Risk. Rise.','走下一站，闯新高度。'),L('Everything happens inside the city.','所有操作，都在这个城市里。'),`<ul class="help-list"><li><strong>${L('Swipe right','向右滑动')}</strong>${L(' on the world or card to walk to the next stop. Passing uses 5 energy. → also works.',' 场景或项目卡片，走向下一站。跳过不收费，但消耗 5 体力，也可以按 →。')}</li><li><strong>${L('Normal investments','普通投资')}</strong>${L(' lose the entire stake on failure, never the untouched cash. Multipliers include principal. Payouts floor to cents.',' 失败会损失本次全部投入，不会动未投入的钱。倍率包含本金，返还向下取整至美分。')}</li><li><strong>${L('Special showdowns','特殊对赌')}</strong>${L(' can require 25%, 50%, 75%, or 100% stakes. The red half-stake contract can wipe ALL cash, even the uninvested half. It asks for extra confirmation.',' 可能要求投入 25%、50%、75% 或全部现金。红色半仓合约失败会清空全钱包，包括没投的一半，并要求再次确认。')}</li><li><strong>${L('Timed challenges','限时挑战')}</strong>${L(' test your wealth growth or win streak. Earn the stated bonus or pay the stated penalty. The timer pauses in menus and the background.',' 考验财富增长或连胜。成功得到约定奖励，失败支付约定惩罚。菜单和后台会暂停计时。')}</li><li><strong>${L('Shops and buildings','商店与建筑')}</strong>${L(' are random roadside discoveries, not permanent shopping menus. Outfits and properties only change your look and prestige.',' 是路上的随机邂逅，不是常驻购物菜单。服装和房产只改变外观与排面。')}</li><li><strong>${L('$0 = bankruptcy','现金归零＝破产')}</strong>${L('. All cosmetics are cleared. Start over with $100. Old scores remain as history, never as spendable cash.','。清空全部建筑与服装，带着 $100 重开。旧战绩仅作记录，不能拿来消费。')}</li></ul><div class="panel-notice">街头项目上限 $500；高级项目 $1,000–$100,000；顶级项目 $100,000 起且不设玩法上限。高级与顶级机会按当前总身家解锁，变穷后也会退阶。</div><button class="small-button" data-action="life-guide">查看体力、地图、休息与商品规则</button><div class="panel-notice warning">${L('Fictional game currency only. No deposits, cash-out, real assets, or financial advice. Cash/score ceiling: $9 trillion. The route has no final stop.','仅使用虚构游戏货币。没有充值、提现、真实资产或理财建议。资金／分数上限为 9 万亿美元，关卡无终点。')}</div><button class="primary" style="width:100%" data-action="close">${L('LET’S GO','出发')}${icon('arrow')}</button>`);}
function showHistory(){openModal('history',L('Your run journal.','你的本局日记。'),L('Every reward. Every risk.','每次收益，每次风险。'),`<div class="stat-grid"><div class="stat-cell"><span>${L('PEAK','最高身家')}</span><strong>${money(run.peak,true)}</strong></div><div class="stat-cell"><span>${L('STOPS','已走站数')}</span><strong>${run.page}</strong></div><div class="stat-cell"><span>${L('WINS','成功次数')}</span><strong>${run.wins}</strong></div></div>${run.challengeLog.map(c=>`<div class="history-row"><div>${icon('timer')} ${safe(text(getChallenge(c.kind).name))}<small>${c.won?L('Challenge completed','挑战完成'):L('Challenge failed','挑战失败')} · #${c.page}</small></div><strong class="${c.delta>=0?'positive':'negative'}">${signed(c.delta)}</strong></div>`).join('')}${run.history.length?run.history.map(h=>`<div class="history-row"><div>${safe(h.special?text(getSpecial(h.special).name):text(getProject(h.project).name))}<small>#${h.page} · ${L('Stake ','投入 ')}${money(h.stake,true)} · ×${h.multiplier.toFixed(2)}</small></div><strong class="${h.profit>=0?'positive':'negative'}">${signed(h.profit)}</strong></div>`).join(''):`<div class="empty-state">${L('Your first decision is ahead.','第一次抉择，就在前方。')}</div>`}`);}
function showGameOver(){
 if(modalType==='gameover')return;busy=false;pendingChallenge=[];$('game').classList.remove('travelling');save();refreshStyle();renderHud();renderDock();const e=run.estate||ensureEstate(run),d=e.death;
 const epitaph=getSatiricalEpitaph(d?.cause||'');
 const medals=e.auctionMedals||[];
 const medalsHtml=medals.length?`
  <div class="auction-medals-summary">
   <span>生前所获专属拍卖勋章：</span>
   ${medals.map(id=>`<span class="medal-tag" title="${getAuctionLot(id)?.name}">${getAuctionLot(id)?.medal||'🎖️'} ${getAuctionLot(id)?.name}</span>`).join(' ')}
  </div>
 `:'';
 openModal('gameover','','',`
  <div class="life-end">
   ${obituaryArt}
   <div class="modal-eyebrow">LIFE CLOSED / 财务死亡与人生清算</div>
   <h2 id="modal-title">你的故事，停止计息。</h2>
   <div class="death-cause-box">
    <strong>💀 离场原因：${safe(d?.cause||'现金耗尽，宣告破产')}</strong>
    <p>${safe(epitaph)}</p>
   </div>
   <div class="stat-grid">
    <div class="stat-cell"><span>生前最高总身家</span><strong>${money(run.peak,true)}</strong></div>
    <div class="stat-cell"><span>离场清算现金</span><strong>${money(d?.cash??run.cash,true)}</strong></div>
    <div class="stat-cell"><span>度过的休整周期</span><strong>${e.age} 次</strong></div>
   </div>
   ${medalsHtml}
   <div class="legacy-receipt">
    本局累计功德点 +${e.luxuryEarned} LP · 转世账户总计 <strong>${meta.legacy.points} LP</strong>
    <small>已永久记入本机人生功勋册，转世事务所可用点数强化下一次人生。</small>
   </div>
   <button class="primary" data-action="new-run">领取下辈子 $100 初始资金 · 投胎转世 →</button>
   <div class="button-row">
    <button class="small-button" data-action="life-legacy">转世事务所</button>
    <button class="small-button" data-action="leaderboard">人生功勋榜</button>
   </div>
   <p class="pause-note">命运无常，账单长存。下一世也许你就能买下整座太空发射场。</p>
  </div>
 `,{custom:true,noClose:true});
 pause();
}
async function restart(){
 if(busy)return;
 const e=run.estate||ensureEstate(run),cause=e.death?.cause||'主动结束本局，申请转世';
 if(!run.ended)endLife(run,cause);
 save();forceClose();busy=true;$('game').inert=true;
 await playObituary(!meta.motion, cause);
 $('game').inert=false;
 if(run.runNumber%3===0)await platform.midgame();
 meta.runCount=Math.max(meta.runCount||1,run.runNumber)+1;
 run=newRun(meta.runCount);applyLegacy(run,meta);lifeUI.loaded();
 Object.assign(dev,{force:null,...DEFAULT_RATES,speed:1});world.speed=1;stake=2500;stakeRatio=.25;
 pendingChallenge=[];visit=null;selectedOutfit=0;effects.parts=[];
 document.querySelectorAll('.money-pop').forEach(x=>x.remove());clearTimeout(discoveryTimer);
 $('discovery').classList.remove('show');busy=false;$('game').classList.remove('travelling');
 world.setOffer(run.offer);refreshStyle();renderHud();renderDock();save();pause();platform.context(run);
 sceneMessage(L('A NEW START. $100.','全新开始，$100。'));
}
function ensureActive(){if(run.ended){meta.runCount++;run=newRun(meta.runCount);world.setOffer(run.offer);}run.unranked=true;}
function devChanged(){markPeak(run);stake=Math.max(1,Math.min(stake,run.cash));save();refreshStyle();renderHud();renderDock();}

let devOutput='';
function showDeveloper(){
 if(!CONFIG.allowDeveloperMode)return;
 const options=(list,id,name)=>list.map(v=>`<option value="${v.id}" ${v.id===id?'selected':''}>${safe(name(v))}</option>`).join('');
 const b=(a,label,extra='')=>`<button class="small-button" data-action="${a}" ${extra}>${label}</button>`;
 openModal('developer',L('Developer playground.','开发者试验场。'),L('Test every scene, risk and deadline.','测试所有场景、风险与倒计时。'),`<div class="panel-notice warning">${L('Economic changes permanently mark this run TEST. Imported runs also remain TEST. None can submit official scores.','资金、概率、计时和资产修改会永久标记本局为 TEST。导入存档也为 TEST，不能提交正式分数。')}</div><div class="developer-grid">
 <div class="setting-box"><h3>${L('Cash & prestige','资金与排面')}</h3><input id="dev-cash" type="number" min="0" max="${MAX_CENTS/100}" step=".01" value="${run.cash/100}" aria-label="Developer cash"><div class="button-row">${b('dev-cash',L('Set cash','设置现金'))}${b('dev-add','$10K+','data-value="10000"')}${b('dev-add','$1M+','data-value="1000000"')}</div><div class="button-row"><button class="small-button highlight" data-action="dev-tycoon">${icon('crown')}${L('TYCOON PREVIEW','一键亿万富豪')}</button></div></div>
 <div class="setting-box"><h3>${L('Ordinary project','普通投资项目')}</h3><select id="dev-project">${options(PROJECTS,run.offer.project,p=>text(p.name))}</select><select id="dev-rarity" style="margin-top:8px">${options(RARITIES,run.offer.rarity,r=>text(r.name))}</select><div class="button-row">${b('dev-project-next',L('Walk there now','立即前往'))}</div></div>
 <div class="setting-box"><h3>${L('Explosive special deals','劲爆特殊合约')}</h3><select id="dev-special">${options(SPECIALS,'half',c=>text(c.name))}</select><p>${L('Half stake / total wallet risk; jackpot; coin flip; 75% stake.','半仓全险、全仓头奖、硬币对决、75% 固定投入。')}</p><div class="button-row">${b('dev-special-next',L('Discover the contract','立即生成合约'))}</div></div>
 <div class="setting-box"><h3>${L('Timed challenges','限时对赌')}</h3><select id="dev-challenge">${options(CHALLENGES,'double',c=>text(c.name))}</select><p>${L('Test duration (seconds, 1–600)','测试限时（秒，1–600）')}</p><input id="dev-duration" type="number" min="1" max="600" value="30"><div class="button-row">${b('dev-challenge-next',L('Discover challenge','立即生成挑战'))}</div>${run.activeChallenge?`<div class="button-row">${b('dev-challenge-win',L('Reach target','直接完成目标'))}${b('dev-challenge-expire',L('Expire timer','立即超时'))}</div>`:''}</div>
 <div class="setting-box"><h3>${L('Roadside discoveries','路边商店与建筑')}</h3><div class="button-row">${b('dev-shop',L('Find an outfit shop','遇到换装商店'))}</div><select id="dev-asset" style="margin-top:10px">${options(ASSETS,'market-stall',a=>text(a.name)+' · '+price(a.price))}</select><div class="button-row">${b('dev-asset-next',L('Discover building','遇到建筑'))}${b('dev-asset-grant',L('Grant building','赠送建筑'))}</div><div class="button-row">${b('dev-all',L('Own all cosmetics','拥有全部装饰'))}</div></div>
 <div class="setting-box"><h3>${L('Result control','结果控制')}</h3><select id="dev-result"><option value="random" ${!dev.force?'selected':''}>${L('True random','真实随机')}</option><option value="win" ${dev.force==='win'?'selected':''}>${L('Always win · TEST','强制成功 · TEST')}</option><option value="lose" ${dev.force==='lose'?'selected':''}>${L('Always lose · TEST','强制失败 · TEST')}</option></select><div class="button-row">${b('dev-result-set',L('Apply','应用'))}${b('dev-bankrupt',L('Bankrupt now','立即破产'))}</div><p>${L('Failure is ×0. Full-wallet clauses remain enforced.','失败倍率固定为 ×0；特殊全钱包条款仍生效。')}</p></div>
 <div class="setting-box"><h3>${L('Probability lab','概率实验')}</h3><p>${L('Win chance %, return multiplier. Current project / special only.','成功概率 %、成功返还倍率。修改当前项目或特殊合约。')}</p><div class="form-row"><input id="dev-prob" type="number" min="1" max="99" value="${run.offer.p||75}" aria-label="Win chance"><input id="dev-mult" type="number" min="1" max="20" step=".01" value="${run.offer.up||1.8}" aria-label="Return multiplier"></div><div class="button-row">${b('dev-odds',L('Set odds · TEST','修改概率 · TEST'))}${b('dev-simulate',L('10,000 test rolls','模拟一万次'))}</div></div>
 <div class="setting-box"><h3>${L('Virtual leaderboard','虚拟排行榜')}</h3><input id="dev-bots" type="number" min="0" max="100" value="${meta.bots.length||12}" aria-label="Number of simulated players"><p>${L('Every generated player is labeled SIM.','每位虚拟玩家都明确标为 SIM。')}</p><div class="button-row">${b('dev-bots-add',L('Generate / reshuffle','随机生成／重排'))}${b('dev-bots-clear',L('Clear bots','清空虚拟玩家'))}</div></div>
 <div class="setting-box"><h3>${L('Speed & encounters','速度与出现概率')}</h3><select id="dev-speed">${[1,2,4].map(n=>`<option value="${n}" ${dev.speed===n?'selected':''}>${n}× ${L('animation','动画')}</option>`).join('')}</select><p>${L('Building encounter rate. Default 4%.','建筑出现概率，默认 4%。')}</p><input id="dev-rate" type="range" min="0" max="30" value="${Math.round(dev.assetRate*100)}"><p id="dev-rate-value">${Math.round(dev.assetRate*100)}%</p><div class="button-row">${b('dev-rate-set',L('Apply rate · TEST','应用概率 · TEST'))}</div></div>
 <div class="setting-box"><h3>${L('Saves & diagnostics','存档与诊断')}</h3><div class="button-row">${b('dev-export',L('Export JSON','导出 JSON'))}${b('dev-import',L('Import JSON','导入 JSON'))}</div><input id="import-file" type="file" accept="application/json,.json" hidden><div class="button-row">${b('dev-diagnostics',L('Diagnostics','运行诊断'))}${b('dev-clean',L('Clean new run','纯净新局'))}</div></div>
 </div><pre class="dev-output" id="dev-output">${safe(devOutput||L('Ready. All timer edits and economic changes make this a TEST run.','就绪。计时与经济修改会将本局标记为 TEST。'))}</pre>`,{wide:true});
}
function settingsChanged(){preferences();save();renderHud();if(modalType==='settings')showSettings();if(modalType==='music')showMusic();}
let sessionLang=false;function setLanguage(){sessionLang=true;meta.lang=meta.lang==='en'?'zh':'en';document.documentElement.lang=meta.lang==='zh'?'zh-CN':'en';world.setLanguage(meta.lang);save();syncLanguage();renderHud();renderDock();const type=modalType;if(type==='menu')showMenu();else if(type==='settings')showSettings();else if(type==='help')showHelp();else if(type==='music')showMusic();else if(type==='wardrobe')showWardrobe();else if(type==='collection')showCollection();else if(type==='leaderboard')showLeaderboard();else if(type==='developer')showDeveloper();}
async function submitScore(){const result=await platform.submit(run),messages={sent:L('Score sent. CrazyGames validates it independently. Acceptance is not confirmed by the SDK.','分数已发送，由 CrazyGames 独立校验；SDK 不确认是否验分成功。'),unranked:L('TEST runs cannot submit scores.','测试局不能提交分数。'),offline:L('Open on CrazyGames to submit.','请在 CrazyGames 中提交。'),unconfigured:L('The publisher must enable and configure its leaderboard.','发布者需开通并配置排行榜。'),login:L('Sign in with CrazyGames first.','请先登录 CrazyGames。'),cooldown:L('Wait a few seconds before submitting again.','请稍等数秒后再提交。'),range:L('Score is outside the configured range.','分数超出配置范围。'),error:L('Could not send. Check platform configuration.','无法发送，请检查平台配置。')};toast(messages[result.code]||messages.error);}
function renderTour(){const a=visit;if(!a)return;const d=$('game-dock');d.dataset.kind='asset';d.style.setProperty('--rarity',a.color);d.innerHTML=header(L('YOUR ESTATE · TOUR','我的资产 · 参观'),text(a.name),'estate')+`<div class="asset-feature">${icon('sparkle')}${safe(text(EFFECTS[a.effect]))}</div><p class="small-rule">${L('Timer paused while touring your property.','参观资产期间，挑战计时暂停。')}</p>`+actions(L('BACK TO MY STOP','返回当前站'),'exit-visit',{solo:true,gold:true});fitDock();}

// Mutations stay behind a single dispatcher. Swipes never place a bet.
document.addEventListener('click',async e=>{
 const button=e.target.closest('button[data-action]');if(!button||button.disabled)return;const a=button.dataset.action,v=button.dataset.value;
 if(a==='life-theme-picker'){onboarding?.handle('onboard-home');return;}if(onboarding?.handle(a,v))return;if(!started)return;
 if(a.startsWith('dev-')&&!CONFIG.allowDeveloperMode)return;
 if(adPlaying)return;if(busy&&!['music-toggle','sound-toggle'].includes(a))return;
 music.unlock();effects.unlock();effects.tone('tap');if(meta.motion){button.animate([{scale:1},{scale:.95},{scale:1}],{duration:220,easing:'ease-out'});const ripple=document.createElement('i');ripple.className='button-ripple';button.append(ripple);setTimeout(()=>ripple.remove(),600);}
 if(v9?.handle(a,v))return;if(v7?.handle(a,v))return;
 if(streetUI?.handle(a,v))return;
 if(await lifeUI.handle(a,v))return;
 switch(a){
 case 'readability':meta.largeText=!meta.largeText;$('app').dataset.largeText=String(!!meta.largeText);save();showSettings();break;
 case 'backup-export':{save();const data=JSON.stringify({version:3,run,meta},null,2),url=URL.createObjectURL(new Blob([data],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='Last100-save-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('已生成备份，请妥善保存下载的 JSON 文件。');break;}
 case 'backup-import':$('backup-file')?.click();break;
 case 'quick-scale':{
  const scales=[1, 0.85, 0.75, 1.15, 1.25];
  let cur=Number(document.documentElement.style.getPropertyValue('--ui-scale'))||1;
  let idx=scales.findIndex(s=>Math.abs(s-cur)<0.04);
  let next=scales[(idx+1)%scales.length];
  document.documentElement.style.setProperty('--ui-scale',next);
  if($('quick-scale-btn'))$('quick-scale-btn').textContent=Math.round(next*100)+'%';
  try{let s=JSON.parse(localStorage.getItem('last100-ui')||'{}');s.scale=next;localStorage.setItem('last100-ui',JSON.stringify(s));}catch{}
  fitDock();toast(`界面缩放已设为 ${Math.round(next*100)}%`);break;
 }
 case 'next':nextOffer();break;
 case 'invest':doInvest();break;
 case 'stake':updateStake(Math.max(1,Math.floor(run.cash*Number(v)/100)));break;
 case 'buy-asset':buyAsset();break;
 case 'shop-select':selectedOutfit=Number(v);renderDock();effects.tone('tap');break;
 case 'buy-outfit':if(run.offer.type==='shop')buyOutfit(run.offer.items[selectedOutfit]);break;
 case 'equip':if(run.outfits.includes(v))buyOutfit(v);break;
 case 'accept-challenge':startChallenge();break;
 case 'challenge-details':showChallengeDetails();break;
 case 'rules':showRules();break;
 case 'help':lifeUI.guide();break;
 case 'menu':showMenu();break;
 case 'settings':showSettings();break;
 case 'wardrobe':showWardrobe();break;
 case 'decorations':lifeUI.openDecorationsModal();break;
 case 'collection':showCollection();break;
 case 'leaderboard':showLeaderboard('local');break;
 case 'board-tab':showLeaderboard(v);break;
 case 'history':showHistory();break;
 case 'music':showMusic();break;
 case 'music-toggle':meta.music=!meta.music;music.setEnabled(meta.music);settingsChanged();break;
 case 'sound-toggle':meta.sound=!meta.sound;settingsChanged();if(meta.sound)effects.tone('tap');break;
 case 'music-mode':meta.musicMode=v;musicMode();save();showMusic();break;
 case 'motion':meta.motion=!meta.motion;settingsChanged();break;
 case 'quality':meta.low=!meta.low;settingsChanged();break;
 case 'language':setLanguage();break;
 case 'save-name':meta.name=String($('player-name').value).trim().slice(0,20);save();renderHud();toast(L('Name saved.','昵称已保存。'));break;
 case 'close':closeModal();break;
 case 'confirm':{const cb=confirmCallback;forceClose();cb?.();break;}
 case 'restart':confirmDialog(L('Start over with $100?','重新从 $100 开始？'),L('Cash, all assets, outfits and the active challenge are cleared. Old run records stay.','现金、全部资产、服装及进行中的挑战清空。保留旧战绩。'),restart);break;
 case 'new-run':restart();break;
 case 'visit':{const asset=getAsset(v);if(!asset||!run.assets.includes(v))break;forceClose();visit=asset;world.inspect(asset);renderTour();renderHud();pause();break;}
 case 'exit-visit':visit=null;world.setOffer(run.offer);renderHud();renderDock();pause();break;
 case 'bid-auction':bidAuction();break;
 case 'pass-auction':passAuction();break;
 case 'clinic-buy':{try{buyMedical(run,v);save();effects.tone('buy');renderDock();toast('购买疗程成功，健康已恢复！');}catch(err){toast(err.message);}break;}
 case 'set-theme':meta.theme=v;preferences();save();showSettings();break;
 case 'scale-preset':meta.scale=Number(v);preferences();fitDock();world.resize();save();showSettings();break;
 case 'submit-score':submitScore();break;
 case 'login':await platform.login();showLeaderboard('platform');break;
 case 'developer':showDeveloper();break;
 case 'dev-cash':{const n=Number($('dev-cash').value);if(!Number.isFinite(n)||n<0){toast(L('Enter a valid cash amount.','请输入有效现金数额。'));break;}ensureActive();run.cash=moneyInt(Math.round(n*100));if(run.cash===0){bankrupt(run);save();forceClose();showGameOver();}else{devChanged();showDeveloper();}break;}
 case 'dev-add':ensureActive();run.cash=moneyInt(run.cash+Number(v)*100);devChanged();showDeveloper();break;
 case 'dev-project-next':{const rarity=$('dev-rarity').value,project=$('dev-project').value;ensureActive();save();forceClose();nextOffer({rarity,project});break;}
 case 'dev-special-next':{const special=$('dev-special').value;ensureActive();save();forceClose();nextOffer({special});break;}
 case 'dev-challenge-next':{const challenge=$('dev-challenge').value,testDurationMs=Math.max(1,Math.min(600,Number($('dev-duration').value)||30))*1000;ensureActive();save();forceClose();nextOffer({challenge,testDurationMs});break;}
 case 'dev-challenge-win':{ensureActive();const c=run.activeChallenge;if(!c){toast(L('Accept a challenge first.','请先接受挑战。'));break;}if(c.metric==='streak')c.progress=3;else run.cash=moneyInt(run.cash+Math.max(0,c.target-netWorth(run)));const event=checkChallenge(run);devChanged();forceClose();if(event)showChallengeResult(event);break;}
 case 'dev-challenge-expire':{ensureActive();const c=run.activeChallenge;if(!c){toast(L('Accept a challenge first.','请先接受挑战。'));break;}const event=advanceTime(run,c.remainingMs);devChanged();forceClose();if(run.ended&&!lifeUI?.hasPendingDeath())showGameOver();else if(event)showChallengeResult(event);break;}
 case 'dev-shop':ensureActive();save();forceClose();nextOffer({shop:true});break;
 case 'dev-asset-next':{const asset=$('dev-asset').value;ensureActive();save();forceClose();nextOffer({asset});break;}
 case 'dev-asset-grant':{const id=$('dev-asset').value;ensureActive();if(!run.assets.includes(id))run.assets.push(id);devChanged();showDeveloper();break;}
 case 'dev-all':ensureActive();run.assets=ASSETS.map(x=>x.id);run.outfits=OUTFITS.map(x=>x.id);run.equipped='sovereign';devChanged();showDeveloper();break;
 case 'dev-tycoon':ensureActive();run.cash=125000000000;run.assets=['studio-loft','palace','tower','castle','spaceport'];run.outfits=['plain','sovereign'];run.equipped='sovereign';run.page=1286;run.offer={...makeOffer(run,{asset:'palace'}),settled:true};run.activeChallenge=null;pendingChallenge=[];run.lastResult=null;devChanged();world.setOffer(run.offer);forceClose();renderDock();discover();break;
 case 'dev-result-set':{const value=$('dev-result').value;if(value==='random')dev.force=null;else{ensureActive();dev.force=value;devChanged();}showDeveloper();toast(L('Result override updated.','结果控制已更新。'));break;}
 case 'dev-bankrupt':ensureActive();bankrupt(run);save();forceClose();showGameOver();break;
 case 'dev-odds':{if(!['project','special'].includes(run.offer.type)){toast(L('Discover an investment first.','请先遇到投资项目。'));break;}const p=Number($('dev-prob').value),up=Number($('dev-mult').value);if(!Number.isInteger(p)||p<1||p>99||!Number.isFinite(up)||up<1||up>20){toast(L('Use probability 1–99 and multiplier 1–20.','概率为 1–99，倍率为 1–20。'));break;}ensureActive();Object.assign(run.offer,{p,up,down:0,settled:false,stages:null,complex:run.offer.complex==='dual'?null:run.offer.complex});run.lastResult=null;devChanged();showDeveloper();break;}
 case 'dev-simulate':{if(!['project','special'].includes(run.offer.type)){toast(L('Discover an investment first.','请先遇到投资项目。'));break;}const nums=crypto.getRandomValues(new Uint32Array(10000)),q=quote(run,Math.max(1,Math.min(stake,run.cash)));let wins=0,total=0;for(const n of nums){const win=n/4294967296<run.offer.p/100;if(win)wins++;total+=win?q.cashIfWin:q.cashIfLose;}devOutput=L('10,000 read-only rolls. No money changed.\n','只读模拟 10,000 次，不改变资金。\n')+`Wins: ${wins} / 10000 (${(wins/100).toFixed(2)}%)\nMean cash after: ${money(total/10000,true)}\nRisk scope: ${q.scope}\nStake: ${money(q.stake,true)}`;$('dev-output').textContent=devOutput;break;}
 case 'dev-bots-add':meta.bots=createBots(Math.max(0,Math.min(100,Number($('dev-bots').value)||0)),crypto.getRandomValues(new Uint32Array(1))[0]);save();showLeaderboard('local');break;
 case 'dev-bots-clear':meta.bots=[];save();showDeveloper();break;
 case 'dev-rate-set':ensureActive();dev.assetRate=Number($('dev-rate').value)/100;devChanged();toast(L('Building encounter rate updated for this TEST run.','本次测试局的建筑出现概率已修改。'));break;
 case 'dev-clean':confirmDialog(L('Start a clean new run?','开启纯净新局？'),L('All cosmetics and active challenges reset. Debug odds and outcome overrides are cleared.','清空装饰与当前挑战，重置调试概率及强制结果。'),restart);break;
 case 'dev-export':{const blob=new Blob([JSON.stringify({version:2,run,meta:{lang:meta.lang,name:meta.name}},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='upshift-v3-save.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1800);break;}
 case 'dev-import':$('import-file').click();break;
 case 'dev-diagnostics':devOutput=JSON.stringify({version:'3.1.0',cash:run.cash/100,peak:run.peak/100,netWorth:netWorth(run)/100,stop:run.page,unranked:run.unranked,activeChallenge:run.activeChallenge,offer:run.offer.type,music:music.status(),renderer:{drawCalls:world.renderer?.info.render.calls,triangles:world.renderer?.info.render.triangles,geometries:world.renderer?.info.memory.geometries,textures:world.renderer?.info.memory.textures,fps:Math.round(world.fps||0)},platform:platform.status,storage:platform.storageMode},null,2);$('dev-output').textContent=devOutput;break;
 }
});
document.addEventListener('input',e=>{
 if(e.target.id==='stake-range'){updateStake(Math.max(1,Math.floor(run.cash*Number(e.target.value)/1000)),'range');$('slider-wrap').classList.add('active');}
 if(e.target.id==='stake-input'){if(e.target.validity.stepMismatch)$('primary-action').disabled=true;else updateStake(Math.round(Number(e.target.value)*100),'input');}
 if(e.target.id==='music-volume'){meta.volume=Number(e.target.value)/100;music.setVolume(meta.volume);$('volume-value').textContent=e.target.value+'%';}
 if(e.target.id==='ui-scale-slider'){meta.scale=Number(e.target.value)/100;preferences();fitDock();world.resize();const lbl=$('ui-scale-value');if(lbl)lbl.textContent=e.target.value+'%';}
 if(e.target.id==='dev-rate')$('dev-rate-value').textContent=e.target.value+'%';
});
document.addEventListener('change',async e=>{
 if(e.target.id==='backup-file'){
  const file=e.target.files?.[0];if(!file)return;
  try{if(file.size>512000)throw Error('备份超过 500 KB');const data=JSON.parse(await file.text());if(!data.run||!data.run.id)throw Error('缺少有效游戏进度');const restored=validateRun(data.run,{imported:true}),restoredMeta=normalizeMeta(data.meta||{});
   confirmDialog('用这份备份替换当前旅程？','建议先导出当前存档。确认后将载入第 '+restored.page+' 站，现金 '+money(restored.cash)+'。',()=>{run=restored;meta=restoredMeta;lifeUI.loaded();pendingChallenge=[];visit=null;busy=false;forceClose();world.setOffer(run.offer);world.setLanguage(meta.lang);applyLayout(meta);preferences();refreshStyle();renderHud();renderDock();save();toast('备份已恢复。');if(run.ended&&!lifeUI.hasPendingDeath())showGameOver();});
  }catch(err){toast('未导入：'+err.message+'。当前存档未改变。');}return;
 }

 if(e.target.id==='stake-range')setTimeout(()=>$('slider-wrap')?.classList.remove('active'),500);
 if(e.target.id==='music-volume'||e.target.id==='ui-scale-slider')save();
 if(e.target.id==='dev-speed'){dev.speed=Number(e.target.value);world.speed=dev.speed;if(dev.speed!==1){ensureActive();devChanged();}}
 if(e.target.id==='import-file'){const file=e.target.files?.[0];if(!file)return;try{if(file.size>512000)throw Error('Too large');const json=JSON.parse(await file.text());run=validateRun(json.run||json,{imported:true});lifeUI.loaded();Object.assign(dev,{force:null,...DEFAULT_RATES,speed:1});pendingChallenge=[];visit=null;devChanged();world.setOffer(run.offer);forceClose();renderHud();renderDock();if(run.ended&&!lifeUI?.hasPendingDeath())showGameOver();toast(L('Imported as a TEST run.','已作为 TEST 测试局导入。'));}catch{toast(L('Invalid v2/v3 save. Your current run is unchanged.','无效 v2/v3 存档，当前进度未改变。'));}}
});
document.addEventListener('pointerdown',()=>{music.unlock();effects.unlock();},{passive:true});
$('game').addEventListener('pointerdown',e=>{if(!started||e.button!==0||busy||modalType||run.ended||run.life?.rest||run.life?.travel||e.target.closest('button,input,select,textarea,label,summary,details,.game-dock,.city-panorama,.project-context,.ui-tools,.world-person'))return;swipe={id:e.pointerId,x:e.clientX,y:e.clientY,start:performance.now(),dx:0};(()=>{try{$("game").setPointerCapture(e.pointerId)}catch{}})();});
$('game').addEventListener('pointermove',e=>{if(!swipe||e.pointerId!==swipe.id)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;if(dx>5&&Math.abs(dx)>Math.abs(dy)){swipe.dx=dx;world.setDrag(Math.min(1.3,dx/130));e.preventDefault();}});
$('game').addEventListener('pointerup',e=>{if(!swipe||e.pointerId!==swipe.id)return;const s=swipe;swipe=null;world.setDrag(0);if(s.dx>52||(s.dx>24&&s.dx/(performance.now()-s.start)>.5))nextOffer();});
$('game').addEventListener('pointercancel',()=>{swipe=null;world.setDrag(0);});
$('swipe-surface').addEventListener('wheel',e=>{if(e.ctrlKey||modalType||busy)return;if(e.deltaX>25||e.deltaY>40){e.preventDefault();if(performance.now()-lastWheel>800){lastWheel=performance.now();nextOffer();}}},{passive:false});
$('modal').addEventListener('click',e=>{if(e.target!==$('modal'))return;if(!CASUAL_MODALS.has(modalType)){nudgeModal();return;}closeModal();});
document.addEventListener('keydown',e=>{
 if(adPlaying||!started)return;
 if(!e.ctrlKey&&!e.metaKey&&!e.altKey){music.unlock();effects.unlock();}
 if(e.key==='Tab'&&modalType){const list=[...$('modal-card').querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')].filter(x=>x.offsetParent!==null&&!x.hidden);if(list.length){if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===list.at(-1)){e.preventDefault();list[0].focus();}}return;}
 if(e.key==='Escape'){e.preventDefault();if(!CASUAL_MODALS.has(modalType)){nudgeModal();return;}closeModal();return;}
 if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,select,textarea'))return;
 if(e.key==='`'&&CONFIG.allowDeveloperMode){e.preventDefault();if(modalType==='developer')closeModal();else showDeveloper();return;}
 if(modalType||busy||e.repeat)return;
 if(e.key==='ArrowRight'){e.preventDefault();nextOffer();}
 if(e.key==='Enter'&&!e.target.closest('button')){e.preventDefault();if(visit){visit=null;world.setOffer(run.offer);renderDock();return;}if(run.offer.settled)nextOffer();else if(['project','special'].includes(run.offer.type))doInvest();else if(run.offer.type==='challenge')startChallenge();else if(run.offer.type==='asset')buyAsset();}
});
document.addEventListener('visibilitychange',()=>{lastClock=performance.now();effects.muted=platform.muted||document.hidden||adPlaying;music.setHidden(document.hidden);world.last=performance.now();if(document.hidden)save();});
window.addEventListener('pagehide',()=>{clock();save();});
platform.onSettings=settings=>{effects.muted=!!settings.muteAudio||document.hidden||adPlaying;music.setMuted(!!settings.muteAudio||adPlaying);renderHud();renderMusicStatus();};
platform.onAdState=value=>{adPlaying=value;effects.muted=value||platform.muted;music.setMuted(value||platform.muted);lastClock=performance.now();world.paused=value||!!modalType||!started||!!run.life?.rest;world.sceneSuspended=value||!!modalType||!started;};
platform.onAuth=()=>{try{const data=JSON.parse(platform.load(SAVE_KEY)||'null');const keep=meta.introLang||sessionLang?meta.lang:null;run=data?.run?validateRun(data.run):newRun();const nm=normalizeMeta(data?.meta||{});for(const k of Object.keys(meta))delete meta[k];Object.assign(meta,nm);if(keep){meta.lang=keep;meta.introLang=true;}}catch{run=newRun();}lifeUI.loaded();busy=false;pendingChallenge=[];visit=null;dev.force=null;$('game').classList.remove('travelling');world.setLanguage(meta.lang);world.setOffer(run.offer);forceClose();preferences();refreshStyle();renderHud();renderDock();if(run.ended&&!lifeUI?.hasPendingDeath())showGameOver();toast(L('Account progress loaded.','账号进度已载入。'));};
if(CONFIG.allowDeveloperMode)window.upshift=Object.freeze({version:'3.1.0',snapshot:()=>JSON.parse(JSON.stringify({run,meta,dev,busy,music:music.status(),platform:{status:platform.status,storage:platform.storageMode}})),openDeveloper:showDeveloper});
if(!run.ended)pendingChallenge=run.challengeLog.filter(e=>!e.seen&&e.reason!=='bankruptcy').slice().reverse();
lifeUI=new LifeUI({cash:(c,el)=>cashFlow.play(c,el),run:()=>run,meta:()=>meta,modal:()=>modalType,busy:()=>busy,motion:()=>meta.motion,onDeath:showGameOver,started:()=>started,confirm:confirmDialog,visiting:()=>!!visit,save,refresh:()=>{refreshStyle();renderHud();pause();},renderDock,fit:fitDock,toast,world,platform,open:openModal,close:forceClose,next:nextOffer,invest:doInvest,buyOutfit,outfit:getOutfit,devEnabled:()=>!!CONFIG.allowDeveloperMode});
designUI=installRedesign({run:()=>run,meta:()=>meta,world});streetUI=new StreetUI({cash:(c,el)=>cashFlow.play(c,el),run:()=>run,started:()=>started,modal:()=>modalType,busy:()=>busy,world,save,fit:fitDock,refresh:()=>{refreshStyle();renderHud();renderDock();},open:openModal,close:forceClose,confirm:confirmDialog,toast});prosperityUI=new ProsperityUI({run:()=>run,started:()=>started,motion:()=>meta.motion,blocked:()=>busy||!!modalType||adPlaying||!!run.life.rest||!!run.life.travel,unlock:checkMilestoneCelebration,feedback:up=>{effects.tone(up?'rare':'loss',4);if(up){const r=$('game').getBoundingClientRect();effects.burst(r.width*.45,170,6,'#dbbb66');world.celebrate();}}});v9=new V9({run:()=>run,meta:()=>meta,started:()=>started,modal:()=>modalType,busy:()=>busy,motion:()=>meta.motion,save,toast,open:openModal,close:forceClose,refresh:()=>{refreshStyle();renderHud();},renderDock,fit:fitDock,cash:(c,el)=>cashFlow.play(c,el),effects,world,money:c=>money(c,true),next:()=>{busy=false;nextOffer();},death:()=>{endLife(run,'健康耗尽');save();showGameOver();}});v7=new V7({confirm:confirmDialog,fit:fitDock,run:()=>run,started:()=>started,motion:()=>meta.motion,save,toast,music,modal:()=>modalType,busy:()=>busy,refresh:()=>{refreshStyle();renderHud();},renderDock,open:openModal,close:forceClose,cash:(c,el)=>cashFlow.play(c,el),world,effects});preferences();refreshStyle();renderHud();renderDock();save();platform.ready();platform.context(run);pause();$('loading')?.remove();onboarding=new Onboarding({run:()=>run,meta:()=>meta,world,save,legacyOpen:()=>lifeUI.openLegacy(true),legacyBuy:id=>lifeUI.purchasePerk(id),legacySkin:id=>lifeUI.chooseSkin(id),close:forceClose,unlock:()=>{music.unlock();effects.unlock();},block:value=>{started=!value;pause();},enter:()=>{renderHud();renderDock();world.resize();pause();if(run.ended&&!lifeUI?.hasPendingDeath())showGameOver();}});runIntro({meta,save,motion:meta.motion,done:()=>{renderHud();renderDock();onboarding.show();}});requestAnimationFrame(pulseClock);setInterval(renderMusicStatus,900);
if(platform.storageMode==='session')setTimeout(()=>toast(L('Preview mode: progress lasts for this session.','预览模式：进度仅保存在本次会话。')),1700);
}
main().catch(error=>{console.error(error);const loading=document.getElementById('loading');if(loading)loading.innerHTML='<div><strong>Broke to Billionaire</strong><small>Loading was interrupted. Reload to try again.</small></div>';});
