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
本轮只迁移交付与启动架构，不主动改变 Stable3.9.42 的：
- JavDB API / 签名 / 登录 / Token / Cookie。
- 首页、排行、分类、演员、我的、更多、搜索、详情、评论与资料库 UI/业务逻辑。
- JavDB 官方 VIP 播放、官方预览、官方磁链。
- 已晋级的 Shared JAV Playback `1.0.0-test.4` Provider 业务逻辑。

Stable3.9.42 / Latest 保持原文件、原版本、原 build，不被本轮覆盖。

### 真实 Stable 执行闭包
审计 Stable `cloud/javdb/v3.9.42/runtime.js` 后确认，不能只把表层 `runtime.js` 放到本地。完整代码闭包实际包括：

1. Core 压缩分片 7 个：`core_00.txt ... core_06.txt`。
2. Custom 压缩分片 9 个：`custom_00 ... custom_04 + custom_04b + custom_05 + custom_06 + custom_07b`。
3. Stable 补丁链 6 层：Test1 / Test2 / Test3 / Test4 / Test5 / Stable Patch。
4. 本轮 `final_local_patch.js`。
5. Shared JAV Playback `1.0.0-test.2` 基线 + `1.0.0-test.4` Stable overlay。
6. 123AV 图标资产。

只本地化顶层 Runtime 会导致正常启动或“更多播放”点击阶段继续访问 GitHub，因此不算 Local-First 完成。

### 新运行链
```text
JavDB v3 Test Shell / rule 2026082514
→ hiker://files/rules/asset-core-local/javdb-v3-test/b2026082501/local_entry.js
→ local_bundle_builder.js
→ 首次安装：从 immutable source ref 下载完整 26 个源码/资产单元
→ 生成 runtime_bundle.js + bundle_meta.json + 123av.svg
→ 后续正常启动：$.require('javdb3')
→ require(file:// runtime_bundle.js)
→ JDBCLOUD.core/custom/playback
```

正常二次启动不再加载：
- Stable 远程 `runtime.js`。
- Remote Bootstrap / Remote Manager。
- 远程 Patch。
- `shared/jav-playback/manager.js` / `channels.json`。
- Shared Playback base SDK 远程代码。

网站业务 API、图片、视频、WebView 等网络请求仍按 JavDB/第三方站点本身需要发生；Local-First 只描述程序代码与控制面交付。

### Direct eval 作用域硬约束
JavDB 历史已经发生过 `JDB 未定义`：把 `eval(Core)` 抽到 helper 后，Core 中创建的 `var JDB` 只存在于 helper 局部作用域。

因此本轮生成 Runtime 明确保持：
```text
core():
  ungzip Core
  → eval(Core)
  → eval(Patch1..PatchN)
  → eval(call)

custom('javdb3ExternalPlay'):
  ungzip Core
  → eval(Core)
  → eval(Patch1..PatchN)
  → JDB.externalPlayPage()
```

禁止再抽成 `loadCore()/applyPatches()` 后假设 `JDB` 跨函数可见。`node --check` 只能证明 parse，不足以证明 direct-eval scope 正确。

### Shared JAV Playback 本地闭包
Stable3.9.42 的 `app_parity_patch2.js` 会在更多播放页执行：
```text
fetch(shared/jav-playback/manager.js)
→ Manager fetch channels.json
→ fetch SDK
```
而 SDK2/SDK4 内的 `providerUrl` / MissAV 选择回调又会在用户点击时重新 fetch Manager。

Test1 不改 123AV/Jable/MissAV 的 Provider 解析业务，而是把 Stable SDK 生成进当前本地 Runtime，并把点击时重入改为：
```text
$.require('javdb3').playback()
```
因此第三方播放页与真正点击 Provider 都不再依赖私人 GitHub 业务代码。

123AV 原仓库 SVG 同步落到当前本地包；MissAV/Jable favicon 仍属于站点图片资源，不属于程序执行代码。

### Local-First 诊断
新增 `javdb3LocalFirst` 页面，可查看：
- `3.9.44-test.1 / Build2026082501`。
- bundle ready 状态。
- immutable source ref。
- source 数量、Runtime 字节数。
- Shared Playback 本地化版本。
- 本地包重建。
- 可复制不含 Token/Cookie/Authorization 的诊断摘要。

### 静态门禁
- `final_local_patch.js`：`node --check` 通过。
- `local_bundle_builder.js`：`node --check` 通过。
- `local_entry.js`：`node --check` 通过。
- Builder mock 安装可生成单 `runtime_bundle.js`，生成结果通过 `node --check`。
- Shell 外层规则 JSON 与 `pages` JSON 已解析通过。
- 规则页合计 35：本地主模块 + Stable 原 33 业务页 + 本地化诊断。
- rule version `2026082514` 与 Build `2026082501` 均在 32 位有符号整数安全范围内。

### 实机验收
Test1 仍是 **pending device validation**，在以下项目完成前不得晋级 Stable：
1. 从“我的规则仓库”同步/覆盖 Test 后，应显示 `3.9.44-test.1 / Build2026082501`。
2. 首次打开允许一次本地包构建等待；首页正常进入。
3. 完全退出后第二次打开，确认明显走本地 Entry + Runtime Bundle，不再经过远程 Runtime/Bootstrap。
4. 回归：首页 / 排行 / 分类 / 演员 / 我的 / 更多 / 搜索 / 影片详情 / 评论 / 账号。
5. 回归 JavDB 官方 VIP 播放、官方预览、官方磁链，不得因交付迁移退化。
6. 重点回归“更多播放 → 123AV / Jable / MissAV”，尤其点击 Provider 后不能退回远程 Playback Manager。
7. 打开“本地化诊断”，应显示 bundle ready、26 sources、Shared Playback local 状态。
8. 如条件允许，在已经成功首次安装后屏蔽 GitHub/CDN，再重新打开程序；程序代码/UI 应仍能进入，站点业务数据仍需正常网络。
9. 任一账号、播放、分类、图片、搜索或自定义模块行为与 Stable3.9.42 不一致，均视为 Runtime 合成/作用域/点击重入回归，禁止晋级 Stable。

## 恢复与回退
- 当前正式恢复入口：Stable `3.9.42 / Build2026082301`。
- 当前 Local-First Test：`3.9.44-test.1 / Build2026082501`。
- Test1 失败时冻结该 immutable release；从 Stable3.9.42 新建更高 Test build 修复，不原地覆盖 Test1 资产。
- `3.9.43-test.3` 继续保留为历史远程传输恢复实现，但不作为新的 Local-First recovery base。
- `3.9.41-local` 继续独立保留。

## 历史
- 完整迁移前历史：`apps/video/javdb/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
