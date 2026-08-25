# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC40 只针对“每次打开仍有长白屏/等待”做启动链隔离实验，不修改 Stable 3.5.5 的任何业务 Runtime 行为。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，作为唯一稳定产品基准与 Test 救援入口。
- Test：`3.5.6-rc40 / Build430`，Shell `rule_repo_test_v177_startup_capsule.txt` / rule version `2026082522`。
- Test 运行：`Test Shell → fixed cached startup_loader.js → local remote_manager_204.js + local startup_bootstrap.js → Stable3.5.5 39 modules via Build389 require cache`。
- RC40 不是全量 Local-First：只本地化 Bootstrap/Manager 启动入口；39个 Stable 业务模块继续使用海阔现有 require 缓存。
- RC40 暂停 Test 自更新，下一候选仍从 Stable 3.5.5 救援入口覆盖导入。

## 2026-08-25 · 3.5.6-rc40 / Build430 · Local Startup Capsule

### 用户实机事实
- RC39 已把测试仓功能完整退回 Stable3.5.5，但用户实机仍反馈每次打开测试仓要等待很久，出现明显空白页/加载时间。
- 因 RC39 没有 RC36–RC38 Overlay，启动慢可以排除 Fast Hybrid、Detail Bridge、Presence、Flat Runtime 等实验控制面。
- Stable3.5.5 实际启动链仍是 `Shell → remote bootstrap_v155 → remote bootstrap_v154 → Remote Manager2.0.4 → 39 module require`；即使39模块可由海阔缓存，Bootstrap/Manager入口仍反复走远程 require。

### RC40 决策
1. 不修改 Stable3.5.5 的39模块、首页、详情、版本中心、安装识别、导入、搜索、分类和设置。
2. 不重新启用 Flat Runtime / Local Module Manager2.2.0，因为其完整性检查会逐文件回读+MD5，可能再次把网络等待换成本地扫描等待。
3. 只建立一个 Local Startup Capsule：首次把 `Remote Manager2.0.4` 与 `startup_bootstrap.js` 写到 `hiker://files/rules/asset-core-local/rule-repo-test-rc40/startup/`。
4. Shell 只 require 一个固定 commit 的 `startup_loader.js`，版本号 Build430，且不发送 `Cache-Control:no-cache`，让海阔缓存固定 Loader。
5. Loader 在本地文件存在时只执行 `require(file://remote_manager_204.js)` + `require(file://startup_bootstrap.js)`，不再访问 Bootstrap/Manager 网络。
6. Stable39模块固定使用 Stable3.5.5 已验证源码和 Build389 require 缓存；RC40 不引入任何 Runtime Overlay。
7. 第一次打开可能需要安装启动胶囊，不作为性能结论；只看第2/3次重新进入速度。

### RC40 验收
1. 从 Stable3.5.5 版本中心覆盖导入 RC40 / Build430。
2. 第一次打开允许安装启动胶囊并建立39模块缓存。
3. 完全退出后第2次、第3次重新进入，白屏等待必须明显缩短；至少不能比 Stable3.5.5 更慢。
4. 首页、程序详情、版本卡、导入、分类、搜索、设置表现必须与 Stable3.5.5 一致。
5. 若第2/3次仍明显慢，则启动瓶颈可进一步锁定为39个 Runtime 模块恢复本身；下一步只测试“Stable39模块本地 require”，不得同时加入其它控制面功能。
6. RC40完整通过前，Stable3.5.5不晋级，其他业务小程序本地化继续暂停。

## 历史
- RC39：`apps/tools/rule-repo/CHANGELOG_RC39_20260825.md`
- RC37：`apps/tools/rule-repo/CHANGELOG_RC37_20260825.md`
- RC36：`apps/tools/rule-repo/CHANGELOG_RC36_20260825.md`
- RC35：`apps/tools/rule-repo/CHANGELOG_RC35_20260825.md`
- RC34：`apps/tools/rule-repo/CHANGELOG_RC34_20260825.md`
- RC32 及之前：`apps/tools/rule-repo/CHANGELOG_RC32_20260825.md`
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
