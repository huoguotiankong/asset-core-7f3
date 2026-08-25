# JavBus Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Stable2.0.0 / Test alpha1-alpha4 / 磁力与域名历史已归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`2.0.0 / Build20005`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `2.0.0`，不随本轮 Local-First Test 变化。
- Test：`2.0.1-test.1 / Build20101`，Shell `apps/video/javbus/javbus_remote_test_localfirst_v1_b20101.txt`，rule version `2026082516`。
- Previous Test：`2.0.0-alpha4 / Build20004`，Stable2.0.0 的晋级来源，保留为历史对照。
- Shared JAV Playback Stable：`1.0.0-test.4`；Test1 将其执行闭包嵌入本地 Runtime，不移动共享 Stable 指针。
- Domain Config：`apps/video/javbus/domains.json`；Test1 首次安装同步为本地文件，普通启动不再自动读取 GitHub 控制面。

## 2026-08-25 · Test1 基础实机验收
用户实机打开 `JavBus · 本地化诊断`，截图确认：

```text
JavBus 2.0.1-test.1
Build 20101 · Native Local-First
本地 Runtime 已就绪
Source b6ca12089d2e · 12 源 · 106804 bytes
```

### 已确认
- Test Shell 已正确覆盖到 `2.0.1-test.1 / Build20101`。
- `local_entry.js → local_bundle_builder.js → runtime_bundle.js` 的本地构建/加载链在海阔实机可运行。
- bundle 元数据回读正常，source 数量与 Release 设计一致：12。
- 本地 Runtime 实际生成，诊断页报告大小 `106804 bytes`。
- 诊断页已能显示“共享播放 SDK / 域名控制面 / 业务基线”三个 Local-First 状态块。

### 仍未由本张截图逐项证明
- 首页 / 搜索 / 分类 / 演员 / 收藏等所有业务页均与 Stable2.0.0 等价。
- ABF-379 等磁力页在 Test1 中仍返回与 Stable 相同数据。
- MissAV / 123AV / Jable 三个 Provider 均已逐一点击并完成播放。
- 屏蔽 GitHub/CDN 后的冷启动/二次启动离线控制面回归。

因此当前状态记为：**Local-First 基础实机诊断通过，业务回归继续观察；不得仅凭本张诊断截图自动晋级 Stable。**

## 2026-08-25 · 2.0.1-test.1 / Build20101 · Stable-derived Local-First

### 迁移边界
本轮严格从 Stable `2.0.0 / Build20005` 重新 rebase，只改变交付、启动与远程控制面，不主动修改：
- JavBus 列表、搜索、分类、演员、详情 Parser。
- 收藏数据与旧 Apollo 收藏兼容读取。
- alpha3 已有实机成功记录的磁力 `gid/uc/img → AJAX → regex Parser → WebView fallback` 主链。
- alpha4 原图预览和紧凑第三方播放 UI。
- MissAV / 123AV / Jable 的 Shared JAV Playback Provider 业务逻辑。
- 磁力长按 迅雷 / PikPak / 123云盘 / 光鸭云盘合同。

Stable2.0.0 / Latest 保持原文件、原版本、原 build，不被本轮覆盖。

### Stable 真实执行闭包
Stable2.0.0 除表层 Release 外还存在三类运行时远程依赖：
1. `JavBusCore.loadPlayback()` / `playbackUrl()` 会重新下载 `shared/jav-playback/manager.js`，Manager 再读取 channels/SDK；Provider 点击回调还可能再次重入远程 Manager。
2. Stable Domain Adapter 在配置缓存超过 6 小时时会自动读取仓库 `domains.json`。
3. alpha4 的 123AV 图标直接引用仓库 Raw SVG。

所以只本地化 Core/Runtime/Patch 不算完成。

### Test1 完整本地执行闭包
首次安装固定 12 个源码/资产单元：

```text
8 个 JavBus 模块：
Core + Compat + Runtime
+ alpha2 + alpha3 + alpha4 + Stable Patch
+ Local-First final overlay

另外：
+ Shared JAV Playback test.2 base
+ Shared JAV Playback test.4 Stable overlay
+ 123AV SVG
+ domains.json
```

本地目录：

```text
hiker://files/rules/asset-core-local/javbus-test/b20101/
├─ local_entry.js
├─ local_bundle_builder.js
├─ runtime_bundle.js
├─ bundle_meta.json
├─ 123av.svg
└─ domains.json
```

正常链路：

```text
JavBus Test Shell / rule 2026082516
→ local_entry.js
→ local_bundle_builder.js
→ 首次安装 immutable source snapshot
→ runtime_bundle.js + bundle_meta + 123av.svg + domains.json
→ 后续正常启动 $.require('javbus')
→ require(file:// runtime_bundle.js)
→ JavBusLocalRuntime.module()
```

正常二次启动不再加载 Stable/Test Bootstrap、Remote Manager、远程业务模块、远程 Shared Playback Manager/channels/SDK、远程 123AV 仓库图标或 GitHub `domains.json` 自动控制面。网站页面、图片、JavBus AJAX 磁力接口和第三方播放站点仍属于业务网络，不属于程序代码交付。

### Shared JAV Playback 本地重入
Test1 内嵌当前 Stable SDK `1.0.0-test.4`，Provider 点击回调改为重新进入当前本地 JavBus：

```text
$.require('javbus').localPlayback()
→ sdk.resolve(...)
```

禁止恢复 `eval(fetch(manager.js))` 或其它点击时远程业务代码重入。

### Domain Control Local-First
普通启动/普通请求使用：

```text
本地 domains.json
→ 静态四域兜底
→ 最后成功域名优先
→ 页面业务指纹健康检查
→ 自动切换
```

不再因为 6 小时缓存到期自动访问 GitHub。设置页“同步域名列表”只有用户主动点击时才远程刷新本地 `domains.json`。

当前本地域名基线：
- `https://www.javbus.com`
- `https://www.busjav.cyou`
- `https://www.fanbus.bond`
- `https://www.buscdn.bond`

### 磁力主链冻结
2026-08-23 用户实机确认 ABF-379 独立磁力页成功返回 3 条资源（5.19GB / 2.66GB / 1.73GB）。Test1 不重写 alpha3 Parser/AJAX，只把相同源码纳入 Runtime Bundle。若 Test1 磁力退化，优先排查 Runtime 合成顺序、当前域名/Referer 和执行上下文，禁止先改已经验证的 Parser。

### Local-First 诊断合同
`javbusLocalFirst` 页面用于查看：
- `2.0.1-test.1 / Build20101`。
- Runtime Bundle ready 状态。
- immutable source ref。
- source 数量与 Runtime 字节数。
- Shared Playback 本地版本。
- 当前活动 JavBus 域名。
- 本地包重建。
- 不含 Cookie/Token/Authorization 的诊断摘要。

### 继续验收清单
在晋级 Stable 前仍需关注：
1. 首页 / 搜索 / 分类 / 演员 / 演员详情 / 收藏 / 更多 / 设置无回归。
2. 影片详情与独立预览保持原图。
3. ABF-379 或其它明确有磁力的影片数据不比 Stable2.0.0 退化。
4. MissAV / 123AV / Jable 实际点击不退回远程 Playback Manager。
5. “重新检测可用域名”只重置本地选择；“同步域名列表”只在主动点击时访问仓库。
6. 有条件时在首次安装完成后屏蔽 GitHub/CDN重开，程序代码/UI 仍应可进入。

## 恢复与回退
- 正式恢复入口：Stable `2.0.0 / Build20005`。
- 当前 Local-First Test：`2.0.1-test.1 / Build20101`。
- Test1 出现问题时冻结当前 immutable release，从 Stable2.0.0 新建更高 Test build 修复；禁止原地覆盖 Test1 资产。
- `2.0.0-alpha4` 继续保留为历史晋级来源，但不再作为后续 Test 的开发基线。

## 长期不可回退事实
- 演员分页使用 `/{typePrefix}/actresses/{page}`，第一页显式 `/1`；旧 `/actresses + .avatar-box` 已被实机证伪。
- 同级有码/无码/欧美、排序和筛选必须当前页刷新，禁止反复压入新页面。
- alpha3 磁力 Parser/AJAX 主链已有实机成功证据，不能因 UI/本地化随意重写。
- 独立预览必须使用 sample 原图，不能把 thumb 放大成模糊大图。
- 第三方播放保持 MissAV / 123AV / Jable；Provider 逻辑属于 Shared JAV Playback，不复制成 JavBus 私有分叉。
- Local-First 完成定义包括点击回调与可变控制面传递依赖，不能只本地化顶层 Runtime。

## 历史
- Local-First 迁移前完整历史：`apps/video/javbus/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
