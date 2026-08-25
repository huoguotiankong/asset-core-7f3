# Pornhub Changelog

> 当前恢复入口。Local-First 迁移前的 Test1-Test7 / Stable0.1.0 / 账号、评论、Shorts、片单与播放历史已归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.1.0 / Build10108`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `0.1.0`，本轮不修改。
- Test：`0.1.1-test.2 / Build10202`，Native Local-First Candidate，等待海阔实机验证。
- Test Shell：`apps/video/pornhub/pornhub_remote_test_localfirst_v2_b10202.txt`，rule version `2026082524`。
- Failed Test：`0.1.1-test.1 / Build10201`，已冻结，不允许原地覆盖。
- Stable 晋级来源：`0.1.0-test.7 / Build10107`，继续保留为历史对照。
- 数据源：`https://www.pornhub.com/`。

## 2026-08-25 · 0.1.1-test.2 / Build10202 · Local-First Residual Gate Repair

### 用户当前实机结果
Test1 首次打开在 Runtime 构建阶段被硬门禁主动拒绝，实机错误为：

```text
Pornhub解析失败！
Error: Runtime 仍残留远程代码/资产依赖：
raw.githubusercontent.com/huoguotiankong/asset-core-7f3
```

因此 Test1 不得标记为“基础通过”，也不得晋级 Stable。该版本保持 immutable，后续修复必须使用更高 Test build。

### Test1 失败定位
Test1 的方向本身正确：
- 15 层 Stable 业务模块原顺序冻结。
- 15 个仓库 SVG 纳入本地包。
- 旧 `lazyRule` 的 `C.bootstrap` 计划重定向到本地 Bootstrap Shim。
- Runtime 最终保留私人仓库 URL / Remote Manager 硬门禁。

问题出在 **Runtime 合成前的清洗器不够确定性**。Test1 主要依赖 URL 形态正则替换；真实设备证明，至少有一处历史远程字符串没有被该策略可靠清除，最终被硬门禁正确拦截。

同时核对海阔官方 JS 文档：`batchFetch()` 返回与输入顺序一致的字符串数组，超过 16 项时自动分批同步循环。因此这次不能把错误简单归因于“batchFetch 返回包装对象”。Test2 仍保留防御性正文归一化，但真正修复重点放在源码 marker 校验和确定性重写。

### Test2 修复原则
本轮仍只改交付 / 启动 / 本地代码控制面，不主动修改 Stable0.1.0 的业务 Parser、账号、评论、Shorts、片单或播放协议。

Test2 新 Builder：
1. **每个 JS 源必须命中精确 marker**，否则该批量结果无效并自动回退单源下载。
2. 批量/单源结果统一经过 `bodyOf()` 正文归一化；如果未来运行时返回对象，优先读取 `body/content`。
3. Pornhub SVG 资产根不再只靠宽泛正则，改为三个已知仓库根的精确字符串替换：Raw / jsDelivr / GitHub WebRaw。
4. 历史 Core Patch / Stable Patch 的 `C.bootstrap='...'` 不再依赖 URL 结构匹配，直接按 **赋值语句** 重写为当前本地 `local_bootstrap.js`。
5. 仍额外保留三类 Bootstrap URL 的明确规则作为第二层兜底。
6. 每个模块清洗完成后立即执行私人仓库残留检测；若失败，错误必须包含 **具体模块路径 + 附近上下文**，不能只报一个域名。
7. 所有模块拼成 Runtime 后再次执行全局硬门禁；门禁没有放宽。
8. `bundle_meta.json` 新增 `rewrites` 与 sanitizer 标识，便于实机诊断。

### Test2 完整本地闭包
仍固定 31 sources：

```text
15 个 Stable 业务模块
+ 1 个 Test2 Local-First final overlay
+ 15 个 Pornhub SVG 资产
= 31 sources
```

Stable 业务模块原顺序：

```text
Core Test1
→ Core Patch2/3/4/5/6/7
→ Runtime Test1
→ UI Patch2/3/4/5/6/7
→ Stable Patch
→ Test2 Local-First Overlay
```

本地化 SVG：
`account / banner / categories / comment / creators / favorite / feed / gifs / history / home / icon / local / search / shorts / subscribe`。

### Test2 运行链
```text
Pornhub Test Shell / rule 2026082524
→ hiker://files/rules/asset-core-local/pornhub-test/b10202/local_entry.js
→ local_bundle_builder.js
→ 首次安装：immutable Source Ref 下载 31 sources
→ 每源 marker / 正文校验
→ C.bootstrap 赋值重写 + 资产根本地化
→ 每模块残留门禁
→ runtime_bundle.js + local_bootstrap.js + assets/*.svg + bundle_meta.json
→ 后续正常启动 $.require('pornhub')
→ require(file:// runtime_bundle.js)
→ PornhubLocalRuntime.module()
```

正常二次启动不应再加载：
- Stable/Test Bootstrap。
- `libs/updater/remote_manager.js`。
- 远程 Core/Runtime/UI/Patch。
- 仓库 Pornhub SVG 运行资产。

Pornhub 原站 HTML/API、X5 Cookie、图片、HLS、Shorts/片单请求仍属于业务网络，不属于程序代码交付。

### Local Bootstrap Shim
旧 Stable 代码中播放、登录同步、在线收藏、退出账号、清历史等动作会把 `C.bootstrap` 带入 `lazyRule`。

Test2 在合成 Runtime 时直接把历史：

```text
C.bootstrap = <任何历史远程 Bootstrap 字符串>
```

重写为当前本地：

```text
C.bootstrap = file://.../pornhub-test/b10202/local_bootstrap.js
```

Shim 从当前 `runtime_bundle.js` 重建 `PornhubCore / PornhubRemoteRuntime / PornhubBoot`，保持旧回调接口合同，但不再进入 Remote Manager。

### 远程残留硬门禁
禁止在最终 Runtime 中残留：
- `raw.githubusercontent.com/huoguotiankong/asset-core-7f3`
- `cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3`
- `github.com/huoguotiankong/asset-core-7f3/raw`
- `libs/updater/remote_manager.js`

Test2 与 Test1 的区别不是“取消门禁”，而是让门禁前的清洗和定位变得可验证、可追踪。

### 静态门禁
- `final_local_patch.js`：实际 `node --check` 通过。
- `local_bundle_builder.js`：实际 `node --check` 通过。
- `local_entry.js`：实际 `node --check` 通过。
- Test2 Shell 外层 JSON 与嵌套 `pages` JSON 实际解析通过。
- Shell 共 21 个页面。
- `find_rule + searchFind + pages` 共 23 个 JS 片段逐个 `node --check` 通过。
- rule version `2026082524`、Build `10202` 均在 32 位有符号整数安全范围内。

### Test2 实机验收
在以下项目完成前不得晋级 Stable：
1. “我的规则仓库”同步/覆盖后显示 `0.1.1-test.2 / Build10202`。
2. 首次打开能完成本地包构建，不再出现 Test1 的远程残留报错。
3. 打开“本地化诊断”，应显示 Runtime ready、31 sources、15 SVG assets，并可看到 rewrites 数量。
4. 完全退出后二次打开正常，确认走本地 Entry + Runtime Bundle。
5. 首页 / 搜索 / 分类 / 创作者 / 详情 / 评论无明显回归。
6. 至少实际播放一部视频，并重点验证“立即播放”这类历史 lazyRule 不会重新进入远程 Bootstrap。
7. 若使用账号，验证 X5 登录同步、账号页、退出本小程序账号会话。
8. Shorts 与公开片单至少能正常进入。
9. 如仍触发残留门禁，新的错误必须带具体模块路径和上下文，直接按该模块继续收敛。
10. 如条件允许，本地包完成后屏蔽 GitHub/CDN再重开，程序代码/UI/本地图标仍应进入。

## 失败版本记录
### 0.1.1-test.1 / Build10201
- 状态：`frozen-failed-immutable`。
- 实机：首次 Runtime 构建失败。
- 错误：私人仓库 Raw URL 残留被最终硬门禁拦截。
- 处理：禁止覆盖 Test1；从 Stable0.1.0 新建 Test2 / Build10202。

## 恢复与回退
- 正式恢复入口：Stable `0.1.0 / Build10108`。
- 当前 Local-First Test：`0.1.1-test.2 / Build10202`。
- Test2 如果仍失败，继续冻结 Test2，再从 Stable0.1.0 建更高 Build；禁止修改已经发布的 Test2 immutable 源。
- `0.1.0-test.7 / Build10107` 继续保留为 Stable0.1.0 的晋级来源。

## 长期不可回退事实
- Local-First 完成定义包含顶层入口、传递依赖、静态资产和点击时重入。
- 生成 Runtime 的远程去除不能只靠“一个看起来能匹配所有 URL 的正则”；优先使用结构化赋值重写、固定资产根替换、每源 marker 和最终残留门禁组合。
- 硬门禁失败是发布保护，不允许为了“先跑起来”而删除门禁。
- 仓库 SVG/banner 属于程序运行闭包。
- X5 Cookie 登录不保存账号密码。
- Stable0.1.0 业务逻辑只能在独立功能 Test 中改，不得借 Local-First 维修顺手重构。

## 历史
- Local-First 前完整历史：`apps/video/pornhub/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
- Test1 immutable Release：`apps/video/pornhub/releases/0.1.1-test.1/release.json`
