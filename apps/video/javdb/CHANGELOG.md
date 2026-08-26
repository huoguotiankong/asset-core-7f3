# JavDB v3 Changelog

> **程序级恢复入口。** 2026-08-25 Local-First 迁移前的 Stable 3.9.42 / Test 3.9.43 / Local 3.9.41 完整历史归档在 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell / Release / 源码 > 本文件 > registry / manifest > 历史归档。

## 当前活动边界

- Stable：`3.9.42 / Build2026082301`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `3.9.42`，本轮不修改。
- Test：`3.9.45-test.2 / Build2026082602`。
- Test Shell：`cloud/javdb/v3.9.45-test.2/javdb_v3.9.45_test2_localfirst_ui.txt`，rule version `2026082602`。
- Test Release：`apps/video/javdb/releases/3.9.45-test.2/release.json`。
- Test 基础 Runtime：继续复用已完成基础实机验证的 `3.9.44-test.1 / Build2026082501` Local-First bundle，不重写 Stable 协议/API/账号/播放底层。
- Previous UI Test：`3.9.45-test.1 / Build2026082601`，2026-08-26 已收到完整实机截图并完成第二阶段问题归因。
- Previous Local-First Test：`3.9.44-test.1 / Build2026082501`，2026-08-25 已确认本地 Runtime 基础实机正常（26 源 / 148084 bytes）。
- Local：`3.9.41-local / Build2026082103`，独立 Pure Local 线，本轮不修改。
- Shared JAV Playback Stable：`1.0.0-test.4`；Test2 继续使用 3.9.44 已本地化执行闭包，不移动共享 Stable 指针。

---

## 2026-08-26 · 3.9.45-test.2 / Build2026082602 · 实机截图驱动第二阶段 UI 优化

### 1. Test1 实机确认的问题

用户对 `3.9.45-test.1` 提供了首页、分类默认/高级展开、排行、演员、更多、演员详情、影片详情、评论、磁链、网盘调用和更多播放等完整实机截图。截图确认 Test1 已经比旧版更有结构，但仍存在以下产品/UI 问题：

1. **首页搜索输入框过高、过重。** 搜索属于独立任务，长期占用所有主页面首屏不划算。
2. **六个主导航在目标手机宽度上产生系统 `>` 溢出。** 这是短主导航，不应把 `>` 当成正式“更多”。
3. **分类高级筛选展开后一次性铺出所有动态标签组。** 年份、月份、主题、角色、服装、体型、行为、玩法、类别、时长等形成超长控制墙，用户必须滚过大量不相关筛选才能回到结果。
4. **演员月榜使用 `movie_1_vertical_pic` 不匹配信息模型。** 演员条目只有头像、姓名和很少 metadata，实机出现大面积横向/纵向空白；演员推荐页的三列人物卡反而更自然。
5. **继续浏览卡片出现无意义“浏览”叠层。** 历史状态不应污染作品封面。
6. **“更多”页虽然功能分组正确，但实机像一大片灰色禁用按钮矩阵。** 低频工具页需要更像设置/工具中心，而不是按钮墙。
7. **影片详情仍是旧式技术清单视觉。** `■ 快捷操作 / ■ 自定义搜索 / ■ JavDB账号 / ■ 影片信息 ...` 等黑方块标题和大量同权动作让详情页仍像调试面板。
8. **评论页仍暴露原始 API 味道。** 同一评分在标题和 metadata 重复，时间直接显示 `2026-06-23T10:21:58.000Z`。
9. **更多播放的大图标卡过度占首屏。** JavDB VIP / 官方预览 / MissAV / 123AV / Jable 每个占据大块高度，Provider 数量少但页面异常冗长。
10. 磁链页和长按调云盘弹层本轮截图显示主链可用，因此本轮不为视觉重构而重写磁链协议。

这些结论来自用户当前设备实机，不再把 Test1 的“静态设计意图”当成最终 UI 事实。

### 2. 搜索改成独立 Search Hub

Test2 从首页移除常驻大输入框，新增独立页面：

```text
主页面
→ 发现 / 排行 / 分类 / 演员 / 我的
→ 搜索（独立任务入口）

搜索中心
→ 搜索输入
→ 最近搜索
→ 清空搜索历史
→ 演员 / 系列 / 片商 / 导演资料入口
→ javdb3Search 结果页
```

新增页面：`javdb3SearchHub -> JDB.searchHub()`。

固定原则：
- 主页面只提供轻量“搜索”入口，不让输入框永久吞首屏。
- 最近搜索只保存在本机，支持一键再次搜索和清空。
- 原 `javdb3Search` 业务结果路由继续使用既有 Custom Search，不重写搜索 API。
- 搜索中心和搜索结果是独立任务边界，可以 push 新页面；主页面 Tab 仍只做同页状态切换。

### 3. 主导航从 6 项收敛到 5 项

Test1：

```text
发现 / 排行 / 分类 / 演员 / 我的 / 更多 / >
```

Test2：

```text
发现 / 排行 / 分类 / 演员 / 我的
```

“更多”不再占一级高频导航，改由“我的”底部的“更多功能”进入独立 `javdb3More` 页面。这样解决目标设备上的无意义 `>` 溢出，同时把低频工具从高频内容浏览导航中分离。

### 4. 分类高级筛选改成 Progressive Disclosure

保留原 JavDB 动态标签 API：

```text
GET /api/v2/tags?type={0..4}
```

以及原影片过滤合同：

```text
GET /api/v1/movies/tags
filter_by = {type}:t:{main}:{extra}:{year}:{duration}:{month}
```

但 Renderer 改成：

```text
高级筛选
→ 年份      已选0 · 2026 / 2025 / 2024 / ...
→ 月份      已选0 · 12 / 11 / 10 / ...
→ 主题      已选1 · 淫乱写真 / 出轨 / 强姦 / ...
→ 角色      已选0 · 高中女生 / 美少女 / ...
→ 服装      ...
→ 行为      ...

点击某一组
→ 只展开该组全部标签
```

状态：`jdb3_cat45_group`。

固定行为：
- 同一时间只展开一个动态标签组。
- 组收起时仍显示预览值和已选数量。
- 标签的单选/多选语义继续继承原已验证实现。
- 切换筛选仍使用 `refreshPage(false)`，不制造页面栈。
- 内容类型变化时清掉旧动态标签和当前展开组，避免跨类型残留。

### 5. 排行按信息模型区分影片与演员

影片排行榜继续使用 `movie_1_vertical_pic`：封面 + TOP + 标题 + 番号/日期/磁链等 metadata，实机证明这种密度对影片榜有效。

演员月榜改为 `movie_3` 三列头像：

```text
TOP 1 · 演员名
TOP 2 · 演员名
TOP 3 · 演员名
```

理由：演员月榜当前没有足够 metadata 支撑一列大卡，继续用纵向图文列表只会制造空白。**组件由信息模型决定，不因“都叫排行榜”就强制使用同一种卡片。**

### 6. 首页继续浏览与快速任务收敛

- 历史卡片不再注入 release/history overlay 字段，目标是去掉实机出现的无意义“浏览”封面文字。
- “可播放 / 有字幕 / 可下载 / 高级筛选”改为紧凑 chip，并直接把状态带入分类页。
- 发现 Feed 仍使用三列海报，继续优先扫描效率。

### 7. “更多”从灰色按钮墙改成独立低频工具页

新增：`javdb3More -> JDB.morePage()`。

结构：

```text
内容与资料库
→ 资讯
→ 系列
→ 片商
→ 导演

资源工具
→ 磁力搜索
→ 字幕搜索
→ 网盘播放
→ 内置磁力引擎
→ 0cili

体验
→ 自定义搜索 / 封面布局 / 体验增强

维护
→ 设置 / API状态 / 本地化诊断 / 隐私与本地数据
```

高信息入口使用完整行 + 描述；体验/维护才使用较紧凑组件。低频工具不再与主内容导航争一级位置。

同时新增：
- `javdb3MoreArticles -> JDB.moreArticlesPage()`
- `javdb3Settings -> JDB.settingsPage()`

### 8. 详情页第二阶段：先安全收敛旧视觉，不重写业务数据链

详情业务仍继承 Stable 3.9.42。本轮不猜压缩 Core 内部协议，也不重新请求一套详情 API。

Test2 尝试在原 `JDB.detail()` 最终 `setResult()` 前做 Test-only UI polish：
- 删除遗留 `blank_block`。
- 将 `■/▪/●` 开头的旧区块标题转换成统一分区标题。
- “本地影片”文案收敛为“本地收藏”。
- “更多播放”作为主要媒体动作提高视觉权重。
- 原动作 URL、演员、标签、系列、片商、导演、预览图、评论、磁链等业务合同不改变。

**安全边界：** 如果目标海阔版本不允许临时拦截/替换 `setResult`，Wrapper 会放弃拦截并调用原 Detail Renderer，不能为了 UI polish 让详情页直接失效。该能力必须用 Test2 实机验证后才能继续扩大。

### 9. 评论页第二阶段

同样使用 Test-only 安全结果收敛：
- 去旧黑方块分区标题。
- 评论标题已有 `★5` 时，metadata 不再重复 `· ★ 5`。
- ISO 时间 `2026-06-23T10:21:58.000Z` 缩短为 `2026-06-23`。
- 评论正文、点赞、看过状态、分页/下滑加载业务逻辑不重写。

### 10. 更多播放终于进入新版 Overlay

Test1 的 `local_entry.js` 对普通 `core()` 页面会执行 Product/UI Overlay，但：

```text
custom('javdb3ExternalPlay')
→ 直接 r.custom(key)
```

因此“更多播放”特殊 Custom 路由实际上绕开了 Test1 UI Overlay，这也是实机仍然显示旧大图标页面的重要原因。

Test2 Entry 修正为：

```text
custom('javdb3ExternalPlay')
→ core('JDB.externalPlayPage();')
```

这样 UI2 才能真正接管更多播放。

新版更多播放：
- JavDB VIP 与官方预览使用紧凑操作项。
- MissAV / 123AV / Jable 只显示真实 Provider 名称和播放动作，不再渲染占满大半屏的 favicon/logo 卡。
- Provider URL 继续调用已本地化 `JAVPlayback.providerUrl()`。
- JavDB 官方磁链独立放在第三方播放之后，不混入 Player Queue。

### 11. Local-First Test2 运行链

```text
3.9.45-test.2 Shell / rule 2026082602
→ b2026082602/local_entry.js
→ 3.9.44 已验证 Base Builder / Runtime
→ UI1: 3.9.45-test.1 Product/UI Overlay
→ UI2: 3.9.45-test.2 Screenshot Refinement Overlay
→ JDB page call
```

所有 UI Overlay 与最终调用仍在 Base Runtime `core()` 的同一个 JDB direct-eval 作用域执行，继续遵守历史 `JDB 未定义` 事故后的硬约束。

不可变引用：
- UI1 Ref：`d22dde89479cfff74b5b1f04dce55ef6068dcf70`
- UI2 Ref：`3f949f36dcaca5486e334f2958f4fdffe8eb6e4f`
- Entry Ref：`39561829090ff8978c1d3e5b483feefbb8786267`
- Shell Ref：`ab0f1e852e56e8fbdd2f1c1e430b4a04c04b2c28`
- Shell Blob：`e51f44b5ce2cb1e22caed27e31679b6334e52c76`
- Release commit：`e1d2dfba5b571450507c1fcbb16b48a4ade2c4b4`
- Base Builder Ref：`2361fbbfc21c540191495b979b30a6828adfe9c1`
- Base Source Ref：`848879b13bc5de5510af68b6791cc94c6307f198`

### 12. Test2 静态门禁

发布前已完成：
- `product_ui_patch2.js` → `node --check` 通过。
- `local_entry.js` → `node --check` 通过。
- Shell 外层 home_rule JSON 解析通过。
- Shell `pages` 二次 JSON 解析通过。
- 页面数由 35 增加到 **39**，新增 SearchHub / More / MoreArticles / Settings。
- rule version / Build 均为 `2026082602`。
- 原 `javdb3Search` 仍指向既有 Search Custom，不把首页 `searchFind` 和独立搜索结果页混淆。
- `javdb3ExternalPlay` 已明确走新版 `core()` 重入。

### 13. Test2 待实机验证

当前只能称：**代码与发布链完成，等待目标海阔实机 UI/交互回归。**

优先验证：
1. 主页面是否只显示五项导航且不再有无意义 `>`。
2. 搜索是否进入独立 Search Hub，历史搜索/清空/搜索结果是否正常。
3. 分类高级筛选是否只展开一个标签组，连续切 5 次筛选后返回一次是否直接退出分类任务。
4. 演员月榜是否变成紧凑三列人物卡。
5. 我的 → 更多功能是否能进入独立工具页。
6. 详情页是否正常；若 UI polish 不生效但业务仍正常，记录为海阔不允许结果拦截，不能强行继续此方案。
7. 评论日期/metadata 是否正常且下滑加载不受影响。
8. 更多播放是否变成紧凑 Provider，MissAV / 123AV / Jable 实际点击仍需分别验证。
9. 磁链和长按调用网盘不应因 UI2 回归。

Stable `3.9.42` / Latest 在 Test2 实机闭环前继续冻结。

---

## 2026-08-26 · 3.9.45-test.1 / Build2026082601 · 第一阶段 Product/UI 重构（已完成实机截图审计）

### 第一阶段目标

Test1 在 Stable 3.9.42 + 已验证 3.9.44 Local-First Runtime 上增加独立 Product/UI Overlay，首次系统性重构：发现、分类、排行、演员、我的、更多与设置。

主要变化：
- 首页由旧“按钮墙 + 海报墙”转向 Discovery。
- 分类建立“类型 → 资源条件 → 高级筛选 → 排序 → 结果”层级。
- 影片排行榜从三列海报改成高 metadata 图文列表。
- 演员推荐/分类重组，并继续保留已验证的特殊演员 API 映射。
- 本地片库与 JavDB 账号内容分层。
- 已有磁力/字幕/网盘/设置等功能重新编组。

2026-08-26 用户提供完整 Test1 实机截图。第一阶段核心业务/UI 可以实际渲染，但截图暴露了 Test2 章节记录的搜索、顶部溢出、筛选控制墙、演员榜卡片语义、详情/评论旧视觉和更多播放大图标等问题，因此 Test1 冻结为截图基线，不晋级 Stable。

关键引用：
- UI1 Ref：`d22dde89479cfff74b5b1f04dce55ef6068dcf70`
- Entry Ref：`45d0289bffb2f45e75110e87efdab383b7e77538`
- Shell Ref：`0777277e84e4da7a98ccacc20071e3b66a5d8528`
- Build / rule：`2026082601`

---

## 2026-08-25 · 3.9.44-test.1 / Build2026082501 · Stable-derived Local-First

### 迁移边界

本轮只迁移交付与启动架构，不主动改变 Stable 3.9.42 的 API/签名/登录、首页/分类/搜索/详情/评论/账号、官方 VIP 播放/预览/磁链，以及 Shared JAV Playback Provider 业务逻辑。

### 完整执行闭包

已审计并本地化：
- Core 压缩分片 7 个。
- Custom 压缩分片 9 个。
- Stable 补丁链 6 层 + Local-First overlay。
- Shared JAV Playback `1.0.0-test.2` 基线 + `1.0.0-test.4` Stable overlay。
- 123AV 图标资产。

### 新运行链

```text
JavDB Test Shell
→ local_entry.js
→ local_bundle_builder.js
→ 首次安装 immutable source snapshot
→ runtime_bundle.js + bundle_meta.json + 123av.svg
→ 后续正常启动 $.require('javdb3')
→ require(file:// runtime_bundle.js)
→ JDBCLOUD
```

正常二次启动不加载远程 Runtime、Bootstrap、Remote Manager、远程 Patch 或 Shared Playback Manager/channels/SDK 代码。业务网站 API、图片、视频、WebView 网络请求仍按站点需要发生。

### Direct eval 作用域硬约束

JavDB 历史发生过 `JDB 未定义`。依赖 direct eval 创建 `var JDB` 时必须保持：

```text
eval(Core)
→ eval(Patches)
→ call
```

在同一函数作用域。禁止抽成 helper 后假定 `JDB` 跨函数仍可见；`node --check` 不能替代海阔 JSEngine 作用域验证。

### Shared JAV Playback 本地闭包

原 Stable 第三方播放存在 Manager / channels / SDK 远程重入。3.9.44 将 Stable SDK 执行闭包内嵌到本地 Runtime，并把 Provider 点击回调重新进入：

```text
$.require('javdb3').playback()
```

123AV SVG 同步进入本地包；MissAV/Jable favicon 仅是站点图片资源，不属于程序执行代码。

### 2026-08-25 用户实机基础验证

用户实机“JavDB · 本地化诊断”确认：

```text
JavDB v3 3.9.44-test.1
Build 2026082501 · Native Local-First
本地 Runtime 已就绪
Source 848879b13bc5…
26 源
148084 bytes
```

因此已确认：
- Test Shell 成功进入 3.9.44。
- 首次本地包构建完成。
- 本地 Runtime / bundle_meta 可正常读取。
- 26 个源码/资产单元完整落地。
- 未出现启动级 Runtime/JDB 错误。

该截图不等于所有账号、评论、VIP/预览、MissAV/123AV/Jable 都重新逐项通过；这些仍按具体实机测试结果记录。

---

## 关键长期技术索引

### 演员类型映射

影片分类固定：`0=有码`、`1=无码`、`2=欧美`、`3=FC2`、`4=动漫`。

演员列表有独立实机校正：
- UI `无码`（tab2）→ API `type=3`。
- UI `欧美(女)`（tab3）→ API `type=2`。
- 该交换**只作用 `/api/v1/actors`**。
- 影片分类与排行榜不得跟着交换。

### 分类 API

- 动态标签：`GET /api/v2/tags?type={0..4}`。
- 影片筛选：`GET /api/v1/movies/tags`。
- `filter_by`：`{type}:t:{main}:{extra}:{year}:{duration}:{month}`。
- 高频基本条件：`p=可播放`、`m=可下载`、`c=含字幕`、`s=单体影片`、`i=预览图`、`v=预览视频`。
- 排序：`release/update/score/hit/want_watch_count/watched_count`。

### 排行 API

- 热播：`GET /api/v1/rankings/playback`。
- 普通影片榜：`GET /api/v1/rankings`。
- 演员榜：`GET /api/v1/rankings/actors`。
- TOP250：登录后 `GET /api/v1/movies/top`。

### 登录 / 官方资源

- Stable Core 使用 `jdsignature` 公共签名访问公共 API。
- 账号接口本地保存 JavDB Token，禁止在知识库写真实 Token/Cookie/Authorization。
- JavDB VIP 在线播放、官方预览、官方磁链与第三方 Provider 保持隔离；第三方失败不得污染官方链。

### Shared JAV Playback

当前 Shared Stable：`1.0.0-test.4`。

已知历史事实：
- 123AV / Jable 曾有明确实机播放通过记录。
- MissAV 历史经历多轮修复；后续若失败，只修 MissAV Provider，不无必要重写 123AV/Jable。
- Player Queue 只允许真实媒体线路，收藏/评论/设置/官网等非媒体动作不得混入。

---

## 恢复与回退

- 正式恢复入口：Stable `3.9.42 / Build2026082301`。
- 当前 UI Test：`3.9.45-test.2 / Build2026082602`，等待第二轮实机 UI/业务回归。
- Previous UI Test：`3.9.45-test.1 / Build2026082601`，已完成截图审计，冻结保留。
- Local-First 基础回退：`3.9.44-test.1 / Build2026082501`，基础实机验证通过。
- 历史远程传输实现：`3.9.43-test.3`。
- Pure Local：`3.9.41-local / Build2026082103`。
- Stable 当前不自动晋级；Test2 如发现回归，冻结 immutable release，再从 Stable 3.9.42 + 已验证 Local-First 基线建立更高 Test，不原地覆盖。

## 历史归档

- Local-First 迁移前完整历史：`apps/video/javdb/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
