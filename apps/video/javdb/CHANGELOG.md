# JavDB v3 Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Stable3.9.42 / Test3.9.43 / Local3.9.41 历史原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`3.9.42 / Build2026082301`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `3.9.42`，本轮不修改。
- Test：`3.9.44-test.1 / Build2026082501`，Shell `cloud/javdb/v3.9.44-test.1/javdb_v3.9.44_test1_localfirst.txt`，rule version `2026082514`。
- Previous Test：`3.9.43-test.3 / Build2026082304`，远程传输恢复版，保留为历史回退参考。
- Local：`3.9.41-local / Build2026082103`，独立 Pure Local 分享/恢复链，本轮不修改。
- Shared JAV Playback Stable：`1.0.0-test.4`；Local-First Test 将其执行闭包嵌入本地 Runtime，不移动共享 Stable 指针。

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
- 当前 Local-First Test：`3.9.44-test.1 / Build2026082501`，基础实机验证已通过。
- Stable 当前不自动晋级；如 Test 后续发现业务回归，冻结当前 immutable release，从 Stable3.9.42 新建更高 Test build 修复，不原地覆盖。
- `3.9.43-test.3` 保留为历史远程传输实现；`3.9.41-local` 独立保留。

## 历史
- 完整迁移前历史：`apps/video/javdb/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
