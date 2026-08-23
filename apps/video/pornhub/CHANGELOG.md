# Pornhub CHANGELOG

## 0.1.0-test.5 / Build 10105 — 2026-08-23

### 第四轮实机结论
- Test4 详情页继续确认多画质播放基线正常：当前样例显示 `4 个 HLS 画质`，本轮不改 Test1/Test2 已验证的 HLS 解析/交付链。
- 用户点击 Test4“评论”后不是进入解析空态，而是 JSEngine 直接报 `TypeError: 找不到函数 comments。`；因此本次首先按 P0 Runtime 导出事故处理，而不是继续盲改评论 DOM。
- 根因已确认：Test1 Runtime 的 `R.module()` 返回固定方法白名单，Test4 后置 Patch 虽然新增 `R.comments / R.playlistDetail`，但这两个新方法没有进入旧白名单；Shell 中存在页面声明并不代表 `PornhubBoot.module()` 真正导出了对应函数。
- 用户实机详情页创作者 `Ruth Lee` 仍显示字母占位头像，说明视频详情 Author Adapter 只找到人物实体，没有稳定恢复该创作者的真实头像。
- Test4 原生分类页能同步约 `241` 个分类，但以大量英文 slug 平铺，和用户给出的 Pornhub 中文网页“异性恋/男同/女女 + 热门图片卡 + 所有色情片类型”产品结构差距明显。
- 首页“搜索”仍先弹输入对话框；用户明确要求改为独立搜索页面。

### Runtime 导出修复
- Test5 最终覆盖 `R.module=function(){return R;};`，使活动 Runtime 后续 Patch 新增的方法也能被 Shell 直接取得；`comments` 与同样受影响的 `playlistDetail` 一并恢复导出。
- 发布前新增 module smoke：完整 Runtime 加载后确认 `typeof module.comments / categories / searchPage === 'function'`，不再把“JS 文件里有函数”误当作“Shell 能调用函数”。
- 新增跨程序事故文档：`docs/INCIDENT_RUNTIME_MODULE_EXPORT_SNAPSHOT_20260823.md`；以后 Remote Runtime 新增页面必须检查 `Shell pages ↔ module actual exports` 一致性。

### 分类页重构 / 中文化
- 分类页改成官网式信息架构：顶部 `异性恋 / 男同 / 女女` 为同页状态切换，继续使用 `putMyVar → refreshPage(false)`，不会产生新的返回栈。
- 新增“热门色情片类型”：从 Pornhub 分类 HTML 恢复带图分类实体，以 `movie_2` 双列图片卡展示，视觉结构贴近用户提供的官网截图。
- 新增“所有色情片类型”：保留完整站点分类数据，但用户可见标签统一中文化，不再直接显示 `amateur-gay / big-tits-lesbian / behind-the-scenes` 等原始 slug。
- 中文分类名优先尝试从 `cn.pornhub.com/categories` 学习官方中文显示名并短缓存；当前网络/区域不可用时回退项目内置映射，并对 `-gay / -lesbian` 后缀做中文派生。
- 视频详情里的“分类 / 标签”也复用同一中文 Category Adapter，避免详情页继续出现一半英文、一半中文。

### 独立搜索页
- 首页搜索图标现在直接进入 `pornhubSearch`，不再先弹 `input://` 输入对话框。
- 搜索页内保留原生输入框，并增加 `视频 / 创作者` 同页范围切换。
- 视频搜索继续支持相关/最新/最多观看/最高评分、专业/自制、时长过滤；所有筛选继续同页刷新，不压栈。
- 创作者搜索在同一搜索 Workspace 中独立渲染人物卡。

### 详情创作者头像
- 重写视频页 `authorFrom` 候选评分：优先 `Video Underplayer / usernameBadgesWrapper / videoUploader / userInfo` 等视频上传者上下文，不再简单取整页第一个 profile anchor。
- 先在创作者锚点附近恢复头像；仍缺失时再请求该创作者个人页，经现有 `#getAvatar / topProfileHeader / profileAvatar` 链获取真实头像，并使用独立轻量缓存。
- 详情页仍保留最终占位兜底，但本轮目标是尽量显示真实人物头像；是否命中 Ruth Lee 需下一轮实机截图确认。

### 评论与操作栏
- Test5 评论入口已先修复 Runtime 导出，因此不再出现 Test4 的“找不到函数 comments”这一层错误。
- Comment Adapter 先解析初始详情 HTML；若无评论，再有限扫描页面真实 comment/AJAX 相关地址，并兼容 JSON 中 `html/content/comments/result/template` 包装后的 HTML；仍不实现发评论。
- 视频详情的 `评论 / 本地收藏 / 在线收藏` 改为海阔 `icon_small_3` 三栏动作，新增 `comment.svg / local.svg`，在线收藏继续复用 `favorite.svg`，解决 Test4 只有文字 chip 且末尾出现 `>` 的视觉问题。
- 创作者详情的在线订阅 / 本地收藏 / 官方主页也改为统一图标操作栏。

### 回归门禁
- Test5 `core_patch.js / ui_patch.js / Bootstrap` 已通过 `node --check`。
- Shell JSON 已验证可解析，仍包含 20 个页面声明，并包含 `pornhubComments / pornhubPlaylistDetail`。
- Runtime module smoke 已确认新增页面方法真实可导出。
- 分类中文映射 smoke：`mature → 熟女`、`asian-gay → 亚洲男同`，分组可识别 gay/lesbian/straight。
- Test4 的 X5 登录会话、账号私有缓存按 Cookie 指纹隔离、在线视频收藏/订阅合同保持不变；Test1/Test2 已实机验证的公开详情和多画质 HLS 播放链不做结构性修改。
- Test5 仍只进入 Test；评论真实数据、Ruth Lee 等创作者头像、官网式分类图片与中文标签、独立搜索页都需要用户实机继续验收。

## 0.1.0-test.4 / Build 10104 — 2026-08-23

### 第三轮实机结论
- Test3 已修掉“随机猜用户名”，创作者目录视觉也明显改善；但用户实机继续确认：小程序原生账号内容、尤其订阅，仍与 Pornhub 官方网页登录后的真实账号不一致。
- 这说明问题不只是用户名：网页登录容器、`getCookie()` 来源、私有请求 Cookie、私有缓存以及账号页 Parser 都必须作为一条完整 Session Contract 验证。
- 创作者页 Pornstars / 频道 / Models / 用户仍通过同功能 `hiker://page` 切换，实机确认不断压入返回栈；该问题此前已在跨程序事故文档明确禁止，本轮按发布阻断项修正。

### 账号会话重构
- Test2/Test3 的账号入口不再使用 `web://` 作为同步来源。Test4 统一改成 `x5://<login-url>` 全屏官方登录，使网页登录与 `getCookie(base)` 处于同一 X5 会话语义。
- 原生私有请求不再只依赖一次保存的旧 Cookie，优先读取当前 live X5 Cookie；`/user/security` 继续作为登录/身份验证页。
- 私有 HTML 缓存 key 增加 Cookie 会话指纹；账号切换后不会再按相同 URL 命中上一账号的推荐、历史、收藏或订阅缓存。
- 每次重新同步前继续清理旧 username/avatar/identity source；用户名只负责构造必须包含 `/users/<name>` 的 URL，不再被视为“账号会话正确”的充分证据。
- 账号视频页优先只解析主 `videoblock`；订阅页只接受 `subscriptions / userLink` 范围人物实体，避免把热门演员、推荐关注、侧栏内容误当成用户自己的订阅。
- 账号页增加 X5 官方 `/user/security` 校验入口；如果原生私有列表与网页仍不一致，优先以 X5 官方状态为事实源继续诊断。

### 同级导航彻底收敛
- 创作者中心 Pornstars / 频道 / Models / 用户改为 `putMyVar → refreshPage(false)`，不再新开 `pornhubCreators`。
- 同时审查并修正公开视频排序（推荐/最新/最多观看/最高评分）、搜索排序/制作类型/时长、本地收藏类型（影片/创作者/片单）等同级状态，全部原页刷新。
- 真正的信息钻取仍保留新页面：列表 → 视频详情、创作者列表 → 创作者详情、片单列表 → 片单详情、视频详情 → 评论。
- 固定回归：同一页 A/B/C/A/B 连续切换后，系统返回一次必须离开该功能页。

### 影片 / 创作者 / 片单收藏订阅
- **影片本地收藏**：恢复为详情页明确动作，与在线账号收藏完全隔离。
- **影片在线收藏**：从当前已登录视频页提取真实 video id + token，按 Pornhub 当前契约提交 `/video/favourite`；不硬编码用户身份。
- **创作者本地收藏**：新增独立本地列表，可在创作者详情收藏/取消。
- **创作者在线订阅**：优先读取当前页面真实 `data-subscribe-url / data-unsubscribe-url` 后执行；页面没有暴露安全直调动作时不猜接口，回退 X5 官方主页。
- **片单**：Playlists 从原站入口升级为原生列表 + 片单详情 + 片单视频；新增本地片单收藏。在线片单动作同样只在当前页面暴露可验证 action URL 时直调，否则进入 X5 官方页完成。
- 本地收藏中心改为影片 / 创作者 / 片单同页 Tab，不产生新返回栈。

### 评论
- 视频详情新增“评论”入口，不实现发评论。
- 第一阶段只读 Comment Adapter 从 `#cmtContent / .commentBlock / .commentMessage` 等真实 HTML 结构提取作者、头像、时间、点赞数和正文。
- 如果用户当前区域的 Pornhub 把评论改为 JS/AJAX 异步加载、初始 HTML 没有评论，则明确显示空状态并提供 X5 官方评论区兜底，不伪造评论。

### 外部协议交叉验证
- 当前 `sven-nillsson/PHUB` 实现再次确认账号推荐、观看历史、收藏、订阅分别依赖账号会话及 `/users/<name>/...` 路径；视频收藏使用 `POST /video/favourite {toggle,id,token}`。
- 同一实现的订阅解析也围绕 `userLink` 提取，支持本轮“账号私有页面必须限定主业务容器、禁止整页扫描”的修正方向。

### 回归门禁
- `core_patch.js`、`ui_patch.js`、Test4 Bootstrap 均通过 `node --check`。
- 离线 smoke：评论解析 2 条；订阅样例只保留 subscriptions 区域 1 位人物，排除侧栏推荐；片单样例解析 1 个；在线创作者 `data-subscribed="0"` 状态误判已修复。
- 静态导航审查确认 Test4 UI 不再通过 `C.page('pornhubCreators' / 'pornhubCatalog' / 'pornhubSearch')` 处理同级切换；Shell 增加评论与片单详情后共 20 个页面声明。
- Test1/Test2 已实机正常的公开视频详情与多画质 HLS 播放链保持不变。
- Test4 仍只进入 Test；账号会话、在线收藏/订阅和评论必须经过下一轮实机验证后才允许考虑 Stable。

## 0.1.0-test.3 / Build 10103 — 2026-08-23

### 第二轮实机结论
- Test2 实机显示创作者目录存在严重实体误识别：排名数字 `13 / 25 / 32 / 79 ...` 被当作姓名，部分条目只能回退到默认账号图标。
- 官方网页登录 + Cookie 同步本身能够建立会话，但 Test1/Test2 通过首页任意 `/users/<name>` 链接推断账号名，会命中推荐内容中的其他用户；因此同一网页登录态下重新同步可能随机显示不同账号。
- 上述“首页猜用户名”链已判定为账号身份事故，Test3 完全禁用；Cookie 与账号身份从此分层处理。

### 创作者解析 / UI
- Pornstars 列表优先限定在 `ul#popularPornstars`，并以 `<li>/<article>` 为人物卡边界，不再扫描全页后取第一个 profile anchor。
- 姓名候选改为：人物图片 `alt/title` → 卡片有效文本 → URL slug；纯数字、统计值、Rank、Views、Subscribers、Play All 等一律拒绝作为姓名。
- 列表卡要求有真实人物图片才进入主结果，不再使用 `account.svg` 伪装缺失头像。
- 个人页头像优先 `img#getAvatar`；失败后读取 `.topProfileHeader img`，最后才进入 Test2 通用头像兼容链。
- 创作者中心改为双列 `movie_2` 资料卡，顶部保留 Pornstars / 频道 / Models / 用户切换与搜索；详情页继续展示公开视频和原站主页入口。

### 账号身份安全
- Cookie 同步改为：`getCookie(base)` → 使用该 Cookie 请求 `/user/security` → 仅从 username input、明确 user data 属性或账号 Header 强信号恢复用户名。
- 每次同步在写入新身份前先清空旧 `username / avatar / identity source`，避免上一轮错误身份继续污染当前会话。
- 如果 `/user/security` 能确认 Cookie 已登录、但没有可靠用户名，Test3 只保留 Cookie 会话并显示“已登录 · 待绑定用户名”，不会再从推荐内容猜一个账号。
- `为你推荐 / Feed` 只依赖 Cookie，可继续使用；`观看历史 / 站内收藏 / 订阅` 依赖 `/users/<name>`，只有用户名确认后才开放。
- 用户可在登录页或账号页手动绑定/校正自己的 Pornhub 用户名；只保存用户名，不保存密码。
- 退出本小程序账号会话会同时清除本程序保存的 Cookie、用户名、头像和身份来源，但不删除 Pornhub 官方网页 Cookie。

### 回归门禁
- `core_patch.js`、`ui_patch.js`、Test3 Bootstrap 均通过 `node --check`。
- 离线 smoke：含排名 `13 / 25` 的 `#popularPornstars` 样例只输出 `Skye Young / Sara Diamante` 及对应真实图片；`/user/security` 身份样例只识别明确当前账号 `REAL_USER`。
- Test1/Test2 已实机可用的公开列表、详情和多画质 HLS 播放链保持不变；Test3 仍只进入 Test，等待新一轮实机验证后再决定是否继续增强账号功能。

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