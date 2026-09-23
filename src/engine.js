import {worth,ensureEstate,endLife,streetEvent} from './endgame-core.js';
import {DISTRICTS,districtOffer,LOCAL_PROJECTS} from './city-content.js';
import {initLife,markLife,goodsValue,decorateOffer,useEnergy,assertFree,stakeBounds,owns,ITEMS,eligible} from './life-core.js';
import {RARITIES,PROJECTS,ASSETS,OUTFITS,TIERS,SPECIALS,CHALLENGES,getAsset,getOutfit,getSpecial,getChallenge} from './catalog.js';
export const VERSION=2;
export const MAX_CENTS=900000000000000;
export const DEFAULT_RATES={assetRate:.04,shopRate:.06,challengeRate:.08,specialRate:0};
export const moneyInt=n=>Math.max(0,Math.min(MAX_CENTS,Math.floor(Number(n)||0)));
export function random(){const x=new Uint32Array(1);globalThis.crypto.getRandomValues(x);return x[0]/4294967296;}
export function weighted(items,rng=random){let n=rng()*items.reduce((s,x)=>s+x.weight,0);return items.find(x=>(n-=x.weight)<0)||items.at(-1);}
const range=(a,b,rng)=>a+rng()*(b-a);
const choose=(items,rng)=>items[Math.min(items.length-1,Math.floor(rng()*items.length))];
const uid=()=>globalThis.crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
export const payout=(stake,mult)=>moneyInt(Math.floor(stake*mult+1e-7));
export function newRun(runNumber=1){const s={version:VERSION,id:uid(),runNumber,cash:10000,peak:10000,page:1,investments:0,wins:0,streak:0,assets:[],outfits:['plain'],equipped:'plain',ended:false,unranked:false,history:[],challengeLog:[],activeChallenge:null,playedMs:0,created:Date.now(),offer:{id:uid(),type:'project',project:'coffee',rarity:'common',grade:'street',minStake:1,maxStake:50000,city:'taipei',localName:'巷口手冲咖啡',p:75,up:1.8,down:0,settled:false},lastResult:null};initLife(s);const first=LOCAL_PROJECTS.taipei[0];Object.assign(s.offer,{down:0,project:first.project,localId:first.id,localName:first.name,localModel:first.model,culture:first.culture,category:first.category,p:first.p,up:first.up});return s;}
export function assetValue(s){return goodsValue(s)+(s.offer?.pendingStake||0)+s.assets.reduce((n,id)=>n+(getAsset(id)?.price||0)*100,0)+s.outfits.reduce((n,id)=>n+getOutfit(id).price*100,0);}
export function netWorth(s){return worth(s);}
export function tier(s){const worth=netWorth(s)/100;return TIERS.reduce((n,t,i)=>worth>=t.at?i:n,0);}
export function prestige(s){return Math.max(0,...s.assets.map(id=>getAsset(id)?.tier||0));}
export function markPeak(s){s.peak=Math.max(s.peak,netWorth(s));markLife(s);}
function projectOffer(rarity,project,rng){const r=RARITIES.find(x=>x.id===rarity)||weighted(RARITIES,rng);const p=PROJECTS.find(x=>x.id===project)||choose(PROJECTS,rng);return {id:uid(),type:'project',project:p.id,rarity:r.id,p:Math.round(range(...r.p,rng)),up:Math.round(range(...r.up,rng)*100)/100,down:0,settled:false};}
function assetOffer(s,id,rng){let list=ASSETS.filter(a=>!s.assets.includes(a.id));if(id){if(!getAsset(id))throw Error('Unknown asset');return {id:uid(),type:'asset',asset:id,settled:false};}const affordable=list.filter(a=>a.price*100<s.cash*1.4);if(affordable.length&&rng()<.8)list=affordable;return list.length?{id:uid(),type:'asset',asset:choose(list,rng).id,settled:false}:null;}
function shopOffer(s,rng){let list=OUTFITS.filter(o=>o.id!=='plain'&&!s.outfits.includes(o.id));if(!list.length)return null;const affordable=list.filter(o=>o.price*100<s.cash);const first=choose(affordable.length?affordable:list,rng);const items=[first.id];list=list.filter(o=>o.id!==first.id);while(items.length<3&&list.length){const o=choose(list,rng);items.push(o.id);list=list.filter(x=>x.id!==o.id);}items.sort((a,b)=>getOutfit(a).price-getOutfit(b).price);return {id:uid(),type:'shop',items,settled:false};}
function specialOffer(id,rng){const c=id?SPECIALS.find(x=>x.id===id):choose(SPECIALS,rng);if(!c)throw Error('Unknown special');return {id:uid(),type:'special',special:c.id,project:c.scene,rarity:c.rarity,p:c.p,up:c.up,down:0,lossScope:c.lossScope,ratio:c.ratio,settled:false};}
function challengeOffer(s,id,rng){const c=id?CHALLENGES.find(x=>x.id===id):choose(CHALLENGES,rng);if(!c)throw Error('Unknown challenge');const base=netWorth(s),cash=s.cash;return {id:uid(),type:'challenge',challenge:c.id,project:c.scene,rarity:'epic',metric:c.metric,durationMs:c.seconds*1000,target:c.metric==='streak'?3:Math.min(MAX_CENTS,Math.max(base+1,Math.ceil(base*c.targetFactor))),reward:Math.max(1,moneyInt(cash*c.rewardFactor)),penalty:Math.max(1,moneyInt(cash*c.penaltyFactor)),minStake:c.metric==='streak'?Math.max(1,moneyInt(cash*.15)):0,settled:false};}
function makeBaseOffer(s,options={},rng=random){
 const opts={...DEFAULT_RATES,...options};
 if(opts.asset)return assetOffer(s,opts.asset,rng);
 if(opts.shop)return shopOffer(s,rng)||projectOffer(null,null,rng);
 if(opts.special)return specialOffer(opts.special,rng);
 if(opts.challenge)return challengeOffer(s,opts.challenge,rng);
 if(opts.rarity||opts.project)return projectOffer(opts.rarity,opts.project,rng);
 if(s.page>=3&&worth(s)>=50000){let r=rng();if(r<opts.assetRate&&s.page>=5){const a=assetOffer(s,null,rng);if(a)return a;}r-=opts.assetRate;
  if(r>=0&&r<opts.shopRate){const shop=shopOffer(s,rng);if(shop)return shop;}r-=opts.shopRate;
  if(r>=0&&r<opts.challengeRate&&!s.activeChallenge&&worth(s)>=500000)return challengeOffer(s,null,rng);r-=opts.challengeRate;
  if(r>=0&&r<opts.specialRate&&worth(s)>=500000)return specialOffer(null,rng);
 }
 return projectOffer(null,null,rng);
}
export function makeOffer(s,options={},rng=random){
 if(!s.life)initLife(s);markLife(s);
 const forced=!!(options.project||options.rarity||options.asset||options.shop||options.special||options.challenge);
 let o;
 if(!forced&&s.life.district)return districtOffer(s,rng);
 if(!forced){const encounter=streetEvent(s,rng);if(encounter)return encounter;}
 if(!forced&&!s.activeChallenge&&s.page>3&&s.life.energy>25&&rng()<.045)return {id:uid(),type:'district-gate',city:s.life.city,district:s.life.city,rarity:'epic',settled:false};
 if(!forced&&!s.activeChallenge&&s.page>2&&rng()<.06)return {id:uid(),type:'interlude',city:s.life.city,scene:rng()<.5?'bridge':['waterfront','park','alley'][Math.floor(rng()*3)],rarity:'common',settled:false};
 if(!forced&&worth(s)>=50000&&rng()<.13&&ITEMS.some(i=>!owns(s,i.id)&&eligible(s,i)&&(!i.city||i.city===s.life.city))){o=shopOffer(s,rng)||{id:uid(),type:'shop',items:['plain'],settled:false};}

 else o=makeBaseOffer(s,options,rng);
 return decorateOffer(s,o,rng,forced);
}
export function next(s,opts={},rng=random){assertFree(s);if(s.offer.pendingStake)throw Error('请先完成交割。');if(s.life.energy<=0)throw Error('体力耗尽，请进入假期。');useEnergy(s,5);s.life.steps=(s.life.steps||0)+1;if(s.ended)throw Error('Run ended');s.page++;s.offer=makeOffer(s,opts,rng);s.lastResult=null;return s.offer;}
export function requiredStake(s){return s.offer.type==='special'?Math.max(1,Math.floor(s.cash*s.offer.ratio)):null;}
export function quote(s,stake){
 const o=s.offer;if(!['project','special'].includes(o.type))throw Error('Not an investment');
 const amount=o.type==='special'?requiredStake(s):stake;
 const all=o.type==='special'&&o.lossScope==='wallet';
 return {stake:amount,returned:payout(amount,o.up),profit:payout(amount,o.up)-amount,loss:all?s.cash:amount,scope:all?'wallet':'stake',cashIfWin:moneyInt(s.cash-amount+payout(amount,o.up)),cashIfLose:all?0:Math.max(0,s.cash-amount)};
}
export function invest(s,stake,{force=null,rng=random}={}){
 assertFree(s);if(s.ended||!['project','special'].includes(s.offer.type)||s.offer.settled)throw Error('Offer unavailable');
 const pending=s.offer.pendingStake;
 if(pending){if(Date.now()<s.offer.readyAt)throw Error('请等待交割倒计时。');stake=pending;rng=()=>s.offer.pendingWon?0:.999999;s.cash=moneyInt(s.cash+pending);}
 if(!Number.isSafeInteger(stake)||stake<1||stake>s.cash)throw Error('Invalid stake');
 if(!pending&&s.life.energy<=0)throw Error('体力耗尽，下一阶段必须休息。');
 if(s.offer.type==='project'){const b=stakeBounds(s);if(stake<b.min||stake>b.max)throw Error('投入不在项目允许的范围内。');}
 if(s.offer.delay&&!pending){s.offer.pendingStake=stake;s.offer.pendingWon=force==='win'?true:force==='lose'?false:rng()<s.offer.p/100;s.offer.readyAt=Date.now()+s.offer.delay;s.cash-=stake;useEnergy(s,3);if(force)s.unranked=true;return {pending:true};}
 if(!pending)useEnergy(s,3);
 if(s.offer.type==='special'&&stake!==requiredStake(s))throw Error('This contract requires a fixed stake');
 if(force)s.unranked=true;
 const o=s.offer,before=s.cash,q=quote(s,stake);const won=pending?!!o.pendingWon:force==='win'?true:force==='lose'?false:o.stages?o.stages.every(p=>rng()<p/100):rng()<o.p/100;delete o.pendingStake;delete o.pendingWon;delete o.readyAt;
 s.cash=won?q.cashIfWin:q.cashIfLose;s.investments++;s.wins+=won?1:0;s.streak=won?s.streak+1:0;
 o.settled=true;
 const result={won,multiplier:won?o.up:0,stake,returned:won?q.returned:0,profit:s.cash-before,cashAfterBet:s.cash,lossScope:q.scope,page:s.page,project:o.project,special:o.special||null,rarity:o.rarity};
 s.lastResult=result;s.history.unshift({...result,at:Date.now()});s.history=s.history.slice(0,40);markPeak(s);
 if(s.cash===0){bankrupt(s);return result;}
 const a=s.activeChallenge;if(a&&a.metric==='streak'){if(!won)a.progress=0;else if(stake>=a.minStake)a.progress++;}
 result.challenge=checkChallenge(s);return result;
}
export function acceptChallenge(s){assertFree(s);
 if(s.ended||s.offer.type!=='challenge'||s.offer.settled||s.activeChallenge)throw Error('Challenge unavailable');
 const o=s.offer;
 if(o.metric==='wealth'&&o.target<=netWorth(s))throw Error('Target already reached; find a new challenge');
 s.activeChallenge={id:o.id,kind:o.challenge,metric:o.metric,target:o.target,reward:o.reward,penalty:o.penalty,minStake:o.minStake,durationMs:o.durationMs,remainingMs:o.durationMs,progress:0,acceptedPage:s.page};
 o.settled=true;return s.activeChallenge;
}
function finishChallenge(s,won,reason){
 const a=s.activeChallenge;if(!a)return null;s.activeChallenge=null;
 const before=s.cash;s.cash=won?moneyInt(s.cash+a.reward):Math.max(0,s.cash-a.penalty);
 const event={id:a.id,kind:a.kind,won,reason,delta:s.cash-before,quotedReward:a.reward,quotedPenalty:a.penalty,target:a.target,metric:a.metric,page:s.page,remainingMs:a.remainingMs,at:Date.now()};
 s.challengeLog.unshift(event);s.challengeLog=s.challengeLog.slice(0,12);markPeak(s);
 if(s.cash===0)bankrupt(s);return event;
}
export function checkChallenge(s){const a=s.activeChallenge;if(!a||s.ended)return null;if(a.remainingMs<=0)return finishChallenge(s,false,'deadline');const reached=a.metric==='streak'?a.progress>=a.target:netWorth(s)>=a.target;return reached?finishChallenge(s,true,'target'):null;}
export function advanceTime(s,elapsedMs){
 if(s.ended||!Number.isFinite(elapsedMs)||elapsedMs<0)return null;
 s.playedMs+=elapsedMs;const a=s.activeChallenge;if(!a)return null;
 a.remainingMs=Math.max(0,a.remainingMs-elapsedMs);return checkChallenge(s);
}
export function purchaseAsset(s,id){assertFree(s);const a=getAsset(id);if(s.ended||!a||s.offer.type!=='asset'||s.offer.asset!==id||s.offer.settled||s.assets.includes(id)||s.cash<a.price*100)throw Error('Purchase unavailable');s.cash-=a.price*100;useEnergy(s,2);s.assets.push(id);s.offer.settled=true;markPeak(s);if(s.cash===0)bankrupt(s);return a;}
export function purchaseOutfit(s,id){assertFree(s);
 const o=OUTFITS.find(x=>x.id===id);if(s.ended||!o)throw Error('Outfit unavailable');
 if(!s.outfits.includes(id)){
  if(s.offer.type!=='shop'||!s.offer.items.includes(id))throw Error('Find a street shop to buy this outfit');
  if(s.cash<o.price*100)throw Error('Not enough cash');s.cash-=o.price*100;useEnergy(s,2);s.outfits.push(id);
 }
 s.equipped=id;markPeak(s);if(s.cash===0)bankrupt(s);return o;
}
export function bankrupt(s){endLife(s,'现金耗尽，财务破产');s.cash=0;if(s.activeChallenge)finishChallenge(s,false,'bankruptcy');s.assets=[];s.outfits=['plain'];s.equipped='plain';s.ended=true;s.streak=0;delete s.offer.pendingStake;delete s.offer.pendingWon;delete s.offer.readyAt;if(s.life){s.life.items=[];s.life.rest=null;s.life.travel=null;s.life.district=null;}}
export function validateRun(input,{imported=false}={}){
 if(!input||input.version!==VERSION||!Number.isSafeInteger(input.cash)||input.cash<0||input.cash>MAX_CENTS||!input.offer)throw Error('Invalid v2 save');
 const s=newRun();Object.assign(s,input);initLife(s);s.id=String(input.id||s.id).slice(0,80);
 if(!Array.isArray(input.assets)||!Array.isArray(input.outfits))throw Error('Invalid ownership');
 s.assets=[...new Set(input.assets.filter(id=>ASSETS.some(a=>a.id===id)))];s.outfits=[...new Set(['plain',...input.outfits.filter(id=>OUTFITS.some(a=>a.id===id))])];s.equipped=s.outfits.includes(input.equipped)?input.equipped:'plain';
 for(const k of ['peak','page','investments','wins','streak','runNumber','playedMs'])s[k]=moneyInt(input[k]||0);
 s.page=Math.max(1,s.page);s.runNumber=Math.max(1,s.runNumber);s.unranked=!!input.unranked||imported;s.ended=!!input.ended;
 s.history=Array.isArray(input.history)?input.history.slice(0,40).filter(h=>Number.isFinite(h.profit)&&typeof h.project==='string'):[];s.challengeLog=Array.isArray(input.challengeLog)?input.challengeLog.slice(0,12).filter(h=>Number.isFinite(h.delta)&&CHALLENGES.some(c=>c.id===h.kind)):[];
 const o=s.offer;
 if(o.type==='project'){o.minStake=moneyInt(o.minStake||1);o.maxStake=moneyInt(o.maxStake||50000);o.grade=o.grade||'street';if(o.minStake<1||o.minStake>o.maxStake)throw Error('Invalid limits');if(o.stages&&(!Array.isArray(o.stages)||o.stages.length!==2||o.stages.some(p=>!Number.isInteger(p)||p<1||p>99)||Math.abs(o.p-o.stages[0]*o.stages[1]/100)>.0001))throw Error('Invalid stages');}
 if(o.type==='shop')o.utilities=(Array.isArray(o.utilities)?o.utilities:[]).filter(id=>ITEMS.some(i=>i.id===id)).slice(0,3);
 if(['project','special'].includes(o.type)){
  if(!PROJECTS.some(p=>p.id===o.project)||!RARITIES.some(r=>r.id===o.rarity)||!Number.isFinite(o.p)||o.p<1||o.p>99||!Number.isFinite(o.up)||o.up<1||o.up>20||o.down!==0)throw Error('Invalid outcome');
  if(o.type==='special'){const c=SPECIALS.find(c=>c.id===o.special);if(!c||o.ratio!==c.ratio||o.lossScope!==c.lossScope)throw Error('Invalid special contract');}
 }else if(o.type==='asset'){if(!getAsset(o.asset))throw Error('Invalid asset');}
 else if(o.type==='shop'){if(!Array.isArray(o.items)||o.items.length<1||o.items.length>3||o.items.some(id=>!OUTFITS.some(c=>c.id===id)))throw Error('Invalid shop');}
 else if(o.type==='challenge'){if(!CHALLENGES.some(c=>c.id===o.challenge)||!['wealth','streak'].includes(o.metric))throw Error('Invalid challenge');for(const k of ['durationMs','target','reward','penalty','minStake'])if(!Number.isFinite(o[k])||o[k]<0)throw Error('Invalid challenge terms');}
 else if(['district-gate','district-task'].includes(o.type)){if(!DISTRICTS[o.district]||o.city!==s.life.city)throw Error('Invalid district');if(o.type==='district-task'&&(!Number.isInteger(o.task)||o.task<0||o.task>=DISTRICTS[o.district].tasks.length||!s.life.district))throw Error('Invalid district task');}
 else if(o.type==='world-event'){if(!s.estate.queue.some(e=>e.id===o.eventId))throw Error('Missing event');}
 else if(o.type==='interlude'){if(!['bridge','waterfront','park','alley'].includes(o.scene))throw Error('Invalid interlude');}
 else throw Error('Invalid offer');o.settled=!!o.settled;
 if(s.activeChallenge){const a=s.activeChallenge;if(!CHALLENGES.some(c=>c.id===a.kind)||!['wealth','streak'].includes(a.metric))throw Error('Invalid active challenge');for(const k of ['durationMs','remainingMs','target','reward','penalty','minStake','progress'])if(!Number.isFinite(a[k])||a[k]<0||a[k]>MAX_CENTS)throw Error('Invalid active challenge');if(a.remainingMs>a.durationMs||a.durationMs>600000)throw Error('Invalid timer');}
 if(s.lastResult&&(!Number.isFinite(s.lastResult.profit)||!Number.isFinite(s.lastResult.returned)))s.lastResult=null;
 if(o.pendingStake&&(!Number.isSafeInteger(o.pendingStake)||o.pendingStake<1||o.pendingStake>MAX_CENTS||!Number.isFinite(o.readyAt)||typeof o.pendingWon!=='boolean'))throw Error('Invalid pending project');
 if(s.ended||(s.cash===0&&!o.pendingStake))bankrupt(s);markPeak(s);return s;
}
export function createBots(count=10,seed=1337){let n=seed>>>0;const rng=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};const first=['Mellow','Mint','Orbit','Velvet','Lucky','Tiny','Solar','Pixel','Cloud','Golden','Quiet','Silver','Neon','Indigo','Brave'];const second=['Fox','Atlas','Mango','Panda','Otter','Kiwi','Comet','Ghost','Crane','Bear','Voyager','Finch'];return Array.from({length:Math.max(0,Math.min(100,count|0))},(_,i)=>({id:`sim-${seed}-${i}`,name:first[Math.floor(rng()*first.length)]+second[Math.floor(rng()*second.length)]+String(i+1).padStart(2,'0'),peak:moneyInt(10**(2+rng()*10)),page:Math.ceil(rng()*3000),simulated:true,tier:Math.floor(rng()*6)}));}
