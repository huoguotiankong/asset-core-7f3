# JavMenu Changelog

> 程序级长期技术记忆。开发前先读三份主文档与仓库迁移规范，再读本文件和当前元数据/Release/Shell/Bootstrap。只记录已验证事实；未实机确认的站点结构明确标记待确认。

## 当前基线

- 程序：JavMenu
- App ID：`javmenu`
- Stable：**尚未建立**。这是全新重构程序，不存在可继承的项目 Stable。
- 当前 Test：`0.1.0-test.2` / Build `10102` / Remote / 待实机验证。
- Test Shell：`apps/video/javmenu/javmenu_remote_test_v2_b10102.txt`
- Test Bootstrap：`apps/video/javmenu/bootstrap_test_v2_b10102.js`
- Test Release：`apps/video/javmenu/releases/0.1.0-test.2/release.json`
- 源站：`https://javmenu.com/zh`；请求失败时允许同路径回退 `https://javmenu.org`。
- Shared JAV Playback：Stable `1.0.0-test.4`，作为可选备用 Provider。
- 云端仓库：Test 通道通过根 `manifest.json` 暴露，Test2 使用 `apps/video/javmenu/channels_v2_b10102.json` 快照。

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
- Test1 `parseMovies()` 扫描整页所有 `<a>`，而不是当前站点真实 `.video-list-item` 容器，导致导航/水印/占位内容进入影片卡模型。
- Test1 人物识别把“链接文本包含 女优/演员”也视为人物，导致 `女优榜` 被制造成伪人物。
- Test1 详情人物/标签对整页 HTML 扫描，站点全局导航进入详情元数据。
- Test1 `R.list()` 只有影片模型，没有女优索引/人物页面模型。
- Test1 正式图标和部分备用 Provider 图标依赖外站 favicon/logo，违反项目长期 Icon Delivery 策略。

### 当前 JavMenu 结构事实
结合用户实机与当前公开 JavMenu Parser 交叉确认：

- 首页/普通分类的影片容器为 `.video-list-item`。
- 影片名称优先 `.card-title`，再回退 `img alt` / `a title`；列表备注可取 `.label` / `.text-muted` / `.badge`。
- 女优榜路径为 `/zh/rank/censored/actress`，该页必须解析 actor/actress card，而不是影片卡。
- 人物详情/关联演员以 `/actor/` 链接为真实人物信号；不再使用名称关键词猜人物。
- 当前常用分类路由：`/zh/censored/online?order=publish`、`/zh/uncensored/online`、`/zh/fc2/online`、`/zh/chinese/online`、`/zh/western/online`、`/zh/hanime/online`、日/周/月榜与女优榜。
- 站内播放继续以 `#player-tab [data-m3u8]`、video/source、JSON-LD `contentUrl` 为结构化来源；`preview/freepv/cc3001.dmm.co.jp/litevideo` 属于预览家族，不应混入完整线路。

### Test2 修复
- 新建不可变 Test2 Release/Bootstrap/Shell，build/cache key 全部升到 `10102`，不原地覆盖 Test1。
- 新增仓库自有 `assets/icon.svg`、`assets/missav.svg`、`assets/jable.svg`，全部为纯 path/shape SVG，不使用 `<text>`；云仓、规则壳、首页 Hero 和备用 Provider 改用 jsDelivr `@main` 版本化资源。
- `parseMovies()` 首选 `.video-list-item`，名称、备注、图片均在卡片局部读取；图片优先 `data-src/data-lazy-src/data-original/src`，过滤 loading/no_preview/watermark/logo/placeholder 等明显错误资产。
- 首页影片卡以**番号为主标题**、真实影片标题为副信息，避免页面装饰词再次占据主视觉。
- 发现页不再扫描全站链接；改为按当前已确认官网路由分三组：在线分类、排行榜、资源分类。
- 新增 `peopleIndex` 与 `person` 页面：女优榜先显示人物卡，点击人物再展示该人物 `.video-list-item` 作品。
- 详情人物只识别 `/actor/`；详情标签只保留 `genre/series/studio/maker/label/director/tag` 元数据路径，拒绝有码/无码/欧美等全站导航污染。
- 日期将 ISO 时间收敛为 `YYYY-MM-DD` 展示。
- Request Layer 增加 `.com → .org` 同路径有限回退；仍以 `.com` 为主。
- PlaybackAdapter 排除 `preview/freepv/cc3001/litevideo` 等预览媒体，保留原站结构化 HLS/MP4 优先和 `video://` 最终兜底。

### Test2 发布前验证
- `core.js` / `playback_adapter.js` / `runtime.js` / Bootstrap 已执行 `node --check`。
- Shell 完整规则前缀、JSON 和 `pages` JSON 已解析，规则数值版本 `2026082401`。
- Fixture 已覆盖并通过：`.video-list-item` 真实封面优先、watermark/占位图过滤、`女优榜` 不再被当演员、全站有码/无码/欧美不再进入详情标签、女优榜人物索引、preview/freepv 不进入正式播放线路。
- 仍需海阔实机验证：仓库/程序图标、首页真实封面、发现分类、女优榜人物卡、人物作品页、MIBB-084 真实演员/标签、站内播放与三备用 Provider 图标/播放。
- **Test2 未完成上述实机回归前不得建立 Stable。**

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
- 不回退 Test1 的整页 `<a>` 影片扫描。
- 不再通过“文本包含 女优/演员”制造人物实体；人物必须有 `/actor/` 等真实结构证据。
- 不把 JavDB/JavBus 的分类 URL、演员 URL、磁力接口冒充 JavMenu 协议。
- 不在没有登录协议事实前加入“JavMenu 账号登录”假功能。
- 外站 favicon/logo 不再作为 JavMenu 关键正式图标唯一来源。
- 不在 Test2 实机确认前建立 Stable。
