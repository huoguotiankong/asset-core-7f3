# 91porna CHANGELOG

## 当前基线

- 当前通道：Test，仅测试版，无 Stable。
- 当前版本：`0.1.0-test.2` / Build `10102`。
- Shell：`apps/video/91porna/91porna_remote_test_v2_b10102.txt`。
- Bootstrap：`apps/video/91porna/bootstrap_test_v2_b10102.js`。
- Release：`apps/video/91porna/releases/0.1.0-test.2/release.json`。
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`。

## 2026-09-26 · 0.1.0-test.2

### 实机问题与根因

- Test1 实机确认：视频列表和合集封面大面积失败；详情页错误抓到导航图片；分区标题出现 `““””` 脏字符；缺封面时仍使用大图卡导致整页默认占位图，整体 UI 观感差。
- Test1 的云口令可以正常作为远程 Shell，但后续临时 Test2 曾错误尝试把完整业务代码内联到导入口令。该做法会让口令异常冗长，并把业务文案/协议字段直接暴露给海阔导入违禁词扫描，已废弃。

### Test2 修复

- 恢复标准自用远程架构：短 Shell → GitHub `main` Bootstrap → versioned Release → `require(..., build)` 本地缓存。业务代码不再内联进云口令。
- 图片解析扩展到 `src/data-src/data-original/data-lazy/srcset/data-bg/background-image/poster` 等常见字段。
- 新增非业务图片过滤：`menu/logo/icon/avatar/loading/placeholder/nav/banner` 等不再作为封面。
- 详情与合集详情优先读取 `og:image/twitter:image`，再回退正文图片。
- 图片输出恢复 UA/Referer Header；无真实封面时降级纯文本卡片，不再强制显示大面积占位图。
- 分区标题改为原生简洁文本，去掉 Test1 的脏引号；首页快捷入口与合集页重新整理。
- 合集收藏使用 v2 独立状态 Key，避免 Test1 缓存污染。

### 待实机验证

- 首页/当前最热/最近更新真实封面是否恢复。
- 精选合集封面、数量、字母筛选及合集详情封面。
- 详情页是否不再抓到导航图。
- 播放仍沿用结构化直链优先 + `video://` 兜底，后续继续单独优化。

## 2026-09-26 · 0.1.0-test.1

### 产品/UI

- 新建原生海阔小程序，不使用 WebView 承担主列表 UI。
- 首页提供分类、合集、我的合集、搜索四个核心入口。
- 分类中心按 2026-09-26 当前源站侧栏收录核心分组及子分类：91视频、91短视频、黑料吃瓜、AI成人、日本AV、91动漫、精选合集、色情小说。
- 广告、博彩、外部推广和“更多好站”不纳入业务分类。
- 精选合集按用户实机截图采用双列横图语义，展示合集名称与视频数量；字母筛选优先从 `/moviesets` HTML 动态提取，失败时仅使用兼容 fallback。
- 新增合集本地收藏：收藏内容为合集 URL、标题、封面、数量和收藏时间；“我的合集”独立展示。

### Provider / Parser

- 默认源站：`https://91porna.com`，用户当前明确指定该域名。
- 视频主列表：`/comic/index/video?category=...`。
- 视频搜索：`/comic/index/search?keyword=...`。
- 视频详情主键：`/comic/index/detail?video_key=<id>`。
- 短视频分类使用当前源站 `/melonshort/cat/<slug>` 路径。
- 黑料分类使用当前源站 `/黑料吃瓜/<分类>/<排序>` 路径。
- 日本AV分类使用当前源站 `/comic/av/relvideo?...` 路径。
- 精选合集：`/moviesets` 与 `/moviesets/<slug>`。
- 小说分类：`/novels/<slug>/new`。
- 列表优先解析当前页中的视频详情锚点；黑料/小说等异构模板使用保守通用解析，等待海阔实机截图继续定点适配。

### 播放

- 详情页优先从 HTML/脚本提取 `.m3u8/.mp4` 媒体字段。
- 单线路保持直接 URL；多线路按 `urls/names/headers` 一一对应输出。
- 未解析到直链时暂用 `video://<详情页>` 作为 Test 兜底；是否适配当前源站必须以实机播放结果确认。
- 不把收藏、源网页等详情动作加入播放器 `playlist` class。

### 缓存/状态

- 合集收藏 Key：`p91_collection_favorites_v1`。
- 合集字母筛选当前 URL：页内 `p91_sets_url_v1`。
- last-good 源站 Key：`p91_last_good_base_v1`；Test1 仅在有效页面响应后写入当前 origin，不主动全量探活轮换域名。

### 已知待验证

- `/moviesets` 当前 HTML 无公开搜索缓存，合集 DOM 选择器依据用户截图与通用锚点结构实现，必须实机确认封面、数量、字母筛选与详情视频解析。
- 黑料吃瓜、小说、短视频使用不同模板，Test1 先保证所有分类入口真实存在；原生列表适配精度需逐页实机复核。
- 播放直链字段和 `video://` 兜底必须实机确认。
- UI 大改未完成实机截图闭环，因此禁止晋级 Stable。
