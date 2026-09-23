import {applyRegionalBoon,normalizeRegional} from './regional-stories.js';
import {normalizeCrew,applyCrewOffer} from './street-core.js';
import {worth,lateTier,activeItem,ensureEstate,reconcile,billQuote,prepareRest,settleBill,currentRegion,healthRisk,availableAuctionLot} from './endgame-core.js';
import {pickLocal,localById,DISTRICTS,NEWS,districtOffer} from './city-content.js';
// UPSHIFT v3 • all amounts in integer cents; no real money.
export const MAX_ENERGY=200;
export const LIMIT=900000000000000;
const cents=n=>Math.max(0,Math.min(LIMIT,Math.floor(Number(n)||0)));
export const CITY_DATA=[
 {id:'taipei',name:'台北',en:'TAIPEI',country:'台湾 · 中国',coords:[25.033,121.565],min:0,color:'#76a58b',sky:'#c5dccc',tag:'巷口生意 · 简单直接',desc:'从早餐摊开始。小额、单次结算，给每一个起点留一条路。',projects:['coffee','bakery','greenhouse','busker','couriers'],names:['巷口手冲咖啡','清晨饭团铺','屋顶香草园','街角吉他手','巷口跑腿小队'],event:'夜市人潮',eventDesc:'本地餐饮项目成功率 +8 个百分点。',bonus:8,fee:.7,music:'taipei'},
 {id:'tokyo',name:'东京',en:'TOKYO',country:'日本',coords:[35.676,139.65],min:2000,color:'#a69cd7',sky:'#aabbd5',tag:'创意与科技 · 两轮审核',desc:'独立唱片与科技试作。高级项目必须同时通过技术和市场审核。',projects:['vinyl','arcade','lab','makers','dancecrew'],names:['下北泽首版黑胶','秋叶原街机厅','涩谷材料实验室','秋叶原创客搭档','原宿街舞团'],event:'创作者祭',eventDesc:'本地项目成功返还倍率 +0.25。',mult:.25,fee:1.1,music:'tokyo'},
 {id:'vegas',name:'拉斯维加斯',en:'LAS VEGAS',country:'美国 · 内华达',coords:[36.17,-115.14],min:5000,color:'#cc93bb',sky:'#857fb5',tag:'高波动 · 全仓风险',desc:'霓虹不保证好运。普通项目不动未投入的钱；特殊全仓合约可能让现金归零。',projects:['arcade','studio','gold','dancecrew','expedition'],names:['大道夜场','驻场演出','沙漠勘探','大道驻演舞团','沙漠探险合伙人'],event:'盛大开幕',eventDesc:'返还倍率 +0.6，成功率降低 8 个百分点。',bonus:-8,mult:.6,fee:1.05,music:'vegas'},
 {id:'singapore',name:'新加坡',en:'SINGAPORE',country:'新加坡',coords:[1.352,103.82],min:20000,color:'#77bbb5',sky:'#bddce0',tag:'港口贸易 · 周期交割',desc:'从小型货运到区域供应链。高级项目需要等待 20 秒交割，资金同时承担风险。',projects:['port','cloud','solar','couriers','researchers'],names:['海峡集装箱','滨海数据中心','赤道绿能','港口速递团队','滨海科研小组'],event:'航运窗口',eventDesc:'本地贸易项目成功率 +5 个百分点。',bonus:5,fee:1.2,music:'singapore'},
 {id:'newyork',name:'纽约',en:'NEW YORK',country:'美国 · 纽约',coords:[40.713,-74.006],min:100000,color:'#8cacc3',sky:'#b8cede',tag:'资本市场 · 双重尽调',desc:'从街区咖啡到大型并购。高级项目双重尽调，顶级项目不设玩法投资上限。',projects:['coffee','cloud','studio','filmcrew','founders'],names:['布鲁克林咖啡','曼哈顿云服务','百老汇制作','独立电影摄制组','车库创业搭档'],event:'创投周',eventDesc:'高级项目成功返还倍率 +0.4。',mult:.4,fee:1.6,music:'newyork'},
 {id:'monaco',name:'摩纳哥',en:'MONACO',country:'摩纳哥',coords:[43.738,7.425],min:1000000,color:'#d5b976',sky:'#c9e1df',tag:'私人资本 · 顶层入场',desc:'游艇、艺术与私人资本。更高门槛，更大的投入空间；财富不代表零风险。',projects:['ocean','fashion','gold','expedition','founders'],names:['蔚蓝海岸包船','高定收藏展','私人黄金矿权','海岸远行团队','私人品牌合伙人'],event:'游艇展季',eventDesc:'旅游及奢侈品项目成功返还倍率 +0.5。',mult:.5,fee:2.1,music:'monaco'}
];
export const ITEMS=[
 {id:'passport',name:'世界通行证',en:'World pass',price:350,at:500,icon:'globe',desc:'解锁跨城交通；世界地图可直接点击浏览，城市音乐自动播放。'},
 {id:'radio',name:'城市资讯电台',en:'City radio',price:800,at:1500,icon:'radio',desc:'解锁实时广播横条：地点事件、投资限额与机制提示。'},
 {id:'ui',name:'Atelier 现代界面',en:'Atelier interface',price:1200,at:2000,icon:'layers',desc:'购买现代奶油白界面、定制图标、细线装饰和财富动效。可切回基础 UI。'},
 {id:'hex',name:'机制观测仪',en:'Mechanism atlas',price:3000,at:5000,icon:'hex',desc:'在侧栏显示六边形机制图，查看已购、可买、未达门槛。'},
 {id:'deposit',name:'计息账户',en:'Interest account',price:10000,at:20000,icon:'bank',desc:'重新进入游戏时，离线现金每天 +1%，按时长比例结算，最多累计 7 天。'},
 {id:'car',name:'二手旅行轿车',en:'Touring car',price:18000,at:25000,icon:'car',desc:'开启低级项目过滤；右滑自动跨过低级项目，每一站照常消耗体力。短途交通更便宜。'},
 {id:'music',name:'私人音乐管家',en:'Music concierge',price:35000,at:50000,icon:'music',desc:'城市配乐免费自动切换；购买后可选择休息阶段的 6 种财富阶层配乐。'},
 {id:'fund',name:'收益增益凭证',en:'Yield certificate',price:100000,at:200000,icon:'growth',desc:'需要计息账户。离线现金日利率从 1% 提高到 1.5%。',requires:'deposit'},
 {id:'noble-luxury',name:'贵族黑金导引信',en:'Noble luxury summons',price:15000,at:100000,icon:'gem',desc:'贵族特权令：调集商会专员，命令下一街区直达稀世拍卖会或名品店！'},
 {id:'noble-bank',name:'私人银行特许令',en:'Swiss banker charter',price:25000,at:150000,icon:'bank',desc:'贵族特权令：指派下一站为高净值金融银行项目，返还倍率提升。'},
 {id:'noble-clinic',name:'皇家疗养预约函',en:'Royal clinic reservation',price:40000,at:250000,icon:'bolt',desc:'贵族特权令：调集皇家专属医疗康复团队设立专属疗养站，恢复健康！'},
 {id:'noble-tech',name:'深潜科技特批函',en:'DeepTech incubator key',price:80000,at:500000,icon:'lab',desc:'贵族特权令：指引下一站为前沿量子实验室，高倍率技术突破几率大涨。'},
 {id:'vault',name:'滨海托管信托',en:'Marina trust',price:250000,at:500000,icon:'gem',desc:'新加坡限定，需要计息账户。再提高日利率 0.5 个百分点。',requires:'deposit',city:'singapore'},
 {id:'jet',name:'私人航空会员',en:'Private aviation',price:800000,at:2000000,icon:'plane',desc:'摩纳哥限定。解锁私人包机交通，所有目的地 5 秒抵达。',city:'monaco'}
];
export const CLASSES=[
 {name:'生存阶层',en:'SURVIVAL',at:0,fee:8,tax:0,art:'rest-humble',line:'一张长椅，一碗热汤。今天，先把自己照顾好。',acts:[["街边热汤",3,60,"drink"],["公园伸展",4,90,"stretch"],["旧书摊读书",6,150,"read"],["公共浴室",8,180,"massage"],["郊区巴士一日游",15,240,"lounge"],["经济旅馆小憩",22,360,"sleep"],["安心补眠套餐",38,900,"sleep",true]]},
 {name:'工薪阶层',en:'EVERYDAY',at:500,fee:35,tax:.002,art:'rest-humble',line:'让闹钟晚一点响。一个平凡但属于自己的周末。',acts:[["一杯周末咖啡",8,60,"drink"],["社区阅读午后",15,120,"read"],["健身与拉伸",25,180,"stretch"],["城市短途旅行",60,240,"lounge"],["经济旅馆周末",120,360,"sleep"],["温泉半日游",180,480,"massage"],["完整恢复假期",280,900,"sleep",true]]},
 {name:'中产阶层',en:'COMFORT',at:10000,fee:180,tax:.004,art:'rest-middle',line:'海边的风、一本没读完的书，和慢下来的时间。',acts:[["双人餐厅晚餐",80,90,"drink"],["海边阅读时光",120,150,"read"],["户外瑜伽课程",180,210,"stretch"],["精品水疗",350,300,"massage"],["海滨周末旅行",650,360,"lounge"],["家庭度假套餐",1600,480,"sleep"],["全包恢复之旅",2400,900,"lounge",true]]},
 {name:'富裕阶层',en:'AFFLUENCE',at:100000,fee:1500,tax:.006,art:'rest-middle',line:'把工作留在城市，把今天留给远方。',acts:[["海景早餐",180,90,"drink"],["私人教练伸展",350,150,"stretch"],["精品水疗疗程",700,240,"massage"],["五星级海岛旅行",3500,360,"lounge"],["山间静修周末",6500,420,"read"],["商务舱海外假期",14000,480,"sleep"],["专属深度恢复",22000,900,"massage",true]]},
 {name:'高净值阶层',en:'PRIVATE',at:1000000,fee:12000,tax:.008,art:'rest-luxury',line:'远离人群的海湾，世界在这里轻声说话。',acts:[["私人主厨晚宴",2500,120,"toast"],["海上阅读午后",4500,180,"read"],["私人康体课程",8000,240,"stretch"],["驻船水疗服务",12000,300,"massage"],["超级游艇周末",45000,420,"lounge"],["私人飞机旅行",95000,540,"sleep"],["全托管恢复假期",150000,900,"lounge",true]]},
 {name:'顶层财富',en:'SOVEREIGN',at:100000000,fee:250000,tax:.01,art:'rest-luxury',line:'整座岛屿进入假期。奢华之外，时间依然平等。',acts:[["庄园艺术沙龙",30000,150,"toast"],["私人藏书馆独处",60000,210,"read"],["专属康体团队",90000,270,"stretch"],["全日私人水疗",150000,360,"massage"],["包岛私人旅行",350000,420,"lounge"],["环球私人定制",1200000,540,"sleep"],["顶级全包恢复",1800000,900,"lounge",true]]}
];
export const getCity=s=>CITY_DATA.find(c=>c.id===(s.life?.city||s.city))||CITY_DATA[0];
export const owns=(s,id)=>!!activeItem(s,id);
export const classIndex=s=>CLASSES.reduce((i,c,n)=>worth(s)/100>=c.at?n:i,0);
export const goodsValue=s=>(s.life?.items||[]).reduce((n,id)=>n+(ITEMS.find(i=>i.id===id)?.price||0)*100,0);
export function initLife(s){
 const old=s.life||{};s.life={version:4,energy:MAX_ENERGY,energyCap:MAX_ENERGY,city:'taipei',items:[],seenWorth:s.peak||s.cash,rest:null,travel:null,filter:false,modern:true,soundscape:'auto',lastSeen:Date.now(),restCount:0,restLog:[],...old};
 normalizeCrew(s);normalizeRegional(s);const l=s.life;const oldCap=Number(old.energyCap)||(old.energy!==undefined?100:MAX_ENERGY);l.energyCap=Math.max(200,Math.min(400,Math.floor((Number(old.energyCap)||200)/50)*50));l.energy=Math.max(0,Math.min(l.energyCap,Math.round((Number(l.energy)||0)*l.energyCap/oldCap)));l.version=5;if(l.district&&!DISTRICTS[l.district.city])l.district=null;if(!NEWS.some(n=>n.id===l.news?.id))l.news=null;l.items=[...new Set((Array.isArray(l.items)?l.items:[]).filter(id=>ITEMS.some(i=>i.id===id)))];l.city=CITY_DATA.some(c=>c.id===l.city)?l.city:'taipei';l.seenWorth=cents(Math.max(l.seenWorth||0,s.cash||0,s.peak||0));l.lastSeen=Math.min(Date.now(),Math.max(0,Number(l.lastSeen)||Date.now()));
 if(l.rest&&(!Number.isFinite(l.rest.remaining)||!Array.isArray(l.rest.activities)||!CLASSES[l.rest.class]))l.rest=null;
 if(l.travel&&(!CITY_DATA.some(c=>c.id===l.travel.to)||!Number.isFinite(l.travel.arriveAt)))l.travel=null;
 if(l.rest){const r=l.rest;r.class=Math.max(0,Math.min(5,Math.floor(r.class)));r.remaining=Math.max(0,Math.min(900000,Number(r.remaining)||0));r.duration=r.aid?900000:600000;r.maintenance=cents(r.maintenance);r.tax=cents(r.tax);r.total=cents(r.total);r.ads=Math.max(0,Math.min(3,Math.floor(r.ads||0)));r.paid=!!r.paid;r.lastTick=Number.isFinite(r.lastTick)&&r.lastTick>0?r.lastTick:Date.now();r.id=Number(r.id)||Date.now();r.camera=Math.max(0,Math.min(2,Math.floor(Number(r.camera)||0)));r.pose=['drink','read','stretch','massage','sleep','lounge','toast'].includes(r.pose)?r.pose:null;r.lastActivity=String(r.lastActivity||'').replace(/[<>&"']/g,'').slice(0,50);if(!r.activityVersion){const extra=CLASSES[r.class].acts.map(([name,price,seconds,pose,instant],i)=>({id:i,name,price:Math.round(price*100*(getCity(s).fee||1)),seconds,pose,instant:!!instant,used:false}));r.activities=extra.map((a,i)=>i<r.activities.length?{...a,...r.activities[i],pose:a.pose,instant:a.instant}:a);r.activityVersion=2;}r.activities=r.activities.slice(0,7).map((a,i)=>({id:i,name:String(a.name||'休息活动').replace(/[<>&"']/g,''),price:cents(a.price),seconds:Math.max(0,Math.min(900,Number(a.seconds)||0)),pose:['drink','read','stretch','massage','sleep','lounge','toast'].includes(a.pose)?a.pose:'lounge',instant:!!a.instant,used:!!a.used}));}
 if(l.travel){const t=l.travel;t.duration=Math.max(5000,Math.min(300000,Number(t.duration)||300000));t.startedAt=Number.isFinite(t.startedAt)?t.startedAt:t.arriveAt-t.duration;t.arriveAt=Math.min(t.arriveAt,Date.now()+300000);t.cost=cents(t.cost);}
 if(!Array.isArray(l.restLog))l.restLog=[];
 if(!['auto','city','class'].includes(l.soundscape))l.soundscape='auto';ensureEstate(s);if(l.rest&&!l.rest.bill){const r=l.rest;if(!r.paid){s.estate.age=Math.max(0,l.restCount-1);prepareRest(s,r);}else{r.extra=0;r.bill={...billQuote(s,{restNumber:l.restCount}),maintenance:r.maintenance,tax:r.tax,guards:0,management:0,credit:0,total:r.maintenance+r.tax};}r.aid=false;}reconcile(s);return l;
}
export function eligible(s,item){return worth(s)>=item.at*100&&(!item.requires||owns(s,item.requires));}
export function useEnergy(s,n){initLifeIfNeeded(s);s.life.energy=Math.max(0,s.life.energy-n);}
function initLifeIfNeeded(s){if(!s.life)initLife(s);}
export function assertFree(s){initLifeIfNeeded(s);if(s.life.rest||s.life.travel)throw Error('休息或旅途中，暂时不能进行这项操作。');}
export function markLife(s){initLifeIfNeeded(s);s.life.seenWorth=Math.max(s.life.seenWorth,s.cash,s.peak||0);reconcile(s);}
export function stakeBounds(s){const o=s.offer;return {min:o.minStake||1,max:Math.min(s.cash,o.maxStake??LIMIT)};}
export function decorateOffer(s,o,rng=Math.random,forced=false){
 initLifeIfNeeded(s);o.city=s.life.city;
 if(s.life?.summonTarget){
  const target=s.life.summonTarget;s.life.summonTarget=null;
  if(target==='auction'){
   const lot=availableAuctionLot(s);
   if(lot){o.type='auction';o.auction=lot.id;return o;}
  }else if(target==='bank'){
   o.type='project';o.project='cloud';o.localName='苏黎世私人离岸金库';o.up=3.6;o.p=75;o.grade='elite';return o;
  }else if(target==='clinic'){
   o.type='clinic';o.localName='皇家私家康复诊疗所';return o;
  }else if(target==='tech'){
   o.type='project';o.project='lab';o.localName='先驱量子深潜实验室';o.up=5.2;o.p=68;o.grade='elite';return o;
  }
 }
 if(worth(s)>=100000000&&rng()<.16&&o.type==='project'&&!forced){
  const lot=availableAuctionLot(s);
  if(lot&&rng()<.38){o.type='auction';o.auction=lot.id;return o;}
 }
 if(o.type==='shop'){
  const available=ITEMS.filter(i=>!s.life.items.includes(i.id)&&eligible(s,i)&&(!i.city||i.city===s.life.city));
  o.utilities=available.sort(()=>rng()-.5).slice(0,3).map(i=>i.id);return o;
 }
 if(o.type!=='project')return o;
 const city=getCity(s),wealth=worth(s)/100;
 const local=forced?null:pickLocal(city.id,rng,wealth);if(local){o.project=local.project;o.localId=local.id;o.localName=local.name;o.localModel=local.model;o.culture=local.culture;o.category=local.category;}else{o.localName=city.names[city.projects.indexOf(o.project)]||null;}
 const rank=wealth>=1000000&&rng()<.23?'elite':wealth>=10000&&rng()<.42?'advanced':'street';
 o.grade=rank;o.minStake=rank==='elite'?10000000:rank==='advanced'?100000:1;o.maxStake=rank==='elite'?LIMIT:rank==='advanced'?10000000:50000;
 if(!forced){o.p=(local?.p||70)+(rank==='elite'?3:rank==='advanced'?1:0);o.up=Math.round(((local?.up||1.9)+(rank==='elite'?1.2:rank==='advanced'?.55:0))*100)/100;o.rarity=rank==='elite'?'legendary':rank==='advanced'?'rare':'common';}
 o.event=s.page%8<3?city.event:null;
 if(o.event){o.p=Math.max(15,Math.min(97,o.p+(city.bonus||0)));o.up=Math.round((o.up+(city.mult||0))*100)/100;}
 const region=currentRegion(s);o.region=region.id;o.regionName=region.name;if(region.id!=='street'){o.p=Math.max(18,o.p-region.risk);o.up=Math.round((o.up+region.risk*.13)*100)/100;if(rank==='elite')o.minStake=Math.max(o.minStake,Math.floor(region.at*100*.002));}
 const news=NEWS.find(n=>n.id===s.life.news?.id);if(news&&news.city===city.id){o.p=Math.max(15,Math.min(95,o.p+news.bonus));o.up=Math.round((o.up+news.mult)*100)/100;o.newsTitle=news.title;}
 applyCrewOffer(s,o);applyRegionalBoon(s,o);
 if(rank!=='street'&&['tokyo','newyork'].includes(city.id)){
  o.stages=[city.id==='tokyo'?88:91,Math.min(99,Math.round(o.p/(city.id==='tokyo'?.88:.91)))];o.p=Number((o.stages[0]*o.stages[1]/100).toFixed(2));o.complex='dual';
 }
 if(rank!=='street'&&city.id==='singapore'){o.complex='delivery';o.delay=20000;}
 return o;
}
export function activateNoble(s,itemId){
 assertFree(s);
 if(!owns(s,itemId))throw Error('未持有该项贵族特权道具。');
 const targetMap={'noble-luxury':'auction','noble-bank':'bank','noble-clinic':'clinic','noble-tech':'tech'};
 s.life.summonTarget=targetMap[itemId]||'auction';
 return ITEMS.find(i=>i.id===itemId);
}
export function buyUtility(s,id){
 assertFree(s);const item=ITEMS.find(i=>i.id===id);
 if(!item||s.offer.type!=='shop'||!s.offer.utilities?.includes(id)||owns(s,id)||!eligible(s,item)||item.city&&item.city!==s.life.city)throw Error('请在当地随机商店购买已解锁商品。');
 if(s.cash<=item.price*100)throw Error('余额不足，购买后至少保留 $0.01 现金。');
 s.cash-=item.price*100;s.life.items.push(id);useEnergy(s,2);
 if(id==='deposit')s.life.lastSeen=Date.now();return item;
}
export function beginRest(s,rng=Math.random){
 initLifeIfNeeded(s);if(s.life.rest)return s.life.rest;if(s.life.travel)throw Error('请先抵达目的地。');
 const estimate=billQuote(s),index=estimate.class,c=CLASSES[index],city=getCity(s);
 const maintenance=estimate.maintenance,tax=estimate.tax;
 s.life.rest={id:Date.now(),class:index,city:city.id,remaining:600000,duration:600000,paid:false,maintenance,tax,startedAt:0,lastTick:0,activityVersion:2,pose:null,camera:0,activities:c.acts.map(([name,price,seconds,pose,instant],i)=>({id:i,name,price:Math.round(price*100*(.85+rng()*.3)*city.fee),seconds,pose,instant:!!instant,used:false})),ads:0,aid:false,total:0};
 s.life.district=null;s.life.energy=0;s.life.restCount++;s.page++;const n=NEWS[Math.floor(rng()*NEWS.length)];s.life.news={id:n.id,cycle:s.life.restCount};prepareRest(s,s.life.rest,rng);return s.life.rest;
}
export function payRest(s,aid=false){return settleBill(s);}
export function tickRest(s,now=Date.now()){
 const r=s.life?.rest;if(!r||!r.paid)return;r.remaining=Math.max(0,r.remaining-Math.max(0,now-r.lastTick));r.lastTick=Math.max(r.lastTick,now);
}
export function restActivity(s,id){tickRest(s);const r=s.life?.rest,a=r?.activities.find(x=>x.id===id);if(!r?.paid||r.remaining<=0||!a||a.used)throw Error('活动当前不可用。');if(s.cash<=a.price)throw Error('现金不足，需保留至少 $0.01。');s.cash-=a.price;r.total+=a.price;a.used=true;r.remaining=a.instant?0:Math.max(0,r.remaining-a.seconds*1000);r.pose=a.pose;r.lastActivity=a.name;return a;}
export function rewardRest(s,restId){const r=s.life?.rest;if(!r||r.id!==restId||!r.paid||r.ads>=3)return false;tickRest(s);r.remaining=Math.max(0,r.remaining-120000);r.ads++;return true;}
export function finishRest(s){tickRest(s);const r=s.life?.rest;if(!r?.paid||r.remaining>0)throw Error('请先完成休息进度。');s.life.restLog.unshift({class:r.class,total:r.total,at:Date.now(),aid:r.aid});s.life.restLog=s.life.restLog.slice(0,8);s.life.rest=null;s.life.energy=s.life.energyCap||MAX_ENERGY;}
export function distance(a,b){const rad=Math.PI/180,dy=(b.coords[0]-a.coords[0])*rad,dx=(b.coords[1]-a.coords[1])*rad;return 6371*2*Math.asin(Math.min(1,Math.sqrt(Math.sin(dy/2)**2+Math.cos(a.coords[0]*rad)*Math.cos(b.coords[0]*rad)*Math.sin(dx/2)**2)));}
export function routes(s,to){
 const km=distance(getCity(s),to);return [
 {id:'ground',name:km>1500?'陆海联运 · 慢行':'巴士 / 铁路 · 慢行',icon:'train',seconds:Math.min(300,Math.max(35,Math.round(km/35))),cost:Math.round(Math.max(25,km*.012)*(owns(s,'car')?.7:1)*100)},
 {id:'flight',name:'经济舱航班',icon:'plane',seconds:Math.min(70,Math.max(8,Math.round(km/220))),cost:Math.round((80+km*.075)*100)},
 {id:'express',name:'优先商务航班',icon:'plane',seconds:Math.min(22,Math.max(5,Math.round(km/700))),cost:Math.round((400+km*.28)*100)},
 ...(owns(s,'jet')?[{id:'private',name:'会员私人包机',icon:'gem',seconds:5,cost:Math.round((4000+km*1.3)*100)}]:[])];
}
export function startTravel(s,id,mode){
 assertFree(s);if(s.life.district)throw Error('特殊街区将持续至体力耗尽，完成本次旅程后才能跨城。');const to=CITY_DATA.find(c=>c.id===id);if(!owns(s,'passport')||!to||to.id===s.life.city||worth(s)<to.min*100)throw Error('目的地未解锁。');if(s.activeChallenge)throw Error('请先结束限时挑战，再跨城旅行。');if(s.offer.pendingStake)throw Error('请先完成当前项目交割。');if(s.life.energy<=0)throw Error('体力耗尽，请先进入假期。');
 const trip=routes(s,to).find(r=>r.id===mode);if(!trip||s.cash<=trip.cost)throw Error('车费不足，需保留至少 $0.01。');
 s.cash-=trip.cost;useEnergy(s,10);s.life.travel={from:s.life.city,to:id,mode,cost:trip.cost,startedAt:Date.now(),arriveAt:Date.now()+trip.seconds*1000,duration:trip.seconds*1000};return s.life.travel;
}
export function arrive(s){const t=s.life?.travel;if(!t||Date.now()<t.arriveAt)throw Error('旅程尚未结束。');s.life.city=t.to;s.life.travel=null;return getCity(s);}
export const dailyRate=s=>!owns(s,'deposit')?0:.01+(owns(s,'fund')?.005:0)+(owns(s,'vault')?.005:0);
export function offlineIncome(s,now=Date.now()){
 initLifeIfNeeded(s);const elapsed=Math.min(7*86400000,Math.max(0,now-s.life.lastSeen));s.life.lastSeen=now;
 if(s.ended||!owns(s,'deposit')||elapsed<60000)return null;const delta=Math.min(LIMIT-s.cash,Math.floor(s.cash*dailyRate(s)*elapsed/86400000));s.cash+=delta;markLife(s);return delta>0?{delta,elapsed,rate:dailyRate(s)}:null;
}
export function globalRank(s,worth){
 const anchors=[[0,0],[100,8],[500,18],[10000,53],[100000,85],[1000000,98.8],[10000000,99.88],[1e8,99.99],[1e10,99.99999],[9e12,99.9999999]],v=worth/100;let percent=0;
 for(let i=1;i<anchors.length;i++)if(v>=anchors[i-1][0]){const [a,p]=anchors[i-1],[b,q]=anchors[i];const t=Math.max(0,Math.min(1,(Math.log10(v+1)-Math.log10(a+1))/(Math.log10(b+1)-Math.log10(a+1))));percent=p+(q-p)*t;}
 return {percent,rank:Math.max(1,Math.ceil(8200000000*(1-percent/100))),population:8200000000};
}
export const MECHANISMS=[
 {name:'体力 / 假期',at:0,always:true,desc:'前进 −5 · 投资 −3 · 购物 −2 · 旅行 −10'},
 {name:'跨城地图',item:'passport'}, {name:'资讯广播',item:'radio'}, {name:'现代界面',item:'ui'}, {name:'高级项目',at:10000,desc:'投资 $1,000–$100,000，地点专属复合规则'}, {name:'离线利息',item:'deposit'}, {name:'轿车过滤',item:'car'}, {name:'阶层配乐',item:'music'}, {name:'收益升级',item:'fund'}, {name:'顶级项目',at:1000000,desc:'投资下限 $100,000，不设玩法上限'}, {name:'滨海信托',item:'vault'}, {name:'私人航空',item:'jet'}
];

export function upgradeEnergy(s){assertFree(s);if(s.life.energyCap>=400)throw Error('体力上限已经达到 400。');const step=(s.life.energyCap-200)/50,cost=[150000,400000,1000000,2500000][step];if(s.cash<=cost)throw Error('现金不足，升级后需保留至少 $0.01。');s.cash-=cost;s.life.energyCap+=50;s.life.energy=Math.min(s.life.energyCap,s.life.energy+50);return cost;}

export const UNLOCK_MILESTONES=[
 {id:'tips',at:250,name:'街头人脉与人才市场',title:'街头人脉与人才市场',icon:'sparkle',desc:'场景里的人才市场开门，可付费签约随从；点击随从查看能力、工资与解雇。路人好感影响其思想评价。'},
 {id:'passport',at:500,name:'世界通行证与跨城出行',title:'世界通行证与跨城出行',icon:'globe',desc:'城市全景在主画面展开，解锁旅行和身家入口。跨城仍需到沿途商店购买 $350 世界通行证。'},
 {id:'radio',at:1500,name:'城市资讯电台',title:'城市资讯电台',icon:'radio',desc:'解锁商业电台横条，实时播报当地事件、涨跌情报与政策红利！'},
 {id:'atlas',at:3000,name:'机制图谱与UI缩放',title:'机制图谱与UI缩放',icon:'hex',desc:'解锁全机制观测图谱，并开启界面缩放自由调节！'},
 {id:'showdown',at:5000,name:'特殊对赌合约',title:'特殊对赌合约',icon:'fire',desc:'解锁硬币对决、极速合约等高风险高回报玩法！'},
 {id:'advanced',at:10000,name:'中产阶层与高级项目',title:'中产阶层与高级项目',icon:'diamond',desc:'开启中产精致界面，解锁多轮双重审核的高级复合项目！'},
 {id:'filter',at:25000,name:'二手轿车与项目过滤',title:'二手轿车与项目过滤',icon:'car',desc:'开启低级项目智能过滤，右滑自动跳过微小项目，直奔核心机会！'},
 {id:'music',at:50000,name:'私人音乐管家与阶层原声',title:'私人音乐管家与阶层原声',icon:'music',desc:'自选各城市定制配乐与各阶层专属环境原声音效！'},
 {id:'affluence',at:100000,name:'富裕阶层与私人保镖安保',title:'富裕阶层与私人保镖安保',icon:'crown',desc:'解锁鎏金奢华界面！雇佣私人保镖团队，制定防身与和解策略！'},
 {id:'noble',at:500000,name:'贵族特权与专属地点导航令',title:'贵族特权与专属地点导航令',icon:'estate',desc:'解锁贵族特权令，可指定下一站出现奢侈品店、银行或科技中心！'},
 {id:'auction',at:1000000,name:'稀世孤品拍卖行与转世勋章墙',title:'稀世孤品拍卖行与转世勋章墙',icon:'gem',desc:'参与不可复现的独家奢侈品拍卖，现金直接转为永久转世点数，点亮荣誉勋章墙！'}
];

export function nextUnlock(s){
 const w=worth(s)/100;
 const locked=UNLOCK_MILESTONES.filter(m=>w<m.at);
 if(!locked.length)return null;
 const m=locked[0];
 const prevIdx=UNLOCK_MILESTONES.indexOf(m)-1;
 const prevAt=prevIdx>=0?UNLOCK_MILESTONES[prevIdx].at:0;
 const progress=Math.max(0,Math.min(1,(w-prevAt)/(m.at-prevAt)));
 return {id:m.id,title:m.name,name:m.name,at:m.at,icon:m.icon,desc:m.desc,milestone:m,progress,current:w,target:m.at};
}

export function checkNewUnlocks(s){
 initLifeIfNeeded(s);
 const l=s.life;
 l.seenMilestones=Array.isArray(l.seenMilestones)?l.seenMilestones:[];
 const w=worth(s)/100;
 const newlyUnlocked=[];
 for(const m of UNLOCK_MILESTONES){
   if(w>=m.at&&!l.seenMilestones.includes(m.id)){
     l.seenMilestones.push(m.id);
     newlyUnlocked.push(m);
   }
 }
 return newlyUnlocked;
}
