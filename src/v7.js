import {bindWindowDrag,resetWindowPosition} from './window-drag.js';
// v7 layer: wealth-tiered in-world HUD, mechanism icon bars, seasons/weather,
// shaped city panorama, vertical unlock rail, draggable windows, delayed projects, rest mini-games.
// Everything reads the live run through ctx; money stays in integer cents.
import {worth,lateTier,TIERS_LATE,billQuote} from './endgame-core.js';
import {getCity,CLASSES} from './life-core.js';
import {escape as safe} from './ui.js';
import {liquid,liquidTier,tierLabel} from './v9-core.js';
import {owns} from './life-core.js';

const $=id=>document.getElementById(id);
const fmt=(c,compact=true)=>{const d=c/100;if(compact&&Math.abs(d)>=1e6){const u=(document.documentElement.lang!=='zh-CN'?[[1e12,'T'],[1e9,'B'],[1e6,'M']]:[[1e12,'万亿'],[1e8,'亿'],[1e4,'万']]).find(([v])=>Math.abs(d)>=v);const n=d/u[0];return '$'+(n>=100?Math.round(n).toString():n.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1'))+u[1];}return '$'+d.toLocaleString('en-US',{minimumFractionDigits:Math.abs(d)<1000&&d%1?2:0,maximumFractionDigits:Math.abs(d)<1000?2:0});};
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
 restart:'<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 3v4.5h4.5"/><path d="M10 9.5v5l4-2.5Z"/>',
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
 check:'<path d="m5 12 5 5 9-10"/>',
 arrow:'<path d="M4 12h15M13 6l6 6-6 6"/>',
 heart:'<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z"/>',
 moon:'<path d="M15 3a8 8 0 1 0 6 12A9 9 0 0 1 15 3Z"/>',
 s_spring:'<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C10 5 14 3 12 2c-2 1 2 3 0 7.5M14.5 12c4.5-2 6.5 2 7.5 0-1-2-3 2-7.5 0M12 14.5c2 4.5-2 6.5 0 7.5 2-1-2-3 0-7.5M9.5 12C5 14 3 10 2 12c1 2 3-2 7.5 0"/>',
 s_summer:'<circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
 s_autumn:'<path d="M12 22v-6M12 16c-6 0-9-4-9-9 3 1 5 0 6-3 1 2 2 2 3 2s2 0 3-2c1 3 3 4 6 3 0 5-3 9-9 9Z"/><path d="M12 16V8"/>',
 s_winter:'<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 3.5l3 2 3-2M9 20.5l3-2 3 2M3.5 10.5 5 7.3 3 4.4M20.5 13.5 19 16.7l2 2.9"/>',
 w_clear:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
 w_cloud:'<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9Z"/>',
 w_rain:'<path d="M7 14a4 4 0 0 1-.6-8A6 6 0 0 1 18 5a4.5 4.5 0 0 1 0 9Z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>',
 w_storm:'<path d="M7 13a4 4 0 0 1-.6-8A6 6 0 0 1 18 4a4.5 4.5 0 0 1 0 9Z"/><path d="m13 13-3 5h4l-2 4"/>',
 w_snow:'<path d="M7 13a4 4 0 0 1-.6-8A6 6 0 0 1 18 4a4.5 4.5 0 0 1 0 9Z"/><path d="M8 17h.01M12 19h.01M16 17h.01M10 21h.01M14 21h.01" stroke-width="2.6"/>',
 w_fog:'<path d="M3 8h18M5 12h14M3 16h18M7 20h10"/>',
 w_wind:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
 w_heat:'<circle cx="12" cy="9" r="4"/><path d="M4 18c2-2 3 2 5 0s3 2 5 0 3 2 5 0M12 1v2M4.5 4.5 6 6M19.5 4.5 18 6"/>',
 hourglass:'<path d="M6 2h12M6 22h12M7 2c0 6 10 6 10 10S7 16 7 22M17 2c0 6-10 6-10 10s10 4 10 10"/>'
};
const mgImg=k=>`<img class="v8-mg" src="${window.UPSHIFT_ART?.['mg-'+k]||''}" alt="" draggable="false">`;
const glyph=(k,cls='')=>`<svg class="v7-glyph ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${G[k]||G.lock}</svg>`;

/* ---------- mechanism catalogue: every unlock owns a big icon on the screen edge ----------
 kind: 'click' opens a feature, 'toggle' switches an effect, 'hover' only shows details. */
export const MECHS=[
 {id:'restart',at:0,slot:'bottom',kind:'click',g:'restart',name:'重新开始',desc:'放弃本局，从 $100 重新开始（会先确认）。',action:'restart'},
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
const ITEM_REQ={travel:'passport',radio:'radio',filter:'car',music:'music',atlas:'hex'};
const EN_NAMES={restart:'Restart',rest:'Rest',settings:'Settings',bill:'Bills',talent:'Contacts',headphones:'Headphones',travel:'Travel',status:'Net worth',ledger:'Ledger',radio:'Radio',chain:'Gold chain',atlas:'Atlas',showdown:'Showdowns',neon:'Neon sign',advanced:'Elite deals',champagne:'Champagne',filter:'Filter',music:'Music',driver:'Chauffeur',security:'Security',factions:'Factions',painting:'Paintings',cigar:'Cigars',regions:'VIP zones',medals:'Honours',yacht:'Yacht badge',jet:'Private jet',vault:'Family vault',crown:'Crown'};
for(const m of MECHS){if(ITEM_REQ[m.id])m.item=ITEM_REQ[m.id];m.quiet=!!m.deco||m.kind==='hover';m.slot=m.quiet?'top':'bottom';}
const GATES=[...new Set(MECHS.map(m=>m.at))].sort((a,b)=>a-b);

/* ---------- seasons, weather, class-flavoured news ---------- */
const SEASONS=[{id:'spring',name:'春',en:'Spring',icon:'s_spring',t:[14,24]},{id:'summer',name:'夏',en:'Summer',icon:'s_summer',t:[26,35]},{id:'autumn',name:'秋',en:'Autumn',icon:'s_autumn',t:[15,25]},{id:'winter',name:'冬',en:'Winter',icon:'s_winter',t:[2,13]}];
const WGLYPH={clear:'w_clear',breeze:'w_wind',drizzle:'w_rain',fog:'w_fog',rain:'w_rain',heat:'w_heat',storm:'w_storm',cloudy:'w_cloud',wind:'w_wind',snow:'w_snow',blizzard:'w_snow'};
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
 {id:'cans',name:'捡瓶罐换零钱',hint:'点掉画面里冒出来的瓶罐，20 秒内越多越好。',type:'tap',items:['can','bottle','juice','soda'],cut:[40,90,150]},
 {id:'delivery',name:'午高峰送外卖',hint:'看准时机点「出发」，让指针停在绿色区域。',type:'timing',items:['scooter'],cut:[40,90,150]},
 {id:'latte',name:'周末咖啡拉花',hint:'指针停在奶泡最漂亮的那一格。三次机会。',type:'timing',items:['latte'],cut:[50,110,170]},
 {id:'golf',name:'会所高尔夫推杆',hint:'力度要刚好。停在绿色区域就进洞。',type:'timing',items:['golf'],cut:[60,120,180]},
 {id:'wine',name:'酒窖盲品配对',hint:'翻牌，找出两两相同的名庄酒。',type:'memory',items:['wine','champagne','cheese','oyster','grapes','plum'],cut:[60,120,200]},
 {id:'auction',name:'私人拍卖举牌',hint:'翻牌配对，拍下成对的孤品。',type:'memory',items:['diamond','painting','vase','goldwatch','watch','jade'],cut:[80,150,240]}
];

export class V7{
 constructor(c){
  this.c=c;this.nextTick=0;this.prevRest=null;this.lastWorth=null;this.lastGate=null;this.beat=0;this.fxParts=[];this.lastFx=performance.now();this.dockKind='';this.drag=null;this.mg=null;
  const game=$('game');
  game.insertAdjacentHTML('beforeend',`
  <div id="v7-hud" hidden>
   <div id="v7-money" class="v7-panel"><span class="v7-crown">${glyph('crown')}</span><small id="v7-money-label">口袋里的钱</small><strong id="v7-money-value">$100</strong><div id="v7-money-sub"></div></div>
   <div id="v7-clock" class="v7-panel"><div class="v7-clock-row"><b id="v7-year"></b><span id="v7-season"></span><span id="v7-weather"></span></div><div class="v7-energy"><span>${glyph('bolt')}<i id="v7-energy-text"></i></span><div class="v7-energy-track"><i id="v7-energy-fill"></i></div></div><div id="v7-news"><span></span></div></div>
   <div id="v8-status" class="v7-panel"><div class="v8-s-cell v8-s-time"><span id="v8-s-season"></span><b id="v8-s-year"></b><span id="v8-s-weather"></span></div><div class="v8-s-cell v8-s-health" title="健康"><span id="v8-s-hearts"></span></div><div class="v8-s-cell v8-s-rest" title="已经历的休息阶段"><span class="v8-s-ico">${glyph('moon')}</span><b id="v8-s-rests">0</b><small>次休息</small></div><div class="v8-s-cell v8-s-energy"><span class="v8-s-ico">${glyph('bolt')}</span><div class="v8-s-bar"><i id="v8-s-energy"></i></div><b id="v8-s-energy-t"></b></div></div>
   <div id="v7-top" class="v7-bar"></div>
   <div id="v7-bottom" class="v7-bar"></div>
   <div id="v7-pano" hidden><div class="v7-pano-frame"><img alt=""><div class="v7-eq"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><b id="v7-pano-name"></b></div><svg class="v7-pano-ornament" viewBox="0 0 200 140" preserveAspectRatio="none"><path d="M6 134V40Q6 6 100 6T194 40v94" fill="none" stroke="currentColor" stroke-width="3"/><path d="M16 134V44Q16 16 100 16T184 44v90" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/><circle cx="100" cy="6" r="5" fill="currentColor"/></svg></div>
   <div id="v7-reward" class="v7-panel"></div>
   <div id="v8-goals" class="v7-panel"></div>
   <div id="v7-rail"><div class="v7-rail-track"><i id="v7-rail-fill"></i><i id="v7-rail-ghost"></i></div><span id="v7-rail-label"></span></div>
   <div id="v7-tip" hidden></div>
  </div>
  <div id="v7-windows"></div>
  <canvas id="v7-fx" aria-hidden="true"></canvas>
  <div id="v7-season-banner" hidden></div>`);
  document.body.insertAdjacentHTML('beforeend',`<div id="v7-rotate" hidden><div><div class="v7-phone"><svg viewBox="0 0 40 70" width="46" height="80" fill="none" stroke="currentColor" stroke-width="3"><rect x="3" y="3" width="34" height="64" rx="6"/><circle cx="20" cy="58" r="3"/></svg></div><b>请把手机横过来</b><small>本游戏为横屏设计 · 旋转后自动继续</small><button id="v7-rotate-go">全屏横屏游玩</button></div></div>`);
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
 rank(){return Math.min(5,liquidTier(this.s));}
 isPhone(){return matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<700;}
 async lockLandscape(quiet){try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen({navigationUI:'hide'});}catch{}try{await screen.orientation?.lock?.('landscape');}catch{if(!quiet)this.c.toast('浏览器不允许自动旋转，请手动把手机横过来。');}this.layout();}
 layout(){const phone=!window.__vdesk&&(this.isPhone()||(innerHeight<=500&&innerWidth>innerHeight));document.body.dataset.v7phone=phone?'yes':'no';const portrait=this.isPhone()&&innerHeight>innerWidth;$('v7-rotate').hidden=!portrait;this.fx.width=innerWidth;this.fx.height=innerHeight;}

 /* ---------- main refresh (called from renderHud) ---------- */
 refresh(){try{this.paint();}catch(e){console.error('v7',e);}}
 paint(){
  const s=this.s;if(!s?.life)return;const v=this.st(),app=$('app'),game=$('game'),started=this.c.started(),w=liquid(s),rank=this.rank();
  app.dataset.v7='on';app.dataset.v7rank=rank;game.dataset.v7rank=rank;game.dataset.season=SEASONS[v.season].id;game.dataset.weather=v.weather;
  for(const m of MECHS)if(m.fx)app.dataset['fx'+m.fx[0].toUpperCase()+m.fx.slice(1)]=this.unlocked(m)&&(m.deco||v.toggles[m.id]!==false)?'on':'off';
  $('v7-hud').hidden=!started;$('v7-hud').dataset.rest=s.life.rest?'yes':'no';
  // money
  $('v7-money-value').textContent=fmt(s.cash);$('v7-money-value').dataset.len=Math.min(12,fmt(s.cash).length);$('v7-money-value').title=fmt(s.cash,false);
  $('v7-money-label').textContent=['口袋里的钱','工资卡余额','可用资金','流动资产','私人账户','家族资本'][rank];
  const q=s.life.rest?.bill||billQuote(s);const EN=document.getElementById('app').dataset.v9lang==='en';const due=q.total,ok=s.cash>due;$('v7-money-sub').innerHTML=`<span class="v9-tiername">${tierLabel(s,EN?'en':'zh')}</span>${rank>=1?`<span class="v9-upkeep ${ok?'ok':'bad'}" title="${EN?'Class upkeep due at next rest':'下次休息的阶级维护费'}">${EN?'Upkeep':'维护费'} ${fmt(due)} ${ok?'✓':'✗'}</span>`:''}${rank>=2?`<span>${EN?'Net worth':'身家'} ${fmt(worth(s))}</span>`:''}`;
  // clock
  const se=SEASONS[v.season],we=WEATHER[se.id].find(x=>x[0]===v.weather)||WEATHER[se.id][0];
  const temp=Math.round(se.t[0]+(se.t[1]-se.t[0])*((v.weather.length*7+v.year*3+v.season)%10)/10)-(['rain','storm','snow','blizzard','fog'].includes(v.weather)?3:0);
  $('v7-year').textContent=`${2025+v.year} 年`;$('v7-season').textContent=`${se.name}季`;$('v7-weather').textContent=`${we[1]} ${temp}°`;
  const sk=[v.season,v.weather,v.year,temp].join();if(this.statusKey!==sk){this.statusKey=sk;$('v8-s-season').innerHTML=glyph(se.icon)+`<em>${se.name}</em>`;$('v8-s-year').textContent=`${2025+v.year}`;$('v8-s-weather').innerHTML=glyph(WGLYPH[v.weather]||'w_clear')+`<em>${we[1]} ${temp}°</em>`;$('v8-status').dataset.season=se.id;}
  const e=s.estate||{health:3,maxHealth:3},hk=e.health+'/'+e.maxHealth;if(this.heartKey!==hk){const lost=this.heartKey&&Number(this.heartKey.split('/')[0])>e.health;this.heartKey=hk;$('v8-s-hearts').innerHTML=Array.from({length:e.maxHealth},(_,i)=>`<i class="${i<e.health?'on':'off'}">${glyph('heart')}</i>`).join('');if(lost&&this.c.motion())$('v8-s-hearts').animate([{transform:'scale(1.4)',filter:'hue-rotate(-30deg)'},{transform:'scale(1)'}],{duration:700});}
  $('v8-s-rests').textContent=s.life.restCount||0;const en=s.life.rest?1:s.life.energy/s.life.energyCap;$('v8-s-energy').style.width=(en*100).toFixed(1)+'%';$('v8-s-energy-t').textContent=s.life.rest?'休息中':s.life.energy;$('v8-status').classList.toggle('low',!s.life.rest&&s.life.energy<30);
  $('v7-energy-text').textContent=s.life.rest?'休息中':`${s.life.energy}/${s.life.energyCap}`;$('v7-energy-fill').style.width=(s.life.rest?100:s.life.energy/s.life.energyCap*100)+'%';$('v7-clock').classList.toggle('low',!s.life.rest&&s.life.energy<30);
  const news=$('v7-news');const radio=this.unlocked(MECHS.find(m=>m.id==='radio'))&&v.toggles.radio!==false;news.hidden=!radio&&rank>0;const pool=NEWS[rank];const line=pool[(s.page+v.season)%pool.length]+(v.district?`　◆ ${v.district.name}：${v.district.note}`:'');if(news.dataset.line!==line){news.dataset.line=line;news.firstElementChild.textContent=line;}news.classList.toggle('ticker',radio);
  // mechanism bars
  this.paintBars(v,w);
  // panorama
  const pano=$('v7-pano'),city=getCity(s),panoOn=started&&w>=50000&&!s.life.travel;pano.hidden=!panoOn;if(panoOn){const img=pano.querySelector('img');const src=window.UPSHIFT_ART?.[city.id]||'';if(img.dataset.src!==src){img.dataset.src=src;img.src=src;}$('v7-pano-name').textContent=city.en;}
  // rail + reward
  this.paintRail(w);
  // seen-state for reclaim animation
  this.lastWorth=w;
 }
 unlocked(m){return liquid(this.s)>=m.at*100;}
 needsBuy(m){return m.item&&!owns(this.s,m.item);}
 iconMarkup(m,state){const v=this.st();const en=$('app').dataset.v9lang==='en',nm=en?EN_NAMES[m.id]||m.name:m.name;const sealed=this.needsBuy(m);const kind=m.deco?'hover':m.kind;const on=kind==='toggle'?(v.toggles[m.id]!==false?'on':'off'):'';return `<button class="v7-mech k-${kind} ${state} ${sealed?'v9-sealed':''} ${m.quiet?'v9-quiet':''}" data-mech="${m.id}" data-kind="${kind}" ${sealed?'data-action="v9-sealed" data-value="'+m.id+'"':kind==='click'?`data-action="${m.action}"`:kind==='toggle'?`data-action="v7-toggle" data-value="${m.id}"`:'tabindex="0"'} data-on="${on}" aria-label="${safe(nm)}"><span class="v7-mech-face">${glyph(m.g)}</span><span class="v7-mech-name">${safe(nm)}</span>${sealed?`<i class="v9-seal"><em>${en?'SEALED':'封'}</em></i>`:''}${kind==='toggle'&&!sealed?'<i class="v7-switch"></i>':''}</button>`;}
 paintBars(v,w){
  for(const slot of ['top','bottom']){const bar=$('v7-'+slot);const list=MECHS.filter(m=>m.slot===slot);
   v.owned=Array.isArray(v.owned)?v.owned:[];for(const m of list)if(w>=m.at*100&&m.kind==='click'&&!v.owned.includes(m.id))v.owned.push(m.id);
   const want=list.filter(m=>w>=m.at*100||(m.at<=0)).map(m=>m.id);
   // remove icons that fell below their gate: play the "reclaimed" animation first
   for(const el of [...bar.children]){if(!want.includes(el.dataset.mech)&&!el.classList.contains('reclaim')){el.classList.add('reclaim');el.disabled=true;setTimeout(()=>el.remove(),this.c.motion()?900:0);if(this.c.started())this.flash(`「${MECHS.find(m=>m.id===el.dataset.mech)?.name}」被收回了`,'down');}}
   for(const id of want){const m=MECHS.find(x=>x.id===id);let el=bar.querySelector(`[data-mech="${id}"]:not(.reclaim)`);
    if(!el){const tmp=document.createElement('div');tmp.innerHTML=this.iconMarkup(m,v.seen.includes(id)||!this.c.started()?'':'fresh');el=tmp.firstElementChild;const after=[...bar.children].find(x=>MECHS.findIndex(q=>q.id===x.dataset.mech)>MECHS.indexOf(m));bar.insertBefore(el,after||null);if(!v.seen.includes(id)){v.seen.push(id);if(this.c.started()&&m.at>0)this.flyIn(el,m);}}
    if(el.classList.contains('v9-sealed')!==!!this.needsBuy(m)||el.dataset.lang!==$('app').dataset.v9lang){const tmp=document.createElement('div');tmp.innerHTML=this.iconMarkup(m,'');const n=tmp.firstElementChild;n.dataset.lang=$('app').dataset.v9lang;el.replaceWith(n);el=n;}
    if(m.kind==='toggle')el.dataset.on=v.toggles[id]!==false?'on':'off';
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
 bindTips(){const tip=$('v7-tip');const show=el=>{const m=MECHS.find(x=>x.id===el.dataset.mech);if(!m)return;let d=m.desc;const en=$('app').dataset.v9lang==='en';if(this.needsBuy(m)){tip.innerHTML=`<b>${safe(en?EN_NAMES[m.id]:m.name)}</b><span class="v7-tip-kind">${en?'Sealed':'已封条'}</span><p>${en?'You must buy this at a roadside shop before it works.':'必须先在路边商店购买，才能启用这个功能。'}</p>`;tip.hidden=false;const r=el.getBoundingClientRect();tip.style.left=clamp(r.left+r.width/2-tip.offsetWidth/2,8,innerWidth-tip.offsetWidth-8)+'px';tip.style.top=(r.top>innerHeight/2?r.top-tip.offsetHeight-10:r.bottom+10)+'px';return;}if(d==='live-bill'){const q=this.s.life.rest?.bill||billQuote(this.s);d=`下次休息要付 ${fmt(q.total)}（阶级生活费 + 服务费）。现金不够就结束本局。`;}if(d==='live-vault')d=`金库里躺着 ${fmt(worth(this.s))}。它们不会说话，但很安静地证明你来过。`;const v=this.st();tip.innerHTML=`<b>${safe(m.name)}</b><span class="v7-tip-kind">${m.kind==='toggle'?`开关 · 当前${v.toggles[m.id]?'开启':'关闭'}`:m.kind==='hover'?'被动效果 · 仅查看':'点击打开'}${m.deco?' · 装饰':''}</span><p>${safe(d)}</p><small>解锁门槛 ${fmt(m.at*100)} · 身家跌破会被收回</small>`;tip.hidden=false;const r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;tip.style.left=clamp(r.left+r.width/2-tw/2,8,innerWidth-tw-8)+'px';tip.style.top=(r.top>innerHeight/2?r.top-th-10:r.bottom+10)+'px';};
  document.addEventListener('pointerover',e=>{const el=e.target.closest?.('.v7-mech');if(el)show(el);});document.addEventListener('pointerout',e=>{if(e.target.closest?.('.v7-mech'))tip.hidden=true;});document.addEventListener('focusin',e=>{const el=e.target.closest?.('.v7-mech');if(el)show(el);});document.addEventListener('focusout',()=>{tip.hidden=true;});
  document.addEventListener('click',e=>{const el=e.target.closest?.('.v7-mech.k-hover');if(el){show(el);setTimeout(()=>{tip.hidden=true;},2600);}});}

 /* ---------- draggable windows (dock windows, modals, delayed contracts, games) ---------- */
 bindDrag(){bindWindowDrag();}
 resetPos(el){resetWindowPosition(el);}
 decorateDock(){
  const d=$('game-dock'),s=this.s;if(!d||!s)return;const kind=s.life.rest?'rest':d.dataset.kind||'';const isWindow=!['project','special','asset','shop','challenge','auction','clinic',''].includes(kind);
  if(kind!==this.dockKind){this.resetPos(d);this.dockKind=kind;}
  d.classList.toggle('v7-draggable',isWindow);d.classList.toggle('v7-window',isWindow);d.dataset.v7kind=kind;
  if(isWindow&&!d.querySelector(':scope>.v7-handle')){const title={rest:'☾ 休息阶段',['world-event']:'⚑ 街头事件',['regional-story']:'✺ 城市故事',['talent-market']:'⌂ 人才市场',['district-gate']:'◆ 地区限定',['district-task']:'◆ 地区活动',interlude:'… 途中'}[kind]||'◇ 事件';d.insertAdjacentHTML('afterbegin',`<div class="v7-handle"><span>${title}</span><em>拖动移动 ⠿</em></div>`);}
  if(kind==='rest')this.ensureGames();else this.closeGames();
  if(!d.querySelector(':scope>.v8-deal'))d.classList.remove('v8-wide');
  if(!isWindow)this.enhanceDeal(d);
 }
 decorateModal(){const card=$('modal-card');if(!card)return;card.classList.add('v7-draggable');const head=card.querySelector('.modal-head');if(head&&!head.classList.contains('v7-handle'))head.classList.add('v7-handle');else if(!head&&!card.querySelector(':scope>.v7-handle'))card.insertAdjacentHTML('afterbegin','<div class="v7-handle v7-handle-thin"><em>拖动移动 ⠿</em></div>');}

 /* ---------- deal window: horizontal card, knob stake dial, round invest button, asset progress ---------- */
 delayOf(o){return o?.type==='project'&&o.v7delay?o.v7delay:null;}
 enhanceDeal(d){
  const s=this.s,o=s.offer;d.dataset.v7deal=o.type==='project'?(this.delayOf(o)?'delayed':'instant'):'other';
  if(o.type!=='project'||o.settled||o.pendingStake||!d.querySelector('.stake-area')||d.querySelector('.v8-deal'))return;
  const delay=this.delayOf(o),q=sel=>d.querySelector(sel),rk=this.rank();
  const header=q('.dock-header'),h1=q('h1'),terms=q('.project-terms'),banner=q('.rarity-banner'),odds=q('.odds-grid'),risk=q('.risk-strip'),stake=q('.stake-area'),actions=q('.action-row'),pass=actions?.querySelector('.pass-button'),rules=header?.querySelector('.rules-button');
  const w=liquid(s),next=GATES.find(g=>g*100>w),prev=[...GATES].reverse().find(g=>g*100<=w)||0;
  const stars=banner?.querySelector('.rb-star')?.textContent||'★',cat=o.category||'',twist=o.v8twist;
  const kind=delay?`<span class="v8-chip v8-k-delay">${glyph('hourglass')}${delay==='long'?'长期延时 · 2 次休息后兑现':'短期延时 · 下次休息后兑现'}</span>`:`<span class="v8-chip v8-k-now">${glyph('bolt')}即时揭晓</span>`;
  const wrap=document.createElement('div');wrap.className='v8-deal';wrap.dataset.rank=rk;
  wrap.innerHTML=`<div class="v8-info"><div class="v8-tags">${kind}<span class="v8-chip v8-stars">${stars}</span>${cat?`<span class="v8-chip">${safe(cat)}</span>`:''}${o.v8streak?`<span class="v8-chip v8-streak">${glyph('bolt')}${o.v8streak} 连胜 · 返还 +${(o.v8streak*.05).toFixed(2)}</span>`:''}</div><div class="v8-title"></div>${twist?`<div class="v8-twist ${twist.good?'good':'bad'}"><b>${safe(twist.name)}</b><span>${safe(twist.note)}</span></div>`:''}<div class="v8-stake"></div></div><div class="v8-act"><div class="v8-odds"></div><div class="v8-up"><div class="v8-up-track"><i id="v7-up-now"></i><i id="v7-up-win"></i></div><small id="v7-up-label">升级进度</small></div><div class="v8-btns"><button class="v7-go ${delay?'delayed':''}" id="v7-go" data-action="${delay?'v7-delay-invest':'invest'}"><span id="v7-go-label">${delay?'签约':'投资'}</span><b id="v7-go-amt"></b></button></div></div>`;
  if(h1){if(terms)h1.title=terms.textContent.trim();wrap.querySelector('.v8-title').append(h1);}
  {const en=document.documentElement.lang!=='zh-CN',mn=o.minStake||1,mx=o.maxStake??900000000000000,cap=Math.min(s.cash,mx),short=s.cash<mn;const lim=document.createElement('div');lim.className='r13-limits'+(short?' short':'');lim.innerHTML=`<span class="r13-lim"><small>${en?'MIN STAKE':'最低投入'}</small><b>${fmt(mn,true)}</b></span><span class="r13-lim-sep">→</span><span class="r13-lim"><small>${en?'MAX STAKE':'最高投入'}</small><b>${mx>=900000000000000?(en?'No limit':'不限'):fmt(mx,true)}</b></span>${short?`<span class="r13-lim-warn">${en?'Not enough cash':'现金不足'}</span>`:`<span class="r13-lim-you"><small>${en?'YOU CAN':'你可投'}</small><b>${fmt(cap,true)}</b></span>`}`;wrap.querySelector('.v8-title').after(lim);}
  if(stake)wrap.querySelector('.v8-stake').append(stake);
  if(risk)wrap.querySelector('.v8-info').append(risk);
  if(odds)wrap.querySelector('.v8-odds').append(odds);
  if(pass){pass.classList.add('v8-pass');pass.innerHTML='<span>跳过</span>'+glyph('arrow');wrap.querySelector('.v8-btns').prepend(pass);}
  if(rules){rules.classList.add('v8-rules');wrap.querySelector('.v8-tags').append(rules);}
  header?.remove();terms?.remove();banner?.remove();d.querySelector(':scope>.v7-kind')?.remove();
  d.prepend(wrap);d.classList.add('v8-wide');d.classList.remove('v7-split');
  this.gate={next,prev};this.syncDeal();
  if(!this.inputBound){this.inputBound=true;const sync=()=>{if(this.syncRaf)return;this.syncRaf=requestAnimationFrame(()=>{this.syncRaf=0;this.syncDeal();});};document.addEventListener('input',e=>{if(e.target.id==='stake-range'||e.target.id==='stake-input')sync();});document.addEventListener('click',e=>{if(e.target.closest?.('[data-action="stake"]'))sync();});}
 }
 syncDeal(){const s=this.s;if(!$('v7-go'))return;const stake=Math.round(Number($('stake-input')?.value||0)*100);$('v7-go-amt').textContent=fmt(stake);const o=s.offer,up=o.up||1;const g=this.gate||{};const w=worth(s);
  const r=$('stake-range');if(r)r.style.setProperty('--fill',(Number(r.value)/10)+'%');
  if(g.next!==undefined){const span=(g.next-g.prev)*100,now=clamp((w-g.prev*100)/span,0,1),win=clamp((w+Math.floor(stake*up)-stake-g.prev*100)/span,0,1);$('v7-up-now').style.width=now*100+'%';$('v7-up-win').style.width=win*100+'%';const lab=$('v7-up-label');lab.textContent=win>=1?'赢了就解锁新东西！':`升级 ${Math.round(now*100)}% → ${Math.round(win*100)}%`;lab.classList.toggle('hot',win>=1);}else{$('v7-up-label').textContent='已全部解锁';}
  const pd=$('primary-action');$('v7-go').disabled=!!pd?.disabled&&!this.delayOf(o);}
 bindKnob(){}

 /* ---------- delayed projects ---------- */
 markOffer(){const s=this.s,o=s.offer;if(!o||o.v7seen)return;o.v7seen=1;const v=this.st();
  if(o.type==='project'&&!o.delay&&!o.settled&&worth(s)>=2000000){const h=[...String(o.id)].reduce((n,ch)=>(n*31+ch.charCodeAt(0))>>>0,7)%100;if(h<30){o.v7delay=h<11?'long':'short';o.up=Math.min(20,+(o.up+(o.v7delay==='long'?.9:.4)).toFixed(2));}}
  if(o.type==='project'&&!o.settled){const h=[...String(o.id)].reduce((n,ch)=>(n*33+ch.charCodeAt(0))>>>0,11);const wet=['rain','drizzle','storm','snow','blizzard'].includes(v.weather);
   const pool=[['熟客推荐',true,'成功率 +5%',x=>{if(!x.stages)x.p=clamp(x.p+5,1,95);}],['网红打卡',true,'返还 +0.30',x=>{x.up=+(x.up+.3).toFixed(2);}],['老板跑路传闻',false,'成功率 −8%，但返还 +0.80',x=>{if(!x.stages)x.p=clamp(x.p-8,1,95);x.up=+(x.up+.8).toFixed(2);}],['房东涨租',false,'返还 −0.15',x=>{x.up=Math.max(1.05,+(x.up-.15).toFixed(2));}],['同行扎堆',false,'成功率 −4%',x=>{if(!x.stages)x.p=clamp(x.p-4,1,95);}],['政策利好',true,'成功率 +3%，返还 +0.15',x=>{if(!x.stages)x.p=clamp(x.p+3,1,95);x.up=+(x.up+.15).toFixed(2);}]];
   if(wet)pool.push(['雨天淡季',false,'天气差：成功率 −3%，返还 +0.35',x=>{if(!x.stages)x.p=clamp(x.p-3,1,95);x.up=+(x.up+.35).toFixed(2);}]);
   if(v.weather==='clear'||v.weather==='heat')pool.push(['好天气人潮',true,'晴天客流：成功率 +4%',x=>{if(!x.stages)x.p=clamp(x.p+4,1,95);}]);
   if(h%100<42){const tw=pool[(h>>>7)%pool.length];tw[3](o);o.v8twist={name:tw[0],good:tw[1],note:tw[2]};}
   const st=Math.min(6,s.streak||0);if(st>=2){o.up=+(o.up+st*.05).toFixed(2);o.v8streak=st;}}
  const dist=v.district;if(dist&&o.type==='project'&&!o.settled&&dist.city===s.life.city){if(dist.kind==='p'&&!o.stages)o.p=clamp(o.p+dist.val,1,95);if(dist.kind==='up')o.up=Math.min(20,+(o.up+dist.val).toFixed(2));if(dist.kind==='risky'){if(!o.stages)o.p=clamp(o.p-3,1,99);o.up=Math.min(20,+(o.up+.5).toFixed(2));}o.v7district=dist.name;}
  if(dist?.kind==='energy'&&dist.city===s.life.city&&!s.life.rest)s.life.energy=Math.min(s.life.energyCap,s.life.energy+1);
 }
 interceptDock(){const s=this.s,o=s.offer;if(!s?.life||s.life.rest||s.life.travel)return false;this.markOffer();if(o.type!=='project'||!o.v7signed)return false;const d=$('game-dock');d.dataset.kind='delayed-signed';const c=this.st().delayed.find(x=>x.id===o.v7signed);d.innerHTML=`<div class="v7-kind delayed">${glyph('hourglass')}<b>合同已签</b><span>资金已锁定</span></div><h1>${safe(c?.name||'延时项目')}</h1><div class="v7-signed"><div>投入 <b>${fmt(c?.stake||0)}</b></div><div>到期 <b>${c?.left??'?'} 次休息后</b></div><div>成功返还 <b>×${(c?.up||0).toFixed(2)}</b></div></div><p class="v7-signed-note">结果已经封存在合同里，刷新也不会改变。合同变成一个小窗口跟着你，到期点「兑现」。</p><div class="action-row solo"><button class="primary" data-action="next">前往下一站 →</button></div>`;this.c.fit?.();return true;}
 delayInvest(){const s=this.s,o=s.offer,v=this.st();if(o.type!=='project'||o.settled||!o.v7delay||s.life.rest||s.life.travel||this.c.busy()||this.c.modal())return;if(v.delayed.length>=6){this.c.toast('最多同时持有 6 份延时合同。');return;}const stake=Math.round(Number($('stake-input')?.value)*100),b={min:o.minStake||1,max:Math.min(s.cash,o.maxStake??Infinity)};if(!Number.isSafeInteger(stake)||stake<b.min||stake>b.max){this.c.toast('投入不在项目允许的范围内。');return;}if(stake>=s.cash){this.c.toast('延时项目不能投入全部现金，至少留 $0.01 生活。');return;}if(s.life.energy<=0){this.c.toast('体力耗尽，先去休息。');return;}
  const name=$('game-dock').querySelector('h1')?.textContent||'延时项目';const won=Math.random()<o.p/100,left=o.v7delay==='long'?2:1;const id='d'+Date.now().toString(36);
  s.cash-=stake;s.life.energy=Math.max(0,s.life.energy-3);v.delayed.push({id,name:name.slice(0,30),stake,up:o.up,p:o.p,won,left,kind:o.v7delay,city:s.life.city});o.settled=true;o.v7signed=id;s.lastResult=null;
  this.c.cash(-stake,$('game-dock'));this.c.save();this.c.refresh();this.c.renderDock();this.paintContracts(true);this.flash('签下延时合同：'+fmt(stake),'up');}
 paintContracts(fresh){const v=this.st(),host=$('v7-windows'),s=this.s;const ids=v.delayed.map(d=>d.id);for(const el of host.querySelectorAll('.v7-contract'))if(!ids.includes(el.dataset.id))el.remove();
  v.delayed.forEach((c,i)=>{let el=host.querySelector(`.v7-contract[data-id="${c.id}"]`);if(!el){el=document.createElement('div');el.className='v7-contract v7-draggable '+c.kind;el.dataset.id=c.id;el.style.left=(24+i*26)+'px';el.style.top=(250+i*34)+'px';host.append(el);if(fresh&&this.c.motion())el.animate([{transform:'scale(.3) rotate(-12deg)',opacity:0},{transform:'scale(1)',opacity:1}],{duration:600,easing:'cubic-bezier(.2,.9,.3,1.3)'});}
   const ready=c.left<=0,key=[c.left,ready,!!s.life.rest].join();if(el.dataset.key===key)return;el.dataset.key=key;el.classList.toggle('ready',ready);
   el.innerHTML=`<div class="v7-handle"><span>${glyph('hourglass')} ${c.kind==='long'?'长期':'短期'}合同</span><em>⠿</em></div><b class="v7-c-name">${safe(c.name)}</b><div class="v7-c-row"><span>锁定 ${fmt(c.stake)}</span><span>×${c.up.toFixed(2)}</span></div>${ready?`<button class="v7-c-cash" data-action="v7-cash" data-value="${c.id}">到期 · 点击兑现</button>`:`<div class="v7-c-wait"><i style="width:${(1-c.left/(c.kind==='long'?2:1))*100}%"></i><span>还要休息 ${c.left} 次</span></div>`}`;});
  host.dataset.contracts=v.delayed.length;}
 cashContract(id){const v=this.st(),s=this.s,i=v.delayed.findIndex(d=>d.id===id);if(i<0)return;const c=v.delayed[i];if(c.left>0)return;const el=document.querySelector(`.v7-contract[data-id="${id}"]`);const got=c.won?Math.floor(c.stake*c.up):0;v.delayed.splice(i,1);s.cash=Math.min(900000000000000,s.cash+got);s.history?.unshift({won:c.won,multiplier:c.won?c.up:0,stake:c.stake,returned:got,profit:got-c.stake,cashAfterBet:s.cash,lossScope:'stake',page:s.page,project:s.offer.project||'coffee',special:null,rarity:'rare',at:Date.now()});s.history=s.history.slice(0,40);if(s.cash>s.peak)s.peak=s.cash;
  if(c.won){this.c.cash(got,el);this.c.effects?.tone?.('win',3);this.flash(`${c.name} 兑现 +${fmt(got-c.stake)}`,'up');}else{this.c.effects?.tone?.('loss',2);this.flash(`${c.name} 失败，${fmt(c.stake)} 打了水漂`,'down');}
  if(el&&this.c.motion())el.animate([{transform:'scale(1)'},{transform:'scale(1.15)',filter:c.won?'brightness(1.8)':'grayscale(1)'},{transform:'scale(0)',opacity:0}],{duration:650}).onfinish=()=>el.remove();else el?.remove();this.c.save();this.c.refresh();}

 /* ---------- crossroads: pick a district of this city for the current stage ---------- */
 maybeCrossroads(){const s=this.s,v=this.st();if(!this.c.started()||this.c.modal()||this.c.busy()||s.life.rest||s.life.travel||s.ended||v.district||$('v7-cross'))return;const steps=s.life.steps||0;if(steps<3||v.crossAt===s.life.restCount+':'+s.life.city)return;if(steps%7!==3)return;if(s.offer.type!=='project')return;v.crossAt=s.life.restCount+':'+s.life.city;this.c.save();
  const list=DISTRICTS[s.life.city]||DISTRICTS.taipei;const rank=this.rank();const w=document.createElement('div');w.id='v7-cross';w.className='v7-win v7-draggable';w.innerHTML=`<div class="v7-handle"><span>⚑ 岔路口</span><em>拖动 ⠿</em></div><h2>${rank<2?'前面分了三条街，你往哪走？':'司机问：接下来去哪个区？'}</h2><p>选一个区域度过这一季，效果持续到下次休息。</p><div class="v7-cross-list">${list.map(([n,k,val,note],i)=>`<button class="v7-cross-card k-${k}" data-action="v7-district" data-value="${i}"><b>${n}</b><span>${note}</span></button>`).join('')}</div><button class="v7-cross-skip" data-action="v7-district" data-value="-1">不拐弯，直走</button>`;$('v7-windows').append(w);if(this.c.motion())w.animate([{opacity:0,transform:'translate(-50%,-40%) scale(.85)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{duration:500,easing:'cubic-bezier(.2,.9,.3,1.2)'});}
 pickDistrict(i){const s=this.s,v=this.st();$('v7-cross')?.remove();if(i<0)return;const d=(DISTRICTS[s.life.city]||DISTRICTS.taipei)[i];if(!d)return;v.district={name:d[0],kind:d[1],val:d[2],note:d[3],city:s.life.city};this.c.save();this.flash('转进 '+d[0],'up');this.c.refresh();}

 /* ---------- rest mini-games ---------- */
 ensureGames(){const s=this.s,r=s.life.rest;const host=$('v7-windows');let p=$('v7-games');if(!r?.paid||r.remaining<=0){p?.remove();return;}const g=GAMES[clamp(r.class,0,5)],v=this.st(),played=v.mg[r.id]||0,left=Math.max(0,3-played),cost=Math.floor(s.cash*.3);
  const key=[r.id,played,Math.floor(cost/100)].join();if(p&&p.dataset.key===key)return;if(!p){p=document.createElement('div');p.id='v7-games';p.className='v7-win v7-draggable';host.append(p);if(this.c.motion())p.animate([{opacity:0,transform:'translate(-50%,20px)'},{opacity:1,transform:'translate(-50%,0)'}],{duration:500});}p.dataset.key=key;p.dataset.rank=r.class;
  p.innerHTML=`<div class="v7-handle"><span>${CLASSES[r.class].name} · 休息小游戏</span><em>拖动 ⠿</em></div><div class="v7-g-body"><div class="v7-g-icon">${mgImg(g.items[0])}</div><div><h3>${g.name}</h3><p>${g.hint}</p><small>玩得越好，休息时间减得越多（最多 −4 分钟）。本次休息还能玩 ${left} 次。</small></div></div><div class="v7-g-actions"><button class="v7-g-play" data-action="v7-game" ${left?'':'disabled'}>${left?'开始小游戏':'今天玩够了'}</button><button class="v7-g-buy" data-action="v7-skip-rest" title="一次性花掉现金的 30%">包场跳过 · ${fmt(cost)}<small>花掉 30% 现金，立即结束休息</small></button></div>`;}
 closeGames(){$('v7-games')?.remove();$('v7-game-win')?.remove();clearInterval(this.mgTimer);}
 skipRest(){const s=this.s,r=s.life.rest;if(!r?.paid||r.remaining<=0)return;const cost=Math.floor(s.cash*.3);this.c.confirm?.('包场跳过休息？',`花掉 ${fmt(cost)}（现金的 30%），休息立刻结束。`,()=>{if(!s.life.rest?.paid||s.cash-cost<1)return;s.cash-=cost;r.total=(r.total||0)+cost;r.remaining=0;this.c.cash(-cost,$('v7-games'));this.closeGames();this.c.save();this.c.refresh();this.c.renderDock();this.flash('钱能买到时间','up');})||0;}
 startGame(){const s=this.s,r=s.life.rest;if(!r?.paid)return;const v=this.st();if((v.mg[r.id]||0)>=3)return;const g=GAMES[clamp(r.class,0,5)];$('v7-game-win')?.remove();clearInterval(this.mgTimer);
  const w=document.createElement('div');w.id='v7-game-win';w.className='v7-win v7-draggable';w.dataset.rank=r.class;w.innerHTML=`<div class="v7-handle"><span>${g.name}</span><em>拖动 ⠿</em><button class="v7-x" data-action="v7-game-quit">✕</button></div><div class="v7-g-hud"><span>得分 <b id="v7-g-score">0</b></span><span id="v7-g-time"></span></div><div class="v7-g-stage" id="v7-g-stage"></div>`;$('v7-windows').append(w);this.mg={g,score:0,rest:r.id};
  const stage=$('v7-g-stage'),score=n=>{this.mg.score+=n;$('v7-g-score').textContent=this.mg.score;};
  if(g.type==='tap'){let t=20;$('v7-g-time').textContent=t+' 秒';const spawn=()=>{const b=document.createElement('button');b.className='v7-g-target';b.innerHTML=mgImg(g.items[Math.floor(Math.random()*g.items.length)]);b.style.left=(5+Math.random()*80)+'%';b.style.top=(5+Math.random()*75)+'%';b.onclick=()=>{score(10);b.classList.add('hit');setTimeout(()=>b.remove(),200);};stage.append(b);setTimeout(()=>b.remove(),1600);};this.mgTimer=setInterval(()=>{if(Math.random()<.9)spawn();if(Math.random()<.4)spawn();},450);this.mgClock=setInterval(()=>{t--;$('v7-g-time')&&($('v7-g-time').textContent=t+' 秒');if(t<=0){clearInterval(this.mgClock);this.endGame();}},1000);}
  if(g.type==='timing'){let tries=3,pos=0,dir=1,zone=35+Math.random()*30;stage.innerHTML=`<div class="v7-g-bar"><i class="v7-g-zone" style="left:${zone}%"></i><i class="v7-g-perfect" style="left:${zone+6}%"></i><i class="v7-g-needle" id="v7-g-needle"></i></div><button class="v7-g-hit" id="v7-g-hit">${g.id==='delivery'?'出发！':g.id==='golf'?'推杆！':'倒奶！'}</button><p class="v7-g-msg" id="v7-g-msg">剩 3 次</p>`;const speed=1.6+r.class*.25;this.mgTimer=setInterval(()=>{pos+=dir*speed;if(pos>=100||pos<=0)dir*=-1;$('v7-g-needle')&&($('v7-g-needle').style.left=pos+'%');},16);$('v7-g-hit').onclick=()=>{const d=Math.abs(pos-(zone+8));const pts=d<2.5?60:d<8?35:d<14?10:0;score(pts);$('v7-g-msg').textContent=(pts>=60?'完美！':pts>=35?'不错！':pts?'勉强':'失手')+` · 剩 ${--tries} 次`;zone=15+Math.random()*60;stage.querySelector('.v7-g-zone').style.left=zone+'%';stage.querySelector('.v7-g-perfect').style.left=(zone+6)+'%';if(tries<=0){clearInterval(this.mgTimer);setTimeout(()=>this.endGame(),500);}};$('v7-g-time').textContent='三次机会';}
  if(g.type==='memory'){const deck=[...g.items,...g.items].sort(()=>Math.random()-.5);let open=[],pairs=0,t=45;stage.innerHTML=`<div class="v7-g-grid">${deck.map((e,i)=>`<button class="v7-g-card" data-i="${i}"><span>${mgImg(e)}</span></button>`).join('')}</div>`;stage.querySelectorAll('.v7-g-card').forEach(b=>b.onclick=()=>{if(b.classList.contains('up')||open.length>=2)return;b.classList.add('up');open.push(b);if(open.length===2){const [a,c]=open;if(deck[a.dataset.i]===deck[c.dataset.i]){pairs++;score(30);a.classList.add('done');c.classList.add('done');open=[];if(pairs===g.items.length){score(t*2);clearInterval(this.mgClock);setTimeout(()=>this.endGame(),400);}}else setTimeout(()=>{a.classList.remove('up');c.classList.remove('up');open=[];},650);}});$('v7-g-time').textContent=t+' 秒';this.mgClock=setInterval(()=>{t--;$('v7-g-time')&&($('v7-g-time').textContent=t+' 秒');if(t<=0){clearInterval(this.mgClock);this.endGame();}},1000);}
  if(this.c.motion())w.animate([{opacity:0,transform:'translate(-50%,-45%) scale(.8)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{duration:450,easing:'cubic-bezier(.2,.9,.3,1.2)'});}
 endGame(quit){clearInterval(this.mgTimer);clearInterval(this.mgClock);const m=this.mg,s=this.s,r=s.life.rest;this.mg=null;const w=$('v7-game-win');if(!m||!r||r.id!==m.rest){w?.remove();return;}const v=this.st();v.mg[r.id]=(v.mg[r.id]||0)+1;if(quit){w?.remove();this.c.save();this.ensureGames();return;}const tier=m.g.cut.filter(c=>m.score>=c).length,cut=[30,90,150,240][tier]*1000;r.remaining=Math.max(0,r.remaining-cut);this.c.save();
  if(w){w.querySelector('.v7-g-stage').innerHTML=`<div class="v7-g-result"><div class="v7-g-stars">${'★'.repeat(tier)}${'☆'.repeat(3-tier)}</div><b>得分 ${m.score}</b><p>休息时间 −${cut/60000>=1?Math.floor(cut/60000)+' 分 ':''}${(cut%60000)/1000?(cut%60000)/1000+' 秒':''}</p><button data-action="v7-game-quit">好的</button></div>`;}
  this.c.effects?.tone?.(tier>=2?'win':'tap',tier);this.c.renderDock();this.ensureGames();}

 /* ---------- per-frame work ---------- */
 tick(now){try{if(this.fxOn!==false)this.drawFx(now);}catch(e){}if(now<this.nextTick)return;this.nextTick=now+150;try{this.step(now);}catch(e){console.error('v7 tick',e);}}
 step(now){
  const s=this.s;if(!s?.life)return;const v=this.st();const resting=!!s.life.rest;
  if(this.prevRest===true&&!resting&&!s.ended)this.onRestEnd(v);
  this.prevRest=resting;
  this.beatFrame();this.paintContracts();this.maybeCrossroads();if(resting)this.ensureGames();else if($('v7-games'))this.closeGames();
  if(now-(this.lastRail||0)>400){this.lastRail=now;this.paintRail(liquid(s));this.measure();this.goals();}
 }
 goals(){const s=this.s,v=this.st(),key=(s.life.restCount||0)+'';const ge=$('v8-goals');if(ge)ge.hidden=this.rank()<1;if(!this.c.started()||s.ended||this.rank()<1)return;
  if(!v.goals||v.goals.key!==key){const w=worth(s),rk=this.rank(),r=(n)=>((s.life.restCount||0)*7+n)%3;const list=[];
   list.push({t:'wins',n:[2,3,4][r(1)]+Math.min(2,rk>>1),base:s.wins||0,label:n=>`本季赢 ${n} 个项目`});
   list.push({t:'streak',n:[2,3,3][r(2)],label:n=>`打出 ${n} 连胜`});
   list.push({t:'worth',n:Math.round(w*([1.3,1.5,1.8][r(3)])),label:n=>`身家到达 ${fmt(n)}`});
   if(rk>=2&&r(4)===0)list[0]={t:'delay',n:1,base:v.delayed.length,label:()=>'签下 1 份延时合同'};
   else if(r(4)===1)list[1]={t:'district',n:1,label:()=>'在岔路口选一个区域'};
   v.goals={key,start:w,list:list.map(g=>({t:g.t,n:g.n,base:g.base||0,text:g.label(g.n),done:false})),reward:Math.max(500,Math.floor(w*.04))};this.c.save();}
  const G=v.goals;let changed=false;for(const g of G.list){if(g.done)continue;const ok=g.t==='wins'?(s.wins||0)-g.base>=g.n:g.t==='streak'?(s.streak||0)>=g.n:g.t==='worth'?worth(s)>=g.n:g.t==='delay'?v.delayed.length>g.base:g.t==='district'?!!v.district:false;if(ok){g.done=true;changed=true;const pay=G.reward;s.cash=Math.min(900000000000000,s.cash+pay);this.c.cash?.(pay,$('v8-goals'));this.c.effects?.tone?.('rare',3);this.flash(`季度目标达成：${g.text}  +${fmt(pay)}`,'up');}}
  if(changed){if(G.list.every(g=>g.done)&&!G.bonus){G.bonus=true;const b=G.reward*3;s.cash+=b;this.flash(`本季目标全清！额外 +${fmt(b)}`,'up');this.c.effects?.burst?.(innerWidth-160,260,18,'#f0cf73');}this.c.save();this.c.refresh();}
  const el=$('v8-goals');if(!el)return;const k=JSON.stringify(G.list.map(g=>g.done))+G.key;if(el.dataset.k===k)return;el.dataset.k=k;
  el.innerHTML=`<div class="v8-g-head"><b>本季目标</b><small>每项 +${fmt(G.reward)} · 全清再 ×3</small></div>${G.list.map(g=>`<div class="v8-g-row ${g.done?'done':''}"><i>${g.done?glyph('check'):''}</i><span>${safe(g.text)}</span></div>`).join('')}`;
  if(changed&&this.c.motion())el.animate([{transform:'scale(1.06)',filter:'brightness(1.3)'},{transform:'scale(1)'}],{duration:500});}
 measure(){const g=$('game'),m=$('v7-money'),r=$('v7-reward'),d=$('game-dock'),p=$('v7-pano');if(m)g.style.setProperty('--v7-money-h',m.offsetHeight+'px');if(r)g.style.setProperty('--v7-reward-h',(r.offsetHeight||0)+'px');if(d){const dr=d.getBoundingClientRect(),gr=g.getBoundingClientRect();g.style.setProperty('--v7-dock-w',Math.max(0,gr.right-dr.left-24)+'px');}const b=$('v7-bottom');g.style.setProperty('--v7-bar-h',(b?.offsetHeight||90)+'px');}
 onRestEnd(v){for(const c of v.delayed)c.left=Math.max(0,c.left-1);v.crossAt=null;v.season=(v.season+1)%4;if(v.season===0)v.year++;v.weather=this.rollWeather(v.season);v.district=null;this.c.save();this.c.refresh();this.seasonBanner(v);}
 seasonBanner(v){const se=SEASONS[v.season],we=WEATHER[se.id].find(x=>x[0]===v.weather);const b=$('v7-season-banner');b.hidden=false;b.dataset.season=se.id;b.innerHTML=`<span>${glyph(se.icon)}</span><div><small>${2025+v.year} 年 · 新的阶段</small><b>${se.name}天到了</b><em>今日天气：${we[1]}</em></div>`;if(this.c.motion())b.animate([{opacity:0,transform:'translate(-50%,-30px) scale(.8)'},{opacity:1,transform:'translate(-50%,0) scale(1)'}],{duration:700,easing:'cubic-bezier(.2,.9,.3,1.2)'});clearTimeout(this.bannerT);this.bannerT=setTimeout(()=>{b.hidden=true;},3600);}

 /* ---------- music-reactive pulse ---------- */
 beatFrame(){const m=this.c.music;if(!m?.ctx||!m.master){this.beat*=.9;}else{if(!this.analyser){try{this.analyser=m.ctx.createAnalyser();this.analyser.fftSize=64;m.master.connect(this.analyser);this.bins=new Uint8Array(this.analyser.frequencyBinCount);}catch{}}if(this.analyser){this.analyser.getByteFrequencyData(this.bins);let low=0;for(let i=1;i<6;i++)low+=this.bins[i];low/=5*255;this.beat=Math.max(low,this.beat*.82);const eq=$('v7-pano')?.hidden?[]:(this.eqEls||=document.querySelectorAll('#v7-pano .v7-eq i'));eq.forEach((el,i)=>{el.style.height=(8+this.bins[2+i*2]/255*92)+'%';});}}const bq=this.beat.toFixed(2);if(bq!==this.lastBq){this.lastBq=bq;$('v7-hud')?.style.setProperty('--v7-beat',bq);}}

 /* ---------- seasonal + weather particles ---------- */
 drawFx(now){const ctx=this.fxc,W=this.fx.width,H=this.fx.height;const dt=Math.min(.2,(now-this.lastFx)/1000);this.lastFx=now;ctx.clearRect(0,0,W,H);if(!this.c.motion()||!this.c.started()||document.hidden)return;const v=this.st(),se=SEASONS[v.season].id,we=v.weather,app=$('app').dataset;
  const want={spring:14,summer:8,autumn:16,winter:22}[se]+({rain:60,drizzle:30,storm:90,snow:50,blizzard:120}[we]||0)+(app.fxBubbles==='on'?14:0);
  while(this.fxParts.length<want)this.fxParts.push(this.spawn(se,we,W,H,true));if(this.fxParts.length>want)this.fxParts.length=want;
  for(const p of this.fxParts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;if(p.y>H+20||p.x<-40||p.x>W+40||p.y<-60)Object.assign(p,this.spawn(se,we,W,H,false));ctx.save();ctx.globalAlpha=p.a;ctx.translate(p.x,p.y);ctx.rotate(p.r);
   if(p.k==='rain'){ctx.strokeStyle='rgba(170,200,230,.75)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(p.vx*.03,p.vy*.03);ctx.stroke();}
   else if(p.k==='snow'){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,p.s,0,7);ctx.fill();}
   else if(p.k==='petal'){ctx.fillStyle='#f7b9cf';ctx.beginPath();ctx.ellipse(0,0,p.s*1.4,p.s*.7,0,0,7);ctx.fill();}
   else if(p.k==='leaf'){ctx.fillStyle=p.c;ctx.beginPath();ctx.moveTo(0,-p.s*1.4);ctx.quadraticCurveTo(p.s*1.2,0,0,p.s*1.4);ctx.quadraticCurveTo(-p.s*1.2,0,0,-p.s*1.4);ctx.fill();}
   else if(p.k==='mote'){ctx.fillStyle='rgba(255,236,150,.9)';ctx.beginPath();ctx.arc(0,0,p.s*.6,0,7);ctx.fill();}
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
  if(a==='v7-delay-invest'){this.delayInvest();return true;}
  if(a==='v7-cash'){this.cashContract(v);return true;}
  if(a==='v7-district'){this.pickDistrict(Number(v));return true;}
  if(a==='v7-game'){this.startGame();return true;}
  if(a==='v7-game-quit'){if(this.mg)this.endGame(true);else $('v7-game-win')?.remove();return true;}
  if(a==='v7-skip-rest'){this.skipRest();return true;}/*R16d: user wants 'book it out' (30% cash) KEPT*/
  if(a==='v9-sealed'){const en=$('app').dataset.v9lang==='en';this.c.toast(en?'Sealed: buy it at a roadside shop first.':'已封条：必须先在路边商店购买才能启用。');return true;}
  if(a==='v7-toggle'){if(MECHS.find(x=>x.id===v)?.deco)return true;const st=this.st();st.toggles[v]=st.toggles[v]===false;this.c.save();this.paint();const m=MECHS.find(x=>x.id===v);this.flash(`${m.name}：${st.toggles[v]!==false?'开启':'关闭'}`,'up');return true;}
  return false;
 }
 onNewOffer(){}
}
