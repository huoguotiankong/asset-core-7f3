# 麻豆传媒 CHANGELOG

## 2026-08-23 · 0.1.0-test.9 / Build 10109

### 实机结果
- Test8 仍显示浏览器兼容解析，没有命中真实直链；因此 Test8 不能再称“免嗅已经完成”。
- Test8 新增的 `resolveDirectMedia()` 在详情渲染阶段同步追踪 player/iframe/nested-player，用户实机确认进入影片详情页也明显变慢。
- 当前最高优先级变成两件事：**先恢复详情首屏速度；再继续研究真正的 player API/解密链，而不是让协议研究阻塞页面。**

### Test8 性能回归根因
- Test8 在 `R.detail()` 内调用 `C.resolveDirectMedia(html,u)`。
- 该函数除当前详情 HTML 外，还可能同步请求最多 3 个 player 页面；每个 player 又可能继续请求最多 2 个 nested player，单请求 timeout 6.5 秒。
- 这些请求发生在 `setResult()` 之前，所以任何一个 player 慢/失败都会直接表现成“详情页长时间打不开”。
- 实机同时证明这条链仍未获得真实媒体，因此它既没有实现纯免嗅，又破坏了详情性能。

### Test9 修复
- 新增 `fast_detail_playback.js`，覆盖 Test8 详情实现。
- **详情首屏严格只允许一次详情请求**：
  - 不再请求 iframe/player；
  - 不再请求 nested player；
  - 不再在详情页等待多次 6.5 秒 timeout。
- 当前详情 HTML 若已经包含 `.m3u8/.mp4`、video/source、file/playUrl 等真实媒体字段，则直接交播放器。
- 当前 HTML 没有媒体时，只从字符串中提取最可能的 iframe/player URL，**不请求该 URL**，因此不会拖慢详情首屏。
- 点击“立即播放”后改为定向 `webRule://player@JS`：
  - 优先加载识别出的播放器页，而不是完整影片详情页；
  - 每 250ms 检查 `video.currentSrc / video.src / source[src]`；
  - 同时检查 `window._getUrls()` / `fy_bridge_app.getUrls()` 中的 `.m3u8/.mp4`；
  - 屏蔽 jpg/png/webp/svg、广告、analytics 等无关资源，缩短浏览器解析阶段。
- 详情继续保留 Test8 的 Hero、标题/日期、相关标签、相关推荐和本地收藏，不恢复固定宣传简介。
- Primary Play 仍只有一个，不重新加入第二“兼容播放”媒体项，避免播放器列表污染。

### 关于“免嗅”的新定义
- Test8 的命名过早：普通 fetch 跟 player 页面没有拿到真实媒体，最终仍依赖浏览器，因此不能称已经完成免嗅。
- Test9 的 `webRule` 属于**快速定向浏览器解析**，目标是先把实际等待显著缩短，不冒充纯 API 免嗅。
- 真正免嗅下一阶段必须取得至少一种稳定事实：
  1. player 页面真实媒体 API；或
  2. JS 加密/解密参数与算法；或
  3. 可由详情 ID 直接推导的媒体配置接口。
- 拿到其中之一后再把 WebRule 完全替换为 Request/Protocol → Player URL。

### 发布门禁
- `fast_detail_playback.js` 已执行 `node --check` 通过。
- `bootstrap_test_v9_b10109.js` 已执行 `node --check` 通过。
- Test9 使用新 Release、新 Bootstrap、新 Shell，`minBuild=10109`，不原地覆盖 Test8。
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 已切到 Test9；云仓 revision 同步为 `202608231558`，itemCount 保持 12，并保留 Pornhub Test3 等并行更新。
- 通用媒体事故文档追加“详情首屏禁止同步多跳媒体探测”和“webRule/video:// 不得冒充纯免嗅”的长期规则。

### Test9 回归重点
1. 首先比较进入同一影片详情的速度，必须明显快于 Test8；若仍慢，则只剩“详情本身单次 HTTP 请求/源站网络慢”这一层，下一步再做 DetailModel 小缓存或列表预传。
2. 点“立即播放”，观察 `快速解析 · 直接加载播放器页` 是否比 Test8 `video://详情页` 明显更快进入播放器。
3. 若播放器页快速解析仍慢/失败，下一轮不再继续加通用正则，而是新增一次性 player 网络诊断，抓真实 API/参数后做站点专用纯免嗅。
4. 继续回归同级分类原页切换、1MB 私有存储保护和播放器列表污染，禁止性能修复破坏已有恢复项。

## 2026-08-23 · 0.1.0-test.8 / Build 10108

### 实机结果
- Test7 已确认：影片详情正常、视频能够播放，同级分类压栈问题已进入新修复基线。
- 当前详情仍有两个体验问题：源站固定宣传简介占据大量空间；播放按钮显示“网页媒体自动提取”，首次播放仍有明显 WebView/嗅探等待。
- 用户明确要求：去掉简介信息、美化详情页，并优先改成“免嗅”直接播放。

### Test8 详情 UI
- 横向视频封面从小尺寸 `movie_1_left_pic` 改为全宽 `pic_1_full` Hero，标题与日期/时长独立排版，减少视觉拥挤。
- **完全移除 `x.desc` 简介区**，不再显示“麻豆传媒官网入口，汇聚华语原创成人剧情精品……”这类源站固定 SEO/宣传文案。
- 详情信息层收敛为：`Hero → 标题/日期时长 → Primary Play → 相关标签 → 相关推荐 → 本地收藏`。
- 播放仍保持唯一 Primary Play，避免再次把详情动作污染原生播放器列表。

### Test8 免嗅优先播放链
- 新增 `resolveDirectMedia()`，不再把 `video://` 作为第一选择。
- 结构化解析顺序：
  1. 当前详情 HTML 直接扫描 `.m3u8/.mp4`；
  2. 扫描 `file/src/source/videoUrl/video_url/playUrl/play_url/m3u8/url` 等播放器配置字段；
  3. 扫描 `<video>/<source>`；
  4. 尝试短 Base64 player config；
  5. 跟随详情页 `<iframe>` / player/embed URL，用详情页作为 Referer 请求播放器页面；
  6. 必要时再跟随一层 nested player/embed；
  7. 命中真实媒体后直接返回带 `User-Agent + Referer + #isVideo=true#` 的媒体地址。
- 解析成功后只把 `media URL / Referer / stage / timestamp` 这类小型结构写入 8 分钟缓存；不缓存 HTML，继续遵守 1MB 私有存储事故约束。
- 若结构化链仍拿不到真实媒体，才降级到 Test7 的 `video://` 兼容解析，并继续保留图片/广告拦截和 `cacheM3u8`。
- UI 会直接提示当前播放路径：
  - `免嗅直连 · 已解析真实媒体` = Test8 结构化直连已命中；
  - `兼容解析 · 当前页未命中免嗅直链` = 仍走 `video://`，下一轮需要针对真实 player 页面/接口继续收紧。

### 发布门禁
- `direct_playback_detail_ui.js` 已本地执行 `node --check` 通过。
- `bootstrap_test_v8_b10108.js` 已本地执行 `node --check` 通过。
- Test8 `release.json` 已完成 JSON 解析检查；Shell 规则 version 为 `2026082308`，Bootstrap `minBuild=10108`。
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 已切到 Test8；云仓 revision 为 `202608231530`，itemCount 保持 12，并保留同时存在的汤头条 Test19、Pornhub Test2 等其它程序当前状态。

### Test8 回归重点
1. 详情页确认源站固定简介已彻底消失，Hero/标题/时间/标签/推荐层级是否更舒服。
2. 看“立即播放”下面的状态文字：优先确认是否显示 `免嗅直连`。
3. 若显示 `免嗅直连`，比较首次播放进入播放器的速度；第二次打开同一影片还应命中 8 分钟媒体缓存。
4. 若仍显示 `兼容解析`，说明当前真实媒体只在更深 JS/API 运行链中出现，需要下一版针对具体 player HTML/接口做站点专用免嗅，而不是继续扩大通用嗅探。
5. 继续回归 Test7 的同级分类原页切换和播放器列表污染，禁止因详情重写退化。

## 2026-08-23 · 0.1.0-test.7 / Build 10107

### 实机结果
- Test6 已确认：影片详情能够正常打开，视频也能够播放，说明 1MB 私有存储恢复链和基础播放兜底已经有效。
- 播放启动仍偏慢。当前无直链详情会在点击“立即播放”后再次加载 Bootstrap/Release、再次请求整页详情，然后才回退 `video://详情页`，存在明显重复工作。
- 海阔原生播放器首屏出现“当前播放 + 立即播放 + 加入本地收藏 + 简介”等多余列表/操作面板。这与项目全局 `HIKER_APP_DEVELOPMENT_CAUTIONS.md` 的 Primary Play 约束冲突。
- 内容列表顶部的同组小分类仍通过新的 `hiker://page/madouList?...` 切换。连续点击多个分类后返回栈不断增长，需要多次返回才能回首页。这与 `INCIDENT_SAME_LEVEL_NAVIGATION_STACK_20260823.md` 的硬约束直接冲突。

### 根因与责任边界
- 这两个问题并不是“没记录”。项目文档此前已经明确规定：
  - 同级 Tab/筛选/分类切换必须优先 `putMyVar / setItem → refreshPage(false)`，不得重复新建同功能页面。
  - 详情 Primary Play 区只能放真实媒体任务；收藏、设置、简介等次操作必须与播放层分离，避免原生播放器把详情结果带成伪播放列表/操作面板。
- Test6 的 `R.list()` 仍沿用了 Test5 的 sibling `C.page('madouList',...)` 实现；Test6 的 `R.detail()` 又把“立即播放 / 本地收藏 / 简介 section”连续放在 `text_1` 结果层，属于实现违反现有规范，而不是规范缺失。

### Test7 修复
- 新增 `navigation_playback_patch.js`，保留 Test6 详情存储恢复和分类/搜索基线，只覆盖列表同级导航与详情播放交付。
- 内容页同组小分类：
  - 当前页面使用独立 state key 保存 active URL/name；
  - 点击 sibling chip 改为 `putMyVar → refreshPage(false)`；
  - 不再构造新的 `madouList` 页面；
  - 目标验收为连续切换 5 次后系统返回一次即可离开当前分类页。
- 播放启动：
  - 详情解析阶段已经发现直链时，播放按钮直接返回带 UA/Referer 的媒体 URL，不再点击后重新进入 Bootstrap 并二次请求详情。
  - 详情阶段没有发现直链时，按钮直接使用 `video://详情页`，同样取消“点击后先重载 Runtime + 再 fetch 一次详情”的冗余链。
  - `video://` 增加图片/广告资源 `blockRules`、`.m3u8/.mp4` `videoRules`、明显广告 `videoExcludeRules` 和 `cacheM3u8:true`，减少网页嗅探启动阶段的无关资源工作量。
- 播放 UI：
  - Primary Play 改为独立 `text_center_1`；
  - 播放项后立即插入分隔线；
  - 简介改用 `rich_text/long_text` 信息层；
  - 本地收藏与原站入口统一下沉到详情底部，不再和播放同层。
- 继续保留 Test6 的历史/收藏配额保护，并在 Test7 详情进入时继续精确清理当前 URL 的 Test1/Test3 legacy raw-HTML KV。

### 发布门禁
- `navigation_playback_patch.js` 已本地执行 `node --check` 通过。
- `bootstrap_test_v7_b10107.js` 已本地执行 `node --check` 通过。
- `release.json` 已执行 JSON 解析检查。
- 新 Shell 规则 version 为 `2026082307`，Bootstrap `minBuild=10107`。
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 已切到 Test7；云仓 revision 同步为 `202608231512`，itemCount 保持 12。

### Test7 回归重点
1. 打开详情后点击“立即播放”，比较 Test6 的 22% 等待阶段是否明显缩短。
2. 播放器首屏不应再把“本地收藏 / 简介”等详情动作混入播放主列表；若海阔系统自身仍保留单媒体的“列表”按钮，再单独区分系统固定 UI 与规则结果污染。
3. 进入任意小分类内容页，连续点击同组 5 个分类标签，再按一次系统返回；必须直接回到上一级，而不是逐个回退。
4. 详情、分类、搜索、收藏和播放均不得回归 Test6 已恢复的 1MB/空搜索问题。

## 2026-08-23 · 0.1.0-test.6 / Build 10106

### 实机结果
- Test5 已能正常启动，分类解析也已经确认识别出 `14 个大分类 / 373 个小分类`，说明 Test5 恢复链和新的层级解析基线有效。
- 影片详情仍报：`InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入`。
- 当前分类页虽然层级正确，但大分类逐条纵向排列、占屏过高，交互密度差；用户要求重新设计。
- 直接进入搜索页时标题显示 `搜索 ·` 且列表出现首页内容，属于空关键词被误当成成功搜索结果的产品逻辑错误。

### 详情 1MB 的进一步根因
- Test2/Test5 已经停止把新 HTML 写入 `setItem`，但 Test1/Test3 曾经对具体详情 URL 使用 `fetchHtml(detail,true)`，因此历史设备上可能仍残留：
  - `madou_v1_<hash(detailUrl)>`
  - `madou_v2_<hash(detailUrl)>`
  这类完整详情 HTML 私有 KV。
- Test5 详情改成 `fetchPlainHtml()` 后反而不会再经过 `clearHtmlCache(detailUrl)`，所以旧的大值可能一直留在私有存储里。
- 海阔这里表现为**整个私有存储接近/超过 1MB 后，后续任何新的 `setItem` 都可能失败**；真正触发崩溃的往往只是详情里一个很小的浏览历史写入，并不代表该次写入本身很大。

### Test6 修复
- 保留 Test5 作为恢复基线，不再回碰隔离的 Test4。
- 新增 `detail_search_ux_patch.js`：
  - 详情页进入后、执行任何持久写入前，按当前详情 URL 精确计算并清理 Test1/Test3 的 `madou_v1_ / madou_v2_` raw HTML key 与 `_ts` key。
  - 首页旧 raw HTML key 也在模块加载时再次清理。
  - `readList()` 增加异常大 JSON 门禁；超过约 260k 字符时直接丢弃损坏/异常列表，避免把旧污染继续带入新版本。
  - `writeList()` 把历史/收藏控制到更保守的约 180k 字符以内，并捕获 `setItem` 配额异常；历史/收藏属于辅助能力，写失败时**禁止再让影片详情整体崩溃**。
  - `addHistory()` 返回是否成功保存，详情页仍正常渲染与播放；即使私有 KV 尚未完全释放，也只降级浏览记录，不再阻断主任务。
- 分类页重新设计：
  - 顶部只保留一条横向大分类选择栏；
  - 当前大分类以 `●` 标识；
  - 下方只显示当前大类标题、子分类数量与三列小分类网格；
  - 不再把 14 个大分类做成 14 组纵向展开列表。
- 搜索页重新设计：
  - 无关键词时只显示明确的“搜索全站内容”入口和热门大分类，不再伪造首页搜索结果；
  - 输入关键词后通过 `madouSearch?kw=` 进入真实搜索状态；
  - 有关键词时显示“重新搜索 + 搜索结果”，结果仍使用双列影片卡。

### 发布门禁
- `detail_search_ux_patch.js` 已本地执行 `node --check` 通过。
- `bootstrap_test_v6_b10106.js` 已本地执行 `node --check` 通过。
- `release.json` 已执行 JSON 解析检查。
- 新 Shell 由脚本生成，规则 version 为 `2026082306`，所有内部页直接加载 Test6 Bootstrap。
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 切到 Test6；云仓 revision 同步为 `202608231449`，当前 itemCount 为 12（并保留同时间加入云仓的 Pornhub 条目，不覆盖其它程序更新）。

### 下一轮回归顺序
1. 同步目录后确认 `Test 0.1.0-test.6 · Build 10106`。
2. 打开影片详情，先确认不再出现 1MB `setItem` 崩溃。
3. 再检查新的分类中心是否为“横向大类 + 三列小类”。
4. 打开搜索页，空关键词时不应再出现影片列表；输入关键词后再确认搜索结果是否真正匹配。
5. 详情页恢复后再单独测试“立即播放”，若失败再进入真实播放器/HLS/JS 二次取源阶段。

## 2026-08-23 · 0.1.0-test.5 / Build 10105

### 实机故障
- Test4 覆盖导入后，小程序首页启动即报：`SyntaxError: 在属性列表的后面缺少“}”`，来源为 `eval code#1`，说明故障发生在活动远程模块加载/解析阶段，业务首页尚未真正执行。
- 该结果优先于仓库代码意图：Test4 虽然目标是修分类层级与详情 1MB 问题，但实机已经证明它本身不是可启动恢复基线。

### 恢复决策
- Test4 / Build10104 整体隔离，不再被 Test5 Release 引用，也不做同 URL 原地修补。
- Test5 直接从最后一个实机确认能启动的 Test3 链恢复：`Test1 Core + Test2 storagePatch + Test1 runtime + Test3 navigationUiPatch`，然后只叠加新的 `recovery_hierarchy_patch.js`。
- 新 Release 的 `previous` 明确指回 Test3，而不是 Test4；Bootstrap `minBuild=10105`，新 Shell/Bootstrap 文件名与规则 version 同步递增，强制越过设备上可能残留的 Test4 active state/cache。

### Test5 重建范围
- 重新实现“大分类 → 小分类”模型，继续以源站侧栏中的 `精选推荐 / 欧美P站 / 原创AV / 网黄 / 乱伦 / 日韩 / 男同百合 / Onlyfans / 三级 / 猛料-SM / 成人综艺 / 短视频 / 性爱教学 / 影视剧` 作为大类 marker，并按 DOM 顺序归组真实子链接。
- 详情与列表只使用普通 `fetch/request` 获取大页面，不再把 `fetchCodeByWebView` 返回的大型 HTML 当通用 Provider 回传路径。
- 完整 HTML 只保存在当前运行内存；私有 KV 只写 HTML 长度、时间戳等小诊断值。
- 历史/收藏增加 URL、标题、图片、描述长度限制，总 JSON 超过约 600KB 时主动减半，继续防止接近海阔 1MB `setItem` 上限。
- 详情播放先扫描 `.m3u8/.mp4`，没有结构化媒体时再返回 `video://详情页`，当前仍属于播放链待实机确认阶段。

### 发布门禁
- 新 `recovery_hierarchy_patch.js` 已在本地执行 `node --check` 通过。
- 新 `bootstrap_test_v5_b10105.js` 已执行 `node --check` 通过。
- Test5 Shell JSON 由脚本生成并重新 `JSON.parse` 校验通过。
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 全部切到 Test5；根目录 revision 为 `202608231436`，`itemCount=11`。

### 回归重点
1. 先只确认 Test5 能正常启动首页，不再出现 Test4 的 JSEngine SyntaxError。
2. 再测“全部分类”，确认呈现大类展开小类，而不是扁平长列表。
3. 再点任意影片进入二级详情，确认不再触发 1MB 私有存储错误。
4. 最后单独测试立即播放；播放失败再继续拆真实播放器/媒体协议，不把启动、分类、详情与播放混在一起。

## 2026-08-23 · 0.1.0-test.4 / Build 10104

### 实机故障
- Test3 已恢复分类页面进入能力，但影片二级详情仍再次报：`InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入`。
- 当前“全部分类”把网站导航全部拍平成一条长列表，用户实机明确指出源站真实产品结构是“多个大分类 → 每个大分类下大量小分类”，当前 UI/信息架构错误。

### 根因判断与修改边界
- Test2 只修了业务层 `fetchHtml()` 把完整 HTML 写进 `setItem` 的问题；Test3 的详情链仍允许 `fetchCodeByWebView()` 作为大页面 fallback。实机详情页再次触发同一 1MB 报错，说明不能再把大型渲染后 HTML 回传链当通用兜底。
- Test3 `menu()` 是扁平导航模型，适合抓链接但不适合作为用户分类目录；源站侧栏已经提供“大分类标题 + 子分类链接”的天然层级，需要独立 `CategoryGroupModel`。
- 内部页面此前仍通过 `$.require('madou')` 间接调用主模块。虽然 Test3 已修中文 `rule=` 路由，但升级后仍存在页面模块缓存/旧导出残留风险。本版把每个内部 page rule 改为直接加载当前 Bootstrap。

### Test4 修复
- 冻结 Test3，新建 `0.1.0-test.4 / Build10104`，不原地覆盖旧 Release。
- 新增 `hierarchy_detail_patch.js`：
  - `fetchPlainHtml()` 只使用普通 `fetch/request`，大页面不再走 `fetchCodeByWebView` HTML 回传。
  - `fetchHtml()` 仅保存在当前运行内存，只把 HTML 长度/时间戳等小诊断值写私有 KV。
  - 本地历史/收藏统一做字段裁剪、data URI 丢弃、条数/总 JSON 体积上限，避免其它异常数据再次把 `setItem` 推近 1MB。
- 新增 `categoryGroups()`：以当前首页/侧栏 DOM 中 `精选推荐 / 欧美P站 / 原创AV / 网黄 / 乱伦 / 日韩 / 男同百合 / Onlyfans / 三级 / 猛料-SM / 成人综艺 / 短视频 / 性爱教学 / 影视剧` 等大分类作为 group marker，按 DOM 顺序把真实子链接归入各组。
- “全部分类”重做为：
  - 分类中心摘要；
  - 首页/最新快捷入口；
  - 大分类原地展开/收起；
  - 展开后使用三列小分类入口；
  - 进入某小分类的内容页后，只显示同一大分类下的兄弟小分类横向快捷切换，不再把全站菜单混进内容页。
- 首页横向导航只展示大分类，不再显示大量小分类。
- 详情页使用普通请求解析；直连 HTML 无效时显示“网页媒体嗅探 / 原站详情”两个明确兜底，不再为了拿 DOM 触发大型 WebView HTML 返回。
- Test4 Shell 的首页、搜索、列表、分类、详情、收藏、历史、设置全部直接 `require(bootstrap_test_v4_b10104.js)` 后调用当前 `MadouBoot.module()`，减少旧 page module 命中的可能。

### 云仓库发布链
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 已全部切到 Test4。
- 根目录 revision 同步为 `202608231426`，`itemCount=11`；再次执行 `manifest.revision === manifest_meta.revision` 检查，避免上次“代码已升版但云仓仍显示旧 Test”的事故。

### 回归重点
1. “我的规则仓库”同步后必须显示 `Test 0.1.0-test.4 · Build 10104`。
2. 全部分类页应看到“大分类 → 展开后的多个小分类”，不能再是一条扁平长清单。
3. 打开“萝莉少女/精品推荐/欧美P站”等任意实际小分类，列表顶部只出现同组小分类。
4. 点击任意影片进入二级详情，不应再出现 1MB `setItem` 错误。
5. 详情成功后再测试“立即播放”；若失败，下一版只处理真实播放器/媒体源协议，不把详情存储问题和播放协议问题混在一起。

## 2026-08-23 · 0.1.0-test.3 / Build 10103

### 实机故障
- Test2 已能正常进入首页，但用户实机点击分类、影片卡/播放入口时弹出：`找不到“%E9%BA%BB%E8%B1%86%E4%BC%A0%E5%AA%92”这个小程序`。
- 首页四个快捷入口显示为海阔默认彩色圆形占位，缺少真实图标。
- 首页自适应卡片中还误识别出 `arrow` 等导航资源。
- Test3 代码、`test.json`、`channels.json` 和根 `manifest.json` 已更新后，用户实机“我的规则仓库”仍显示 Test2。

### 根因
- `MadouCore.page()` 把中文规则名 `麻豆传媒` 使用 `encodeURIComponent()` 后写进 `hiker://page/...?...&rule=`。目标海阔路由没有在规则名匹配前把该字段还原，直接把 `%E9...` 当规则名，因此二级页全部找不到当前小程序。
- 英文规则名样本不会暴露这个问题，中文规则必须按已验证的 MDAI 模式使用 `rule=&simple=true`，让二级页继承当前规则上下文。
- `icon_4` 没有设置图片时会渲染默认圆形占位；正式产品入口必须提供真实图标资源。
- 云仓库目录刷新另有独立发布合同：`manifest.json revision` 必须和 `manifest_meta.json revision` 同步变化。Test3 发布时根 `manifest.json` 已到 `202608231404`，但 `manifest_meta.json` 仍停在 `202608231342`，且 `itemCount` 仍为 10；规则仓库 freshness probe 因此没有检测到新目录，继续使用缓存中的 Test2。

### Test3 修复
- 冻结 Test2，不原地覆盖；新建 Test3 / Build10103。
- 内部 `hiker://page` 统一改为 `rule=&simple=true`，URL 参数继续单独编码。
- 首页搜索不再构造带编码中文规则名的 `hiker://search`，改为进入 `madouSearch` 内部页面。
- 新增搜索、分类、收藏、历史四枚独立 SVG 图标，快捷入口切到 `icon_small_4` 并显式传入 `img/pic_url`。
- `parseCards()` 增加导航伪卡过滤，排除 `arrow / next / prev / more / menu / home` 等明显非视频条目。
- 保留 Test2 的大 HTML 内存缓存修复；本次不扩大协议层和播放解析边界。
- 2026-08-23 14:11 将根 `manifest.json` 与 `manifest_meta.json` 同步提升到 revision `202608231411`，并把 `itemCount` 修正为 11，确保“同步目录”能够识别 Test3。

### 回归重点
- 在“我的规则仓库”点击“同步目录”后，麻豆传媒应显示 `Test 0.1.0-test.3 · Build 10103`。
- 点击“全部分类”和横向分类标签应不再出现编码规则名错误。
- 点击任意影片卡应进入详情页。
- 进入详情后再测试“立即播放”，区分路由问题与真实媒体解析问题。
- 首页四个快捷入口应显示真实线性 SVG 图标，不再是默认彩色圆圈。
- `arrow` 伪卡应从首页内容流消失。

## 2026-08-23 · 0.1.0-test.2 / Build 10102

### 实机故障
- Test1 首次启动直接报错：`InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入`。
- 用户实机截图优先于代码推测，确认故障发生在首页解析阶段，不是 DOM、分类或播放协议本身。

### 根因
- Test1 `MadouCore.fetchHtml()` 把完整网页 HTML 直接 `setItem(key, h)` 持久化。
- `madoup2.cc` 首页实际 HTML 体积超过海阔私有存储约 1MB 限制，因此在内容解析前就被 JSEngine 中止。
- 大型网页原文不属于适合 `setItem` 的状态数据；私有 KV 只应保存小型状态、索引、时间戳和诊断值。

### Test2 修复
- 冻结 Test1，不原地覆盖；新建 Test2 / Build10102。
- 新增 `storage_patch.js`，覆盖 `fetchHtml()`：完整 HTML 只保留当前运行内存，不再写入 `setItem`。
- 每次请求前清理同 URL 的旧 raw HTML 缓存槽；启动时额外清理 Test1 首页已知缓存 key。
- 仅持久化 HTML 长度、时间戳等很小的诊断值。
- `cachePrefix` 升为 `madou_v2_`，避免后续继续碰撞 Test1 HTML KV。
- 保留分页模板、收藏、历史等小型 KV，不扩大修改边界。
- 新 Bootstrap/Shell 指向 Test2，Remote Manager `minBuild` 提升到 10102。

### 回归重点
- Test2 首先验证“可以进入首页且不再弹 1MB 存储错误”。
- 启动恢复后，再继续观察真实首页 HTML、动态分类、内容卡、详情与播放链；本次不把尚未验证的解析功能误判为已完成。

## 2026-08-23 · 0.1.0-test.1 / Build 10101

### 基线
- 新建程序 ID：`madou`，与现有 `mdai`（麻豆AI）严格隔离。
- 正式开发/运行源：`huoguotiankong/asset-core-7f3@main`。
- 源站：`https://madoup2.cc/`。
- 当前只有 Test 通道；未实机确认前禁止晋级 Stable。

### Product Blueprint
- Home：搜索 / 全部分类 / 本地收藏 / 浏览历史 + 原站动态分类 + 双列精选内容。
- Category：动态分类与分页内容流。
- Search：优先解析原站真实 `<form>`，再使用常见搜索参数做有约束 fallback。
- Detail：封面、标题、日期/时长、简介、标签、相关推荐。
- Playback：优先从详情 HTML 精确抽取 `.m3u8/.mp4`；抽取不到时使用海阔官方 `video://网页` 自动提取能力。
- Local：本地收藏、浏览历史。
- Settings：站点状态和解析计数诊断，不记录 Cookie/Token 等敏感信息。

### 分类恢复
用户实机截图显示当前侧栏至少包含：
`首页 / 精选推荐 / 欧美P站 / 原创AV / 网黄 / 乱伦 / 日韩 / 男同百合 / Onlyfans / 三级 / 猛料-SM / 成人综艺 / 短视频 / 性爱教学 / 影视剧`。
Test1 不把这些当永久 URL 常量，而是从原站导航动态提取；截图分类仅作为 fallback 标签。

### UI 决策
- 不照搬原站右侧抽屉和广告堆叠，改成海阔原生快速入口 + 横向分类 + 双列内容卡。
- 默认过滤 banner/advert/ads/promo 等广告链接，不把广告数组伪装成主内容。
- 二级页使用 `hiker://page/...?...&simple=true`，不采用沉浸式标题栏叠加结构。
- 详情页只保留一个真实“立即播放”媒体动作，避免多个清晰度媒体 item 污染海阔播放列表语义。

### 发布/索引状态
- 已写入 `registry.json`，程序恢复链可从 registry 定位到 manifest/Test/channels/release/Bootstrap/Shell/CHANGELOG。
- 已写入根 `manifest.json`，在“我的规则仓库”同步后可作为 Test 通道发现和导入。
- Test1 仍属于实机验证候选，不等于 Stable；只有首页、分类、搜索、详情、图片和播放链通过海阔实机回归后才允许晋级。

### 已知待实机确认
- 当前开发环境无法直接访问 `madoup2.cc`，因此 Test1 采用动态 DOM/JSON-LD 自适应解析器；真实 DOM 选择器、分页格式、搜索参数和播放链必须以用户手机实机结果为准继续收紧。
- 若普通 HTTP 返回验证页，Provider 会尝试 `fetchCodeByWebView`；若仍失败需根据实机诊断继续处理反爬/Cookie。
- 播放链尚未确认是否存在加密 M3U8、自定义 Header、二次接口或 JS player 配置；不能仅凭“抽到 URL”认定播放完成。
