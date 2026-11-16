# JavDB v3 Changelog

> 2026-09-22 起将此前长篇历史归档到 `CHANGELOG_PRE_3950_20260922.md`。当前文件保留活动基线、最近实机结论、当前修复与回退边界。事实优先级：用户当前实机 > 当前 Shell / Release / 源码 > 本文件 > registry/manifest > 历史归档。

## 2026-11-16 · 3.9.55-test.1 / Build2026111601 · 官方 APP 1.9.39.4 RC 分类兼容与新功能试验

### 恢复基线
- Stable **仍为 3.9.42 / Build2026082301**；latest 不变；活动 Test 指针仍为 3.9.50-test.1（有已记录的 VIP 首播回归）。
- 本次基于 Test54 实验代码派生，继承 Test51 原始 HLS 回退及 Test54 光鸭动态路由（两者仍含待实机确认项）；未修改 Stable 或活动 Test 指针。
- 新规则壳 **Test55 / 2026111601** 共 43 个页面（原 Test50 41 页 + 随机推荐、站内通知）。

### APK 静态证据
- 用户上传：jdb_official_v1.9.39.4_RC.apk，约 27 MB，Flutter AOT。
- ARM64 libapp.so 明确包含 API 路由：/api/v2/tags、/api/v1/movies/tags、/api/v1/advanced_search、/api/v1/movies/lucky、/api/v2/users/notifications、/api/v2/users/read_notifications、/api/v1/users/feedback。
- APK 中还找到 TodayFirstMagnets、YesterdayFirstMagnets、Ed2kFileLink、LuckyPage、FeedbackConversationPage、search_advanced_entry 等符号。仅说明客户端包含相应代码，不证明新 API 的完整参数、签名与服务端成功响应。
- 官方 1.9.39 公测记录列出组合高级搜索、随机推荐、通知/反馈对话、短评改版、今日/昨日首种、ED2K、后台模糊与原生离线下载增强；原生下载与任务界面模糊并非 JS 海阔规则可等价复制的能力。
- 分类接口仍见于新 APK；不能根据“部分分类失效”直接推断整个 API 删除。已有请求合同：/api/v2/tags?type=0..4，然后 /api/v1/movies/tags?filter_by={type}:t:{main}:{extra}:{year}:{duration}:{month}。

### 本轮修复（隔离在新 Test 代码）
- taxonomy_features_patch.js：将 tags 字典响应兼容为分组数组，校验分类 filter 结构；API 真正失败时尝试安全排序回退或缩窄复杂标签。**正确返回的空列表不自动切换到不相关分类。**
- 分类回退时在 UI 明示原因及请求参数；新增「重置复杂筛选」，用户自行决定是否清空年份/月份/时长/标签。
- 仅向 home / filters / category / moreHub5 / luckyPage / notificationsPage 注入补丁；不改 VIP 播放与磁链 Provider 链。
- 「手气不错」：接入 /api/v1/movies/lucky，只在检测到登录 token 时发起只读授权请求；支持换组、兼容多种列表响应结构。
- 「站内通知」：只读请求 /api/v2/users/notifications，不修改已读状态。
- **未宣称实现** Advanced Search 的新请求体/签名、ED2K 数据字段、客服反馈会话/图片上传、下载 MP4 或后台系统隐私模糊；均需进一步证据与实机验证。

### 发布形态与回归
- Entry：apps/video/javdb/releases/3.9.55-test.1/local_entry.js
- Patch：apps/video/javdb/releases/3.9.55-test.1/taxonomy_features_patch.js
- Release：apps/video/javdb/releases/3.9.55-test.1/release.json
- Shell：cloud/javdb/v3.9.55-test.1/javdb_v3.9.55_test1_apk1939.txt
- 导入：cloud/javdb/v3.9.55-test.1/import_apk1939.js，cloud_token.txt
- 已通过：JS 语法、Shell JSON 结构、43 页面、build=2026111601、模拟接口排序回退与 tags 字典归一、模拟新增页面渲染。
- 尚未通过：真实官方 API 的签名/返回、海阔 Android 实机加载、0～4 类完整筛选、VIP 起播与 Seek、磁链长按及光鸭。
- 回退：当前 Stable 3.9.42，Test55 只通过独立云口令交付，活动渠道元数据暂不切换。

---

## 2026-11-16 · 3.9.56-test.1 / Build2026111602 · 实机 JWTVerificationError 鉴权链修复

### 用户真实实机现象与已确认原因
- 用户在海阔 JAVDB v3 Test55 实机确认：首页推荐影片能加载；筛选与热播榜显示「JWTVerificationError: 请登录账号」，用户明确表示账号已登录。
- 本轮实际解压并检查了当前 Local-First 基座 v3.9.41 的 core_00..06（gzip+base64）。证实：JDB.apiSafe 使用 JDB.api，始终通过 buildApiHeaders('') 发送**无 authorization 的请求**；JDB.apiAuthSafe 另有原始 Token / Bearer 自动候选，且登录把 Token 写入 jdb3_token。
- 当前 APP 服务端对榜单/分类返回的 JWTVerificationError 与未带 Token 的请求合同吻合；但在没有抓取用户实机加密请求的情况下，不能断言“加上 Token 后一定成功”。必须区分「当前海阔进程保存 Token」与「官方 APP / 浏览器账号登录」。
- Test55 仅重试排序和筛选条件，未修 JWT 鉴权，故不是根因修复。

### Test56 实现
- 新增 apps/video/javdb/releases/3.9.56-test.1/auth_gate_patch.js，继承 Test55 分类协议补丁，API 层以本小程序 jdb3_token 为准。
- 已有 token 时，分类 /api/v1/movies/tags、标签 /api/v2/tags、排行 /api/v1/rankings、热播 /api/v1/rankings/playback、演员月榜 /api/v1/rankings/actors、TOP /api/v1/movies/top 优先通过现有 apiAuthSafe 自动尝试 raw/Bearer 认证，成功直接使用，失败才按预期考虑公开端点回退。
- 其它只读 GET 的 apiSafe 请求遇到 JWT 错误时仅进行一次授权重试；绝不在未验证身份时重写用户 token、删除账号或假装登录成功。
- 区分：小程序本地 token 不存在、带 token 后服务端仍拒绝、匿名端点成功、其它 HTTP/API 失败，消息清晰且不打印 token 内容。
- Test55 所覆盖的 home、filters、more、随机、通知继续兼容；新增加 rankHub5、rank、actorHub4 注入，避免只修首页/筛选而不修实际排行榜渲染函数。
- 「更多」增加「账号接口诊断」；新增 javdb3AuthDiag 独立页面。默认只显示本地 token 是否存在；点击具体项目再只读检测 /api/v1/users、/api/v1/movies/tags、/api/v1/rankings/playback。诊断不展示 Token/Cookie/个人账号资料，不改已读/收藏。
- 磁链长按、光鸭动态路由、VIP 播放继续继承 Test55，没有改动媒体 URL/headers 和播放逻辑。

### 安全及验证边界
- JS 语法、海阔 Shell JSON（44 个页面）和本地假服务端模拟通过：带 token 分类/热播优先授权且无匿名冗余请求，标签字典归一，失败分类、空 token 与 JWT 拒绝诊断。
- **真实海阔 Android 及官方服务器请求尚未验证**。继续保留 Stable 3.9.42、latest、现有活动 Test 3.9.50-test.1，不宣称修复完全通过，不提升 Stable。
- 当前实机下一步首先检测：新 Test56 首页、筛选基础类型、排行热播日/周/月；如果继续失败，打开「更多 → 账号接口诊断」，分别点账号资料、分类、热播。不要发送任何 Token/Cookie 原文或完整账号信息。
- 如「账号资料验证成功、分类/热播失败」：优先检查目标接口的新权限、签名与路由；如账号资料也 JWT 拒绝，先调查当前小程序保存的 token 与服务器有效性，而不是认定用户没有登录。

### 版本与交付
- Entry：apps/video/javdb/releases/3.9.56-test.1/local_entry.js
- AuthGate：apps/video/javdb/releases/3.9.56-test.1/auth_gate_patch.js
- Release：apps/video/javdb/releases/3.9.56-test.1/release.json
- Shell：cloud/javdb/v3.9.56-test.1/javdb_v3.9.56_test1_authfix.txt
- 云口令：cloud/javdb/v3.9.56-test.1/cloud_token.txt
- Restore：Stable 3.9.42 / Build2026082301，未触碰旧 Stable 与旧 Test 版本。

---

## 2026-11-16 · 3.9.57-test.1 / Build2026111603 · 预览图 JWT 和首页排版修复

### 用户 19:19 实机事实
- 首页推荐正常加载；导航处原有五个快捷 icon_5（筛选、排行、演员、收藏、更多）被 Test55 新增的 text_2「手气不错」大卡插在中间，导致 2+3 图标错位。
- 预览图页返回 JWTVerificationError: 请登录账号。用户已报告账号登录；但没有真实请求证据证明当前规则 Token 有效，不能断言服务器最终授权会通过。
- 复核当前 gzip Base Core 得出：JDB.preview() 通过 apiSafe('/api/v4/movies/'+id,{}) 请求影片预览；Test56 m.core 的鉴权补丁注入正则未列入 JDB.preview()，故该页面未使用 Test56 已实现的匿名 JWT → 授权重试。
- Test55 首页补丁把随机推荐 text_2 卡插入五个连续 icon_5 的中间，违反海阔连续组件分组布局语义。

### Test57 修改边界
- 新入口 apps/video/javdb/releases/3.9.57-test.1/local_entry.js 将 JDB.preview() 纳入现有 AuthGate 注入白名单。继续使用当前 API / 预览图片渲染 / pics:// 合同；匿名 JWT 时才依据规则已存 Token 授权重试，不修改登录态、签名或播放器。
- 新 UI 模块 apps/video/javdb/releases/3.9.57-test.1/home_layout_patch.js 只在首页第一页输出上修改布局：移除 Test55 大卡，将唯一「🎲 手气不错」改为资讯旁的横向 scroll_button；五个快捷 icon_5 连续一排，不引入新的二级页面栈。
- 搜索框文案简化、浅色背景；首页两列/三列封面 metadata 去掉 YYYY-MM-DD 日期重复叠加，保留编号、评分、收藏等原数据，不修改用户的封面布局选择。
- 继承 Test55 分类标签兼容 / Test56 JWT 鉴权与诊断，磁链、VIP、第三方播放、账号功能不变。
- 缓存根目录改为 b2026111603；Stable 3.9.42、Latest、当前活动 Test 3.9.50-test.1 不动。

### 代码验证
- 通过 JS 语法、Shell JSON 与 44 页检查，以及隔离假 API：/api/v4/movies/{id} 匿名 JWT → 授权重试成功 → 预览图片条目输出。
- 隔离 UI 模拟：五图标顺序完全恢复；唯一手气不错入口属于 scroll_button；电影封面描述去除日期但保留编号与评分。
- **仍待实机**：真实 API 账号授权、预览图图片展示、主页实际样式、VIP 播放与磁链长按回归。不能将静态模拟写成已实机通过。
- 如果 Test57 预览仍 JWT 拒绝，优先查 更多 → 账号接口诊断 是否通过，禁止要求用户反复退出登录或展示 Token 原文。

### 发布与回退
- Entry: apps/video/javdb/releases/3.9.57-test.1/local_entry.js
- UI: apps/video/javdb/releases/3.9.57-test.1/home_layout_patch.js
- Release: apps/video/javdb/releases/3.9.57-test.1/release.json
- Shell: cloud/javdb/v3.9.57-test.1/javdb_v3.9.57_test1_preview_home.txt
- Import: cloud/javdb/v3.9.57-test.1/import_preview_home.js
- 云口令: cloud/javdb/v3.9.57-test.1/cloud_token.txt
- Rollback: Stable 3.9.42 / Build2026082301

---

## 2026-11-16 · 3.9.58-test.1 / Build2026111604 · VIP/磁链 JWT 鉴权补丁链修复

### 用户真实实机反馈（19:36）
- JavDB VIP 播放页提示「影片信息加载失败 / JWTVerificationError: 请登录账号」。
- 磁链页提示「磁链加载失败 / 请登录账号」；用户前轮明确反馈账号已登录，不能直接令用户反复退出重登。
- 当前没有服务端授权抓包，所以不能将此阶段的 JS 修正视为「已通过官方服务器实际鉴权」。

### 当前源码确认的两条独立故障路径
1. Base JDB.playPage() 使用 JDB.apiSafe('/api/v4/movies/'+id) 读取影片信息；Test57 在 m.core 中动态注入鉴权补丁时遗漏 playPage，导致该页不走 Test56 的 JWT 失败后授权重试。
2. javdb3Magnets 使用独立 customData 的 JS 程序（原版约 6.1 KB），内部自行实现 api(path) 且 fetch 请求头只携带 jdsignature、UA、accept 等，没有 authorization。此前仅修改 JDB.apiSafe，根本无法作用到 custom 中自建的网络请求，因此仍返回「请登录账号」。

### Test58 维修方案
- 新建 apps/video/javdb/releases/3.9.58-test.1/auth_bridge_patch.js。修磁链时从 m.customData() 读取真实原始 custom 模块，仅精准替换本地 function api(path) 实现为 JDB.apiSafe(path,{})，由 Test56 AuthGate 在 JWT 失败时有限重试规则内保存 Token 的授权请求。其它磁链列表、质量排序、HD/4K/字幕、115/迅雷/PikPak/光鸭/123/复制菜单代码字节保持不变；找不到原结构时拒绝覆盖而不是猜测。
- 新建 Test58 local_entry.js：JDB.playPage() 纳入 AuthGate 动态注入；保留现有首页 Test57、分类 Test55、Token 网关 Test56，且独立缓存目录 b2026111604。
- **注意 HLS 回归**：Test51 的 restoreRaw 对「JDB.playPage();」做的是严格字符串匹配；前缀插入 eval(authPatch) 将绕过旧 hook。Test58 在 JDB.playPage 输出上重施等价 restoreVip，只删除直接 URL、JSON URL 数组中的 #noPre#，保留 headers、播放线路、M3U8、Seek 和长按行为，避免重现 Test50 0kb/s 首播问题。
- 新磁链 custom 程序经原 Core 作用域 eval 执行，因此可以访问 JDB.apiSafe / API 签名及授权客户端，而不是使用另一套未登录 API。
- 账号仍以本规则内的 jdb3_token 为准，修复不会自行清除/记录/上传用户 Token；保留账号接口诊断和旧 Stable 回退。

### 已验证与未验证
- 对真实压缩 customData 的 javdb3Magnets 源码抽取并比对：新旧区别仅限局部 API helper，原有资源列表/筛选/长按逻辑保持原文。
- Bridge JS 语法通过；Core/Custom 模块模拟通过：旧无 Token 请求 → 模拟 JWT → 现有授权重试 → 磁链数量显示正常；VIP 影片信息同样进入授权重试，播放行 URL 中 #noPre# 仍被移除，Referer/headers 保持不变。
- **尚未验证**：官方服务端当前是否接受本地 Token，JavDB VIP 会员权限及实际 HLS 起播/Seek，磁链数据与长按真实动作，以及 Android 海阔实机表现。不得将 Test58 标记为 Stable。
- 如果 Test58 仍提示 JWT，应先打开 更多 → 账号接口诊断，分别对比账号资料与分类/排行接口，再进一步调查服务端 Token 有效性和新的签名合同，不能无条件重试或要求用户反复登录。

### 交付路径
- Entry: apps/video/javdb/releases/3.9.58-test.1/local_entry.js
- AuthBridge: apps/video/javdb/releases/3.9.58-test.1/auth_bridge_patch.js
- Release: apps/video/javdb/releases/3.9.58-test.1/release.json
- Shell: cloud/javdb/v3.9.58-test.1/javdb_v3.9.58_test1_auth_bridge.txt
- Import: cloud/javdb/v3.9.58-test.1/import_vip_magnet_auth.js
- 云口令: cloud/javdb/v3.9.58-test.1/cloud_token.txt
- Stable: 3.9.42, Latest 和 Test 活动指针不变。

---

## 当前活动边界

- Stable：`3.9.42 / Build2026082301`，继续冻结，是业务稳定恢复基线。
- Latest：仍指向 Stable `3.9.42`，不修改。
- 云仓当前 Test 指针：`3.9.50-test.1 / Build2026092204`；该版已被当前实机证实存在 VIP 首播回归，暂不晋级。
- VIP 专项 Hotfix：`3.9.51-test.1 / Build2026092205`，通过云口令单独验证，暂不切云仓 Test 指针。
- 磁链菜单专项：`3.9.52-test.1 / Build2026092206` 已完成 6 项菜单收敛，但当前实机发现“光鸭”仍沿用旧复制磁链 handler。
- 光鸭固定页尝试：`3.9.53-test.1 / Build2026092207`，实机提示“找不到 magnet 这个页面”，证明当前已安装光鸭规则没有固定 `magnet` page；该方案停止继续沿用。
- 光鸭动态路由 Test：`3.9.54-test.1 / Build2026092208`，点击时读取已安装 `光鸭云盘 / 光鸭` 规则的真实 pages 并动态寻找磁力/云添加/离线入口；等待实机验证。
- Base Runtime：`3.9.44-test.1 / Build2026082501` Local-First。
- Product UI：`3.9.45-test.7 / Build2026082904`。
- Shared JAV Playback Test：`1.1.0-test.1 / Build11001`，第三方播放页按需加载。

---

## 2026-09-22 · 3.9.54-test.1 / Build2026092208 · 光鸭动态页面发现

### 当前实机事实

用户截图确认 Test53 点击 `光鸭` 后海阔提示：

```text
找不到“magnet”这个页面
```

这说明跨小程序跳转本身已经发生，但当前设备安装的光鸭规则并没有注册 `magnet` 这个 page path。因此此前根据旧版本实现写死：

```text
hiker://page/magnet?rule=光鸭云盘&realurl=<magnet>
```

在当前实际安装版本上无效。

### Test54 修复方式

不再猜固定 path。长按点击 `光鸭` 时动态执行：

1. 依次读取 `request('hiker://home@光鸭云盘')`、`request('hiker://home@光鸭')`。
2. 解析当前已安装规则真实 `home_rule` 和 `pages`。
3. 根据 page 的 `name / path / rule` 对 `磁力 / 云添加 / 离线 / magnet / cloudAdd / add / diaoyong / fxlj` 等入口打分。
4. 只跳转到当前规则确实存在的 page，不再写死不存在的 `magnet`。
5. 为兼容不同光鸭版本，同时传入：`realurl / url / add / magnet / input` 五种参数名，值均为完整磁链。
6. 跳转前尝试将磁链写入剪贴板，兼容仍从剪贴板读取链接的旧版光鸭。
7. 如果当前规则没有任何专用云添加 page，则退回该已安装规则的定向搜索入口，而不是报“页面不存在”。

### 不变边界

- 长按菜单继续固定：`115 → 迅雷 → PikPak → 光鸭 → 123 → 复制磁链`。
- 115 / 迅雷 / PikPak / 123 不改。
- `复制磁链` 仍只由最后一项负责。
- 磁链大小 / 高清 / 4K / 字幕 metadata 不改。
- VIP 播放继续继承 `3.9.51-test.1`，本轮完全不碰播放链。
- Stable `3.9.42`、Latest、云仓 Test 指针均不修改。

### 发布形态

- Entry：`apps/video/javdb/releases/3.9.54-test.1/local_entry.js`
- Release：`apps/video/javdb/releases/3.9.54-test.1/release.json`
- 云口令入口：`cloud/javdb/v3.9.54-test.1/import_guangya_dynamic.js`
- 云口令文本：`cloud/javdb/v3.9.54-test.1/cloud_token.txt`

### 实机验收

1. 点击 `光鸭` 不再出现“找不到 magnet 页面”。
2. 若当前光鸭规则含磁力/云添加/离线专页，应直接进入该真实页面。
3. 光鸭页面应拿到完整磁链并继续云添加/播放流程。
4. 若只能进入光鸭搜索页，说明当前安装版没有对外暴露云添加 page；届时需要读取该安装版光鸭规则源码，不能继续猜路由。

---

## 2026-09-22 · 3.9.53-test.1 / Build2026092207 · 光鸭固定 magnet 页尝试（实机证伪）

### 当前实机事实

Test52 中点击长按菜单的“光鸭”后，实际行为仍是复制磁链，并没有进入光鸭云盘播放。

Test53 因此不再复用旧 handler，改为固定：

```text
hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>
```

但当前实机明确返回：

```text
找不到“magnet”这个页面
```

结论：旧版本曾使用过的 `magnet` page 不能代表当前安装的光鸭规则。后续禁止继续写死该 path，改由 Test54 动态读取当前规则 pages。

---

## 2026-09-22 · 3.9.52-test.1 / Build2026092206 · 磁链长按菜单收敛

### 修改边界

本轮不再修改 VIP 播放链，只处理用户当前明确提出的磁链长按交互：

```text
115
→ 迅雷
→ PikPak
→ 光鸭
→ 123
→ 复制磁链
```

处理规则：

- 固定 `115` 为第一项。
- 保留基础 Runtime 已有的 迅雷 / PikPak / 光鸭 / 123 handler。
- 固定 `复制磁链` 为最后一项；基础菜单没有时使用 `copy://<magnet>` 兜底。
- 删除 `网盘播放中心` 及其它未指定长按项。
- 磁链大小 / 高清 / 4K / 字幕 metadata 继续继承 Test50/Test51，不改协议和显示逻辑。
- VIP 播放完全继承 `3.9.51-test.1`，避免把菜单验证和播放性能变量重新混在一起。

### 实机结果

- 菜单收敛方向保留。
- 当前实机发现 `光鸭` 的旧 handler 实际只是复制磁链，因此“保留旧 handler”的假设已证伪。

### 发布形态

- Entry：`apps/video/javdb/releases/3.9.52-test.1/local_entry.js`
- Release：`apps/video/javdb/releases/3.9.52-test.1/release.json`
- 云口令入口：`cloud/javdb/v3.9.52-test.1/import_magnetmenu.js`
- Stable `3.9.42`、Latest、云仓 Test 指针均未修改。

---

## 2026-09-22 · 3.9.51-test.1 / Build2026092205 · VIP 原始 HLS 隔离验证

### Test50 当前实机结论

用户截图确认：

- VIP 播放页进入很快，说明 Test49 以来的扁平 Local-First / 延迟第三方 Playback 架构有效。
- 但 `3.9.50-test.1` 点击开始播放后播放器可长期停在 `0 kb/s`，总时长保持 `00:00`，首次播放本身已经不能接受。
- 因此 `#noPre#` 在当前 JavDB VIP / 海阔播放器组合中不能继续作为默认方案；当前现象已经不是单纯 Seek 慢，而是播放器未稳定建立媒体时长/数据流。

### Test51 修改边界

本轮只做变量隔离，不再增加新的播放加速层：

```text
3.9.50 快速页面架构
→ VIP playPage 原结果
→ 仅移除 #noPre#
→ 不自动 cacheM3u8
→ 不 updateItem 自动换链
→ 原始 URL / headers 原样交给播放器
```

目标是同时保留：

1. Test49/Test50 已验证的快速进入播放页；
2. Test49 在自动换成本地索引前曾出现的快速首次起播；
3. 去掉 Test49 后台本地索引和 Test50 `#noPre#` 两个干扰变量。

### 发布形态

- Entry：`apps/video/javdb/releases/3.9.51-test.1/local_entry.js`
- Release：`apps/video/javdb/releases/3.9.51-test.1/release.json`
- 云口令使用 `cloud/javdb/v3.9.51-test.1/import_rawhls.js` 动态从 Test50 Shell 派生 Test51 导入规则。
- Stable 3.9.42 不动；当前云仓 Test 指针暂不切换，先等本机 A/B 结果。

### 下一步判定

- 如果 Test51 首播恢复快速，但 Seek 仍慢：后续直接分析 **原始 master/media playlist、目标 ts/m4s 分片、Header/Cookie/Referer、CDN 响应和播放器 Seek 子请求**，不再使用 `cacheM3u8` 或 `#noPre#` 猜测性优化。
- 如果 Test51 首播仍停在 `0 kb/s / 00:00`：说明问题已经不在这两个 Overlay，需要回到 Base VIP 线路解析/授权有效期本身检查。

---

## 2026-09-22 · 3.9.50-test.1 / Build2026092204 · VIP Live HLS No-Preload（当前实机证伪）

### 设计

- 移除 Test49 后台 `cacheM3u8` 预热与 `updateItem` 自动换本地索引。
- 默认 VIP HLS 增加 `#noPre#`，尝试避免海阔提前预解析时效媒体。
- 长按保留原始 VIP / 手动本地索引诊断入口。

### 实机结果

- 播放页进入继续很快。
- 首次播放出现长期 `0 kb/s / 00:00`，比 Test49 明显回归。
- 当前设备上 `#noPre#` 不适合作为 JavDB VIP 默认链，Test51 默认撤销。

---

## 2026-09-22 · 3.9.49-test.1 / Build2026092203 · Fast VIP / Warm Seek（自动换链已证伪）

- 播放页进入速度明显改善，扁平 Runtime 方向保留。
- 正常起播比 3.9.48 更快。
- 但后台 `cacheM3u8 → updateItem` 后，Seek 可长期卡死。
- 结论：对可能带签名/时效性的 HLS，禁止后台生成本地索引后自动替换正常线路。

---

## 2026-09-22 · 3.9.48-test.1 / Build2026092202 · Magnet Meta + VIP Seek 首轮

- 磁链大小/高清/字幕增强方向有效。
- 点击播放时同步 `cacheM3u8` 让拖动略快，但播放页进入和正式起播明显变慢。
- 结论：同步建立本地 m3u8 索引不能进入 VIP 起播热路径。

---

## 长期技术索引

### VIP 播放性能

- “页面进入、首次起播、Seek 恢复”必须分开测量。
- VIP 热路径禁止同步 `cacheM3u8`。
- 对带签名/时效媒体，禁止后台 `cacheM3u8` 后自动 `updateItem` 替换默认线路。
- `#noPre#` 已在当前设备出现 `0 kb/s / 00:00` 首播回归，禁止继续作为默认 JavDB VIP 策略，除非后续有新的实机证据。
- 下一阶段若原始 HLS 首播正常而 Seek 慢，排查顺序固定为：master playlist → media playlist → 目标分片 → Headers/Cookie/Referer → CDN 响应 → 播放器对子请求 Headers/Range/连接复用行为。
- 不再用更多缓存 Overlay 掩盖底层媒体链问题。

### 磁链

- 资源纯数字大小按 MB 解释并换算 G。
- 标题/对象 metadata 用于识别 HD/4K/字幕。
- 磁链长按固定 6 项顺序：`115 → 迅雷 → PikPak → 光鸭 → 123 → 复制磁链`。
- `115` 路由到 `115.简 / 115Offline?add=<magnet>`。
- `光鸭` 不允许再写死旧版 `magnet` page；当前策略是运行时读取已安装光鸭规则 pages 后动态选择真实磁力/云添加入口。
- `网盘播放中心` 不再进入磁链长按菜单；如未来仍需该页面，只保留独立页面入口，不抢长按主流程。

### 恢复与回退

- 正式恢复入口：Stable `3.9.42 / Build2026082301`。
- 光鸭动态调用专项：`3.9.54-test.1 / Build2026092208`，基于 Test52，只改光鸭路由发现，等待实机验证。
- Test53：固定 `magnet` page 已被当前实机证伪，不作为调用基线。
- Test52：菜单收敛有效但光鸭旧 handler 已证伪，不作为最终菜单基线。
- VIP 专项：`3.9.51-test.1 / Build2026092205`，只验证原始 VIP HLS，不晋级 Stable。
- Test50：播放页快但首播可 `0 kb/s / 00:00`，不作为恢复基线。
- Test49：播放页快但自动换本地索引后 Seek 可长期卡死，不作为恢复基线。
- Test48：Seek 略改善但进入/起播变慢，不作为恢复基线。
- Local-First 基础回退：`3.9.44-test.1 / Build2026082501`。
- Pure Local：`3.9.41-local / Build2026082103`。
- 旧完整历史：`CHANGELOG_PRE_3950_20260922.md`；更早历史见 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。
