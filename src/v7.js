// v7 layer: wealth-tiered in-world HUD, mechanism icon bars, seasons/weather,
// shaped city panorama, vertical unlock rail, draggable windows, delayed projects, rest mini-games.
// Everything reads the live run through ctx; money stays in integer cents.
import {worth,lateTier,TIERS_LATE,billQuote} from './endgame-core.js';
import {getCity,CLASSES} from './life-core.js';
import {escape as safe} from './ui.js';

const $=id=>document.getElementById(id);
const fmt=(c,compact=true)=>{const d=c/100;if(compact&&Math.abs(d)>=1e6){const u=[[1e12,'万亿'],[1e8,'亿'],[1e4,'万']].find(([v])=>Math.abs(d)>=v);const n=d/u[0];return '$'+(n>=100?Math.round(n).toString():n.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1'))+u[1];}return '$'+d.toLocaleString('en-US',{minimumFractionDigits:Math.abs(d)<1000&&d%1?2:0,maximumFractionDigits:Math.abs(d)<1000?2:0});};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

/* ---------- icon art (24x24 line glyphs, drawn inside tier-shaped frames) ---------- */
const G={
 rest:'<path d="M15 3a8 8 0 1 0 6 12A9 9 0 0 1 15 3Z"/><path d="M5 20h14"/>',
 settings:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
 bill:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2Z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
 talent:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 2 6 5"/>',
 travel:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 status:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 ledger:'<path d="M5 3h11l3 3v15H5Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 radio:'<rect x="3" y="8" width="18" height="12" rx="2"/><circle cx="15.5" cy="14" r="3"/><path d="M6 12h4M6 15h4M7 8l10-5"/>',
 atlas:'<path d="m12 2 8.7 5v10L12 22l-8.7-5V7Z"/><path d="M12 7v10M7.5 9.5l9 5M16.5 9.5l-9 5"/>',
 showdown:'<circle cx="8" cy="12" r="5"/><circle cx="16" cy="12" r="5"/><path d="M8 9.5v5M16 9.5v5"/>',
 advanced:'<path d="m7 3-5 6 10 12L22 9l-5-6Z"/><path d="M2 9h20M12 21 7 9l5-6 5 6Z"/>',
 filter:'<path d="M3 13l2-5h14l2 5v5H3Z"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/><path d="M6 13h12"/>',
 music:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
 security:'<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
 factions:'<circle cx="12" cy="6" r="3"/><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M10.5 8.5 6.5 14.5M13.5 8.5l4 6M8 17h8"/>',
 regions:'<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
 medals:'<circle cx="12" cy="15" r="6"/><path d="m8 3 4 6 4-6M12 12l1 2h2l-1.6 1.3.6 2.2-2-1.3-2 1.3.6-2.2L9 14h2Z"/>',
 headphones:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="2.5" y="14" width="4.5" height="7" rx="1.5"/><rect x="17" y="14" width="4.5" height="7" rx="1.5"/>',
 chain:'<path d="M9 7a4 4 0 0 1 6 0M7 11a6 6 0 0 0 10 0"/><circle cx="12" cy="16" r="3.2"/><path d="M12 14.6v2.8M10.6 16h2.8"/>',
 neon:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M7 12V8l3 4V8M14 8h3M14 10h2M14 12h3"/><path d="M8 20h8M12 16v4"/>',
 champagne:'<path d="M8 2h8l-1 7a3 3 0 0 1-6 0Z"/><path d="M12 12v8M8 21h8"/><circle cx="11" cy="5" r=".6"/><circle cx="13" cy="7" r=".6"/>',
 driver:'<path d="M2 14l2.5-5h11l3.5 5h3v4H2Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M7 9V6h6v3"/>',
 painting:'<rect x="3" y="4" width="18" height="15" rx="1"/><rect x="6" y="7" width="12" height="9"/><path d="m6 15 4-4 3 3 2-2 3 3"/>',
 cigar:'<rect x="2" y="12" width="17" height="4" rx="2"/><path d="M19 12h3v4h-3M6 12v4M17 8c0-2 2-2 2-4M20 8c0-2 2-2 2-4"/>',
 yacht:'<path d="M3 16h18l-3 4H6Z"/><path d="M12 3v13M12 4l7 10h-7M12 7 7 14h5"/>',
 jet:'<path d="M2 13l8-1 5-8h2l-2 8 5 1 2-3h1l-1 5 1 5h-1l-2-3-5 1 2 8h-2l-5-8-8-1Z"/>',
 vault:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="5"/><path d="M12 7v2M12 15v2M7 12h2M15 12h2M3 8h2M3 16h2"/>',
 crown:'<path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 12H5Z"/><path d="M5 16h14"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 hourglass:'<path d="M6 2h12M6 22h12M7 2c0 6 10 6 10 10S7 16 7 22M17 2c0 6-10 6-10 10s10 4 10 10"/>'
};
const glyph=(k,cls='')=>`<svg class="v7-glyph ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${G[k]||G.lock}</svg>`;

/* ---------- mechanism catalogue: every unlock owns a big icon on the screen edge ----------
 kind: 'click' opens a feature, 'toggle' switches an effect, 'hover' only shows details. */
export const MECHS=[
 {id:'rest',at:0,slot:'bottom',kind:'click',g:'rest',name:'休息',desc:'体力用完就要休息。休息时有阶级小游戏可以缩短时间。',action:'life-prompt-rest'},
 {id:'settings',at:0,slot:'bottom',kind:'click',g:'settings',name:'设置',desc:'存档、音乐、画质与教程。',action:'menu'},
 {id:'bill',at:250,slot:'top',kind:'hover',g:'bill',name:'生活账单',desc:'live-bill'},
 {id:'talent',at:250,slot:'top',kind:'hover',g:'talent',name:'街头人脉',desc:'沿途会遇到人才市场，可签约随从；点击场景里的随从管理。'},
 {id:'headphones',at:300,slot:'top',kind:'toggle',g:'headphones',name:'二手耳机',desc:'开：界面跟着音乐节拍轻轻律动。',fx:'beat',deco:true},
 {id:'travel',at:500,slot:'bottom',kind:'click',g:'travel',name:'旅行',desc:'打开世界地图，前往其他城市。',action:'life-map'},
 {id:'status',at:500,slot:'bottom',kind:'click',g:'status',name:'身家',desc:'总身家、账单、健康与机制。',action:'life-status'},
 {id:'ledger',at:1000,slot:'bottom',kind:'click',g:'ledger',name:'账本',desc:'回看每一笔投资盈亏。',action:'history'},
 {id:'radio',at:1500,slot:'top',kind:'toggle',g:'radio',name:'街头电台',desc:'开：金钱下方滚动播报本阶层能接触到的消息。',fx:'radio'},
 {id:'chain',at:2000,slot:'top',kind:'toggle',g:'chain',name:'小金链',desc:'开：钱包闪着一点金光。装饰，不改胜率。',fx:'chain',deco:true},
 {id:'atlas',at:3000,slot:'bottom',kind:'click',g:'atlas',name:'机制图谱',desc:'全部机制与门槛一览。',action:'life-mechanisms'},
 {id:'showdown',at:5000,slot:'top',kind:'hover',g:'showdown',name:'对赌合约',desc:'路上会出现硬币对决、极速合约等高风险特殊项目。'},
 {id:'neon',at:8000,slot:'top',kind:'toggle',g:'neon',name:'霓虹招牌',desc:'开：界面描上一圈霓虹光。装饰。',fx:'neon',deco:true},
 {id:'advanced',at:10000,slot:'top',kind:'hover',g:'advanced',name:'高级项目',desc:'中产起步：出现多轮审核的高级复合项目，投资上限提高。'},
 {id:'champagne',at:20000,slot:'top',kind:'toggle',g:'champagne',name:'香槟塔',desc:'开：画面飘起香槟气泡。装饰。',fx:'bubbles',deco:true},
 {id:'filter',at:25000,slot:'bottom',kind:'click',g:'filter',name:'轿车过滤',desc:'购买二手轿车后，可自动跳过低级项目。',action:'life-filter'},
 {id:'music',at:50000,slot:'bottom',kind:'click',g:'music',name:'音乐管家',desc:'选择城市配乐与阶层原声。',action:'music'},
 {id:'driver',at:60000,slot:'top',kind:'hover',g:'driver',name:'私人司机',desc:'司机在路边等你。纯装饰——但你会注意到路人的眼神变了。',deco:true},
 {id:'security',at:100000,slot:'bottom',kind:'click',g:'security',name:'私人安保',desc:'雇佣保镖、调整姿态。',action:'life-security'},
 {id:'factions',at:100000,slot:'bottom',kind:'click',g:'factions',name:'社群关系',desc:'各派系对你的好感。',action:'life-factions'},
 {id:'painting',at:150000,slot:'top',kind:'toggle',g:'painting',name:'名画收藏',desc:'开：城市全景换上鎏金画框。装饰。',fx:'gilt',deco:true},
 {id:'cigar',at:400000,slot:'top',kind:'toggle',g:'cigar',name:'雪茄会所',desc:'开：画面边缘一层暖色烟雾。装饰。',fx:'smoke',deco:true},
 {id:'regions',at:1000000,slot:'bottom',kind:'click',g:'regions',name:'私人区域',desc:'进入城市的高端区域。',action:'life-regions'},
 {id:'medals',at:1000000,slot:'bottom',kind:'click',g:'medals',name:'荣誉典藏',desc:'孤品拍卖与勋章墙。',action:'life-show-medals'},
 {id:'yacht',at:2000000,slot:'top',kind:'toggle',g:'yacht',name:'游艇徽章',desc:'开：画面底部泛起海面波光。装饰。',fx:'waves',deco:true},
 {id:'jet',at:10000000,slot:'top',kind:'toggle',g:'jet',name:'私人飞机',desc:'开：你的飞机不时掠过天空。装饰。',fx:'jet',deco:true},
 {id:'vault',at:100000000,slot:'top',kind:'hover',g:'vault',name:'家族金库',desc:'live-vault',deco:true},
 {id:'crown',at:1000000000,slot:'top',kind:'toggle',g:'crown',name:'无形王冠',desc:'开：金钱牌上戴一顶王冠。装饰。',fx:'crown',deco:true}
];
const GATES=[...new Set(MECHS.map(m=>m.at))].sort((a,b)=>a-b);

/* ---------- seasons, weather, class-flavoured news ---------- */
const SEASONS=[{id:'spring',name:'春',icon:'🌸',t:[14,24]},{id:'summer',name:'夏',icon:'☀️',t:[26,35]},{id:'autumn',name:'秋',icon:'🍁',t:[15,25]},{id:'winter',name:'冬',icon:'❄️',t:[2,13]}];
const WEATHER={
 spring:[['clear','晴朗','☀️',3],['breeze','和风','🍃',3],['drizzle','细雨','🌦️',3],['fog','晨雾','🌫️',1],['rain','春雨','🌧️',2]],
 summer:[['clear','烈日','☀️',4],['heat','热浪','🥵',2],['storm','雷阵雨','⛈️',2],['cloudy','多云','⛅',2],['rain','骤雨','🌧️',1]],
 autumn:[['clear','秋高气爽','🌤️',4],['wind','大风','🌬️',2],['cloudy','阴天','☁️',2],['fog','薄雾','🌫️',2],['rain','秋雨','🌧️',1]],
 winter:[['clear','晴冷','🌤️',2],['snow','小雪','🌨️',3],['blizzard','暴雪','❄️',1],['cloudy','阴冷','☁️',2],['fog','冻雾','🌫️',1]]
};
const NEWS=[
 ['便利店饭团 19:00 后打七折。','公园长椅今晚不会被清走。','旧书摊老板说：看不完可以明天再来。','公交月票涨了五块。','夜市收摊时，剩菜会便宜一半。','工地招临时工，日结。'],
 ['公司下周开始打卡改刷脸。','房东说下个月房租要调。','地铁加开夜班车。','信用卡分期免息活动最后三天。','楼下咖啡第二杯半价。','同事在群里转发理财课。'],
 ['学区房挂牌价又涨了 3%。','周末露营装备预售开抢。','银行理财经理约你喝咖啡。','新能源车补贴延长一年。','精品超市开进你家小区。','邻居在讨论要不要换车。'],
 ['私人银行调高了起投门槛。','高尔夫会籍转让价创新高。','画廊邀请你参加开幕酒会。','海岛度假村只接受会员预约。','家族办公室开始招聘 CFO。','米其林新店的等位要三个月。'],
 ['离岸信托新规下月生效。','游艇泊位拍出历史高价。','私人飞机托管费上调。','拍卖行夜场：一幅画成交九位数。','某基金会邀请你担任理事。','瑞士诊所开放长寿计划预约。'],
 ['央行行长的晚宴名单里有你。','一座岛屿正在私下询价。','你的名字被写进了某本财经年鉴。','主权基金想和你聊聊。','有人提议用你的名字命名一颗小行星。','世界不再有新闻，只有你的决定。']
];

/* ---------- city districts reachable from crossroads ---------- */
const DISTRICTS={
 taipei:[['大稻埕老街','p',3,'老店街坊信任你：成功率 +3%'],['信义商圈','up',.25,'商圈人流大：返还倍率 +0.25'],['士林夜市','energy',-1,'夜市热闹，逛街不累：每站少耗体力']],
 tokyo:[['秋叶原电器街','up',.3,'科技宅经济：返还倍率 +0.30'],['谷中银座','p',4,'下町人情：成功率 +4%'],['涩谷十字路口','risky',0,'人潮汹涌：成功率 −3%，返还 +0.5']],
 vegas:[['老城弗里蒙特街','p',2,'老城赌客豪爽：成功率 +2%'],['大道中段','risky',0,'霓虹最亮处：成功率 −3%，返还 +0.5'],['艺术区','up',.2,'艺术家社群：返还倍率 +0.20']],
 singapore:[['牛车水','p',3,'老字号口碑：成功率 +3%'],['滨海湾金融区','up',.3,'资金充沛：返还倍率 +0.30'],['小印度','energy',-1,'步行友好：每站少耗体力']],
 newyork:[['布鲁克林','p',3,'社区支持：成功率 +3%'],['华尔街','risky',0,'高杠杆：成功率 −3%，返还 +0.5'],['切尔西画廊区','up',.25,'藏家云集：返还倍率 +0.25']],
 monaco:[['蒙特卡洛','risky',0,'赌场区：成功率 −3%，返还 +0.5'],['摩纳哥港','up',.3,'游艇经济：返还倍率 +0.30'],['摩纳哥城堡区','p',3,'老钱圈子：成功率 +3%']]
};

/* ---------- rest mini-games: one per class, with class flavour ---------- */
const GAMES=[
 {id:'cans',name:'捡瓶罐换零钱',hint:'点掉画面里冒出来的瓶罐，20 秒内越多越好。',type:'tap',items:['🥫','🍾','🧃','🥤'],cut:[40,90,150]},
 {id:'delivery',name:'午高峰送外卖',hint:'看准时机点「出发」，让指针停在绿色区域。',type:'timing',items:['🛵'],cut:[40,90,150]},
 {id:'latte',name:'周末咖啡拉花',hint:'指针停在奶泡最漂亮的那一格。三次机会。',type:'timing',items:['☕'],cut:[50,110,170]},
 {id:'golf',name:'会所高尔夫推杆',hint:'力度要刚好。停在绿色区域就进洞。',type:'timing',items:['⛳'],cut:[60,120,180]},
 {id:'wine',name:'酒窖盲品配对',hint:'翻牌，找出两两相同的名庄酒。',type:'memory',items:['🍷','🥂','🍾','🧀','🦪','🍇'],cut:[60,120,200]},
 {id:'auction',name:'私人拍卖举牌',hint:'翻牌配对，拍下成对的孤品。',type:'memory',items:['💎','🖼️','🏺','⌚','👑','🗿'],cut:[80,150,240]}
];

export class V7{
 constructor(c){
  this.c=c;this.nextTick=0;this.prevRest=null;this.lastWorth=null;this.lastGate=null;this.beat=0;this.fxParts=[];this.lastFx=performance.now();this.dockKind='';this.drag=null;this.mg=null;
  const game=$('game');
  game.insertAdjacentHTML('beforeend',`
  <div id="v7-hud" hidden>
   <div id="v7-money" class="v7-panel"><span class="v7-crown">${glyph('crown')}</span><small id="v7-money-label">口袋里的钱</small><strong id="v7-money-value">$100</strong><div id="v7-money-sub"></div></div>
   <div id="v7-clock" class="v7-panel"><div class="v7-clock-row"><b id="v7-year"></b><span id="v7-season"></span><span id="v7-weather"></span></div><div class="v7-energy"><span>${glyph('bolt')}<i id="v7-energy-text"></i></span><div class="v7-energy-track"><i id="v7-energy-fill"></i></div></div><div id="v7-news"><span></span></div></div>
   <div id="v7-top" class="v7-bar"></div>
   <div id="v7-bottom" class="v7-bar"></div>
   <div id="v7-pano" hidden><div class="v7-pano-frame"><img alt=""><div class="v7-eq"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><b id="v7-pano-name"></b></div><svg class="v7-pano-ornament" viewBox="0 0 200 140" preserveAspectRatio="none"><path d="M6 134V40Q6 6 100 6T194 40v94" fill="none" stroke="currentColor" stroke-width="3"/><path d="M16 134V44Q16 16 100 16T184 44v90" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/><circle cx="100" cy="6" r="5" fill="currentColor"/></svg></div>
   <div id="v7-reward" class="v7-panel"></div>
   <div id="v7-rail"><div class="v7-rail-track"><i id="v7-rail-fill"></i><i id="v7-rail-ghost"></i></div><span id="v7-rail-label"></span></div>
   <div id="v7-tip" hidden></div>
  </div>
  <div id="v7-windows"></div>
  <canvas id="v7-fx" aria-hidden="true"></canvas>
  <div id="v7-season-banner" hidden></div>`);
  document.body.insertAdjacentHTML('beforeend',`<div id="v7-rotate" hidden><div><div class="v7-phone">▯</div><b>请把手机横过来</b><small>本游戏为横屏设计 · 旋转后自动继续</small><button id="v7-rotate-go">全屏横屏游玩</button></div></div>`);
  this.fx=$('v7-fx');this.fxc=this.fx.getContext('2d');
  $('v7-rotate-go').addEventListener('click',()=>this.lockLandscape());
  this.bindTips();this.bindDrag();
  new MutationObserver(()=>this.decorateDock()).observe($('game-dock'),{childList:true});
  new MutationObserver(()=>this.decorateModal()).observe($('modal-card'),{childList:true});
  const pano=$('v7-pano');pano.addEventListener('click',()=>$('city-panorama')?.click());
  addEventListener('resize',()=>this.layout());this.layout();
  document.addEventListener('pointerdown',()=>{if(this.isPhone()&&this.c.started())this.lockLandscape(true);},{once:true});
 }
 get s(){return this.c.run();}
 st(){const l=this.s.life;if(!l.v7||typeof l.v7!=='object')l.v7={};const v=l.v7;v.season=clamp(Math.floor(Number(v.season)||0),0,3);v.year=clamp(Math.floor(Number(v.year)||1),1,9999);if(!v.weather||!WEATHER[SEASONS[v.season].id].some(w=>w[0]===v.weather))v.weather=this.rollWeather(v.season);v.toggles=v.toggles&&typeof v.toggles==='object'?v.toggles:{};v.seen=Array.isArray(v.seen)?v.seen:[];v.delayed=Array.isArray(v.delayed)?v.delayed.filter(d=>d&&Number.isSafeInteger(d.stake)).slice(0,6):[];v.district=v.district&&DISTRICTS[this.s.life.city]?.some(d=>d[0]===v.district.name)?v.district:null;v.mg=v.mg&&typeof v.mg==='object'?v.mg:{};return v;}
 rollWeather(season){const list=WEATHER[SEASONS[season].id],tot=list.reduce((n,w)=>n+w[3],0);let r=Math.random()*tot;for(const w of list){r-=w[3];if(r<=0)return w[0];}return list[0][0];}
 rank(){return Math.min(5,lateTier(this.s));}
 isPhone(){return matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<700;}
 async lockLandscape(quiet){try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen({navigationUI:'hide'});}catch{}try{await screen.orientation?.lock?.('landscape');}catch{if(!quiet)this.c.toast('浏览器不允许自动旋转，请手动把手机横过来。');}this.layout();}
 layout(){const phone=this.isPhone()||(innerHeight<=500&&innerWidth>innerHeight);document.body.dataset.v7phone=phone?'yes':'no';const portrait=this.isPhone()&&innerHeight>innerWidth;$('v7-rotate').hidden=!portrait;this.fx.width=innerWidth;this.fx.height=innerHeight;}

 /* ---------- main refresh (called from renderHud) ---------- */
 refresh(){try{this.paint();}catch(e){console.error('v7',e);}}
 paint(){
  const s=this.s;if(!s?.life)return;const v=this.st(),app=$('app'),game=$('game'),started=this.c.started(),w=worth(s),rank=this.rank();
  app.dataset.v7='on';app.dataset.v7rank=rank;game.dataset.v7rank=rank;game.dataset.season=SEASONS[v.season].id;game.dataset.weather=v.weather;
  for(const m of MECHS)if(m.fx)app.dataset['fx'+m.fx[0].toUpperCase()+m.fx.slice(1)]=this.unlocked(m)&&v.toggles[m.id]!==false&&v.toggles[m.id]?'on':'off';
  $('v7-hud').hidden=!started;$('v7-hud').dataset.rest=s.life.rest?'yes':'no';
  // money
  $('v7-money-value').textContent=fmt(s.cash);$('v7-money-value').title=fmt(s.cash,false);
  $('v7-money-label').textContent=['口袋里的钱','工资卡余额','可用资金','流动资产','私人账户','家族资本'][rank];
  const q=s.life.rest?.bill||billQuote(s);$('v7-money-sub').innerHTML=`<span>${TIERS_LATE[lateTier(s)].name}</span><span>身家 ${fmt(w)}</span>`;
  // clock
  const se=SEASONS[v.season],we=WEATHER[se.id].find(x=>x[0]===v.weather)||WEATHER[se.id][0];
  const temp=Math.round(se.t[0]+(se.t[1]-se.t[0])*((v.weather.length*7+v.year*3+v.season)%10)/10)-(['rain','storm','snow','blizzard','fog'].includes(v.weather)?3:0);
  $('v7-year').textContent=`${2025+v.year} 年`;$('v7-season').textContent=`${se.icon} ${se.name}季`;$('v7-weather').textContent=`${we[2]} ${we[1]} ${temp}°`;
  $('v7-energy-text').textContent=s.life.rest?'休息中':`${s.life.energy}/${s.life.energyCap}`;$('v7-energy-fill').style.width=(s.life.rest?100:s.life.energy/s.life.energyCap*100)+'%';$('v7-clock').classList.toggle('low',!s.life.rest&&s.life.energy<30);
  const news=$('v7-news');const radio=this.unlocked(MECHS.find(m=>m.id==='radio'))&&v.toggles.radio!==false;news.hidden=!radio&&rank>0;const pool=NEWS[rank];const line=pool[(s.page+v.season)%pool.length]+(v.district?`　📍${v.district.name}：${v.district.note}`:'');if(news.dataset.line!==line){news.dataset.line=line;news.firstElementChild.textContent=line;}news.classList.toggle('ticker',radio);
  // mechanism bars
  this.paintBars(v,w);
  // panorama
  const pano=$('v7-pano'),city=getCity(s),panoOn=started&&w>=50000&&!s.life.travel;pano.hidden=!panoOn;if(panoOn){const img=pano.querySelector('img');const src=window.UPSHIFT_ART?.[city.id]||'';if(img.dataset.src!==src){img.dataset.src=src;img.src=src;}$('v7-pano-name').textContent=city.en;}
  // rail + reward
  this.paintRail(w);
  // seen-state for reclaim animation
  this.lastWorth=w;
 }
 unlocked(m){return worth(this.s)>=m.at*100;}
 iconMarkup(m,state){const v=this.st();const on=m.kind==='toggle'?(v.toggles[m.id]?'on':'off'):'';return `<button class="v7-mech k-${m.kind} ${state}" data-mech="${m.id}" data-kind="${m.kind}" ${m.kind==='click'?`data-action="${m.action}"`:m.kind==='toggle'?`data-action="v7-toggle" data-value="${m.id}"`:'tabindex="0"'} data-on="${on}" aria-label="${safe(m.name)}"><span class="v7-mech-face">${glyph(m.g)}</span><span class="v7-mech-name">${safe(m.name)}</span>${m.kind==='toggle'?'<i class="v7-switch"></i>':m.kind==='hover'?'<i class="v7-eye">i</i>':''}</button>`;}
 paintBars(v,w){
  for(const slot of ['top','bottom']){const bar=$('v7-'+slot);const list=MECHS.filter(m=>m.slot===slot);
   const want=list.filter(m=>w>=m.at*100).map(m=>m.id);
   // remove icons that fell below their gate: play the "reclaimed" animation first
   for(const el of [...bar.children]){if(!want.includes(el.dataset.mech)&&!el.classList.contains('reclaim')){el.classList.add('reclaim');el.disabled=true;setTimeout(()=>el.remove(),this.c.motion()?900:0);if(this.c.started())this.flash(`「${MECHS.find(m=>m.id===el.dataset.mech)?.name}」被收回了`,'down');}}
   for(const id of want){const m=MECHS.find(x=>x.id===id);let el=bar.querySelector(`[data-mech="${id}"]:not(.reclaim)`);
    if(!el){const tmp=document.createElement('div');tmp.innerHTML=this.iconMarkup(m,v.seen.includes(id)||!this.c.started()?'':'fresh');el=tmp.firstElementChild;const after=[...bar.children].find(x=>MECHS.findIndex(q=>q.id===x.dataset.mech)>MECHS.indexOf(m));bar.insertBefore(el,after||null);if(!v.seen.includes(id)){v.seen.push(id);if(this.c.started()&&m.at>0)this.flyIn(el,m);}}
    if(m.kind==='toggle')el.dataset.on=v.toggles[id]?'on':'off';
    if(id==='rest')el.classList.toggle('alert',this.s.life.energy<=20&&!this.s.life.rest);
   }
   bar.dataset.count=want.length;
  }
 }
 paintRail(w){
  const next=GATES.find(g=>g*100>w),prev=[...GATES].reverse().find(g=>g*100<=w)||0,rail=$('v7-rail'),box=$('v7-reward');
  if(next===undefined){$('v7-rail-fill').style.height='100%';$('v7-rail-label').textContent='全部解锁';box.innerHTML='<small>ALL UNLOCKED</small><b>你已拥有一切</b>';return;}
  const pct=clamp((w-prev*100)/((next-prev)*100),0,1);$('v7-rail-fill').style.height=(pct*100).toFixed(1)+'%';
  // ghost fill shows what a win on the current project would add
  const o=this.s.offer;let ghost=pct;const stake=Number($('stake-input')?.value)*100;if(o?.type==='project'&&!o.settled&&stake>0)ghost=clamp((w+stake*(o.up-1)-prev*100)/((next-prev)*100),0,1);$('v7-rail-ghost').style.height=(ghost*100).toFixed(1)+'%';
  $('v7-rail-label').textContent=Math.floor(pct*100)+'%';
  const group=MECHS.filter(m=>m.at===next),later=MECHS.filter(m=>m.at>next).slice(0,4);
  const key=next+':'+Math.floor(pct*100);if(box.dataset.key===key)return;const gateChanged=box.dataset.gate&&box.dataset.gate!==String(next);box.dataset.key=key;box.dataset.gate=next;
  box.innerHTML=`<small>下一个门槛 · 还差 ${fmt(next*100-w)}</small><b>${fmt(next*100)} 解锁</b><div class="v7-reward-icons">${group.map(m=>`<span class="v7-reward-item" data-for="${m.id}" title="${safe(m.name)}">${glyph(m.g)}<em>${safe(m.name)}</em></span>`).join('')}</div>${later.length?`<div class="v7-reward-later"><small>再往上</small>${later.map(m=>`<span title="${safe(m.name)} · ${fmt(m.at*100)}">${glyph(m.g)}</span>`).join('')}</div>`:''}`;
  if(gateChanged&&this.c.motion())box.animate([{transform:'scale(1.12)',filter:'brightness(1.6)'},{transform:'scale(1)',filter:'none'}],{duration:700,easing:'cubic-bezier(.2,.9,.3,1.3)'});
 }
 flyIn(el,m){if(!this.c.motion())return;const from=$('v7-reward').getBoundingClientRect();requestAnimationFrame(()=>{const to=el.getBoundingClientRect();if(!to.width)return;const ghost=document.createElement('div');ghost.className='v7-fly';ghost.innerHTML=glyph(m.g);document.body.append(ghost);ghost.animate([{left:from.left+from.width/2-30+'px',top:from.top+from.height/2-30+'px',transform:'scale(1.6) rotate(-20deg)',opacity:0},{opacity:1,offset:.15},{left:(from.left+to.left)/2+'px',top:Math.min(from.top,to.top)-60+'px',transform:'scale(1.9) rotate(10deg)',offset:.5},{left:to.left+to.width/2-30+'px',top:to.top+to.height/2-30+'px',transform:'scale(1) rotate(0)',opacity:1}],{duration:1300,easing:'cubic-bezier(.45,.05,.3,1)'}).onfinish=()=>{ghost.remove();el.animate([{transform:'scale(1.35)',filter:'brightness(2)'},{transform:'scale(1)',filter:'none'}],{duration:600});};});this.flash(`获得「${m.name}」`,'up');}
 flash(text,dir){const b=document.createElement('div');b.className='v7-flash '+dir;b.textContent=(dir==='up'?'✦ ':'↓ ')+text;$('v7-windows').append(b);setTimeout(()=>b.remove(),2600);}

 /* ---------- hover tooltips for all mechanism icons ---------- */
 bindTips(){const tip=$('v7-tip');const show=el=>{const m=MECHS.find(x=>x.id===el.dataset.mech);if(!m)return;let d=m.desc;if(d==='live-bill'){const q=this.s.life.rest?.bill||billQuote(this.s);d=`下次休息要付 ${fmt(q.total)}（阶级生活费 + 服务费）。现金不够就结束本局。`;}if(d==='live-vault')d=`金库里躺着 ${fmt(worth(this.s))}。它们不会说话，但很安静地证明你来过。`;const v=this.st();tip.innerHTML=`<b>${safe(m.name)}</b><span class="v7-tip-kind">${m.kind==='toggle'?`开关 · 当前${v.toggles[m.id]?'开启':'关闭'}`:m.kind==='hover'?'被动效果 · 仅查看':'点击打开'}${m.deco?' · 装饰':''}</span><p>${safe(d)}</p><small>解锁门槛 ${fmt(m.at*100)} · 身家跌破会被收回</small>`;tip.hidden=false;const r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;tip.style.left=clamp(r.left+r.width/2-tw/2,8,innerWidth-tw-8)+'px';tip.style.top=(r.top>innerHeight/2?r.top-th-10:r.bottom+10)+'px';};
  document.addEventListener('pointerover',e=>{const el=e.target.closest?.('.v7-mech');if(el)show(el);});document.addEventListener('pointerout',e=>{if(e.target.closest?.('.v7-mech'))tip.hidden=true;});document.addEventListener('focusin',e=>{const el=e.target.closest?.('.v7-mech');if(el)show(el);});document.addEventListener('focusout',()=>{tip.hidden=true;});
  document.addEventListener('click',e=>{const el=e.target.closest?.('.v7-mech.k-hover');if(el){show(el);setTimeout(()=>{tip.hidden=true;},2600);}});}

 /* ---------- draggable windows (dock windows, modals, delayed contracts, games) ---------- */
 bindDrag(){
  document.addEventListener('pointerdown',e=>{const h=e.target.closest?.('.v7-handle');if(!h||e.target.closest('button,input,select'))return;const win=h.closest('.v7-draggable');if(!win)return;const r=win.getBoundingClientRect();this.drag={win,id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};win.classList.add('dragging');h.setPointerCapture?.(e.pointerId);e.preventDefault();e.stopPropagation();},true);
  document.addEventListener('pointermove',e=>{const d=this.drag;if(!d||e.pointerId!==d.id)return;const w=d.win,host=w.offsetParent?.getBoundingClientRect()||{left:0,top:0};const x=clamp(e.clientX-d.dx,4-w.offsetWidth+80,innerWidth-80),y=clamp(e.clientY-d.dy,4,innerHeight-50);for(const [k,val] of [['left',x-host.left+'px'],['top',y-host.top+'px'],['right','auto'],['bottom','auto'],['translate','none'],['transform','none'],['margin','0']])w.style.setProperty(k,val,'important');w.dataset.moved='1';});
  const end=e=>{if(this.drag&&e.pointerId===this.drag.id){this.drag.win.classList.remove('dragging');this.drag=null;}};document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
 }
 resetPos(el){for(const k of ['left','top','right','bottom','translate','transform','margin'])el.style.removeProperty(k);delete el.dataset.moved;}
 decorateDock(){
  const d=$('game-dock'),s=this.s;if(!d||!s)return;const kind=s.life.rest?'rest':d.dataset.kind||'';const isWindow=!['project','special','asset','shop','challenge','auction','clinic',''].includes(kind);
  if(kind!==this.dockKind){this.resetPos(d);this.dockKind=kind;}
  d.classList.toggle('v7-draggable',isWindow);d.classList.toggle('v7-window',isWindow);d.dataset.v7kind=kind;
  if(isWindow&&!d.querySelector(':scope>.v7-handle')){const title={rest:'☾ 休息阶段',['world-event']:'⚑ 街头事件',['regional-story']:'✺ 城市故事',['talent-market']:'⌂ 人才市场',['district-gate']:'◆ 地区限定',['district-task']:'◆ 地区活动',interlude:'… 途中'}[kind]||'◇ 事件';d.insertAdjacentHTML('afterbegin',`<div class="v7-handle"><span>${title}</span><em>拖动移动 ⠿</em></div>`);}
  if(kind==='rest')this.ensureGames();else this.closeGames();
  if(!isWindow)this.enhanceDeal(d);
 }
 decorateModal(){const card=$('modal-card');if(!card)return;this.resetPos(card);card.classList.add('v7-draggable');const head=card.querySelector('.modal-head');if(head&&!head.classList.contains('v7-handle'))head.classList.add('v7-handle');else if(!head&&!card.querySelector(':scope>.v7-handle'))card.insertAdjacentHTML('afterbegin','<div class="v7-handle v7-handle-thin"><em>拖动移动 ⠿</em></div>');}
 enhanceDeal(){}  // replaced in stage B (round button + knob)
 ensureGames(){} closeGames(){}

 /* ---------- per-frame work ---------- */
 tick(now){if(now<this.nextTick)return;this.nextTick=now+120;try{this.step(now);}catch(e){console.error('v7 tick',e);}}
 step(now){
  const s=this.s;if(!s?.life)return;const v=this.st();const resting=!!s.life.rest;
  if(this.prevRest===true&&!resting&&!s.ended)this.onRestEnd(v);
  this.prevRest=resting;
  this.beatFrame();this.drawFx(now);
  if(now-(this.lastRail||0)>400){this.lastRail=now;this.paintRail(worth(s));this.measure();}
 }
 measure(){const g=$('game'),m=$('v7-money'),r=$('v7-reward'),d=$('game-dock'),p=$('v7-pano');if(m)g.style.setProperty('--v7-money-h',m.offsetHeight+'px');if(r)g.style.setProperty('--v7-reward-h',(r.offsetHeight||0)+'px');if(d){const dr=d.getBoundingClientRect(),gr=g.getBoundingClientRect();g.style.setProperty('--v7-dock-w',Math.max(0,gr.right-dr.left-24)+'px');}const b=$('v7-bottom');g.style.setProperty('--v7-bar-h',(b?.offsetHeight||90)+'px');}
 onRestEnd(v){v.season=(v.season+1)%4;if(v.season===0)v.year++;v.weather=this.rollWeather(v.season);v.district=null;this.c.save();this.c.refresh();this.seasonBanner(v);}
 seasonBanner(v){const se=SEASONS[v.season],we=WEATHER[se.id].find(x=>x[0]===v.weather);const b=$('v7-season-banner');b.hidden=false;b.dataset.season=se.id;b.innerHTML=`<span>${se.icon}</span><div><small>${2025+v.year} 年 · 新的阶段</small><b>${se.name}天到了</b><em>${we[2]} 今日天气：${we[1]}</em></div>`;if(this.c.motion())b.animate([{opacity:0,transform:'translate(-50%,-30px) scale(.8)'},{opacity:1,transform:'translate(-50%,0) scale(1)'}],{duration:700,easing:'cubic-bezier(.2,.9,.3,1.2)'});clearTimeout(this.bannerT);this.bannerT=setTimeout(()=>{b.hidden=true;},3600);}

 /* ---------- music-reactive pulse ---------- */
 beatFrame(){const m=this.c.music;if(!m?.ctx||!m.master){this.beat*=.9;}else{if(!this.analyser){try{this.analyser=m.ctx.createAnalyser();this.analyser.fftSize=64;m.master.connect(this.analyser);this.bins=new Uint8Array(this.analyser.frequencyBinCount);}catch{}}if(this.analyser){this.analyser.getByteFrequencyData(this.bins);let low=0;for(let i=1;i<6;i++)low+=this.bins[i];low/=5*255;this.beat=Math.max(low,this.beat*.82);const eq=document.querySelectorAll('#v7-pano .v7-eq i');eq.forEach((el,i)=>{el.style.height=(8+this.bins[2+i*2]/255*92)+'%';});}}document.documentElement.style.setProperty('--v7-beat',this.beat.toFixed(3));}

 /* ---------- seasonal + weather particles ---------- */
 drawFx(now){const ctx=this.fxc,W=this.fx.width,H=this.fx.height;const dt=Math.min(.2,(now-this.lastFx)/1000);this.lastFx=now;ctx.clearRect(0,0,W,H);if(!this.c.motion()||!this.c.started()||document.hidden)return;const v=this.st(),se=SEASONS[v.season].id,we=v.weather,app=$('app').dataset;
  const want={spring:14,summer:8,autumn:16,winter:22}[se]+({rain:60,drizzle:30,storm:90,snow:50,blizzard:120}[we]||0)+(app.fxBubbles==='on'?14:0);
  while(this.fxParts.length<want)this.fxParts.push(this.spawn(se,we,W,H,true));if(this.fxParts.length>want)this.fxParts.length=want;
  for(const p of this.fxParts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;if(p.y>H+20||p.x<-40||p.x>W+40||p.y<-60)Object.assign(p,this.spawn(se,we,W,H,false));ctx.save();ctx.globalAlpha=p.a;ctx.translate(p.x,p.y);ctx.rotate(p.r);
   if(p.k==='rain'){ctx.strokeStyle='rgba(170,200,230,.75)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(p.vx*.03,p.vy*.03);ctx.stroke();}
   else if(p.k==='snow'){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,p.s,0,7);ctx.fill();}
   else if(p.k==='petal'){ctx.fillStyle='#f7b9cf';ctx.beginPath();ctx.ellipse(0,0,p.s*1.4,p.s*.7,0,0,7);ctx.fill();}
   else if(p.k==='leaf'){ctx.fillStyle=p.c;ctx.beginPath();ctx.moveTo(0,-p.s*1.4);ctx.quadraticCurveTo(p.s*1.2,0,0,p.s*1.4);ctx.quadraticCurveTo(-p.s*1.2,0,0,-p.s*1.4);ctx.fill();}
   else if(p.k==='mote'){ctx.fillStyle='rgba(255,236,150,.9)';ctx.shadowColor='#ffe27a';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(0,0,p.s*.6,0,7);ctx.fill();}
   else if(p.k==='bubble'){ctx.strokeStyle='rgba(255,236,170,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,p.s,0,7);ctx.stroke();}
   ctx.restore();}
  if(we==='storm'&&Math.random()<.004){this.flashT=now;}if(this.flashT&&now-this.flashT<160){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(0,0,W,H);}
  if(app.fxJet==='on'){const t=(now/1000)%28;if(t<5){const x=W*(1.1-t/4.2),y=H*.14+t*6;ctx.save();ctx.globalAlpha=.85;ctx.fillStyle='#fff';ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+30,y);ctx.lineTo(x+260,y+4);ctx.stroke();ctx.translate(x,y);ctx.scale(-1.3,1.3);ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(18,-3);ctx.lineTo(24,0);ctx.lineTo(18,3);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(2,0);ctx.lineTo(-6,-12);ctx.lineTo(-2,0);ctx.lineTo(-6,12);ctx.closePath();ctx.fill();ctx.restore();}}
 }
 spawn(se,we,W,H,initial){const y0=initial?Math.random()*H:-20,rain=['rain','drizzle','storm'].includes(we),snow=se==='winter'||['snow','blizzard'].includes(we);const pick=Math.random();const app=$('app').dataset;
  if(app.fxBubbles==='on'&&pick<.18)return {k:'bubble',x:Math.random()*W,y:initial?Math.random()*H:H+10,vx:(Math.random()-.5)*10,vy:-(20+Math.random()*30),r:0,vr:0,s:2+Math.random()*5,a:.7};
  if(rain&&pick<.8)return {k:'rain',x:Math.random()*W*1.2,y:y0,vx:we==='storm'?-160:-50,vy:(we==='drizzle'?420:700)+Math.random()*200,r:0,vr:0,s:1,a:.55};
  if(snow)return {k:'snow',x:Math.random()*W,y:y0,vx:(we==='blizzard'?-120:-15)+Math.random()*30,vy:(we==='blizzard'?140:40)+Math.random()*40,r:0,vr:0,s:1+Math.random()*2.6,a:.85};
  if(se==='spring')return {k:'petal',x:Math.random()*W,y:y0,vx:20+Math.random()*30,vy:30+Math.random()*30,r:Math.random()*6,vr:(Math.random()-.5)*3,s:3+Math.random()*3,a:.85};
  if(se==='autumn')return {k:'leaf',x:Math.random()*W,y:y0,vx:(we==='wind'?90:25)+Math.random()*30,vy:40+Math.random()*40,r:Math.random()*6,vr:(Math.random()-.5)*4,s:4+Math.random()*4,a:.9,c:['#d9822b','#c1502e','#e3b04b','#9a4a2a'][Math.floor(Math.random()*4)]};
  return {k:'mote',x:Math.random()*W,y:initial?Math.random()*H:H*.3+Math.random()*H*.7,vx:(Math.random()-.5)*12,vy:-(4+Math.random()*10),r:0,vr:0,s:2+Math.random()*3,a:.7};}

 /* ---------- actions ---------- */
 handle(a,v){
  if(a==='v7-toggle'){const st=this.st();st.toggles[v]=!st.toggles[v];this.c.save();this.paint();const m=MECHS.find(x=>x.id===v);this.flash(`${m.name}：${st.toggles[v]?'开启':'关闭'}`,'up');return true;}
  return false;
 }
 onNewOffer(){}
}
