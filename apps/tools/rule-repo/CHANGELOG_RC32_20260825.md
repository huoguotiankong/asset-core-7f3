# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC28 完整记录已冻结到 `CHANGELOG_RC28_20260825.md`；RC27、RC26 及更早历史继续保留。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结；RC32 导入链实机稳定前禁止晋级。
- Test：`3.5.6-rc32 / Build422`，Shell `rule_repo_test_v169.txt` / rule version `2026082508`。
- Runtime 基线仍为 immutable `3.5.6-rc12 / Build402` + Local Module Manager `2.2.0` + `require(file://)`。
- RC24 本地图标、RC26 普通程序三镜像版本目录、RC27 多版本更新统计、RC31 HEAD-Pinned self feed / 轻同步修复继续保持；RC30 的 `importRef` 目录继续作为 fixed ref 来源，但普通 `.txt` 不再使用 `home_rule_url`。

## 2026-08-25 · 3.5.6-rc32 / Build422 · Direct Payload Import

### 用户实机事实
- 用户 13:48 实机截图确认：当前安装 `3.5.6-rc31`，可用版本中的 RC31 显示“当前运行”；点击“检查版本”提示 `测试仓版本已刷新 · 3.5.6-rc31 / Build421`，说明 RC31 HEAD-Pinned self feed 当前工作正常。
- 同时用户明确反馈：测试仓点击导入普通小程序仍需要等待很久，有时还会直接卡住；而 Stable 3.5.5 的导入明显更快、没有同样的卡住问题。
- Stable 3.5.5 的缺点是每次打开仓库仍要经过远程 Bootstrap/模块加载，页面出现较慢，因此不能简单回退 Stable 架构。

### 根因确认
- Stable 3.5.5 `repository.js#importRule()` 对普通 `.txt` 使用 `apiText(path)` 先读取完整“海阔视界…”规则正文，然后直接把规则 payload 返回给海阔。
- RC25-RC31 为减少规则仓自身前台下载，改成 `home_rule_url`：规则仓只返回远程 Shell URL，由海阔原生远程导入器再次访问 URL。
- 用户当前实机结果证明：在其海阔环境中，`home_rule_url` 远程导入器并不一定更快或更非阻塞，反而可能长时间等待甚至卡住。
- RC30 将 `@main` 改成 fixed commit SHA 仍未解决这一类等待，进一步证明主要瓶颈不是分支解析，也不是整个 Runtime 体积，而是 `home_rule_url` 这条远程交付路径本身。

### RC32 实现
- 新增 `releases/test-3.5.6-rc32/direct_payload_import_patch.js`。
- 普通、无 codec 的 `.txt` Remote/Test/Stable 导入改为：`importRef` fixed SHA 优先 → Raw / GitHub Raw / jsDelivr 三镜像并行 `batchFetch` → 直接返回完整“海阔视界…”规则 payload。
- 并行阶段每路 `timeout=2600ms`；若 `batchFetch` 不可用或无有效结果，再按同三镜像执行 `timeout=1800ms` 的短串行兜底。
- 不恢复 Stable 的 `Raw 20s → GitHub API 20s` 长串行容错，因此异常网络下最大阻塞边界显著收窄。
- 若 fixed `importRef` 缺失，普通 `.txt` 仍使用同样三镜像短超时读取 `main` 正文，不再退回 `home_rule_url`。
- `hkzip`、本地生成、改名等特殊 codec 不改，继续走原构建链。
- 每次普通导入保存 `hc_repo_import_diag_v2`（耗时、镜像、字节数、ref、path），供后续定位“网络取规则正文”与“海阔解析导入”之间的真实耗时边界。
- 新 `shell_bridge_v10.js` 在 RC31 Bridge v9 之上叠 RC32 导入层；RC31 Local-First、HEAD-Pinned self feed、同步修复均保留。
- 新 Shell `rule_repo_test_v169.txt` 约 22 KB；外层规则 JSON、内层 pages JSON、14 段 `js:` 入口均通过静态解析/`node --check`。

### RC32 实机验收
1. 当前 RC31 进入“我的规则仓库”详情，点击“检查版本”，必须发现 `3.5.6-rc32 / Build422`。
2. 从 RC31 覆盖导入 RC32；本次升级仍由 RC31 发起，导入耗时不作为 RC32 结论。
3. 重开测试仓，必须显示 RC32 / Build422 当前运行。
4. 在 RC32 内任选同一个普通 `.txt` 程序（建议麻豆AI或黄豆短剧）连续测试 2~3 次“点击导入 → 海阔出现导入提示”的等待时间。
5. 预期：正常网络下应接近 Stable 3.5.5 的导入速度；异常网络不应再出现旧 `home_rule_url` 那种长时间无反馈卡住。
6. 同时确认 RC31 的“检查版本”“同步程序目录”、图标、版本详情、更新统计没有退化。
7. 若 RC32 仍长时间卡住，则下一步直接读取 `hc_repo_import_diag_v2`；若诊断耗时 <3s 而用户仍等待很久，瓶颈就落在海阔对大规则 payload 的解析/导入，而不是网络。

### Stable 门禁
- 用户明确要求：继续升版测试版，真正稳定解决完问题后再升级正式版。
- Stable 3.5.5 / Build389 继续承担救援基线，不晋级。

### 事故记录
- `docs/INCIDENT_RULE_REPO_HOME_RULE_URL_IMPORT_STALL_20260825.md`

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

### 事故记录
- `docs/INCIDENT_RULE_REPO_SELF_FEED_AND_PAGE_REQUIRE_20260825.md`

## 2026-08-25 · 3.5.6-rc30 / Build420 · Immutable Import Fast Path
- RC29 实机确认过一次测试仓自更新闭环；后续 RC31 又证明旧 self feed 长期可靠性不足。
- RC30 建立 `importRef` 目录和 fixed SHA `home_rule_url`；用户后续实机证明 fixed SHA 仍未消除远程导入等待，因此 RC32 保留 `importRef` 只作为规则正文固定版本来源，不再使用 `home_rule_url`。

## 历史
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
- 自更新旧事故：`docs/INCIDENT_RULE_REPO_SELF_UPDATE_LOCK_20260825.md`
- 自更新/同步新事故：`docs/INCIDENT_RULE_REPO_SELF_FEED_AND_PAGE_REQUIRE_20260825.md`
- 导入等待事故：`docs/INCIDENT_RULE_REPO_HOME_RULE_URL_IMPORT_STALL_20260825.md`
