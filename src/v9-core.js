// v9 core rules (pure state, integer cents). Card-deck journey, tap-to-earn work, special places,
// partners with side stories, once-per-run luxuries (LV points), main story per social class,
// liquid-money based rank (so a falling wallet really reclaims UI), fatigue + 3-heart health.
import {worth,TIERS_LATE} from './endgame-core.js';

const CAP=900000000000000;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
export const PROJECT_UNLOCK=300000; // $3,000 liquid — below this only work is available
export const PROJECT_MIN=200000; // every investment project asks at least $2,000

/* ---------- liquid money: cash + money locked in deals. Drives visual rank and mechanism gates ---------- */
export const liquid=s=>Math.max(0,Math.min(CAP,(s.cash||0)+(s.offer?.pendingStake||0)+((s.life?.v7?.delayed)||[]).reduce((n,d)=>n+(Number.isSafeInteger(d?.stake)?d.stake:0),0)));
export const liquidTier=s=>TIERS_LATE.reduce((i,t,j)=>liquid(s)>=t.at*100?j:i,0);
export function tierLabel(s,lang='zh'){const t=liquidTier(s),T=TIERS_LATE[t];const en=['Survival','Worker','Middle class','Affluent','Magnate','Private capital','Oligarch','Sovereign guest','Global dynasty','Cloud senate','Untouchable'][t];if(t===TIERS_LATE.length-1){const lv=Math.max(1,Math.floor(Math.log10(Math.max(1,liquid(s)/100/T.at)))+1);return (lang==='en'?en:T.name)+' Lv.'+lv;}return lang==='en'?en:T.name;}

export function st(s){const l=s.life;if(!l.v9||typeof l.v9!=='object')l.v9={};const v=l.v9;
 v.deck=v.deck&&Array.isArray(v.deck.cards)?v.deck:null;v.xp=Math.max(0,Math.floor(Number(v.xp)||0));
 v.partners=v.partners&&typeof v.partners==='object'?v.partners:{};v.lux=Array.isArray(v.lux)?v.lux:[];v.luxSeen=Array.isArray(v.luxSeen)?v.luxSeen:[];
 v.story=v.story&&typeof v.story==='object'?v.story:{};v.story.seen=Array.isArray(v.story.seen)?v.story.seen:[];v.story.picks=v.story.picks&&typeof v.story.picks==='object'?v.story.picks:{};
 v.heals=Math.max(0,Math.floor(Number(v.heals)||0));v.intel=Math.max(0,Math.floor(Number(v.intel)||0));v.debt=Math.max(0,Math.floor(Number(v.debt)||0));
 v.maxTier=Math.max(0,Math.floor(Number(v.maxTier)||0));return v;}

/* ---------- origins (chosen in the opening story) give each run a different flavour ---------- */
export const ORIGINS={
 night:{zh:'夜市长大的孩子',en:'Night-market kid',fx:{zh:'打工收入 +25%',en:'Work pay +25%'}},
 heir:{zh:'家道中落的二代',en:'Fallen heir',fx:{zh:'奢侈品 LV 点 +25%',en:'Luxury LV +25%'}},
 coder:{zh:'被裁员的工程师',en:'Laid-off engineer',fx:{zh:'投资成功率 +3%',en:'Project odds +3%'}},
 gambler:{zh:'赌徒的遗孤',en:"Gambler's orphan",fx:{zh:'赌场/对赌返还 +0.3',en:'Casino payouts +0.3'}}
};
export const origin=s=>st(s).story.picks.t0||null;

/* ---------- seasonal market mood: adds macro strategy (bull seasons reward bigger bets) ---------- */
export function mood(s){const v7=s.life?.v7||{};const k=((v7.year||1)*4+(v7.season||0))*2654435761>>>0;const m=[-6,-3,0,0,3,6][k%6];return {m,label:m>3?['牛市','Bull market']:m>0?['回暖','Warming']:m<-3?['熊市','Bear market']:m<0?['降温','Cooling']:['平稳','Steady']};}

/* ---------- zones = decks ---------- */
export const ZONES={
 work:{icon:'work',zh:'打工区',en:'Work Row',desc:['点点点赚辛苦钱，稳定但很累。','Tap-tap-tap for honest money.']},
 market:{icon:'invest',zh:'项目区',en:'Project Quarter',desc:['普通投资项目、街头故事和人脉。','Everyday deals, stories and contacts.'],at:PROJECT_UNLOCK},
 elite:{icon:'goldkey',zh:'高级项目区',en:'Elite Quarter',desc:['高门槛高回报，合伙人与奢侈品常出没。','High stakes, partners and luxuries.'],at:5000000},
 hospital:{icon:'hospital',zh:'医院',en:'Hospital',desc:['唯一能买回健康的地方——价格不菲。','The only place to buy back health. Pricey.'],place:true,at:0},
 casino:{icon:'chips',zh:'赌场',en:'Casino',desc:['全是对赌，赢要快，输更快。','All-in games. Win fast, lose faster.'],place:true,at:PROJECT_UNLOCK},
 pawn:{icon:'pawn',zh:'当铺黑市',en:'Pawn & Black Market',desc:['借钱、捡漏、买内幕。','Loans, bargains, insider tips.'],place:true,at:30000}
};
function buildDeck(s,zone,rng){const L=liquid(s),poor=L<PROJECT_UNLOCK;let c=[];
 if(zone==='work'){c=Array(poor?6:5).fill('work');c.push('event');if(!poor)c.push('project');}
 else if(zone==='market'){c=['project','project','project','project','project','work','event','event'];if(L>=500000)c.push('partner');if(L>=2000000&&rng()<.25)c.push('luxury');}
 else if(zone==='elite'){c=['elite','elite','elite','elite','project','event','partner'];if(rng()<.55)c.push('luxury');}
 else c=[zone,zone,zone];
 for(let i=c.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[c[i],c[j]]=[c[j],c[i]];}
 return {zone,cards:c,total:c.length,id:uid()};}
export function forkChoices(s,rng=Math.random){const L=liquid(s),out=[];
 if(L<50000000)out.push('work');if(L>=PROJECT_UNLOCK)out.push('market');if(L>=5000000&&rng()<.6)out.push('elite');
 const places=['hospital','casino','pawn'].filter(p=>L>=ZONES[p].at);if(places.length&&rng()<.45)out.push(places[Math.floor(rng()*places.length)]);
 if(out.length<2){const extra=['market','work','hospital'].find(z=>!out.includes(z)&&L>=(ZONES[z].at||0));if(extra)out.push(extra);}
 return out.slice(0,4);}
export function chooseZone(s,zone,rng=Math.random){const v=st(s);if(!ZONES[zone]||liquid(s)<(ZONES[zone].at||0))throw Error('zone locked');v.deck=buildDeck(s,zone,rng);if(s.offer?.type==='v9-fork')s.offer.settled=true;return v.deck;}

/* ---------- work jobs (tap mining) ---------- */
export const JOBS=[
 {id:'can',rank:0,zh:'捡瓶罐',en:'Collect cans',need:18,pay:3000},
 {id:'box',rank:0,zh:'搬纸箱',en:'Haul boxes',need:24,pay:4500},
 {id:'noodle',rank:0,zh:'泡面摊帮工',en:'Noodle stall shift',need:20,pay:3800},
 {id:'ticket',rank:0,zh:'发传单',en:'Hand out flyers',need:16,pay:2600},
 {id:'coffee',rank:1,zh:'咖啡店兼职',en:'Café shift',need:22,pay:7000},
 {id:'briefcase',rank:1,zh:'跑腿送文件',en:'Document runner',need:26,pay:9500},
 {id:'carkey',rank:1,zh:'夜间代驾',en:'Night chauffeur',need:30,pay:12000},
 {id:'steelwatch',rank:1,zh:'修表铺学徒',en:'Watch-repair apprentice',need:28,pay:11000}
];
export const WORK_ENERGY=6;
export function workOffer(s,rng){const r=liquid(s)>=50000?1:0;const list=JOBS.filter(j=>j.rank<=r&&(r===0||j.rank===1||rng()<.3));const j=list[Math.floor(rng()*list.length)]||JOBS[0];const v=st(s);
 let pay=Math.round(j.pay*(1+.04*Math.min(25,v.xp))*(origin(s)==='night'?1.25:1));if(liquidTier(s)>=2)pay=Math.max(pay,Math.floor(liquid(s)*.004));
 return {id:uid(),type:'v9-work',job:j.id,need:j.need,taps:0,pay,settled:false,city:s.life.city,rarity:'common'};}
export function finishWork(s){const o=s.offer;if(o.type!=='v9-work'||o.settled)throw Error('no job');if(s.life.energy<WORK_ENERGY)throw Error('energy');if(o.taps<o.need)throw Error('not done');
 s.life.energy=Math.max(0,s.life.energy-WORK_ENERGY);s.cash=Math.min(CAP,s.cash+o.pay);o.settled=true;st(s).xp++;s.peak=Math.max(s.peak||0,worth(s));return o.pay;}

/* ---------- special places ---------- */
export const PLACE_OPTS={
 hospital:[
  {id:'checkup',icon:'heart',zh:'全面体检疗程',en:'Full treatment',heal:1,costPct:.12,min:30000,desc:['恢复 1 格健康；每用一次价格翻倍。','Restore 1 heart. Price doubles each use.']},
  {id:'trial',icon:'story',zh:'临床试验志愿者',en:'Clinical trial volunteer',gainPct:.08,gainMin:20000,risk:40,desc:['立刻拿到报酬，但 40% 概率健康 −1。','Paid now, 40% chance to lose a heart.']},
  {id:'pharmacy',icon:'bolt',zh:'药房能量补给',en:'Pharmacy boost',energy:60,costPct:.03,min:2000,desc:['花 3% 现金，体力 +60。','Pay 3% cash for +60 energy.']},
  {id:'medtech',icon:'invest',zh:'医疗科技跟投',en:'Med-tech co-invest',stakePct:.25,p:58,up:2.2,desc:['投入 25% 现金。','Stake 25% of cash.']}],
 casino:[
  {id:'roulette',icon:'chips',zh:'轮盘押红',en:'Roulette: red',stakePct:.2,p:47,up:2,casino:true,desc:['投入 20% 现金。','Stake 20% of cash.']},
  {id:'slots',icon:'medal',zh:'老虎机',en:'Slot machine',stakePct:.05,p:11,up:8,casino:true,desc:['投入 5% 现金，小概率 ×8。','Stake 5%, small chance of ×8.']},
  {id:'poker',icon:'cards',zh:'德州一手',en:'One hand of poker',stakePct:.35,p:51,up:1.9,casino:true,desc:['投入 35% 现金。','Stake 35% of cash.']},
  {id:'vip',icon:'crown',zh:'贵宾厅豪赌',en:'VIP high roller',stakePct:.6,p:44,up:2.3,casino:true,at:10000000,desc:['投入 60% 现金。','Stake 60% of cash.']}],
 pawn:[
  {id:'loan',icon:'pawn',zh:'典当借款',en:'Pawn loan',loanPct:.25,desc:['现在拿 25% 现金，下次休息还 1.3 倍。','Get +25% cash now; repay ×1.3 at next rest.']},
  {id:'flip',icon:'goldkey',zh:'捡漏古董',en:'Antique bargain',stakePct:.3,p:40,up:2.8,desc:['投入 30% 现金，看眼力。','Stake 30%. Trust your eye.']},
  {id:'intel',icon:'story',zh:'买内幕消息',en:'Buy insider tips',costPct:.05,min:5000,intel:3,desc:['花 5% 现金：接下来 3 个项目成功率 +6%。','Pay 5%: next 3 projects +6% odds.']}]
};
function placeOffer(s,place,rng){const L=liquid(s);const pool=PLACE_OPTS[place].filter(o=>!o.at||L>=o.at);const pick=[...pool].sort(()=>rng()-.5).slice(0,2).map(o=>o.id);return {id:uid(),type:'v9-place',place,opts:pick,settled:false,city:s.life.city,rarity:'rare'};}

/* ---------- partners ---------- */
export const PARTNERS=[
 {id:'grandma',img:'p-grandma',at:500000,zh:'阿婆 · 老字号小吃',en:'Grandma Lin · street food legend',
  meet:['年轻人，我这摊子开了四十年。想跟我做生意？先请我喝碗汤。','Kid, my stall is forty years old. Want in? Buy me a bowl of soup first.'],
  lines:[['上次合作还行。今天有个稳当的活儿。','Last time went fine. Got a steady one today.'],['你是我见过最有耐心的投资人。','You are the most patient investor I know.'],['这本老账本……以后交给你了。','This old ledger… it is yours now.']],
  deals:[{icon:'noodle',zh:'开一家分店',en:'Open a branch',stakePct:.2,p:86,up:1.35},{icon:'box',zh:'批发年货',en:'Holiday wholesale',stakePct:.35,p:72,up:1.6}]},
 {id:'founder',img:'p-founder',at:1000000,zh:'Kai · 车库创业者',en:'Kai · garage founder',
  meet:['我们在做一个会改变世界的 App！……先付个咖啡钱认识一下？','We are building a world-changing app! …Coffee money to get acquainted?'],
  lines:[['新版本上线了，要不要追加？','New version shipped. Double down?'],['我们拿到了大厂的意向书！','A big tech term sheet just landed!'],['上市那天，我第一个打给你。','On IPO day, you get the first call.']],
  deals:[{icon:'invest',zh:'天使轮',en:'Angel round',stakePct:.15,p:30,up:4.6},{icon:'briefcase',zh:'过桥贷款',en:'Bridge loan',stakePct:.25,p:70,up:1.55}]},
 {id:'trader',img:'p-trader',at:3000000,zh:'Vera · 对冲基金交易员',en:'Vera · hedge-fund trader',
  meet:['我只和懂周期的人合作。入会费不便宜。','I only work with people who read cycles. The entry fee is not cheap.'],
  lines:[['看看这个季度的情绪指标。','Look at this season\u2019s mood index.'],['你押周期押得越来越准了。','Your cycle calls are getting sharp.'],['我准备自立门户，你来做 LP。','I am going solo. Be my LP.']],
  deals:[{icon:'invest',zh:'做多本季',en:'Long this season',stakePct:.4,p:50,up:2,moodBet:1},{icon:'chips',zh:'做空本季',en:'Short this season',stakePct:.4,p:50,up:2,moodBet:-1}]},
 {id:'gambler',img:'p-gambler',at:1000000,zh:'「黑桃」 · 地下赌客',en:'"Spade" · underground gambler',
  meet:['三张牌，一张是 A。敢不敢认识我？','Three cards, one ace. Dare to know me?'],
  lines:[['手气不错？再来。','Feeling lucky? Again.'],['你是少数赢了我还能笑着走的人。','Few beat me and walk away smiling.'],['我欠你一个人情，别告诉别人。','I owe you one. Tell no one.']],
  deals:[{icon:'cards',zh:'三选一翻牌',en:'Pick one of three',stakePct:.3,p:34,up:3.1,casino:true},{icon:'chips',zh:'加倍或归零',en:'Double or nothing',stakePct:.5,p:49,up:2,casino:true}]},
 {id:'art',img:'p-art',at:20000000,zh:'Laurent · 画商',en:'Laurent · art dealer',
  meet:['艺术不是买卖，是缘分。当然，缘分也有价格。','Art is not trade, it is fate. Fate has a price, naturally.'],
  lines:[['一幅被低估的早期作品。','An undervalued early piece.'],['拍卖行开始打听你的收藏了。','Auction houses ask about your collection.'],['我把最后一幅私藏留给你。','I kept my last private piece for you.']],
  deals:[{icon:'goldkey',zh:'收一幅早期画作',en:'Buy an early work',stakePct:.2,p:60,up:2.1,lv:6},{icon:'medal',zh:'代理拍卖',en:'Broker an auction',stakePct:.3,p:75,up:1.5,lv:2}]},
 {id:'captain',img:'p-captain',at:50000000,zh:'Magnus · 船王',en:'Magnus · shipping tycoon',
  meet:['海上的钱，只和不晕船的人分。','Money at sea is shared only with those who don\u2019t get seasick.'],
  lines:[['新航线开了，风浪大。','A new route opened. Rough seas.'],['你的名字已经刷在我的一条船上。','Your name is painted on one of my ships.'],['舰队的一半，以后听你的。','Half the fleet answers to you now.']],
  deals:[{icon:'yacht',zh:'包一条新航线',en:'Charter a new route',stakePct:.35,p:66,up:1.9},{icon:'compass',zh:'远洋探险',en:'Deep-sea expedition',stakePct:.2,p:28,up:5}]}
];
export const getPartner=id=>PARTNERS.find(p=>p.id===id);
export const partnerFee=s=>Math.max(30000,Math.floor(s.cash*.06));
export function meetPartner(s){const o=s.offer,p=getPartner(o.partner),v=st(s);if(o.type!=='v9-partner'||o.settled||!p)throw Error('no partner');const fee=o.fee;if(s.cash<=fee)throw Error('cash');s.cash-=fee;v.partners[p.id]={bond:0,met:s.page,last:s.page};o.settled=true;o.result={fee};return fee;}

/* ---------- luxuries: once per run, rare, pure LV points ---------- */
export const LUXURY=[
 {id:'handbag',at:2000000,price:1500000,lv:3,zh:'限量手袋',en:'Limited handbag'},
 {id:'goldwatch',at:6000000,price:6000000,lv:8,zh:'金表',en:'Gold chronograph'},
 {id:'champagne',at:20000000,price:15000000,lv:15,zh:'私人香槟酒窖',en:'Private champagne cellar'},
 {id:'cigar',at:60000000,price:40000000,lv:28,zh:'古巴雪茄柜',en:'Cuban cigar humidor'},
 {id:'suit',at:150000000,price:90000000,lv:45,zh:'萨维尔街定制',en:'Savile Row bespoke'},
 {id:'yacht',at:600000000,price:300000000,lv:120,zh:'超级游艇',en:'Superyacht'},
 {id:'jet',at:4000000000,price:2000000000,lv:500,zh:'私人飞机',en:'Private jet'},
 {id:'diamond',at:20000000000,price:8000000000,lv:1500,zh:'传奇钻石',en:'Legendary diamond'},
 {id:'crown',at:200000000000,price:50000000000,lv:6000,zh:'失落的王冠',en:'The lost crown'},
 {id:'goldkey',at:1000000000000,price:300000000000,lv:25000,zh:'城市金钥匙',en:'Golden key to the city'}
];
export const getLux=id=>LUXURY.find(x=>x.id===id);
function luxOffer(s,rng){const v=st(s),L=liquid(s);const list=LUXURY.filter(x=>L>=x.at&&!v.luxSeen.includes(x.id));if(!list.length)return null;const x=list[list.length-1-Math.floor(rng()*Math.min(2,list.length))];v.luxSeen.push(x.id);return {id:uid(),type:'v9-lux',lux:x.id,settled:false,city:s.life.city,rarity:'legendary'};}
export const luxLV=(s,x)=>Math.round(x.lv*(origin(s)==='heir'?1.25:1));
export function buyLux(s){const o=s.offer,x=getLux(o.lux),v=st(s);if(o.type!=='v9-lux'||o.settled||!x)throw Error('no lux');if(s.cash<=x.price)throw Error('cash');s.cash-=x.price;v.lux.push(x.id);o.settled=true;o.bought=true;return luxLV(s,x);}

/* ---------- LV points ---------- */
export function runLV(s,getAsset){const v=st(s);let lv=v.lux.reduce((n,id)=>{const x=getLux(id);return n+(x?luxLV(s,x):0);},0);
 for(const id of s.assets||[]){const a=getAsset?.(id);if(a)lv+=Math.max(1,Math.round(Math.log10(Math.max(10,a.price))-2));}
 lv+=Object.values(v.partners).reduce((n,p)=>n+(p.bond>=3?5:0),0)+Math.floor((v.lvBonus||0));return lv;}
export function finalLV(s,getAsset){const peak=(s.peak||0)/100;return runLV(s,getAsset)+Math.max(0,Math.floor((Math.log10(Math.max(1,peak))-2)*6));}
export const SKINS=[{id:'default',lv:0,color:null,zh:'素色',en:'Plain'},{id:'mint',lv:20,color:0x5fbf9f,zh:'薄荷',en:'Mint'},{id:'ruby',lv:80,color:0xb3263b,zh:'红宝石',en:'Ruby'},{id:'onyx',lv:250,color:0x26282c,zh:'黑曜',en:'Onyx'},{id:'aurum',lv:800,color:0xd4af37,zh:'流金',en:'Aurum'},{id:'prism',lv:3000,color:0x8a6cff,zh:'棱镜',en:'Prism'}];

/* ---------- generic choice resolution (partner deals, place options) ---------- */
export function quoteOpt(s,opt){const stake=opt.stakePct?Math.max(1,Math.floor(s.cash*opt.stakePct)):0;let p=opt.p||0,up=opt.up||1;const m=mood(s).m;
 if(opt.moodBet)p=clamp(50+opt.moodBet*m*6,8,92);if(opt.casino&&origin(s)==='gambler')up+=.3;
 const cost=opt.costPct?Math.max(opt.min||0,Math.floor(s.cash*opt.costPct))*(opt.heal?2**st(s).heals:1):0;
 return {stake,p:Math.round(p),up:+up.toFixed(2),win:Math.floor(stake*up)-stake,cost,gain:opt.gainPct?Math.max(opt.gainMin||0,Math.floor(s.cash*opt.gainPct)):opt.loanPct?Math.floor(s.cash*opt.loanPct):0};}
export function resolveOpt(s,opt,rng=Math.random){const q=quoteOpt(s,opt),v=st(s),e=s.estate,out={won:true,delta:0,heal:0,hurt:0,energy:0,lv:0};
 if(q.cost){if(s.cash<=q.cost)throw Error('cash');s.cash-=q.cost;out.delta-=q.cost;}
 if(opt.heal){if(e.health>=e.maxHealth)throw Error('full');e.health=Math.min(e.maxHealth,e.health+1);v.heals++;out.heal=1;}
 if(opt.energy){s.life.energy=Math.min(s.life.energyCap,s.life.energy+opt.energy);out.energy=opt.energy;}
 if(opt.intel)v.intel=opt.intel;
 if(opt.gainPct){s.cash+=q.gain;out.delta+=q.gain;if(rng()*100<opt.risk){e.health=Math.max(0,e.health-1);out.hurt=1;}}
 if(opt.loanPct){s.cash+=q.gain;out.delta+=q.gain;v.debt+=Math.floor(q.gain*1.3);out.debt=Math.floor(q.gain*1.3);}
 if(opt.stakePct){if(q.stake<1||q.stake>=s.cash+1)throw Error('cash');const won=rng()*100<q.p;out.won=won;const d=won?q.win:-q.stake;s.cash=clamp(s.cash+d,0,CAP);out.delta+=d;out.stake=q.stake;out.p=q.p;
  s.investments=(s.investments||0)+1;if(won){s.wins=(s.wins||0)+1;s.streak=(s.streak||0)+1;}else s.streak=0;
  s.history?.unshift({won,multiplier:won?q.up:0,stake:q.stake,returned:won?q.stake+q.win:0,profit:d,cashAfterBet:s.cash,lossScope:'stake',page:s.page,project:'coffee',special:null,rarity:'rare',at:Date.now()});if(s.history)s.history=s.history.slice(0,40);
  if(won&&opt.lv){v.lvBonus=(v.lvBonus||0)+opt.lv;out.lv=opt.lv;}}
 s.peak=Math.max(s.peak||0,worth(s));return out;}

/* ---------- offer tuning: harder as you climb, seasonal mood, intel ---------- */
export function tune(s,o){if(o.type!=='project'||o.settled||o.v9tuned)return o;o.v9tuned=1;const t=liquidTier(s),m=mood(s).m,v=st(s);
 let p=o.p-Math.min(20,t*2.2)+m+(origin(s)==='coder'?3:0);if(v.intel>0){p+=6;v.intel--;o.v9intel=1;}
 if(o.stages){o.p=Number(o.p.toFixed(2));}else o.p=clamp(Math.round(p),5,95);
 const cap=Math.max(1.05,1.3-t*.025);if(o.p/100*o.up>cap)o.up=Math.max(1.05,+(cap/(o.p/100)).toFixed(2));
 o.v9mood=m;return o;}

/* ---------- draw: called at the start of makeOffer. Returns an offer, or a hint for the normal path ---------- */
export function draw(s,rng=Math.random){const v=st(s),L=liquid(s);
 if(!v.deck)v.deck=buildDeck(s,L<PROJECT_UNLOCK?'work':'market',rng);
 if(!v.deck.cards.length&&s.offer?.type==='v9-fork'&&!s.offer.settled)v.deck=buildDeck(s,s.offer.choices?.[0]||'work',rng);
 if(!v.deck.cards.length){return {offer:{id:uid(),type:'v9-fork',choices:forkChoices(s,rng),settled:false,city:s.life.city,rarity:'epic'}};}
 // partners interrupt: "click next and he is there"
 const met=Object.keys(v.partners);if(met.length&&L>=PROJECT_UNLOCK&&rng()<.2&&s.page-(v.lastPartnerPage||0)>=3){const id=met[Math.floor(rng()*met.length)],p=getPartner(id);if(p){v.lastPartnerPage=s.page;v.deck.drawn=(v.deck.drawn||0);return {offer:{id:uid(),type:'v9-pdeal',partner:id,settled:false,city:s.life.city,rarity:'epic'}};}}
 let card=v.deck.cards.pop();v.deck.drawn=(v.deck.drawn||0)+1;
 if((card==='project'||card==='elite')&&L<PROJECT_UNLOCK)card='work';
 if(card==='work')return {offer:workOffer(s,rng)};
 if(ZONES[card]?.place)return {offer:placeOffer(s,card,rng)};
 if(card==='partner'){const cand=PARTNERS.filter(p=>L>=p.at&&!v.partners[p.id]);if(cand.length){const p=cand[Math.floor(rng()*cand.length)];return {offer:{id:uid(),type:'v9-partner',partner:p.id,fee:partnerFee(s),settled:false,city:s.life.city,rarity:'epic'}};}card='project';}
 if(card==='luxury'){const o=luxOffer(s,rng);if(o)return {offer:o};card='project';}
 return {hint:card,elite:card==='elite'};}
export const V9_TYPES=['v9-work','v9-fork','v9-partner','v9-pdeal','v9-lux','v9-place'];

/* ---------- main story: one chapter per social class, player picks mood / motive ---------- */
export const STORY=[
 {t:0,title:['身世','Where you come from'],body:['下雨的清晨，口袋里只有 $100。你想起自己是怎么走到这一步的……','A rainy morning, $100 in your pocket. You remember how you got here…'],
  choices:[['night','我在夜市的油烟里长大，什么苦都吃过。','I grew up in night-market smoke. I can take anything.'],['heir','家里曾经很有钱，直到那一年全没了。','My family was rich, until the year it all vanished.'],['coder','公司一封邮件，我就失业了。','One company email and I was out.'],['gambler','老爸把一切押在一张牌上，然后输了。','Dad bet everything on one card, and lost.']]},
 {t:1,title:['第一份稳定','Something steady'],body:['$500。第一次，你不用数着硬币吃饭。房东敲门的声音没那么可怕了。','$500. For the first time you don\u2019t count coins for dinner.'],
  choices:[['calm','先存起来，稳一点。','Save it. Stay steady.'],['hungry','这只是开始，我要更多。','Just the beginning. I want more.'],['home','给家里打个电话，报个平安。','Call home. Tell them I\u2019m okay.']]},
 {t:2,title:['中产的门','The middle-class door'],body:['$10,000。银行开始给你打电话。你第一次被称为「客户」而不是「那个人」。','$10,000. Banks call you now. You are a “client”, not “that guy”.'],
  choices:[['proud','我配得上。','I earned this.'],['fear','我怕一觉醒来又回到原点。','I fear waking up back at zero.'],['give','该回馈一下帮过我的人。','Time to repay those who helped.']]},
 {t:3,title:['金色的窗框','Gilded frames'],body:['$100,000。界面开始泛金光。老同学突然都记得你的名字了。','$100,000. Everything shines gold. Old classmates suddenly remember your name.'],
  choices:[['revenge','让看不起我的人看看。','Let the doubters watch.'],['lonely','朋友多了，能说话的人少了。','More friends, fewer to talk to.'],['build','我要建点真正留下来的东西。','I want to build something that lasts.']]},
 {t:4,title:['大人物','A big name'],body:['$1,000,000。有人开始为你开门，也有人开始盯着你的行程。','$1,000,000. People open doors for you — and track your schedule.'],
  choices:[['power','规则是给普通人定的。','Rules are for ordinary people.'],['guard','小心，每一步都可能是陷阱。','Careful — every step could be a trap.'],['family','终于能让家人过好日子了。','Finally my family can live well.']]},
 {t:5,title:['私人资本','Private capital'],body:['$10,000,000。你不再「投资项目」，你「决定谁能存在」。','$10,000,000. You no longer invest in projects; you decide who gets to exist.'],
  choices:[['empire','帝国才刚开始。','The empire has just begun.'],['doubt','我还记得那碗 $1 的面吗？','Do I still remember that $1 noodle bowl?'],['legacy','该想想我会留下什么。','Time to think about my legacy.']]},
 {t:6,title:['寡头','Oligarch'],body:['一亿。城市的灯有一部分是你点亮的，也有一部分因你熄灭。','One hundred million. Some city lights are yours — and some went dark because of you.'],
  choices:[['cold','这是生意。','It\u2019s business.'],['warm','我可以做得更温柔一点。','I can be gentler.']]},
 {t:7,title:['主权宾客','Sovereign guest'],body:['十亿。总统的晚宴有你的座位。你忽然很想念夜市。','A billion. A seat at the president\u2019s dinner. You suddenly miss the night market.'],
  choices:[['more','继续向上。','Keep climbing.'],['back','回老街看看。','Visit the old street.']]},
 {t:8,title:['财阀','Dynasty'],body:['百亿。你的名字成了一个形容词。','Ten billion. Your name became an adjective.'],choices:[['crown','戴上无形的王冠。','Wear the invisible crown.'],['free','终于自由了吗？','Am I finally free?']]},
 {t:9,title:['云端','Above the clouds'],body:['千亿。世界安静了。','A hundred billion. The world goes quiet.'],choices:[['on','还有下一层吗？','Is there another floor?']]},
 {t:10,title:['不可触及','Untouchable'],body:['万亿。没有人能再定义你——除了你自己。从这里开始，等级不再有上限。','A trillion. No one defines you now, except you. From here the levels never end.'],choices:[['end','我是谁？','Who am I?']]}
];
