# 麻豆传媒 CHANGELOG

> 程序：麻豆传媒（`madou`）  
> 正式运行仓：`huoguotiankong/asset-core-7f3@main`  
> 源站：`https://madoup2.cc/`  
> 当前仅 Test 通道；播放、分类和 UI 未完成海阔实机闭环前禁止晋级 Stable。

## 2026-08-23 · 0.1.0-test.12 / Build 10112

### 本轮实机事实
- Test11 的详情页正常显示“纯免嗅 · HTTP/JS协议解析”，但用户点击播放后明确返回 **`MISS HTTP_ONLY` 等价结果：纯免嗅没有解析到真实媒体**。因此 Test11 不能作为“免嗅已完成”的版本。
- Test11 设置页在切换详情加载模式时直接报：`InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入`。
- 同一实机详情页同时显示“浏览记录写入失败时已自动跳过”，证明不是某个设置值太大，而是**规则私有 KV 整体已接近/达到上限**，任何新的小型 `setItem` 都可能失败。

### 1MB 存储根因修正
- Test2 以后虽然已禁止继续把完整 HTML 写入 KV，但历史版本遗留值仍可能占据规则私有存储；Test6 以后所谓 `clearItem` 清理不能再视为可靠恢复合同。
- 海阔当前文档提供规则私有文件 `saveFile / readFile / deleteFile`，因此 Test12 不再要求先“修好旧 KV”，而是让关键状态**迁出 KV**。
- 更关键的是 `remote_manager.js` 的 `saveState()` 本身也会 `setItem(hc_remote_state_...)`。如果 Test12 继续用 `minBuild=10112 → enforceMinimum → saveState`，可能在业务模块加载前再次被 1MB 拦截。

### Test12 存储救援架构
- 新增 `storage_rescue.js`，将以下关键状态迁移到规则私有文件：
  - 详情加载设置；
  - 免嗅开关；
  - 免嗅媒体缓存；
  - 免嗅诊断；
  - 本地收藏；
  - 浏览历史；
  - 分页模板。
- `C.fetchHtml()` 改为只使用当前运行内存，不再写诊断 KV。
- `C.pageUrl()` 覆盖掉 Test1 Core 中分页模板的未捕获 `setItem`。
- 收藏/历史第一次读取时允许从旧 `getItem` 数据尽量迁移到私有文件；迁移后以文件为主。
- Test10 分类索引/Feed 的旧缓存写入仍属于非关键缓存，失败只降级，不得再阻塞详情/设置/播放主链。

### Rescue Bootstrap
- Test12 Bootstrap **不调用 Remote Manager `load()`**，而是直接 `loadRelease(config, immutableDefaultRelease, false)`。
- `minBuild=0`，不触发 `enforceMinimum → saveState → setItem`。
- 这是专门针对“旧 KV 已经饱和”的救援自举方式；Test12 的检查/更新/回退入口明确提示通过“我的规则仓库”覆盖版本，不伪装 Remote State 仍可正常写入。
- 活动 Release 不再加载 Test11 模块，链路为：`Test1 Core → Test1 Runtime → Test10 Performance Runtime → Test12 Storage Rescue → Test12 No-Sniff Protocol → Test12 Detail/Settings`。

### Test12 严格纯免嗅强化
Test11 的 HTTP-only 通用扫描没有命中，Test12 增加更贴近常见中文 CMS 播放器的协议解析，但**仍保持默认不启动 WebView/video://**：
1. 显式识别 `player_aaaa` / `player_data` 配置；
2. 支持 `encrypt=1` 的 Percent 解码；
3. 支持 `encrypt=2` 的 Base64 → Percent 解码；
4. 提取 `parse / parse_api / parseApi / jx_url / jxUrl`；
5. 用解码后的播放参数构造解析器 URL，同时尝试原值/URL 编码值；
6. 继续跟踪 iframe/player/embed/API/script，但使用有限预算；
7. 继续支持 escaped unicode、`\\xNN`、Percent、Base64、Dean-Edwards P.A.C.K.E.R 静态解包；
8. HTTP 请求读取 status/header，增加 302 `Location` 媒体识别；
9. 即使 URL 没有 `.m3u8` 扩展，只要 `Content-Type` 是 HLS 或响应体以 `#EXTM3U` 开头，也按真实 HLS 交给播放器；
10. 命中真实媒体后继续携带 `UA + Referer + Origin + #isVideo=true#`，并用私有文件缓存 30 分钟。

### 可观测性
- “最近一次免嗅诊断”改写入 `madou_t12_play_diag.txt` 私有文件，因此即使旧 KV 仍满，也能可靠显示诊断。
- 诊断记录 HTTP stage/status/response length/content-type/candidate 类型及命中阶段；URL 中常见 token/sign/key 等值会裁剪/脱敏。
- 如果 Test12 仍 `MISS HTTP_ONLY`，用户只需在设置页长按/点击复制诊断；下一版直接据此收紧 `madoup2.cc` 当前真实 player API/参数，不再回到盲目 WebView 嗅探。

### 发布链
- 新 Release：`apps/video/madou/releases/0.1.0-test.12/release.json`
- 新 Bootstrap：`apps/video/madou/bootstrap_test_v12_b10112.js`
- 新 Shell：`apps/video/madou/madou_remote_test_v12_b10112.txt`，规则 version `2026082312`
- 新模块：`storage_rescue.js / nosniff_protocol.js / detail_settings.js`
- 新增跨程序事故文档：`docs/INCIDENT_PRIVATE_KV_SATURATION_AND_RESCUE_BOOTSTRAP_20260823.md`。
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 切 Test12；云仓 revision `202608231720`，itemCount 12。

### Test12 实机回归顺序
1. 先进入设置，反复切换“手动 / 自动标签 / 自动标签+推荐”，确认不再出现 1MB `setItem` 报错。
2. 返回详情，确认浏览历史/收藏能重新写入文件；如果旧 KV 仍满不应再影响这些主功能。
3. 保持“免嗅失败后允许兼容嗅探”关闭，播放同一影片；若成功，必须直接进入媒体播放器，不出现网页加载页。
4. 若仍失败，打开设置查看“最近一次免嗅诊断”，把完整诊断截图/复制文本回传。
5. 严格区分：**架构上 HTTP-only ≠ 已经命中站点专用免嗅**；只有实机拿到真实媒体并可播才算完成。

---

## 2026-08-23 · 0.1.0-test.11 / Build 10111

### 本轮目标
- 用户要求把“标签 / 相关推荐”从固定行为改为**全局可配置**，自己决定所有影片详情页是否自动加载。
- 用户要求播放从浏览器嗅探升级为**真正的免嗅主链**；不能再把 `video:// / webRule / WebView` 包装成“免嗅”。
- Test10 已建立 Seed-First 详情与分类缓存，本版必须保留其首屏性能，不允许为了研究播放器重新阻塞详情页。

### 详情扩展加载设置
新增全局设置 `madou_t11_detail_extra_mode`，提供三档：
1. `manual`：**手动加载（默认 / 最快）**。正常从列表进入详情时继续使用 Seed-First，首屏不请求完整详情；需要时点击“加载标签与相关推荐”。
2. `tags`：**自动加载标签**。进入详情时请求一次完整详情，只自动展示标签；相关推荐仍可手动展开。
3. `all`：**自动加载标签 + 相关推荐**。进入详情后自动请求并展示全部扩展信息。

实现边界：
- 详情扩展数据只保存为当前页面 `myVar` 中的小型 `DetailModel`，不持久化完整 HTML。
- 手动模式保持 Test10 的零网络详情首屏。
- 详情页底部新增“详情与播放设置”，设置页也可统一修改，不需要逐片设置。

### Test11 严格纯免嗅主链
新增 `MadouCore.resolveNoSniff(detailUrl)`，**默认播放路径不调用 WebView、`video://`、`webRule://` 或 `x5Rule://`**。

当前纯免嗅解析顺序：
1. HTTP 请求影片详情页，直接扫描 M3U8 / MP4、`file/src/source/playUrl/videoUrl`、`video/source` 等结构化媒体字段；
2. 静态解析详情源码中的 iframe / player / embed / playUrl 候选；
3. 仅通过 HTTP 跟随有限数量的 player 页面、候选 API 和播放器脚本；
4. 对源码执行静态字符串展开：escaped unicode / `\xNN`、percent 编码、Base64；
5. 增加常见 Dean-Edwards `P.A.C.K.E.R` 静态解包，不执行远端脚本；
6. 在展开结果中再次提取真实 M3U8 / MP4；
7. 命中后直接向海阔播放器交付：`media + User-Agent + Referer + Origin + #isVideo=true#`；
8. 真实媒体小型缓存 30 分钟，同一影片重复播放优先直接命中缓存。

### 兼容兜底原则
- 新设置 `madou_t11_play_sniff_fallback` 默认关闭。
- **关闭时**：纯 HTTP/JS 免嗅解析失败就明确提示失败，并记录最近一次解析诊断；绝不悄悄启动浏览器嗅探。
- **只有用户主动开启**“免嗅失败后允许兼容嗅探”时，纯免嗅失败才允许临时回退 `video://详情页`。
- 因当前开发环境无法直接访问 `madoup2.cc`，Test11 可以确认“默认路径架构上没有浏览器嗅探”，但**尚不能在没有手机实机结果的情况下宣称源站专用免嗅已经命中并可播**。必须以海阔实机播放结果为准。

### 可观测性
- 设置页显示“最近一次免嗅诊断”，记录各 HTTP 阶段拿到的响应长度、命中阶段或 `MISS HTTP_ONLY`，不保存 Cookie/Token/Authorization 等秘密。
- 若 Test11 纯免嗅未命中，下一版直接根据该诊断收紧 `madoup2.cc` 的真实 player API / 参数 / 解密协议，不再回到通用 WebView 嗅探试错。

### Release / 发布链
- 活动 Release 保留 Test10 性能基线，只增加一个聚焦覆盖层：
  - Test1 Core
  - Test1 Runtime
  - Test10 Performance Runtime
  - Test11 Detail Settings + No-Sniff
- 新 Release：`apps/video/madou/releases/0.1.0-test.11/release.json`
- 新 Bootstrap：`apps/video/madou/bootstrap_test_v11_b10111.js`，`minBuild=10111`
- 新 Shell：`apps/video/madou/madou_remote_test_v11_b10111.txt`，壳 version `2026082311`
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 已切 Test11。
- 云仓 revision：`202608231639`，`itemCount=12`。

### Test11 实机回归重点
1. 设置 → 详情加载模式：分别测试“手动 / 自动标签 / 自动标签+推荐”，确认行为与设置一致。
2. 手动模式从首页/分类点击影片，详情首屏仍应保持 Seed-First 快速打开。
3. 保持“免嗅失败后允许兼容嗅探”关闭，点立即播放；成功时必须直接进入真实媒体，不出现网页嗅探加载页。
4. 同一影片第二次播放应优先命中 30 分钟媒体缓存。
5. 若失败，进入设置截图“最近一次免嗅诊断”；下一版据此实现站点专用协议，不把失败自动掩盖成嗅探成功。
6. 继续回归分类原页切换、1MB 私有存储保护和 Primary Play 单媒体语义。

---

## 2026-08-23 · 0.1.0-test.10 / Build 10110
- 性能重构基线。Test9 实机仍确认详情与分类切换过慢，因此活动 Release 从 9 层补丁压缩成 `Core + Runtime + PerformanceRuntime`。
- 分类树首次成功解析后保存小型 `CategoryModel`；大分类切换和同组导航不再重复请求首页。
- 最近 6 个分类最多缓存 30 张 `CardModel`，TTL 20 分钟；回切优先本地渲染，首次未缓存分类只允许一次约 6.5 秒请求预算。
- 首页/分类/搜索/收藏/历史的影片卡传递 `u + title + raw cover + desc`，正常详情首屏 Seed-First、默认零网络。
- 标签与相关推荐改为按需加载；播放协议研究与详情首屏彻底隔离。
- 继续禁止持久化完整 HTML，保留 1MB 存储保护。

## 2026-08-23 · 0.1.0-test.9 / Build 10109
- Test8 的多跳 player 解析造成详情性能回归；Test9 删除详情首屏中的 iframe/player/nested-player 同步请求。
- 详情只允许一次详情请求；播放阶段才定向处理播放器。
- 当时使用 `webRule` 定向浏览器解析，明确记录为浏览器辅助路径，**不再冒充纯免嗅**。
- 实机随后确认详情与分类仍慢，促成 Test10 的性能 rebase。

## 2026-08-23 · 0.1.0-test.8 / Build 10108
- 删除源站固定宣传简介，详情 UI 收敛为 Hero、标题/时间、Primary Play、标签、推荐、收藏。
- 首次尝试结构化直连：详情 → iframe/player → nested player → M3U8/MP4，并做小型媒体缓存。
- 实机证明仍回落浏览器解析，而且同步多跳请求把详情页拖慢；此方案不作为后续性能基线。

## 2026-08-23 · 0.1.0-test.7 / Build 10107
- 实机确认 Test6 详情恢复且视频最终可播，但暴露两个已记录的跨程序回归：播放器被收藏/简介等详情动作污染；同级分类用 `hiker://page` 反复压栈。
- 同组小分类改为 `putMyVar → refreshPage(false)`，连续切换不增加返回栈。
- Primary Play 独立；收藏/简介/官网下沉，避免伪播放列表。
- 详情已知播放策略时点击播放不再重新加载 Bootstrap + 再请求同一详情。

## 2026-08-23 · 0.1.0-test.6 / Build 10106
- Test5 已确认分类层级能识别约 `14 个大分类 / 373 个小分类`，但详情仍受历史 raw-HTML KV 导致的 1MB 私有存储问题影响。
- 进入详情前精确清理 Test1/Test3 对当前 URL 遗留的 `madou_v1_ / madou_v2_` HTML key；历史/收藏写入失败不得再阻断详情和播放。
- 分类页改为“横向大类 + 当前大类三列小类”；搜索空关键词不再伪装首页结果。

## 2026-08-23 · 0.1.0-test.5 / Build 10105
- Test4 实机启动即 `SyntaxError: 在属性列表的后面缺少“}”`，因此 Test4 整体 quarantine。
- Test5 从最后一个实机可启动的 Test3 链恢复，重新实现大分类→小分类、普通 HTTP 详情和存储保护。
- Test4 永远不作为恢复基线。

## 2026-08-23 · 0.1.0-test.4 / Build 10104 · QUARANTINED
- 目标是修复分类层级、详情大型 WebView HTML 与 1MB 存储风险，并把内部页面直接切当前 Bootstrap。
- 实机启动即 JSEngine parse failure；冻结，不原地覆盖，不作为后续 recovery base。

## 2026-08-23 · 0.1.0-test.3 / Build 10103
- 修复中文规则名经过 `encodeURIComponent()` 写入 `rule=` 后海阔找不到小程序的问题；统一内部页 `rule=&simple=true` 继承当前规则上下文。
- 首页四个快捷入口改真实 SVG；过滤 `arrow/next/prev/menu` 等伪影片卡。
- 首次发现云仓 `manifest.json revision` 与 `manifest_meta.json revision` 未同步会导致手机继续看到旧 Test，后续列为发布硬门禁。

## 2026-08-23 · 0.1.0-test.2 / Build 10102
- Test1 首页将完整 HTML 写入 `setItem`，实机触发 `私有存储内容过大 (1MB)`。
- 修复为完整 HTML 只保存在运行内存；KV 只保存长度/时间戳等小状态，并清理 Test1 遗留 raw HTML key。

## 2026-08-23 · 0.1.0-test.1 / Build 10101
- 新建 `madou`，与 `mdai`（麻豆AI）隔离；正式源为 `asset-core-7f3@main`。
- 初始产品蓝图：Home / Category / Search / Detail / Playback / Local Favorites / History / Settings。
- 源站截图确认至少存在：首页、精选推荐、欧美P站、原创AV、网黄、乱伦、日韩、男同百合、Onlyfans、三级、猛料-SM、成人综艺、短视频、性爱教学、影视剧。
- 初版采用动态 DOM/JSON-LD 自适应解析；由于开发环境无法直接访问 `madoup2.cc`，真实 DOM、分页、搜索和播放协议从一开始就规定必须以用户海阔实机结果继续收紧。
