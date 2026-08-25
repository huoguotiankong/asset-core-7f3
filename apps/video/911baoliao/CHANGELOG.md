# 911爆料 CHANGELOG

> 当前恢复入口。Local-First 迁移前的 Test1-Test5、路由/CDN/封面/播放修复完整历史已归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- 当前无 Stable；不得把 Test 通道误写成 Stable。
- 业务恢复基线：`0.1.0-test.5 / Build10105`。
- 当前 Local-First Test：`0.1.1-test.1 / Build10201`，等待海阔实机验证。
- Test Shell：`apps/video/911baoliao/911baoliao_remote_test_localfirst_v1_b10201.txt`，rule version `2026082527`。
- 初始入口：`https://begin.mrbyudbq.com/`。
- 当前已验证镜像：`911bl.com / 911bla.com / 911bg7.com / d10cq29fdobmmg.cloudfront.net`。
- 真实文章合同：`/archives/<numeric-id>/`。
- 程序不实现评论、匿名投稿或下载功能。

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Test5-derived Native Local-First

### 迁移边界
本轮只迁移交付、启动、点击重入与仓库静态资产控制面，不主动修改 Test5 已形成的业务合同：
- 首页/分类/搜索只接受真实 `/archives/<数字>/` 正文页。
- 回家、投稿、FAQ、标签、活动、社群、广告等功能页继续从 Feed 结构上排除。
- `data-bg / data-background / poster / srcset / CSS background` 等真实封面解析继续沿用 Test5。
- 单媒体直交海阔播放器；多媒体只以合法 article URL 作为 lazyRule 外层；无结构化直链时 `video://` 嗅探兜底。
- 已验证镜像与最后成功域名优先策略保持不变。
- 本地收藏、历史和内容安全过滤保持不变。

### 当前真实业务执行闭包
Test5 Release 共 8 层：

```text
Core Test1
→ Runtime Test1
→ Route Patch Test2
→ Transport Patch Test3
→ Content Adapter Patch Test4
→ Test4 Bootstrap Pin
→ Site Adapter Patch Test5
→ Runtime Patch Test5
```

审计确认 Local-First 隐性依赖：
1. Test5 Shell 每个入口都会加载远程 Bootstrap。
2. Bootstrap 每次会加载 Remote Manager 2.0.2，再解析活动 Release。
3. Core/Test3/Test4/Test5 多次覆盖 `C.bootstrap`；收藏、历史操作和旧设置动作可能在点击时重新进入远程 Bootstrap。
4. Test1 Runtime 与 Test5 Runtime Patch 使用仓库 `assets/icon.svg`。

### Test1 完整本地闭包
```text
8 个 Test5 业务模块
+ 1 个 Local-First final overlay
+ 1 个 icon.svg
= 10 sources
```

代码模块总数为 9；仓库 UI 资产 1 个。

### 新运行链
```text
911爆料 Local-First Test Shell / rule 2026082527
→ hiker://files/rules/asset-core-local/911baoliao-test/b10201/local_entry.js
→ local_bundle_builder.js
→ 首次安装 immutable Source Ref 的 10 sources
→ 每个 JS 精确 marker / 正文校验
→ 历史 C.bootstrap 赋值统一重写
→ 仓库 icon 资产根本地化
→ 单模块私人仓库残留门禁
→ runtime_bundle.js + local_bootstrap.js + assets/icon.svg + bundle_meta.json
→ 后续正常启动 $.require('bl911')
→ require(file:// runtime_bundle.js)
→ Bl911LocalRuntime.module()
```

正常二次启动不再加载：
- Test1-Test5 远程 Bootstrap。
- `libs/updater/remote_manager.js` / Remote Manager 2.0.2。
- 远程 Core/Runtime/Patch。
- 私人仓库 icon.svg 运行资产。

911 业务站点 HTML、图片和媒体仍属于正常业务网络，不属于程序代码交付。

### Local Bootstrap Shim
Builder 将历史：

```text
C.bootstrap = <任一历史 911 远程 Bootstrap>
```

统一重写到：

```text
file://.../911baoliao-test/b10201/local_bootstrap.js
```

Shim 从当前 `runtime_bundle.js` 重建：
- `Bl911Core`
- `Bl911RemoteRuntime`
- `Bl911Boot`

旧收藏/站点探测等回调合同继续成立，但不再进入 Remote Manager。程序升级职责交回“我的规则仓库”。

### 图标本地化
- Runtime 中 Raw / jsDelivr / GitHub WebRaw 的 `apps/video/911baoliao/assets/` 统一切成本地 `assets/`。
- `icon.svg?v=10105` 在本地 Runtime 中去除历史远程 cache query。
- Shell 与 channels 的 911 程序图标直接使用 data URI，避免 Test Shell 自己再依赖私人仓库图标。

### 远程残留硬门禁
最终 Runtime 禁止残留：
- `raw.githubusercontent.com/huoguotiankong/asset-core-7f3`
- `cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3`
- `github.com/huoguotiankong/asset-core-7f3/raw`
- `libs/updater/remote_manager.js`
- `libs/updater/v2.0.2/remote_manager.js`

门禁同时在单模块清洗后和最终 Runtime 执行；失败时必须返回具体模块与附近上下文，不允许为了先运行而关闭门禁。

### 本地化诊断
新增 `bl911LocalFirst` 页面，可查看：
- `0.1.1-test.1 / Build10201`。
- Runtime ready 状态。
- immutable Source Ref。
- `10 sources / 9 modules / 1 SVG`。
- Runtime bytes 与 rewrites。
- Test5 业务基线和本地 Bootstrap Shim 状态。
- 重建本地包与无敏感信息诊断摘要。

### 静态门禁（实际执行）
- `final_local_patch.js`：`node --check` 通过。
- `local_bundle_builder.js`：`node --check` 通过。
- `local_entry.js`：`node --check` 通过。
- Shell 外层 JSON 与嵌套 `pages` JSON 实际解析通过。
- Shell 共 9 个页面。
- `find_rule + searchFind + pages` 共 11 个 JS 片段逐个 `node --check` 通过。
- 本地重建出的 Shell Git blob SHA 与仓库实际 blob `7205a6ce3bd3ca0f3cb5475b81e5aa68e2fa81af` 完全一致，说明检查的是实际发布工件。
- rule version `2026082527` 与 Build `10201` 均满足海阔 32 位有符号整数约束。

### 实机验收
在以下项目完成前不得把 Local-First Test 当成新的业务恢复基线：
1. “我的规则仓库”轻同步/覆盖后显示 `0.1.1-test.1 / Build10201`。
2. 首次打开完成 10 源本地包构建并正常进入首页。
3. “本地化诊断”显示 Runtime ready、10 sources、1 SVG。
4. 完全退出后二次打开正常，确认本地 Entry + Runtime Bundle。
5. 首页第一项仍应是真实 `/archives/<id>/` 文章，不能重新出现回家/投稿/FAQ/标签/活动/社群/广告伪内容。
6. 有真实封面的文章继续显示自身封面；解析不到时宁可文本卡。
7. 至少进入一个详情，并实际播放一个当前可播放媒体；不得复活 `Expected URL scheme 'http' or 'https' but no colon was found`。
8. 收藏、历史、重新探测站点等点击动作不能重新进入远程 Bootstrap/Manager。
9. 条件允许时，本地包完成后屏蔽 GitHub/CDN 再重开；程序代码/UI/本地图标仍应进入，911 业务站点仍需正常网络。

## 恢复与回退
- 业务恢复基线：`0.1.0-test.5 / Build10105`。
- 当前 Local-First Candidate：`0.1.1-test.1 / Build10201`。
- Test1 若实机失败，冻结该 immutable Release，从 Test5 业务基线新建更高 Build；禁止原地覆盖 Test1。
- 当前无 Stable，实机通过 Local-First 只代表交付链通过，不自动等价于可以晋级 Stable；是否建立首个 Stable 需单独决策。

## 长期不可回退事实
- 911爆料 Local-First 完成定义包含 Shell、8 层历史业务链、所有 `C.bootstrap` 点击重入和仓库 icon。
- `/archives/<numeric-id>/` 是当前真实文章合同，不回退通用 `<a>` 抓取。
- LazyRuleParser 的 `$()` 外层 URL 必须是合法 URL；媒体 JSON 不能再放到 `$()` URL 参数位。
- Test5 已验证业务修复与 Local-First 交付迁移分离，不能借本地化顺手重写 Parser/播放。
- 该程序当前没有 Stable；Test5 是业务 recovery base，直到用户实机证明更高 Test 完整可用。

## 历史
- Local-First 前完整历史：`apps/video/911baoliao/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
- Test5 Release：`apps/video/911baoliao/releases/0.1.0-test.5/release.json`
- Local-First Test1 Release：`apps/video/911baoliao/releases/0.1.1-test.1/release.json`
