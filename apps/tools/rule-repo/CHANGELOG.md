# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC28 完整记录已冻结到 `CHANGELOG_RC28_20260825.md`；RC27、RC26 及更早历史继续保留。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结；RC31 自更新与轻同步修复实机通过前禁止晋级。
- Test：`3.5.6-rc31 / Build421`，Shell `rule_repo_test_v168.txt` / rule version `2026082507`。
- Runtime 基线仍为 immutable `3.5.6-rc12 / Build402` + Local Module Manager `2.2.0` + `require(file://)`。
- RC24 本地图标、RC25 原生 `.txt` 导入、RC26 普通程序三镜像版本目录、RC27 多版本更新统计、RC30 immutable importRef 导入加速继续保持。

## 2026-08-25 · 3.5.6-rc31 / Build421 · HEAD-Pinned Self Feed + Sync Repair

### 用户实机事实
- 用户 09:39 实机截图确认：测试仓仍显示“当前安装：测试版 3.5.6-rc29”，可用 Test 仍为 RC29，看不到已经发布的 RC30。
- 同一轮在“更新中心 → 同步程序目录”点击同步，实机弹出：`轻同步失败：Module "hiker://page/ruleRepoCore" cannot be found.`
- 因此 RC28→RC29 的一次成功不能证明 RC28 的 self feed 可以长期作为正式控制面；当前方案存在可重复失效风险。

### 根因 1：错误 page require
- RC28 `workspaceStaticAction('sync')` 内部使用 `$.require('hiker://page/ruleRepoCore')`。
- `hiker://page/ruleRepoCore` 是页面路由，不是 JS 模块路径；在用户当前海阔环境会直接抛 `Module ... cannot be found`。
- 此异常发生在真正执行 `lightSync()` 之前，因此同步目录、图标和 self feed 都不会继续。

### 根因 2：self feed 仍直接读取 @main 内容
- RC28 虽然对 Raw / GitHub Raw / jsDelivr `@main` 加时间戳和 no-cache，但三个入口本质仍依赖可变分支正文。
- `@main` 边缘缓存、重定向缓存或分支解析延迟可能继续返回旧 Test 元数据。
- RC31 不再把 `@main` 正文作为 self feed 的第一真相。

### RC31 实现
- 新增 `releases/test-3.5.6-rc31/self_update_head_patch.js`。
- 检查测试仓自身版本时，先请求 GitHub Branch API；失败再请求 Commits API，取得 `main` 当前 40 位 commit SHA。
- 再使用该 immutable SHA 构造 Raw / GitHub Raw / jsDelivr 的 `channels.json` 三镜像地址，读取后按 Test Build 判断最新版本。
- 新 self cache 使用 `hiker://files/rules/asset-core-local/rule-repo-test/self_channels_v2.json`，避免和 RC28 的旧 self cache 混淆。
- “检查版本”改为显示“正在读取 main HEAD 并检查测试仓新版本…”，成功后写入 v2 cache 并刷新当前详情页。
- “同步程序目录”彻底移除 `$.require('hiker://page/ruleRepoCore')`；改成本地 `shell_bridge_v9.js → require(getPath(...)) → RuleRepoBridge.load() → Runtime.lightSync()`。
- `shell_bridge_v9.js` 在 RC30 Bridge v8 之上叠 RC31 修复，因此 RC30 immutable `importRef` 导入加速继续保留。
- 新 Shell `rule_repo_test_v168.txt` 为重新生成的最小完整壳，固定加载 immutable Bridge v9；外层规则 JSON、内层 pages JSON、14 段 `js:` 入口全部通过静态解析和 `node --check`。

### 强制实机验收
1. 当前仍运行 RC29 时，不要点击底部“同步程序目录”；进入“我的规则仓库”详情页点击“检查版本”。
2. 必须发现 `3.5.6-rc31 / Build421`。
3. 从 RC29 覆盖导入 RC31，重开测试仓后必须显示 RC31 当前运行。
4. 在 RC31 中点击“同步程序目录”，不得再出现 `hiker://page/ruleRepoCore` Module not found。
5. 再点击规则仓自身“检查版本”，应快速完成并保持 RC31 当前版本。
6. 下一次发布 Test 时，必须再验证 RC31 能通过 HEAD-Pinned feed 自己发现更高 Build；通过前 Stable 继续冻结。

### 事故记录
- `docs/INCIDENT_RULE_REPO_SELF_FEED_AND_PAGE_REQUIRE_20260825.md`

## 2026-08-25 · 3.5.6-rc30 / Build420 · Immutable Import Fast Path

### RC29 实机闭环结论
- 用户 09:21 实机截图确认：详情顶部显示“当前安装：测试版 3.5.6-rc29”，可用版本中的 `测试版 3.5.6-rc29` 标记为“当前运行”。
- 本次升级由 RC28 测试仓自身发现并导入 RC29，期间不需要打开 Stable 作为跳板。
- 因此 RC28 → RC29 的“发现新 Test → 原生导入 → 覆盖安装 → 重启 → 识别新 Test”自更新闭环当时判定通过；09:39 后续实机又暴露 RC28 self feed 并不具备长期可靠性，因此由 RC31 重新加固。

### 用户反馈与根因边界
- 用户反馈普通程序点击“导入”后，仍要等待较久才出现海阔原生导入提示。
- RC25 之后规则仓已经只把远程 Shell 交给 `home_rule_url`；完整 Runtime / 图片资源并不在这一步下载，所以不能把等待简单归因于整个小程序体积。
- RC25 `nativeUrl()` 使用 `cdn.jsdelivr.net/...@main/<path>?v=<version>`；`@main` 是可变分支，不适合作为已经发布版本的导入热路径。

### RC30 实现
- 新增 `releases/test-3.5.6-rc30/import_ref_catalog_v1.json`，保存当前目录 Remote/Test/Stable `.txt` Shell 的不可变 commit SHA。
- 新增 `import_fast_path_patch.js`：普通 `.txt` 导入优先读取对象自身 `importRef`，其次查询本地固定版本目录；命中 40 位 SHA 后生成 `cdn.jsdelivr.net/gh/<repo>@<sha>/<path>`。
- 缺失 `importRef` 时自动回退 RC25 已验证原生导入链。
- `shell_bridge_v8.js` 加载 RC30 patch 和 importRef 目录；`rule_repo_test_v167.txt` 固定读取 immutable Bridge v8。

## 历史
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
- 自更新旧事故：`docs/INCIDENT_RULE_REPO_SELF_UPDATE_LOCK_20260825.md`
- 自更新/同步新事故：`docs/INCIDENT_RULE_REPO_SELF_FEED_AND_PAGE_REQUIRE_20260825.md`
