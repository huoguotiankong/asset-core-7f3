# Pornhub CHANGELOG

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 基线
- 全新程序，无历史 Stable；首版只进入 Test。
- 参考附件 `𝐏𝐨𝐫𝐧𝐡𝐮𝐛.hk小程序.zip` 仅含 Apollo 远程壳，未复用其远程运行依赖或业务代码。
- 正式运行源固定为 `huoguotiankong/asset-core-7f3@main`。

### 产品结构
- 首页：品牌、搜索、分类、创作者、登录/账号、公开视频、GIF、Shorts、本地收藏、浏览历史、Playlists、设置。
- 分类：优先读取 `/webmasters/categories`，失败后回退 `/categories` HTML 动态提取。
- 搜索：`/video/search?search=`，支持 `o=mr/mv/tr` 排序、`p=professional/homemade`、duration_min/max；HTML 解析失败时可尝试 Webmaster JSON 搜索。
- 创作者：Pornstars / Channels / Models / 用户搜索；统一 Profile 页面展示公开信息和视频。
- 视频详情：标题、封面、时长、观看数、简介、创作者、分类、标签、相关推荐。
- GIF / Shorts / Playlists：首版建立原生入口；GIF/Shorts 使用海阔媒体提取交付，Playlists 暂保留原站打开。

### 播放链
- 详情页从页面脚本 `mediaDefinitions` 数组中只读取 HLS `videoUrl`。
- 单一 HLS 使用直链 + Referer/User-Agent 交给海阔播放器。
- 多画质使用 `urls/names/headers` PlayModel，按画质从高到低排序。
- 无结构化 HLS 时降级为 `video://<detail-url>`，不伪造直链。
- 当前未做任何付费/权限绕过；页面授权状态由原站负责。

### 登录 / 账号
- 不保存密码。
- 登录使用 `x5_webview_single` 加载官方 `/login`；用户完成验证码/二次验证后调用 `getCookie(base)` 同步浏览器 Cookie 到本程序会话。
- 本程序显式保存 Cookie 和账号用户名；自动识别失败时允许手动填写用户名。
- 登录后原生读取：`/recommended`、`/feeds?section=videos`、`/users/<name>/videos/recent`、`/users/<name>/videos/favorites`、`/users/<name>/subscriptions`。
- 点赞、评论、订阅增删等写操作 Test1 不伪造接口，先通过原站详情网页完成，后续根据实机网络事实逐项原生化。

### 缓存 / 隐私
- HTML 私有缓存单条限制 <280KB，避免大 HTML 触发海阔私有存储 1MB 上限事故。
- 本地收藏/历史最多 80 项，写入失败自动降到 30 项。
- 本地收藏与 Pornhub 账号收藏明确隔离。
- 退出本小程序账号会话只停用本程序保存的 Cookie，不删除官方网页 Cookie。

### 外部协议研究事实
- 2026-08-23 复核当前开源 `EchterAlsFake/unofficial-api-for-pornhub`：登录链仍使用首页 token + `POST /front/authenticate`；账号读取路径包括 recommended/history/favorites/feed/subscriptions；搜索过滤参数包括 `o=mr/mv/tr`、`p=professional/homemade`、duration_min/max；视频页媒体来自 `mediaDefinitions` HLS。
- Test1 没有直接实现账号密码 POST，原因是官方登录可能存在验证码/二次验证；优先以官方网页完成身份验证，再同步 Cookie。

### 实机待验收
- 首次打开是否能抓到 `/video` 列表和封面。
- `/webmasters/categories` 在用户网络是否仍返回 JSON。
- 搜索四种排序、制作类型、时长组合。
- 详情 `mediaDefinitions` 是否能得到真实 HLS，多画质播放器 Header 是否正确。
- GIF / Shorts 当前入口路径及 DOM 是否与实机站点一致。
- 官方网页登录完成后 `getCookie()` 是否能完整同步登录态，推荐/Feed/历史/收藏/订阅是否正常。
- UI 需根据真实手机截图继续微调，未完成实机验证前禁止晋级 Stable。
