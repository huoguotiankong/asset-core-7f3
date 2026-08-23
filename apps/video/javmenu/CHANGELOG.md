# JavMenu Changelog

> 程序级长期技术记忆。开发前先读三份主文档与仓库迁移规范，再读本文件和当前元数据/Release/Shell/Bootstrap。只记录已验证事实；未实机确认的站点结构明确标记待确认。

## 当前基线

- 程序：JavMenu
- App ID：`javmenu`
- Stable：**尚未建立**。这是全新重构程序，不存在可继承的项目 Stable。
- 当前 Test：`0.1.0-test.1` / Build `10101` / Remote / 待实机验证。
- Test Shell：`apps/video/javmenu/javmenu_remote_test_v1_b10101.txt`
- Test Bootstrap：`apps/video/javmenu/bootstrap_test_v1_b10101.js`
- Test Release：`apps/video/javmenu/releases/0.1.0-test.1/release.json`
- 源站：`https://javmenu.com/zh`
- Shared JAV Playback：Stable `1.0.0-test.4`，作为可选备用 Provider。
- 云端仓库：已于 2026-08-23 将 Test1 登记到根 `manifest.json`，安装中心通过 `apps/video/javmenu/channels_v1_b10101.json` 暴露测试通道。

## 0.1.0-test.1 · 2026-08-23

### 产品 / UI
- 从零设计海阔原生 UI，不复刻 JavDB/JavBus 现有页面：首屏为品牌/搜索 → 发现/收藏/历史/设置 → 最近更新 Feed。
- 详情按 Hero → Primary Play → 站内线路 → 元数据 → 人物/标签 → 预览图 → 磁力（若原页存在）→ 备用播放 → 推荐 → 更多 的任务层级。
- 收藏/复制/原站等低频动作下沉到详情后部，不与 Primary Play 同权。
- 所有复杂二级页面统一走 `hiker://page/javmenuPage?...&simple=true`，业务参数使用 `jm_*` 命名空间。

### Provider / 页面解析
- 已确认外部近期脚本仍使用 JavMenu 详情直达 `https://javmenu.com/<番号>`，搜索 `https://javmenu.com/search?wd=<关键词>`。
- 已确认当前详情识别信号包含 `.code` / `.display-5 strong` / `h1`、canonical/OG，以及播放器 `#primary-player video[src]`、`#seo-main-video[src]`、`#player-tab .nav-link[data-m3u8]` 等。
- Test1 Core 使用 DOM/正则 + OG + JSON-LD 多层 Adapter；影片卡只在识别到真实番号和图片时建卡，禁止用裸 href 制造伪成功实体。
- 分类/人物索引不写死未经验证 URL：从当前页面动态识别 category/genre/tag/actor/star/series/maker/studio 等可用链接。
- **待实机确认：** 首页真实卡片 DOM、分类导航完整度、搜索结果 DOM、分页参数格式、人物链接路径。

### Playback
- 原站播放优先级：普通 HTML 结构化 HLS/MP4 → WebView 渲染后源码 → `video://` 原详情页媒体提取。
- 单线路返回直接媒体 URL；多条真实站内线路才返回 `urls/names/headers` PlayModel。
- 备用番号播放隔离调用 Shared JAV Playback Stable：MissAV / 123AV / Jable；备用失败不影响 JavMenu 原站链。
- **待实机确认：** JavMenu 当前 HLS Header/Origin 是否还需额外字段、播放器 Tab 是否对应版本还是画质、`video://` 最终兜底兼容性。

### 收藏 / 磁力 / 图片
- 本地影片收藏：`hiker://files/rules/JavMenu/favorites_videos.json`。
- 本地人物收藏：`hiker://files/rules/JavMenu/favorites_people.json`。
- 详情页若原 HTML 真实包含 `magnet:` 链接则展示；Test1 不伪造 JavMenu 自身不存在的磁力 API。
- 磁力长按仅在真实磁链存在时提供复制/已安装云盘小程序调用。
- 封面使用原站 Header 模型；预览图只收集真实图片链接。

### Runtime / 发布
- Bootstrap 使用 jsDelivr 明确 `@main` 的直接不可变模块路径 + Build10101 require 缓存键；Core / Playback / Runtime 都校验 version/build。
- lazyRule 关键播放/收藏动作重新进入当前 Bootstrap，再调用当前 Runtime，避免只 eval 基础 Core 导致点击动作退回旧实现。
- Test1 已在本地通过 `node --check`；Parser Fixture 已验证影片卡、详情、人物/标签、HLS/MP4、预览图、磁力标准模型。
- Bootstrap Runtime Smoke 已通过：`JavMenuBoot.loadOnly()` 可在同一作用域加载并校验 Core / Playback / Runtime；单真实线路返回直链媒体合同，多真实线路返回带 `urls/names/headers` 的 PlayModel。
- Test1 自有资产已以 fast-forward 提交发布到 `asset-core-7f3@main`；`registry.json` 已登记 JavMenu，保证后续按恢复链继续开发。
- 2026-08-23 23:46 按用户要求发布到“我的规则仓库”云端安装中心：根 `manifest.json` 新增 `javmenu` Test 条目，指向 `javmenu_remote_test_v1_b10101.txt` 和不可变频道快照 `channels_v1_b10101.json`；发布时检测到并发 18AV 云仓提交，已基于其最新 HEAD 合并，未覆盖 18AV 或其它程序。
- **尚未完成：海阔实机 Home / Search / Detail / Player / Favorite / Discover / Settings 回归，因此不得晋级 Stable。**

## 禁止回退 / 待确认
- 不把 JavDB/JavBus 的分类 URL、演员 URL、磁力接口直接冒充 JavMenu 协议。
- 不在没有登录协议事实前加入“JavMenu 账号登录”假功能。
- 不在 Test1 未实机确认前建立 Stable。
