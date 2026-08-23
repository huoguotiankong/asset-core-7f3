# XVideos CHANGELOG

## 0.1.0-test.3 / Build 10103 — 2026-08-23

### 第二轮实机结论
- 用户实机确认 Test2 已恢复首页视频与视频搜索，说明 `frame-block + video.* token` 解析链有效。
- 分类页虽然能恢复约 350 个官网标签，但平铺过长，且 `China / Japan` 等地区入口被误当成演员；创作者详情能恢复资料统计，但 `/videos/best/<page>` 视频载荷没有正确解析。
- 视频详情可恢复标题、封面、上传者、评论数量和媒体源，但页面信息层级偏素；进入原生播放器后，详情页的收藏/评论/官网等动作被带入播放器列表上下文。
- 多画质已经能解析，但返回顺序没有保证最高分辨率在第一项，因此播放器默认画质不稳定。

### 搜索产品化
- 首页“搜索”入口不再使用 `input://` 弹窗，统一进入独立搜索中心。
- 搜索中心保留排序、日期、时长、720P+/1080P+ 组合筛选。
- 新增独立 `xv_search_history_v3` 搜索历史，最多 20 条；再次搜索同词自动去重并置顶。
- 搜索页增加历史词快捷入口和“一键清空搜索历史”。

### 分类重构
- `/tags` 仍以官网真实标签为事实源，不制造本地虚构分类。
- 标签文本清理尾部数量，例如 `3d-animation 13,935` 规范为 `3d-animation`。
- 页面改为：分类搜索 → 热门分类 → A-Z / # / 全部标签分组，避免一次平铺 350 项。
- 热门分类只从官网当前实际存在的标签中取交集。

### 创作者 / 演员 / 频道
- 新增统一 Creator Path Adapter：兼容 `/channels/<slug>`、`/profiles/<slug>`、`/pornstars/<slug>` 以及当前实机出现的根级创作者 URL（如 `/<opaque-slug>`）。
- `China / Japan` 等地区入口单独进入“地区入口”，不再伪装成演员实体。
- 创作者卡要求真实图片 + 创作者上下文，减少导航链接误识别。
- 详情页 `li.model` 按当前官网结构单独恢复出演者。
- 上传者名称清理尾部订阅数字，订阅量独立展示。

### 创作者主页视频恢复
- 参考当前维护解析实现确认：创作者主页视频链为 `<creator>/videos/best/<page>`，该端点可能返回 AJAX/JSON 载荷而不是普通详情 HTML。
- 新增 profile payload 解析器：兼容 JSON 内嵌 HTML、数组/对象视频实体和普通 `frame-block` HTML。
- 请求显式携带 `X-Requested-With: XMLHttpRequest` 与 `Accept: application/json, text/plain, */*`。
- 创作者主页增加视频/浏览/订阅/播放统计图标，并直接展示真实账号视频。

### 二级详情 UI
- Hero 下方将 Primary Play 单独做 `text_center_1`，后面立即加入 divider。
- 时长、观看、点赞、评论改为 4 个图标统计入口。
- 上传者使用头像卡；出演者、简介、标签、相关推荐分层展示。
- 本地收藏 / 评论 / 官网 / 上传者四个可交互动作下沉到详情末尾，避免紧贴播放项污染原生播放器上下文。
- 新增 `views.svg / videos.svg / globe.svg` 视觉资源。

### Playback
- 详情阶段已经拿到 `x.sources` 时，点击播放不再重新请求同一详情页；只加载 Runtime 后对已知源展开 HLS master。
- HLS variant 与 MP4 源统一按 2160/1440/1080/720/480/360/240 分辨率评分降序排列，返回数组第一项固定为最高可识别画质。
- HLS master 已成功展开 variant 时不再额外塞一个重复“自动 HLS”项，减少播放器源列表噪音。
- 继续携带 Referer / User-Agent；无结构化源时保留 `video://详情页` 媒体提取回退。
- 按 `INCIDENT_MEDIA_HANDOFF_VS_URL_REWRITE_20260823.md` 将 Primary Play 与次操作隔离，目标是消除播放器列表中的收藏/评论/官网等无关项；最终仍以本轮实机截图为准。

### Shell / Route
- Test3 将十多个固定二级 `pages[]` 收敛为单一 `xvideosRoute` 通用页。
- `C.page(path, params)` 统一编码 `view=<path>`，`R.route()` 再分发到搜索/分类/详情/评论/创作者/账号/设置等 Runtime 页面。
- 该方案目前只作为 XVideos Test3 的程序内实现，待实机证明稳定后再考虑沉淀为跨程序规范。

### Test3 实机回归重点
1. 首页搜索按钮是否直接进入独立搜索页，历史能否记录/清空。
2. 分类是否变成热门 + A-Z，而不是 350 项混排。
3. 演员页是否不再把 China/Japan 当演员，并能恢复更多真实实体。
4. Aivideomaker / ModelMedia 等创作者主页是否恢复视频列表。
5. 详情页图标、布局和上传者/出演者是否正常。
6. 播放器默认是否直接选择最高画质。
7. 原生播放器“列表”里是否已不再混入收藏/评论/官网等详情动作。

---

## 0.1.0-test.2 / Build 10102 — 2026-08-23

### 首轮实机修复：官网可访问但首页 0 视频
- 用户实机截图确认：同一台手机浏览器可正常打开 XVideos 官网并看到视频流，但 Test1 首页显示“首页暂未解析到视频”，最终请求地址为 `https://www.xvideos.com/?k=&sort=relevance`。
- 因此排除“用户网络无法访问官网”这一假设，问题收敛到小程序 HTML 视频卡识别层。

### 根因
- Test1 的 `isVideoLink()` 把视频 URL 识别写得过严，偏向 `/video123...` 这类数字 ID。
- 当前 XVideos 大量视频链接使用 `video.<opaque token>/...` 形式，token 可能包含字母和数字；官网现行解析实现也是从 `div.frame-block` 中直接取 href，并不假设 ID 必须为数字。
- 请求成功但所有真实视频 href 被过滤，最终 `parseVideoCards()` 返回 0 条。

### Test2 修复
- 新增不可变 `core_patch.js`，不覆盖 Test1：
  - `isVideoLink()` 改为兼容当前 `video.* / video-*/ video_* / video123*` 字母数字 token。
  - 明确排除 `/videos-i-like` 等账号列表路径，避免误判。
  - `parseVideoCards()` 改为 `div.frame-block` 优先分块解析，每个 block 独立恢复视频 href、标题、封面、时长、观看量、`data-pvv` 和 `data-videoid`。
  - frame-block 不存在时再回退宽松 anchor 解析。
- 新增 `runtime_patch.js` 将运行版本提升到 Test2 / Build10102。
- Release → Bootstrap → Shell 全部使用新 Build10102，不在旧 URL 上覆盖缓存。

### 实机下一步
- 先只验证首页是否出现真实视频卡；若恢复，再继续测试搜索、分类、详情和播放。
- 如果仍为 0 视频，下一版不再猜 DOM，将直接加入“响应诊断”显示 HTML 长度、frame-block 数量、video href 样例和响应标题，按实机返回体继续修。

---

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 新程序：Clean Rewrite
- 按用户要求新建独立 XVideos 小程序，不从旧程序迁移业务代码；UI 与 Pornhub 独立设计，采用紧凑红黑信息架构。
- 默认自用远程版，正式源固定 `asset-core-7f3@main`；当前仅发布 Test，不建立/覆盖 Stable。
- 程序状态 key 使用 `xv_*` 命名空间，与 Pornhub/其它站点隔离。

### 当前已确认的 XVideos 现行协议事实
- 2026-08 仍维护的公开解析实现确认搜索使用：`k / sort / datef / durf / quality`；支持 relevance/uploaddate/rating/length/views/random、日期区间、时长区间和 HD/1080P 筛选。
- 视频列表实体以 `div.frame-block` 为主要卡片容器；图片可含 `data-videoid / data-pvv`，正文区域含 `thumb-under / duration / metadata`。
- 详情页可从 `application/ld+json` 恢复 title/description/thumbnail/uploadDate/contentUrl；HLS 入口为 `html5player.setVideoHLS('...')`。
- 账号 Cookie 模式可访问 `/history/<page>`、`/videos-i-like/<page>`、`/watch-later/<page>`；账号功能因此采用 X5 官方登录 + Cookie 同步，不保存密码。
- Channel/Pornstar 主页存在 `/videos/best/<page>` 视频列表以及 profile/about 数据。

### Product / UI
- 首页采用 3 组小图标 Workspace，而不是 Pornhub 的橙色方案；第一层为搜索/分类/演员/频道，第二层为最佳/最新/高分/账号，第三层为站内喜欢/稍后看/历史/本地收藏。
- 首页直接展示视频 Feed；账号已同步时请求携带 Cookie，未登录时使用公开精选。
- 搜索页采用可换行 `flex_button`，避免横向筛选溢出和尾部 `>`。
- 详情页使用 Hero + 播放/收藏/评论/官网互动 + 上传者/出演者/简介/标签/相关推荐分层。

### Playback
- 支持 `setVideoHLS / setVideoUrl1080p / setVideoUrlHigh / setVideoUrlLow / LD+JSON contentUrl` 多源恢复。
- HLS master 会解析 `#EXT-X-STREAM-INF` 和 `RESOLUTION`，输出原生多清晰度 JSON；直链附带 Referer/User-Agent。
- 取不到直链时回退 `video://<detail-url>`，保留网页媒体提取兜底。

### Account / Local
- X5 官网登录后通过 `getCookie(base)` 同步会话；Cookie 仅保存在本小程序私有状态。
- 站内账号页：账号首页、喜欢、Watch Later、History。
- 本地收藏和本地详情足迹独立于 XVideos 账号，最多保存 100 项并限制持久化体积。

### 评论与收藏夹边界
- 当前公开解析项目确认详情存在 `comment_count`，但未提供稳定评论列表接口；Test1 只从真实 comment DOM 恢复评论，解析不到时明确显示“待实机适配”并提供官网入口，不伪造评论。
- 公开收藏夹只识别真实 `/favorite/<id>/...` 实体；如果官网当前页面未暴露，不制造假片单。

### Test1 实机验收
1. 首页是否能恢复 frame-block 视频卡、标题、封面、时长和观看量。
2. 搜索与四组筛选是否能返回正确结果。
3. `/tags` 分类、Pornstars/Channels/Profiles 是否能恢复实体。
4. 详情 LD+JSON、上传者/出演者、标签和相关推荐。
5. HLS/MP4 播放以及多画质选择。
6. X5 登录 Cookie 同步，以及喜欢/稍后看/历史。
7. 评论页是否命中真实 comment DOM；若为空，需用实机截图继续定向适配。

### 发布门禁
- `core.js / runtime.js / bootstrap` 均需 `node --check`。
- Shell JSON 必须可解析，全部页面固定 Build10101 Bootstrap。
- Test1 未经实机闭环不得晋级 Stable。

### 远端发布确认
- 已写入 `asset-core-7f3@main/apps/video/xvideos/`；远端 `core.js / runtime.js / Bootstrap / Shell` Git Blob SHA 与本地通过静态门禁的对应文件逐个一致，排除上传截断或转义损坏。
- `registry.json` 已登记 XVideos Test1 恢复链。
- 根 `manifest.json` 已加入 XVideos `channel-group` 卡片，revision=`202608231856`；`manifest_meta.json` 同步相同 revision，itemCount=`14`。
- `channels.json` 使用规则仓库标准 `channels[]` 合同，当前只暴露 Test1，不伪造 Stable。
- 云仓代码链已经闭环；页面数据、UI、图片、播放、Cookie 和评论仍必须以海阔实机结果为最终事实。
