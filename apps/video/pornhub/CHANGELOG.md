# Pornhub Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的 Test1-Test7 / Stable0.1.0 / 账号、评论、Shorts、片单与播放历史已原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.1.0 / Build10108`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `0.1.0`，本轮不修改。
- Test：`0.1.1-test.1 / Build10201`，Native Local-First Candidate，等待海阔实机验证。
- Test Shell：`apps/video/pornhub/pornhub_remote_test_localfirst_v1_b10201.txt`，rule version `2026082523`。
- Previous Test：`0.1.0-test.7 / Build10107`，Stable0.1.0 的晋级来源，保留为历史对照。
- 数据源：`https://www.pornhub.com/`。

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Stable-derived Local-First

### 迁移边界
本轮只迁移交付、启动、点击重入和程序静态资产控制面，不主动改 Stable0.1.0 已有业务：
- 首页公开内容与账号推荐 Feed。
- 搜索、中文分类、创作者、详情与评论。
- X5 Cookie 登录、账号身份、推荐/Feed/历史/收藏/订阅。
- 本地影片/创作者/片单收藏与浏览历史。
- Shorts `/shorties/<id>` 与 Playlist chunk 分页实现。
- 4 档 HLS 多画质播放与媒体回退。

Stable0.1.0 / Latest 原文件、原 build、原 Shell/Bootstrap 全部冻结。

### Stable 真实执行闭包
Stable Release 表层共有 15 个业务模块：

```text
Core Test1
→ Core Patch2/3/4/5/6/7
→ Runtime Test1
→ UI Patch2/3/4/5/6/7
→ Stable Patch
```

审计发现表层 15 个文件之外仍存在两类 Local-First 隐性依赖：
1. Shell 每个页面都先远程 `Bootstrap → Remote Manager → Release`。
2. 历史 Runtime/UI 中多个 `lazyRule` 动作把 `C.bootstrap` 序列化进点击回调；即使首页已本地化，播放、登录同步、退出账号、清历史/收藏等动作仍会在真正点击时重新进入远程 Bootstrap。
3. Runtime/UI 使用仓库 `apps/video/pornhub/assets/*.svg` 作为 banner、账号、搜索、分类、创作者、收藏、历史等图标资产。

因此仅把 15 个业务 JS 下载到本地仍不算完成。

### Test1 完整本地闭包
本轮固定：

```text
15 个 Stable 业务模块
+ 1 个 Local-First final overlay
+ 15 个 Pornhub SVG 资产
= 31 sources
```

本地化的 15 个 SVG：
`account / banner / categories / comment / creators / favorite / feed / gifs / history / home / icon / local / search / shorts / subscribe`。

### 新运行链
```text
Pornhub Test Shell / rule 2026082523
→ hiker://files/rules/asset-core-local/pornhub-test/b10201/local_entry.js
→ local_bundle_builder.js
→ 首次安装：从 immutable source ref 下载 31 个源码/资产单元
→ 生成 runtime_bundle.js
→ 生成 local_bootstrap.js
→ 写入 assets/*.svg + bundle_meta.json
→ 后续正常启动 $.require('pornhub')
→ require(file:// runtime_bundle.js)
→ PornhubLocalRuntime.module()
```

正常二次启动不再加载：
- Stable/Test Bootstrap。
- `libs/updater/remote_manager.js`。
- 远程 Core/Runtime/UI/Patch。
- 仓库 Pornhub SVG 运行资产。

Pornhub 原站 HTML/API、X5 Cookie、图片、HLS、Shorts/片单业务请求仍属于业务网络，不属于程序代码交付。

### Local Bootstrap Shim
旧业务代码已经把 `C.bootstrap` 写进多个 lazyRule/select/action 回调，不能只改页面首入口。

Builder 在合成 Runtime 前统一把历史 Pornhub Bootstrap URL 改为：
`file://.../local_bootstrap.js`。

本地 Shim 从 `runtime_bundle.js` 重建：
- `PornhubCore`
- `PornhubRemoteRuntime`
- `PornhubBoot`

并保留 `PornhubBoot.loadOnly/module/info/check/update/rollback/reinstall` 的兼容接口，但全部在本地执行；版本检查/升级职责交回“我的规则仓库”。这样旧 lazyRule 的行为合同继续成立，同时不再访问 Remote Manager。

### 静态资产本地化
Builder 将历史：
- `raw.githubusercontent.com/.../apps/video/pornhub/assets/`
- `cdn.jsdelivr.net/.../apps/video/pornhub/assets/`

统一改为本地 `hiker://files/rules/asset-core-local/pornhub-test/b10201/assets/`。

Test Shell 自身使用站点 favicon，不依赖私人仓库图标作为规则壳图标。

### 远程残留硬门禁
Runtime 生成完成前执行字符串门禁；若仍包含以下任一代码/资产依赖则拒绝安装：
- `raw.githubusercontent.com/huoguotiankong/asset-core-7f3`
- `cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3`
- `github.com/huoguotiankong/asset-core-7f3/raw`
- `libs/updater/remote_manager.js`

这项门禁只针对程序代码与仓库资产；业务站点网络不在禁止范围。

### Local-First 诊断
新增 `pornhubLocalFirst` 页面，可查看：
- `0.1.1-test.1 / Build10201`。
- Runtime ready 状态。
- immutable source ref。
- source 数量、Runtime 字节数。
- 本地 SVG 数量。
- Stable 业务基线。
- 点击重入是否由 Local Bootstrap Shim 接管。
- 重建本地包。
- 不含 Cookie/Token/Authorization 的诊断摘要。

### 静态门禁
- `final_local_patch.js`：实际 `node --check` 通过。
- `local_bundle_builder.js`：实际 `node --check` 通过。
- `local_entry.js`：实际 `node --check` 通过。
- Test Shell 外层规则 JSON 与嵌套 `pages` JSON 均解析通过。
- Shell 共 21 个页面：原 20 个业务页 + 本地化诊断。
- Shell `find_rule/searchFind/pages` 共 23 个 JS 片段已逐个 `node --check` 通过。
- rule version `2026082523` 与 Build `10201` 均在 32 位有符号整数安全范围内。

### 实机验收
Test1 在以下项目完成前不得晋级 Stable：
1. “我的规则仓库”同步/覆盖后显示 `0.1.1-test.1 / Build10201`。
2. 首次打开允许一次本地包构建，首页正常进入。
3. 完全退出后第二次打开仍正常，确认本地 Entry + Runtime Bundle 链有效。
4. 打开“本地化诊断”，应显示 Runtime ready、31 sources、15 SVG assets。
5. 首页 / 搜索 / 分类 / 创作者 / 详情 / 评论无明显回归。
6. 至少实际播放一部视频，确认已有 4 档 HLS/媒体回退没有因交付迁移失效。
7. 重点验证“立即播放”等历史 lazyRule 点击动作，不能因 Local Bootstrap Shim 出现 `PornhubBoot/PornhubCore 未定义`。
8. 若使用账号，验证 X5 登录同步、账号页、退出本小程序账号会话。
9. Shorts 与公开片单至少能正常进入；Playlist chunk 加载保持 Stable 合同。
10. 如条件允许，首次安装完成后屏蔽 GitHub/CDN再重开；程序代码/UI/本地图标仍应进入，Pornhub 业务站点仍需正常网络。

## 恢复与回退
- 正式恢复入口：Stable `0.1.0 / Build10108`。
- 当前 Local-First Test：`0.1.1-test.1 / Build10201`。
- Test1 失败时冻结该 immutable release，从 Stable0.1.0 新建更高 Test build 修复，禁止原地覆盖 Test1 资产赌缓存刷新。
- `0.1.0-test.7 / Build10107` 继续保留为 Stable 晋级来源，但不再作为新 Test 的开发基线。

## 长期不可回退事实
- Local-First 必须审计页面入口之外的 lazyRule/select/action 重入；不能只确认首页本地启动。
- 仓库 SVG/banner 等静态 UI 资产属于程序运行闭包，也必须纳入本地包或明确替换为非私人仓库资产。
- X5 Cookie 登录只保存会话结果，不保存账号密码；账号真实性继续以官方网页与安全页为准。
- Shorts 与 Playlist 必须继续使用当前真实实体和 chunk 合同，不恢复旧 `/short/` 或伪标题 Parser。
- Stable0.1.0 的业务逻辑只能在后续独立功能 Test 中修改，Local-First 迁移不得顺手重构已验证 Parser/播放链。

## 历史
- Local-First 前完整历史：`apps/video/pornhub/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
