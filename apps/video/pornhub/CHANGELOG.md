# Pornhub Changelog

> 当前恢复入口。Local-First 迁移前的 Test1-Test7 / Stable0.1.0 / 账号、评论、Shorts、片单与播放历史已归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.1.0 / Build10108`，继续冻结，是当前日用稳定恢复基线和 V2 回归对照基线。
- Latest：仍指向 Stable `0.1.0 / Build10108`，不修改。
- Test：`0.2.0-test.1 / Build20001`，Pornhub V2 Clean Rewrite，**静态门禁完成，等待完整实机验证**。
- Test Shell：`apps/video/pornhub/pornhub_remote_test_v3_b20001.txt`，rule version `2026082602`。
- Test Release：`apps/video/pornhub/releases/0.2.0-test.1/release.json`。
- Recovery Test：`0.1.1-test.2 / Build10202`，Native Local-First，用户已基础实机确认可运行；保留为迁移恢复参考，不再作为 V2 架构来源。
- Failed Test：`0.1.1-test.1 / Build10201`，远程残留门禁实机失败，冻结不可覆盖。
- Stable 晋级来源：`0.1.0-test.7 / Build10107`。
- 数据源：`https://www.pornhub.com/`。

## 2026-08-26 · 0.2.0-test.1 / Build20001 · Pornhub V2 Clean Rewrite

### 为什么不是继续 Patch8
开发指南升级到 `HIKER_APP_DEVELOPMENT_GUIDE v2.12` 后重新复盘 Pornhub。旧 Stable 的业务能力经过 Test1-Test7 连续补丁形成：

```text
Core Test1
→ Core Patch2/3/4/5/6/7
→ Runtime Test1
→ UI Patch2/3/4/5/6/7
→ Stable Patch
```

这条链可以作为“已经验证过哪些协议/解析事实”的证据，但不再适合作为下一代产品架构。因此 V2 固定决策：

```text
Stable0.1.0
只保留：协议事实 / Parser经验 / 回归基线
不继承：历史 Patch Stack 架构

Pornhub V2
Product Blueprint
→ Model / Store / Session / Request
→ Parser
→ Providers / Actions / Playback
→ Native UI Helpers
→ Pages
→ Standalone Runtime Export
```

禁止以后重新把 V2 退回 `corePatch8 / uiPatch8 / patch-over-patch` 模式。

### Product Blueprint

#### 首页
```text
账号身份行
→ 大搜索框
→ 分类 / 创作者 / 收藏库 / 我的 4 个核心入口
→ 为你推荐 / Feed / 最新 / 热门 / 高分
→ 主视频 Feed
→ Shorts / 片单 / GIF 二级发现
```

首页主任务恢复为“找内容/看内容”，不再让收藏、历史、诊断等工具按钮占满首屏。

#### 搜索
```text
大输入框
→ 最近搜索 / 热门分类（未搜索时）
→ 视频 / 创作者范围
→ 高级筛选折叠
→ 结果
```

视频筛选包含排序、制作类型、时长。创作者搜索独立支持演员 / 频道 / 模特 / 用户。筛选与范围切换均是同页 State Change，不新建页面栈。

#### 分类
```text
异性恋 / 男同 / 女女主分组
→ 热门图片分类
→ 中文完整分类（默认折叠）
→ 分类内最新 / 最多观看 / 最高评分
→ 视频结果
```

同级分类/排序切换不再通过不断新开 `hiker://page` 实现。

#### 视频详情
```text
大图 Hero（直接点击播放）
→ 标题 / 时长 / 播放量 / 日期
→ 立即播放
→ 简介 | 评论 双 Tab
→ 本地收藏 / 站内收藏 / 官方页
→ 创作者
→ 简介 / 中文分类 / 标签
→ 相关推荐
```

简介/评论使用固定详情骨架 + `deleteItemByCls / addItemAfter / updateItem` 局部更新；评论不再强制跳一套完全不同的页面 UI。

#### 收藏库
本地：
- 影片
- 创作者
- 片单
- 足迹

账号：
- 站内收藏
- 观看历史
- 订阅

账号私有列表必须经过官方 `/user/security` 身份校验后解锁。

### 账号安全模型重写
旧版曾发生：X5 网页已经登录，小程序也显示登录，但用户名、订阅和账号数据并不属于用户当前真实账号；重新同步后甚至可能出现另一个用户名。

V2 固定原则：

```text
Cookie存在
≠ 已确认账号身份

/user/security 明确返回可靠 username
→ identity source = security-*
→ 才允许读取“我的收藏 / 我的历史 / 我的订阅”

Cookie 已登录但身份字段不可靠
→ 推荐 / Feed 可以继续使用会话
→ 私有列表保持锁定
→ 明确提示用 X5 官方安全页核对
→ 禁止从普通推荐链接、页面任意 /users/ 链接猜用户名
```

小程序不保存账号密码、验证码或二次验证信息。

### Model / Provider 基线
V2 直接把以下实体建模为一等业务对象：
- Video
- Person
- Collection / Playlist
- Comment
- Category
- Short

主要 Provider：
- `VideoProvider`
- `CategoryProvider`
- `CreatorProvider`
- `AccountProvider`
- `CollectionProvider`
- `ShortsProvider`
- `GifProvider`

UI 只消费标准 Model；协议字段兼容链留在 Parser / Provider。

### 评论
- 继续只读，当前不实现发评论。
- 主页面 HTML 优先解析 `commentBlock/commentMessage`。
- 主页面没有评论时，有限扫描 comment/ajax 候选地址再解析。
- 评论模型包含 author/avatar/content/time/likeCount。
- 评论失败属于社区 P2，不阻塞详情与播放。

### 播放
默认链：

```text
Video Detail Model
→ mediaDefinitions
→ HLS Sources
→ 多画质 PlayModel
→ 无结构化源时 video:// 兜底
```

详情解析后的 Model 有短期缓存，播放优先复用已解析 sources，避免无意义重复详情请求。Player 输出只包含真实媒体地址，不混入收藏/评论/设置动作。

### Shorts 与片单实体门槛
旧版 Shorts/片单曾出现“入口能打开但没真实内容”以及通用 `View Playlist` / 裸 ID 伪卡。

V2 固定：

```text
Short：真实 /shorties/<id> + 真实标题 + 真实封面
Playlist：真实 /playlist/<id> + 真实标题 + 真实封面
```

字段不全时宁可展示明确空态，不制造伪业务实体。

片单详情继续兼容：
- `playlistId`
- `itemsCount`
- `token`
- `/playlist/viewChunked`

并使用“加载更多”逐页读取，不一次串行打开所有条目详情。

### Standalone Local-First Runtime
V2 首装源：

```text
8 个 V2 Runtime parts
+ 17 个 Pornhub SVG
= 25 immutable sources
```

Runtime Parts：
1. `01_kernel.part`
2. `02_store_session_request.part`
3. `03_parsers_models.part`
4. `04_providers_actions_playback.part`
5. `05_ui_helpers.part`
6. `06_home_search_category_detail.part`
7. `07_creator_library_account_extras.part`
8. `08_runtime_export.part`

Source snapshot：`ffeee0e973c23410bbc6466717cd70ffe8b16953`。

Builder：
- `apps/video/pornhub/releases/0.2.0-test.1/local_bundle_builder.js`
- ref `cdc6ea284f3bb839e10c6a26a2d83ae7e1fc599b`

Entry：
- `apps/video/pornhub/releases/0.2.0-test.1/local_entry.js`
- ref `f7a5c0356d1d96cdd5c22cbb8ea89787d3ef83ba`

Shell：
- `apps/video/pornhub/pornhub_remote_test_v3_b20001.txt`
- ref `9573abc9b1aadc6f396946c4ec2545c0898759b2`
- blob `17ea47785ca4a48e779cb5a40451e8fd653056ff`
- rule version `2026082602`

运行链：

```text
V2 Test Shell
→ 首次安装 pinned Local Entry
→ Local Entry 安装 pinned Builder
→ Builder 并发取 8 Parts + 17 SVG
→ 每源 marker / SVG 正文校验
→ 拼接唯一 runtime_bundle.js
→ 私人仓/Remote Manager 残留门禁
→ 写本地 assets/ + bundle_meta.json
→ 后续 $.require('pornhub')
→ require(file:// runtime_bundle.js)
→ PornhubV2.module()
```

正常二次启动和关键 lazyRule 点击不再访问私人 GitHub 获取业务代码或控制面。Pornhub 原站 HTML/API、X5 Cookie、图片和 HLS 属于正常业务网络，不属于 Local-First 禁止项。

### V2 本地图标
V2 本地闭包包含 17 个 SVG：
`account / categories / creators / library / icon / shorts / playlist / gifs / local / favorite / official / subscribe / home / feed / search / comment / history`。

新增 `library.svg / playlist.svg / official.svg`，统一黑底 + Pornhub 橙线条视觉语言。

### 静态门禁
当前发布前已经完成：
- Runtime 组合语法检查。
- Builder `node --check`。
- Entry `node --check`。
- Shell 外层 JSON / `pages` 内层 JSON 解析检查。
- 17 个页面声明检查。
- Runtime 导出方法合同检查。
- Fixture：视频卡、`mediaDefinitions` 多画质 HLS、评论、Shorts、真实片单、伪 `View Playlist` 拒绝。
- 私人仓 / `remote_manager.js` Runtime 残留扫描。

**以上均不等于海阔实机验证。** 当前 Test 状态固定为 `pending-device-validation`。

### Shell v2 未发布工件
构建过程中曾生成：
- `apps/video/pornhub/pornhub_remote_test_v2_b20001.txt`

在活动 Test 指针切换前复核发现其多层 JSON 内嵌 JS 的正则转义过于复杂，存在反斜杠过度转义风险。处理：
- v2 Shell 从未写入 test/channels/manifest 活动指针。
- 不原地覆盖。
- 新建 v3 Shell，简化 inline response validator，并重新通过外层 JSON + pages JSON 检查。

以后恢复时只认 v3。

### 当前发布边界
- Test `0.2.0-test.1 / Build20001` 已写入 app-level `test.json / channels.json / manifest.json`。
- Stable `0.1.0 / Build10108` 未改。
- Latest 未改。
- V2 尚未实机验收，禁止晋级 Stable。

## 2026-08-25 · Test2 基础实机通过
用户在 Test1 触发远程残留硬门禁后，覆盖测试修复版 `0.1.1-test.2 / Build10202`，随后明确反馈可正常运行。因此当前可确认：

```text
Test2 Local-First 首装 / Runtime 构建基础链
→ 实机可正常运行
→ Test1 的私人仓库残留问题已被 Test2 修复
```

当前只记录为 **basic-device-validated**，不扩大事实范围：当时没有逐项完成 Home / Search / Category / Creator / Detail / Comments / HLS / Account / Shorts / Playlist 全量回归。

## 2026-08-25 · 0.1.1-test.2 / Build10202 · Local-First Residual Gate Repair

### Test1 实机失败
Test1 `0.1.1-test.1 / Build10201` 首次构建 Runtime 时被最终硬门禁正确拒绝：

```text
Runtime 仍残留远程代码/资产依赖：
raw.githubusercontent.com/huoguotiankong/asset-core-7f3
```

Test1 保持 immutable，不允许原地覆盖。

### Test2 修复与恢复价值
Test2 不改当时 Stable 业务 Parser，只修 Local-First 交付控制面：
1. 每个 JS 源必须命中精确 marker。
2. 批量/单源正文归一化。
3. 仓库 SVG 根本地化。
4. 历史 `C.bootstrap` 重写到本地 Bootstrap Shim。
5. 单模块与最终 Runtime 都执行远程残留门禁。
6. `bundle_meta.json` 记录本地闭包状态。

Test2 本地闭包：15 个 Stable 业务模块 + 1 个 Local Overlay + 15 个 SVG = 31 sources。

它当前仅作为：
- Local-First 迁移事故后的已验证恢复参考。
- V2 若首装交付层失败时的对照样本。

不再作为 V2 产品/架构基线。

## 长期不可回退事实
- Local-First 完成定义包含入口、传递依赖、静态资产和点击时重入。
- X5 Cookie 登录不保存账号密码。
- “Cookie 已登录”与“账号身份已确认”必须分离；私有账号数据禁止猜号。
- Player Queue 只能包含真实媒体实体。
- 同级筛选 / Tab 是 State Change，不应通过新页面累积历史栈。
- raw identifier 不是业务实体；Shorts/片单字段不全时禁止伪成功。
- V2 是独立 Standalone Runtime；以后功能升级优先在 Provider/Page/Parser 的明确边界内修改，不恢复历史 Patch Stack。

## 历史
- Local-First 前完整历史：`apps/video/pornhub/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
- Stable：`apps/video/pornhub/releases/0.1.0/release.json`
- Failed Local-First Test1：`apps/video/pornhub/releases/0.1.1-test.1/release.json`
- Recovery Local-First Test2：`apps/video/pornhub/releases/0.1.1-test.2/release.json`
- Pornhub V2 Test1：`apps/video/pornhub/releases/0.2.0-test.1/release.json`
