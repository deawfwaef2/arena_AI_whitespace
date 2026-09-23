// All USD prices are fixed, illustrative real-world-scale reference prices, not live appraisals.
export const pair=(en,zh)=>({en,zh});
export const RARITIES=[
 {id:'common',name:pair('Street deal','街头机会'),weight:58,color:'#76dbc6',p:[45,76],up:[1.5,2.5],down:[0,0]},
 {id:'uncommon',name:pair('Good find','优质机会'),weight:27,color:'#97eb75',p:[60,83],up:[1.8,3.1],down:[0,0]},
 {id:'rare',name:pair('Rare','稀有'),weight:10,color:'#77d8ff',p:[76,91],up:[2.5,4],down:[0,0]},
 {id:'epic',name:pair('Epic','史诗'),weight:3.6,color:'#cd9dff',p:[86,96],up:[3.5,5.5],down:[0,0]},
 {id:'legendary',name:pair('Legendary','传说'),weight:1.2,color:'#ffce74',p:[93,98],up:[4.5,8],down:[0,0]},
 {id:'mythic',name:pair('Mythic','神话'),weight:.2,color:'#ff8bbd',p:[99,99],up:[10,15],down:[0,0]}
];
export const PROJECTS=[
 {id:"busker",name:pair("Street Busker","街角吉他手"),sector:pair('People & teams','人物与团队'),desc:pair("一个人、一把吉他，为下一场街角演出募集设备费用。","一个人、一把吉他，为下一场街角演出募集设备费用。"),up:pair('Project delivered','合作成功'),down:pair('Project missed','项目失利'),subject:'people',color:"#c5a576"},
 {id:"couriers",name:pair("Courier Crew","跑腿小队"),sector:pair('People & teams','人物与团队'),desc:pair("几位熟悉街巷的伙伴，想添置装备、接下更大的配送订单。","几位熟悉街巷的伙伴，想添置装备、接下更大的配送订单。"),up:pair('Project delivered','合作成功'),down:pair('Project missed','项目失利'),subject:'people',color:"#93ae9c"},
 {id:"makers",name:pair("Maker Partners","创客搭档"),sector:pair('People & teams','人物与团队'),desc:pair("桌上是原型和工具，身旁是搭档。资助他们完成小批量试产。","桌上是原型和工具，身旁是搭档。资助他们完成小批量试产。"),up:pair('Project delivered','合作成功'),down:pair('Project missed','项目失利'),subject:'people',color:"#a9b99b"},
 {id:"dancecrew",name:pair("Dance Collective","街头舞团"),sector:pair('People & teams','人物与团队'),desc:pair("三位舞者准备一场公开演出，收益来自门票与演出合作。","三位舞者准备一场公开演出，收益来自门票与演出合作。"),up:pair('Project delivered','合作成功'),down:pair('Project missed','项目失利'),subject:'people',color:"#c4a1b4"},
 {id:"filmcrew",name:pair("Independent Film Crew","独立摄制组"),sector:pair('People & teams','人物与团队'),desc:pair("导演、摄影师和制片人带着设备来到街头，等待下一位出资人。","导演、摄影师和制片人带着设备来到街头，等待下一位出资人。"),up:pair('Project delivered','合作成功'),down:pair('Project missed','项目失利'),subject:'people',color:"#89a9ab"},
 {id:"researchers",name:pair("Research Team","科研小组"),sector:pair('People & teams','人物与团队'),desc:pair("真正的主角是研究员，而非大楼。资助他们的小型实验。","真正的主角是研究员，而非大楼。资助他们的小型实验。"),up:pair('Project delivered','合作成功'),down:pair('Project missed','项目失利'),subject:'people',color:"#9fbcc4"},
 {id:"founders",name:pair("Founding Partners","创业合伙人"),sector:pair('People & teams','人物与团队'),desc:pair("两位创始人正在白板前路演，把点子变成一次商业尝试。","两位创始人正在白板前路演，把点子变成一次商业尝试。"),up:pair('Project delivered','合作成功'),down:pair('Project missed','项目失利'),subject:'people',color:"#b5b98c"},
 {id:"expedition",name:pair("Expedition Crew","远行探险队"),sector:pair('People & teams','人物与团队'),desc:pair("一支小队、地图和背包。共同承担远行的成本与不确定性。","一支小队、地图和背包。共同承担远行的成本与不确定性。"),up:pair('Project delivered','合作成功'),down:pair('Project missed','项目失利'),subject:'people',color:"#c4aa7d"},
 {id:'coffee',name:pair('Corner Coffee','街角咖啡'),sector:pair('Main street · retail','街角 · 零售'),desc:pair('A little cart. A very big morning rush. Back the next neighborhood favorite.','一辆小小的咖啡车，等待早高峰的人潮。投资街区下一家人气小店。'),up:pair('Morning rush','早高峰爆单'),down:pair('Quiet morning','门可罗雀'),color:'#cf9271'},
 {id:'solar',name:pair('Sunroom Energy','日光能源'),sector:pair('Tomorrow · clean energy','未来 · 清洁能源'),desc:pair('Turn a quiet field into a small sea of solar panels. The forecast is only half the story.','让空旷的土地变成太阳能的海洋。天气预报只讲述了一半的故事。'),up:pair('Clear skies','晴空万里'),down:pair('Grid delays','并网延误'),color:'#80b7df'},
 {id:'vinyl',name:pair('Afterhours Records','午夜唱片'),sector:pair('Culture · collectibles','文化 · 收藏品'),desc:pair('A tiny record shop, an unknown pressing, and the chance of a cult classic.','一家独立唱片店，一张不知名黑胶，一次成为经典的机会。'),up:pair('Sold-out pressing','唱片售罄'),down:pair('Unsold stock','库存积压'),color:'#b29ada'},
 {id:'cloud',name:pair('Cloud Nine','九霄云端'),sector:pair('Technology · infrastructure','科技 · 基础设施'),desc:pair('Cool servers. Hot demand. Rent a little piece of the internet.','冰冷的服务器，火热的需求。承包互联网的一小块角落。'),up:pair('Capacity booked','容量订满'),down:pair('Cost overrun','成本超支'),color:'#85c8ce'},
 {id:'greenhouse',name:pair('Slow Grow','慢生长'),sector:pair('Nature · agriculture','自然 · 农业'),desc:pair('Fresh herbs, patient growers, and a greenhouse with something to prove.','新鲜香草、耐心的园丁，还有一座想证明自己的温室。'),up:pair('Bumper harvest','大获丰收'),down:pair('Crop shortfall','收成欠佳'),color:'#a6bd80'},
 {id:'rocket',name:pair('Orbital Supply','轨道补给'),sector:pair('Frontier · aerospace','前沿 · 航天'),desc:pair('The smallest supplier on a very ambitious launch. Not every idea reaches orbit.','宏大航天计划中最小的供应商。并不是每个梦想都能抵达轨道。'),up:pair('Successful launch','发射成功'),down:pair('Launch scrubbed','发射中止'),color:'#f1ad88'},
 {id:'fashion',name:pair('Studio No. 8','八号设计室'),sector:pair('Design · fashion','设计 · 时装'),desc:pair('A capsule collection with nothing to lose. Except, perhaps, your investment.','一个轻装上阵的时装品牌。当然，你的投资仍然承担风险。'),up:pair('Collection sells out','新品抢空'),down:pair('Trends move on','潮流退去'),color:'#dcadc0'},
 {id:'port',name:pair('Pacific Freight','太平洋货运'),sector:pair('Trade · logistics','贸易 · 物流'),desc:pair('A container crosses the ocean. Will the market still want what is inside?','一只集装箱跨越大洋。靠港时，市场还需要里面的商品吗？'),up:pair('On-time delivery','准时交付'),down:pair('Port bottleneck','港口拥堵'),color:'#edab66'},
 {id:'arcade',name:pair('Pixel District','像素街区'),sector:pair('Play · entertainment','游乐 · 娱乐'),desc:pair('A little arcade with a big opening night. Nostalgia is a powerful thing.','一家小小的街机厅，即将迎来开业之夜。怀旧的力量不容小觑。'),up:pair('Crowds arrive','人潮涌入'),down:pair('Empty floor','冷清开场'),color:'#b797dd'},
 {id:'gold',name:pair('Golden Hour','淘金时刻'),sector:pair('Resources · exploration','资源 · 勘探'),desc:pair('A modest claim in an old gold field. The glitter is real. The outcome is not certain.','在旧金矿区获得一块小小的矿权。金光真实存在，收益却未必。'),up:pair('Rich vein','发现富矿'),down:pair('Dry claim','一无所获'),color:'#dbbd75'},
 {id:'studio',name:pair('Next Take','下一镜'),sector:pair('Media · creators','传媒 · 创作者'),desc:pair('Lights, camera, and a small production crew betting on their first breakout release.','灯光、镜头，一支小小的摄制组，期待第一部爆款作品。'),up:pair('Breakout release','作品爆红'),down:pair('Missed audience','无人问津'),color:'#7bc6b6'},
 {id:'ocean',name:pair('Blue Horizon','蓝色地平线'),sector:pair('Escape · tourism','远行 · 旅游'),desc:pair('A boat, a sunny coast, and an itinerary that could become everyone’s favorite escape.','一艘游艇，一片海岸，一段或许会成为热门度假选择的航线。'),up:pair('Fully booked','全线满员'),down:pair('Cancellations','预订取消'),color:'#75bfd6'},
 {id:'lab',name:pair('Future Matter','未来物质'),sector:pair('Discovery · research','发现 · 科研'),desc:pair('A strange new material leaves the lab. Is the world ready for what comes next?','一种奇特的新材料走出实验室。世界准备好迎接它了吗？'),up:pair('Breakthrough','技术突破'),down:pair('Failed prototype','原型失败'),color:'#cc99ce'},
 {id:'bakery',name:pair('Rise & Shine','晨光烘焙'),sector:pair('Neighborhood · food','社区 · 餐饮'),desc:pair('Warm bread, early mornings, and a small bakery with room to grow.','温暖的面包、清晨的街道，一家等待成长的小小烘焙坊。'),up:pair('Queues outside','店外排队'),down:pair('Slow sales','销量不佳'),color:'#d9b48c'}
];
const asset=(id,en,zh,price,model,tier,effect,color)=>({id,name:pair(en,zh),price,model,tier,effect,color});
export const ASSETS=[
 asset('market-stall','Market stall','街头摊位',1500,'stall',1,'badge','#c79872'),
 asset('container','Converted container','改装集装箱',6500,'container',1,'counter','#b2c895'),
 asset('greenhouse-estate','Garden greenhouse','花园温室',18000,'greenhouse',1,'petals','#a6c892'),
 asset('tiny-home','Tiny home','迷你住宅',65000,'cottage',1,'bronze','#cfb69a'),
 asset('food-truck','Vintage food truck','复古餐车',90000,'truck',1,'confetti','#deae79'),
 asset('studio-loft','City studio','城市公寓',420000,'loft',2,'counter','#a1bdd0'),
 asset('cottage','Lakeside cottage','湖畔别墅',680000,'cottage',2,'petals','#a3c5b2'),
 asset('townhouse','Brooklyn townhouse','布鲁克林联排别墅',1800000,'townhouse',2,'bronze','#c19783'),
 asset('glass-house','Glass house','玻璃宅邸',2500000,'glass',2,'glass','#97c4d0'),
 asset('hillside-villa','Hillside villa','山间别墅',3800000,'villa',2,'silver','#d7d1bd'),
 asset('beach-villa','Beachfront villa','海滨别墅',7500000,'beach',3,'aqua','#94d3d3'),
 asset('penthouse','Skyline penthouse','天际顶层公寓',12000000,'penthouse',3,'neon','#9faad7'),
 asset('vineyard','Private vineyard','私人葡萄庄园',18000000,'vineyard',3,'welcome2','#abb687'),
 asset('gallery','Private art gallery','私人美术馆',24000000,'gallery',3,'prism','#d0b8d1'),
 asset('mansion','Grand manor','宏伟庄园',35000000,'manor',3,'gold','#e1ca92'),
 asset('island','Private island','私人海岛',50000000,'island',4,'aqua','#8ccfc9'),
 asset('marina','Private marina','私人游艇港',65000000,'marina',4,'welcome4','#8fb9d0'),
 asset('resort','Oceanfront resort','海岸度假村',110000000,'resort',4,'gold','#d7bda4'),
 asset('castle','Restored château','修复的古堡',150000000,'castle',4,'royal','#b4a4cf'),
 asset('tower','Landmark tower','地标大厦',320000000,'tower',4,'diamond','#90bdcf'),
 asset('palace','Modern palace','现代宫殿',650000000,'palace',5,'welcome8','#e0c990'),
 asset('stadium','City stadium','城市体育场',1400000000,'stadium',5,'fireworks','#a6bcc9'),
 asset('spaceport','Private spaceport','私人航天港',2800000000,'spaceport',5,'cosmic','#b3a5d4'),
 asset('sky-city','Sky city complex','天空之城建筑群',5500000000,'skycity',5,'sovereign','#d6ca9d')
];
export const EFFECTS={
 badge:pair('A founder badge beside your name.','名字旁点亮创始人徽章。'),
 counter:pair('Your page count joins your leaderboard card.','排行榜名片增加探索页数。'),
 petals:pair('Soft petals follow every step.','柔和花瓣随每一步飘落。'),
 bronze:pair('A warm bronze frame for your profile.','名片与游戏界面镶上铜色边框。'),
 confetti:pair('A small confetti welcome at every new stop.','每次抵达都有一场小小纸屑欢迎秀。'),
 glass:pair('A glass-blue profile border and light trail.','玻璃蓝名片边框与流光足迹。'),
 silver:pair('Polished silver trims and a sparkling trail.','抛光银边框与闪烁足迹。'),
 aqua:pair('Ocean-light ripples surround your avatar.','海光涟漪环绕你的小人。'),
 neon:pair('An animated neon border lights up your run.','动态霓虹边框点亮整段旅程。'),
 welcome2:pair('Two greeters welcome you at every stop.','两位礼宾在每一站迎接你。'),
 welcome4:pair('A four-person welcome party and velvet carpet.','四人迎宾团与天鹅绒地毯。'),
 welcome8:pair('Eight greeters, a red carpet, and a royal entrance.','八人迎宾团、红毯与皇家入场仪式。'),
 prism:pair('Prismatic sparkles and a gallery-grade frame.','棱镜光点与艺术馆级别边框。'),
 gold:pair('Gold leaf borders and golden footsteps.','金箔边框与金色足迹。'),
 royal:pair('A royal-purple frame and a floating crown.','皇家紫边框与悬浮王冠。'),
 diamond:pair('A diamond frame, status title, and brilliant aura.','钻石边框、身份头衔与璀璨光环。'),
 fireworks:pair('Fireworks celebrate every profitable investment.','每次投资盈利都燃放焰火。'),
 cosmic:pair('Orbiting stars and a cosmic interface.','星辰环绕，界面焕为宇宙光辉。'),
 sovereign:pair('The complete sovereign look: crown, aura, entourage.','完整帝王排面：王冠、光环与随行礼宾。')
};
export const OUTFITS=[
 {id:'plain',name:pair('White canvas','纯白起点'),price:0,color:'#f5f5f0',trim:'#e0e5df',kind:'plain',lvPoints:0,upkeep:0},
 {id:'mint',name:pair('Fresh start','薄荷新生'),price:35,color:'#a9d5b2',trim:'#faf5e8',kind:'tee',lvPoints:0.02,upkeep:0},
 {id:'street',name:pair('Streetwear','街头漫步'),price:180,color:'#9fadd2',trim:'#edece7',kind:'hoodie',lvPoints:0.05,upkeep:0},
 {id:'jacket',name:pair('Weekend jacket','周末夹克'),price:650,color:'#bf8e76',trim:'#f9efdf',kind:'jacket',lvPoints:0.12,upkeep:0},
 {id:'suit',name:pair('Tailored suit','定制西装'),price:3200,color:'#35474d',trim:'#e7e6dc',kind:'suit',lvPoints:0.35,upkeep:500},
 {id:'ivory',name:pair('Ivory evening','象牙白礼服'),price:12000,color:'#e7e1ce',trim:'#5a5b54',kind:'suit',lvPoints:0.80,upkeep:1500},
 {id:'gold',name:pair('Golden age','鎏金时代'),price:85000,color:'#d4b461',trim:'#fbecd1',kind:'gold',lvPoints:2.5,upkeep:8000},
 {id:'cyber',name:pair('Future royalty','未来贵族'),price:450000,color:'#4d3f6f',trim:'#83fff0',kind:'cyber',lvPoints:8.0,upkeep:35000},
 {id:'sovereign',name:pair('The sovereign','万众之上'),price:3500000,color:'#ede3c6',trim:'#e7bd55',kind:'royal',lvPoints:30.0,upkeep:200000}
];

export const NOBLE_ITEMS = [
 { id: 'noble-luxury', name: pair('Noble Luxury Summons','贵族黑金导引信'), price: 15000, at: 100000, icon: 'gem', desc: pair('Summon a secret luxury boutique or rare auction on the next block.','以贵族特权信笺命令下一街区开放稀世奢侈品店或孤品拍卖会！'), targetOffer: 'auction' },
 { id: 'noble-bank', name: pair('Swiss Banker Charter','私人银行特许令'), price: 25000, at: 150000, icon: 'bank', desc: pair('Designate the next block as an elite financial venture with enhanced returns.','指引下一站为高净值金融银行项目，返还倍率提升。'), targetOffer: 'bank' },
 { id: 'noble-clinic', name: pair('Royal Medical Summons','皇家疗养预约函'), price: 40000, at: 250000, icon: 'bolt', desc: pair('Summon a private royal rejuvenation clinic to restore health and reduce decay risk.','调集皇家医疗团队设立专属疗养站，恢复健康并降低衰退风险。'), targetOffer: 'clinic' },
 { id: 'noble-tech', name: pair('DeepTech Incubator Key','深潜科技特批函'), price: 80000, at: 500000, icon: 'lab', desc: pair('Designate the next block as a frontier laboratory with breakthrough odds.','指派下一站为前沿科技实验室，大幅增加高倍率技术突破概率。'), targetOffer: 'tech' }
];

export const AUCTION_LOTS = [
 { id: 'auc-davinci', name: pair('Da Vinci Codex Folio','《达·芬奇手稿残卷》'), price: 50000000, points: 25, upkeep: 25000, medal: '📜', desc: pair('Authentic renaissance parchment. Converts cash into permanent Reincarnation Points.','文艺复兴真迹孤品。现金全额化作转世点，永久点亮荣誉勋章墙。'), tier: 4 },
 { id: 'auc-watch', name: pair('Titanic Gold Chronometer','《泰坦尼克号金质天文怀表》'), price: 120000000, points: 60, upkeep: 60000, medal: '⏱️', desc: pair('Salvaged deep-sea gold chronometer marking the frozen moment of history.','深海打捞的纯金精密怀表，凝固历史终章的流金见证。'), tier: 4 },
 { id: 'auc-mars', name: pair('Mars Sector 01 Deed','《火星第一勘探区永久地契》'), price: 350000000, points: 180, upkeep: 180000, medal: '🪐', desc: pair('Physical parchment charter granting permanent mineral rights to Martian Sector 1.','星际拓荒时代的原初物理地契，附赠密封火星土壤样本。'), tier: 5 },
 { id: 'auc-sapphire', name: pair('Sovereign Azure Sapphire','《海蓝帝国主权蓝宝石》'), price: 1000000000, points: 500, upkeep: 500000, medal: '💎', desc: pair('Flawless 880-carat royal gemstone that adorned historic coronation sceptres.','重达 880 克拉的未切割纯净蓝宝石，铭刻古老王朝荣光。'), tier: 5 },
 { id: 'auc-meteorite', name: pair('Orion Meteorite Seal','《猎户座陨铁雕刻黑金印章》'), price: 3000000000, points: 1500, upkeep: 1500000, medal: '🔱', desc: pair('Cold-forged deep space meteorite signet embodying absolute financial supremacy.','深空陨铁冷锻而成的传世印玺，触感冰冷，彰显绝对资本统治力。'), tier: 6 },
 { id: 'auc-dyson', name: pair('Dyson Ring Charter','《近地轨道戴森光环冠名权》'), price: 10000000000, points: 5000, upkeep: 5000000, medal: '☀️', desc: pair('Golden registry certificate permanently inscribed into the solar satellite ring.','人类恒星能源奇迹的初代主导者冠名勋章，永久铭刻于太阳轨道。'), tier: 6 },
 { id: 'auc-quantum', name: pair('Quantum Core Key','《原初量子算力核心密钥》'), price: 30000000000, points: 16000, upkeep: 15000000, medal: '⚛️', desc: pair('Superconducting gold-platinum key controlling foundational planetary compute.','掌控全球核心算力中枢的纯金实体密钥芯片，通往数字永生。'), tier: 7 },
 { id: 'auc-emperor', name: pair('Augustus Gold Laurel','《古罗马奥古斯都纯金桂冠》'), price: 100000000000, points: 50000, upkeep: 50000000, medal: '👑', desc: pair('Millennium-old golden imperial laurel wreath representing the zenith of power.','千年前帝国权杖之巅的纯金桂冠，至高威严与永恒权力的最终象征。'), tier: 7 }
];
export const TIERS=[
 {at:0,name:pair('Street level','白手起家'),line:pair('Little money.\nBig possibilities.','小小本金。\n无限可能。'),color:'#bcdf9b'},
 {at:500,name:pair('Finding your feet','崭露头角'),line:pair('A little momentum.\nA bigger horizon.','积攒底气。\n望向远方。'),color:'#bcdf9b'},
 {at:10000,name:pair('On the rise','一路攀升'),line:pair('Small choices.\nReal momentum.','每次抉择。\n都在向上。'),color:'#9dcdb9'},
 {at:100000,name:pair('High flyer','风生水起'),line:pair('The view is\ngetting better.','眼前风景。\n渐入佳境。'),color:'#9dbce9'},
 {at:1000000,name:pair('Millionaire','百万身家'),line:pair('Welcome to\nthe golden hour.','属于你的。\n黄金时代。'),color:'#e3c373'},
 {at:100000000,name:pair('Magnate','商业巨擘'),line:pair('You do not follow\nthe skyline. You own it.','不再仰望。\n你即天际。'),color:'#c5a5ed'},
 {at:1000000000,name:pair('The upper echelon','巅峰之上'),line:pair('Some build wealth.\nYou built a world.','有人积累财富。\n你创造了世界。'),color:'#f2cea0'}
];
export const getAsset=id=>ASSETS.find(a=>a.id===id);
export const getOutfit=id=>OUTFITS.find(a=>a.id===id)||OUTFITS[0];
export const getRarity=id=>RARITIES.find(r=>r.id===id)||RARITIES[0];
export const getProject=id=>PROJECTS.find(p=>p.id===id)||PROJECTS[0];
export const getAuctionLot=id=>AUCTION_LOTS.find(a=>a.id===id)||null;
export const getNobleItem=id=>NOBLE_ITEMS.find(n=>n.id===id)||null;

// Explicit special rules, never applied silently to ordinary investments.
export const SPECIALS=[
 {id:'half',name:pair('Half in. All on the line.','押一半，赌全部。'),short:pair('HALF-STAKE SHOWDOWN','半仓生死局'),scene:'arcade',ratio:.5,p:60,up:4,lossScope:'wallet',color:'#ff857d',rarity:'epic',desc:pair('Invest exactly 50% of your cash. Win a 4× return on that stake. Lose and ALL your cash is gone.','必须投入当前现金的 50%。成功返还 4 倍投入；失败清空全部现金，包括未投入的另一半。')},
 {id:'jackpot',name:pair('All-in jackpot','全仓冲击头奖'),short:pair('ALL-IN JACKPOT','全仓头奖'),scene:'gold',ratio:1,p:30,up:7,lossScope:'wallet',color:'#ffcb63',rarity:'legendary',desc:pair('Every dollar goes in. A 30% shot at 7×. Otherwise this run ends.','投入全部现金。30% 概率获得 7 倍返还，否则本局结束。')},
 {id:'flip',name:pair('Double or nothing','翻倍，或者归零'),short:pair('THE COIN FLIP','硬币对决'),scene:'lab',ratio:.25,p:50,up:2,lossScope:'stake',color:'#8ad4ff',rarity:'rare',desc:pair('Commit 25% of your cash. A fair coin doubles that stake or takes it. Your other cash stays safe.','固定投入 25% 现金。50% 概率本金翻倍，50% 概率投入归零；其余现金安全。')},
 {id:'redline',name:pair('The redline run','狂飙红线'),short:pair('HIGH-SPEED CONTRACT','极速合约'),scene:'rocket',ratio:.75,p:72,up:2.8,lossScope:'stake',color:'#ffac72',rarity:'epic',desc:pair('Commit 75% of your cash for a 72% shot at 2.8×. Lose that entire stake if it fails.','固定投入 75% 现金，72% 概率返还 2.8 倍。失败损失全部投入，保留剩余 25% 现金。')}
];
export const CHALLENGES=[
 {id:'double',name:pair('The two-minute double','两分钟翻倍'),short:pair('2-MINUTE WEALTH RACE','两分钟财富赛'),scene:'cloud',seconds:120,targetFactor:2,rewardFactor:.8,penaltyFactor:.3,metric:'wealth',color:'#bfa5ff'},
 {id:'flash',name:pair('Thirty-second rush','30 秒闪电冲刺'),short:pair('30-SECOND RUSH','30 秒冲刺'),scene:'solar',seconds:30,targetFactor:1.5,rewardFactor:.55,penaltyFactor:.25,metric:'wealth',color:'#ffc280'},
 {id:'moonshot',name:pair('The 3× moonshot','三分钟，三倍身家'),short:pair('3-MINUTE MOONSHOT','三分钟登月'),scene:'rocket',seconds:180,targetFactor:3,rewardFactor:1.5,penaltyFactor:.5,metric:'wealth',color:'#80d9ff'},
 {id:'streak',name:pair('Three in a row','三连胜对赌'),short:pair('90-SECOND WIN STREAK','90 秒三连胜'),scene:'arcade',seconds:90,targetFactor:3,rewardFactor:.9,penaltyFactor:.25,metric:'streak',color:'#9bea9d'}
];
export const getSpecial=id=>SPECIALS.find(x=>x.id===id)||SPECIALS[0];
export const getChallenge=id=>CHALLENGES.find(x=>x.id===id)||CHALLENGES[0];
