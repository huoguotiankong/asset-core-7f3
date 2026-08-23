# Pornhub CHANGELOG

## 0.1.0-test.2 / Build 10102 — 2026-08-23

### 首轮实机结论
- Test1 已在用户设备确认：首页真实视频与封面可加载；视频详情可解析；测试样例能得到 4 个 HLS 画质并正常播放；创作者页面能列出公开视频；官方 Pornhub 登录页可以加载。
- 本轮不改已验证的基础公开解析协议，采用 Test1 immutable Core/Runtime + Test2 Patch 的增量结构。

### 首页 / UI
- 删除 Test1 过高的 `pic_1_full` 品牌 Banner；实机截图显示该组件占据首屏大量高度并出现视觉上过大的装饰圆形。
- 首页改为紧凑 `movie_1_left_pic` 品牌卡，保留搜索 / 分类 / 创作者 / 登录四个主入口和排序栏，让真实内容更早进入首屏。
- 详情页只保留播放作为 Primary Action；Test1 的“加入本地收藏”“原站详情/评论/互动”不再和播放同层。
- 原站评论/互动下沉到详情最底部“更多操作”；系统标题栏已有收藏能力时，不再让自定义收藏污染播放页首屏。

### 播放性能
- Test1 详情已完成一次视频页请求并解析 `mediaDefinitions`，但点击播放时 `resolvePlay()` 又 `force:true` 重请求同一详情，造成可感知等待。
- Test2 新增 4 分钟轻量 PlaySource cache：详情解析到 HLS 后只缓存 `url/name/quality`；点击播放优先直接消费已解析结果。
- 即使 PlaySource cache 未命中，也优先复用 `fetchText()` 的 2 分钟详情缓存，不再默认强制二次网络请求；只有无缓存时才重新取页。
- 多画质 PlayModel 与 Referer/User-Agent 合同保持 Test1 不变，避免“优化速度”同时改变已实机可播行为。

### 创作者
- 增强 Profile 名称解析：`og:title` → `<h1>` / profile username → URL slug，避免页面显示通用 `Creator`。
- 增强头像解析：优先匹配 `profileAvatar/userAvatar/avatar/profilePic/profileImage/userImage/thumbImage` 等头像节点；详情页作者卡也从附近 DOM 恢复头像。
- Profile 页面从宽图 `movie_1_left_pic` 改为真正的 `avatar` Hero；原站 URL 不再占据页面顶部，移动到页面底部。
- 列表和详情进入创作者页时把已知名称/头像作为 seed 传递；目标页解析失败时可恢复真实实体信息。
- 过滤 `Play All / Watch All / All Videos` 这类误入视频列表的控制项，避免创作者页底部出现伪视频卡。

### 登录
- Test1 的 `x5_webview_single + screen-300` 在实机上把官方登录框压缩在小程序内容中，Google/X/邮箱入口操作空间不足。
- Test2 移除默认内嵌登录框，改为三步：①打开完整 Pornhub 官方登录页；②登录成功后返回小程序；③点击“同步登录状态”。
- 仍只通过 `getCookie(base)` 同步官方网页 Cookie，不保存账号密码，不自行模拟验证码或二次验证。
- “手动填写用户名”只在 Cookie 已同步但自动识别用户名失败时显示，降低普通登录流程干扰。

### 回归门禁
- `core_patch.js` / `ui_patch.js` 已通过 `node --check`。
- 离线 smoke test 已验证：Test2 Patch 可在 Test1 对象上加载；详情 HLS 可写入/读取播放缓存；播放直接消费缓存；`Play All` 被过滤；Profile 名称/头像恢复；首页首项为紧凑品牌卡。
- Test2 仍只进入 Test；首页实际比例、播放点击延迟、创作者真实头像命中率、网页登录后的 Cookie 同步仍需下一轮实机截图/结果确认。

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
