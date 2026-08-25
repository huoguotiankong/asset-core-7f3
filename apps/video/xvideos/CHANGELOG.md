# XVideos CHANGELOG

> 当前恢复入口。Local-First 迁移前的 Test1-Test7、详情/播放、人物/频道、账号 X5、评论与私有存储救援完整历史已归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：**不存在**，禁止为了迁移流程虚构 Stable。
- 当前业务/回退基线：`0.1.0-test.7 / Build10107`。
- 当前 Local-First Test：`0.1.1-test.1 / Build10201`，等待海阔实机验证。
- Test Shell：`apps/video/xvideos/xvideos_remote_test_localfirst_v1_b10201.txt`，rule version `2026082528`。
- 云仓不可变通道快照：`apps/video/xvideos/channels_v8_b10201_r1.json`。
- 源站：`https://www.xvideos.com/`。

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Test7-derived Native Local-First

### 迁移边界
本轮只迁移程序交付、启动、仓库 UI 资产和历史点击重入控制面，不顺手修改 Test7 业务协议。

继续冻结并继承：
- Test5 私有文件存储救援，避免完整 HTML / 账号状态 / 收藏 / 足迹 / 搜索历史触发 1MB 私有 KV 问题。
- X5 Cookie 只实时读取，不保存密码，也不把 Cookie 持久化进本项目配置。
- Test5/Test6 已实机验证的详情信息布局、立即播放与最高画质播放主链。
- Test7 `eid/u/t/tf/i/d/pn/pu` 短字段视频对象解析。
- 人物/频道 `/videos/best`、`/videos/new`、`/videos/best/straight` 当前 GET/POST 合同。
- 账号历史/喜欢/稍后看 XHR/JSON 优先解析与 X5 WebView fallback。
- 评论 WebView 动态 DOM 优先恢复链。
- 演员地区同义词清理、人物 seed 图片 fallback。

### Test7 真实执行闭包
Test7 Release 共有 15 层，顺序保持不变：

```text
Core Test1
→ Runtime Test1
→ Core Patch2
→ Runtime Patch2
→ Core Product Patch3
→ UI Product Patch3
→ Route Patch3
→ Core Account Patch4
→ UI Account Patch4
→ Core Rescue Patch5
→ UI Rescue Patch5
→ Core Feature Patch6
→ UI Feature Patch6
→ Core Protocol Patch7
→ UI Protocol Patch7
```

审计确认 Local-First 不能只替换 Shell：
1. Test1/Test3/Test5/Test6/Test7 多次给 `C.bootstrap` 写入不同远程 Bootstrap。
2. Test5 还通过远程程序根 `ROOT + bootstrap_test_v5...` 构造点击时 Bootstrap。
3. 详情播放、本地收藏、账号重新同步、清理本地列表等历史 `lazyRule` 会在点击时 `require(C.bootstrap)`。
4. Test1/Test3/Test4/Test5/Test6/Test7 UI 使用仓库 `apps/video/xvideos/assets/`。
5. 当前仓库运行资产目录共有 24 个 SVG。

### Test1 完整本地闭包
```text
15 个 Test7 业务模块
+ 1 个 Local-First final overlay
+ 24 个仓库 SVG
= 40 sources
```

本地 SVG：
`account / banner / best / brand / categories / channels / comments / creators / favorite / globe / history / localfav / localhistory / new / play / playlist / profiles / rating / refresh / search / settings / videos / views / watchlater`。

### 新运行链
```text
XVideos Test Shell / rule 2026082528
→ hiker://files/rules/asset-core-local/xvideos-test/b10201/local_entry.js
→ local_bundle_builder.js
→ 首装 immutable Source Ref 的 40 sources
→ 每个 JS 精确 marker / 正文校验
→ C.bootstrap / ROOT-derived Bootstrap 本地化
→ 仓库 assets 根与程序根本地化
→ 单模块私人仓库残留门禁
→ runtime_bundle.js + local_bootstrap.js + 24 SVG + bundle_meta.json
→ 后续启动 require(file:// runtime_bundle.js)
→ XVideosLocalRuntime.module()
```

正常二次启动不再需要：
- Test7 CDN Bootstrap。
- 15 个远程业务模块。
- 仓库 24 个 SVG。
- 历史 Test1-Test7 Bootstrap 点击重入。

XVideos 官网 HTML/API、X5 登录页、Cookie、图片、媒体、评论 WebView 等仍属于正常业务网络，不属于私人仓库代码交付。

### Local Bootstrap Shim
Builder 把历史：
- `C.bootstrap='<remote bootstrap>'`
- `C.bootstrap=ROOT+'bootstrap_...'`
- raw/jsDelivr/WebRaw Bootstrap URL

统一导向 `file://.../b10201/local_bootstrap.js`。

Shim 从当前 Runtime 重建：
- `XVideosCore`
- `XVideosRemoteRuntime`
- `XVideosBoot`

因此旧详情播放、本地收藏、账号同步等 lazyRule 仍可执行原合同，但不会重新走远程 Bootstrap。

### 静态资产与 Shell
- 24 个仓库 SVG 全部安装进本地 `assets/`。
- Runtime 中 raw/jsDelivr/WebRaw 的 XVideos 资产根统一切成本地资产根。
- Shell 自身的程序图标直接内置 `brand.svg` data URI，首次进入前也不依赖仓库图标地址。
- 云仓目录图标仍可作为目录展示资源使用；它不是程序正常启动代码依赖。

### 远程残留硬门禁
单模块清洗后与最终 Runtime 都禁止残留：
- `raw.githubusercontent.com/huoguotiankong/asset-core-7f3`
- `cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3`
- `github.com/huoguotiankong/asset-core-7f3/raw`
- `libs/updater/remote_manager.js`
- `bootstrap_test_v1_b10101.js` 至 `bootstrap_test_v7_b10107.js`

门禁失败时必须返回具体模块及附近上下文，不能为了启动而关闭门禁。

### 本地化诊断
新增 `view=xvideosLocalFirst`，可查看：
- `0.1.1-test.1 / Build10201`
- Runtime ready
- immutable Source Ref
- 40 sources / 16 modules / 24 SVG
- Runtime bytes / rewrites
- Test7 业务基线
- 点击重入 Shim 状态
- 重建本地包
- 无 Cookie/Token/Authorization 的诊断摘要

### P0 静态门禁
- `final_local_patch.js`：`node --check` 通过。
- `local_bundle_builder.js`：`node --check` 通过。
- `local_entry.js`：`node --check` 通过。
- Test Shell 本地重建后计算 Git blob SHA 为 `99ef81aff41b97f1bf7b8d98346225b8d0351c6c`，与 GitHub 分支实际 Shell blob 完全一致。
- 该真实 Shell 外层规则 JSON、嵌套 `pages` JSON 均解析通过。
- Shell 只有通用 `xvideosRoute` 1 个页面；首页 / 搜索 / Route 共 3 个 JS 片段均通过 `node --check`。
- rule version `2026082528` 与 Build `10201` 均在 32 位有符号整数安全范围内。

### 实机验收
本 Test 在以下项目完成前不得作为新的业务恢复基线：
1. “我的规则仓库”轻同步后显示 `0.1.1-test.1 / Build10201`。
2. 覆盖导入后首次启动完成 40 源安装并进入首页。
3. 打开“设置 → 本地化诊断”，显示 Runtime ready、40 sources、24 SVG。
4. 完全退出后二次打开正常，确认本地 Entry + Runtime Bundle 生效。
5. 打开一个 Test5/Test6 已验证的视频详情并实际播放，最高画质链不得退化。
6. 至少进入演员/频道/创作者之一，确认 Test7 实体与视频短字段协议没有被交付迁移破坏。
7. 如已有 X5 登录会话，可进入账号中心或历史/喜欢/稍后看验证一次；没有登录不作为本轮阻塞条件。
8. 进入评论页确认不会因为 Local-First 报运行时错误；评论正文是否恢复仍以 Test7 原业务状态为准。
9. 点击会触发旧 `C.bootstrap` 的动作，例如详情播放、本地收藏或账号重新同步，不能重新加载远程 Bootstrap。
10. 条件允许时，本地包完成后屏蔽 GitHub/CDN 再重开；程序 UI/代码/本地 SVG 应可进入，XVideos 业务站点仍需要正常网络。

## 恢复与回退
- 当前可靠业务回退：`0.1.0-test.7 / Build10107`。
- 当前 Local-First Candidate：`0.1.1-test.1 / Build10201`。
- 如果 Test1 实机失败，冻结该 immutable Release，从 Test7 新建更高 Test build；禁止原地覆盖 Test1 资产赌缓存刷新。
- 不建立 Stable，除非未来另有明确 Stable 晋级任务和完整实机回归。

## 长期不可回退事实
- XVideos 的 Local-First 完成定义包含 Shell、15 层业务代码、24 SVG 和 lazyRule 的 Bootstrap 重入。
- Test5 私有存储救援是稳定性边界，Local-First 不得把大 HTML/Cookie重新塞回私有 KV。
- Test5/Test6 已验证详情与最高画质播放链属于保护面，不因交付迁移重写。
- Test7 人物/频道/账号/评论协议仍是当前业务事实源；迁移失败优先查本地包/重入/资产，不先改业务 Parser。

## 历史
- Local-First 前完整历史：`apps/video/xvideos/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
- Test7 Release：`apps/video/xvideos/releases/0.1.0-test.7/release.json`
