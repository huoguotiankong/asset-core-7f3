# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC36 完整记录冻结到 `CHANGELOG_RC36_20260825.md`。RC37 保留 RC36 的快首页策略，只修多版本详情按需加载。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，作为最终救援基线。
- Test：`3.5.6-rc37 / Build427`，Shell `rule_repo_test_v174.txt` / rule version `2026082519`。
- 启动：`Test Shell → bootstrap_test_v174.js → Remote Manager 2.0.4 cache → Stable 3.5.5 modules + RC36 fast_hybrid_patch.js + RC37 detail_channel_bridge.js`。
- RC37 仍然不是 Local-First；规则仓作为控制面优先速度、可靠性和自恢复。

## 2026-08-25 · 3.5.6-rc37 / Build427 · Detail On-Demand

### 用户实机事实
- RC36 首页性能方向收缩后，用户进入 Pornhub 详情看到：当前版本 0.1.0，但“版本数量 0 个 / 可用版本 0 个”。
- 用户随后确认：除规则仓自身外，其它多版本小程序都变成同样的 0 版本详情。
- 各业务程序自身 `channels.json` 仍然存在且内容正常，因此故障集中在规则仓前端详情链。

### 根因
1. Stable 3.5.5 的 Single Workspace 在首页构造 `DATA.programs` 时会调用 `hybridProgramData()`，其中 channel-group 的 `channels` 来自当时的 `channelMeta()`。
2. RC36 为了性能正确地取消首页对所有程序 `channels.json` 的网络预取，因此首次首页的 channel-group 会得到 `channels=[]`。
3. Single Workspace 点击程序卡片时只在 WebView 内执行 `go('detail', id)`；不会重新进入海阔 Runtime，也不会重新读取当前程序 channels。
4. 结果就是首页 DATA 里的空 `channels` 被原样带入详情，所以 Pornhub/JavBus/JavDB/MyAv 等全部显示 0 个版本。

### RC37 修复
1. 保留 RC36 首页策略：首页有 manifest 缓存时不联网，不读取全目录 channels，不扫描设备规则。
2. 新增 `detail_channel_bridge.js`，给 channel-group 增加 `loadChannels` 动作。
3. 对 Single Workspace 客户端做最小字符串钩子：点击程序卡片时，如果它是 channel-group 且前端 `channels` 为空，则不直接 `go('detail')`。
4. 改为先通过 lazyRule 读取**当前这一份**程序自己的 `channels.json`，写入 per-app cache，再进入 `ruleRepoDetail?id=<appId>`。
5. 详情页重新构建 DATA 后即可显示真实 Stable/Test/Local 卡片。
6. 已有 per-app cache 时直接复用；主动“检查版本”仍按该程序自己的 `channels.json` 刷新。
7. 不使用统一 snapshot 作为版本真相，不恢复首页 N+1 网络请求。
8. Stable 3.5.5 / Build389 不改。

### RC37 实机验收
1. 升级 Test 到 RC37 / Build427。
2. 第 2/3 次打开首页，速度不得明显慢于 Stable 3.5.5。
3. 点击 Pornhub：首次允许短暂出现“正在读取当前程序版本…”，随后详情必须出现实际 Stable/Test 卡片，不能再是 0 个。
4. 返回后依次检查 JavBus、JavDB、MyAv；每次只能加载当前程序 channels，不得拖慢整个首页。
5. 再次访问已经加载过的程序详情，应优先复用本地 per-app cache。
6. “检查版本”继续以 per-app channels 为真相。
7. 首页性能、详情、导入、自更新、同步全部通过前，Stable 3.5.5 不得晋级。

## 2026-08-25 · 3.5.6-rc36 / Build426 · Stable-derived Fast Hybrid
- 用户实机确认 RC35 启动明显慢于 Stable 3.5.5，判定 Flat Local-First 架构产品失败。
- RC36 完全退出 `flat_runtime_b423/b424/b425`，重新从 Stable 3.5.5 快启动链派生。
- 首页取消自动联网、全量安装探针和全目录 channels 预取。
- 后续实机发现 Single Workspace 前端详情没有按需 channels 桥接，导致所有 channel-group 显示 0 个版本，冻结为历史。

## 历史
- RC36：`apps/tools/rule-repo/CHANGELOG_RC36_20260825.md`
- RC35：`apps/tools/rule-repo/CHANGELOG_RC35_20260825.md`
- RC34：`apps/tools/rule-repo/CHANGELOG_RC34_20260825.md`
- RC32 及之前：`apps/tools/rule-repo/CHANGELOG_RC32_20260825.md`
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`

## 冻结结论补充
- RC37 实机仍失败：按需读取 channels 后返回 `hiker://page/ruleRepoDetail?rule=<测试仓标题>`，海阔按规则名重新查找时提示找不到“我的规则仓库·测试版”；同时前台出现长时间“正在读取当前程序版本…”等待。
- RC37 因此不得晋级，也不得作为后续详情路由基线。