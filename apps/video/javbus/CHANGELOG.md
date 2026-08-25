# JavBus Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Stable2.0.0 / Test alpha1-alpha4 / 磁力与域名历史原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`2.0.0 / Build20005`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `2.0.0`，本轮不修改。
- Test：`2.0.1-test.1 / Build20101`，Shell `apps/video/javbus/javbus_remote_test_localfirst_v1_b20101.txt`，rule version `2026082516`。
- Previous Test：`2.0.0-alpha4 / Build20004`，Stable 2.0.0 的晋级来源，保留为历史对照。
- Shared JAV Playback Stable：`1.0.0-test.4`；Local-First Test 将其执行闭包嵌入本地 Runtime，不移动共享 Stable 指针。
- Domain Config：`apps/video/javbus/domains.json`；Local-First Test 首次安装时同步为本地文件，普通启动不再自动读取 GitHub 控制面。

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

### Stable 真实执行闭包审计
Stable `2.0.0` 的表层 release 不是完整执行闭包，实际还存在两类运行时远程依赖：

1. `JavBusCore.loadPlayback()` / `playbackUrl()` 会在第三方播放入口和用户真正点击 Provider 时重新下载 `shared/jav-playback/manager.js`，Manager 再读取 channels/SDK。
2. `stable_patch.js` 的 Domain Adapter 会在域名配置缺失或缓存超过 6 小时时自动下载仓库 `domains.json`。
3. alpha4 的 123AV 图标仍直接引用仓库 Raw SVG。

因此只把 Core/Runtime/Patch 放进本地包仍不算 Local-First。

### 本轮完整本地执行闭包
首次安装从不可变 source ref 固化 12 个源码/资产单元：

```text
8 个 JavBus 业务模块
= Core + Compat + Runtime
+ alpha2 + alpha3 + alpha4 + Stable Patch
+ Local-First final overlay

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

新运行链：

```text
JavBus Test Shell / rule 2026082516
→ local_entry.js
→ local_bundle_builder.js
→ 首次安装：immutable source snapshot
→ runtime_bundle.js + bundle_meta + 123av.svg + domains.json
→ 后续正常启动：$.require('javbus')
→ require(file:// runtime_bundle.js)
→ JavBusLocalRuntime.module()
```

正常二次启动不再加载：
- Stable/Test Bootstrap。
- Remote Manager。
- 远程 Core/Compat/Runtime/Patch。
- Shared JAV Playback Manager/channels/SDK 代码。
- 远程 123AV 仓库图标。
- GitHub `domains.json` 自动控制面。

网站页面、图片、JavBus AJAX 磁力接口以及第三方播放站点请求仍属于业务数据网络，不属于程序代码交付。

### Shared JAV Playback 本地重入
Stable Core 原实现：

```text
播放入口
→ fetch(manager.js)
→ load stable SDK
→ Provider lazyRule 点击时再次 fetch(manager.js)
```

Test1 内嵌当前 Stable SDK `1.0.0-test.4`，并把点击回调改成：

```text
$.require('javbus').localPlayback()
→ sdk.resolve(...)
```

因此页面首次显示播放按钮和真正点击 MissAV / 123AV / Jable 都重新进入当前本地 JavBus Runtime，不再回到远程 Manager。

### Domain Control Local-First
Stable2.0.0 的域名自动切换能力保留，但控制面调整为：

```text
普通启动/普通请求
→ 本地 domains.json
→ 静态四域兜底
→ 最后成功域名优先
→ 页面业务指纹健康检查
→ 自动切换
```

不再因为 6 小时缓存过期自动访问 GitHub。

设置页新增“同步域名列表”：只有用户主动点击时，才从仓库刷新本地 `domains.json`。这样既保持以后新增防屏蔽域名的维护能力，又不让正常启动依赖远程控制面。

当前本地域名基线：
- `https://www.javbus.com`
- `https://www.busjav.cyou`
- `https://www.fanbus.bond`
- `https://www.buscdn.bond`

### 磁力主链冻结
2026-08-23 用户实机已经确认 ABF-379 独立磁力页成功返回 3 条资源（5.19GB / 2.66GB / 1.73GB）。本次 Local-First 不重写 alpha3 Parser/AJAX，只把已经验证的相同源码原样纳入 Runtime Bundle。

以后如果 Local-First Test 磁力退化，优先排查 Runtime 合成顺序、当前域名/Referer 和页面执行上下文，不允许先修改已验证 Parser。

### Local-First 诊断
新增 `javbusLocalFirst` 页面，可查看：
- `2.0.1-test.1 / Build20101`。
- Runtime Bundle ready 状态。
- immutable source ref。
- source 数量与 Runtime 字节数。
- Shared Playback 本地版本。
- 当前活动 JavBus 域名。
- 本地包重建。
- 不含 Cookie/Token/Authorization 的诊断摘要复制。

### 静态门禁
- `final_local_patch.js`：语法门禁通过。
- `local_bundle_builder.js`：语法门禁通过。
- `local_entry.js`：语法门禁通过。
- Shell 外层规则 JSON 与嵌套 `pages` JSON 已构建解析通过。
- Test Shell 共 13 个页面：原 Stable 12 个业务页 + 本地化诊断。
- rule version `2026082516` 在 32 位有符号整数安全范围内。
- Builder 明确登记 12 个 source unit、8 个业务模块。

### 实机验收
Test1 当前状态：**pending device validation**。以下完成前不得晋级 Stable：
1. 从“我的规则仓库”同步并覆盖 Test，应显示 `2.0.1-test.1 / Build20101`。
2. 首次打开允许一次本地包安装；首页应正常进入。
3. 完全退出后第二次打开，确认本地 Entry + Runtime Bundle 正常。
4. 回归首页 / 搜索 / 分类 / 演员 / 演员详情 / 收藏 / 更多 / 设置。
5. 重点验证影片详情和独立预览仍使用原图。
6. 重点验证 ABF-379 或其它明确有磁力的影片，磁力数据不得比 Stable2.0.0 退化。
7. 实际点击 MissAV / 123AV / Jable，确认 Provider 点击回调没有退回远程 Playback Manager。
8. 打开“本地化诊断”，应显示 Runtime ready、12 sources、Shared Playback local、当前域名。
9. 设置页“重新检测可用域名”应只重置本地选择；“同步域名列表”仅在主动点击时访问仓库。
10. 如条件允许，首次安装完成后屏蔽 GitHub/CDN，再重新打开；程序代码/UI 应仍可进入，JavBus/播放站业务数据仍需正常网络。

## 恢复与回退
- 正式恢复入口：Stable `2.0.0 / Build20005`。
- 当前 Local-First Test：`2.0.1-test.1 / Build20101`。
- Test1 出现问题时冻结当前 immutable release，从 Stable2.0.0 新建更高 Test build 修复；禁止原地覆盖 Test1 资产赌缓存刷新。
- `2.0.0-alpha4` 继续保留为历史晋级来源，但不再作为后续 Test 的开发基线。

## 长期不可回退事实
- 演员分页使用 `/{typePrefix}/actresses/{page}`，第一页显式 `/1`；旧 `/actresses + .avatar-box` 已被实机证伪。
- 同级有码/无码/欧美、排序和筛选必须当前页刷新，禁止反复压入新页面。
- alpha3 磁力 Parser/AJAX 主链已有实机成功证据，不能因 UI/本地化随意重写。
- 独立预览必须使用 sample 原图，不能把 thumb 放大成模糊大图。
- 第三方播放保持 MissAV / 123AV / Jable；Provider 逻辑属于 Shared JAV Playback，不复制成 JavBus 私有分叉。
- Local-First 完成定义包括点击回调与控制面传递依赖，不能只本地化顶层 Runtime。

## 历史
- Local-First 迁移前完整历史：`apps/video/javbus/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
