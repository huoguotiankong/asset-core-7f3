# Pornhub Changelog

> 当前恢复入口。历史 Stable/Test1-Test7 与 Local-First 迁移详情见 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`、各版本 `release.json`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.1.0 / Build10108`，继续冻结，是当前稳定恢复基线。
- Latest：仍指向 Stable `0.1.0 / Build10108`，不修改。
- Test：`0.2.0-test.2 / Build20002`，Pornhub V2 Device Fix 2，等待实机复测。
- Test Shell：`apps/video/pornhub/pornhub_remote_test_v4_b20002.txt`，rule version `2026082603`。
- Test Release：`apps/video/pornhub/releases/0.2.0-test.2/release.json`。
- Superseded V2 Test：`0.2.0-test.1 / Build20001`，用户实机确认 **部分失败**，冻结不原地覆盖。
- Recovery Test：`0.1.1-test.2 / Build10202`，Local-First 基础链曾获用户实机通过，仅保留为迁移恢复参考。
- Stable 晋级来源：`0.1.0-test.7 / Build10107`。
- 数据源：`https://www.pornhub.com/`。

## 2026-08-26 · 0.2.0-test.2 / Build20002 · Route Boundary + Creator Center

### Test1 当前实机事实
用户在 `0.2.0-test.1 / Build20001` 实机验证得到：

1. 首页和创作者列表能打开。
2. 分类二级进入后标题直接显示 `%E7%...` 形式的 percent-encoded 中文，内容为空，并提示页面返回异常或验证页。
3. 视频详情进入后显示“详情加载失败”。
4. 创作者的演员 / 频道 / 模特 / 用户数据可以解析，但 UI 为四个普通按钮 + 大输入框 + 单列 `avatar`，视觉像调试列表，不够成熟。

因此 Test1 不能继续标记为“待验证”，而是正式记录为 **partial-fail**。

### 根因：Page Route Parameter Contract
V2 Test1 页面构造统一使用：

```text
page(path, params)
→ encodeURIComponent(param)
→ hiker://page/...
```

但实机证明当前海阔在此链路中 `getParam()` / 页面参数对象可能仍返回编码后的字符串，例如：

```text
%E7%86%9F%E5%A5%B3...
https%3A%2F%2Fwww.pornhub.com%2Fview_video.php%3Fviewkey%3D...
```

旧 `param()` 对 `getParam()` 的返回值直接 `return String(v)`，没有在 Page Boundary 恢复，因此：

```text
分类名 n
→ 直接显示 %E7...

分类 URL u
→ CategoryProvider 收到 https%3A%2F%2F...
→ 请求地址失效
→ 分类二级为空

详情 URL u
→ VideoProvider.detail() 收到编码字符串
→ Request.get() 无法请求真实详情 URL
→ 详情加载失败
```

Test2 固定修复：

```text
MY_PARAMS / getParam / MY_URL
→ decodeParam()
→ Page Model 参数
→ Provider
```

`decodeParam()` 只在检测到 `%xx` 时执行一次 `decodeURIComponent`，把跨页参数恢复责任放在页面边界，不污染各 Provider。

### 创作者中心 UI 重构
参考项目中已保存的 Hiker Gallery 组件样本，确认海阔存在并可用于人物类 UI 的：
- `icon_small_4`
- `icon_2_round`
- `avatar`

Test2 不改 `CreatorProvider` / 人物 Parser，只重做 Creator Center 页面：

```text
创作者中心
→ 演员 / 频道 / 模特 / 用户 四宫格图标入口（icon_small_4）
→ 当前类型搜索
→ 当前类型标题 + 本页数量
→ 双列圆图人物卡（icon_2_round）
```

新增本地图标：
- `channel.svg`
- `model.svg`

演员继续使用 `creators.svg`，用户继续使用 `account.svg`。

人物原始辅助文本若出现：

```text
pornstar · 613 Videos
channel · 120 Videos
```

UI 层按类型语义转换为中文显示；类型已由当前分区明确时，不再让每一行重复堆叠英文 `pornstar`。

### Test2 Runtime 组成
Test2 继续使用单一 Standalone Local-First Runtime，不恢复历史 Patch Stack。

```text
01_kernel.part                     ← Test2，修 Page 参数边界
02_store_session_request.part      ← 复用 V2 Test1
03_parsers_models.part             ← 复用 V2 Test1
04_providers_actions_playback.part ← 复用 V2 Test1
05_ui_helpers.part                 ← 复用 V2 Test1
06_home_search_category_detail.part← 复用 V2 Test1
06b_creator_center.part            ← Test2，独立 Creator Center Page Module
07_creator_library_account_extras.part ← 复用 V2 Test1
08_runtime_export.part             ← 复用 V2 Test1
```

共：

```text
9 Runtime Parts
+ 19 Local SVG
= 28 immutable sources
```

Source snapshot：`235dbed2a6b3c2bc99b8d7a553fae4394fac524e`。

Builder：
- `apps/video/pornhub/releases/0.2.0-test.2/local_bundle_builder.js`
- ref `904e2e3144441a4bef606fc7f4bfbfd3e0c0d2a1`

Entry：
- `apps/video/pornhub/releases/0.2.0-test.2/local_entry.js`
- ref `f2d0fcaaf12a41ecd6da3dcbaa503f6b67b13082`

Shell：
- `apps/video/pornhub/pornhub_remote_test_v4_b20002.txt`
- ref `828974bfc29328d03dd6d7e93352e88b281f84a4`
- blob `65aa754f8847516e135c6ce70401eabce6f8af80`
- rule version `2026082603`

Local root：

```text
hiker://files/rules/asset-core-local/pornhub-test/b20002/
```

### 当前验证状态
发布前静态门禁已经通过：
- 新 Kernel fragment 语法检查。
- Creator Center module 语法检查。
- Builder `node --check`。
- Entry `node --check`。
- Shell 外层 JSON 解析。
- Shell `pages` 二层 JSON 解析。
- 17 个页面声明保持完整。
- Source marker / Local asset / Remote Residual Gate 保持开启。

仍必须实机复测：
1. 分类二级标题是否恢复正常中文。
2. 分类二级是否有视频列表。
3. 视频详情是否恢复。
4. 详情进入后播放是否正常。
5. 创作者中心四类入口的实际尺寸、留白和双列人物卡效果。
6. 创作者详情是否正常。

在以上实机通过前，`0.2.0-test.2` 禁止晋级 Stable。

## Pornhub V2 长期架构事实
V2 不再继承旧 Test1-Test7 Patch Stack 作为运行时架构。长期边界：

```text
Product Blueprint
→ Model / Store / Session / Request
→ Parser
→ Providers / Actions / Playback
→ Native UI Helpers
→ Page Modules
→ Standalone Runtime Export
```

主要一等实体：
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

账号安全固定原则：

```text
Cookie 存在 ≠ 已确认账号身份
/user/security 取得可靠 username
→ 才允许把收藏 / 历史 / 订阅标记为“我的”
```

小程序不保存账号密码、验证码或二次验证信息。

Shorts / Playlist 固定实体门槛：

```text
Short = 真实 URL + 标题 + 封面
Playlist = 真实 URL + 标题 + 封面
```

字段不完整时宁可空态，不制造伪卡。

同级 Tab / 筛选属于 State Change，优先同页动态刷新，不通过不断新开页面累积返回栈。

## 历史恢复索引
- Local-First 前完整历史：`apps/video/pornhub/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
- Stable：`apps/video/pornhub/releases/0.1.0/release.json`
- Failed Local-First Test1：`apps/video/pornhub/releases/0.1.1-test.1/release.json`
- Recovery Local-First Test2：`apps/video/pornhub/releases/0.1.1-test.2/release.json`
- Pornhub V2 Test1：`apps/video/pornhub/releases/0.2.0-test.1/release.json`
- Pornhub V2 Test2：`apps/video/pornhub/releases/0.2.0-test.2/release.json`
