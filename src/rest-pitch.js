// Rest-phase investment pitches. Pure rules, no DOM. All money is integer cents.
// During a paid rest, people show up and offer deals. Wealthier players attract bigger pitches.
// Each rest resolves each pitch exactly once and the roll is locked into the save.

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// band 0 = street money, 1 = comfortable, 2 = serious capital, 3 = institutional
export const PITCHES=[
 // ---- band 0: 生存 / 工薪 ----
 {id:'stall-share',band:0,type:'餐饮',rarity:'common',glyph:'🍜',color:'#c08a4e',
  who:'夜市摊主 · 阿丽',line:'你要不要入一股？明天一早我们就开档。',
  title:'夜市小摊合股',cost:.22,p:72,up:1.55,
  note:'一夜的营业额，不多，但看得见。'},
 {id:'scooter-fleet',band:0,type:'物流',rarity:'common',glyph:'🛵',color:'#5b8ec4',
  who:'跑单骑手 · 小林',line:'凑两台车，我拉你分成，不骗人。',
  title:'两台外送机车',cost:.28,p:66,up:1.8,
  note:'雨天订单翻倍，也更容易出事。'},
 {id:'laundry-coin',band:0,type:'服务',rarity:'uncommon',glyph:'🧺',color:'#7ba38c',
  who:'洗衣店老板娘 · 陈姨',line:'投币机很稳的，就是要先换新机。',
  title:'自助洗衣投币机',cost:.35,p:79,up:1.42,
  note:'回本慢，但几乎不会归零。'},
 {id:'street-band',band:0,type:'文化',rarity:'uncommon',glyph:'🎸',color:'#b07ba3',
  who:'街头乐队 · 阿吉',line:'帮我们出录音棚的钱，专辑收入分你三成。',
  title:'街头乐队第一张专辑',cost:.3,p:58,up:2.4,
  note:'会红吗？没人知道。但很好听。'},
 // ---- band 1: 中产 ----
 {id:'cafe-second',band:1,type:'餐饮',rarity:'uncommon',glyph:'☕',color:'#a3784f',
  who:'咖啡店主 · 佑希',line:'第二家店的租约就在下周，我需要一个合伙人。',
  title:'第二家咖啡店',cost:.26,p:70,up:1.9,
  note:'品牌有了，位置是赌注。'},
 {id:'indie-game',band:1,type:'科技',rarity:'rare',glyph:'🎮',color:'#6f7fc4',
  who:'独立开发者 · 诺亚',line:'我做了三年了，只差最后的发行费。',
  title:'独立游戏发行',cost:.32,p:55,up:3.2,
  note:'要么无人问津，要么一夜刷屏。'},
 {id:'cold-chain',band:1,type:'物流',rarity:'uncommon',glyph:'🚚',color:'#4f8fa0',
  who:'冷链调度 · 老崔',line:'这条线路的货主已经签了，就缺车队押金。',
  title:'冷链货运线路',cost:.4,p:76,up:1.75,
  note:'合同在手，风险在路上。'},
 {id:'rooftop-solar',band:1,type:'能源',rarity:'rare',glyph:'🔆',color:'#c9a24d',
  who:'工程师 · 玛雅',line:'整栋楼的屋顶，我们可以一起买下来发电。',
  title:'屋顶光伏电站',cost:.45,p:81,up:1.65,
  note:'回报稳，周期长，政策会变。'},
 {id:'vintage-lot',band:1,type:'收藏',rarity:'rare',glyph:'⌚',color:'#8f7a52',
  who:'古董商 · 索菲',line:'这批表的来源干净，我保证。',
  title:'古董腕表批货',cost:.38,p:63,up:2.6,
  note:'真伪只有开箱才知道。'},
 // ---- band 2: 富裕 / 大人物 ----
 {id:'boutique-hotel',band:2,type:'地产',rarity:'rare',glyph:'🏨',color:'#7a94b8',
  who:'开发商 · 韩先生',line:'老厂房改精品酒店，图纸已经批了。',
  title:'旧厂改精品酒店',cost:.3,p:72,up:2.2,
  note:'改造工程最怕的永远是超支。'},
 {id:'biotech-round',band:2,type:'医疗',rarity:'epic',glyph:'🧬',color:'#5aa08c',
  who:'研究员 · 卡门博士',line:'二期试验的数据很漂亮，但我们缺钱走完。',
  title:'生技公司 B 轮',cost:.35,p:52,up:4.2,
  note:'成，是改变行业；败，是一场空。'},
 {id:'film-slate',band:2,type:'娱乐',rarity:'epic',glyph:'🎬',color:'#b3719a',
  who:'制片人 · 罗兰',line:'三部片一起投，风险自然摊平。',
  title:'三部电影片单',cost:.4,p:60,up:3.4,
  note:'票房是玄学，但片单不是。'},
 {id:'port-terminal',band:2,type:'基建',rarity:'rare',glyph:'⚓',color:'#4c7f96',
  who:'港务顾问 · 陈',line:'码头的第三泊位，特许权即将开放竞标。',
  title:'港口第三泊位',cost:.5,p:78,up:1.95,
  note:'现金流极稳，但门槛极高。'},
 {id:'fashion-house',band:2,type:'时尚',rarity:'rare',glyph:'👗',color:'#c07c8e',
  who:'设计总监 · 伊莎',line:'巴黎的档期我拿到了，缺的是这一季的钱。',
  title:'时装屋一整季',cost:.33,p:64,up:2.8,
  note:'走秀之后，才知道有没有订单。'},
 // ---- band 3: 私人资本以上 ----
 {id:'orbital-relay',band:3,type:'航天',rarity:'legendary',glyph:'🛰️',color:'#6d7fae',
  who:'发射总监 · 韦拉',line:'一次发射窗口，我们要的是长期频段。',
  title:'近地通信中继星',cost:.28,p:58,up:4.5,
  note:'一枚火箭，决定十年的账。'},
 {id:'city-district',band:3,type:'地产',rarity:'legendary',glyph:'🏙️',color:'#7d93a8',
  who:'城市规划师 · 昂内',line:'整个街区的重建权，只谈一次。',
  title:'城市街区重建权',cost:.35,p:70,up:3.2,
  note:'你会改写这条街的样子。'},
 {id:'sovereign-bond',band:3,type:'金融',rarity:'epic',glyph:'🏦',color:'#8a8256',
  who:'主权基金代表 · 阿米尔',line:'收益不高，但它几乎不会消失。',
  title:'主权基金联合配售',cost:.45,p:88,up:1.38,
  note:'最无聊的一笔，也是最稳的一笔。'},
 {id:'fusion-pilot',band:3,type:'能源',rarity:'legendary',glyph:'⚛️',color:'#5e9aa0',
  who:'首席科学家 · 林道',line:'如果成了，能源价格会被重写。',
  title:'聚变示范堆',cost:.4,p:44,up:6.5,
  note:'人类级别的赌注。'},
 {id:'art-foundation',band:3,type:'文化',rarity:'epic',glyph:'🖼️',color:'#a2865c',
  who:'基金会理事 · 杜兰',line:'这不是投资，是让你的名字留在墙上。',
  title:'私人美术馆基金',cost:.3,p:82,up:1.55,
  note:'回报有限，声望可观。'}
];

export const bandFor=worthCents=>
 worthCents>=1000000000?3:worthCents>=10000000?2:worthCents>=1000000?1:0;

const hashSeed=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;};

/** Deterministic per-rest slate. Refreshing the page must not reroll it. */
export function pitchesFor(s){
 const rest=s.life?.rest;
 if(!rest||!rest.paid)return [];
 const w=(s.life?.currentWorth||s.cash||0);
 const band=bandFor(w);
 // Draw from the current band plus one below, so variety stays high.
 const pool=PITCHES.filter(p=>p.band===band||p.band===band-1);
 const seedBase=`${s.id}:${rest.id||rest.class}:${s.life.restCount||0}`;
 const scored=pool.map(p=>({p,r:hashSeed(seedBase+':'+p.id)})).sort((a,b)=>a.r-b.r);
 const count=band>=2?3:2;
 return scored.slice(0,count).map(({p,r})=>{
  // Stake scales with the player's cash so the offer always feels relevant.
  const cost=Math.max(100,Math.round(s.cash*p.cost));
  return {...p,cost,roll:r,payout:Math.round(cost*p.up)};
 });
}

export const pitchDone=(s,id)=>Array.isArray(s.life?.rest?.pitches)&&s.life.rest.pitches.includes(id);

/** Resolve one pitch. Result is written into the save so it cannot be rerolled. */
export function takePitch(s,id){
 const rest=s.life?.rest;
 if(!rest||!rest.paid)throw Error('请先支付休息账单，再谈投资。');
 if(pitchDone(s,id))throw Error('这个提案已经谈过了。');
 const offer=pitchesFor(s).find(p=>p.id===id);
 if(!offer)throw Error('这位来客已经离开了。');
 if(s.cash<=offer.cost)throw Error('现金不足，投入后必须还有剩余。');
 rest.pitches=[...(rest.pitches||[]),id];
 // Roll is derived from the locked seed, not from Math.random, so it survives a refresh.
 const roll=hashSeed(`${s.id}:${rest.id||rest.class}:${id}:outcome`);
 const won=roll*100<offer.p;
 s.cash=clamp(s.cash-offer.cost+(won?offer.payout:0),0,9e14);
 const result={id,won,cost:offer.cost,gain:won?offer.payout:0,delta:(won?offer.payout:0)-offer.cost,title:offer.title,who:offer.who};
 rest.pitchResults=[...(rest.pitchResults||[]),result];
 return result;
}

export const pitchResult=(s,id)=>(s.life?.rest?.pitchResults||[]).find(r=>r.id===id)||null;
