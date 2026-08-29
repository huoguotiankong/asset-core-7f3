# JavDB v3 Changelog

> **程序级恢复入口。** 2026-08-25 Local-First 迁移前的 Stable 3.9.42 / Test 3.9.43 / Local 3.9.41 完整历史归档在 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell / Release / 源码 > 本文件 > registry / manifest > 历史归档。

## 当前活动边界

- Stable：`3.9.42 / Build2026082301`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `3.9.42`，本轮不修改。
- Test：`3.9.45-test.5 / Build2026082902`。
- Test Shell：`cloud/javdb/v3.9.45-test.5/javdb_v3.9.45_test5_netflxcat.txt`，rule version `2026082902`。
- Test Release：`apps/video/javdb/releases/3.9.45-test.5/release.json`。
- Test 基础 Runtime：继续复用已完成基础实机验证的 `3.9.44-test.1 / Build2026082501` Local-First bundle，不重写 Stable 协议/API/账号/播放底层。
- Previous UI Test：`3.9.45-test.3 / Build2026082603`，实机确认整体视觉继续偏工具化、难用，已被 Clean UI Reset 取代。\n- Previous UI Test：`3.9.45-test.2 / Build2026082602`，2026-08-26 已收到第二轮实机截图并完成第三阶段问题归因。
- Previous UI Test：`3.9.45-test.1 / Build2026082601`，2026-08-26 已完成第一轮完整实机截图审计。
- Previous Local-First Test：`3.9.44-test.1 / Build2026082501`，2026-08-25 已确认本地 Runtime 基础实机正常（26 源 / 148084 bytes）。
- Local：`3.9.41-local / Build2026082103`，独立 Pure Local 线，本轮不修改。
- Shared JAV Playback Stable：`1.0.0-test.4`；Test3 继续使用 3.9.44 已本地化执行闭包，不移动共享 Stable 指针。

---

## 2026-08-29 · 3.9.45-test.5 / Build2026082902 · 标签语义、排行密度、独立搜索与原站数据补全

### 实机结论

Test4 的大方向已经回到网飞猫式 Catalog，但用户继续确认四类问题：

1. 标签分类语义错误：月份、时长被塞进“标签”分类；同时标签类别和标签值没有清楚分层。
2. 排行榜影片卡密度不合适，要求影片一行 2 部，演员一行 3 位。
3. 首页搜索应先进入独立搜索页面；搜索历史必须可删除。
4. UI 简化不能以删功能/删数据为代价，JavDB 原站资讯、系列、片商、导演、TOP250、热播、演员月榜以及账号想看/看过/收藏/清单/近期浏览都必须保留入口。

### Test5 修改

- 月份、时长从“标签”中拆出，成为独立筛选维度。
- 标签仅保留真实语义组：主题、角色、服装、体型、行为、玩法、类别等。
- 标签页先选“标签组”，下一行直接显示该组完整标签值；不再对标签数组做 slice 截断。
- 影片排行榜改用 movie_2 两列；演员月榜与演员页固定 movie_3 三列。
- 排行页恢复：TOP250 / 热播 / 有码 / 无码 / 欧美 / FC2 / 演员月榜。
- 首页搜索改为可点击假搜索框，进入 javdb3SearchHub 后才显示真正 input。
- SearchHub 保留最近搜索，可点击复搜；新增原生 select:// 管理弹窗，可删除单条或清空全部。
- SearchHub 同时恢复演员 / 系列 / 片商 / 导演资料入口。
- “更多”恢复：资讯、系列、片商、导演、账号中心、想看、看过、账号收藏、我的清单、近期浏览；磁力/字幕/网盘等增强工具继续保留。
- 主要任务继续使用 simple=true 独立页，保留系统标题栏和右上角原生页面菜单。

### 当前 Test5 不可变引用

- UI5c Ref：0b133bebaedaf2577f42ae035e4a2bda14cfb349
- Entry Ref：671c67e15376f7f8f5072f1acfc27062838a018e
- Shell Ref：67faf7302e8c5f080c6fc900abb1cc5ede17d214
- Shell Blob：ffc87bec8292f8306563f0e7b228f67d9d701bad
- Release commit：1de5c9440a0dc2c652626875be9a5c5ee75783e5

### 待实机验证

1. 筛选页月份/时长是否已从标签分类消失并各自独立。
2. 标签组与标签值是否对应正确，右侧原生 > 弹层不再丢类别。
3. 影片排行榜是否稳定两列，演员榜/演员页是否稳定三列。
4. 首页搜索是否只负责进入独立 SearchHub。
5. SearchHub 最近搜索的单条删除和清空全部是否可用。
6. 资讯 / 系列 / 片商 / 导演 / 账号数据入口是否都能打开。
7. 原详情、评论、磁链、VIP/预览、第三方播放不能因 UI5 回归。

Stable 3.9.42 / Latest 继续冻结。

---
## 2026-08-29 · 3.9.45-test.4 / Build2026082901 · Clean NetflxCat UI Reset

### 1. 实机结论：前三轮 UI 方向失败，停止继续叠补丁

用户对 Test1 → Test3 的连续实机结论是：**越来越不像正式版，也越来越不像网飞猫，视觉和交互都变得更工具化、更难用。**

当前问题不再归因于单个间距或按钮，而是 UI 架构本身：

- 首页被“发现/资源条件/继续浏览/更多说明”等产品说明和工具分组占据，内容进入首屏太慢。
- 顶部导航和独立工具入口层级反复变化，缺少网飞猫那种稳定的“快捷入口 → 搜索 → 内容频道 → 海报”骨架。
- 分类虽然改成独立页，但仍有“筛选说明/更多筛选/重置”等控制感，和样本的一行一个维度差距明显。
- Test1/Test2/Test3 通过 Overlay 叠加实现，每轮都继承前轮视觉结构，导致新版本很难真正回到干净状态。

因此 Test4 **不再加载 Test1/Test2/Test3 UI Overlay**，直接回到：

```text
Stable 3.9.42 业务合同
→ 已验证 3.9.44-test.1 Local-First Runtime
→ 单层 3.9.45-test.4 UI4
```

这是一次展示层重置，不重写 API、登录、详情数据、评论、磁链和第三方播放协议。

### 2. 首页按网飞猫骨架重做

Test4 首页顺序固定为：

```text
五个绿色圆形快捷入口
筛选 / 排行 / 演员 / 收藏 / 更多
↓
大搜索框
↓
推荐 / 最新 / 有码 / 无码 / 欧美 / FC2 / 动漫
↓
分区标题
↓
三列海报
```

原则：

- 首屏先给内容任务和海报，不先解释功能。
- 快捷入口使用统一绿色圆形 SVG 图标。
- 搜索框只保留“搜索”动作和简短 hint。
- 内容频道只用一排 `scroll_button`；长列表自然使用海阔原生 `>`。
- 首页不再常驻“资源条件 / 高级筛选 / 技术状态 / 诊断 / 更多功能”。
- 搜索结果仍进入独立 `javdb3Search` 页面，不把结果塞回首页。

### 3. 分类按“网飞猫式一行一个维度”重做

分类主页面只保留紧凑筛选行：

```text
有码 / 无码 / 欧美 / FC2 / 动漫
资源 / 可播放 / 可下载 / 字幕 / 单体 / 预览图 / ...
年份 / 2026 / 2025 / 2024 / ...
综合 / 最新 / 评分 / 热度 / 想看 / 看过
标签 / 主题 / 角色 / 服装 / 体型 / ...
↓
三列海报结果
```

取消：

- “分类 先选内容类型……”
- “资源条件 常用条件一屏直达”
- “排序 常用排序直接切换”
- 大面积灰色操作卡
- 主页面上的“重置全部筛选”说明区

筛选维度之间只用受控 `blank_block` 换行，不再用大片灰色分隔带。

### 4. 高级筛选：一次只编辑一个标签组

Test4 高级筛选继续是独立 `simple=true` 页面，但不再一次渲染所有组：

```text
主题 / 角色 / 服装 / 体型 / 行为 / 玩法 / 月份 / 时长 ...
↓
当前组完整标签横向行
↓
清空本组 / 完成筛选
```

- 主题/角色/服装等多选。
- 月份/时长单选。
- 完成后 `back(true)` 返回并刷新分类页。
- 长标签交给 `scroll_button` 原生溢出，不造一整屏箭头列表。

### 5. 排行 / 演员 / 收藏 / 更多独立页面

首页五个绿色入口分别进入独立 `simple=true` 页面：

- `javdb3Filters`
- `javdb3RankHub`
- `javdb3ActorHub`
- `javdb3LibraryHub`
- `javdb3MoreHub`

主首页不再承担“所有功能都在一个顶栏切换”的职责。

### 6. 更多播放保留图标，但不恢复大 Logo

MissAV / 123AV / Jable：

- 继续使用 Shared Playback `providers()` 的品牌图标。
- 使用紧凑 `icon_small_3`。
- 点击仍走 `providerUrl(providerId, code)`。
- 不改 Provider Resolver。

### 7. Test4 运行与不可变引用

- Base Builder Ref：`2361fbbfc21c540191495b979b30a6828adfe9c1`
- UI4 Ref：`2de45533bf09e7f7ec2effecfbaddeb92176bbec`
- UI Asset Ref：`52f6456329113bff98f5124a823009e023272fc2`
- Entry Ref：`b1372f8deed020a477d58633e86f95cb73ef859c`
- Shell Ref：`89d0f1ff09d6c963b6b650a62e3e4b9227f674e0`
- Shell Blob：`ee9841c730cb7cb1bc204fd77c5cffcf4d2d2ec9`
- Release commit：`808804abbb21e6eba8bb04142fd69e2c6d0d64ff`

静态门禁：

- UI4 通过 V8 `new Function` 语法解析。
- Local Entry 通过 V8 `new Function` 语法解析。
- Shell 外层 JSON / `pages` 二次 JSON 回读通过。
- 页面数 39。
- Shell 主模块明确引用 Test4 Entry。
- Test4 主模块不含 Test1/Test2/Test3 UI Overlay 引用。

### 8. 待实机验证

优先只看视觉和高频交互：

1. 首页五个绿色快捷入口是否接近网飞猫视觉。
2. 大搜索框和频道横排是否舒服。
3. 首页海报是否能尽快进入首屏。
4. 分类页 5 条筛选行是否像网飞猫，而不是工具页。
5. 分类长选项的 `>` 是否自然可用。
6. 高级筛选是否只显示一个组，返回后结果是否刷新。
7. 排行/演员/收藏/更多是否独立进入，不再污染首页。
8. 第三方播放图标和实际播放不能回归。

Stable `3.9.42` / Latest 继续冻结。

---

## 2026-08-26 · 3.9.45-test.3 / Build2026082603 · 网飞猫式独立分类页与播放源图标

### 1. Test2 实机确认的问题

用户对 `3.9.45-test.2` 提供搜索中心、更多播放、分类高级筛选等实机截图，并明确反馈：**“现在感觉还没原来好用好看”**。当前事实以该实机结果为准。

确认的问题：

1. 搜索已经拆成独立页，但 `input` 右侧按钮仍显示“输入番号 / 片名 / 演员 / 系列”，按钮文字占用过多横向空间。
2. 更多播放从大图标页缩成了文字 Provider，但又走到另一个极端：MissAV / 123AV / Jable 没有品牌图标，辨识度下降。
3. Test2 的 Progressive Disclosure 高级筛选虽然不再一次铺满所有标签，但变成“年份 / 月份 / 主题 / 角色 / 服装 / 体型 / 行为 / 玩法 / 类别 / 时长”一整列箭头，实机仍然难扫、难选、难回到影片。
4. 分类作为一级 Tab 仍依赖 `putMyVar('jdb3_nav','分类') + refreshPage(false)` 原地替换当前页面。对于 Catalog 这种独立任务，用户明确要求进入一个新的页面。
5. 用户要求恢复之前讨论过的“网飞猫”写法：独立 `hiker://page/...?...simple=true` Catalog，筛选使用连续 `scroll_button`；长列表允许海阔原生 `>` 溢出及“请选择”选择器承担完整选项，而不是再人为堆一列折叠组。

因此 Test3 不继续修 Test2 的折叠列表，而是直接更换分类信息架构。

### 2. 搜索输入框：右侧按钮只保留动作

海阔 `input` 组件的 `title` 是右侧确定按钮。本轮改为：

```text
title = 搜索
desc  = 输入番号、片名或演员
```

目标：
- 右侧只表达“搜索”动作。
- 输入提示回到输入区域，不再让按钮承担说明文案。
- 搜索历史、演员/系列/片商/导演资料入口、原 `javdb3Search` 结果链全部保留。

### 3. 分类从一级同页状态切换改为独立 Catalog

Test2：

```text
点“分类”
→ putMyVar(jdb3_nav=分类)
→ refreshPage(false)
→ 当前主页面切成分类
```

Test3：

```text
点“分类”
→ hiker://page/javdb3Filters?page=fypage&rule=&simple=true
→ 独立分类 Catalog
```

这里直接复用已有 `javdb3Filters` 路由，不增加不必要的新 page path；UI3 覆盖 `JDB.filters()`，将旧“高级标签”页接管成完整分类 Catalog。

固定原则：
- 分类是独立浏览任务，可以 push 新二级页。
- `simple=true` 保持系统单行标题栏正常显示，禁止回到 immersiveTheme 详情页叠加问题。
- 一级主页面不再为了分类强制刷新和替换内容。
- 首页“可播放 / 有字幕 / 可下载 / 全部分类”快捷入口设置筛选状态后直接进入该独立分类页。

### 4. 网飞猫式分类页：高频条件连续横向显示

分类主页面只放高频条件：

```text
类型
有码 / 无码 / 欧美 / FC2 / 动漫

资源
全部 / 可播放 / 可下载 / 含字幕 / 单体 / 预览图 / 预览视频

年份
全部 / 2026 / 2025 / 2024 / ...

排序
新发布 / 最近更新 / 评分 / 热度 / 想看 / 看过

更多筛选 →

影片结果
三列海报
```

实现原则：
- 类型、资源、年份、排序全部采用连续 `scroll_button`。
- 短列表正常一屏显示。
- 年份等长列表允许海阔原生溢出 `>` 承担完整选择器；不再手工做一列箭头组。
- 分类结果仍使用原已验证合同：

```text
GET /api/v1/movies/tags
filter_by = {type}:t:{main}:{extra}:{year}:{duration}:{month}
```

- 动态标签仍来自：`GET /api/v2/tags?type={0..4}`。
- 主列表 API、排序字段、封面布局都不重写。

### 5. 低频高级标签进入单独编辑页

月份、时长、主题、角色、服装、体型、行为、玩法、类别等不再挤占 Catalog 首屏。

流程：

```text
分类 Catalog
→ 更多筛选
→ 独立 simple=true 高级筛选页
→ 连续横向标签行
→ 选择时只刷新高级筛选页
→ 完成筛选
→ back(true)
→ 关闭高级筛选页并刷新上一层分类结果
```

海阔官方 JS 文档明确支持二级页 `back(true)`：关闭当前页面并刷新前一个页面。Test3 正式使用该能力完成“编辑筛选 → 返回 Catalog → 自动刷新结果”的闭环。

高级页规则：
- `month / duration` 保持单选，并提供“全部”。
- 主题、角色、服装等继续多选。
- 长标签行继续使用海阔原生横向溢出与选择器。
- “清空更多筛选”只清低频标签，保留类型 / 资源 / 年份 / 排序。
- 切换影片类型仍清理不兼容的动态标签，避免跨类型残留。

### 6. 更多播放恢复 Provider 图标，但保持紧凑

Test1：图标过大，占满首屏。

Test2：纯文字过轻，品牌辨识度不足。

Test3 使用组件语义折中：

```text
JavDB VIP / 官方预览 → icon_2
MissAV / 123AV / Jable → icon_small_3
JavDB 官方磁链 → text_icon
```

Provider 图标不另写一套来源，直接复用已经本地化的 Shared JAV Playback `providers()` 合同：
- MissAV：`https://missav.live/favicon.ico`
- 123AV：3.9.44 Local-First Runtime 内本地 `123av.svg`
- Jable：`https://jable.tv/favicon.ico`

点击行为继续调用：

```text
JAVPlayback.providerUrl(providerId, code)
```

因此本轮只改 Renderer，不动 MissAV / 123AV / Jable 解析器和真实播放合同。

### 7. Test3 Local-First 运行链

```text
3.9.45-test.3 Shell / rule 2026082603
→ b2026082603/local_entry.js
→ 3.9.44 已验证 Base Builder / Runtime
→ UI1: 3.9.45-test.1 Product/UI Overlay
→ UI2: 3.9.45-test.2 Screenshot Refinement Overlay
→ UI3: 3.9.45-test.3 NetflxCat Category/Search/Playback Overlay
→ JDB page call
```

所有 Overlay 与最终调用继续在 Base Runtime `core()` 的同一 JDB direct-eval 作用域内执行，不能拆 helper 后假定 `JDB` 跨函数可见。

不可变引用：
- UI1 Ref：`d22dde89479cfff74b5b1f04dce55ef6068dcf70`
- UI2 Ref：`3f949f36dcaca5486e334f2958f4fdffe8eb6e4f`
- UI3 Ref：`57d6ee2a55dcdf7cc1e97265daec63c14ae80b1f`
- Entry Ref：`b298f8f36c049e96f67073ddc9c66c9883e181c9`
- Shell Ref：`8aae90421de8e7c7a9daa1dd55aa736537f19abf`
- Shell Blob：`640ca848161bfaea4dc0424040206df8da8cd063`
- Release commit：`9a00ebb0f7e86059fc2bb6f31aef544e2a514df3`
- Base Builder Ref：`2361fbbfc21c540191495b979b30a6828adfe9c1`
- Base Source Ref：`848879b13bc5de5510af68b6791cc94c6307f198`

### 8. Test3 静态门禁

发布前完成：
- `product_ui_patch3.js` → `node --check` 通过。
- `local_entry.js` → `node --check` 通过。
- 新 Shell 回读确认 rule version `2026082603`。
- 新 Shell 回读确认 Entry 本地路径为 `b2026082603/local_entry.js`，固定远程 Ref 为 Test3 Entry commit。
- 复用现有 `javdb3Filters` 路由，因此页面总数仍为 **39**。
- 新增 lazyRule 回调只依赖显式参数和海阔全局 API，不依赖外层 helper 闭包。
- 高级筛选完成动作采用官方文档支持的二级页 `back(true)`。
- 第三方播放图标来自已本地化 Shared Playback `providers()`，不增加新的远程业务代码依赖。

### 9. Test3 待实机验证

当前只能称：**Test3 发布链完成，等待实机确认是否真正比 Test1/Test2 更好用。**

优先验证：
1. 搜索右侧是否只显示短“搜索”，输入区域是否不再被右侧文字挤压。
2. 主页面点“分类”是否打开新的系统标题栏二级页，而不是原页刷新。
3. 分类页类型 / 资源 / 年份 / 排序是否符合网飞猫式横向浏览；年份长列表右侧原生 `>` 是否可正常展开选择。
4. “更多筛选”是否进入另一个独立页；选主题/角色等后点“完成筛选”，是否自动返回并刷新分类影片。
5. 连续修改 5 次高级筛选后，返回链是否仍只回一层，不制造同级页面栈。
6. MissAV / 123AV / Jable 是否显示紧凑图标；三个播放源实际点击行为不能因 UI3 回归。
7. Test2 已改善的演员月榜、详情/评论、我的/更多等页面不能因 UI3 回归。

Stable `3.9.42` / Latest 在 Test3 实机闭环前继续冻结。

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

### 13. Test2 实机结果

2026-08-26 用户实机确认：
- 独立搜索页已经生效，但输入框右侧说明文字过长。
- 更多播放已经成功进入 Test2 Overlay 并从大图标变成紧凑按钮，但用户要求恢复 Provider 图标。
- 分类 Progressive Disclosure 已生效，但实机仍然难用，用户明确要求废弃该交互，改独立分类页 + 网飞猫写法。

因此 Test2 冻结为第二阶段截图基线，不晋级 Stable；上述问题由 Test3 处理。

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

### 分类 API 与当前交互边界

- 动态标签：`GET /api/v2/tags?type={0..4}`。
- 影片筛选：`GET /api/v1/movies/tags`。
- `filter_by`：`{type}:t:{main}:{extra}:{year}:{duration}:{month}`。
- 高频基本条件：`p=可播放`、`m=可下载`、`c=含字幕`、`s=单体影片`、`i=预览图`、`v=预览视频`。
- 排序：`release/update/score/hit/want_watch_count/watched_count`。
- 当前 Product 约束：分类为独立 `simple=true` Catalog；高频类型/资源/年份/排序直接横向展示；低频标签进入独立高级筛选页；完成编辑使用 `back(true)` 回到并刷新 Catalog。

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
- Provider UI 可使用 `providers()` 中的 icon 做紧凑图标卡，不应退化成占满首屏的大 Logo，也不应完全去掉品牌识别只剩文字。

---

## 恢复与回退

- 正式恢复入口：Stable `3.9.42 / Build2026082301`。
- 当前 UI Test：`3.9.45-test.3 / Build2026082603`，等待网飞猫式独立分类页 / 高级筛选返回刷新 / Provider 图标实机回归。
- Previous UI Test：`3.9.45-test.2 / Build2026082602`，已完成第二轮截图审计，冻结保留。
- Previous UI Test：`3.9.45-test.1 / Build2026082601`，已完成第一轮截图审计，冻结保留。
- Local-First 基础回退：`3.9.44-test.1 / Build2026082501`，基础实机验证通过。
- 历史远程传输实现：`3.9.43-test.3`。
- Pure Local：`3.9.41-local / Build2026082103`。
- Stable 当前不自动晋级；Test3 如发现回归，冻结 immutable release，再从 Stable 3.9.42 + 已验证 Local-First 基线建立更高 Test，不原地覆盖。

## 历史归档

- Local-First 迁移前完整历史：`apps/video/javdb/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`