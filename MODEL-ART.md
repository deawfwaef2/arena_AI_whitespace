# 画面、材质与地理素材

- 街景、人物、资产及休息空间：沿用用户提供的 3.1 工程中的 Three.js 程序化模型，并调整场景占位与镜头。
- 本地项目、门廊、桥梁、水岸、公园与小巷：`src/local-models.js` 的手工程序化几何。96 个项目内容按模型家族复用，不是 96 套独立完整建筑。
- 周边街区：`src/world.js` 程序化构建，连续保留道路和相邻街块。转角动画改变人物世界坐标，镜头另行同步转动；项目旋转后招牌按父级变换修正朝向。
- 城市全景：六张独立 AI 生成的城市插画，转为 WebP。不是实景照片或导航数据。
- UI 材质：`ivory-texture.webp`、`luxury-texture.webp`，本项目通过图像生成工具生成、缩至 768px 并转 WebP。财富展示开关关闭时不使用；不是现实品牌纹样。
- 图像来源说明和 SHA-256：`assets/art/ART-PROVENANCE.json`。
- 飞行与人生结算动画：SVG / CSS。
- 世界地图陆地轮廓：Natural Earth ne_110m_land，公共领域。来源 https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson ，条款 https://www.naturalearthdata.com/about/terms-of-use/ 。
- Three.js 和 Space Grotesk 的原始许可在 `assets/`，并嵌入成品 HTML。音乐来源单列在 `assets/music/MUSIC-LICENSES.md`。
