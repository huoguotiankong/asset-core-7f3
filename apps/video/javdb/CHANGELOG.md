# JavDB v3 Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Stable3.9.42 / Test3.9.43 / Local3.9.41 历史原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`3.9.42 / Build2026082301`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `3.9.42`，本轮不修改。
- Test：`3.9.45-test.1 / Build2026082601`，Shell `cloud/javdb/v3.9.45-test.1/javdb_v3.9.45_test1_localfirst_ui.txt`，rule version `2026082601`。
- Test 基础 Runtime：继续复用已完成基础实机验证的 `3.9.44-test.1 / Build2026082501` Local-First bundle，不重写 Stable 业务底层。
- Previous Test：`3.9.44-test.1 / Build2026082501`，2026-08-25 已确认 Local-First Runtime 基础实机正常，完整业务回归未全部完成。
- Local：`3.9.41-local / Build2026082103`，独立 Pure Local 分享/恢复链，本轮不修改。
- Shared JAV Playback Stable：`1.0.0-test.4`；当前 Test 继续使用 3.9.44 已本地化执行闭包，不移动共享 Stable 指针。

## 2026-08-26 · 3.9.45-test.1 / Build2026082601 · Product/UI 大改测试版

### 本轮目标与边界
开发文档在 2026-08-25 完成 UI/Product 规范大更新后，重新审计 JavDB v3。旧首页和多个核心页仍大量沿用：

```text
搜索框
→ 6 个顶栏 Tab
→ 多排 chip / blank_block
→ 同款三列 movie_3
```

这套结构功能完整但信息架构过于扁平：发现、精确筛选、排行榜、演员、账号、工具几种不同任务使用相似组件语法，用户感知上容易形成“按钮墙 + 海报墙”。本轮按新版指南做真实结构升级，而不是只改颜色、文案和间距。

为了避免 UI 大改牵连已稳定的协议和播放链，采用：

```text
Stable 3.9.42 业务基线
→ 3.9.44-test.1 Local-First 基础 Runtime（已基础实机验证）
→ 3.9.45-test.1 Product/UI Overlay
→ 当前页面 JDB 调用
```

Overlay 必须在基础 Runtime 的同一个 `core()` direct-eval 作用域中加载，继续遵守 JavDB 历史 `JDB 未定义` 事故后的硬约束。Stable3.9.42、Latest、账号/API、官方 VIP 播放、官方预览、官方磁链、Shared Playback、详情业务数据模型不在本轮底层重写范围。

### 首页：从“筛选控制墙”转成 Discovery
新版首页骨架：

```text
搜索
→ 发现 / 排行 / 分类 / 演员 / 我的 / 更多
→ 最近搜索（有记录才出现）
→ 发现模式：最新 / 推荐 / 可播放更新 / 磁链更新
→ 高频任务：可播放 / 有字幕 / 可下载 / 高级筛选
→ 继续浏览（有历史才出现）
→ 主内容 Feed
```

新增/调整：
- 将原“首页”导航语义改成“发现”，更贴近用户实际任务“今天看什么”。
- 搜索历史从仅写入本地变成可直接再次点击的 `flex_button` 快捷入口。
- “可播放 / 有字幕 / 可下载 / 高级筛选”不再与发现 Feed 的内容模式混成两排同权 chip，而是作为 4 个明确任务入口进入分类状态。
- 继续浏览只在本地有历史时出现，最多先展示 6 项，不长期占首屏。
- 主 Feed 仍继承 Stable API 和 `movie_3` 海报扫描效率。

### 分类：改成任务层级，不再堆平所有条件
新版骨架：

```text
内容类型
→ 资源条件
→ 高级筛选（折叠）
→ 排序
→ 影片结果
→ 官方资料库
```

调整：
- 一级类型：有码 / 无码 / 欧美 / FC2 / 动漫。
- 高频资源条件：全部 / 可播放 / 可下载 / 含字幕 / 单体影片 / 预览图 / 预览视频。
- 年份、月份、时长及服务端动态标签继续从 `/api/v2/tags` 获取，不手工冻结标签全集，但默认折叠，避免首屏被低频筛选淹没。
- 长标签继续使用 `scroll_button`，有意识允许系统溢出承担“更多选项”；不是把短列表误做溢出。
- 移除新版主链对旧 `$().select(...)` 排序构造的依赖，排序直接用同页 `scroll_button` 切换，状态变化后 `refreshPage(false)`，不压新页面栈。
- 保留“重置全部筛选”和官方系列 / 片商 / 导演资料库。

### 排行：从三列海报降密度为高 metadata 列表
旧版 TOP250、热播、普通榜主要仍使用三列 `movie_3`，虽然能看封面，但排名语义不强。

新版：
- TOP250、热播日/周/月榜、有码/无码/欧美/FC2 普通榜统一优先 `movie_1_vertical_pic`。
- TOP 序号直接并入标题，封面、标题和右侧 metadata 共同承担比较任务。
- 演员月榜也采用纵向图文列表，提高人物名、作品数与排名的可读性。
- 仍复用原 API：`/api/v1/movies/top`、`/api/v1/rankings/playback`、`/api/v1/rankings`、`/api/v1/rankings/actors`。

### 演员：推荐与分类分区，保留已验证映射修正
- 推荐页保持“新人 / 月排名 / Fanza(DMM) 推荐”三种业务来源，但用统一分区语言减少旧按钮感。
- 分类仍保留 有码女 / 有码男 / 无码 / 欧美女 / 欧美男。
- **继续保留 2026-08-23 实机确认的特殊映射：仅演员列表 UI tab2(无码) → API type3，UI tab3(欧美女) → API type2。影片分类与排行榜不做这项交换。**
- 不恢复之前已经删除的重复“搜索演员”行；全局搜索继续承担搜索入口。

### 我的：本地片库与网站账号明确分层
新版总览：

```text
总览 / 本地片库 / JavDB账号
→ 本地片库：影片收藏 / 演员收藏 / 浏览历史
→ JavDB账号身份
→ 想看 / 看过 / 账号收藏
→ 我的清单 / 近期浏览 / TOP250
```

未登录时只显示清楚的 JavDB 登录入口；登录后再展示网站账号能力，避免本地收藏与网站收藏混在同一视觉层级。

### 更多：把现有能力重新发现出来
旧“更多”里很多已经存在的 Custom 能力不够容易发现。本轮不新增未知协议，而是把已存在页面按任务重新编组：
- 内容与资料库：资讯 / 系列 / 片商 / 导演。
- 资源工具：磁力搜索 / 字幕搜索 / 网盘播放中心 / 内置磁力引擎 / 0cili。
- 体验：自定义搜索 / 封面布局 / 体验增强。
- 维护：设置 / API 状态 / 本地化诊断 / 隐私与本地数据。

功能增强的重点是**把已有能力放到正确的信息架构里并降低发现成本**，不是为数量继续新增重复入口。

### Settings 与视觉语法
- `blank_block` 在 Overlay 能接管的设置输出中改为 `line_blank`，减少为了间距制造的大块空白。
- 主强调色继续使用现有绿色体系，选中态只保留一个主要视觉信号，不再叠加额外圆点/星号。
- 首页、分类、排行、演员、我的、更多采用同一分区标题/分隔语法，但内容卡片根据任务切换，不要求所有页面都强行使用 `movie_3`。

### Local-First Overlay 交付链
本轮没有复制一份新的完整 148KB Runtime，而是在已验证基础 Runtime 上增加版本化薄层：

```text
3.9.45 Test Shell / rule 2026082601
→ b2026082601/local_entry.js
→ 确保 3.9.44 base local_bundle_builder.js
→ 确保 b2026082601/product_ui_patch.js
→ base builder.load()
→ base runtime.core(
     eval(Product/UI Overlay)
     → JDB.home/detail/... call
   )
```

关键不可变引用：
- Product/UI Overlay Ref：`d22dde89479cfff74b5b1f04dce55ef6068dcf70`
- Entry Ref：`45d0289bffb2f45e75110e87efdab383b7e77538`
- Shell Ref：`0777277e84e4da7a98ccacc20071e3b66a5d8528`
- 复用 Base Builder Ref：`2361fbbfc21c540191495b979b30a6828adfe9c1`
- 复用 Base Source Ref：`848879b13bc5de5510af68b6791cc94c6307f198`

正常运行仍以本地 Entry / Product UI / Base Runtime 为主；首次安装才下载固定不可变源码。旧 3.9.44 Test 和 Stable 3.9.42 均保持完整回退点。

### 静态门禁与当前验证状态
已完成：
- `product_ui_patch.js` → `node --check` 通过。
- `local_entry.js` → `node --check` 通过。
- 审计所有本轮 `lazyRule(function...)`；修掉一个曾引用外层 `setNav` helper 的闭包风险，关键点击回调只依赖海阔全局 API 与显式传参。
- Shell 外层规则 JSON 解析通过。
- Shell `pages` JSON 二次解析通过。
- 页面总数保持 35。
- rule version / Build 均为 `2026082601`。

**尚未完成的事实边界：3.9.45-test.1 还没有用户实机截图与完整业务回归，不能称 UI 已完成，也不能晋级 Stable。**

下一轮实机至少需截图：首页发现、分类默认/高级筛选展开、排行榜、演员推荐、我的、更多，以及影片详情；同时 smoke：首页切 Tab、分类连续切换 5 次后返回一次、搜索、详情、评论、登录状态、官方预览/VIP/磁链、更多播放。

### 详情页后续 UI Pass
当前影片详情的业务能力继续继承 Stable3.9.42，已有系列、片商、导演、发行商、演员、标签、相关清单、TA还出演过、相关推荐、官方与第三方资源链。本轮优先把一级信息架构重构后交给实机截图验证；**详情 Hero / Primary Action / metadata / 评论 / 推荐的第二轮视觉重构必须结合 3.9.45 实机截图继续做，不凭压缩 Core 猜最终显示比例。**

## 2026-08-25 · 3.9.44-test.1 / Build2026082501 · Stable-derived Local-First

### 迁移边界
本轮只迁移交付与启动架构，不主动改变 Stable3.9.42 的 API/签名/登录、首页/分类/搜索/详情/评论/账号、官方 VIP 播放/预览/磁链，以及 Shared JAV Playback Provider 业务逻辑。Stable3.9.42 / Latest 保持不变。

### 完整执行闭包
审计 Stable 后确认完整代码闭包包括：
- Core 压缩分片 7 个。
- Custom 压缩分片 9 个。
- Stable 补丁链 6 层 + 本轮 Local-First overlay。
- Shared JAV Playback `1.0.0-test.2` 基线 + `1.0.0-test.4` Stable overlay。
- 123AV 图标资产。

只本地化表层 Runtime 会让启动或“更多播放”点击阶段继续访问 GitHub，因此不算 Local-First 完成。

### 新运行链
```text
JavDB Test Shell / rule 2026082514
→ local_entry.js
→ local_bundle_builder.js
→ 首次安装 immutable source snapshot
→ runtime_bundle.js + bundle_meta.json + 123av.svg
→ 后续正常启动 $.require('javdb3')
→ require(file:// runtime_bundle.js)
→ JDBCLOUD
```

正常二次启动不加载远程 Runtime、Bootstrap、Remote Manager、远程 Patch 或 Shared Playback Manager/channels/SDK 代码。业务网站 API、图片、视频、WebView 网络请求仍按站点本身需要发生。

### Direct eval 作用域硬约束
JavDB 历史发生过 `JDB 未定义`。依赖 direct eval 创建 `var JDB` 时必须保持：

```text
eval(Core)
→ eval(Patches)
→ call
```

在同一函数作用域。禁止抽成 helper 后假定 `JDB` 跨函数仍可见；`node --check` 不能代替海阔 JSEngine 作用域验证。

### Shared JAV Playback 本地闭包
Stable 原链存在：

```text
fetch(manager.js)
→ manager fetch channels/SDK
→ Provider lazyRule/select 真正点击时再次 fetch manager
```

Test1 内嵌 Stable SDK，并把点击时重入改为：

```text
$.require('javdb3').playback()
```

123AV SVG 同步进入本地包；MissAV/Jable favicon 属于站点图片资源，不属于程序执行代码。

### Local-First 诊断
`javdb3LocalFirst` 页面可查看 version/build、bundle ready、immutable source ref、source 数量、Runtime 字节数、Shared Playback 本地化状态，并支持本地包重建与不含 Token/Cookie/Authorization 的诊断摘要复制。

### 静态门禁
- `final_local_patch.js / local_bundle_builder.js / local_entry.js` 语法门禁通过。
- Builder mock 可生成单 Runtime，生成结果通过语法检查。
- Shell 外层规则 JSON 与 `pages` JSON 解析通过。
- 规则页合计 35。
- rule version `2026082514` 与 Build `2026082501` 均在 32 位安全范围。

### 2026-08-25 20:40 · 用户实机 Local-First 基础验证
用户实机打开“JavDB · 本地化诊断”并明确反馈“正常”。截图直接证明：

```text
JavDB v3 3.9.44-test.1
Build 2026082501 · Native Local-First
本地 Runtime 已就绪
Source 848879b13bc5…
26 源
148084 bytes
```

因此当前可确认：
- Test Shell 已成功进入 `3.9.44-test.1 / Build2026082501`。
- 首次本地包构建已经成功完成。
- `bundle_meta` 与本地 Runtime 能被诊断页正常读取。
- 26 个源码/资产单元的 Local-First 安装闭包已落到设备。
- 用户当前实机未出现启动级 Runtime/JDB 错误，并判定当前状态正常。

本次截图**不能单独证明** MissAV/123AV/Jable、账号、评论、官方 VIP 播放等每条 action 都已逐项重新测试，因此不把这些未报告项目虚构为“全部通过”。当前状态记为：**Local-First Runtime / 基础实机验证通过，Stable 暂不自动晋级。**

### 后续完整回归（晋级 Stable 前）
仍建议在最终晋级前至少覆盖：首页 / 分类 / 演员 / 搜索 / 详情 / 评论 / 账号，以及官方 VIP/预览/磁链和“更多播放 → MissAV / 123AV / Jable”实际点击；如条件允许，再做首次安装后屏蔽 GitHub/CDN 的二次启动验证。

## 恢复与回退
- 正式恢复入口：Stable `3.9.42 / Build2026082301`。
- 当前 Product/UI Test：`3.9.45-test.1 / Build2026082601`，静态门禁完成，等待实机 UI/业务回归。
- Previous Test：`3.9.44-test.1 / Build2026082501`，Local-First Runtime 基础实机验证通过。
- Stable 当前不自动晋级；如 3.9.45 Test 发现 UI/业务回归，冻结 immutable release，从 Stable3.9.42 + 已验证 Local-First 基线新建更高 Test build 修复，不原地覆盖。
- `3.9.43-test.3` 保留为历史远程传输实现；`3.9.41-local` 独立保留。

## 历史
- 完整迁移前历史：`apps/video/javdb/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
