import {crewWages,hasCrew} from './street-core.js';
import {getAsset,getOutfit,getAuctionLot,getDecoration,AUCTION_LOTS,DECORATIONS} from './catalog.js';
// All money is integer cents. New risks are fictional, not financial/medical claims.
export const MONEY_CAP=900000000000000;
const I={passport:350,radio:800,ui:1200,hex:3000,deposit:10000,car:18000,music:35000,fund:100000,vault:250000,jet:800000,'noble-luxury':15000,'noble-bank':25000,'noble-clinic':40000,'noble-tech':80000};
export const ITEM_FLOORS={passport:500,radio:1500,ui:2000,hex:5000,deposit:20000,car:25000,music:50000,fund:200000,vault:500000,jet:2000000,'noble-luxury':100000,'noble-bank':150000,'noble-clinic':250000,'noble-tech':500000};
export const TIERS_LATE=[
 {at:0,name:'生存',tax:0},{at:500,name:'工薪',tax:.002},{at:10000,name:'中产',tax:.006},{at:100000,name:'富裕',tax:.015},
 {at:1000000,name:'大人物',tax:.035},{at:10000000,name:'私人资本',tax:.06},{at:100000000,name:'寡头',tax:.09},
 {at:1000000000,name:'主权宾客',tax:.13},{at:10000000000,name:'全球财阀',tax:.17},{at:100000000000,name:'云端议席',tax:.22},{at:1000000000000,name:'不可触及',tax:.28}
];
export const FACTIONS=[{id:'people',name:'平民社群',at:2,symbol:'众'},{id:'tech',name:'科技联盟',at:3,symbol:'科'},{id:'industry',name:'工业联合',at:4,symbol:'工'},{id:'state',name:'地区议政署',at:3,symbol:'政'},{id:'underworld',name:'地下帮派',at:4,symbol:'影'},{id:'capital',name:'资本公会',at:5,symbol:'资'}];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const cents=n=>Math.floor(clamp(Number(n)||0,0,MONEY_CAP));
export const worth=s=>cents((s.cash||0)+(s.offer?.pendingStake||0)+(Array.isArray(s.life?.v7?.delayed)?s.life.v7.delayed.reduce((n,d)=>n+(Number.isSafeInteger(d?.stake)?d.stake:0),0):0)+(s.assets||[]).reduce((n,id)=>n+(getAsset(id)?.price||0)*100,0)+(s.outfits||[]).reduce((n,id)=>n+(getOutfit(id)?.price||0)*100,0)+(s.decorations||[]).reduce((n,id)=>n+(getDecoration(id)?.price||0)*100,0)+(s.life?.items||[]).reduce((n,id)=>n+(I[id]||0)*100,0));
export const lateTier=s=>TIERS_LATE.reduce((i,t,j)=>worth(s)>=t.at*100?j:i,0);
export const activeItem=(s,id)=>s.life?.items?.includes(id)&&worth(s)>=(ITEM_FLOORS[id]||0)*100;
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const cityNames={taipei:'台北',tokyo:'东京',vegas:'拉斯维加斯',singapore:'新加坡',newyork:'纽约',monaco:'摩纳哥'};
const localAreas={taipei:['信义私人会馆','大安研发特区','河岸国际议政区','云端灯会城'],tokyo:['银座藏家会所','湾岸机器人群岛','千代田财政特区','轨道文化舱'],vegas:['沙漠尊享长廊','红岩能源环带','大道超级会展区','夜光浮空城'],singapore:['滨海私人码头','裕廊创新群岛','主权贸易特别区','赤道轨道港'],newyork:['上东区私藏街','布鲁克林工业云','曼哈顿金融特区','哈德逊空中城'],monaco:['蒙特卡洛藏家湾','海岸精工园','主权资本飞地','蔚蓝近地会所']};
export function regions(city){return [{id:'street',name:'普通街区',at:0,tax:1,risk:0},...localAreas[city].map((name,i)=>({id:['private','industrial','sovereign','orbital'][i],name,at:[1e6,1e8,1e9,1e11][i],tax:[1.12,1.35,1.8,2.1][i],risk:[2,5,8,12][i]}))];}
export const currentRegion=s=>regions(s.life?.city||'taipei').find(z=>z.id===s.estate?.region)||regions(s.life?.city||'taipei')[0];
export const PERKS=[
 {id:'reserve',name:'应急准备金',cost:12,desc:'新一局第一次休息减免最多 $30 账单，不增加初始现金。',type:'机制'},
 {id:'instinct',name:'危险直觉',cost:25,desc:'新一局安全事件躲避率 +5 个百分点。',type:'机制'},
 {id:'insurance',name:'转世风险共保',cost:40,desc:'新一局每次抢劫现金损失自动返还 25%（不复活）。',type:'机制'},
 {id:'contacts',name:'前世的人情',cost:45,desc:'新一局六大派系初始关系 +10；派系仍需达到财富门槛。',type:'机制'},
 {id:'constitution',name:'更好的底子',cost:60,desc:'新一局最大健康格从 5 提高为 6。',type:'机制'},
 {id:'jade',name:'翡翠夜航',cost:8,desc:'解锁玉绿配色外观，不改变概率或费用。',type:'皮肤'},
 {id:'noir',name:'黑金来世',cost:18,desc:'解锁深蓝金色外观，不改变概率或费用。',type:'皮肤'},
 {id:'rose',name:'玫瑰香槟',cost:18,desc:'解锁玫瑰铜色外观，不改变概率或费用。',type:'皮肤'}
];
export function initLegacy(meta){const old=meta.legacy||{};meta.legacy={points:Math.max(0,Math.round((Number(old.points)||0)*100)/100),lifetime:Math.max(0,Math.round((Number(old.lifetime)||0)*100)/100),unlocks:[...new Set((old.unlocks||[]).filter(id=>PERKS.some(p=>p.id===id)))],skin:['default','jade','noir','rose'].includes(old.skin)?old.skin:'default'};return meta.legacy;}
export function ensureEstate(s){
 const old=s.estate||{};s.estate={version:1,health:5,maxHealth:5,age:s.life?.restCount||0,riskReduction:0,guards:0,stance:'balanced',relations:Object.fromEntries(FACTIONS.map(f=>[f.id,0])),queue:[],luxuryEarned:0,luxuries:[],region:'street',perks:[],medicalUses:0,settled:false,auctionMedals:[],missedAuctions:[],...old};const e=s.estate;
 e.perks=(Array.isArray(e.perks)?e.perks:[]).filter(id=>PERKS.some(p=>p.id===id));e.maxHealth=e.perks.includes('constitution')?6:5;e.health=clamp(Number(e.health)||0,0,e.maxHealth);e.age=Math.max(0,Math.floor(Number(e.age)||0));e.riskReduction=clamp(Number(e.riskReduction)||0,0,100000);e.guards=clamp(Math.floor(Number(e.guards)||0),0,3);if(!['cautious','balanced','assertive'].includes(e.stance))e.stance='balanced';
 e.relations=Object.fromEntries(FACTIONS.map(f=>[f.id,clamp(Number(e.relations?.[f.id])||0,-100,100)]));e.queue=Array.isArray(e.queue)?e.queue.filter(x=>x&&['health','tax','scandal','faction','security','luxury','windfall'].includes(x.kind)).slice(-20):[];e.luxuries=Array.isArray(e.luxuries)?e.luxuries:[];e.auctionMedals=Array.isArray(e.auctionMedals)?e.auctionMedals:[];e.missedAuctions=Array.isArray(e.missedAuctions)?e.missedAuctions:[];e.luxuryEarned=Math.max(0,Math.round((Number(e.luxuryEarned)||0)*100)/100);if(!regions(s.life?.city||'taipei').some(z=>z.id===e.region))e.region='street';return e;
}
export function applyLegacy(s,meta){const l=initLegacy(meta),e=ensureEstate(s);e.perks=l.unlocks.filter(id=>PERKS.find(p=>p.id===id)?.type==='机制');e.maxHealth=e.perks.includes('constitution')?6:5;e.health=e.maxHealth;if(e.perks.includes('contacts'))e.relations=Object.fromEntries(FACTIONS.map(f=>[f.id,10]));}
export function collectLegacy(s,meta){if(!s.ended)return;const e=ensureEstate(s),l=initLegacy(meta);if(e.settled)return;e.settled=true;l.points=Math.round((l.points+e.luxuryEarned)*100)/100;l.lifetime=Math.round((l.lifetime+e.luxuryEarned)*100)/100;}
export function buyPerk(meta,id){const l=initLegacy(meta),p=PERKS.find(x=>x.id===id);if(!p||l.unlocks.includes(id))throw Error('已解锁或不存在的转世内容。');if(l.points<p.cost)throw Error('奢侈点不足。消费当地奢侈品后，在人生结算时入账。');l.points-=p.cost;l.unlocks.push(id);return p;}
export function endLife(s,cause){if(s.ended)return;const e=ensureEstate(s);e.death={cause,worth:worth(s),cash:s.cash,peak:s.peak,age:e.age,page:s.page,at:Date.now()};s.ended=true;s.activeChallenge=null;s.life.rest=null;s.life.travel=null;s.life.district=null;}
export function reconcile(s){const e=s.estate||ensureEstate(s);if(worth(s)<currentRegion(s).at*100)e.region='street';s.life.currentWorth=worth(s);return lateTier(s);}
export function healthRisk(s,next=false){return clamp((s.estate?.age||0)+(next?1:0)-(s.estate?.riskReduction||0)-(hasCrew(s,'medic')?3:0),0,100);}
export const activeGuards=s=>lateTier(s)>=3?(s.estate?.guards||0):0;
export function securityOdds(s){const e=s.estate||ensureEstate(s),tier=lateTier(s),g=activeGuards(s),hostile=Math.max(0,-e.relations.underworld),z=currentRegion(s);return {robbery:clamp(8+tier*2+hostile*.18+z.risk-g*6+(e.stance==='cautious'?-6:e.stance==='assertive'?5:0),2,65),dodge:clamp(12+g*23+(e.perks.includes('instinct')?5:0)+(e.stance==='cautious'?8:e.stance==='assertive'?14:0),5,97),assassination:clamp((hostile-35)*.5+tier+z.risk-g*3,0,60)};}
export function guardSalary(s){const g=activeGuards(s);return Math.round([0,35000,350000,3500000][g]*(s.estate?.stance==='cautious'?1.4:1));}
export function billQuote(s,{restNumber=(s.life?.restCount||0)+1}={}){
 const n=worth(s),tier=lateTier(s),klass=Math.min(5,[0,1,2,3,4,4,5,5,5,5,5][tier]),region=currentRegion(s);
 const classFloor=TIERS_LATE[tier].at*100;
 const baseMaintenance=classFloor?Math.floor(classFloor*.30):800;
 const timeFee=classFloor?Math.floor(classFloor*.03):200;
 const housing=Math.floor(baseMaintenance*.5),meals=Math.floor(baseMaintenance*.3);
 const lineItems=[{icon:'home',name:['街边旅舍床位','单人租屋','城市公寓','花园别墅','空中套房','私人庄园'][klass],amount:housing},{icon:'cup',name:['热汤与便餐','日常三餐','品质餐食','主厨餐桌','私人主厨','庄园宴饮'][klass],amount:meals},{icon:'car',name:['公交与洗衣','通勤与衣物护理','专车与家政','管家与出行','专属生活服务','庄园礼宾团队'][klass],amount:baseMaintenance-housing-meals}];
 const auctionUpkeep=(s.estate?.auctionMedals||[]).reduce((sum,id)=>{const a=getAuctionLot(id);return sum+(a?.upkeep||0);},0);
 const outfitUpkeep=(s.outfits||[]).reduce((sum,id)=>{const o=getOutfit(id);return sum+(o?.upkeep||0);},0);
 const decoUpkeep=(s.decorations||[]).reduce((sum,id)=>{const d=getDecoration(id);return sum+(d?.upkeep||0);},0);
 const companions=crewWages(s),crewDiscount=hasCrew(s,'steward')?Math.floor(baseMaintenance*.15):0;
 const maintenance=baseMaintenance-crewDiscount+auctionUpkeep+outfitUpkeep+decoUpkeep+companions;
 const rate=0,tax=0,guards=guardSalary(s),management=0;
 const before=maintenance+tax+guards+management+timeFee,credit=s.estate?.perks?.includes('reserve')&&restNumber===1?Math.min(3000,before):0;
 return {version:6,classFloor,keepCash:Math.max(1,classFloor-(n-s.cash))+cents(before-credit),timeFee,lineItems,worth:n,cash:s.cash,tier,class:klass,maintenance,baseMaintenance,companions,crewDiscount,auctionUpkeep,outfitUpkeep,decoUpkeep,tax,guards,management,credit,rate,region:region.name,total:cents(before-credit),restNumber};
}
export function availableAuctionLot(s){
 const e=ensureEstate(s),tier=lateTier(s);
 return AUCTION_LOTS.find(lot=>tier>=lot.tier&&!e.auctionMedals.includes(lot.id)&&!e.missedAuctions.includes(lot.id))||null;
}
export function bidAuctionLot(s,lotId){
 const e=ensureEstate(s),lot=AUCTION_LOTS.find(l=>l.id===lotId);
 if(!lot||e.auctionMedals.includes(lotId))throw Error('该拍卖品已结标或不存在。');
 if(s.cash<=lot.price)throw Error('现金不足，竞拍后需保留至少 $0.01。');
 s.cash-=lot.price;
 e.auctionMedals.push(lotId);
 e.luxuryEarned+=lot.points;
 reconcile(s);
 return lot;
}
export function passAuctionLot(s,lotId){
 const e=ensureEstate(s);
 if(!e.missedAuctions.includes(lotId)){
   e.missedAuctions.push(lotId);
 }
}
function addEvent(s,kind,data={}){const ev={id:uid(),kind,city:s.life.city,base:worth(s),tier:lateTier(s),resolved:false,ack:false,stage:0,...data};s.estate.queue.push(ev);s.estate.queue=s.estate.queue.filter(x=>!x.ack).slice(-20);return ev;}
export const pendingEvent=s=>s.estate?.queue?.find(e=>!e.ack)||null;
export function prepareRest(s,r,rng=Math.random){const e=ensureEstate(s);e.age++;const bill=billQuote(s,{restNumber:s.life.restCount});Object.assign(r,{maintenance:bill.maintenance,tax:bill.tax,extra:bill.guards+bill.management+(bill.timeFee||0)-bill.credit,bill,paid:false});
 addEvent(s,'health',{risk:healthRisk(s),roll:rng()*100});
 if(bill.tax>0)addEvent(s,'tax',{tax:bill.tax,region:bill.region});
 // Fixed-fee rest no longer generates proportional scandal charges; existing saved events remain resolvable.

 const friends=FACTIONS.filter(f=>f.at<=bill.tier&&e.relations[f.id]>=35);if(friends.length&&rng()<.25)addEvent(s,'windfall',{faction:friends[Math.floor(rng()*friends.length)].id});
 return bill;
}
export function restDue(r){return Math.max(0,(r.maintenance||0)+(r.tax||0)+(r.extra||0));}
export function settleBill(s){const r=s.life.rest;if(!r||r.paid)throw Error('该账单已处理。');if(pendingEvent(s))throw Error('请先完成休息事件。');const total=restDue(r);if(s.cash<=total){endLife(s,'无法支付休息账单');return {dead:true,total};}s.cash-=total;r.total=total;r.paid=true;r.startedAt=r.lastTick=Date.now();return {dead:false,total};}
export function hireGuards(s,level,stance){if(s.ended||s.life.travel||s.life.rest)throw Error('请在街道阶段调整安保。');if(lateTier(s)<3)throw Error('总身家达到 $100,000 才能启用安保。');const e=s.estate;if(![0,1,2,3].includes(level)||!['cautious','balanced','assertive'].includes(stance))throw Error('无效安保方案。');const fee=level>e.guards?[0,100000,1000000,10000000][level]-[0,100000,1000000,10000000][e.guards]:0;if(s.cash<=fee)throw Error('现金不足，至少保留 $0.01。');s.cash-=fee;e.guards=level;e.stance=stance;reconcile(s);return fee;}
const LUX_NAMES={taipei:['大师花灯私藏','百年茶席包场','河岸私人艺术馆'],tokyo:['孤品机械腕表','私人庭园音乐会','湾岸建筑冠名'],vegas:['整夜私人幻术剧场','沙漠星空包场','霓虹大道专属庆典'],singapore:['兰花园私人晚宴','超级游艇月度包租','空中花园冠名礼'],newyork:['私人爵士专场','顶层艺术收藏夜','地标灯光私人致敬'],monaco:['高定珠宝私藏','超级游艇包场','蔚蓝海岸私人庆典']};
export function luxuries(s){const tier=lateTier(s);return LUX_NAMES[s.life.city].map((name,i)=>({id:s.life.city+'-lux-'+i,name,price:[100000000,1000000000,10000000000][i],points:[8,35,150][i],at:[1e7,1e8,1e9][i],available:tier>=[5,6,7][i]&&!s.estate.luxuries.includes(s.life.city+'-lux-'+i)}));}
export function consumeLuxury(s,id){const item=luxuries(s).find(x=>x.id===id);if(!item?.available||s.ended||s.life.rest||s.life.travel)throw Error('这件地区奢侈品尚未开放或已经消费。');if(s.cash<=item.price)throw Error('现金不足，需保留至少 $0.01。');s.cash-=item.price;s.estate.luxuryEarned+=item.points;s.estate.luxuries.push(id);reconcile(s);return item;}
export function medicalOptions(s){const n=worth(s),u=s.estate.medicalUses;return [{id:'care',name:'私人康复疗程',min:1e5,cost:Math.max(250000,Math.floor(n*.018))*(1+u),desc:'恢复 1 格健康，不改变下一次抽签概率。'}, {id:'longevity',name:'延寿研究合约',min:1e7,cost:Math.max(100000000,Math.floor(n*.09))*(1+u),desc:'衰退概率降低 12 个百分点；每次休息仍继续增长。'}, {id:'renewal',name:'细胞更新计划',min:1e10,cost:Math.max(100000000000,Math.floor(n*.25))*(1+u),desc:'健康恢复至上限，衰退概率降低 25 个百分点。'}].map(o=>({...o,cost:cents(o.cost)}));}
export function buyMedical(s,id){const e=s.estate,o=medicalOptions(s).find(x=>x.id===id);if(!o||worth(s)<o.min*100||s.ended)throw Error('尚未达到医疗项目门槛。');if(pendingEvent(s))throw Error('请先完成当前事件，不能改变已经抽出的结果。');if(id==='care'&&e.health>=e.maxHealth)throw Error('健康已经满格。');if(s.cash<=o.cost)throw Error('现金不足。');s.cash-=o.cost;e.medicalUses++;if(id==='care')e.health=Math.min(e.maxHealth,e.health+1);if(id==='longevity')e.riskReduction+=12;if(id==='renewal'){e.health=e.maxHealth;e.riskReduction+=25;}reconcile(s);return o;}
export function enterRegion(s,id){const z=regions(s.life.city).find(x=>x.id===id);if(!z||worth(s)<z.at*100)throw Error('当前总身家不足以进入该区域。');if(s.ended||s.life.rest||s.life.travel||s.life.district||s.offer.pendingStake||s.activeChallenge||pendingEvent(s))throw Error('请先完成当前阶段。');s.estate.region=id;return z;}
export function streetEvent(s,rng=Math.random){if(pendingEvent(s)||s.ended||s.life.district||s.activeChallenge)return null;const tier=lateTier(s);if(tier<2)return null;let ev;
 const odds=securityOdds(s);if(tier>=3&&rng()<.07&&s.estate.relations.underworld<-35)ev=addEvent(s,'security',{threat:s.estate.relations.underworld<=-60&&tier>=5?'assassination':'robbery',odds,roll:rng()*100});
 else if(tier>=5&&rng()<.07){const list=luxuries(s).filter(x=>x.available);if(list.length)ev=addEvent(s,'luxury',{item:list[Math.floor(rng()*list.length)]});}
 if(!ev&&rng()<Math.min(.33,.08+tier*.02)){const list=FACTIONS.filter(f=>tier>=f.at),f=list[Math.floor(rng()*list.length)],relation=s.estate.relations[f.id];ev=addEvent(s,relation>=40&&rng()<.3?'windfall':'faction',{faction:f.id,hostile:relation<=-35});}
 return ev?{id:uid(),type:'world-event',eventId:ev.id,city:s.life.city,rarity:'rare',settled:false}:null;
}
const fName=id=>FACTIONS.find(f=>f.id===id)?.name||'街区伙伴';
const amount=(ev,r)=>Math.max(100,Math.floor(ev.base*r));
export function eventView(s,ev){const e=s.estate;
 if(ev.resolved)return {tag:'EVENT RESOLVED / 已结算',title:ev.result?.title||'这一页，翻过去了。',body:ev.result?.body||'',choices:[]};
 if(ev.kind==='health')return {tag:'HEALTH DRAW / 第 '+e.age+' 次休息',title:'今晚，你的身体会怎么回答？',body:`当前健康 ${e.health}/${e.maxHealth}。本次衰退概率 ${ev.risk.toFixed(0)}%，抽中仅损失 1 格，归零则人生结束。结果在进入休息时已锁定，刷新不会重抽。`,choices:[{id:'reveal',label:'揭晓体检结果',detail:'本次没有现金费用。',cost:0}]};
 if(ev.kind==='tax')return {tag:'REGIONAL TAX / 虚构地区税制',title:'财富带来了另一封信。',body:`${ev.region}按当前总身家核定税单。税款已列入本次账单，不会在此重复扣除。可以拒绝，但地区议政署关系下降，之后可能遭遇冻结与罚款。`,choices:[{id:'comply',label:'纳入账单，按期缴纳',detail:`税额 $${(ev.tax/100).toLocaleString()} · 议政署关系 +8`,cost:0},{id:'refuse',label:'拒绝本次税款',detail:'从本次账单移除税款 · 议政署关系 −28',cost:0}]};
 if(ev.kind==='scandal'){const names=['账外风波：舆论开始发酵','账外风波：补交关键凭证','账外风波：兑现整改承诺'];const pct=[.015,.02,.01][ev.stage];return {tag:`PUBLIC CRISIS / ${ev.stage+1} OF 3`,title:names[ev.stage],body:'只需在每页选择一个回应。连续完成三项合规操作，最终获得总身家 6% 的合作奖励及关系提升；任一步拒绝，将立即支付 14% 的风波罚款。金额以风波开始时的总身家固定。',choices:[{id:'comply',label:['聘请独立审计','完成专业复核','兑现整改承诺'][ev.stage],detail:`第 ${ev.stage+1}/3 项 · 费用 ${(pct*100).toFixed(1)}%`,cost:amount(ev,pct)},{id:'refuse',label:'拒绝继续处理',detail:'立即罚款 14% · 议政署关系 −20，可能破产',cost:0,penalty:amount(ev,.14)}]};}
 if(ev.kind==='security'){const assassination=ev.threat==='assassination',bribe=amount(ev,assassination?.08:.035);return {tag:assassination?'LIFE AT RISK / 地下报复':'SECURITY / 财富被盯上了',title:assassination?'暗巷里的脚步声。':'有人把你的行程卖了。',body:assassination?'这是致命威胁。保镖与安保姿态影响躲避概率；选择回避路线可额外提高 15 个百分点。失败会直接结束人生。':'不是每笔损失都写在投资条款里。反抗失败将损失当前现金的 22%；和解可确定付费离开。概率已锁定，刷新不会重抽。',choices:[{id:'evade',label:'按安保预案躲避',detail:`成功躲避 ${Math.min(97,ev.odds.dodge+15).toFixed(0)}% · 当前 ${activeGuards(s)} 级保镖`,cost:0},{id:'resist',label:'正面驱离',detail:`成功 ${ev.odds.dodge.toFixed(0)}% · 成功后地下关系 +5，否则 ${assassination?'死亡':'损失 22% 现金'}`,cost:0},{id:'settle',label:'付费和解，确定离开',detail:'立即支付，地下关系 +4；本次不抽躲避',cost:bribe}]};}
 if(ev.kind==='windfall')return {tag:'GOODWILL / 关系红利',title:fName(ev.faction)+'记得你。',body:'过去的合作带来了新的馈赠。这是一次关系奖励，不要求投资或押金。',choices:[{id:'accept',label:'接受合作回礼',detail:'获得事件开始时总身家 1.2% 的现金 · 关系 +3',cost:0},{id:'decline',label:'礼物留给社区',detail:'不收钱 · 平民关系 +12，当前派系 +5',cost:0}]};
 if(ev.kind==='luxury')return {tag:'LOCAL LUXURY / '+cityNames[s.life.city],title:ev.item.name,body:`一次昂贵且不生息的消费。支付后得到 ${ev.item.points} 奢侈点，本局死亡或主动结算后转入主菜单。不会产生现金收益，也不计入总身家。`,choices:[{id:'buy',label:'消费并留下传说',detail:`+${ev.item.points} 奢侈点 · 本局仅一次`,cost:ev.item.price},{id:'decline',label:'欣赏就好',detail:'不花钱，也不获得奢侈点。',cost:0}]};
 const names={people:['社区希望你伸手','为街区公共空间提供资金'],tech:['科技联盟发来合作书','支持开放研发与独立技术'],industry:['工业联合需要周转','参与供应链保障计划'],state:['地区议政署向你筹资','认领地区公共建设份额'],underworld:['一封没有落款的账单','为所谓的“平静”支付代价'],capital:['资本公会邀请你坐下','支持私人资本合作网络']};const [title,desc]=names[ev.faction];const fraction=ev.faction==='state'?.055:ev.faction==='underworld'?.04:.025;
 return {tag:'FACTION / '+fName(ev.faction),title:ev.hostile?'旧账，也会找上门。':title,body:ev.hostile?`${fName(ev.faction)}对你十分不满。和解费用升高；拒绝会触发 ${(ev.faction==='state'?16:9)}% 总身家的冻结损失。`:`${desc}。钱越多，请求的数字也越大；良好关系可能带来回礼，敌对关系可能触发后续惩罚。`,choices:[{id:'support',label:ev.hostile?'支付和解金':'全额支持',detail:'当前派系关系 +18',cost:amount(ev,ev.hostile?fraction*2:fraction)},{id:'negotiate',label:'只承担一半',detail:'支付半额 · 当前派系关系 +5',cost:amount(ev,ev.hostile?fraction:fraction*.5)},{id:'refuse',label:'明确拒绝',detail:`当前派系关系 −18${ev.hostile?'，并立即遭受冻结损失':''}`,cost:0,penalty:ev.hostile?amount(ev,ev.faction==='state'?.16:.09):0}]};
}
function relation(s,id,n){s.estate.relations[id]=clamp(s.estate.relations[id]+n,-100,100);}
function take(s,n,cause){if(n>=s.cash){s.cash=0;endLife(s,cause);return false;}s.cash-=n;return true;}
export function resolveEvent(s,id,choice){const ev=pendingEvent(s);if(!ev||ev.id!==id||ev.resolved||s.ended)throw Error('此事件已经改变或结算。');const view=eventView(s,ev),opt=view.choices.find(c=>c.id===choice);if(!opt)throw Error('无效选项。');if(opt.cost>=s.cash&&opt.cost>0)throw Error('现金不足，需保留至少 $0.01。');const before=s.cash;let body='',title='你的选择，已经生效。';
 if(ev.kind==='health'){const hit=ev.roll<ev.risk;if(hit)s.estate.health=Math.max(0,s.estate.health-1);body=`抽签数 ${ev.roll.toFixed(2)} / 100，衰退阈值 ${ev.risk.toFixed(0)}。${hit?'健康 −1':'平安度过，健康未减少'}，现在 ${s.estate.health}/${s.estate.maxHealth} 格。`;title=hit?'身体收走了一格。':'今晚，平安无事。';if(s.estate.health===0)endLife(s,'健康耗尽，生命走到终点');}
 else if(ev.kind==='tax'){if(!s.life.rest)throw Error('假期已改变。');if(choice==='refuse'){s.life.rest.tax=0;s.life.rest.bill.taxRefused=true;relation(s,'state',-28);body='税款已从当前账单移除。议政署关系 −28。拒缴不是没有后果，后续可能触发冻结事件。';}else{relation(s,'state',8);body='议政署关系 +8。税款仍只在缴纳休息账单时扣一次。';}}
 else if(ev.kind==='scandal'){if(choice==='refuse'){take(s,opt.penalty,'风波罚款无法支付');relation(s,'state',-20);body='拒绝整改：罚款 14%，议政署关系 −20。';}else{s.cash-=opt.cost;ev.stage++;relation(s,'state',4);if(ev.stage<3){reconcile(s);return {more:true,cost:opt.cost};}const reward=amount(ev,.06);s.cash=cents(s.cash+reward);relation(s,'capital',12);body=`三步全部完成。合作奖励 $${(reward/100).toLocaleString()} 入账，资本公会关系 +12。`;title='风波落幕，信誉留下。';}}
 else if(ev.kind==='security'){if(choice==='settle'){s.cash-=opt.cost;relation(s,'underworld',4);body='和解费用已支付，本次安全离开。地下关系 +4。';}else{const threshold=Math.min(97,ev.odds.dodge+(choice==='evade'?15:0)),escaped=ev.roll<threshold;body=`躲避阈值 ${threshold.toFixed(0)}%，本次抽签 ${ev.roll.toFixed(2)}。`;if(escaped){body+=' 成功脱身，没有现金损失。';if(choice==='resist')relation(s,'underworld',5);}else if(ev.threat==='assassination'){body+=' 没有躲过地下报复。';endLife(s,'地下帮派暗杀，未能躲避');}else{const loss=Math.floor(s.cash*.22),rebate=s.estate.perks.includes('insurance')?Math.floor(loss*.25):0;s.cash-=loss-rebate;body+=` 损失现金 $${((loss-rebate)/100).toLocaleString()}${rebate?'（已含共保返还）':''}。`;}}}
 else if(ev.kind==='windfall'){if(choice==='accept'){const gift=amount(ev,.012);s.cash=cents(s.cash+gift);relation(s,ev.faction,3);body=`关系回礼 $${(gift/100).toLocaleString()} 已到账。`;}else{relation(s,'people',12);relation(s,ev.faction,5);body='现金不变，平民关系 +12，当前派系 +5。';}}
 else if(ev.kind==='luxury'){if(choice==='buy'){const x=consumeLuxury(s,ev.item.id);body=`消费完成：+${x.points} 奢侈点，人生结束后转入转世菜单。没有现金回报。`;}else body='你保留了现金，把风景留在这里。';}
 else if(ev.kind==='faction'){s.cash-=opt.cost;relation(s,ev.faction,choice==='support'?18:choice==='negotiate'?5:-18);if(opt.penalty)take(s,opt.penalty,'敌对派系冻结损失导致破产');body=`${fName(ev.faction)}关系 ${choice==='support'?'+18':choice==='negotiate'?'+5':'−18'}。${opt.penalty?'敌对冻结损失已执行。':''}`;}
 ev.resolved=true;ev.result={title,body,delta:s.cash-before,dead:!!s.ended};if(s.offer?.eventId===ev.id)s.offer.settled=true;reconcile(s);return ev.result;
}
export function acknowledgeEvent(s,id){const ev=pendingEvent(s);if(!ev||ev.id!==id||!ev.resolved)throw Error('请先作出选择。');ev.ack=true;if(s.offer?.eventId===id)s.offer={id:s.offer.id,type:'interlude',scene:'alley',city:s.life.city,rarity:'common',settled:true};}

export function buyDecoration(s, decoId){
 const d=getDecoration(decoId);
 if(!d)throw Error('该装饰不存在。');
 s.decorations=Array.isArray(s.decorations)?s.decorations:[];
 if(s.decorations.includes(decoId)){
   s.equippedDecoration=decoId;
   return d;
 }
 if(worth(s)<d.at*100)throw Error('尚未达到该装饰的身家门槛。');
 if(s.cash<=d.price*100)throw Error('现金不足，购买后需保留至少 $0.01。');
 s.cash-=d.price*100;
 s.decorations.push(decoId);
 s.equippedDecoration=decoId;
 const e=ensureEstate(s);
 e.luxuryEarned=(e.luxuryEarned||0)+d.lvPoints;
 return d;
}
