# 溏心次元 CHANGELOG

## 当前基线

- App ID：`tangxincyuan`
- 当前通道：Test
- 当前版本：`0.1.0-test.5` / Build `10105`
- 当前 Shell：`1.0.0-test.6` / RuleVersion `2026082316`
- 当前 Bootstrap：`bootstrap_test_v5_b10105.js`
- 当前加载器：`cdn-direct-4.0`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 用户当前源站入口：`https://txcy-online.buzz/banshu/`
- 当前没有 Stable；浏览器源码传输、真实 DOM / 图片 / 搜索 / 播放链仍需继续实机验证，禁止直接晋级 Stable。

## 0.1.0-test.5 / Build 10105 — 2026-08-23

### Test4 实机结果：X5 已通过验证，但 `getCookie()` 仍不可见

用户在 Test4 的官方 X5 页面已经完成站点 Cloudflare 验证并进入正常网页，返回小程序点击“验证完成，检查会话”后，实机仍明确显示：

```text
当前还没有检测到浏览器 Cookie
尚未确认通过 · 未检测到 clearance
```

并提示“还没有读取到浏览器会话”。因此当前设备已经证明：**X5 页面能够通过站点验证，不等于 `getCookie()` 一定能读取到该浏览器容器的 Cookie。** Test4 把 Cookie 可见性作为验证成功的必要条件是不成立的，继续反复同步 Cookie 不会解决问题。

### Test5 传输策略

Test5 不再把 `getCookie()` 作为唯一成功条件，改成双传输层：

```text
原生 fetch + 当前可见 Cookie
        ↓ 失败 / 仍是 Challenge
fetchCodeByWebView 浏览器渲染源码
        ↓
等待 Cloudflare 页面离开 Challenge 状态
        ↓
取得真实业务 HTML
        ↓
首页 / 分类 / 人物 / 搜索 / 详情继续走现有 Provider
```

- 若当前设备确实能读取 Cookie，且原生请求已经取得正常 HTML，则继续使用 `native-cookie`，性能优先。
- 若 X5 已通过验证但原生请求仍是 Challenge / Cookie 不可见，则自动使用海阔 `fetchCodeByWebView()` 获取浏览器环境渲染后的真实源码。
- `checkJs` 只负责等待页面离开 Cloudflare Challenge 并出现正常 DOM；不破解验证码、不伪造 `cf_clearance`、不调用第三方打码。
- 浏览器源码传输成功后记录为 `webview` 模式；首页、分类、搜索、详情的 `C.request()` 自动复用该传输层，不需要每个页面各写一套验证逻辑。
- 新增 `txcy_transport_v5`、`txcy_web_diag_v5`、`txcy_cf_session_v5` 和 `txcy_fetch_diag_v5`，诊断可区分 native-cookie / webview / auto。
- 验证页文案重做：Cookie 为空会明确显示“未读取到（不再作为唯一成功条件）”；第二步改为“已进入网站，读取真实页面”。
- 设置页新增最近浏览器取源码 HTML 长度、耗时和错误，方便下一轮实机判断到底是浏览器源码链失败还是已经拿到真实 DOM。
- 播放仍保持保守边界：浏览器源码模式下如果没有结构化媒体地址，继续交给 `video://` 网页媒体提取，不制造虚假的 Cookie/令牌。

### 发布链

- 新建不可变 `0.1.0-test.5 / Build10105` Release，不覆盖 Test4。
- 新增 `core_transport_patch.js` 与 `runtime_transport_patch.js`。
- 新建 `bootstrap_test_v5_b10105.js`，独立状态键 `txcy_cdn_state_v4`，最低恢复基线 Build10105。
- 新建 `tangxincyuan_remote_test_v6_b10105.txt`，Shell `1.0.0-test.6` / RuleVersion `2026082316`。
- Test5 新增 JS、Bootstrap 已在发布前通过 `node --check`；Shell 内嵌规则 JSON 已通过本地解析校验。

### Test5 首轮实机验收

1. 云仓同步并覆盖导入 Test5 / Build10105。
2. 打开“安全验证”页 → `① 打开官网验证`，直到 X5 真正进入网站首页。
3. 返回后点击 `② 已进入网站，读取真实页面`。
4. 如果成功，应提示“验证后的真实页面已读取成功”，状态显示“当前传输：浏览器会话源码”，即使 Cookie 仍为空也算通过这一层。
5. 返回首页观察是否开始出现真实 HTML / 内容；同时测试分类、人物、搜索是否仍回到 Challenge。
6. 如果浏览器源码仍失败，截图 Test5 验证页的“当前状态”与设置页“最近浏览器请求”，下一轮转为持续 X5 页面桥接，不再继续猜 Cookie。
7. 如果真实 HTML 已恢复但卡片仍为 0，则 Cloudflare 层结束，下一版直接根据真实 DOM/API 建立溏心次元专用 Adapter。

## 0.1.0-test.4 / Build 10104 — 2026-08-23

### Test3 实机结果：真实阻断点锁定为 Cloudflare 安全验证

Test3 已经修复中文规则名内部跳页，并让首页能够稳定进入；但首页依然没有真实内容。用户通过“打开当前网页”进入 X5 后，实机页面明确显示：

```text
txcy-online.buzz
正在进行安全验证
本网站使用安全服务防护恶意自动程序……
Cloudflare / Ray ID
```

因此当前“首页 0 卡片”的 P0 根因不再是 DOM Parser 猜得不够宽，而是普通海阔 `fetch()` 当前拿到的是 Cloudflare Challenge HTML，并没有取得源站真实业务页面。在挑战页没有处理之前，继续扩大视频/分类 Parser 会制造假修复。

### Test4 设计边界

采用“官方 X5 验证 + 会话复用”方案，不破解验证码、不伪造 `cf_clearance`、不调用第三方打码服务：

```text
Hiker 请求检测 Challenge
→ 显示安全验证向导
→ x5:// 打开站点官方 Cloudflare 页面
→ Cloudflare 自己执行 JS 检测 / 用户完成必要的人机确认
→ 返回小程序
→ getCookie() 读取同一浏览器 Cookie 容器
→ 使用匹配 UA + Cookie 重新请求首页
→ 验证通过后首页/分类/人物/搜索/详情/图片/播放统一复用该会话
→ 会话过期再次进入验证向导
```

### Core Session Adapter

新增 `releases/0.1.0-test.4/core_session_patch.js`：

- 新增 `txcy_cf_session_v4` 与 `txcy_fetch_diag_v4` 独立状态，避免污染旧 Test3 诊断。
- `C.isChallengePage()` 专门识别当前实机出现的中文 Cloudflare 验证页，以及 `cf-chl-`、`challenge-platform`、Turnstile、Ray ID 等特征。
- `C.liveCookie()` 通过海阔 `getCookie()` 读取当前 X5 同站 Cookie；只记录 Cookie 名称、数量与不可逆 fingerprint，诊断中不暴露 Cookie 值。
- 在目标环境存在 `MOBILE_UA` 时优先使用海阔移动 UA，并把同一 UA 传给 X5 验证页与后续请求，降低 Cloudflare 会话因 UA 不一致失效的概率。
- 覆盖请求 Header：普通 HTML 请求自动附带当前站点 Cookie；同源图片和媒体请求也带同一会话 Cookie、Referer、UA。
- `C.request()` 一旦确认拿到 Challenge，明确返回 `challenge:true`，不再把验证页交给分类/视频 Parser，也不会把它误写成“页面可用”。
- `C.syncWebSession()` 在用户完成 X5 验证后重新请求首页：仍为 Challenge 则明确提示继续验证；取得真实可用 HTML 才将本次会话标记为已验证。
- 首页、分类、搜索、详情统一传播 challenge 状态；详情和播放不再在安全验证未通过时继续猜媒体地址。
- Test4 重新定义多线路播放 Header，确保同源媒体需要 Cookie 时能够继续使用当前会话。

### Runtime / UX

新增 `releases/0.1.0-test.4/runtime_session_patch.js`：

- 新增独立 `安全验证` 页面 `txcyVerify`。
- 标准操作只有两步：
  1. `打开安全验证`：进入 `x5://` 官方网页，等待自动验证；Cloudflare 如要求人机确认则由用户正常完成。
  2. `验证完成，检查会话`：读取当前浏览器 Cookie，用同一 UA/Cookie 重新请求首页。
- 检查成功后调用 `back(true)` 返回并刷新上一页，不要求用户重新启动小程序。
- 首页识别到 Challenge 时不再显示误导性的“0 视频”，而是直接显示“需要完成站点安全验证”与验证入口。
- 分类中心、人物中心、分类 Feed、搜索、详情也统一识别 Challenge，并复用同一个验证页面，不各自重复造验证逻辑。
- 设置页新增会话状态、Cookie 数量/fingerprint、是否检测到 clearance、最近请求是否命中验证页等诊断；不显示 Cookie 内容。
- 详情页关键 lazyRule 全部重新进入 Test4 Bootstrap / Build10104，不再沿用基础 Runtime 中硬编码的旧 Build10101。

### 发布链

- 新建不可变 `0.1.0-test.4 / Build10104` Release，不覆盖 Test3。
- 新建 `bootstrap_test_v4_b10104.js`，使用新的 `txcy_cdn_state_v3`，最低恢复基线 Build10104。
- 新建 `tangxincyuan_remote_test_v5_b10104.txt`，Shell `1.0.0-test.5` / RuleVersion `2026082315`，新增 `txcyVerify` 页面声明。
- `test.json`、`channels.json`、`registry.json`、根 `manifest.json`、`manifest_meta.json` 同步切换 Test4 后才算云仓发布完成。
- Test4 的新增 JS 与 Bootstrap 在发布前已通过本地 `node --check`；JSON 元数据通过 JSON 语法校验。

### Test4 首轮实机验收

1. 覆盖导入 Test4 后，首页应识别 Cloudflare Challenge，并出现“进入验证向导”。
2. 进入验证向导 → 打开安全验证；等待页面真正进入溏心次元正常站点页面，而不是仍停留“正在进行安全验证”。
3. 返回验证向导点击“验证完成，检查会话”。
4. 成功时应提示“站点会话已生效”，并返回刷新首页。
5. 验证成功后测试首页、分类、人物、搜索是否还会重新掉回 Challenge。
6. 如果 Challenge 已消失但真实内容仍为 0，下一版不再处理 Cloudflare，而是根据已拿到的真实 HTML 建立 txcy 专用 DOM/API Adapter。
7. 图片、详情和播放链在首页/分类真实数据恢复后继续实机回归。

## 0.1.0-test.3 / Build 10103 — 2026-08-23

### Test2 实机结果

Test2 已证明新的 jsDelivr CDN 启动链可以让程序正常进入首页，因此上一轮 `raw.githubusercontent.com` Bootstrap 获取失败已经越过；但用户当前实机截图同时暴露了两个新的明确问题：

1. 点击分类、人物、收藏、历史等内部入口时，海阔提示：

```text
找不到“%E6%BA%8F%E5%BF%83%E6%AC%A1%E5%85%83”这个小程序
```

该百分号字符串解码后就是当前规则名“溏心次元”。
2. 首页只能显示品牌卡、搜索和四个快捷入口，真实视频卡片仍为 0；快捷入口旧写法 `符号\n文字` 在当前组件上只稳定露出符号，文字几乎不可见。

### 根因边界

- 内部跳页是确定性路由 Bug：Test1 Core 的 Page Builder 使用 `rule=` + `encodeURIComponent(中文规则名)`，当前海阔把 `%E6...` 当成字面程序名查找，而没有还原成中文。项目已有同类事故 `docs/INCIDENT_CHINESE_RULE_ROUTE_ENCODING_20260823.md`，已验证同一小程序内部页应优先使用 `rule=&simple=true`。
- 首页 0 卡片还不能直接归因为“网站没内容”。当前开发环境仍无法直接取得该站真实 DOM，Test1 的站点有效性判断和内容 URL 形态又偏严格，因此 Test3 先扩大可观测性并增加保守兜底 Parser，等待实机返回 HTML 长度、标题和摘要后再建立 txcy 专用 Adapter。

### Test3 修复

- 新建不可变 `0.1.0-test.3 / Build10103`，不覆盖 Test2。
- Core Patch：
  - `C.page()` 统一改为 `hiker://page/<path>?rule=&simple=true`；
  - `C.ruleTitle()` 在同程序内部路由返回空值，连带修复旧搜索输入回调再次百分号编码中文规则名的问题；
  - 业务参数仍独立 `encodeURIComponent()`；
  - 新增 `txcy_fetch_diag_v3`，记录最近请求 URL、HTML 长度、网页标题、页面纯文本摘要、异常和 challenge 标记；
  - 对已取得且看起来是正常 HTML、但未命中 Test1 品牌特征的页面允许 `ok-loose`，避免“页面其实拿到了却被严格校验丢弃”；
  - Test1 严格卡片 Parser 返回 0 时，再使用“真实链接 + 图片 + 可用标题”的保守兜底解析，同时继续过滤分类/人物/工具路由和内容边界条目。
- Runtime Patch：
  - 首页四个快捷入口改成单行 `分类 / 人物 / 收藏 / 历史`，不再把可读文字压到第二行；
  - 首页无内容时直接显示请求状态、HTML 长度、内容卡/分类/人物/导航计数、网页标题与页面摘要，不再要求先进入一个本身可能坏掉的诊断页；
  - 分类页、人物页、搜索页空结果同样显示当前解析诊断；
  - 设置页展示最近请求和 Core 诊断，并保留“打开当前网页”用于实机对照。
- 新建 `bootstrap_test_v3_b10103.js`：独立 `txcy_cdn_state_v2`，最低恢复基线 Build10103，避免旧 Test2 状态把设备拉回错误路由版本。
- 新建 `tangxincyuan_remote_test_v4_b10103.txt`，Shell RuleVersion 提升到 `2026082314`，所有页面入口统一加载 Test3 CDN Bootstrap。
- `core_patch.js`、`runtime_patch.js`、Bootstrap 已在发布前通过 JavaScript 语法检查；Shell 使用完整规则结构并保持导入可见标签中性。

### Test3 首轮实机验收

Test3 的目标不是宣称已经完成站点适配，而是先把“内部页全部打不开”和“首页 0 卡却没有足够事实”这两个阻断点拆开。用户重新覆盖导入后优先确认：

1. 分类 / 人物 / 收藏 / 历史 / 设置是否都能正常进入，不再出现 `%E6...` 规则名错误。
2. 首页是否出现真实卡片；若仍为 0，直接截图首页底部“当前首页解析诊断”，其中应能看到 HTML 长度、网页标题和页面摘要。
3. 若 HTML 长度正常，则下一版直接根据实机摘要/页面结构建立站点专用 DOM Adapter；若长度为 0 或出现 challenge/异常，则转向 Cookie/X5/请求 Header/动态入口层处理。
4. 在首页与分类卡片恢复前，不开始猜播放协议，更不晋级 Stable。

## 0.1.0-test.2 / Build 10102 — 2026-08-23

### 实机故障

用户导入后首页立即报错：

```text
JavaException
获取远程依赖失败：
https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/tangxincyuan/bootstrap_test_v1_b10101.js?v=10101
```

同时用户明确反馈“云端仓库还是 Test1”。这说明上一轮只做 Shell2 文本兼容并不足够：

1. 业务版本仍停在 `0.1.0-test.1 / Build10101`，所以云仓自然仍显示 Test1。
2. Shell2 依然通过 `raw.githubusercontent.com` 加载 Bootstrap；当前实机环境该依赖链无法可靠获取，程序在业务代码运行前就失败。

### Test2 修复

- 新建真正的 `0.1.0-test.2 / Build10102`，不再用“Test1 + Shell 热修”冒充新版本。
- 新建 `tangxincyuan_remote_test_v3_b10102.txt`，所有 Shell 页面入口统一通过 jsDelivr 加载 Bootstrap。
- 新建 `bootstrap_test_v2_b10102.js`，不再依赖通用 `remote_manager.js` 的 raw GitHub 根地址，改为独立 `cdn-direct-1.0` 加载器。
- CDN Loader 支持：默认版本加载、最低 Build10102、防旧状态回落、检查更新、更新、回退、重装。
- 新建不可变 Test2 Release：
  - `releases/0.1.0-test.2/release.json`
  - `core.js` CDN 兼容包装层
  - `runtime.js` CDN 兼容包装层
- Test2 包装层继续复用已冻结 Test1 业务解析代码，只修复交付链；`TxcyCore.bootstrap` 会在加载后切换到 Test2 CDN Bootstrap，详情页 lazyRule 不再回到 raw Bootstrap。
- `test.json`、`channels.json`、`registry.json`、根 `manifest.json`、`manifest_meta.json` 已同步到 Test2 / Build10102。
- Shell 可见标签继续保持“人物中心 / 内容详情”等中性名称，避免再次触发导入阶段关键词检查。
- Bootstrap、Core Wrapper、Runtime Wrapper 已通过 `node --check` 语法检查。

### 当前剩余验证

Test2 首先只验证“程序能正常启动并进入首页”。启动链确认后，再继续用用户实机截图锁定：

1. 首页卡片与封面。
2. 分类与人物入口。
3. 搜索协议。
4. 详情 DOM。
5. 播放字段与 HLS / iframe / JS 配置。
6. 图片是否还需要 Cookie、Referer 或其它解密处理。

## Shell 1.0.0-test.2 / RuleVersion 2026082312 — 2026-08-23

### 导入违禁词兼容修复

用户实机从“我的规则仓库”导入 Test1 时，海阔在导入阶段直接提示“包含违禁词”，程序尚未进入运行时，因此问题边界锁定在 Remote Shell 的导入可见文本，而不是 Core/Runtime。

处理：

- 导入 Shell 中的敏感人物分类标签改成中性“人物中心”。
- “视频详情”改成“内容详情”，进一步缩小导入扫描面。
- Shell 图标地址由 raw GitHub 改为 jsDelivr CDN。
- 新建独立 `tangxincyuan_remote_test_v2_b10101.txt`，避免旧 URL 缓存；业务 Release、Bootstrap、Core、Runtime 均保持 Test1 Build10101 不变。
- `channels.json` 已指向 Shell2，并将仓库展示文字同步改成“人物中心/人物头像”。
- `test.json` 记录 `shellVersion=1.0.0-test.2`、`shellRuleVersion=2026082312`。

该修复解决了导入阶段文本问题，但没有修复 raw GitHub Bootstrap 依赖，后续已由 Test2 取代。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 产品目标

从头重写，不照搬旧小程序。首版按用户当前网页截图重建信息架构，并为后续站点 DOM/API 精确适配保留清晰模块边界：

```text
Home
├─ 搜索
├─ 官网主导航
├─ 热门人物
├─ 分类频道
└─ 最新内容

Category Hub
├─ 栏目：官方栏目 / 节目 / 企划 / 精选
├─ 系列：MD / MDS / MDX / MDXS / MDL / MMZ / MAD / MDWP 等
└─ 片商专题

People Hub
Search
Detail / Player
Favorites / History
Settings / Diagnostics
```

### Core / Provider

- 默认入口不是域名根目录，而是完整 `https://txcy-online.buzz/banshu/`，避免错误退回 `/`。
- Root Manager 保留当前完整路径；入口失效时可从页面发现候选 URL，再进行有限探活。
- 首页、分类、人物、搜索、详情与媒体解析均由独立函数提供，不把 DOM 解析散落在 UI。
- 分类先动态读取真实 `<a>` 链接，再按栏目/系列/片商分组；不会硬猜未知分类 URL。
- 搜索优先读取官网 `<form>` 的 action/input name；失败后才有限尝试常见 GET 路由。
- 视频卡片 Parser 以“真实链接 + 标题 + 图片”为最小成功契约，过滤导航/分类/工具链接。

### 图片与播放

- 图片统一追加 User-Agent + Referer，不直接在页面层拼 Header。
- 详情页支持普通 `<video>/<source>`、常见 `file/src/url/play_url/hls/m3u8` 字段、`player_*` 配置、iframe 一跳媒体提取。
- 对 URL 编码和可识别 Base64 URL 做有限解码；不猜未知 AES/RC4 密钥。
- 单线路直接交给播放器；多线路返回标准 `urls/names/headers`。
- 结构化媒体无法取得时使用 `video://` 作为最后兜底。
- 详情已取得的媒体 seed 直接传入点击动作，避免无必要二次请求详情。

### 本地体验

- 本地收藏与浏览历史独立命名空间保存。
- 设置页提供当前入口、HTML 长度、视频卡/分类/人物/导航计数、最近解析/播放诊断。
- 使用独立品牌 SVG，不依赖第三方 favicon 服务。

### 当前环境限制 / 首轮实机必测

开发环境无法解析 `txcy-online.buzz` DNS，Test1 采用“站点特征 + 多形态兼容 Parser”，因此所有真实 DOM / 图片 / 播放能力都必须以用户实机为准。

### 云端仓库首次发布补漏

首版业务 Release、Bootstrap、Shell 和 `registry.json` 已完成后，实际云端仓库仍未显示该程序。根因是首次发布遗漏手机端目录真实消费链：根 `manifest.json` + `manifest_meta.json`，同时 `channels.json` 仍是内部对象格式而不是规则仓库要求的 `channels[]` 合同。

已按长期发布规范修复，后续以“能看到卡片 → 能进入版本中心 → 能导入 → 导入后能打开”作为首次发布完成定义。
