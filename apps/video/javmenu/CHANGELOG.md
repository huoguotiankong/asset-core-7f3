# JavMenu Changelog

> 程序级长期技术记忆。开发前先读三份主文档与仓库迁移规范，再读本文件和当前元数据/Release/Shell/Bootstrap。只记录已验证事实；未实机确认的站点结构明确标记待确认。

## 当前基线

- 程序：JavMenu
- App ID：`javmenu`
- Stable：**尚未建立**。这是全新重构程序，不存在可继承的项目 Stable。
- 当前 Test：`0.1.0-test.3` / Build `10103` / Remote / 待实机验证。
- Test Shell：`apps/video/javmenu/javmenu_remote_test_v3_b10103.txt`
- Test Bootstrap：`apps/video/javmenu/bootstrap_test_v3_b10103.js`
- Test Release：`apps/video/javmenu/releases/0.1.0-test.3/release.json`
- 源站：`https://javmenu.com/zh`；请求失败时允许同路径回退 `https://javmenu.org`。
- Shared JAV Playback：Stable `1.0.0-test.4`，作为可选备用 Provider。
- 云端仓库：Test 通道通过根 `manifest.json` 暴露，Test3 使用 `apps/video/javmenu/channels_v3_b10103.json` 快照。

## 0.1.0-test.3 · 2026-08-24

### Test2 实机回归事实
- 用户覆盖安装 Test2 / Build10102 后，规则图标已经正常显示，说明仓库自有 Icon Delivery 修复有效。
- 但首页直接显示“本页没有解析到影片 / 当前页面没有识别到 `.video-list-item`”。这证明 Test2 把影片入口**锁死到单一 `.video-list-item` 选择器**造成了比 Test1 更严重的功能回归。
- 该实机事实优先级高于外部近期 Parser 中仍使用 `.video-list-item` 的历史/环境证据：JavMenu 当前返回给海阔的 HTML 可能因域名、请求方式、UA、渲染阶段或站点更新而使用不同容器结构。

### Test3 恢复策略
- 冻结 Test2，不原地覆盖 Build10102。新建 Test3 / Build10103 / 新 Shell / 新 Bootstrap / 新 require cache key；业务实现采用**恢复型 Patch Release**：复用 Test2 已验证未退化的详情/播放模块，只替换列表 Parser 与列表页 Runtime。
- **不再以父容器 class 作为影片实体的必要条件。** 主键改为“站内真实详情链接 + 可解析番号”；导航、排行、演员、genre 等路径继续由 `isDetailHref()` 排除。
- 对同一详情 URL 在页面中的多个 `<a>` 进行合并：图片区、标题区、按钮区即使分成多个链接，也只形成一个影片实体。
- 封面不再取第一个 `<img>`：扫描同一实体内所有 `data-src / data-original / data-lazy-src / srcset / src / background-image` 候选并评分，主动排除 watermark / logo / loading / placeholder / icon / avatar / banner 等资产。
- 标题从 anchor title、所有图片 alt/title、title/name 类节点和短文本多候选择优；番号始终由详情 URL/文本标准化得到，不让脏标题影响实体身份。
- 若实体 Anchor 内没有封面，再在详情链接附近有限 HTML 窗口寻找图片；仍没有则允许无图卡，不制造假封面。
- `parseMovies` 每次记录 `movies / detailAnchors / videoListClass / images` 诊断，后续实机可直接判断“HTML 没影片链接”还是“影片链接存在但模型没形成”。
- Test2 已验证/已实现的仓库自有图标、固定分类路由、女优独立页面、详情 `/actor/` 人物过滤、元数据路径过滤、preview/freepv 正式播放隔离全部保留。

### Test3 发布前验证
- Parser Patch / List Runtime Patch / Bootstrap 全部通过 `node --check`。
- 新增的正则已对照 `INCIDENT_HIKER_REGEX_REPEAT_LIMIT_20260824.md` 检查，没有任何超过 Rhino 50000 上限的重复量词。
- Recovery Fixture：在**完全没有 `.video-list-item`** 的 HTML 中，同一 MIBB-084 第一个链接只有 watermark、第二个链接有真实 data-src/标题，Test3 能合并成 1 张卡并选择真实封面。
- Fixture 同时验证：导航/actor 链接不会成为影片；详情女优/标签过滤不退化；preview/freepv 不进入正式播放。
- Bootstrap smoke：`JavMenuBoot.loadOnly()` 可加载 Test3 恢复链并校验 Build10103。
- 发布时 `main` 多次发生并发提交；根 `manifest.json + manifest_meta.json` 最终基于最新 HEAD 重建并使用 Git tree commit 原子 fast-forward，未 force，未覆盖 18AV Test4 与其它并发变更。
- **仍需海阔实机确认：首页/搜索/分类是否恢复影片卡、真实封面是否正确、详情与播放是否继续正常；未闭环前不得建立 Stable。**

## 0.1.0-test.2 · 2026-08-24

### 首轮实机事实
用户在 Test1 / Build10101 实机确认以下问题，优先级高于 Test1 的未验证假设：

- 仓库卡片和已安装 JavMenu 规则图标均无法稳定显示；Test1 依赖 `https://javmenu.com/assets/images/logo.png` 外站热链。
- 首页影片卡出现巨大的 `JAV` / watermark 类错误图，副信息被 `watermark` 污染；详情页封面反而可正常显示。
- `MIBB-084` 详情的“演员 / 人物”错误显示 `女优榜`；“标签 / 系列 / 制作信息”错误显示 `有码 / 无码 / 欧美` 等全站导航。
- 发现页整页动态抽链导致 `有码 / 无码 / FC2 / 下载` 等大量重复入口，并把 `女优榜` 误当演员。
- `女优榜` 页面按普通影片列表解析，实机显示“当前分类没有解析到影片”。
- Shared Playback 中 MissAV 图标外链在实机为空；123AV 仓库资产可显示。

### 根因
- Test1 `parseMovies()` 扫描整页所有 `<a>`，而不是经过语义约束的影片实体集合，导致导航/水印/占位内容进入影片卡模型。
- Test1 人物识别把“链接文本包含 女优/演员”也视为人物，导致 `女优榜` 被制造成伪人物。
- Test1 详情人物/标签对整页 HTML 扫描，站点全局导航进入详情元数据。
- Test1 `R.list()` 只有影片模型，没有女优索引/人物页面模型。
- Test1 正式图标和部分备用 Provider 图标依赖外站 favicon/logo，违反项目长期 Icon Delivery 策略。

### 当前 JavMenu 结构事实
结合用户实机与当前公开 JavMenu Parser 交叉确认：

- 外部近期 Parser 曾使用 `.video-list-item`，但 Test2 实机证明海阔当前收到的页面**不能把该 class 当作必然存在**；影片实体必须以真实详情 href/番号为主证据，容器 class 只能作为可选优化。
- 影片名称可参考 `.card-title`、`img alt` / `a title`；列表备注可参考 `.label` / `.text-muted` / `.badge`，但这些都是候选字段，不作为实体成立的唯一条件。
- 女优榜路径为 `/zh/rank/censored/actress`，该页必须解析 actor/actress card，而不是影片卡。
- 人物详情/关联演员以 `/actor/` 链接为真实人物信号；不再使用名称关键词猜人物。
- 当前常用分类路由：`/zh/censored/online?order=publish`、`/zh/uncensored/online`、`/zh/fc2/online`、`/zh/chinese/online`、`/zh/western/online`、`/zh/hanime/online`、日/周/月榜与女优榜。
- 站内播放继续以 `#player-tab [data-m3u8]`、video/source、JSON-LD `contentUrl` 为结构化来源；`preview/freepv/cc3001.dmm.co.jp/litevideo` 属于预览家族，不应混入完整线路。

### Test2 修复
- 新建不可变 Test2 Release/Bootstrap/Shell，build/cache key 全部升到 `10102`，不原地覆盖 Test1。
- 新增仓库自有 `assets/icon.svg`、`assets/missav.svg`、`assets/jable.svg`，全部为纯 path/shape SVG，不使用 `<text>`；云仓、规则壳、首页 Hero 和备用 Provider 改用 jsDelivr `@main` 版本化资源。
- Test2 曾将 `parseMovies()` 锁定 `.video-list-item`；该实现已被 Test2 实机判定为回归并在 Test3 冻结，不得继续作为唯一入口。
- 首页影片卡以**番号为主标题**、真实影片标题为副信息，避免页面装饰词再次占据主视觉。
- 发现页不再扫描全站链接；改为按当前已确认官网路由分三组：在线分类、排行榜、资源分类。
- 新增 `peopleIndex` 与 `person` 页面：女优榜先显示人物卡，点击人物再展示该人物作品。
- 详情人物只识别 `/actor/`；详情标签只保留 `genre/series/studio/maker/label/director/tag` 元数据路径，拒绝有码/无码/欧美等全站导航污染。
- 日期将 ISO 时间收敛为 `YYYY-MM-DD` 展示。
- Request Layer 增加 `.com → .org` 同路径有限回退；仍以 `.com` 为主。
- PlaybackAdapter 排除 `preview/freepv/cc3001/litevideo` 等预览媒体，保留原站结构化 HLS/MP4 优先和 `video://` 最终兜底。

### Test2 发布前验证
- `core.js` / `playback_adapter.js` / `runtime.js` / Bootstrap 已执行 `node --check`。
- Shell 完整规则前缀、JSON 和 `pages` JSON 已解析，规则数值版本 `2026082401`。
- Fixture 曾在外部 `.video-list-item` 样本中通过，但随后被海阔真实页面证伪；这是“Fixture 通过不等于真实 DOM 合同成立”的实例。
- Test2 实机已经验证图标正常，但首页影片解析回归为 0；该版本已冻结，不得晋级 Stable，也不再作为后续列表 Parser 的事实基线。

## 0.1.0-test.1 · 2026-08-23

### 产品 / UI
- 从零设计海阔原生 UI：品牌/搜索 → 发现/收藏/历史/设置 → 最近更新 Feed。
- 详情按 Hero → Primary Play → 站内线路 → 元数据 → 人物/标签 → 预览图 → 磁力 → 备用播放 → 推荐 → 更多 的任务层级。
- 所有复杂二级页面使用 `hiker://page/javmenuPage?...&simple=true`，业务参数使用 `jm_*` 命名空间。

### Provider / Playback
- 首版使用 DOM/正则 + OG + JSON-LD 多层 Adapter，并以普通 HTML → WebView 源码 → `video://` 作为原站播放链。
- Shared JAV Playback Stable 提供 MissAV / 123AV / Jable 备用番号播放。
- 本地影片收藏：`hiker://files/rules/JavMenu/favorites_videos.json`；本地人物收藏：`hiker://files/rules/JavMenu/favorites_people.json`。

### 发布
- Test1 自有资产与 registry 已发布到 `asset-core-7f3@main`，随后加入根 `manifest.json` 云端安装中心。
- Test1 首轮实机证明“整页动态分类/人物/影片扫描”并不适合当前 JavMenu，相关方案在 Test2 起废弃，不得回退。

## 禁止回退 / 待确认
- 不回退 Test1 那种**无语义约束、首次命中即建卡**的整页 `<a>` 扫描；允许 Test3 以真实详情 href/番号为硬条件，对重复 Anchor 合并后再择优标题/封面。
- 不再把 `.video-list-item` 或其它单一 CSS class 当作影片实体必然存在的事实；未经当前海阔实机验证，只能作为可选候选结构。
- 不再通过“文本包含 女优/演员”制造人物实体；人物必须有 `/actor/` 等真实结构证据。
- 不把 JavDB/JavBus 的分类 URL、演员 URL、磁力接口冒充 JavMenu 协议。
- 不在没有登录协议事实前加入“JavMenu 账号登录”假功能。
- 外站 favicon/logo 不再作为 JavMenu 关键正式图标唯一来源。
- 不在 Test3 实机确认首页/搜索/分类、封面、详情和播放前建立 Stable。
