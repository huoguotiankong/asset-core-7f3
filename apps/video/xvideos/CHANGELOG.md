# XVideos CHANGELOG

## 0.1.0-test.5 / Build 10105 — 2026-08-23

### Test4 实机结论
- Test4 的视频主链仍可进入详情，创作者频道页也能恢复真实图片和视频数量，说明 Test2 的 `frame-block + video.* token` 列表解析、Test3 创作者视频 `/videos/best/<page>` 和既有播放链没有整体失效。
- 详情页当前把“时长 / 观看 / 点赞 / 评论”做成四个统计图标，但实机只能突出图标/标签，真正数值信息弱；用户明确要求统计改为直接文字数据，原本位于详情底部的“本地收藏 / 评论 / 官网 / 上传者”四个操作图标前移到该位置。
- 详情标题和简介仍出现 `&lbrack; / &rsqb; / &period;` 等命名 HTML 实体，证明旧 `decode()` 只覆盖常用实体和部分数字实体仍不足。
- 详情“出演者”误把 `Transsexual Porn / Channels / Pornstars` 等分类/导航文字当人物，说明 `li.model` 周边取链仍过宽，必须只接受明确人物路径。
- 演员页地区入口重复出现多个 `China / Japan`，同时把 `Taiwan / Kazakhstan` 等地区条目当成演员实体；频道页虽然能恢复 80 个真实频道，但单列 avatar 排版与官网视觉差距大。用户要求演员/频道/创作者参考官网卡片感，统一改成一行两列。
- 分类官网当前可见中文名称，而小程序仍主要展示英文 slug；本轮改为“真实官网标签 URL 不变、显示名中文化”。
- 评论页能识别评论数量，但正文仍为空；说明详情页评论数量 Selector 有效，Comment Adapter 仍未命中当前真实 DOM/AJAX 数据。
- 登录入口打开的是 XVideos 普通首页，不能稳定进入登录/账号流程；同时实机同步操作直接抛出 `InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入`，因此 Test5 必须先按私有 KV 饱和事故救援，而不是继续在旧 `setItem` 会话链上修补。

### 私有存储 1MB 救援
- Test1-Test4 的完整 HTML 短缓存会写入 `setItem`；累计多个列表/详情/账号页面后，用户设备已达到海阔规则私有 KV 约 1MB 上限，导致后续哪怕只写一个很小的登录状态也会失败。
- Test5 覆盖 `fetchText()`：完整 HTML 只保存在本次运行内存，不再写 `setItem`；Profile AJAX 载荷同样只走内存缓存。
- 本地收藏、浏览足迹、搜索历史、账号显示状态和自定义域名迁到 `saveFile/readFile` 私有文件；首次读取可从旧 KV 做只读迁移，后续写入完全走文件。
- 账号 Cookie 不再持久化到任何文件或 KV，只实时读取当前 X5 Cookie 容器；文件中只保存 `enabled / name / fingerprint / syncedAt` 这类非秘密会话状态。
- Patch 启动时尝试清理已知旧 HTML cache key、旧账号 Cookie/Session key 和旧 Remote Manager 状态；清理失败也不会阻断页面主链。
- Test5 Bootstrap 不再调用会写 Remote State 的 `HikerCloudRemote`，改为 Direct Immutable Loader，按 Release 固定顺序直接 `require()` Test1→Test5 不可变模块并校验最终版本。

### 登录 / 账号重构
- 官方登录入口固定为 `x5://<base>/account`，不再把站点首页当登录页。
- `liveCookie()` 会从 `/account`、站点根路径读取当前 X5 Cookie，并选择当前有效会话；原生账号请求直接使用 live Cookie。
- “同步当前 X5 会话”先请求 `/account` 验证登录状态；Cookie 中存在当前 session token 或账号页出现明确已登录信号后才建立小程序账号状态。
- 当前会话只以不可逆 fingerprint 展示；账号名只能从明确 account/profile 上下文恢复，解析不到名字时仍可保留已验证的 Cookie 会话，不再从普通推荐人物猜用户名。
- 退出小程序账号只清文件状态，不删除 X5 官网 Cookie。

### 详情页产品重构
- 详情主信息区仍保留 Hero + “立即播放”，播放链继续使用 Test3 已验证的已知源优先 / HLS master 多画质 / `video://` 回退，不重新改媒体协议。
- 时长、观看、点赞、评论改为两列纯文字统计，直接显示实际解析值；发布日期独立显示，不再用四个统计图标占据首屏。
- 原底部“本地收藏 / 评论 / 官网 / 上传者”四个动作改为 `icon_small_4` 前移到统计下方，符合用户实机操作优先级。
- 底部不再重复一套同功能操作；收藏写入文件，不触碰已饱和 KV。
- `decode()` 增加命名实体与十六进制数字实体，覆盖 `lbrack / rbrack / period / rsquo / ldquo / rdquo / ndash / mdash / hellip` 等当前实机暴露形式。
- 出演者 Parser 收紧为 `li.model` 容器内的明确 `pornstar/profile` 人物路径；`Channels / Pornstars / Transsexual Porn / Models / Users` 等导航或类别词直接拒绝。

### 中文分类
- `/tags` 的真实标签 URL、分类搜索、A-Z 收纳逻辑继续保留，避免为了中文展示制造一套假的本地分类协议。
- 显示名优先尝试从 XVideos 中文站标签页学习真实中文名称；不可用时使用项目内稳定映射，例如 `anal→肛交`、`mature→成熟`、`brunette→褐发`、`black→黑人`、`redhead→红发`、`blonde→金发`、`big-tits→巨乳`、`big-ass→巨臀`、`oral/blowjob→口交`、`ai-generated→AI生成`。
- 中文分类搜索同时匹配中文显示名和原始英文标签，点击后仍进入原官网标签 URL。

### 演员 / 频道 / 创作者
- 三类实体统一使用 `movie_2` 双列卡片，不再使用 Test4 的单列 avatar 长列表；名称、图片和视频/订阅/观看统计尽量贴近官网卡片信息层级。
- 演员页只接受明确 Pornstar 实体；频道接受 Channel / 经强上下文验证的根级 Creator；创作者接受 Profile / 经强上下文验证的根级 Creator。
- 地区词典补齐 Taiwan / Kazakhstan 等并中文化；地区入口按显示名去重，和演员实体完全分离。
- 创作者主页统计也改为真实文字两列，视频继续双列展示。

### 评论恢复增强
- Comment Adapter 从单一 class 结构扩大到 `div/li/article/section` comment 容器，支持更多 username/message/time/like/avatar 结构。
- 初始详情 HTML 未命中时，会从真实 `data-url / data-href / href / action` 和脚本字符串中发现同源 comment/reply AJAX 地址，最多有限请求 8 个候选。
- AJAX 返回兼容 HTML 和 JSON；JSON 可递归读取 `comment/message/body/text/content` 以及用户、头像、时间、点赞字段，仍坚持“没有真实数据就空态”，不伪造评论。
- 若仍恢复不到正文，只在私有文件写入很小的 comment diagnostic（URL、候选地址数量、HTML 长度），不保存完整 HTML。

### Release / Bootstrap / Shell
- 新不可变目录：`apps/video/xvideos/releases/0.1.0-test.5/`。
- Release 在 Test4 模块之后追加 `core_rescue_patch.js + ui_rescue_patch.js`，`previous` 明确指向 `0.1.0-test.4 / Build10104`。
- Bootstrap：`bootstrap_test_v5_b10105.js`，采用 direct immutable rescue loader，不写 Remote Manager 私有状态。
- Shell：`xvideos_remote_test_v5_b10105.txt`，规则版本 `2026082305`，继续复用 Test3 已验证的单 `xvideosRoute` 通用路由，全部入口固定 Build10105。
- 云仓 `manifest / manifest_meta / registry / test / manifest / channels` 已切到 Test5；合并共享索引时重新读取并保留并行开发的 `911爆料 Test3` 与 `溏心次元 Test2`，避免用旧共享文件覆盖其它程序。

### 静态门禁
- Test5 Core/UI 发布候选已执行 `node --check` 通过；Direct Bootstrap 已执行 `node --check` 通过。
- Test5 Shell 的 `￥home_rule￥` JSON 已本地解析通过，单一页面路由为 `xvideosRoute`，Build 固定 10105。
- Test5 仍只进入 Test，不建立 Stable；Test4 完整保留为 previous 回退基线。

### Test5 实机回归重点
1. 首次覆盖 Test5 后是否不再出现 `私有存储内容过大 (1MB) / setItem` 错误。
2. 首页、搜索和播放是否保持 Test2/Test3 已验证基线，不因救援 Bootstrap 回退。
3. 详情标题/简介中的 `&lbrack; / &period;` 是否正常解码。
4. 时长/观看/点赞/评论是否直接显示真实值；下面四个图标是否变为本地收藏/评论/官网/上传者。
5. 出演者是否不再出现 `Transsexual Porn / Channels / Pornstars` 这类假人物。
6. 分类是否大部分显示中文，搜索中文标签能否进入正确分类。
7. 演员/频道/创作者是否变为一行两列，地区入口去重且不再把 Taiwan/Kazakhstan 当演员。
8. 打开登录是否直接进入 XVideos 账号页；完成官网登录后同步是否能进入“我的账号”，喜欢/稍后看/历史是否和官网同一会话。
9. 评论是否能恢复真实正文；若仍为空，下一轮读取 Test5 小诊断继续定向适配当前评论接口。
10. 图标 CDN 修复是否在重新覆盖 Test5 后正常显示。

---

## 0.1.0-test.4 / Build 10104 — 2026-08-23

### 恢复基线
- 新对话恢复时确认 `asset-core-7f3@main` 当前真实活动测试版为 Test3 / Build10103；Test2 已由用户实机确认首页视频与搜索正常，Test3 已完成独立搜索、A-Z 分类、创作者主页、详情 UI、最高画质优先和 generic route 产品化。
- Test4 不回退或重写 Test2 已验证的 `frame-block + video.* token` 列表解析链，也不破坏 Test3 的搜索/分类/详情/播放产品层，只做增量补强。

### 账号会话硬化
- 根据 2026-08-23 `INCIDENT_BROWSER_COOKIE_CONTAINER_AND_AUTH_CACHE_20260823.md` 的跨程序实机结论，同步修复 XVideos 账号链：网页登录继续固定使用 `x5://`，原生请求优先读取当前 live X5 Cookie，而不是长期只依赖上次保存值。
- 新增 `activeCookie()` / `authFingerprint()`：私有请求缓存 key 从简单 `auth:<url>` 升级为 `auth:<session fingerprint>:<url>`，防止切换官网账号后复用上一个账号的历史/喜欢/稍后看 HTML。
- 会话指纹只保存 Cookie 的不可逆 hash/长度组合，不记录新的明文秘密；退出小程序会话时同步清理本程序保存的 Cookie、账号名和会话指纹，但不主动删除 X5 官网 Cookie。
- `detectAccountName()` 收紧到账号/当前用户上下文，不再把整页任意 `/profiles/<slug>` 链接当作当前账号。
- 登录页/账号页直接显示当前会话指纹，方便实机核对“网页账号、原生私有列表、当前会话”是否同一套状态。

### 私有账号列表
- `accountVideos()` 改为优先定位 `mozaique / video-list / videos-list / content-videos` 等主内容区域，再解析 `frame-block`，减少推荐区、导航区或其它公共视频混入喜欢/稍后看/历史。
- 私有列表仍以真实官网返回为唯一事实源；解析不到时显示明确空态和官网入口，不制造伪账号内容。

### 首页连续浏览
- Test3 首页固定 `homeVideos(mode,1)`，只能长期停留第一页；Test4 改为读取 `MY_PAGE`，让首页视频 Feed 跟随海阔分页继续加载。
- 首页 Workspace、排序按钮和“更多”工具只在第一页渲染，后续页只追加视频卡，避免每一页重复工具区。
- 登录后新增明确“推荐”筛选态，对应 `home` 模式；解决 Test3 登录默认 mode=`home` 但界面没有任何按钮显示选中的问题。

### 评论与本地数据
- 评论解析在旧安全 parser 前增加更宽但仍受 comment 容器约束的适配层：支持 `div/li/article` comment 节点、统一 Creator Path Adapter 和更多 `comment-user/comment-content` 类名；无法恢复真实正文时继续回退旧 parser，不伪造评论。
- 本地收藏与本地足迹新增“清空”动作；只修改本机对应列表，不触碰官网账号内容。

### Shell / Settings
- 新增不可变 `releases/0.1.0-test.4/`，在 Test3 模块之后叠加 `core_account_patch.js + ui_account_patch.js`。
- 新 Bootstrap：`bootstrap_test_v4_b10104.js`，`minBuild/defaultRelease` 固定 Build10104。
- 新 Shell：`xvideos_remote_test_v4_b10104.txt`，规则数值版本 `2026082304`，所有入口显式使用 Test4 Bootstrap / Build10104。
- Settings 的检查更新、安装更新、回退、缓存清理等 lazyRule 全部切到当前 Build10104，不再继续调用 Test1 的 Build10101 Bootstrap。

### 程序图标交付修复
- 用户实机反馈 XVideos 与 Pornhub 的程序图标同时挂掉，而其它小程序图标正常；仓库内 XVideos `brand.svg` 文件本身仍完整，问题先按“图标 URL/缓存交付链”处理，不误判为业务代码损坏。
- Test4 `channels.json`、云仓根 `manifest.json` 和 Test4 Shell 的 `icon` 已统一从 `raw.githubusercontent.com/.../brand.svg` 切换为明确 `@main` 的 jsDelivr CDN 地址，并附加新的缓存参数。
- 该修复当前只证明代码/交付链已切换，**尚未得到用户实机确认图标恢复**；在实机确认前不把“raw GitHub SVG 一定有问题”写成跨程序定论。

### 静态门禁
- `core_account_patch.js`、`ui_account_patch.js`、`bootstrap_test_v4_b10104.js` 已实际执行 `node --check` 通过。
- 新 Shell 的 `￥home_rule￥` 后 JSON 结构保持 Test3 已验证 generic route 形式；Test4 只变更 Bootstrap/Build 与程序图标交付地址。
- Test4 只发布 Test，不建立 Stable；Test3 作为 previous release 保留。

### Test4 实机回归重点
1. 首页向下翻页是否能继续加载第 2 页及后续视频，而不重复 Workspace。
2. 未登录时 Test2 已验证的视频卡与搜索是否保持正常。
3. Test3 的独立搜索历史、热门+A-Z 分类、创作者主页、详情布局、最高画质优先是否无回退。
4. X5 登录后首页是否出现并选中“推荐”；喜欢/稍后看/历史是否与官网同一账号一致。
5. 若切换官网账号，重新同步后私有列表是否完全切换，不出现上一账号旧缓存。
6. 评论页是否比 Test3 恢复更多真实正文；若仍为空，下一轮按实机 DOM 定向适配。
7. 本地收藏/本地足迹清空是否只删除本机记录。
8. 云仓卡片和导入后的 XVideos 程序图标是否恢复；若仍挂图，下一轮直接改用 PNG/站点 favicon 方案，不继续猜 SVG CDN。

---

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