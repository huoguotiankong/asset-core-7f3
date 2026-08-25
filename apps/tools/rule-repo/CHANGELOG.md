# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC41 只修 RC40 的首次启动运输单点，不修改 Stable 3.5.5 的任何业务 Runtime 行为。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，作为唯一稳定产品基准与 Test 救援入口。
- Test：`3.5.6-rc41 / Build431`，Shell `rule_repo_test_v178_startup_fallback.txt` / rule version `2026082601`。
- Test 运行：`Test Shell → ruleRepoCore41 → multi-mirror startup_resolver → RC40 local startup capsule → Stable3.5.5 39 modules via Build389 require cache`。
- RC41 仍不是全量 Local-First：只本地化 Bootstrap/Manager 启动入口；39个 Stable 业务模块继续使用海阔现有 require 缓存。
- RC41 暂停 Test 自更新，下一候选仍从 Stable 3.5.5 救援入口覆盖导入。

## 2026-08-26 · 3.5.6-rc41 / Build431 · Resilient Startup Capsule

### 用户实机事实
- RC40 首次启动直接报 `获取远程依赖失败`，目标为固定 commit 的 jsDelivr `startup_loader.js`。
- GitHub 回读确认该固定 commit 内文件真实存在，因此失败不是工件缺失，而是 Shell 把首次启动建立在单一 jsDelivr 依赖上。
- RC40 因此尚未进入“第2/3次启动速度”性能验收，不能据此判断 Startup Capsule 方向有效或无效。

### RC41 决策
1. 冻结 RC40 / Build430，不修改其 Shell 或不可变工件。
2. 新增 `startup_resolver.js`：按 Raw → GitHub Raw → jsDelivr 三镜像加载 RC40 已有 `startup_loader.js`。
3. 若 Resolver 三镜像均无法建立 Local Capsule，则回退已验证 Stable3.5.5 `bootstrap_v155.js`，保证测试仓至少能恢复打开，而不是直接硬失败。
4. Shell 改为单一 `ruleRepoCore41` 页面模块；首页/分类/搜索/详情等页面通过 `$.require('ruleRepoCore41')` 复用，Shell 约3.5KB，避免重复 fallback 代码增加规则解析成本。
5. Local Capsule 成功后仍使用 RC40 的本地 `remote_manager_204.js + startup_bootstrap.js`；39个 Stable 业务模块、UI、详情、版本中心、安装识别、导入全部不变。
6. RC41 第一次启动仍不作为性能结论；只验收胶囊成功建立后的第2/3次启动。

### RC41 验收
1. 从 Stable3.5.5 版本中心覆盖导入 RC41 / Build431。
2. 第一次打开不得再出现单一 jsDelivr `startup_loader.js` 远程依赖失败；Raw/GitHub Raw/CDN 任一路成功即可继续。
3. 首页完整进入后完全退出，第2次、第3次重新进入，记录白屏等待时间。
4. 若第2/3次明显变快或至少不慢于 Stable，则 Startup Capsule 方向成立；下一步只优化39模块恢复，不再动控制面功能。
5. 若第2/3次仍明显慢，则 Bootstrap/Manager 可排除，瓶颈锁定到 Stable39模块恢复本身。
6. RC41完整通过前，Stable3.5.5不晋级，其他业务小程序本地化继续暂停。

## 历史
- RC40：`apps/tools/rule-repo/CHANGELOG_RC40_20260826.md`
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
