# XVideos CHANGELOG

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
