# MyAv Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Test1-Test11 / Stable0.1.0 / 筛选、索引、磁链与收藏历史已原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.1.0 / Build10112`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `0.1.0`，本轮不修改。
- Test：`0.1.1-test.1 / Build10201`，Native Local-First Candidate，已完成基础 Runtime 实机确认；完整业务回归仍未宣称通过。
- Test Shell：`apps/video/myav/myav_remote_test_localfirst_v1_b10201.txt`，rule version `2026082522`。
- Previous Test：`0.1.0-test.11 / Build10111`，Stable0.1.0 的晋级来源，保留为历史对照。
- 数据源：`https://javlist.me/`。
- Shared JAV Playback Stable：`1.0.0-test.4`，Provider：MissAV / 123AV / Jable。

## 2026-08-25 · 0.1.1-test.1 基础实机确认
用户海阔实机截图确认：
- 页面标题：`MyAv · 本地化诊断`。
- 版本：`0.1.1-test.1 / Build10201`。
- 状态：`本地 Runtime 已就绪`。
- Source 前缀：`15bec4419cfd`。
- 本地闭包：`28 源`。
- Runtime：`152195 bytes`。
- 诊断页可见 `共享播放SDK / 应用图标 / 业务基线` 三项状态卡。

这条证据只证明 **Local-First 本地包的构建、写入、回读和 Runtime 加载主链正常**。当前截图没有逐项证明高级筛选、磁力、MissAV/123AV/Jable、账号等业务回归，因此这些项目继续保留在后续验收清单，不得虚记为全部通过。Stable/Latest 继续冻结。

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Stable-derived Local-First

### 迁移边界
本轮只迁移交付、启动和程序代码控制面，不主动改 Stable0.1.0 已有业务：
- 有码 / 欧美 / 国产 / 无码频道。
- 高级筛选“结果 URL + 完整 Ttype=2 控制 URL”双链。
- 九类片商 / 女演员 / 男演员 / TAG 索引与实体页。
- 首页 / 搜索 / 排行榜 / 详情 / 预览。
- 影片收藏、演员收藏、浏览历史及各自排版。
- 详情磁力 Parser 与 迅雷 / PikPak / 123云盘 / 光鸭云盘长按合同。
- MissAV / 123AV / Jable Provider 业务解析逻辑。

Stable0.1.0 / Latest 原文件、原 build、原 Shell/Bootstrap 全部冻结。

### Stable 真实执行闭包
Stable `0.1.0 / Build10112` 的 Release 共 24 个表层模块项，其中 23 个属于 MyAv 自身历史业务/补丁链，第 24 个是 `shared/jav-playback/manager.js`。

审计确认不能只把 23 个 MyAv 文件放本地：
1. Stable Shell 正常入口仍要远程 `bootstrap_stable_v1_b10112.js → Remote Manager → Release`。
2. Stable/Test 历史 Settings 中维护动作会在点击时重新 `require` Bootstrap。
3. Test2 `C.appIcon` 指向仓库 Raw SVG。
4. `JAVPlaybackManager.load('stable')` 会远程读取 `shared/jav-playback/channels.json` 和 SDK。
5. Shared SDK `1.0.0-test.4` 自身又会远程读取 `1.0.0-test.2` 基线。
6. Shared SDK 的 `providerUrl()` 和 MissAV 选择回调在真正点击时还会重新 fetch Playback Manager。
7. 123AV 图标继续引用仓库 SVG。

这些都属于 Local-First 的传递依赖或点击时重入，不能漏掉。

### Test1 完整本地执行闭包
本轮固定 **28 个源码/资产单元**：

```text
23 个 Stable MyAv 业务模块（原顺序不变）
+ 1 个 Local-First final overlay
+ Shared JAV Playback 1.0.0-test.2 base
+ Shared JAV Playback 1.0.0-test.4 Stable overlay
+ 123AV SVG
+ MyAv app icon SVG
= 28 sources
```

23 层 Stable 业务模块原顺序冻结为：

```text
Core
→ Image Patch2
→ Core Patch3/4/5/6/9/10/11
→ Runtime
→ Runtime Patch2
→ UI Patch3/4/5
→ UI6 A/B/C
→ Version Patch7
→ UI Patch8/9/10/11
→ Stable Patch
```

Local-First Overlay 只在这条 Stable 链全部加载完成后接管：版本身份、本地图标、Shared Playback 本地 Manager shim、Settings 的远程维护入口。

### 新运行链
```text
MyAv Test Shell / rule 2026082522
→ hiker://files/rules/asset-core-local/myav-test/b10201/local_entry.js
→ local_bundle_builder.js
→ 首次安装：从 immutable source ref 下载 28 个源码/资产单元
→ runtime_bundle.js + bundle_meta.json + 123av.svg + myav_icon.svg
→ 后续正常启动 $.require('myav')
→ require(file:// runtime_bundle.js)
→ MyAvLocalRuntime.module()
```

正常二次启动不再加载：
- Stable/Test Bootstrap。
- `libs/updater/remote_manager.js`。
- 远程 MyAv Core/Runtime/UI/Patch。
- Shared JAV Playback Manager/channels/SDK 代码。
- 远程 123AV 仓库图标。
- 远程 MyAv 仓库图标。

`javlist.me` 页面、图片、WebView、磁力数据和第三方播放站点请求仍属于业务网络，不属于程序代码交付。

### Shared JAV Playback 本地重入
Test1 在本地 Runtime 中建立 `JAVPlaybackManager` 本地 shim，`load()` 直接返回内嵌的 Stable SDK `1.0.0-test.4`。

Provider 点击回调改为：

```text
$.require('myav').localPlayback()
→ sdk.resolve(provider, code)
```

MissAV 版本选择回调同样重新进入当前本地 MyAv Runtime，再调用 `resolveMissavVariant()`。禁止恢复点击时 `eval(fetch(manager.js))`。

### 本地图标
- Shared 123AV 图标写入 `hiker://files/rules/asset-core-local/myav-test/b10201/123av.svg`。
- MyAv 应用图标写入 `.../myav_icon.svg`。
- Runtime 的 `C.appIcon / R.appIcon` 改指本地图标。
- Test Shell 自身使用既有外部展示图标，不再把仓库 Raw SVG 作为规则壳图标。

### Local-First 诊断
新增 `myavLocalFirst` 页面，可查看：
- `0.1.1-test.1 / Build10201`。
- Runtime ready 状态。
- immutable source ref。
- source 数量、Runtime 字节数。
- Shared Playback 本地版本。
- 本地 MyAv 图标状态。
- Stable 业务基线。
- 重建本地包。
- 不含 Cookie/Token/Authorization 的诊断摘要。

### 实机验收
当前第 1-3 项的基础 Runtime 主链已经由用户截图确认，但其余业务项目仍需按需回归：
1. “我的规则仓库”同步/覆盖 Test 后显示 `0.1.1-test.1 / Build10201`。
2. 首次打开可成功构建本地包。
3. 本地化诊断显示 Runtime ready、28 sources、152195 bytes、Shared Playback / 应用图标 / 业务基线状态卡。
4. 首页 / 搜索 / 高级筛选 / 分类中心 / 索引列表 / 演员库 / 排行榜无回归。
5. 详情 / 原图预览 / 影片收藏 / 演员收藏 / 浏览历史无回归。
6. 至少验证一部明确有磁力的影片，磁力数据与长按入口不退化。
7. 实际点击 MissAV / 123AV / Jable，确认 Provider 点击时不再退回远程 Playback Manager。
8. 如条件允许，首次安装完成后屏蔽 GitHub/CDN再重开；程序代码/UI 应仍能进入，业务站点仍需正常网络。

## 恢复与回退
- 正式恢复入口：Stable `0.1.0 / Build10112`。
- 当前 Local-First Test：`0.1.1-test.1 / Build10201`。
- Test1 失败时冻结该 immutable release，从 Stable0.1.0 新建更高 Test build 修复，禁止原地覆盖 Test1 资产赌缓存刷新。
- `0.1.0-test.11 / Build10111` 继续保留为 Stable 晋级来源，但不再作为新 Test 的开发基线。

## 长期不可回退事实
- 高级筛选必须保持结果 URL 与完整 Ttype=2 控制 URL 分离；不能再次从筛选结果页直接重建完整控制区。
- 九类分类索引动态发现优先、固定兜底继续保留。
- 详情元数据只在影片资料作用域解析，禁止再次把站点导航/广告词当演员、系列或 TAG。
- 影片收藏与演员收藏必须使用独立排版 key。
- 导入 Shell 保持中性页面名，避免复发平台违禁词扫描事故。
- Local-First 完成定义包含传递依赖、静态仓库资产和点击回调重入，不是“顶层 Runtime 已在本地”即可。

## 历史
- Local-First 前完整历史：`apps/video/myav/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
