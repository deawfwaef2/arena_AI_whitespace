// All money values in this module are integer cents. No engine imports (avoid cycles).
export const TALENTS=[
 {id:'guide',name:'阿禾',role:'街区向导',city:'any',origin:'台北',at:25000,fee:8000,wage:600,color:0x78a187,effect:'每次前进只消耗 4 体力（原为 5）。',motto:'这条街的近路，我熟。'},
 {id:'merchant',name:'林姐',role:'市集经纪',city:'taipei',origin:'台北',at:50000,fee:18000,wage:1400,color:0xc09969,effect:'后续普通街头项目返还倍率 +0.10。',motto:'人情归人情，账目要分明。'},
 {id:'analyst',name:'凛',role:'尽调分析师',city:'tokyo',origin:'东京',at:150000,fee:35000,wage:2400,color:0x969fc0,effect:'后续普通项目成功率 +3 个百分点，计入显示概率。',motto:'先核对数据，再谈直觉。'},
 {id:'producer',name:'米娅',role:'演出制作人',city:'vegas',origin:'拉斯维加斯',at:150000,fee:40000,wage:2800,color:0xb894bd,effect:'后续普通项目返还倍率 +0.15，不影响特殊对赌。',motto:'灯光熄灭之前，把预算说清楚。'},
 {id:'steward',name:'许安',role:'生活管家',city:'singapore',origin:'新加坡',at:500000,fee:100000,wage:5000,color:0x6aa9a4,effect:'每次休息的基础生活维护费减免 15%；不减税费和工资。',motto:'生活有条理，才有时间看世界。'},
 {id:'diplomat',name:'乔',role:'社群联络员',city:'newyork',origin:'纽约',at:500000,fee:90000,wage:4200,color:0xa88871,effect:'与路人打招呼的阵营好感 +4（原为 +2）。',motto:'别只交换名片，记住一个名字。'},
 {id:'medic',name:'伊莲',role:'私人康复师',city:'monaco',origin:'摩纳哥',at:1000000,fee:200000,wage:10000,color:0x78a7b9,effect:'后续休息健康衰退风险降低 3 个百分点，不低于 0%。',motto:'再忙，也给自己留一次深呼吸。'}
];
export function crew(s){const ids=Array.isArray(s.life?.companions)?s.life.companions:[];return TALENTS.filter(t=>ids.includes(t.id)).slice(0,3);}
export const hasCrew=(s,id)=>crew(s).some(t=>t.id===id);
export const crewWages=s=>crew(s).reduce((n,t)=>n+t.wage,0);
export function normalizeCrew(s){if(s.life)s.life.companions=crew(s).map(t=>t.id);}
export function hire(s,id,currentWorth){const t=TALENTS.find(t=>t.id===id);if(s.ended||s.life?.rest||s.life?.travel)throw Error('请返回街头再签约。');if(s.offer?.type!=='talent-market')throw Error('请先在沿途遇到人才市场。');if(!t||t.city!=='any'&&t.city!==s.life.city)throw Error('这位人才只在当地市场签约。');if(hasCrew(s,id))throw Error('这位伙伴已经随行。');if(crew(s).length>=3)throw Error('最多同时雇佣三位随从。');if(currentWorth<t.at||s.cash<=t.fee)throw Error('未达到身家门槛，或签约后没有剩余现金。');s.cash-=t.fee;s.life.companions=[...crew(s).map(t=>t.id),id];return t;}
export function dismiss(s,id){if(s.ended||s.life.rest||s.life.travel)throw Error('请返回街头再办理解雇。本次休息账单已经锁定。');const t=crew(s).find(t=>t.id===id);if(!t)throw Error('这位随从不在队伍中。');s.life.companions=crew(s).filter(t=>t.id!==id).map(t=>t.id);return t;}
export function applyCrewOffer(s,o){if(o.type!=='project')return;const ids=crew(s).map(t=>t.id);o.crewBonus=[];if(ids.includes('analyst')){o.p=Math.min(95,o.p+3);o.crewBonus.push('凛：胜率 +3%');}let extra=ids.includes('producer')?.15:0;if(ids.includes('merchant')&&o.grade==='street')extra+=.1;if(extra){o.up=Math.round((o.up+extra)*100)/100;o.crewBonus.push('随从：返还 ×'+extra.toFixed(2));}}
export const CITY_STREET={
 taipei:{market:'骑楼人才茶摊',manager:'摊主 · 林老板',opening:'刚出笼的热气，比名片更管用。',accent:'#577d5c',local:'巷口生意',pitch:'先从一笼、一单做起。利润不多，但规矩明白。'},
 tokyo:{market:'车站前职业介绍所',manager:'店长 · 佐藤',opening:'开门前，我又核对了一遍账目。',accent:'#706c93',local:'匠人街区',pitch:'交期、品控和现金流，少看一项都不行。'},
 vegas:{market:'霓虹演艺经纪所',manager:'制作人 · 莫妮卡',opening:'霓虹亮起来了，预算不能跟着失控。',accent:'#99657e',local:'娱乐之都',pitch:'热闹是舞台上的，风险是合同里的。'},
 singapore:{market:'滨海人才事务所',manager:'项目经理 · 陈',opening:'欢迎。请先看交付节点和资金安排。',accent:'#347f7a',local:'港湾贸易',pitch:'繁忙的港口也要按时交货，别忽略结算时间。'},
 newyork:{market:'街区合伙人中心',manager:'创始人 · 亚历克斯',opening:'咖啡还热着，来聊聊真正的需求。',accent:'#5c7186',local:'创投街区',pitch:'一个好点子，还需要经得起追问的计划。'},
 monaco:{market:'海港私人服务会所',manager:'顾问 · 卡米耶',opening:'海风很好，但投资仍然需要冷静。',accent:'#9c7b47',local:'海岸私人资本',pitch:'昂贵不代表安全。先决定你愿意承担多少。'}
};
const regions=['台北','东京','新加坡','纽约','摩纳哥','拉斯维加斯'];
const names=['小周','夏树','安娜','陈宇','罗伊','艾文','米洛','阿岚'];
const factions=[['people','平民社群'],['tech','科技联盟'],['industry','工业联合'],['capital','资本公会'],['state','地区议政署'],['underworld','地下帮派']];
const ranks=[['生存',8000],['工薪',180000],['中产',3800000],['富裕',62000000],['大人物',180000000]];
export function passer(s,i){const n=(s.page*7+i*13+Object.keys(CITY_STREET).indexOf(s.life.city))>>>0;const rank=ranks[(i+s.page)%ranks.length],f=factions[(i+s.page)%factions.length];return {id:`${s.life.city}:${s.page}:${i}`,name:names[(i+s.page)%names.length],origin:i%3===0?regions[(i+s.page)%6]:({taipei:'台北',tokyo:'东京',singapore:'新加坡',newyork:'纽约',monaco:'摩纳哥',vegas:'拉斯维加斯'})[s.life.city],cash:rank[1]+n*113,rank:rank[0],faction:f[0],factionName:f[1],color:[0x7c9e89,0xb39a7b,0x929eb8,0xa6818e,0x789ca3,0xb6aa77][i%6]};}
export function opinion(s,n,w){const relation=s.estate?.relations?.[n.faction]||0;if(relation<=-20)return '上次的立场还没谈拢，先保持距离吧。';if(relation>=20)return '是熟悉的朋友。钱多钱少，都愿意聊聊。';if(w<n.cash*.35)return '他还在起步吧。我也记得第一笔积蓄。';if(w>n.cash*3)return '看起来做成了些事，不知道愿不愿意听我说。';return '身家和我差不多，也许有共同的话题。';}
export function greet(s,n){if(s.ended||s.life.rest||s.life.travel||s.life.energy<1)throw Error('现在需要先休息。');const key=`${s.page}:${n.id}`;const list=Array.isArray(s.life.greetings)?s.life.greetings:[];if(list.includes(key))throw Error('这站已经和这位路人聊过了。');if(list.filter(k=>k.startsWith(s.page+':')).length>=5)throw Error('这站聊得够久了，去下一条街吧。');const bonus=hasCrew(s,'diplomat')?4:2;s.life.greetings=[...list,key].slice(-20);s.life.energy--;s.estate.relations[n.faction]=Math.min(100,(s.estate.relations[n.faction]||0)+bonus);return bonus;}
