# 51吃瓜 CHANGELOG

> 当前恢复入口。Local-First 迁移前的 Test1-Test5 / Stable0.1.0 / 图片 AES、评论、播放、分类、搜索完整历史归档在 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.1.0 / Build10106`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `0.1.0`，不修改。
- Test：`0.1.1-test.1 / Build10201`，Native Local-First，**基础实机验证已通过**。
- Test Shell：`apps/video/51chigua/51chigua_remote_test_localfirst_v1_b10201.txt`，rule version `2026082526`。
- Previous Test：`0.1.0-test.5 / Build10105`，Stable0.1.0 的晋级来源，继续保留为不可变历史对照。
- 源站入口：`https://51cg1.com/`；动态域名与失败转移逻辑继续沿用 Stable。

## 2026-08-25 · Test1 Local-First 基础实机通过
用户提供当前海阔实机截图，明确显示：

```text
51吃瓜 0.1.1-test.1
Build 10201 · Native Local-First
本地 Runtime 已就绪
Source 9bfc77fe270c · 18 源 · 68653 bytes
```

因此当前可确认：
- Shell 已进入 Build10201 Local-First Test。
- 首次本地包构建已经成功。
- 本地 Runtime 已成功加载。
- 实机识别到预期 18 sources。
- Runtime 实际包大小为 68653 bytes。
- 当前设备运行的 Source Ref 前缀与 Release 预期 `9bfc77fe270c...` 一致。

当前只记为 **basic-local-first-device-validated**。该截图没有逐项证明加密封面/正文图片、分类、搜索、详情、评论、DPlayer/HLS、收藏/历史点击重入等所有业务回归，因此不得把“基础 Local-First 通过”扩大写成“完整业务回归通过”，也不据此自动晋级 Stable。

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Stable-derived Local-First

### 迁移边界
本轮只迁移交付、启动、点击重入与仓库静态资产控制面，不主动修改 Stable0.1.0 已实机验证业务：
- 首页文章流、动态域名、分类与独立搜索。
- `/xiao/`、`/upload/upload/` 图片 AES/CBC/PKCS7 解密链。
- 图文详情与正文图片。
- DPlayer/HLS 结构化媒体提取和海阔原生播放。
- `/comments/<postId>.json` 评论接口、纵向评论与楼中楼。
- 本地收藏、浏览历史、设置/诊断。

`hiker://assets/crypto-java.js` 继续作为海阔内置图片解密依赖，不属于私人 GitHub 远程代码。

### Stable 真实执行闭包
```text
Core Test1
→ Runtime Test1
→ Core Patch2
→ Runtime Patch2
→ Core Patch3
→ Runtime Patch3
→ Core Patch4
→ Runtime Patch4
→ Runtime Patch5
→ Stable Patch
```

除这 10 层外，审计还确认：
1. Stable Shell 每个入口都会远程加载 `Bootstrap → Remote Manager → Release`。
2. 历史 `lazyRule` 会携带 `C.bootstrap`，收藏、播放、站点探测、清理等点击动作可能重新进入远程 Bootstrap。
3. Runtime/Test3/Test4/Test5 使用仓库 `apps/video/51chigua/assets/*.svg` 作为 UI 资产。

### Test1 完整本地闭包
```text
10 个 Stable 业务模块
+ 1 个 Local-First final overlay
+ 7 个 SVG
= 18 sources
```

本地 SVG：`categories / comment / favorite / history / icon / search / web`。

### 新运行链
```text
51吃瓜 Test Shell / rule 2026082526
→ hiker://files/rules/asset-core-local/51chigua-test/b10201/local_entry.js
→ local_bundle_builder.js
→ 首次安装 immutable Source Ref 的 18 sources
→ 每源 marker / 正文校验
→ C.bootstrap 赋值重写 + 仓库资产根本地化
→ 每模块私人仓库残留门禁
→ runtime_bundle.js + local_bootstrap.js + assets/*.svg + bundle_meta.json
→ 后续正常启动 $.require('cg51')
→ require(file:// runtime_bundle.js)
→ Cg51LocalRuntime.module()
```

正常二次启动不再加载 Stable/Test Bootstrap、`libs/updater/remote_manager.js`、远程 Core/Runtime/Patch 或仓库 SVG。51CG 站点 HTML、评论 JSON、图片、HLS、favicon 仍属于正常业务网络。

### Local Bootstrap Shim 与硬门禁
Builder 将历史 `C.bootstrap=<远程 Bootstrap>` 统一重写为 `file://.../b10201/local_bootstrap.js`。Shim 从当前 Runtime 重建 `Cg51Core / Cg51RemoteRuntime / Cg51Boot`，旧 lazyRule 合同继续成立，但不再进入 Remote Manager。

最终 Runtime 禁止残留：
- `raw.githubusercontent.com/huoguotiankong/asset-core-7f3`
- `cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3`
- `github.com/huoguotiankong/asset-core-7f3/raw`
- `libs/updater/remote_manager.js`

### 当前后续验收边界
基础 Runtime 已通过；若未来准备晋级 Stable，再补完整业务回归：
1. 完全退出后二次打开正常。
2. 首页封面、正文加密图片各验证一处。
3. 分类、独立搜索、详情、评论各进入一次。
4. 至少实际播放一个 DPlayer/HLS 视频。
5. 收藏、站点探测、清历史等历史 lazyRule 不得重新进入 Remote Bootstrap/Manager。
6. 条件允许时屏蔽 GitHub/CDN 再重开验证本地代码闭包。

## 恢复与回退
- Stable 恢复入口：`0.1.0 / Build10106`。
- 当前 Local-First Test：`0.1.1-test.1 / Build10201`，基础实机已通过。
- 若后续业务回归发现问题，从 Stable0.1.0 新建更高 Test build；禁止原地覆盖 Test1 immutable 工件。

## 长期不可回退事实
- 51吃瓜 Local-First 完成定义包含 Shell、业务模块、历史 lazyRule 重入和仓库 SVG。
- 图片 AES 属于已验证业务能力，不因交付迁移重写；`hiker://assets/crypto-java.js` 是海阔本地内置依赖。
- 评论 JSON、DPlayer/HLS、分类、搜索、收藏/历史继续以 Stable0.1.0 为业务事实基线。
- Local-First Test 不得顺手重构 Stable Parser/播放/图片协议。
- 实机 Local-First 诊断通过与完整业务回归是两层验收，必须分别记录。

## 历史
- Local-First 前完整历史：`apps/video/51chigua/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
- Stable Release：`apps/video/51chigua/releases/0.1.0/release.json`
- Local-First Test1 Release：`apps/video/51chigua/releases/0.1.1-test.1/release.json`
