# 麻豆AI Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 当前基线
- App ID：`mdai`
- Remote Stable：`2.8.0 / Build 28003 / Shell 1.2.2`
- Remote Test：`2.8.0-test.3 / Build 28003 / Shell 1.2.2-test`
- Local：`2.6.3-local.1`
- Stable 入口：`apps/video/mdai/mdai_remote_v2.txt`
- Test 入口：`apps/video/mdai/mdai_remote_test_v8.txt`
- Local：`mdai.txt`，导入名 `麻豆AI 本地版`
- 正式图标资产：`apps/video/mdai/assets/mdai_official.png`

## 当前 Stable 运行链
```text
mdai_remote_v2.txt / rule version 2026082308
→ bootstrap_v2.js / state id=mdai / minBuild=28003
→ Remote Manager v2.0.1
→ latest.json
→ releases/2.8.0/release.json
→ core.js          复用 2.7 Test1 / Stable 2.6.3 协议数据桥
→ playback.js      复用 2.7 Test1 PlaybackAdapter
→ ui_base.js       复用 2.8 Test1 Native UI Design System
→ pages_content.js 复用 2.8 Test3 Syntax hotfix 后 ContentPages
→ pages_detail.js  复用 2.8 Test1 详情与选集信息架构
→ settings.js      复用 2.8 Test1 分组设置
→ runtime.js       复用 2.8 Test3 Runtime
```

Stable `2.8.0` 与 `2.8.0-test.3` 的业务模块完全一致；本次正式发布只新增独立 Stable release / Bootstrap / Shell 与 Stable 元数据，不重写 UI、数据或播放逻辑。用户于 2026-08-23 明确要求将当前麻豆AI测试链发布为正式版，此指令作为本次晋级接受依据。

## 当前 Test 运行链
```text
mdai_remote_test_v8.txt / rule version 2026082306
→ bootstrap_test_v8.js / state id=mdai-test / minBuild=28003
→ Remote Manager v2.0.1
→ releases/2.8.0-test.3/release.json
→ 与 Stable 2.8.0 相同业务模块
```

Stable/Test 同名覆盖，但 Remote Manager state 独立：`mdai` / `mdai-test`。

## 2.8 产品级 UI 重构
2.7 已解决片库缺项、分类点击压新页面、横向溢出等结构性问题；2.8 不再局部换皮，重新定义跨页骨架。

```text
Home
→ 搜索
→ 推荐 / 视频 / 短剧 / 社区（固定四栏，原页切换）
→ 片库 / 收藏 / 历史 / 设置（快捷入口）
→ 业务内容区

Library
→ 视频 / 短剧
→ 原创 / 国产 / 字幕
→ 主题分类（默认折叠，按需展开全部）
→ 筛选与排序（默认折叠）
→ 内容列表

Detail
→ Hero
→ Primary Play
→ 剧情简介
→ 低频操作
→ 选集控制
→ 真实 Episode Grid
→ 猜你喜欢
```

固定实现：
- 首页固定四栏使用等宽组件，避免长标题横向溢出。
- 页面内 Tab / 分类 / 排序 / 筛选统一 `lazyRule → MyVar → refreshPage(false)`；只有首次进入独立功能页时导航一次。
- 片库已验证分类由 CatalogAdapter 维护稳定骨架，再合并动态接口；接口缺项不能让已知分类消失。
- 主题分类默认只展示前 6 个，使用“展开全部 / 收起”控制，避免按钮墙占满首屏。
- 高级筛选默认折叠为一行摘要，展开后才展示 `默认 / 近1月 / 20分+ / 点赞`。
- 搜索提交后在搜索页原地刷新结果，不为每个关键词继续压新页面。
- “我的”收藏/历史使用同页状态切换。
- 详情页第一主操作保持播放/继续播放；收藏、评论/片库等低频操作下沉。
- 选集控制与 Episode Grid 分离；网格内只允许真实集数。
- 2.8 UI 层继续复用 2.7 PlaybackAdapter，避免 UI 与播放协议同时变化。

### Test2 发布前修正
- 首页点“收藏/历史”时，Runtime 会先把 query `mode` 同步到 `mdai_mine_tab_v280`。
- 短剧详情进入片库时，Runtime 会先把 query `type=drama` 同步到 `mdai_library_type_v280`。

### Test2 实机启动事故 → Test3
用户实机启动 `2.8.0-test.2` 后直接报：

```text
麻豆AI解析失败
SyntaxError: 在参数列表的后面缺少“)”
来源: eval code#1
行数: 83
```

回读实际远程 `pages_content.js` 后确认根因是片库这一行少一个右括号：

```js
d.push(U.line());d.push(U.section(c,'内容结果',selected?catLabel(c,selected):(menuName(menu)+' · 全部'));
```

正确为：

```js
d.push(U.line());d.push(U.section(c,'内容结果',selected?catLabel(c,selected):(menuName(menu)+' · 全部')));
```

Test3 只修这一处语法错误；UI/数据/详情/播放边界全部保持。为保持旧 release 不可变，Test3 使用 pinned Test1 ContentPages 作为不可变基线，在新模块中做精确单点替换后再 eval。

**固定发布规则：** 大 UI 文件不能只检查 Runtime/Bootstrap；每一个实际会被 Remote Manager eval 的 JS 模块都必须逐文件执行语法检查或等价 parser 校验，且检查对象必须与远端 blob 一致。

## 正式图标资产事实
用户使用独立 Favicon 工具在实机可访问环境取得原站内嵌图标：

```text
data:image/jpeg;base64,iVBORw0KGgo...
```

实际解码后的文件头是 PNG（`89 50 4E 47`），尺寸 `32×32`；内容为黑底紫/蓝渐变播放标识。Data URI 的 MIME 前缀与真实文件格式不一致，因此不能只相信声明类型。

最终处理：
- 不依赖运行时 favicon 探测作为正式程序图标。
- 不使用第三方 Favicon API 作为长期资产源。
- 不用 AI 近似重绘，因为已经获得真实原始像素。
- 正式 PNG 二进制资产：`apps/video/mdai/assets/mdai_official.png`。
- Stable/Test Shell、云仓库主卡以及 Stable/Test/Local channel card 统一引用该 PNG。

固定规则：**数据 API Client 与 Raw Resource Client 必须分层；Data URI 图标若是正式来源，应先解码验证真实格式，再固化为项目静态二进制资产。**

## PlaybackAdapter 2.7（Stable 2.8.0 继续沿用）
- `smart`：稳定代理 + 原始直链。
- `direct`：原始直链优先。
- `proxy`：只走站点稳定代理。
- `compat`：显式启用时才 `cacheM3u8()`。
- 播放诊断：`mdai_play_diag_v2`。

当前站点事实：
- 默认 Host：`https://mdcmai4.xyz`。
- 主要接口：`/api/v1/`。
- 稳定 M3U8 代理：`/api/v1/m3u8/proxy?path=`。
- 播放请求使用当前站点 Referer/UA。

## 2.7 已解决的片库事故
- 动态接口非空时整批覆盖本地分类骨架，导致接口少项时用户可见分类消失：已改 CatalogAdapter 合并策略。
- 一级分类使用 `scroll_button` 出现右侧 `>` 溢出：固定三栏改等宽组件。
- 分类/筛选使用 `hiker://page` 跳转导致连续压页面栈：已改原页状态更新。

## 本地状态
- 历史：`mdai_watch_history_v1`
- 收藏：`mdai_favorites_v1`
- 搜索历史：`mdai_search_history_v1`
- Core 快照：`mdai_core_snapshot_263_v270`
- 播放策略：`mdai_play_strategy_v2`
- 播放诊断：`mdai_play_diag_v2`
- 2.8 首页 Tab：`mdai_home_tab_v280`
- 2.8 片库类型：`mdai_library_type_v280`
- 2.8 片库栏目：`mdai_library_menu_v280`
- 2.8 片库分类：`mdai_library_cat_v280`
- 2.8 分类展开：`mdai_library_expand_v280`
- 2.8 高级筛选展开：`mdai_library_adv_v280`
- 2.8 我的 Tab：`mdai_mine_tab_v280`

## 回归 / 恢复
- 当前 Stable 恢复入口：`麻豆AI 2.8.0 / Build28003`。
- Test 后续开发必须先 rebase Stable 2.8.0，再向下一目标版本前进。
- Local 2.6.3 继续作为独立纯本地恢复入口，暂不随本次 Stable 晋级重打包。

---
## 版本记录
### 2.8.0 Stable / 2026-08-23
- 按用户明确发布指令，由 `2.8.0-test.3 / Build28003` 原样晋级。
- 新增 `releases/2.8.0/release.json`、`bootstrap_v2.js`、`mdai_remote_v2.txt`。
- Stable state id 保持 `mdai`，与 Test `mdai-test` 隔离。
- Stable Shell 1.2.2 / rule version `2026082308`；业务模块与 Test3 完全相同。

### 2.8.0-test.3 / 2026-08-23
- 根据 Test2 实机启动 SyntaxError 精确修复 ContentPages 片库 section 少一个右括号。
- 保持 Test1/Test2 release 不可变，新 release 使用 pinned Test1 ContentPages + 单点替换。
- Build28003 / Shell v8 / Bootstrap v8；PNG 图标、2.8 UI、详情、2.7 PlaybackAdapter 全部不变。

### 2.8.0-test.2 / 2026-08-23
- 完整继承 Test1 UI 重构。
- 发布前补收藏/历史、短剧片库的跨页状态恢复。
- 将原站图标升级为真实 PNG 二进制资产。
- 实机发现 ContentPages 语法错误，已冻结并由 Test3 修复。

### 2.8.0-test.1 / 2026-08-23
- 从 2.7 局部优化升级为完整产品级 UI 重构。
- 首页、片库、搜索、我的、详情、设置统一重写信息架构。

### 2.7.0-test.4 / 2026-08-23
- 修复官网图标检测误走 JSON API Client；改为原始 HTML / manifest 资源解析。

### 2.7.0-test.2 / 2026-08-22
- 修复片库分类完整性、溢出 `>` 和分类连续开新页面问题；新增 CatalogAdapter。

### 2.6.3 Stable / 2026-08-22
- 用户实机确认 `2.6.3-test.1 / Build26301` 正常后原样晋级。
