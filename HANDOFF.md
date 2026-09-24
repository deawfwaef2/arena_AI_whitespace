# 模型交接 / 必须先读

## 用户的硬性约束（每次编程前重读本文件，不可跳过）
- 根目录 `index.html` 必须始终是完整、自包含、下载后双击即可开始玩的离线游戏，不依赖 npm、服务器或外部 CDN。开始画面必须有明显的「开始游戏」按钮。
- **先打包再继续**：每个小阶段先跑 `npm run checkpoint`，构建成功才原子替换根 HTML，然后立刻 `git commit && git push`。禁止攒到最后一次性打包/推送——用户随时可能中断，中断时根目录必须是可玩版本。
- 提交源码时必须同时提交 HTML。推送失败要如实说明，本地仍必须留可玩版本。
- 不覆盖/清空原有用户存档（存储键 `upshift-save-v3`）；保留原玩法，增量完善。货币内部单位是美分，界面美元。
- 不把任何密钥写进仓库、HTML、日志、交接或下载包。对话里出现过的访问令牌应由用户撤销更换。
- 不声称未实现或未真实运行过的测试已通过。

## 视觉自检要求（用户明确问过「你有没有眼睛」）
必须用 Playwright Chromium 实际截图并肉眼检查，不能只跑逻辑测试。流程：
1. `npm run checkpoint`
2. `python3 -m http.server 8080 --bind 127.0.0.1 &`
3. `node qa/shot.mjs`（本仓库自带的截图脚本，会生成 `qa/shot-*.png`）
4. 用 read_file 逐张看图；至少覆盖 贫穷/成长/富裕 × 桌面/手机，以及 随从面板、人才市场、休息、地图、身家。
Playwright 需要 `npx playwright install --with-deps chromium`（沙箱重建后要重装，约 2 分钟）。

## 设计要求（优先于旧版三布局方案）
- **所有游戏 UI 必须在游戏画面内**，不做画面外分栏、管理控制台或大块仪表盘。
- **贫穷阶段极简**：现金/阶级提示、机制解锁进度条、当前投资决策。辅助功能用很小的画内菜单。
- 财富增长后逐步解锁界面，清晰预告下一机制门槛，带入场动画和明确解锁提醒；不要闪现闪退。
- 城市全景在主游戏内按资产阶段显示；地图是旅行用途。**全景固定在左上角**（用户点名要求，不得放右上）。
- 手机优先保护场景可见面积，投资卡紧凑、触控目标可点、弹窗可滚动，文本对比固定。
- 路边行人来自不同地域/阶级/派系，头顶显示财富、阶级、阵营。**不要气泡框**，改用轻量飘字（见下）。
- 项目负责人有对玩家的评价和对白，项目内容及外观体现城市差异。
- 人才市场是沿途随机地点；随从有实际机制、维护费、可解雇；点击场景中的随从才打开管理页。
- 操作要有即时按压/数值/结果反馈，转场有动效；尊重减少动态效果设置。

## 用户 2026-09-23 第二轮反馈（本轮正在处理，逐条勾选）
1. ✅ 城市全景必须移到**左上角**（原来在右上角没动）。
2. ✅ 金钱旁要能看到**下一级财富门槛是多少**（解锁下一机制需要多少钱）。
3. ✅ 「解锁新机制」庆祝弹窗**乱点不能关闭**——必须点确认按钮才关（点遮罩/Esc 无效）。
4. ✅ 随从界面排版错误（头像和文字挤在一起、按钮太小）——已重做 `.companion-profile`。
5. ✅ 各种 UI 出现「大黑边框」——来源是 `.scene-toast` 深色块与 `#modal-card` 3px 边框叠加，已改浅色描边。
6. ✅ **取消路人聊天气泡**（`.thought` 方框），改成会自动消失的轻量飘字评价（`.street-quip`）。
7. ✅ 旅行/挑战入口不够醒目——`.street-nav` 加高亮态与脉冲提示。
8. ✅ 很多文字和背景颜色接近，难以辨认——统一提高对比度（`src/contrast.css`）。
9. ✅ 不同财富阶级的 UI 差距太小——`data-visual-rank` 分级强化（边框、材质、字体、装饰）。
10. ✅ 项目的**稀有度、类型**要更显眼——投资卡顶部加大号稀有度徽章与类型条。
11. ✅ 休息阶段要有**更多类型的投资项目**上门（有钱后各路人马提案）——新增 `src/rest-pitch.js`。
12. ✅ 右下角弹窗（toast）挡字——移到右上、留出安全区。
13. ✅ 休息阶段的阶级消费要有**阶级特色装饰边框**——`data-rest-class` 分级装饰。
14. ✅ 社群关系要有**关系条**可视化——`.faction-bars`。
15. ✅ 赚钱/花钱要有**大师级反馈**：钞票飞向钱包 / 飞向选项，并随金额切换单位图案（硬币→钞票→钞票捆→美元箱）——`src/cashflow.js`。
16. ✅ 增加按钮反馈感、继续扩充文案项目。

## 工作流程
1. 读 HANDOFF.md、PROGRESS.md、git status。
2. 修改一个可独立交付阶段。
3. `npm run checkpoint` → 视觉自检 → `git commit && git push`。**每个阶段都要推**。
4. 更新 PROGRESS.md。随后才进入下一阶段。

## 代码地图
- 入口 `src/app.js`；纯规则 `src/engine.js` / `src/life-core.js` / `src/endgame-core.js` / `src/street-core.js`。
- UI：`src/redesign.js`（画内 HUD 骨架）、`src/street-ui.js`（人物/市场/随从/故事）、`src/capital-ui.js`（休息、身家、机制进度）、`src/prosperity.js`（阶级徽章与升降级演出）。
- 3D 世界与锚点：`src/world.js`。
- CSS 叠加顺序（后者覆盖前者）：`style.css` → `life.css` → `readable.css` → `journey.css` → `capital.css` → `redesign.css` → `bold.css` → **`contrast.css`（本轮新增，最高优先级）**。改样式优先写在 `contrast.css`，避免和旧文件互相 `!important` 打架。
- 新增模块：`src/cashflow.js`（金钱飞行动画）、`src/rest-pitch.js`（休息期投资提案）。
- 构建：`build.mjs` 把所有 CSS/JS/字体/音乐/图片内联成单个 HTML（约 33 MB，正常，不要为压体积破坏离线要求）。

## 既有坑（别再踩）
- 拍卖 `AUCTION_LOTS` 的 price/upkeep 是**美分**，和普通资产 price 的美元数值不同；显示不能再乘 100；奖励字段是 `points`。
- 人才最多 3 人；工资每次休息计入 `maintenance.companions`，不要再加到总账单一次。休息锁账后禁止招募/解雇。
- 随从加成只对**后续**项目生效，不回写当前已生成条款。
- 行人相关文本每 9 秒固定选择一次，不能每帧根据可见性改选，否则布局振荡。
- 单文件约 33 MiB，内置音频/字体/图片，无外部请求。

## 工作区约束（2026-09-23 第三轮新增）
- 模型工作区快照上限约 128MB，超出会随机丢文件。仓库 .git 约 170MB，**必须克隆到 /tmp/repo 工作**，不要放进 /home/user。GitHub 才是持久化位置，每个小阶段都 push。
- 根目录 `index.html` 任何时刻都必须可双击开玩（有「开始游戏」按钮）。先打包、先推送，再做下一步。
- 用户在对话里给过访问令牌：只用于 git remote，不写进任何文件。

## 用户 2026-09-23 第三轮反馈（逐条勾选，未完成的保持 ⬜）
1. ✅ 手机**强制横屏**（竖屏时旋转画面/提示），手机 UI 不能和电脑一样，要专门排版。
2. ✅ 所有购买/解锁的新机制都要有**大图标**在游戏画面边缘（不寄生在小角落）。三种：开关型（点击切换）、悬停看详情型（不可点）、点击查看功能型。图标不能简陋，要设计感。
3. ✅ **重要机制图标分布在底部、顶部空白区域**。
4. ✅ 每次休息结束**切换春夏秋冬**，各有特效；每个阶段开始**随机天气**（用户很喜欢）。
5. ✅ 休息阶段画面中心附近有**阶级小游戏**（不同阶级不同小游戏，有代入感），玩完**减少休息时间**；也可**花钱一次性跳过/解锁**（约耗 30% 资产）。
6. ✅ 解锁要顺滑；很多是**装饰性解锁**，让金额涨跌带来「得到-收回」的反差感。
7. ✅ **贫穷阶段 UI 很土、偏灰、简单**；越富裕 UI 越华丽、越有形状（边框、窗口、按钮、滑杆都随财富升级）。
8. ✅ 按钮、滑杆、窗口整体**再大一点**。
9. ✅ 地区更「活」：特殊事件路口可选择前往**同城不同区域**（不同区域名，本阶段不同效果）。
10. ✅ **金钱 UI 最左上角、非常大、显眼**；**时间-季节-年份 UI 在金钱下方**。
11. ✅ **城市预览图放左下角**，占很大空间，初始简陋、后期高级，**随 BGM 律动**；不要方形框，要有设计感的异形框；**初始不解锁**（最开始最简单）。 ※ 此条覆盖旧版「全景固定左上角」要求。
12. ✅ 门槛奖励：把**即将得到的图标**放进奖励区，让玩家感觉要得到一堆东西。奖励内容 UI 放**右上**。
13. ✅ 进度条：从画面项目 UI 上方最右端出发，**竖向冲到右上角**；「点点点，条冲冲冲，到顶一堆机制获得」的感觉。
14. ✅ 休息阶段与各种事件做成**可任意拖动的新窗口**。
15. ✅ 项目分**即时项目**与**延时项目**（短延时/长延时，利润更丰富，休息阶段结算），窗口外观明显区别，不只是标签；每买一个延时项目**多一个可拖动窗口**，到期转为钱。
16. ✅ 项目 UI 重设计：更横，投资按钮**圆形**，投资滑杆也**圆形（旋钮）**；按钮上方一点是资产升级进度条；贫穷简陋、富裕精致。
17. ✅ 文案/信息分阶级：贫穷阶段是穷人接触的信息，富人阶段是富人信息。
18. ⬜ 可以用生图工具做 UI 素材（注意 HTML 体积与 128MB 工作区限制）。

### 第三轮实现说明（v7 层，给下一个模型）
- 新增 `src/v7.js` + `src/v7.css`（CSS 最后加载，优先级最高）。旧 HUD（`.portrait-hud`、`#hud-rail`、`#wealth-badges`、`#city-panorama`、`#milestone-progress-bar` 等）在 `#app[data-v7='on']` 下全部隐藏，逻辑仍在运行。**新 UI 只改 v7 文件。**
- 财富皮肤：`#app[data-v7rank=0..5]`（= min(5, lateTier)）。0 灰色等宽字体方框 → 1 米色 → 2 圆角奶油 → 3 鎏金异形 → 4 深蓝六边切角 → 5 黑金旋转光环。
- 机制图标表 `MECHS`（id/at 美元门槛/slot top|bottom/kind click|toggle|hover/fx 装饰效果）。低于门槛自动播放「回收」动画，回升时从右上奖励框飞入。开关状态存 `run.life.v7.toggles`。
- 季节/天气/年份存 `run.life.v7.{season,year,weather}`；休息结束（rest 从有到无）时换季 + 随机天气 + 季节横幅；粒子画在 `#v7-fx`。
- 延时项目：身家 ≥ $20,000 时约 30% 普通项目标记为 `offer.v7delay`（short 1 次休息/long 2 次，返还 +0.4/+0.9）。签约时结果立即抽出并封存在 `run.life.v7.delayed`，`worth()` 已计入锁定本金（endgame-core.js）。每份合同是一个可拖动窗口，到期点击兑现。
- 岔路口：每次休息周期、第 3/10/17… 步出现一次，选同城区域（`DISTRICTS`），效果到下次休息。
- 休息小游戏：`GAMES[阶级]`，每次休息最多 3 次，按星级减 30s/90s/150s/240s；「包场跳过」花 30% 现金直接结束休息（需确认）。
- 投资窗口：`.v7-split` 两栏；右栏旋钮 `#v7-knob` 驱动原 `#stake-range`（保持原投资逻辑），圆形按钮 `#v7-go` 触发原 `invest` 或 `v7-delay-invest`。
- 手机：`body[data-v7phone='yes']`（粗指针+小屏，或横屏高度≤500）。竖屏显示旋转遮罩并尝试全屏+锁定横屏。
- QA：`node qa/v7shot.mjs [名称]` 截图，`node qa/v7flow.mjs` 功能流（旋钮/签约/休息小游戏/包场/换季/兑现/开关/岔路口）。Playwright 点击小游戏按钮要用 mouse.click 坐标（按钮一直在动画）。

## 用户 2026-09-23 第四轮反馈（逐条勾选，未完成保持 ⬜）
1. ✅ 右下投资 UI 不清晰：**成功/失败金额放在投资按钮上方**；右侧竖向进度条**起点在投资按钮右边**（用户认可这点，保留）。
2. ✅ 投资金额处**文字重叠**；**金钱 UI 太小**，要更大。
3. ✅ **旋钮不方便 → 改回横向滑杆**（滑轮）；而且卡顿。
4. ✅ 装饰类解锁**默认开启**。
5. ✅ 右下横向投资 UI **要更大**，同时**更简洁、更多图像语言、只留关键信息**（看着不累）。
6. ✅ 进入主菜单前：**黑屏选语言（中文/English）** → **LOGO「Deawfwaef Games」** → **微型 CG 动画介绍**（留悬念：展示后期 UI 多华丽，玩家要一步步升级）→ 主菜单。
7. ✅ **非常卡**，必须做性能优化（降低 3D/粒子/DOM 重排开销）。
8. ✅ 经常遇到**重复项目** → 项目去重/更多项目池。
9. ✅ **顶部中间**：健康 + 已经休息的阶段数；时间/季节/天气做成**横条放顶部中央**。
10. ✅ **图标不要 emoji**，用生图模型生成素材（注意体积）。
11. ✅ **旅行 UI 有时消失**（bug）。
12. ✅ 3D 场景**人物位置 bug 一堆**。
13. 🟡 贫穷与富裕 UI 差距**仍太小**，继续拉大。
14. ✅ 目标感/上瘾感/策略性：让玩家玩得久、不无聊（目标、成就、连击、选择取舍等）。

### 第四轮实现说明（v8 层，给下一个模型）
- 新文件：`src/v8.css`（在 v7.css 之后加载）、`src/intro.js` + `src/intro.css`（启动序列）。新 UI 优先改 v8.css。
- **启动序列**：`runIntro()` 在 app.js 里替代直接 `onboarding.show()`：黑屏选语言（写入 meta.lang）→ LOGO「Deawfwaef Games」（assets/art/logo.webp）→ 约 13 秒 CG（cg-poor → 面板从 rank0 灰变到 rank5 黑金，然后图标上锁「?」留悬念）→「进入游戏」→ 原主菜单。随时可「跳过」/Esc。QA 脚本要先点 `#v8-intro [data-l="zh"]` 再点 `.v8i-skip`（qa/v7shot.mjs 已改）。
- **投资窗口**：`enhanceDeal()` 把原 dock 重排成 `.v8-deal` 宽横条：左 = 标签（即时/延时、星级、类别、连胜）+ 标题 + 随机变数 + 金额输入 + 快捷 25/50/全部 + **大横向滑杆**（原 #stake-range，旋钮已删）；右 = 成功/失败金额（**在按钮上方**）→ 升级进度条 → 跳过 + 圆形投资键。右侧竖向进度条从投资键右边往上冲。
- **顶部中央状态条** `#v8-status`：季节 · 年份 · 天气（SVG 图标，非 emoji）| 健康心 | 已休息次数 | 体力。旧 `#v7-clock` 已隐藏。
- **装饰默认开启**：toggle 的判定改成 `toggles[id]!==false`（未设置 = 开）。
- **旅行图标消失 bug**：点击型机制一旦解锁就写入 `v7.owned`，之后身家回落也不收回（只收回装饰/悬停型，保留「得到-收回」反差）。
- **不重复项目**：`pickLocal(city,rng,wealth,recent)` 记住最近 12 个，排除最近 N 个（N=池大小−3）。
- **可玩性**：项目随机变数 `o.v8twist`（约 42%，含雨天/晴天相关）；连胜 ≥2 时返还 +0.05/胜（最多 6）；**本季目标** `#v8-goals`（右上奖励框下方，3 条，每条奖身家 4%，全清再 ×3，每次休息后刷新）。
- **性能**：阴影 1024 + PCFShadowMap、像素比上限 1.5、去掉大图层 backdrop-filter、--v7-beat 只写在 HUD 上并量化、粒子每帧绘制但去 shadowBlur、滑杆同步合并到一帧。
- **3D 人物**：路人行走时避开主角/摊主/随从占位，朝向平滑；随从编队插值跟随。
- **小游戏素材**：assets/art/mg/*.webp（生图切片，透明底），build 时以 `mg-<名>` 进入 UPSHIFT_ART。
- 仍待做（13 🟡）：贫富 UI 差距已经拉大（rank0 灰色等宽字体方框/硬阴影 → rank5 黑金），用户可能还想要更强，继续按反馈调。

## 用户 2026-09-24 第五轮反馈（逐条勾选，未完成保持 ⬜）
1. ⬜ 商店未购买就不能启用的机制图标：加**封条**（斜贴封条视觉）+ 提示「必须先购买才能启用」。
2. ⬜ 越有钱，**画面边缘出现不同等级的美化边框**（屏幕外框装饰，分级）。
3. ⬜ **金钱降低后东西没有被收回、等级没有降级**（bug）——降到门槛下要收回/降级。
4. ⬜ 开局动画不要纯生成图片：要**和游戏同画风的 3D 模型运镜场景 + 图片联合**。
5. ⬜ 有时 UI **没有选项**（如故事 UI）——bug，任何对话窗口必须至少有一个可点选项。
6. ⬜ **选英文后又变中文**——bug，语言必须全程保持。
7. ⬜ 每局体验差不多、**太简单稳赢**、不够好玩 → 增加变化、难度、博弈。
8. ⬜ 高等级后**金钱 UI 显示休息阶段的阶级维护费**，以及当前是否付得起。
9. ⬜ **合伙人系统**：前进时遇到合伙人 → 先付钱建立联系 → 弹窗展示合伙人；之后点击下一个项目时常会遇到他，他带来非常特殊的项目；有对话、交际、支线剧情。
10. ⬜ 富裕阶段 UI **形状更高级**（窗口/按钮外形）。
11. ⬜ 边框上有**阶级相关身份物装饰**（较大图案，贫穷也有：如易拉罐/纸箱，富裕：金表/游艇等）。
12. ⬜ **健康改成 3 格**。体力：<100 时疲惫——屏幕特效 + 大窗口提示去休息；否则休息阶段有额外概率（体力越接近 0 概率越接近 100%）健康再 −1。
13. ⬜ 不要太快登顶：**增加更多富裕阶层**，顶层在有限时间内很难达到；最顶层可以**无限**（无限等级）。
14. ⬜ 变富后**小人形象升级**（服装/配饰随阶级）。
15. ⬜ 更多投资方法/技巧/博弈性/策略性。
16. ⬜ 城市之外的**特殊地点**（医院等），全是特殊项目；不能让玩家太轻松回血。
17. ⬜ **LV 点（胜利点）**：奢侈品系统——奢侈品是一种项目，每种每局只出现一次、稀有；购买后有永久窗口展示；奢侈品给 LV 点；买建筑资产给微量 LV 点；通关获得 LV 点；**排行榜**比拼单局最高 LV 点；LV 点高可解锁**角色皮肤**。
18. ⬜ 贫穷阶段更简单：**NPC 不对话**，项目信息更少（解锁后才显示详细）；**贫穷阶段不显示本季目标**。
19. ⬜ **主线剧情**：每次到达新社会阶层触发剧情对话；包含身世剧情，对话选项由玩家选择心情/动机。

### 第五轮工作约束补充
- 仓库 .git 约 240MB，只能放在 /tmp/game（或 /tmp/repo），绝不放 /home/user。
- 每完成一条/一小组就 `npm run checkpoint` → commit → push。

## 用户 2026-09-24 第六轮反馈（在第五轮 19 条基础上追加；逐条勾选，未完成保持 ⬜）
20. ⬜ **更多图形语言、更多视觉反馈**；减少纯文字按钮，改为「图片+文字」按钮；**不要 emoji**，用生成图片。
21. ⬜ **最贫穷阶段不解锁投资项目**；投资项目金额下限至少约 $2,000。最初只能**打工**：打工项目要**点点点（像挖矿）**，消耗体力，点满才得钱。
22. ⬜ 根目录提供一个**双击即可让手机同 Wi-Fi 访问游戏**的程序/脚本（已有 launcher/bin/Start-Last100.exe，需在根目录给出显眼入口）。
23. ⬜ **每次移动后周围环境角色突然全部消失**——很讨厌，必须保持连续（bug）。
24. ⬜ 画面灰蒙蒙、低劣：**金额越多画风越高级、环境越美**（光照/色彩/天空/雾随财富提升）。
25. ⬜ **抽卡式场地**：遇到的地点/项目来自牌库；**牌库抽空**后出现特殊项目问「下一次往哪里走」，不同方向=不同牌库（打工区 / 项目区 / 偶尔高级项目区等）。卡牌相关 UI（剩余张数/当前区域）放**画面中间顶部、天气信息条下面**。
26. ⬜ 开局动画同时是**快速教程**。
27. ⬜ **被收回（降级回收）要弹窗，必须点击确认**；更强的反馈系统。
28. ⬜ **装饰机制不允许关闭**；**无用的被动机制放一起、做得更隐身**（不让画面复杂），**很有用的放一起**。

## Round 6 progress log (appended)
- [x] v9 phase 1 (commit 7b9caf4): `src/v9-core.js` (pure rules) + `src/v9.js` (UI) + `src/v9.css`; wired in app.js (renderDock → v9.interceptDock first, dispatcher → v9.handle, pulseClock → v9.tick, refresh → v9.refresh).
  - Work-first: below $3,000 liquid only tap-work cards (v9-work); projects need liquid ≥ $3,000 and stake ≥ $2,000.
  - Card deck strip top-centre under the status bar; empty deck → v9-fork card (work / market / elite / hospital / casino / pawn).
  - Tiered frames (#v9-frame[data-rank] 0–5) with big class identity props (assets/art/ic/*.webp, embedded as ART('ic-name')).
  - Seals on mechanisms whose item isn't bought yet (v7.js ITEM_REQ); decorative mechs can't be toggled and sit in a compact quiet strip.
  - Reclaim popup must be clicked (v9-reclaim is DELIBERATE_ONLY); rank now follows LIQUID money (cash + stakes).
  - Fatigue < 100 energy: screen vignette + chip + one-time big popup; rest-time extra heart-loss chance = 100 − energy %.
  - Hearts are now 3 (4 with constitution); qa/core.test.mjs updated to match.
  - LV: luxuries (once per run, vitrine window), estates, partner bonds, peak bonus → record.lv, meta.v9best, skins.
  - Main story popup per class (t0 origin perk choice), partners (fee → later interrupting deals), special places.
  - Upkeep + affordability shown under the money (v7-money-sub).
- [x] NPCs no longer vanish while travelling (world.js streetCast visible during travel; cast key no longer resets on every step).
- [x] Poor stage hides season goals, NPC labels and quips.
- [x] Language no longer reverts on platform onAuth (keeps intro/session choice).
- [x] Root phone launcher: PLAY-ON-PHONE.bat / play-on-phone.command / play-on-phone.py (prints LAN URL, same Wi-Fi).
- [x] World gets brighter/saturated with wealth (world.setBeauty), avatar accessories by wealth, world.setSkin for LV skins.
- [ ] TODO next: intro as 3D-camera tutorial; English strings for v7 texts; grouping passives further; story-with-no-options audit; more investment kinds.

## 用户 2026-09-24 第七轮反馈（追加；逐条勾选）
29. ⬜ 富裕后解锁：**休息结束补充体力后，选择下一个去的区域**（区域选择弹窗）。
30. ⬜ **随从太便宜**——涨价。
31. ⬜ **重要弹窗只能点按钮关闭**，点背景不许跳过（否则根本没看清）。
32. ⬜ **更多大按钮、图形语言、动画**（例：医疗检查界面）；按钮=大图形+大字，不要一堆小字。
33. ⬜ 新增**商店区 / 商业区**。
34. ⬜ **右上角 LV 挡住窗口**——挪开；**奢侈品陈列窗口**要有成就感，可拖到一边。
35. ⬜ **医院固定价格（对齐现实）**；**花钱=概率回血**（不是必定）；**医院不要一开始解锁**。
36. ⬜ **不同合伙人要看得到其项目特色**；更有钱时遇到的合伙人可**花钱概率降低生病几率**。
37. ⬜ **合伙人建立联系后有可拖动窗口**显示信息，可**随时解除合伙**。
38. ⬜ **疲惫 UI 更醒目**；额外概率**反线性**（体力→0 时额外概率→100%，低体力段增长更快）；额外概率加在**衰退概率**上。
39. ⬜ **主线剧情 UI 重做**：高方块图形选项；不同选项显示**主角心境**；更剧情式、**无实际数值效果**。
40. ⬜ **约 $500 阶段解锁小游戏技巧项目**（小游戏成功拿钱，有代入感）。
41. ⬜ **项目 UI 更有特色、不同质化**；**不同城市不同特色**，并**写在旅行界面**上。
42. ⬜ **屏幕边装饰重做**：非常有形状的方框花边（像相框/雕花边框）。
43. ⬜ **3D 小人每次移动整个屏幕都在动**——不好（镜头不要整体晃动/平移）。
44. ⬜ **即时项目 vs 延时项目区别更大**：图形语言、大文字。
45. ⬜ **休息阶段找你投资的项目**改为**弹窗式**。
46. ⬜ **前期→中期更平滑**：$5,000–$70,000 之间也要有 UI 变化/损失（更多细分档位）。
47. ⬜ **主菜单英文进入还是中文**（bug）；**英文界面全英文**（大量 UI 仍是中文）。
48. ⬜ **开局动画重做**：用本游戏 3D 画风，吸引玩家、介绍规则示例、埋伏笔、展示后期丰富 UI 的对比感。
49. ⬜ **主菜单要 3D 背景感**。
50. ⬜ 继续丰富内容。

### 第七轮工作约束
- /tmp 在回合间会丢失：每轮开头若 /tmp/game 不存在就重新 clone（token 只放 remote URL，绝不写入文件/日志）。
- 仍然：阶段性 checkpoint → commit → push；根目录 index.html 始终可玩。

## Round 7 progress — item 47 (English)
- [x] 47 Full English: runtime translator `src/i18n.js` (MutationObserver over text + title/aria-label/placeholder/alt) using dictionary `src/i18n-en.js`, generated by `python3 tools/i18n-build.py` from `tools/i18n-keys.json` (extracted via `tools/i18n-extract.py`) + `tools/i18n/b*.txt` (idx|English) + `tools/i18n/extra.txt` (zh|en, templates with {}).
  - NEVER re-run the extractor without re-mapping indices: b*.txt lines are keyed by key index. Add new strings to `extra.txt` instead.
  - QA: `node qa/en.mjs` (fresh intro → English) and `SHOT_LANG=en node qa/v10shot.mjs` write leftover Chinese to `qa/en-leftovers.txt` / `qa/v10-missing.txt` (both empty/near-empty at this commit). Runtime misses: `window.__i18nMissing`.
  - Money compact units in English use M/B/T (v7 fmt, capital-ui/life-ui short).

---
# 第八轮用户反馈 / Round 8 feedback (append-only; items 51–64)
Standing constraints (unchanged): save/commit/push in phases, root `index.html` always playable offline with a start button (use `npm run checkpoint` BEFORE commit), workspace < 128MB (work in /tmp/game), never overwrite this file, never write the token into files, no emoji-style icons — use generated images (image+text big buttons OK), Playwright screenshots and actually look at them.
- [ ] 51 Moving should feel like the SCENE changes/travels past, not walking in place.
- [ ] 52 When turning a street corner/block the camera should also rotate — livelier.
- [ ] 53 Rename game to **Broke to Billionaire: The $100 Start** (title, menu, HTML <title>, docs).
- [ ] 54 Opening animation: redesign at master level — attractive trailer, show the game, foreshadow; user says it got rougher over time. Introduce the game to the viewer.
- [ ] 55 Still lots of residual Chinese, incl. in the 3D scene in English mode (signs/canvas text).
- [ ] 56 Class promotion: popup with immersive text describing the new class.
- [ ] 57 More big buttons + graphic language; images must be generated (built-in image engine), not emoji or emoji-like; button background / panoramic-picture feel (emoji "feel" may be kept).
- [ ] 58 Poor stage reward/unlock UI should also be shabby, colour-consistent.
- [ ] 59 Screen-edge class decoration is bad — want strongly shaped ornamental frame borders (lace/filigree box frames).
- [ ] 60 Health → 5 hearts.
- [ ] 61 Black-market project UI: write the textual details out (describe it in words).
- [ ] 62 More animation/images across the UI for feedback.

## 第八轮补充反馈（2026-09-24 同日第二条；items 63–84，追加）
Note: v11 phases 1–3 (commits 744fddf, 1c5cf17, 04cc10f) already did 51/52/53/59 partially + 5 hearts; user now says **health back to 3**.
- [ ] 63 **Health → 3 hearts** (overrides item 60).
- [ ] 64 Luxury **LV** UI (trophy cabinet) unlocks **much later** (not at the start).
- [ ] 65 Hospital: **price doubles on every use** (per run); hospital UI with rich descriptive text (reception, doctor lines, ward description) — not only simple tiles.
- [ ] 66 Project **min/max stake written on the card**, not hidden in details. Low-tier projects: smaller swing + low cap; high-tier clearly different; a **high-tier project zone**.
- [ ] 67 Different project types may use different visual styles.
- [ ] 68 More map-specific projects, regions, **more zones**, more types → richer play.
- [ ] 69 Building/estate assets give **LV points**.
- [ ] 70 Cities differ much more strongly (style, rules, features) so travelling is desirable.
- [ ] 71 **Class up AND class down**: popups that must be clicked, immersive text.
- [ ] 72 More partners with distinct features; some let the player **choose how much to invest**; some special partners / special events.
- [ ] 73 **Shops**: redesigned clear goods grid **without scrolling**; categories; random refresh each visit; **small shop vs big shop**; a **shop district** zone.
- [ ] 74 Money gain/loss feedback scaled by amount + a **hidden combo system** (only intensifies feedback; never shown as UI).
- [ ] 75 More feedback everywhere (animations, images).
- [ ] 76 Poor-stage unlock/reward UI shabby & colour-consistent (= 58).
- [ ] 77 Opening animation master-level trailer (= 54); residual Chinese in English mode incl. 3D scene (= 55).
- [ ] 78 **CrazyGames ads SDK** (v3): rewarded ad in a prominent spot in the rest phase → **watch ad to skip rest**; plus roadside **ad locations** blended into the environment as a project (e.g. billboard sponsor stop → rewarded ad for a bonus). Must degrade gracefully offline / outside CrazyGames (no SDK → hide or fallback).
- [ ] 79 Buttons: generated images (not emoji), big image+text buttons, panoramic backgrounds.

## Round 8 progress log (appended 2026-09-24, next session)
- v11 phases 1–3 + v12 phase 1 (c8c34a8) cover: 51, 52, 53, 59, 63 (3 hearts), 64, 65, 56/71 (class up popup + fall text), 66 (min/max on cards, zones), 72, 73, 74, 78 (CrazyGames SDK rewarded: rest skip + sponsor billboard; `?adtest=1` demo).
- Still open at session start: 54/77 master intro trailer, 55 residual Chinese (esp. English mode 3D/canvas), 57/79 generated-image big buttons, 58/76 shabby poor-stage unlock UI, 61 black-market details in words, 62/75 more animation feedback, 67 per-type styles, 68 more zones, 69 estates → LV, 70 stronger city identity.
- Workflow reminder: re-clone to /tmp/game each session; `npm ci && npx playwright install --with-deps chromium`; `npm run checkpoint` then commit+push after every small group.

## Round 8 — session 3 (2026-09-24): user re-sent the full round-8 feedback (same items 51–79)
- Treat the message as confirmation of items 51–79; v12.1 (5751fe3) and v12.2 (80fa149) had already done 58 (shabby cardboard promo popup), 61 (black market/casino descriptive text), 65 (wide hospital) and part of 70 (per-city buildings/palettes).
- This session's focus (still open): 54/77 master-level intro trailer, 55 residual Chinese (English mode, incl. 3D scene), 57/79 generated-image big buttons, 62/75 more animated feedback, 67 per-type project styles, 68 more zones/regions/types, 69 estates → LV points, 70 stronger city identity.

---
# 第九轮用户反馈 / Round 9 feedback (2026-09-24, "最后一次改动，准备发布 HTML"; items 85–104, append-only)
Standing constraints unchanged (see top). Work clone in /tmp/repo (NOT /home/user). Checkpoint → commit → push after each small group.
- [ ] 85 BUG: every time the player moves, ALL surrounding characters move along with them (NPCs must stay put in the world / walk independently).
- [ ] 86 Balance: decline-risk reduction, energy etc. are the MOST valuable goods (tied to run length) → each purchase DOUBLES price, restores less. Icons + descriptions must change with tier (no mismatch).
- [ ] 87 Shop district also sells MECHANISM UNLOCKS (items that unlock mechanics). Icons/descriptions match.
- [ ] 88 Hospital price doubles each use (verify/keep).
- [ ] 89 Repeated district/regional events — must not repeat (dedupe per run).
- [ ] 90 Story (dialogue) UI: text colour too close to background → high contrast redesign.
- [ ] 91 CrazyGames ads: rewarded ad in a PROMINENT spot in rest phase (skip rest) + roadside ad spots blended into the environment (billboard/sponsor walk banner as a project/location). Hide gracefully outside CrazyGames.
- [ ] 92 Residual Chinese in English mode — keep hunting.
- [ ] 93 Feedback scales with amount: small amounts → subtle feedback; big amounts → big feedback.
- [ ] 94 Improve late-game experience.
- [ ] 95 Opening CG: use game-style 3D-model little-people images, NOT photoreal humans.
- [ ] 96 First-run: simplest tutorial + goal guidance.
- [ ] 97 Visual polish pass (match audience taste).
- [ ] 98 Each run should feel different (run modifiers / random start).
- [ ] 99 Mobile gets stuck on loading → load much faster (36 MB single HTML was the cause).
### Round 9 loading architecture (item 99)
- Music is NO LONGER inlined in index.html. `build.mjs` writes `music-pack/<id>.js` (base64 wrapped as a script) and `src/music.js` injects a `<script src="music-pack/<id>.js">` on demand (works on file:// and on GitHub Pages / CrazyGames). If the folder is missing the game still runs silently.
- So the playable download = `index.html` + `music-pack/` folder (downloading the repo zip gives both). index.html alone still plays (no music).

---
# 第十轮用户反馈 / Round 10 feedback (2026-09-24, append-only; items 105–112)
Standing constraints unchanged (see top). Work clone in /tmp/repo (NOT /home/user). Checkpoint → commit → push after each small group.
- [ ] 105 Decline-rate reduction and health goods must be MUCH more expensive (they extend run length).
- [ ] 106 Hospital treatment = pay money for a CHANCE of success (show odds; failure still costs).
- [ ] 107 LV (luxury) goods also escalate in price per purchase; LV/luxury goods must NOT appear early — only after the LV mechanism is unlocked.
- [ ] 108 Cheap corner-shop decline reducers should change decline by only ~0.0x (tiny) amounts.
- [ ] 109 Add more partners related to health / decline rate, probabilistic outcomes.
- [ ] 110 Two 15 s fast-cut promo videos in repo root: 1920x1080 and 1080x1920, with effects, showing mechanics/thrills.
- [ ] 111 CrazyGames submission texts (English): title, short/long description, controls, tags, category etc. → CRAZYGAMES-LISTING.md.
- Note: don't commit large video files over ~20 MB; keep workspace under 128 MB.
