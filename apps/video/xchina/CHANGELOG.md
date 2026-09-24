# 小黄书 CHANGELOG

## 0.1.0-test.16 / Build 10116 — 2026-09-24

状态：当前 Test；无 Stable。依据用户本轮实机截图修复图片、模特作品列表并整理原生 UI。播放仍未获得成功实机证据。

- 套图/漫画列表封面：仅在当前作品卡片内读取完整 CSS style 的 url()、懒加载属性，重建实际列表解析链，避免旧闭包继续调用旧解析器。失败卡片的真实图片地址和 HTTP 响应尚待设备诊断。
- 套图/漫画正文：按目标容器读取 img/source 的 data-original、data-src、data-lazy-src、src/srcset 和 CSS url()，相对路径依据当前页面补全；漫画正文沿用漫画域 Referer，套图沿用主站 Referer。拒绝 data:/about: 占位地址。
- 模特详情保留 6 部预览；全部视频链接明确携带 `page=fypage`，列表按 `MY_PAGE` 请求原站分页。加入 `xc_model_favorites_v1` 本地收藏和设置页入口。模特名称、封面、作品数量仍来自原站资料。
- 首页收敛为类型切换与搜索/分类/模特/收藏入口；新增本程序 SVG 图标。SVG 在海阔图标加载器的渲染需要实机确认。
- 播放继续沿用 Test15 的精准 M3U8 和时长门禁备用链；用户报告当前不能播放，故本版没有宣称修复完成，也不得晋级 Stable。下一轮需要同一视频的四条播放诊断结果、码率和时长，才能区分网页提取失败与媒体分片加载失败。
- 运行链：Test9 categories/categoryFix/core → Test13 prepatch/pages/postpatch → Test15 playbackPatch → Test16 uxPatch；Shell version `2026092410`，Bootstrap/Release/元数据 Build 10116。
- 静态验证：补丁 `node --check` 通过；Shell 与 Release 回读需核对。实机图片、分页、图标与播放均待用户验收。


## 0.1.0-test.14 / Build 10114 — 2026-09-24

状态：**当前 Test；根据 Test13 实机结果暂停其它优化，当前版本只处理视频播放；无 Stable。**

### 当前实机事实
- [实机确认] Test13 对多个真实视频详情仍显示“暂未解析到正片”，播放诊断同样显示没有正片媒体地址。
- [实机确认] 这意味着 Test13 的 `fetch → main-container → 主站精确重取 → fetchCodeByWebView` 静态源码链仍然拿不到最终播放时才产生的正片地址；继续只扩展静态正则意义不大。
- 用户明确要求先把播放修复好，播放没有通过前暂停套图封面、漫画封面、女优全部视频和其它 UI 优化。

### Test14 播放策略
- Test14 不再让视频详情页在渲染阶段等待静态 `main-container` 猜媒体。详情页保留标题、封面、女优/模特和一个主播放按钮，点击后才进入实时媒体捕获。
- 主播放改用海阔 `webRule://`：让真实网页在 WebKit 中运行，并每约 250 ms 执行资源提取脚本；优先读取 `.main-container video/source`，同时检查 `window._getUrls()`、`fy_bridge_app.getUrls()` 与 `performance.getEntriesByType('resource')`。
- 只接受明确的 `.m3u8` 正片候选；优先包含 `playhls`、`/hls/`、`master.m3u8`、`index.m3u8` 的地址。
- 对 `doubleclick / googlesyndication / ads / advert / banner / promo / analytics / tracking / vast / ima` 等广告与统计资源直接排除。
- 播放页增加三条独立实机链：`WebKit 精准捕获` → `X5 精准捕获` → `M3U8-only 自动提取`。第三条才使用海阔原生 `video://`，但显式 `videoRules=['.m3u8']`，并把 `.mp4` 与广告关键词放入 `videoExcludeRules`，避免 Test9 时代再次把 MP4 广告识别成正片。
- WebKit/X5 页面项继续携带上传阅读源使用的 Quark UA 和 `Referer: https://xchina.co/`；如果站点先要求验证，则通过设置页 X5 主站验证复用 live Cookie。
- 本轮不再对任意 CDN 强塞 `Host=s2.playhls.com`；捕获到实际 m3u8 后再根据真实媒体 host 决定后续 Header/缓存处理。

### 修改边界
- Release 基线保持 Test13 不动，只在最后追加 `releases/0.1.0-test.14/playback_patch.js`：`Test9 categories → Test9 categoryFix → Test9 core → Test13 prepatch → Test9 pages → Test13 postpatch → Test14 playbackPatch`。
- 不修改 Test13 的列表、搜索、分类、女优/模特、套图、漫画、阅读器等业务实现，避免当前播放攻关继续扩大回归面。
- Shell：`xchina_remote_test_v14_b10114.txt`，规则 version `2026092408`；Bootstrap：`bootstrap_test_v14_b10114.js`，`minBuild=10114`。
- `test.json / channels.json / manifest.json` 已切到 `0.1.0-test.14 / Build 10114`；Stable 仍不存在。

### Test14 实机验收
1. 设置页确认 `Test 0.1.0-test.14 · Build 10114`。
2. 用 Test13 同一个失败视频直接点 `▶️ 播放`，确认 WebKit 捕获是否能进入真正播放器。
3. 主播放失败时进入“播放诊断 / 备用引擎”，依次测试：WebKit 精准捕获 → X5 精准捕获 → M3U8-only 自动提取。
4. 只有出现真实码率、合理总时长、进度持续推进并可拖动后，才能判断播放链成功；只打开播放器、只抓到 URL 或只播放广告均不算成功。
5. Test14 播放未通过前，不继续其它视觉/列表优化，也不得晋级 Stable。

## 0.1.0-test.13 / Build 10113 — 2026-09-24

状态：**历史 Test；针对 Test12 实机确认的“视频仍未解析到正片、女优全部视频只显示部分、视频详情夹带重复/推广文本”继续修复；无 Stable。**

### 当前实机确认
- [实机确认] Test12 女优/模特详情首屏已能按产品要求展示前 6 部作品并显示收录总数，但点击“查看全部视频”后只得到原站第一页的部分作品，没有随海阔 `MY_PAGE` 继续翻原站分页。
- [实机确认] Test12 视频详情已经把广告标签从按钮区清掉，但通用 `video-detail` 简介仍把标题、模特、分类和“推广 / 楼凤 / AI / VPN / 下载”等正文噪音整体带入页面，详情信息层级仍不干净。
- [实机确认] Test12 对同一视频显示“未解析到正片视频”，说明问题已经前移到媒体提取阶段，而不是播放器单纯 Header 交付；继续强制 `Host=s2.playhls.com` 没有实际依据。

### 女优 / 模特全部视频
- 保留详情首屏只预览前 6 部视频的设计。
- “查看全部视频”新增 `model_all=1` 专用分页链：先读取原站全部视频页，再从 `.pager` 的数字链接推导目标页 URL；支持 `/2.html`、`-2.html`、`?page=2`、`?p=2`、`/page/2` 等常见形式。
- 海阔 `MY_PAGE` 大于 1 时不再重复请求固定的第一页 `xc_path`；能识别原站 pager 时会继续加载下一页，因此 121 部这类女优页可持续向下加载，而不是只看到第一页十余部。
- 模特标题/简介改为独立资料提取：优先模特名节点，失败时回退 URL slug；简介只保留类似“这个人很懒，什么都没留下”的个人资料，不再把“收录视频数 / 全部视频 / 作品标题”整块误当简介。

### 视频详情清理
- 视频详情不再渲染通用 `info.intro` / `.video-detail` 长文本块，因为当前实机已经证明该块混有重复标题、重复模特与大量推广信息。
- 页面保留：封面 / 标题 / 视频类型、真实女优/模特按钮、可识别的正规内容分类、播放入口、播放诊断与原站入口。
- 标签仍只读取上传阅读源契约中的 `.model-container@a` 与 `.tags` 固定位置，并继续过滤推广、广告、VPN、下载、APP、论坛、加速、一键、AI 脱衣/换脸、楼凤、约炮、兼职等明显非内容词。

### 正片媒体提取
- 继续以用户上传的“✈️ 小黄书-夜明空”阅读源为事实源：纯视频正片来自 `class.main-container@all` 内第一个 quoted m3u8。
- Test12 主要靠手写平衡 DOM 截取 `main-container`；Test13 先使用海阔 DOM 解析器读取 `.main-container&&Html`，再回退平衡截取，降低容器标签结构变化导致的空结果。
- 如果当前详情 HTML 没找到正片，Test13 会按阅读源真实请求头重新访问 **`https://xchina.co` 同路径**：`User-Agent + Accept-Language + Referer=https://xchina.co/ + live Cookie`，避免“最近成功备用域 / 当前详情域 Referer”与阅读源合同不一致。
- 主站精确请求仍无 m3u8 时，最后使用 `fetchCodeByWebView()` 渲染同一主站页面，但依然只从渲染后的 `main-container` 提取明确 m3u8；不会恢复 `video://` 泛嗅探，因此不会再把广告视频当正片。

### 播放 Header 修正
- 上传阅读源的全局 Header 固定为 `Referer: https://xchina.co/`，并没有要求所有媒体都强制 `Origin` 或 `Host: s2.playhls.com`。Test13 因此把推荐播放回归为 **UA + 固定 xchina.co Referer + live Cookie**。
- HLS 仍优先 `cacheM3u8(media,{headers})`，使分片请求继承 Header；只有当实际媒体 hostname 本身就是 `s2.playhls.com` 时，才尝试同名 Host 对照，不再把 s2 Host 强塞给其它 CDN。
- 播放诊断保留“推荐播放 / 直接 Header”两条对照；未实机出现真实码率、合理总时长并持续推进前，不视为播放完成。

### 架构 / 发布与门禁
- Test13 仍以冻结 Test9 阅读源重建基线作为 Core/Pages：`Test9 categories → Test9 categoryFix → Test9 core → Test13 prepatch → Test9 pages → Test13 postpatch`，不叠加 Test10/Test11/Test12 patch。
- Shell：`xchina_remote_test_v13_b10113.txt`，规则 version `2026092407`；Bootstrap：`bootstrap_test_v13_b10113.js`，`minBuild=10113`。
- `test.json / channels.json / manifest.json` 已切到 `0.1.0-test.13 / Build 10113`；Stable 仍不存在。
- Test13 `prepatch.js / postpatch.js / Bootstrap` 已通过本地 `node --check`；Shell 外层 JSON 与 13 个 pages 路由解析通过。

### Test13 实机验收
1. 设置页确认 `Test 0.1.0-test.13 · Build 10113`。
2. 打开 `nana_taipei` 一类女优页：首屏仍只显示 6 部；点“查看全部视频 · 121”后持续向下滚动，确认第 2 页及后续作品能继续加载，而不是反复第一页或只显示十余部。
3. 视频详情确认不再出现“推广、楼凤、AI、VPN、下载”等长篇简介噪音，只保留标题、女优/模特、有效分类和播放操作。
4. 同一失败视频观察是否由“暂未解析到正片”变成“播放”；若有媒体候选，优先测试推荐播放，再测试直接 Header。
5. 播放成功标准仍是：出现真实码率、合理总时长并可持续推进/拖动进度。
6. 未完成以上实机验证前不得晋级 Stable。

## 0.1.0-test.12 / Build 10112 — 2026-09-24

状态：**历史 Test；承接用户最新实机反馈，继续收紧女优页、标签、封面和 HLS 播放合同；无 Stable。**

### 当前实机反馈与 Test11 边界
- [实机确认] Test10 仍存在四个关键问题：女优/模特页作品展示不符合网站“前 6 部 + 全部视频”的产品形态；标签混入 VPN/下载/AI 等广告；套图/漫画封面仍大量空白；视频进入播放器后仍为 `0 kb/s / 00:00`。
- Test11 在一次客户端处理卡顿期间已写入仓库，但没有获得用户实机验收，因此不得把 Test11 当成已修复版本。Test12 在 Test11 尚未实机验证前继续静态审查并修正两处合同偏差：漫画列表封面 Referer 与内容标签路由。

### 女优 / 模特页
- 详情页直接展示前 6 部视频作品，解析原站“收录视频数”，并优先提供“查看全部视频 · N”入口；避免把几十/上百部作品一次性铺满详情首屏。
- 保留原站资料/简介与作品区分层；没有独立“全部视频”链接但实际解析到超过 6 部，则提供“查看本页全部作品”入口，不再首屏无限铺卡。

### 标签
- 女优/模特只允许来自 `.model-container@a` 且 href 确认属于 `/model/` 或 `/models/`。
- 内容标签严格只读取上传阅读源明确使用的 `.tags` 第 `4 / 1 / 3` 个 div，不再扫描详情页其它 `<a>`。
- VPN、下载、APP、论坛、加速、推广、广告、一键、AI 脱衣/换脸等明确推广语义全部过滤；内容标签只有匹配现有 `CATEGORY_GROUPS.video` 时才进入海阔分类，未知标签保持不可跳转，禁止再打开广告页面。

### 套图 / 漫画封面
- 封面第一合同仍为上传阅读源 `.img@style → url(...)`；同时加入历史可用规则的类型精确回退：视频 `data-poster`、套图 `img src`、漫画当前卡片 `img src`。
- 封面只在当前卡片内部解析，不恢复相邻卡片邻域猜图。
- **修正 Test11 的 Referer 偏差**：上传夜明空阅读源对列表/详情封面使用 `source.key`，即 `https://xchina.co/`；因此 Test12 对套图、漫画等所有列表/详情封面统一附 `xchina.co` Referer。`litu100.xyz` Referer 只保留给漫画正文图片。
- 使用独立 `xc_t12_*` 缓存/线路命名空间，避免 Test9/Test10/Test11 的旧缓存干扰封面实机判断。

### 视频 / HLS 播放
- 正片解析继续严格限定到平衡闭合后的 `main-container`：纯视频只取第一个 quoted m3u8；套图视频在无 m3u8 时才回退 `var domain + var videos`。
- 继续禁用 `video://` 泛嗅探，避免再次命中广告。
- HLS 播放不再先做一次同步 `fetch` 预检；点击后直接优先 `cacheM3u8(media,{headers})`，Header 使用 `Host: s2.playhls.com + Referer + Origin + UA + live Cookie`，失败再尝试不带 Host 的 `cacheM3u8`，最后才返回显式 Header 播放地址。
- 播放诊断保留“推荐播放”和“普通 Header”两条对照链；只有海阔实机出现真实码率、合理总时长并持续推进才算播放完成。

### 架构 / 发布与门禁
- Test12 继续以 Test9 阅读源重建基线为 Core/Pages，不加载 Test10/Test11 patch：`Test9 categories → Test9 categoryFix → Test9 core → Test12 prepatch → Test9 pages → Test12 postpatch`。
- Shell：`xchina_remote_test_v12_b10112.txt`，规则 version `2026092406`；Bootstrap：`bootstrap_test_v12_b10112.js`，`minBuild=10112`。
- `test.json / channels.json / manifest.json` 已切 `0.1.0-test.12 / Build 10112`；Stable 仍不存在。
- `prepatch.js / postpatch.js / Bootstrap` 本地 `node --check` 通过；Shell 外层 JSON 与 13 个 `pages` 路由解析通过。

### Test12 实机验收
1. 设置页确认 `Test 0.1.0-test.12 · Build 10112`。
2. 打开女优/模特详情：首屏应只展示前 6 部视频，并出现全部视频入口和总数。
3. 视频详情标签不应再出现 VPN、下载、成人 APP、AI 推广等广告；女优标签应能进入海阔模特详情。
4. 套图与漫画列表重点确认此前空白封面是否恢复；若仍空白，下一轮直接抓具体卡片真实图片 URL/host/响应 Header，不再继续改通用 Parser。
5. 视频先点主“播放”；失败时进入“播放诊断”依次测试“推荐播放 / 普通 Header”，记录真实码率、总时长与是否持续推进。
6. 未完成上述实机验证前不得晋级 Stable。

## 0.1.0-test.11 / Build 10111 — 2026-09-24

状态：**历史 Test；在客户端处理卡顿期间完成仓库写入，但未取得用户实机验收；无 Stable。**

### 当前实机确认
- [实机确认] 女优/模特网页本身可以看到大量作品及“收录视频数”，用户要求海阔详情页直接展示前 6 部作品，而不是把所有结果一次性铺满。
- [实机确认] Test10 标签弹窗把 VPN、下载、AI 推广、成人 APP 等广告导航一起识别成标签，说明“扫描详情区域全部 `<a>`”方案不可继续使用。
- [实机确认] Test10 套图/漫画列表仍有大量空白封面，必须继续沿单卡真实 `.img@style` 契约修复，不能再扩大邻域猜图。
- [实机确认] Test10 已能进入原生播放器但仍为 `0 kb/s / 00:00`，说明已解析到候选 URL 仍不等于 HLS 分片可被海阔持续请求。

### Test11 产品 / 女优页
- 女优/模特详情页改为**直接展示前 6 部视频作品**，并优先解析原站“全部视频/全部作品”入口；页面标注收录数时同时展示总数。
- 当前页面若没有独立“全部视频”链接但实际解析到超过 6 部，则提供“查看本页全部作品”入口，不再首屏无限铺卡。
- 女优页简介/资料与作品区分层，保持海阔原生页面而不是回退整个网页。

### Test11 标签
- 不再扫描 `video-detail / tags / model-container` 内全部锚点。
- 女优/模特只从 `.model-container` 读取；内容标签按上传阅读源原规则限定为 `.tags@div.4`、`.tags@div.1`、`.tags@div.3` 三个位置。
- 额外过滤推广、广告、VPN、下载、APP、论坛、加速、分享、一键、AI 脱衣/换脸等明显非内容标签；最多展示 6 项。
- 模特标签继续可进入海阔模特详情；其它标签只有确认存在真实业务链接时才进入对应列表，避免错误跳转广告页。

### Test11 套图 / 漫画封面
- Test11 不加载 Test10 patch，直接从冻结 Test9 阅读源基线重建 pre-pages 修复，避免错误 patch 继续叠加。
- 封面只在**当前作品卡片自身**查找：优先 `.img@style → url(...)`，再回退当前 `.img` 的 `data-original/data-src/data-lazy-src/src`，最后才读取当前卡片 `<img>`；禁止跨相邻卡片搜索。
- 新属性读取器按外层 HTML 引号闭合位置解析完整 `style`，避免 CSS `url('...')` 内部单引号截断；同时恢复 `\\/`、`\\u002F` 与 HTML 实体。
- 图片继续使用海阔 `url@headers={...}` 交付；套图使用主站 Referer，漫画列表在当前独立漫画域列表中允许使用漫画域 Referer；不向第三方 CDN 盲发无关 Cookie。
- Test11 使用独立 `xc_t11_*` 线路/缓存命名空间，避免 Test9/Test10 错误缓存影响本轮判断。

### Test11 播放链
- 媒体解析重新收紧到**平衡闭合后的真实 `main-container`**，不再扫描详情页大范围脚本或广告区域。
- 纯视频严格按上传阅读源 2025-11-04 规则：只取 `main-container` 内第一个 quoted m3u8；套图视频才在没有 m3u8 时回退 `var domain + var videos`。
- 继续完全禁用 `video://` 广告嗅探，不再用“能播放广告”当播放成功。
- 当前项目旧小黄书播放器资料表明 HLS 请求曾显式使用 `Host: s2.playhls.com`；Test11 把这一点移到**点击播放阶段**验证：先使用 `Host=s2.playhls.com + UA + Referer + Origin + live Cookie` 预检 m3u8，命中 `#EXTM3U` 后优先 `cacheM3u8()`，让后续分片继承 Header；失败后再尝试普通 Header。
- 播放诊断页保留“推荐播放（Host/cacheM3u8）”与“普通 Header”两条可验证链，用实机结果继续区分 CDN Host 合同与普通 Referer/Cookie 合同。
- 未实机出现真实码率、合理总时长并持续推进前，不把 Test11 播放链标记为完成。

### 架构 / 发布
- Release 顺序：`Test9 categories → Test9 categoryFix → Test9 core → Test11 prepatch → Test9 pages → Test11 postpatch`；Test10 patch **不参与 Test11 运行链**。
- Shell：`xchina_remote_test_v11_b10111.txt`，规则 version `2026092405`；Bootstrap：`bootstrap_test_v11_b10111.js`，`minBuild=10111`。
- app-local `test.json / channels.json / manifest.json` 已切到 `0.1.0-test.11 / Build 10111`；Stable 仍不存在，根规则仓库展示卡仍不切未实机验证版本。
- Test11 prepatch/postpatch 本地 `node --check` 通过；Shell 外层 JSON 与 13 个 `pages` 路由解析通过。

### Test11 实机验收
1. 覆盖导入 Test11，设置页确认 `0.1.0-test.11 / Build 10111`。
2. 套图与漫画列表：确认此前空白封面是否恢复；如果仍空白，下一步必须抓具体空白卡片的真实 `style URL + 图片 host + HTTP/Header`，不再改通用解析范围。
3. 女优/模特页：首屏直接显示 6 部视频作品，并有“全部视频/全部作品”入口或当前页展开入口。
4. 视频详情：只应看到真实女优/模特与阅读源指定分类标签，不应再出现 VPN、下载、成人 APP、AI 推广等广告项。
5. 播放先点主 `▶️ 播放`；若仍失败，在“播放诊断”分别测试“推荐播放”和“普通 Header”，记录哪一条首次出现真实码率/时长。
6. 未完成以上实机验证前不得晋级 Stable。

## 0.1.0-test.10 / Build 10110 — 2026-09-24

状态：**历史 Test；针对用户当前实机确认的“套图/漫画封面仍空白、视频详情缺少标签、免嗅播放失败且网页嗅探命中广告”做专项修复，实机证明标签、封面和播放仍未完全解决；无 Stable。**

### 当前实机确认
- [实机确认] Test9 套图与漫画列表仍有大量空白封面，说明 Test9 虽已采用阅读源 `.img@style` 语义，但实际 `.img` 标签 `style="...url('...')..."` 在通用属性正则里仍会被内部单引号提前截断。
- [实机确认] 视频详情可以显示标题、封面和简介，但类似“萌崽儿”等模特/系列信息仍只混在简介文本里，缺少独立标签入口。
- [实机确认] Test9 页面没有按阅读源契约解析到媒体直链；`video://` 网页嗅探会命中广告，因此不能继续作为播放兜底。

### 封面链修复
- Test10 在 Test9 Core 与 Pages 之间增加 pre-pages 修复层，直接扫描卡片内 `.img` 标签并使用**成对引号回溯**读取完整 `style` 属性，避免 `url('...')` 内部单引号截断外层双引号属性。
- 封面继续遵守上传阅读源事实：列表/详情封面统一使用主站 Referer；漫画正文图片才使用 `litu100.xyz` Referer。
- 不只替换导出的 `cardFromBlock()`：同时重建 `parseCards()` 与 `listResult()`，避免 Test9 原有词法闭包继续绑定旧解析器，确保首页/分类/搜索真正进入新封面链。
- Test10 切换到独立 `xc_t10_*` base/last/cache 命名空间，避免 Test9 页面缓存干扰本轮封面与媒体判断。

### 视频详情标签
- 新增 `detailTags()`：优先从 `video-detail / tags / model-container` 内真实 `<a href>` 提取标签并去重。
- 视频详情在主操作前显示 `🏷️ 标签` 横向按钮；模特链接进入模特详情，视频系列/标签进入对应列表，其余保留原站链接。
- 标签只使用页面真实文本/链接，不从简介语义猜造标签；过滤“更多/登录/注册/推广/广告”等导航或推广项。

### 播放链修复
- `main-container` 媒体提取从 Test9“仅绝对 quoted m3u8”扩大为：相对/绝对/转义 m3u8、`src/file/url/play_url/video_url/m3u8_url`、`var domain + var videos`、`video/source src`。
- 媒体 token 统一恢复 `\\/`、`\\u002F`、HTML `&amp;`，再按详情页或 `var domain` 组成最终绝对地址。
- 只接受明确 `.m3u8/.mp4` 候选，并过滤 `ads/advert/banner/doubleclick/googlesyndication/tracking/analytics` 等明显广告/统计 URL。
- **取消 `video://` 网页嗅探兜底。** 当未识别到真实媒体时明确显示“未解析到真实视频”，宁可失败也不把广告伪装成正片。
- 播放诊断页仅保留两条可验证链：`免嗅原始媒体` 与 `Header兼容`，用于继续定位直链本身还是 Referer/UA/Cookie 交付问题。

### 架构 / 发布
- Test10 保持 Test9 上传阅读源重建资产不可变，Release 顺序为：`Test9 categories → Test9 categoryFix → Test9 core → Test10 prepatch → Test9 pages → Test10 postpatch`。
- post-pages 修复层重建视频详情/播放诊断/设置，并最终把 `XChinaRemoteRuntime.version/build` 提升为 `0.1.0-test.10 / 10110`；Release verify 以该版本为准。
- Shell：`xchina_remote_test_v10_b10110.txt`，规则 version `2026092404`；Bootstrap：`bootstrap_test_v10_b10110.js`，`minBuild=10110`。
- app-local `test.json / channels.json / manifest.json` 已切 Test10；Stable 仍不存在。

### 本地门禁与验收
- `prepatch.js`、`postpatch.js` 已通过 `node --check`；封面合成 smoke 已验证 `style="background-image:url('https://...webp')"` 能取得完整 URL；转义 `https:\\/\\/cdn/...m3u8` 能还原为真实媒体地址。
- Shell 外层 JSON 与 `pages` 内层 JSON 已解析通过，共 13 个页面路由。
- 实机重点：①套图/漫画封面是否恢复；②视频详情是否出现“萌崽儿”等真实可点击标签；③详情是否直接出现免嗅播放；④若仍无媒体，播放诊断应明确失败且不再播放广告；⑤免嗅与 Header兼容哪一条首次成功。
- 未完成上述实机验证前不得晋级 Stable。

## 0.1.0-test.9 / Build 10109 — 2026-09-24

状态：**历史 Test；依据用户上传 `✈️ 小黄书-夜明空` 阅读源重新建立协议层，实机证明漫画/套图封面与播放仍未完全解决；无 Stable。**

### 当前实机事实与重建原因
- [实机确认] Test7 视频仍进入播放器后 `0 kb/s / 00:00`，因此 Test7 的强制 Header 播放包装不能继续作为主链。
- [实机确认] Test7 视频封面已能显示，但漫画、套图仍大量空白，说明继续扩大通用邻域猜图不是正确方向。
- 用户要求直接参考项目来源中上传的小黄书阅读书源重新升级，并继续强化免嗅播放、图标与整体 UI。
- Test9 不再叠加 Test7 / Test6 / Test4 字符串 Patch，改为依据上传阅读源的真实列表、封面、正文、分类与媒体契约重新建立 Runtime。

### 上传阅读源确认的真实契约
- 主站为 `https://xchina.co/`；漫画独立站为 `https://litu100.xyz`；发布页为 `https://xiaohuangshu.me`。
- 列表内容按 `fiction / photo / comic / amateur / video` item 结构读取；封面规则优先读取 `.img@style` 并从 `url('...')` 取得真实图片地址，而不是先扫描附近任意 `<img>`。
- 阅读源对列表/详情封面统一使用主站 Referer；漫画正文图片才使用漫画独立站 Referer。Test9 按这个边界拆开封面与正文图片交付。
- 小说正文使用 `.fiction-body@p@html`；漫画正文使用 `.comic-img-box@html`；套图使用 `.photo-image@html`；自拍使用 `.amateur-image@html`。
- 视频与带视频套图从 `main-container` 读取；优先取 quoted m3u8，无 m3u8 时按 `var domain + var videos` 组合媒体地址。
- 搜索路由重新按阅读源确认：小说 `/fictions/keyword-...`、套图 `/photos/keyword-...`、视频 `/videos/keyword-...`、漫画独立域 `/comics/kk-...`。
- 阅读源的 `loginCheckJs` 明确把 `Just a moment` 作为验证状态处理；Test9 保留 X5 同会话验证与 live Cookie 读取。
- 阅读源 2025-11-04 的视频修复最终直接返回真实媒体 URL；Test9 因此把原始媒体地址作为第一播放路径，不再把 Test7 的强制 `Origin/Referer/Cookie` 包装当主链。

### Test9 架构 / UI / 播放
- Release 显式拆成 `categories → categoryFix → core → pages`，由 Remote Manager 按序加载并最终校验 `XChinaRemoteRuntime.version=0.1.0-test.9`。
- 首页/分类/设置继续使用海阔原生组件，增加小说、套图、漫画、视频、搜索、分类、模特、设置等语义图标。
- 完整迁入上传阅读源当前小说标签、漫画状态/地区、套图专辑/工作室和视频系列路由，不再使用旧版少量猜测分类。
- 视频详情第一主操作为 `▶️ 免嗅直连`：按阅读源原始媒体 URL 直接交给海阔播放器；播放线路页另保留 `Header 兼容` 和 `video://` 嗅探作为诊断/回退。
- Test9 使用独立 `xc_t9_*` 线路、状态与页面缓存命名空间；Shell rule version `2026092403`，Bootstrap `minBuild=10109`。
- 主站绝对详情 URL 重新支持按 path 在最近成功线路 / `xchina.co` / `xchina001.ink` 间回退；漫画绝对域继续保持独立处理。

### 发布边界与门禁
- app-local `test.json / channels.json / manifest.json` 已切到 Test9；Release、Bootstrap、Shell 和实际模块均位于 `asset-core-7f3@main`。
- Test9 当前只用于直接云口令覆盖验证；根规则仓库展示卡暂不切换，避免未实机验证版本进入目录热路径。
- Stable 仍不存在；未确认漫画/套图封面与真实视频播放前不得晋级 Stable。

### Test9 实机验收
1. 覆盖导入后在设置页确认 `Test 0.1.0-test.9 · Build 10109`。
2. 首页分别切“套图 / 漫画”，重点确认之前的大片空白封面是否恢复。
3. 视频详情先点 `▶️ 免嗅直连`，完成标准为出现真实码率、真实总时长且进度持续推进。
4. 免嗅失败时进入播放线路，依次测试 `免嗅 1 → Header 兼容 1 → 网页嗅探兜底`，记录哪一级首次成功。
5. 回归小说搜索/目录/长正文、漫画章节/正文、套图分页/附带视频、分类和 X5 验证。
6. 若封面仍失败，必须依据具体作品页面实际 style URL / Referer 继续修，不再恢复通用邻域猜图。

## 0.1.0-test.7 / Build 10107 — 2026-09-24

状态：**历史 Test；针对用户当前实机截图暴露的列表封面/重复卡、详情层级和视频 `0 kb/s / 00:00` 做专项修复，实机证明播放与部分封面仍未解决；无 Stable。**

### 当前实机问题与修改边界
- [实机确认] 套图列表出现多张空白封面，且“最新热门套图”等导航/聚合项被误识别为作品卡；视频列表还出现同标题同封面的重复项。
- [实机确认] 视频详情页只有封面、标题、类型和“播放 / 视频1 / 原站”三个弱层级入口，信息与主操作层级不足。
- [实机确认] 当前视频直链进入海阔播放器后出现约 `3 kb/s`、`00:00 / 00:00`，说明“页面已解析到媒体 URL”不等于“播放器交付链可用”。
- 本轮不改 Test6 已确认的正文作用域、漫画独立域、X5 会话模型和主/备用域容错；Test4 继续作为不可变 recovery seed。

### 列表 / 封面
- `firstImg()` 扩展支持 `data-original / data-src / data-lazy-src / data-url / data-bg / data-background / poster / src / srcset / CSS url(...)`，并先做 HTML/转义斜杠恢复。
- `parseCards()` 从旧版“锚点前 1000 + 后 2600 字符”的大范围上下文收紧为“当前锚点自身优先 + 小邻域兜底”，降低上一张/下一张卡片标题与封面串绑。
- 增加 `title + image` 视觉签名去重，解决不同 URL 指向同一展示卡造成的重复项。
- 对无图片且标题明显属于“最新/热门/更多/全部/分类”等导航语义的条目不再建立作品卡，避免导航项混进三列内容网格。

### UI / 详情
- 首页首屏操作收敛为“搜索 / 分类 / 模特 / 设置”；“验证网站 / 发布页”下沉到设置页，减少内容首屏按钮堆叠。
- 视频详情把播放升级为独立主操作：已有媒体时显示 `▶ 立即播放`，多线路仅额外显示“线路 N”；无稳定直链才显示 `▶ 嗅探播放`。
- 详情首屏显示内容类型及媒体/章节/分页数量；简介改为独立信息块，不再与播放按钮平级堆叠。
- 小说/漫画保留章节/阅读主链，套图/自拍继续保留看图、附带视频和分页入口。

### 播放链
- 保留 Test6 `main-container`、quoted m3u8、`var domain + var videos` 的媒体提取契约，并优先使用结构化 `var videos` 候选。
- 新增播放器最终交付层：显式携带详情页 `Referer`、`Origin`、`User-Agent` 和可用 live Cookie；最终格式统一为 `url#isVideo=true#;{...}`，不再只在解析/预检层携带 Header。
- 视频详情已拿到直链时直接生成最终播放器 URL，点击不再二次打开播放页、重复请求同一详情页。
- 播放线路页仍保留 `video://详情页` 作为明确兜底，用于实机判断“直链 Header 交付问题”与“原站需要浏览器媒体提取”两类故障。

### 架构 / 发布
- Test7 不叠加 Test6 Runtime；仍从冻结 Test4 做一次确定性变换，并拆成 `runtime_base.js + runtime_pages.js` 两个按 Release 顺序加载的模块，Remote Manager 2.0.1 已确认按 `modules[]` 顺序 `require()` 后再做全局导出校验。
- 新 Shell：`xchina_remote_test_v7_b10107.txt`，规则 version `2026092401`；新 Bootstrap：`bootstrap_test_v7_b10107.js`，`minBuild=10107`。
- Test7 Release、Bootstrap、Shell 均使用 `asset-core-7f3@main`，不增加 `hiker-cloud` 正式运行依赖。
- 根规则仓库仍必须保持小黄书 `entryType=single`，不得恢复 Test6 已证实会把远程 channel metadata 带入规则仓库首页热路径的 `channel-group` 交付。

### 已完成门禁
- `runtime_base.js` 与 `runtime_pages.js` 本地 `node --check` 通过；GitHub 回读后 Base blob 与本地语法检查版本一致。
- Shell 外层 JSON、`pages` 内层 JSON 本地解析通过，包含 13 个页面路由。
- Release → 两个 Runtime 模块、Bootstrap → Release、Shell → Bootstrap 的路径/build/version 合同已建立。

### 本次实机验收
1. 覆盖导入 Test7，设置页确认 `0.1.0-test.7 / Build 10107`。
2. 首页分别切“套图/视频”：确认空白封面显著减少或消失，“最新热门套图”等导航项不再混入作品网格，截图中重复视频卡不再重复。
3. 打开同一个“憧憬下的性勾引”等视频详情：确认主操作变为 `▶ 立即播放` 或明确的 `▶ 嗅探播放`，详情信息层级正常。
4. 直链播放重点确认：码率不再停在极低值、总时长不再固定 `00:00`、进度能够持续推进；若仍失败，再测试“网页嗅探兜底”，并记录是直链失败还是兜底可播。
5. 回归小说长正文、漫画章节/图片、套图分页/附带视频、搜索、分类、模特关联作品和 X5 验证链。
6. 未完成上述实机验证前不得晋级 Stable。

## 0.1.0-test.6 / Build 10106 — 2026-09-15

状态：**历史 Test；隐藏正文规则已解码并完成本地合约 smoke，未完成本轮实机回归；无 Stable。**

### 规则仓库交付补充（2026-09-15）
- 首次把小黄书以 `channel-group + channelsPath` 直接加入根 `manifest.json` 后，用户实机出现“我的规则仓库”整页白屏/持续刷新；回退根 `manifest.json + manifest_meta.json` 到 20 项已知正常目录后立即恢复。
- 结合规则仓库 `hybridProgramData()` 当前实现确认：`entryType=channel-group` 或存在 `channelsPath` 时，首页构造程序数据会同步调用 `channelMeta()`；新程序一旦该远程版本元数据链路慢/失败，会把额外网络依赖带入首页热路径。
- 因此当前小黄书在根云仓目录改用**轻量单版本卡片**：`entryType=single`，直接指向 Test6 Shell，不在首页加载 `channels.json`；图标也改用仓库内现有通用图标，避免再引入目标站 favicon 外部请求。
- `apps/video/xchina/channels.json` 仍保留为程序内部版本元数据，不删除；等规则仓库后续把 channel metadata 改成详情页惰性加载或该链路完成专项实机验证后，再考虑恢复多版本卡。
- 这次目录修复不修改 Test6 Runtime/Bootstrap/Shell，不影响已冻结 Test1–Test5，也不晋级 Stable。

### 阅读源隐藏正文规则落地
- [附件源码确认] 已递归解开 `ruleContent.content` 的 Base64 包装，不再只根据表层目录规则猜正文：小说正文为 `.fiction-body@p@html`；自拍图片为 `.amateur-image@html`；漫画图片为 `.comic-img-box@html`；套图图片为 `.photo-image@html`；视频与套图视频从 `main-container` 读取。
- [附件源码确认] 套图视频优先识别 m3u8；否则读取 `var domain` + `var videos=[...]`，目录里的 `#video=N` 对应数组第 N 项。Test6 在海阔侧统一展示检测到的全部媒体线路。
- [附件源码确认] 漫画图片 Referer 使用漫画独立站，套图/自拍使用主站 Referer。Test6 延续此边界，并只从图片自身域读取可用 Cookie。
- [附件源码确认] 补回 Test4 分类表漏掉的小说 `tag-2` 路由。

### Parser / 会话加固
- 正文/图片不再从命中 class 后无限向后扫描整页，而是按 `fiction-body / amateur-image / comic-img-box / photo-image` 建立内容作用域，减少推荐区、页脚图、头像混入正文。
- 小说正文不再用“遇到第一个 `</div>` 就结束”的非嵌套正则，避免正文内部嵌套节点导致后半章丢失。
- 媒体解析限定 `main-container`，支持 quoted m3u8、`var domain`、`var videos` JSON 及 JSON 失败时的 URL 回退提取。
- 继承 Test5：主站/漫画验证使用 `x5://`；HTML 与图片请求实时读取对应域 `getCookie()`。
- 新增媒体直链 live Cookie：播放 URL 按媒体自身域读取 Cookie，同时继续携带原详情页 Referer 与 UA；不会把主站 Cookie 无条件发给第三方媒体域。
- Test6 仍以冻结 Test4 为唯一 seed 做一次确定性变换，不叠加 Test5 Runtime，Test1–Test5 均保持不可变。

### 本地门禁
- `node --check`：Test6 Runtime Bundle / Bootstrap 通过。
- 合成页面 smoke：小说嵌套正文可完整提取；漫画目标容器外图片不会混入；`var domain + var videos` 可生成多条 MP4；媒体域 live Cookie 能进入播放 Header。
- Shell 外层 JSON 与 `pages` 内层 JSON 解析通过，规则 version `2026091502`。
- Release/Test/Manifest/Channels JSON 结构检查通过。

### 实机验收
1. 覆盖导入 Test6，设置页确认 `0.1.0-test.6 / Build 10106`。
2. 主站需要验证时进入 X5，返回后确认 Cookie 状态与首页加载。
3. 小说：列表 → 目录 → 长正文，重点检查正文中部/后半段不再截断。
4. 漫画：列表 → 章节 → 图片，确认没有头像/推荐图混入且图片 Referer 正常。
5. 套图/自拍：分页图片数量与原站一致；有视频的套图同时检查 m3u8 / 多 MP4。
6. 视频：详情 → 直链播放；若仍失败，记录实际播放器报错与媒体域，继续按实机 Header 调整。
7. 搜索、分类、翻页、模特关联作品做回归；未完成实机核心链验证前不得晋级 Stable。

## 0.1.0-test.5 / Build 10105 — 2026-09-15

状态：**历史 Test；代码门禁与本地合约 smoke，未完成海阔实机验证；无 Stable。**

### X5 / Cookie 会话加固
- 保留 Test4 的小说、套图、漫画、视频、模特、搜索、分类、章节、图片和媒体 Parser，不改业务协议面。
- 主站与漫画站“浏览器验证”入口由 `web://` 改为 `x5://`，与项目已验证的 `getCookie()` 会话容器语义对齐。
- HTML 请求每次实时调用 `getCookie(url)` / `getCookie(origin)`，有 Cookie 时才附加 `Cookie` Header；不保存账号密码，不把 Cookie 明文写入 KV、文件、CHANGELOG 或日志。
- 图片请求按图片 URL 自身域名实时读取可用 Cookie，避免把主站会话无条件泄漏到第三方媒体域。
- 设置页仅显示“主站/漫画 Cookie 已读取或未读取”，不展示凭据内容。
- Cloudflare/验证页仍遵循：普通 fetch（现在自动带 live Cookie）→ 限次 WebView 兜底 → stale cache；验证页本身不写入正常 HTML 缓存。
- Test5 只以冻结 Test4 为唯一 seed 做一次确定性变换，不叠加 Test1→Test2→Test3 多层补丁链。

### Test5 实机验收
1. 覆盖导入后设置页显示 Test5 / Build 10105。
2. 打开“当前线路完成验证”应进入 X5；完成站点验证后返回设置页，主站 Cookie 状态应由“未读取”变为“已读取”（如果站点确实下发 Cookie）。
3. 刷新首页，确认无需重复验证即可读取列表；若仍失败，记录错误页/耗时，不把 403 当 Parser 空数据。
4. 漫画线路同样用 X5 验证，随后测试漫画列表 → 章节 → 图片。
5. 回归 Test4 全部核心链：小说目录/正文、套图分页/图片/附带视频、视频播放、搜索、分类、模特关联作品。
6. 未完成上述实机核心链验证前不得晋级 Stable。

## 0.1.0-test.4 / Build 10104 — 2026-09-13

状态：**历史 Test，代码门禁与本地合约 smoke test 已通过；未完成海阔实机验证。**

### 阅读源协议补齐
- [附件源码确认] 参考用户上传的 `✈️ 小黄书-夜明空` 阅读源（源内最后更新 2025-11-13），主站仍为 `https://xchina.co/`，发布页为 `https://xiaohuangshu.me`，漫画链独立使用 `https://litu100.xyz`。
- [附件源码确认] 阅读源在返回 `Just a moment` 时会清 Cookie、打开浏览器完成验证后再连接；Test4 因此保留 Test3 的普通 fetch → 限次 WebView 兜底，并在设置页提供主站/漫画线路浏览器验证入口。
- [附件源码确认] 搜索契约：小说 `/fictions/keyword-<key>/<page>.html`、套图 `/photos/keyword-<key>/<page>.html`、视频 `/videos/keyword-<key>/<page>.html`、漫画 `/comics/kk-<key>/<page>.html`。
- [附件源码确认] 列表封面不仅可能来自 `<img>`，还大量来自 `.img` 的 `style:url(...)`；Test4 的封面解析同时支持 CSS background 与 `data-original/data-src/src`。
- [附件源码确认] 小说目录主要位于 `.chapter-container`，漫画目录位于 `.chapters`；漫画正文图片位于 `.comic-img-box`，套图/自拍正文主要位于 `.photo-image/.amateur-image`。
- [附件源码确认] 视频与带视频套图既可能直接包含 m3u8，也可能使用 `var domain` + `var videos=[...]`；Test4 统一解析两种媒体形态并附带 Referer/UA。
- [附件源码确认] 发现页提供小说标签、漫画状态/地区、套图专辑/工作室/地区、视频系列等大量固定路由；Test4 按内容类型分组还原大部分当前路由，并保留 Test3 已有模特链。

### Test4 架构与交互
- Test4 改为**独立 Runtime**：不再启动时下载 Test1 再做字符串替换；Test1 / Test2 / Test3 全部保持不可变历史版本。
- 继续使用 `rule=&simple=true` 与 `xc_url / xc_path` 命名空间，避免中文规则名和海阔保留 `url` 参数事故回归。
- 保留 Test3 私有文件 HTML 缓存、最近成功线路、主域/备用域轮询、最多两条主站 WebView 与单条漫画 WebView 兜底。
- 首页主链调整为小说 / 套图 / 漫画 / 视频，可进入模特列表；分类页按阅读源分组展示，不再使用 Test1 的少量旧系列 ID。
- 小说详情自动区分“书籍目录页 / 章节正文页”；有章节时进入目录，无章节时直接阅读正文。
- 漫画详情自动区分“作品章节页 / 图片正文页”；章节正文使用独立漫画域名并支持相对/绝对图片地址。
- 套图不再复制阅读源的“视频模式”开关：图片阅读、分页和附带视频入口并存，更适合海阔原生交互。
- 新增独立章节页、阅读器页、播放页，同时继续保留原站网页兜底与验证入口。
- 新增设置页：显示当前线路、缓存状态、验证入口、数据清理和版本信息。

### 已完成门禁
- JS 语法、Runtime 装载、Shell JSON/Pages JSON、Release/Test/Manifest/Channels JSON 均通过。
- 列表、分类、搜索、详情、章节、图片、媒体 Parser 已有最小合约 smoke。
- Test4 未晋级 Stable，等待海阔实机验证。
