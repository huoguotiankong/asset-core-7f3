# 麻豆AI Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 2026-08-27 · 2.9.0-test.2 / Build29002 · Product Rewrite + Read-Only Comments + Short-Drama Detail Fix
- 本轮在开发指南 2.12 大更新后重新从 **Stable 2.8.0 / Build28003** 建立 2.9 业务线，不把 `2.8.1-test.1` 的未验 UI 当业务 recovery base；Local-First 2.2.0 只继承为交付架构。
- 2.9 不再通过 `eval` 复用 2.6.3 God Object，显式拆分：`Core → PlaybackAdapter → UI → CommunityProvider → Home → Library → Search/Mine → Detail/Comments → Settings → Runtime`。
- UI 产品蓝图按指南 2.12 调整：
  - Home：搜索 → 推荐/视频/短剧/社区 → 片库/收藏/历史/设置 → 继续观看/精选/更新/热剧/社区。
  - Library：视频/短剧分流；视频保留原创/国产/字幕与稳定分类骨架；筛选仍为同页状态更新，不压新页面。
  - Detail：Hero → Primary Play → 内容 Tab → 收藏/相关推荐；普通视频为 `简介/评论`，帖子为 `正文/评论`，短剧为 `选集/简介`。
  - Search：按 `idle → hot/history → result → empty/error` 状态机组织。
- 评论接口来自当前旧业务源码的真实事实，不猜新协议：
  - 视频：`/api/v1/comments?videoId=<id>&page=<page>&size=<size>`。
  - 帖子：`/api/v1/comments?postId=<id>&page=<page>&size=<size>`。
  - 当前只做只读浏览、分页、头像/作者/时间/正文以及接口已经返回的内嵌回复；**不加账号、登录、发评论、回复、点赞写操作**。
  - 当前没有源码事实证明短剧使用何种评论参数，因此 2.9 不给短剧伪造评论入口。
- 评论属于 P2/P3：只有用户切到“评论”时才请求；评论失败不得阻塞 Hero、简介和播放。
- PlaybackAdapter 继续复用 `2.7.0-test.1/playback.js`，本轮不同时改播放合同。

### Test1 实机事故 → Test2
用户实机进入 2.9 Test1 的短剧详情后：Hero、标题、集数、热度、评分与主播放按钮均正常，但“选集”内容区显示：
```text
详情加载失败
“sel” 未定义。
```
根因定位到 `pages_detail.js` 的这类写法：
```js
var total=eps.length,rs=parseInt(getItem('mdai_episode_range','40'))||40;
if(rs<20)rs=20;
if(rs>60)rs=60,count=Math.ceil(total/rs),rk='...',sel=...;
if(sel<0||sel>=count)sel=0;
```
由于 `count/rk/sel` 被逗号表达式意外绑定到 `if(rs>60)` 的单语句分支，当默认 `rs=40` 时分支不执行，`sel` 从未初始化；这不是 API/数据问题。

Test2 修复为显式独立初始化：
```js
if(rs<20)rs=20;
if(rs>60)rs=60;
var count=Math.ceil(total/rs);
var rk='...';
var sel=parseInt(getMyVar(rk,'0'))||0;
```
并冻结 Test1，不原地覆盖；新增 `2.9.0-test.2 / Build29002` release、Runtime、Bootstrap v11、Shell v11。

**新增发布门禁：** `node --check` 只能证明 parse 通过，无法证明条件分支中的变量一定初始化。选集/分页/范围计算类模块还必须至少跑一个默认值 smoke case（本次固定覆盖 `rs=40`），再进入 Test。

## 当前基线
- App ID：`mdai`
- Remote Stable：`2.8.0 / Build28003 / Shell 1.2.2`
- Remote Test：`2.9.0-test.2 / Build29002 / Shell 1.4.1-test-local-first-native`（等待本轮实机复测）
- Local：`2.6.3-local.1`
- Stable 入口：`apps/video/mdai/mdai_remote_v2.txt`
- Test 入口：`apps/video/mdai/mdai_remote_test_v11.txt`
- Test Bootstrap：`apps/video/mdai/bootstrap_test_v11.js`
- Test Release：`apps/video/mdai/releases/2.9.0-test.2/release.json`
- Local：`mdai.txt`，导入名 `麻豆AI 本地版`
- 正式图标资产：`apps/video/mdai/assets/mdai_official.png`

## 当前 Test 运行链
```text
mdai_remote_test_v11.txt / rule version 2026082605
→ __hclocal22_mdai-test_b29002.json
→ 若完整：直接 require(file://) Build29002 模块
→ 若缺失：bootstrap_test_v11.js
→ Local Module Manager 2.2.0
→ 安装/升级 2.9 Test2 本地模块包
→ MDAIRemoteRuntime 2.9.0-test.2
```

当前 Test2 模块：
```text
Core                 2.9 Test1 显式 API/Storage Core
PlaybackAdapter       2.7 已验证播放层
UI                    2.9 Test1 Design System
Community             2.9 Test1 只读评论 Provider/Adapter
Home                  2.9 Test1 Feed 页面
Library               2.9 Test1 Catalog 页面
Search/Mine           2.9 Test1 搜索状态机/本地收藏历史
Detail                2.9 Test2 短剧 sel 作用域修复版
Settings              2.9 Test1
Runtime               2.9 Test2
```

Stable/Test 同名覆盖，但状态独立：Stable 使用 `mdai`；Test 使用 `mdai-test` Local Module Manager 2.2.0 package/state。Stable 2.8.0 与 Local 2.6.3 本轮均不修改。

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

Stable `2.8.0` 与历史 `2.8.0-test.3` 的业务模块完全一致；正式发布只新增独立 Stable release / Bootstrap / Shell 与 Stable 元数据，不重写 UI、数据或播放逻辑。

## 2026-08-25 · 2.8.1-test.1 / Build28101 · Native Local-First Candidate（历史交付实验）
- 前置事实：黄豆短剧 `1.9.1-test.3 / Build19103` 的 Local Module Manager 2.2.0 + `require(file://)` 路线已由用户实机确认正常，因此把同一交付架构扩展到麻豆AI；Stable `2.8.0 / Build28003` 与 Local `2.6.3-local.1` 均不修改。
- 本次只迁移交付/启动架构；首页、片库、搜索、我的、详情、设置、收藏历史、分类合并和 PlaybackAdapter 继续复用 Stable 2.8.0。
- 审计 Stable release 后发现两个嵌套远程依赖：
  1. `2.7.0-test.1/core.js` 在旧快照缓存未命中时会远程抓取 `source_local_2.6.3.txt`。
  2. `2.8.0-test.3/pages_content.js` 是热修加载器，会从固定 commit 抓 Test1 `pages_content.js` 再替换括号。
- Test1 将 Core 2.6.3 快照、ContentPages Test1 基线与 UI SVG 首次安装到 `hiker://files/rules/asset-core-local/mdai-test/assets/`；执行模块走 native `require(file://)`。
- 运行链：`mdai_remote_test_v9.txt → Build28101 本地 package → bootstrap_test_v9.js → Local Module Manager 2.2.0 → MDAIRemoteRuntime 2.8.1-test.1`。
- 该版本后被 2.9 产品重写线取代，不作为当前业务 recovery base；其 Local-First 交付经验保留。

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

### 2.8 Test2 实机启动事故 → Test3
用户实机启动 `2.8.0-test.2` 后直接报：
```text
麻豆AI解析失败
SyntaxError: 在参数列表的后面缺少“)”
来源: eval code#1
行数: 83
```
根因是片库 `U.section(...)` 少一个右括号。Test3 使用 pinned Test1 ContentPages 做单点替换修复。

**固定发布规则：** 大 UI 文件不能只检查 Runtime/Bootstrap；每一个实际执行的 JS 模块都必须逐文件执行语法检查或等价 parser 校验，且检查对象必须与发布 blob 一致。

## 正式图标资产事实
用户使用独立 Favicon 工具在实机可访问环境取得原站内嵌图标。Data URI 声明为 JPEG，但实际解码文件头为 PNG（`89 50 4E 47`），尺寸 `32×32`；内容为黑底紫/蓝渐变播放标识。

最终处理：
- 不依赖运行时 favicon 探测作为正式程序图标。
- 不使用第三方 Favicon API 作为长期资产源。
- 不用 AI 近似重绘，因为已经获得真实原始像素。
- 正式 PNG 二进制资产：`apps/video/mdai/assets/mdai_official.png`。
- Stable/Test Shell、云仓库主卡以及 Stable/Test/Local channel card 统一引用该 PNG。

固定规则：**数据 API Client 与 Raw Resource Client 必须分层；Data URI 图标若是正式来源，应先解码验证真实格式，再固化为项目静态二进制资产。**

## PlaybackAdapter 2.7（Stable 2.8.0 / Test 2.9.0-test.2 继续沿用）
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
- 播放策略：`mdai_play_strategy_v2`
- 播放诊断：`mdai_play_diag_v2`
- 2.8 首页 Tab：`mdai_home_tab_v280`
- 2.8 片库类型：`mdai_library_type_v280`
- 2.8 片库栏目：`mdai_library_menu_v280`
- 2.8 片库分类：`mdai_library_cat_v280`
- 2.8 分类展开：`mdai_library_expand_v280`
- 2.8 高级筛选展开：`mdai_library_adv_v280`
- 2.8 我的 Tab：`mdai_mine_tab_v280`
- 2.9 首页 Tab：`mdai_home_tab_v290`
- 2.9 详情 Tab：`mdai_detail_tab_v290_<type>_<id>`
- 2.9 选集范围：`mdai_ep_range_v290_<id>`
- 2.9 搜索关键词：`mdai_search_kw_v290`
- Local-First Test package：`__hclocal22_mdai-test_b29002.json`
- Local-First state：`__hclocal22_mdai-test_state.json`

## 回归 / 恢复
- 当前 Stable 恢复入口：`麻豆AI 2.8.0 / Build28003`。
- 当前 Test 候选：`2.9.0-test.2 / Build29002`；必须重新实机验证首页、片库、搜索、普通视频详情+评论、帖子详情+评论、短剧详情+选集、播放、我的、设置。
- Test2 未完成上述闭环前不得晋级 Stable。
- Local 2.6.3 继续作为独立纯本地恢复入口。

---
## 版本记录
### 2.9.0-test.2 / 2026-08-27
- 冻结 `2.9.0-test.1 / Build29001`，不原地覆盖。
- 修复短剧详情默认每组选集 40 时 `sel/count/rk` 未初始化导致“sel 未定义”。
- 新增 Build29002 / Bootstrap v11 / Shell v11；其它 2.9 业务模块与 Test1 保持一致。

### 2.9.0-test.1 / 2026-08-26
- 按开发指南 2.12 从 Stable 2.8.0 重建产品/UI/Community 分层。
- 新增视频与帖子只读评论；不增加账号与写操作。
- 首页改 Feed + Catalog 分工，搜索改状态机，详情改同页 Tab。
- 实机发现短剧选集 `sel` 作用域回归，已冻结并由 Test2 修复。

### 2.8.1-test.1 / 2026-08-25
- 从 Stable 2.8.0 rebase，只迁移 Local-First 交付架构。
- 迁移到 Local Module Manager 2.2.0 + native `require(file://)`。
- 后被 2.9 产品重写线取代，保留交付架构经验。

### 2.8.0 Stable / 2026-08-23
- 按用户明确发布指令，由 `2.8.0-test.3 / Build28003` 原样晋级。
- 新增 `releases/2.8.0/release.json`、`bootstrap_v2.js`、`mdai_remote_v2.txt`。
- Stable state id 保持 `mdai`，与 Test `mdai-test` 隔离。
- Stable Shell 1.2.2 / rule version `2026082308`；业务模块与 Test3 完全相同。

### 2.8.0-test.3 / 2026-08-23
- 根据 Test2 实机启动 SyntaxError 精确修复 ContentPages 片库 section 少一个右括号。
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
