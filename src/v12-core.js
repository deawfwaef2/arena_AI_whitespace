// v12 core rules (pure state, integer cents): class intros, hospital price doubling, shops (small/big,
// categories, random stock), roadside sponsor billboards (rewarded ads), city-signature deals with visible
// min/max stakes, choose-your-stake partners and special partners.
import {PARTNERS,liquid,liquidTier,st} from './v9-core.js';
import {worth} from './endgame-core.js';

const CAP=900000000000000;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const pick=(a,rng)=>a[Math.floor(rng()*a.length)];
const shuffle=(a,rng)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* ---------- class intros: shown in a must-click popup on every class change ---------- */
export const CLASS_INTRO=[
 {icon:'can',zh:['生存','口袋里的硬币会响。','你数着每一枚硬币过日子。便利店的暖气是免费的，公园的长椅也是。今天的目标很简单：活下去，再多攒一点。','能做的：打工、捡瓶罐、搬纸箱。'],en:['Survival','Coins rattle in your pocket.','You count every coin. The convenience-store heater is free, so is the park bench. Today the goal is simple: survive, and save a little more.','You can: work odd jobs, collect cans, haul boxes.']},
 {icon:'coffee',zh:['工薪','你有了一张工资卡。','闹钟、通勤、加班费。生活依然紧巴巴，但你第一次有了“结余”这个词。街角的老板开始记住你的名字。','解锁：街头小生意、小商店、第一批合伙人。'],en:['Worker','You have a payroll card now.','Alarms, commutes, overtime. Life is still tight, but for the first time you know the word "savings". Shop owners on the corner start remembering your name.','Unlocked: street deals, corner shops, first partners.']},
 {icon:'briefcase',zh:['中产','体面，是一种每月都要付的账单。','房贷、保险、周末咖啡。你开始研究资产配置，也开始担心失去。现在的每一步，都有东西可以输。','解锁：项目区、医院、商店街、延时合同。'],en:['Middle class','Respectability is a bill you pay every month.','Mortgage, insurance, weekend coffee. You study asset allocation and start fearing loss. Every step now has something to lose.','Unlocked: project quarter, hospital, shopping street, delayed contracts.']},
 {icon:'goldwatch',zh:['富裕','服务员开始叫你“先生”。','你不再看价格标签，而是看品牌。银行经理主动打来电话。你的钱开始替你工作——也开始替你惹麻烦。','解锁：高级项目区、私人保镖、大型百货。'],en:['Affluent','Waiters start calling you "sir".','You look at brands, not price tags. The bank manager calls you first. Your money starts working for you — and making trouble for you.','Unlocked: elite quarter, bodyguards, department stores.']},
 {icon:'champagne',zh:['大人物','你的名字出现在晚宴名单上。','有人想认识你，有人想取代你。你说的话会被转述，你的失败会上新闻。成就陈列柜向你打开。','解锁：奢侈品、成就陈列柜（LV）、拍卖行。'],en:['Magnate','Your name is on the dinner lists.','Some want to know you, some want to replace you. Your words get quoted, your failures make the news. The trophy cabinet opens to you.','Unlocked: luxuries, trophy cabinet (LV), auction house.']},
 {icon:'yacht',zh:['私人资本','你不再存钱，你配置世界。','家族办公室、离岸信托、私人码头。城市在你脚下变成了一张棋盘。每一次休息，账单都像一座小城的预算。','解锁：顶级合伙人、私人区域、游艇俱乐部。'],en:['Private capital','You no longer save money. You allocate the world.','Family office, offshore trusts, private piers. The city becomes a chessboard under your feet. Every rest bill looks like a small town budget.','Unlocked: top partners, private zones, yacht club.']},
 {icon:'cigar',zh:['寡头','规则开始为你让路。','你一个电话能让一条街换招牌。议员请你吃饭，记者想挖你的过去。权力是新的货币，也是新的风险。','解锁：主权级项目、特殊合伙人事件。'],en:['Oligarch','Rules start stepping aside for you.','One call from you changes the signs on a whole street. Senators dine with you, reporters dig into your past. Power is the new currency — and the new risk.','Unlocked: sovereign-scale deals, special partner events.']},
 {icon:'jet',zh:['主权宾客','国家为你铺红毯。','你的私人飞机在跑道上优先起飞。你谈论的不是公司，是港口和航线。','解锁：更多城市特色大项目。'],en:['Sovereign guest','Nations roll out red carpets for you.','Your jet gets priority on the runway. You talk about ports and routes, not companies.','Unlocked: more city signature megaprojects.']},
 {icon:'diamond',zh:['全球财阀','地图上的颜色由你决定。','你的家族名字刻在博物馆的墙上。每个时区都有人在为你的资产工作。','解锁：传奇奢侈品。'],en:['Global dynasty','You decide the colours on the map.','Your family name is carved on museum walls. In every time zone someone is working on your assets.','Unlocked: legendary luxuries.']},
 {icon:'crown',zh:['云端议席','你坐在云端的会议桌旁。','这里只有十几把椅子。每一次投票都会改变数百万人的生活，包括那个曾经数硬币的你。','解锁：云端项目。'],en:['Cloud senate','You sit at the table above the clouds.','There are only a dozen chairs here. Every vote changes millions of lives — including the you who once counted coins.','Unlocked: cloud-level deals.']},
 {icon:'goldkey',zh:['不可触及','没有人再能碰到你。','金钱已经失去了数字的意义。剩下的问题只有一个：你想被怎样记住？','你已站在顶点。'],en:['Untouchable','No one can reach you anymore.','Money has lost its meaning as a number. Only one question remains: how do you want to be remembered?','You stand at the summit.']}
];
export const classIntro=(t,lang)=>{const c=CLASS_INTRO[clamp(t,0,CLASS_INTRO.length-1)];const [name,tag,body,unlock]=lang==='en'?c.en:c.zh;return {icon:c.icon,name,tag,body,unlock};};
export const CLASS_FALL={zh:['坠落','房东换了锁，服务员不再微笑。','曾经为你开门的人，现在假装没看见你。钱包跌破了门槛，界面、边框和特权被一件件收回。'],en:['The fall','The landlord changed the locks. The waiters stopped smiling.','People who once opened doors for you now pretend not to see you. Your wallet fell below the line; UI, frames and privileges are taken back one by one.']};

/* ---------- hospital: every paid treatment doubles the next price (per run) ---------- */
export const hospMult=s=>2**Math.min(20,st(s).hospUses||0);
export const HOSPITAL_TEXT={
 zh:{desk:'挂号处的护士头也不抬：“医保不覆盖。先付款，后看病。”',
  wall:'走廊的电子屏滚动着价目表。每来一次，你的档案就厚一页，价格也跟着翻倍——医院记得常客。',
  doctor:['值班医生翻着你的病历：“你这是透支。钱能买药，买不回时间。”','主任摘下眼镜：“又是你？这次的方案更贵，但成功率我不保证。”','院长亲自接待：“你的档案已经是 VIP 级了。价格，也是。”'],
  smell:'消毒水的味道，心电监护仪滴滴作响，候诊椅上坐满了和你一样疲惫的人。'},
 en:{desk:'The nurse at the desk doesn\u2019t look up: "Insurance won\u2019t cover this. Pay first, then see the doctor."',
  wall:'The hallway screen scrolls the price list. Every visit adds a page to your file — and doubles the price. The hospital remembers regulars.',
  doctor:['The doctor on duty flips your chart: "You\u2019re running on credit. Money buys medicine, not time."','The department head takes off his glasses: "You again? This plan costs more, and I can\u2019t promise it works."','The director meets you in person: "Your file is VIP level now. So are the prices."'],
  smell:'The smell of disinfectant, monitors beeping, waiting chairs full of people as tired as you.'}
};
export const HOSP_DETAIL={
 clinic:{zh:'社区诊所：一位老医生、一张旧木桌。开两盒药，叮嘱你早点睡觉。便宜，但身体不一定领情。',en:'Community clinic: one old doctor, one worn wooden desk. Two boxes of pills and a lecture about sleep. Cheap — your body may not care.'},
 specialist:{zh:'专科门诊：排队两小时，面诊八分钟。专家会开一套完整疗程，一半的人会好转。',en:'Specialist: two hours in line, eight minutes with the expert. A full treatment course; about half of patients improve.'},
 ward:{zh:'私立医院住院：独立病房、落地窗、营养师配餐。一周后你大概率能站着走出去。',en:'Private ward: single room, floor-to-ceiling window, a dietitian plans your meals. After a week you\u2019ll most likely walk out on your own.'},
 elite:{zh:'顶级医疗团队：三国专家连夜飞来，手术室为你一人开放。几乎一定有效——价格也几乎不讲道理。',en:'World-class team: specialists fly in overnight from three countries; an operating theatre opens just for you. Almost certain — and almost unreasonable in price.'},
 checkup:{zh:'年度体检：抽血、CT、心电图。报告很厚，结论很短：注意休息。以后每次休息衰退率 −1%。',en:'Annual check-up: blood work, CT, ECG. A thick report with a short conclusion: rest more. Future decline risk −1% per rest.'},
 pharmacy:{zh:'药房能量补给：维生素、电解质和一杯很苦的中药。体力 +40。',en:'Pharmacy boost: vitamins, electrolytes and a very bitter herbal tea. +40 energy.'},
 trial:{zh:'临床试验志愿者：签一份十页的同意书，换一笔报酬。副作用写在第九页的小字里。',en:'Clinical trial: sign a ten-page consent form for a payout. Side effects are in the small print on page nine.'}
};

/* ---------- shops ---------- */
// cat: food (energy), gear (odds / protection), health, collect (LV), estate (LV, big shops)
export const SHOP_CATS={food:{zh:'食物饮料',en:'Food & drink',color:'#e0843a'},gear:{zh:'装备道具',en:'Gear',color:'#3a7fe0'},health:{zh:'健康',en:'Health',color:'#d8435a'},collect:{zh:'收藏品',en:'Collectibles',color:'#9a5bd8'},estate:{zh:'房产地契',en:'Property',color:'#b8912f'}};
export const GOODS=[
 // small-shop goods (cheap, fixed prices)
 {id:'energydrink',cat:'food',icon:'can',size:'s',price:500,energy:25,zh:'能量饮料',en:'Energy drink',d:['体力 +25','+25 energy']},
 {id:'bento',cat:'food',icon:'noodle',size:'s',price:1200,energy:45,zh:'热便当',en:'Hot bento',d:['体力 +45','+45 energy']},
 {id:'coffee2',cat:'food',icon:'coffee',size:'s',price:800,energy:30,zh:'手冲咖啡',en:'Pour-over coffee',d:['体力 +30','+30 energy']},
 {id:'charm',cat:'gear',icon:'medal',size:'s',price:3000,intel:2,zh:'幸运御守',en:'Lucky charm',d:['接下来 2 个项目成功率 +6%','Next 2 projects +6% odds']},
 {id:'umbrella',cat:'gear',icon:'ticket',size:'s',price:1500,energy:15,zh:'折叠伞',en:'Folding umbrella',d:['雨天不淋湿：体力 +15','Stay dry: +15 energy']},
 {id:'vitamins',cat:'health',icon:'heart',size:'s',price:2500,riskCut:1,zh:'复合维生素',en:'Multivitamins',d:['衰退率永久 −1%','Decline risk −1% for good']},
 {id:'lotto',cat:'collect',icon:'ticket',size:'s',price:200,lotto:true,zh:'刮刮乐',en:'Scratch card',d:['10% 概率赢 $20，1% 概率赢 $500','10%: win $20 · 1%: win $500']},
 {id:'postcard',cat:'collect',icon:'story',size:'s',price:600,lv:1,zh:'城市明信片',en:'City postcard',d:['LV +1','LV +1']},
 // big-shop goods (scale with wealth)
 {id:'spa',cat:'food',icon:'champagne',size:'b',pct:.004,min:20000,energy:120,zh:'顶楼水疗套餐',en:'Rooftop spa package',d:['体力 +120','+120 energy']},
 {id:'feast',cat:'food',icon:'champagne',size:'b',pct:.002,min:8000,energy:70,zh:'主厨晚宴',en:'Chef\u2019s tasting menu',d:['体力 +70','+70 energy']},
 {id:'advisor',cat:'gear',icon:'briefcase',size:'b',pct:.01,min:30000,intel:4,zh:'投资顾问月卡',en:'Advisor retainer',d:['接下来 4 个项目成功率 +6%','Next 4 projects +6% odds']},
 {id:'suitcase',cat:'gear',icon:'suit',size:'b',pct:.006,min:50000,intel:3,lv:2,zh:'定制西装',en:'Tailored suit',d:['3 个项目 +6% · LV +2','3 projects +6% · LV +2']},
 {id:'checkup2',cat:'health',icon:'hospital',size:'b',pct:.008,min:60000,riskCut:3,zh:'高端体检套餐',en:'Executive health screen',d:['衰退率永久 −3%','Decline risk −3% for good']},
 {id:'watch2',cat:'collect',icon:'steelwatch',size:'b',pct:.02,min:80000,lv:4,zh:'机械腕表',en:'Mechanical watch',d:['LV +4','LV +4']},
 {id:'painting',cat:'collect',icon:'goldkey',size:'b',pct:.05,min:500000,lv:10,zh:'青年艺术家原作',en:'Young artist original',d:['LV +10','LV +10']},
 {id:'condo',cat:'estate',icon:'briefcase',size:'b',pct:.15,min:3000000,lv:15,zh:'市中心公寓地契',en:'Downtown condo deed',d:['建筑资产 · LV +15','Property · LV +15']},
 {id:'villa',cat:'estate',icon:'goldwatch',size:'b',pct:.25,min:20000000,lv:40,zh:'海景别墅地契',en:'Sea-view villa deed',d:['建筑资产 · LV +40','Property · LV +40']},
 {id:'tower',cat:'estate',icon:'crown',size:'b',pct:.35,min:500000000,lv:150,zh:'地标大楼产权',en:'Landmark tower title',d:['建筑资产 · LV +150','Property · LV +150']}
];
export const SHOP_KINDS={
 kiosk:{size:'s',n:4,zh:'街角小卖部',en:'Corner kiosk',icon:'basket',at:0,flavor:['老板在看电视，货架上落了点灰。','The owner is watching TV; the shelves are a bit dusty.']},
 market:{size:'s',n:6,zh:'社区超市',en:'Neighbourhood market',icon:'basket',at:30000,flavor:['冷柜嗡嗡响，收银员在打哈欠。','The freezer hums; the cashier yawns.']},
 dept:{size:'b',n:6,zh:'百货公司',en:'Department store',icon:'handbag',at:2000000,flavor:['大理石地面、香水柜台、电梯里的轻音乐。','Marble floors, perfume counters, soft music in the lift.']},
 boutique:{size:'b',n:6,zh:'精品旗舰店',en:'Flagship boutique',icon:'goldkey',at:50000000,flavor:['门口的保安替你开门，店员递来一杯香槟。','The guard opens the door; a clerk hands you champagne.']}
};
export const goodPrice=(s,g)=>g.price?g.price:Math.min(CAP,Math.max(g.min||0,Math.floor(liquid(s)*g.pct)));
export function shopOffer(s,rng=Math.random,kind){const L=liquid(s);
 if(!kind){const ok=Object.entries(SHOP_KINDS).filter(([,k])=>L>=k.at);kind=ok[ok.length-1-(ok.length>1&&rng()<.35?1:0)][0];}
 const K=SHOP_KINDS[kind];let pool=GOODS.filter(g=>K.size==='b'?(g.size==='b'||rng()<.25):g.size==='s');
 pool=pool.filter(g=>goodPrice(s,g)<L*.9||g.size==='s');
 const byCat={};for(const g of shuffle(pool,rng)){(byCat[g.cat]||(byCat[g.cat]=[])).push(g);}
 const out=[];const cats=Object.keys(SHOP_CATS);let i=0;while(out.length<K.n&&Object.values(byCat).some(a=>a.length)){const c=cats[i++%cats.length];if(byCat[c]?.length)out.push(byCat[c].shift());}
 out.sort((a,b)=>cats.indexOf(a.cat)-cats.indexOf(b.cat));
 return {id:uid(),type:'v12-shop',kind,goods:out.map(g=>({id:g.id,price:goodPrice(s,g),sold:false})),settled:false,city:s.life.city,rarity:'rare'};}
export function buyGood(s,idx,rng=Math.random){const o=s.offer;if(o.type!=='v12-shop')throw Error('no shop');const it=o.goods[idx];const g=GOODS.find(x=>x.id===it?.id);if(!g||it.sold)throw Error('sold');if(s.cash<=it.price)throw Error('cash');
 const v=st(s),e=s.estate,out={spent:it.price,good:g.id};s.cash-=it.price;it.sold=true;
 if(g.energy){s.life.energy=Math.min(s.life.energyCap||200,s.life.energy+g.energy);out.energy=g.energy;}
 if(g.intel){v.intel=(v.intel||0)+g.intel;out.intel=g.intel;}
 if(g.riskCut&&e){e.riskReduction=(e.riskReduction||0)+g.riskCut;out.riskCut=g.riskCut;}
 if(g.lv){v.lvBonus=(v.lvBonus||0)+g.lv;out.lv=g.lv;}
 if(g.lotto){const r=rng();const win=r<.01?50000:r<.11?2000:0;s.cash+=win;out.win=win;}
 v.shopBuys=(v.shopBuys||0)+1;return out;}

/* ---------- roadside sponsor billboard: rewarded ad blended into the street ---------- */
export const SPONSORS=[
 {id:'cola',icon:'can',zh:'「极冰可乐」路边试饮站',en:'"Glacier Cola" tasting booth',line:['品牌推广员拦住你：“看完一段 30 秒的广告片，这箱可乐和一笔推广费就是你的。”','A promoter stops you: "Watch our 30-second ad and this crate of cola plus a promo fee are yours."']},
 {id:'phone',icon:'briefcase',zh:'新款手机户外大屏',en:'New phone billboard screen',line:['巨型屏幕下搭了个帐篷：“帮我们看完广告，送你充电宝和现金券。”','A tent under the giant screen: "Watch the ad for us and get a power bank plus a cash voucher."']},
 {id:'car',icon:'carkey',zh:'汽车品牌路演',en:'Car brand roadshow',line:['一辆闪亮的概念车旁，主持人举着话筒：“看一段宣传片，就能拿参与奖金！”','Beside a shiny concept car the host lifts the mic: "Watch one promo clip and take the participation bonus!"']},
 {id:'bank',icon:'goldkey',zh:'私人银行品牌活动',en:'Private bank brand event',line:['穿制服的礼宾递来平板：“请欣赏我们的品牌影片，作为答谢会有一笔礼金。”','A uniformed concierge offers a tablet: "Please enjoy our brand film; a thank-you gift follows."']}
];
export const adReward=s=>{const L=liquid(s);return {cash:clamp(Math.floor(L*.06),3000,50000000000),energy:40};};
export function adOffer(s,rng=Math.random){const L=liquid(s);const list=L>=5000000?SPONSORS:SPONSORS.slice(0,3);const sp=pick(list,rng);return {id:uid(),type:'v12-ad',sponsor:sp.id,settled:false,city:s.life.city,rarity:'rare'};}
export function claimAd(s){const o=s.offer;if(o.type!=='v12-ad'||o.settled)throw Error('done');const r=adReward(s);s.cash=Math.min(CAP,s.cash+r.cash);s.life.energy=Math.min(s.life.energyCap||200,s.life.energy+r.energy);o.settled=true;o.result=r;s.peak=Math.max(s.peak||0,worth(s));return r;}

/* ---------- city signature deals: each city has its own style, rules, and visible min/max ---------- */
// style drives the card's look. min/max in dollars (scaled up with the player's class via scale()).
export const CITY_STYLE={
 taipei:{zh:'台北 · 夜市霓虹',en:'Taipei · night-market neon',rule:['小额稳健：胜率高、倍数低','Small & steady: high odds, low multiple'],pmod:8,umod:-.15},
 tokyo:{zh:'东京 · 匠人与科技',en:'Tokyo · craft & tech',rule:['双重审核：两轮都过才赢，倍数高','Double review: pass two rounds, bigger multiple'],pmod:0,umod:.35,double:true},
 vegas:{zh:'拉斯维加斯 · 霓虹赌城',en:'Las Vegas · neon gamble',rule:['高波动：胜率低、倍数翻倍','High volatility: low odds, doubled multiple'],pmod:-14,umod:1.1},
 singapore:{zh:'新加坡 · 港口贸易',en:'Singapore · port trade',rule:['稳健贸易：失败只亏一半本金','Safe trade: failure loses only half the stake'],pmod:-4,umod:0,half:true},
 newyork:{zh:'纽约 · 华尔街',en:'New York · Wall Street',rule:['杠杆：投入越多，倍数越高','Leverage: bigger stake, bigger multiple'],pmod:-2,umod:.2,lever:true},
 monaco:{zh:'摩纳哥 · 游艇与赛车',en:'Monaco · yachts & racing',rule:['门槛极高，赢了额外送 LV','Very high entry; wins also grant LV'],pmod:2,umod:.25,lv:true}
};
export const CITY_DEALS={
 taipei:[{id:'bubble',icon:'coffee',zh:'珍珠奶茶快闪店',en:'Bubble-tea pop-up',min:2000,max:15000,p:78,up:1.35},{id:'nightstall',icon:'noodle',zh:'士林夜市摊位',en:'Shilin night-market stall',min:3000,max:25000,p:74,up:1.45},{id:'scooter',icon:'carkey',zh:'机车维修连锁',en:'Scooter repair chain',min:10000,max:80000,p:70,up:1.5},{id:'chip',icon:'briefcase',zh:'芯片供应商订单',en:'Chip supplier order',min:200000,max:5000000,p:66,up:1.6}],
 tokyo:[{id:'ramen',icon:'noodle',zh:'深夜拉面屋',en:'Late-night ramen bar',min:3000,max:30000,p:72,up:1.6},{id:'anime',icon:'story',zh:'动画工作室制作委员会',en:'Anime production committee',min:20000,max:200000,p:64,up:1.9},{id:'robot',icon:'bolt',zh:'服务机器人原型',en:'Service robot prototype',min:100000,max:2000000,p:60,up:2.2},{id:'sake',icon:'champagne',zh:'百年酒藏',en:'Century-old sake brewery',min:500000,max:8000000,p:70,up:1.7}],
 vegas:[{id:'slots2',icon:'chips',zh:'老虎机厅分成',en:'Slot-hall revenue share',min:3000,max:50000,p:40,up:2.8},{id:'show',icon:'medal',zh:'驻场魔术秀',en:'Resident magic show',min:20000,max:300000,p:45,up:2.6},{id:'boxing',icon:'cards',zh:'拳击之夜赞助',en:'Fight-night sponsorship',min:100000,max:3000000,p:38,up:3.4},{id:'resort',icon:'crown',zh:'赌场度假村股份',en:'Casino resort stake',min:2000000,max:50000000,p:46,up:2.5}],
 singapore:[{id:'hawker',icon:'noodle',zh:'小贩中心摊位',en:'Hawker-centre stall',min:3000,max:30000,p:68,up:1.5},{id:'container',icon:'box',zh:'集装箱航次',en:'Container voyage',min:50000,max:1000000,p:64,up:1.7},{id:'fintech',icon:'invest',zh:'金融科技牌照',en:'Fintech licence',min:300000,max:6000000,p:60,up:1.9},{id:'refinery',icon:'bolt',zh:'裕廊炼化合约',en:'Jurong refinery contract',min:3000000,max:80000000,p:62,up:1.8}],
 newyork:[{id:'bagel',icon:'coffee',zh:'布鲁克林贝果店',en:'Brooklyn bagel shop',min:5000,max:40000,p:66,up:1.6},{id:'ipo',icon:'invest',zh:'科技股 IPO 认购',en:'Tech IPO allocation',min:50000,max:2000000,p:58,up:2.0},{id:'broadway',icon:'medal',zh:'百老汇新剧',en:'Broadway premiere',min:200000,max:5000000,p:52,up:2.3},{id:'tower2',icon:'crown',zh:'曼哈顿写字楼',en:'Manhattan office tower',min:5000000,max:200000000,p:64,up:1.8}],
 monaco:[{id:'yachtc',icon:'yacht',zh:'游艇包租季',en:'Yacht charter season',min:500000,max:10000000,p:66,up:1.8,lv:3},{id:'gp',icon:'carkey',zh:'大奖赛车队赞助',en:'Grand Prix team sponsorship',min:2000000,max:40000000,p:56,up:2.2,lv:6},{id:'casino2',icon:'chips',zh:'蒙特卡洛赌场包厢',en:'Monte Carlo casino salon',min:1000000,max:30000000,p:48,up:2.6,lv:4},{id:'jewel',icon:'diamond',zh:'高级珠宝首展',en:'Haute joaillerie debut',min:10000000,max:300000000,p:62,up:2.0,lv:10}]
};
// scale(): richer players see bigger versions of the same city deals, low-tier ones stay small
const tierScale=t=>t<=2?1:10**Math.min(6,(t-2)*.8);
export function cityOffer(s,rng=Math.random){const city=s.life.city in CITY_DEALS?s.life.city:'taipei';const L=liquid(s),t=liquidTier(s),k=tierScale(t);
 const list=CITY_DEALS[city].map(d=>({...d,min:Math.round(d.min*k),max:Math.round(d.max*k)})).filter(d=>d.min*100<=L*.8);
 if(!list.length)return null;const d=list[Math.min(list.length-1,Math.floor(rng()*list.length*1.2))]||list[0];const S=CITY_STYLE[city];
 const p=clamp(d.p+(S.pmod>0?0:0),5,95);
 return {id:uid(),type:'v12-city',city,deal:d.id,min:d.min*100,max:Math.min(d.max*100,Math.floor(L*.9)),p,up:d.up,lv:d.lv||0,stake:Math.max(d.min*100,Math.min(d.max*100,Math.floor(L*.15))),settled:false,rarity:'epic'};}
export function playCity(s,stake,rng=Math.random){const o=s.offer;if(o.type!=='v12-city'||o.settled)throw Error('done');stake=Math.floor(Number(stake)||0);if(stake<o.min||stake>o.max||stake>=s.cash)throw Error('range');if(s.life.energy<3)throw Error('energy');s.life.energy-=3;
 const S=CITY_STYLE[o.city]||{};let up=o.up;if(S.lever)up=+(o.up+.6*((stake-o.min)/Math.max(1,o.max-o.min))).toFixed(2);
 let won;const rolls=[];if(S.double){const p1=Math.sqrt(o.p/100)*100;const a=rng()*100,b=rng()*100;rolls.push(a,b);won=a<p1&&b<p1;}else{const a=rng()*100;rolls.push(a);won=a<o.p;}
 const d=won?Math.floor(stake*up)-stake:-(S.half?Math.floor(stake/2):stake);s.cash=clamp(s.cash+d,0,CAP);
 s.investments=(s.investments||0)+1;if(won){s.wins=(s.wins||0)+1;s.streak=(s.streak||0)+1;}else s.streak=0;
 const v=st(s);if(won&&o.lv){v.lvBonus=(v.lvBonus||0)+o.lv;}
 s.history?.unshift({won,multiplier:won?up:0,stake,returned:won?stake+d:Math.max(0,stake+d),profit:d,cashAfterBet:s.cash,lossScope:'stake',page:s.page,project:'coffee',special:null,rarity:'epic',at:Date.now()});if(s.history)s.history=s.history.slice(0,40);
 o.settled=true;o.result={won,delta:d,stake,up,rolls,lv:won?o.lv:0};s.peak=Math.max(s.peak||0,worth(s));return o.result;}

/* ---------- more partners: choose-your-stake deals and special partners ---------- */
const MORE_PARTNERS=[
 {id:'chef',img:'p-grandma',at:300000,spec:['餐饮加盟 · 你决定投多少','Restaurant franchise · you pick the stake'],risk:1,zh:'Marco · 主厨',en:'Marco · head chef',
  meet:['我的菜单能排队三条街。缺的只是一间店面。','My menu could draw a queue three blocks long. I just need a storefront.'],
  lines:[['新菜试吃会，来不来？','Tasting night for the new menu — coming?'],['评论家给了我们四颗星！','The critic gave us four stars!'],['第三家分店，写你的名字。','The third branch carries your name.']],
  deals:[{icon:'noodle',zh:'加盟新店（自选金额）',en:'Franchise a new outlet (pick amount)',choose:[.1,.25,.5],p:74,up:1.5},{icon:'coffee',zh:'早午餐快闪',en:'Brunch pop-up',stakePct:.12,p:80,up:1.3}]},
 {id:'hacker',img:'p-founder',at:800000,spec:['情报贩子 · 买内幕、改概率','Info broker · buy intel, tilt the odds'],risk:2,zh:'「零」 · 白帽黑客',en:'"Zero" · white-hat hacker',special:true,
  meet:['我不卖密码，我卖“提前知道”。','I don\u2019t sell passwords. I sell knowing first.'],
  lines:[['市场有异动，我截到一段消息。','Unusual market movement. I caught a message.'],['你是我唯一信任的客户。','You\u2019re the only client I trust.'],['最后一份，免费。','The last one is on the house.']],
  deals:[{icon:'story',zh:'买一份内幕情报',en:'Buy an intel package',costPct:.04,min:20000,intel:5,desc:['接下来 5 个项目成功率 +6%','Next 5 projects +6% odds']},{icon:'bolt',zh:'做空传闻（自选金额）',en:'Short the rumour (pick amount)',choose:[.1,.2,.4],p:55,up:2.1}]},
 {id:'heiress',img:'p-art',at:5000000,spec:['名媛社交 · 奢侈品与人脉','Socialite · luxury and connections'],risk:2,zh:'Vivienne · 名门千金',en:'Vivienne · heiress',
  meet:['父亲说你是“新钱”。我倒觉得新钱更有意思。','Father calls you "new money". I think new money is more fun.'],
  lines:[['今晚的慈善晚宴，缺一位舞伴。','Tonight\u2019s charity gala needs a dance partner.'],['我的朋友们开始打听你了。','My friends are asking about you.'],['家族信托的一席，留给你。','A seat on the family trust is yours.']],
  deals:[{icon:'champagne',zh:'慈善晚宴竞拍',en:'Charity gala auction',stakePct:.1,p:70,up:1.6,lv:3},{icon:'handbag',zh:'联名品牌（自选金额）',en:'Co-brand a label (pick amount)',choose:[.1,.25,.4],p:62,up:1.9}]},
 {id:'mystic',img:'p-gambler',at:1500000,spec:['神秘人 · 每次都是特殊事件','The stranger · every visit is a special event'],risk:3,zh:'无名旅人',en:'The nameless traveller',special:true,
  meet:['我在很多城市见过你。只是你没注意到我。','I\u2019ve seen you in many cities. You just never noticed me.'],
  lines:[['又见面了。今天我带来一个盒子。','We meet again. Today I brought a box.'],['命运喜欢你。暂时。','Fate likes you. For now.'],['这是最后一次了。打开它。','This is the last time. Open it.']],
  deals:[{icon:'box',zh:'打开神秘盒子',en:'Open the mystery box',mystery:true,stakePct:.08},{icon:'cards',zh:'和他赌一枚硬币（自选金额）',en:'Bet him on a coin (pick amount)',choose:[.05,.15,.3],p:50,up:2}]},
 {id:'mayor',img:'p-captain2',at:30000000,spec:['市长 · 城市基建与特权','The mayor · city projects and privileges'],risk:1,zh:'市长 · 陈先生',en:'Mayor Chen',
  meet:['城市需要投资人。当然，也需要投票。','The city needs investors. And votes, of course.'],
  lines:[['地铁新线要开标了。','The new metro line is up for tender.'],['你的名字出现在奠基石上。','Your name is on the foundation stone.'],['下一届，我们一起。','Next term, we do it together.']],
  deals:[{icon:'briefcase',zh:'地铁新线（自选金额）',en:'New metro line (pick amount)',choose:[.1,.2,.35],p:76,up:1.45},{icon:'crown',zh:'城市冠名权',en:'City naming rights',stakePct:.15,p:68,up:1.5,lv:8}]}
];
for(const p of MORE_PARTNERS)if(!PARTNERS.some(x=>x.id===p.id))PARTNERS.push(p);
export const MYSTERY=[
 {w:30,zh:'盒子里是一把旧钥匙和一张支票。',en:'Inside: an old key and a cheque.',mult:3},
 {w:30,zh:'盒子是空的。旅人笑了笑，消失在人群里。',en:'The box is empty. The traveller smiles and vanishes into the crowd.',mult:0},
 {w:20,zh:'一张泛黄的地图——指向一处被遗忘的仓库。',en:'A yellowed map pointing to a forgotten warehouse.',mult:6},
 {w:15,zh:'一枚古董金币，收藏家当场出价。',en:'An antique gold coin; a collector bids on the spot.',mult:2,lv:2},
 {w:5,zh:'一封信：“你终将登顶。”还有一张巨额本票。',en:'A letter: "You will reach the top." And a huge promissory note.',mult:15,lv:5}
];
export function openMystery(s,rng=Math.random){const stake=Math.max(1,Math.floor(s.cash*.08));if(stake>=s.cash)throw Error('cash');let r=rng()*100,m=MYSTERY[0];for(const x of MYSTERY){if(r<x.w){m=x;break;}r-=x.w;}
 const d=Math.floor(stake*m.mult)-stake;s.cash=clamp(s.cash+d,0,CAP);if(m.lv){const v=st(s);v.lvBonus=(v.lvBonus||0)+m.lv;}s.peak=Math.max(s.peak||0,worth(s));return {won:d>0,delta:d,stake,text:m,lv:m.lv||0};}
export function chooseDeal(s,d,pct,rng=Math.random){const stake=Math.max(1,Math.floor(s.cash*pct));if(stake>=s.cash)throw Error('cash');const won=rng()*100<d.p;const delta=won?Math.floor(stake*d.up)-stake:-stake;s.cash=clamp(s.cash+delta,0,CAP);
 s.investments=(s.investments||0)+1;if(won){s.wins=(s.wins||0)+1;s.streak=(s.streak||0)+1;}else s.streak=0;s.peak=Math.max(s.peak||0,worth(s));return {won,delta,stake,p:d.p};}

/* ---------- new zones (decks) ---------- */
export const NEW_ZONES={
 mall:{icon:'handbag',zh:'商店街',en:'Shopping street',desc:['小卖部、超市、百货。每次进货都不同。','Kiosks, markets, department stores. Fresh stock every visit.'],at:30000},
 city:{icon:'compass2',zh:'城市特色区',en:'City signature quarter',desc:['只有这座城市才有的项目和规则。','Deals and rules found only in this city.'],at:300000}
};

/* ---------- wire into the v9 deck engine ---------- */
import {HOOKS,ZONES} from './v9-core.js';
Object.assign(ZONES,NEW_ZONES);
HOOKS.shop=(s,rng)=>shopOffer(s,rng);HOOKS.ad=adOffer;HOOKS.city=cityOffer;HOOKS.adsOK=()=>!!globalThis.__adsOK;
