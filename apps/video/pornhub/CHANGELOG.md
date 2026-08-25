# Pornhub Changelog

> 当前恢复入口。Local-First 迁移前的 Test1-Test7 / Stable0.1.0 / 账号、评论、Shorts、片单与播放历史已归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.1.0 / Build10108`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `0.1.0`，不修改。
- Test：`0.1.1-test.2 / Build10202`，Native Local-First；**用户已基础实机确认可正常运行**。
- Test Shell：`apps/video/pornhub/pornhub_remote_test_localfirst_v2_b10202.txt`，rule version `2026082524`。
- Failed Test：`0.1.1-test.1 / Build10201`，已冻结，不允许原地覆盖。
- Stable 晋级来源：`0.1.0-test.7 / Build10107`。
- 数据源：`https://www.pornhub.com/`。

## 2026-08-25 · Test2 基础实机通过
用户在 Test1 触发远程残留硬门禁后，覆盖测试修复版 `0.1.1-test.2 / Build10202`，随后明确反馈“可以了，继续下一个”。因此当前可确认：

```text
Test2 Local-First 首装 / Runtime 构建基础链
→ 实机可正常运行
→ Test1 的私人仓库残留问题已被 Test2 修复
```

当前只记录为 **basic-device-validated**，不扩大事实范围：用户本轮没有逐项回报 Home / Search / Category / Creator / Detail / Comments / 4档HLS / Account / Shorts / Playlist 的完整回归，因此这些业务能力继续以 Stable0.1.0 为业务基线，不能据此宣称 Test2 已全量回归通过，也不能直接晋级 Stable。

## 2026-08-25 · 0.1.1-test.2 / Build10202 · Local-First Residual Gate Repair

### Test1 实机失败
Test1 `0.1.1-test.1 / Build10201` 首次构建 Runtime 时被最终硬门禁正确拒绝：

```text
Runtime 仍残留远程代码/资产依赖：
raw.githubusercontent.com/huoguotiankong/asset-core-7f3
```

处理原则：Test1 保持 immutable，禁止原地覆盖；从 Stable0.1.0 新建更高 Test build 修复。

### Test2 修复
Test2 不改 Stable 业务 Parser、账号、评论、Shorts、片单或播放协议，只修交付控制面：
1. 每个 JS 源必须命中精确 marker，错误响应不得进入 Runtime。
2. 批量/单源结果统一做正文归一化。
3. Pornhub Raw / jsDelivr / GitHub WebRaw 三类仓库 SVG 根精确替换成本地 assets。
4. 历史 `C.bootstrap='...'` 直接按赋值语句确定性重写为本地 `local_bootstrap.js`。
5. 每个模块清洗后先做私人仓库残留检测，失败返回具体模块与上下文。
6. 最终 Runtime 再执行全局硬门禁；门禁没有放宽。
7. `bundle_meta.json` 记录 rewrites 与 sanitizer 版本。

### Test2 本地闭包
```text
15 个 Stable 业务模块
+ 1 个 Test2 Local-First final overlay
+ 15 个 Pornhub SVG
= 31 sources
```

Stable 业务顺序保持：
```text
Core Test1
→ Core Patch2/3/4/5/6/7
→ Runtime Test1
→ UI Patch2/3/4/5/6/7
→ Stable Patch
→ Test2 Local-First Overlay
```

本地 SVG：`account / banner / categories / comment / creators / favorite / feed / gifs / history / home / icon / local / search / shorts / subscribe`。

### 运行链
```text
Pornhub Test Shell / rule 2026082524
→ hiker://files/rules/asset-core-local/pornhub-test/b10202/local_entry.js
→ local_bundle_builder.js
→ 首装 immutable Source Ref 的 31 sources
→ marker / 正文校验
→ C.bootstrap 重写 + 资产根本地化
→ 单模块残留门禁
→ runtime_bundle.js + local_bootstrap.js + assets/*.svg + bundle_meta.json
→ 后续 $.require('pornhub')
→ require(file:// runtime_bundle.js)
→ PornhubLocalRuntime.module()
```

正常二次启动不应加载 Stable/Test Bootstrap、`libs/updater/remote_manager.js`、远程 Core/Runtime/UI/Patch 或仓库 Pornhub SVG。Pornhub 原站 HTML/API、X5 Cookie、图片、HLS、Shorts/片单请求仍属于正常业务网络。

### Local Bootstrap Shim
历史播放、登录同步、在线收藏、退出账号、清历史等 lazyRule 会携带 `C.bootstrap`。Test2 将其统一重写到本地 Bootstrap Shim；Shim 从当前 Runtime 重建 `PornhubCore / PornhubRemoteRuntime / PornhubBoot`，保持旧回调合同，但不再进入 Remote Manager。

### 远程残留硬门禁
最终 Runtime 禁止：
- `raw.githubusercontent.com/huoguotiankong/asset-core-7f3`
- `cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3`
- `github.com/huoguotiankong/asset-core-7f3/raw`
- `libs/updater/remote_manager.js`

硬门禁属于发布保护，不允许为了“先跑起来”而删除。

## 当前实机状态与后续边界
- 已确认：Test2 Local-First 基础启动/运行可用。
- 未宣称完整回归：搜索、分类、创作者、详情、评论、播放、账号、Shorts、片单的逐项 Test2 回归。
- Stable/Latest：继续 `0.1.0 / Build10108`。
- 若未来需要晋级 Stable，必须补完整业务实机回归；当前“基础通过”不足以直接晋级。

## 长期不可回退事实
- Local-First 完成定义包含入口、传递依赖、静态资产和点击时重入。
- 生成 Runtime 去远程化不能只靠宽泛 URL 正则；使用结构化赋值重写、固定资产根替换、每源 marker、单模块门禁和最终门禁组合。
- 仓库 SVG/banner 属于程序运行闭包。
- X5 Cookie 登录不保存账号密码。
- Stable0.1.0 的业务逻辑只能在独立功能 Test 中修改，Local-First 迁移不得顺手重构。

## 历史
- Local-First 前完整历史：`apps/video/pornhub/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
- Test1 immutable Release：`apps/video/pornhub/releases/0.1.1-test.1/release.json`
- Test2 immutable Release：`apps/video/pornhub/releases/0.1.1-test.2/release.json`
